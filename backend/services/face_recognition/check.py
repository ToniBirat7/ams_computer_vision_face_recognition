import os

# Cap BLAS / OpenMP threads and glibc malloc arenas BEFORE torch and numpy import
# their native thread pools. On a multi-core host each pool otherwise spawns one
# thread per core, each grabbing its own memory arena — pure waste on a small box.
# setdefault: a real OMP_NUM_THREADS from the container env still wins.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import pickle
import threading
from pathlib import Path

import cv2
import torch
from torchvision import transforms
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import numpy as np

torch.set_num_threads(1)


# Cosine similarity function
def cosine_similarity(embedding1, embedding2):
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))


# Models are heavy (~420 MB resident) and slow to build. Construct them lazily on
# the first recognition call instead of at import, so importing this module — which
# happens when the ASGI app boots its WebSocket routing — stays cheap. The idle
# Daphne worker therefore never pays for the face stack until a teacher actually
# starts a capture. Thread-safe double-checked init: the consumer runs recognition
# in a worker thread and two sockets can race the first frame.
_models = None
_models_lock = threading.Lock()


def _get_models():
    global _models
    if _models is None:
        with _models_lock:
            if _models is None:
                device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                mtcnn = MTCNN(keep_all=True, device=device)
                model = InceptionResnetV1(pretrained='casia-webface').eval().to(device)
                with open(Path(__file__).parent / 'embeddings.pkl', 'rb') as f:
                    known_embeddings = pickle.load(f)
                predict_transform = transforms.Compose([
                    transforms.Resize((160, 160)),
                    transforms.ToTensor(),
                ])
                _models = (device, mtcnn, model, known_embeddings, predict_transform)
    return _models


# Video capture loop
def take_face(frame):
    device, mtcnn, model, known_embeddings, predict_transform = _get_models()

    # Convert frame to PIL Image for face detection
    image_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    # Detect faces
    boxes, probs = mtcnn.detect(image_pil)

    if boxes is not None:
        for box in boxes:
            # Extract the coordinates of the bounding box
            x1, y1, x2, y2 = box
            x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])

            # Crop the face from the image
            face = image_pil.crop((x1, y1, x2, y2))

            # Convert face from PIL to tensor
            face_tensor = predict_transform(face).unsqueeze(0).to(device)

            # Get embedding
            with torch.no_grad():
                test_embedding = model(face_tensor).cpu().numpy().flatten()

            # Match with known embeddings
            best_match = None
            max_similarity = -1

            for embedding, name in known_embeddings:
                similarity = cosine_similarity(test_embedding, embedding)
                if similarity > max_similarity:
                    max_similarity = similarity
                    best_match = name

            # Set similarity threshold
            SIMILARITY_THRESHOLD = 0.8

            # Return result
            if max_similarity >= SIMILARITY_THRESHOLD:
                return f"{best_match}: {max_similarity}"
            else:
                return f"Unknown: {max_similarity}"

    return None  # Return None if no face is detected
