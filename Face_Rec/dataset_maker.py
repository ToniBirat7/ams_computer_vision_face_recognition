import os
from PIL import Image
from facenet_pytorch import MTCNN
import torch
from tqdm import tqdm
from torchvision import transforms

# Initialize MTCNN for face detection
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=False, device=device)

# Paths
input_base = 'Face_Data'
output_base = 'Face_Data_Cropped'

# Create output directories
os.makedirs(output_base, exist_ok=True)
for split in ['faces_training', 'faces_validation']:
    os.makedirs(os.path.join(output_base, split), exist_ok=True)

# Function to process one dataset (train/val)
def process_dataset(split_name):
    input_dir = os.path.join(input_base, split_name)
    output_dir = os.path.join(output_base, split_name)

    for person_name in os.listdir(input_dir):
        person_input_path = os.path.join(input_dir, person_name)
        person_output_path = os.path.join(output_dir, person_name)
        os.makedirs(person_output_path, exist_ok=True)

        for img_name in tqdm(os.listdir(person_input_path), desc=f"[{split_name}] Processing {person_name}"):
            try:
                img_path = os.path.join(person_input_path, img_name)
                img = Image.open(img_path).convert('RGB')
                face = mtcnn(img)

                if face is not None:
                    face = (face + 1) / 2  # Convert from [-1, 1] to [0, 1]
                    face_img = transforms.ToPILImage()(face.clamp(0, 1))
                    face_img.save(os.path.join(person_output_path, img_name))
                else:
                    print(f"[WARNING] No face detected in: {img_path}")
            except Exception as e:
                print(f"[ERROR] Failed to process {img_path}: {e}")

# Run both train and val splits
process_dataset('faces_training')
process_dataset('faces_validation')

print("[INFO] Face cropping and dataset rebuilding complete!")
