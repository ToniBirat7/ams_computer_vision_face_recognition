import cv2
import torch
from torchvision import transforms
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import numpy as np
import pickle

# Cosine similarity function
def cosine_similarity(embedding1, embedding2):
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

# Load models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(keep_all=True, device=device)
model = InceptionResnetV1(pretrained='casia-webface').eval().to(device)

# Load known embeddings
with open('Face_Rec/known_face_embeddings.pkl', 'rb') as f:
    known_embeddings = pickle.load(f)

# Define prediction transform (no augmentation!)
predict_transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor()
])

# Video capture loop
def take_face(frame):
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
