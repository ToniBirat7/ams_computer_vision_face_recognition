import torch
from torchvision import datasets, transforms
import numpy as np
from facenet_pytorch import InceptionResnetV1
import pickle
from tqdm import tqdm

# Function to calculate cosine similarity (used later during inference/validation)
def cosine_similarity(embedding1, embedding2):
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

if __name__ == "__main__":
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Using device: {device}")

    # Image transformations (with augmentations for training data)
    transform_train = transforms.Compose([
        transforms.Resize((160, 160)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor()
    ])

    transform_val = transforms.Compose([
        transforms.Resize((160, 160)),
        transforms.ToTensor()
    ])

    # Load datasets
    train_dataset = datasets.ImageFolder(root='Face_Data_Cropped/faces_training', transform=transform_train)
    val_dataset = datasets.ImageFolder(root='Face_Data_Cropped/faces_validation', transform=transform_val)

    # Initialize FaceNet model
    resnet = InceptionResnetV1(pretrained='casia-webface').eval().to(device)

    known_face_embeddings = []

    print("[INFO] Generating embeddings for training data...")

    for idx, (face_img, label) in enumerate(tqdm(train_dataset, desc="Processing")):
        try:
            # Move image to device and reshape for batch processing
            face_img = face_img.unsqueeze(0).to(device)

            # Get embedding
            with torch.no_grad():
                embedding = resnet(face_img).cpu().numpy().flatten()

            # Map label index to class name
            name = train_dataset.classes[label]
            known_face_embeddings.append((embedding, name))

        except Exception as e:
            print(f"[ERROR] Failed on image index {idx} | {e}")

    # Save embeddings
    with open('known_face_embeddings.pkl', 'wb') as f:
        pickle.dump(known_face_embeddings, f)

    print(f"[SUCCESS] Saved {len(known_face_embeddings)} face embeddings to 'known_face_embeddings.pkl'")
