import torch
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b0
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix

# --------------------------------------------------
# 1. Select device
# --------------------------------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Using device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

# --------------------------------------------------
# 2. Define classes
# --------------------------------------------------

classes = [
    "healthy_rice",
    "rice_leaffolder",
    "rice_stem_borer",
    "unknown"
]

num_classes = len(classes)

# --------------------------------------------------
# 3. Image preprocessing
# --------------------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# --------------------------------------------------
# 4. Load test dataset
# --------------------------------------------------

test_dataset = datasets.ImageFolder(
    "dataset/testing",
    transform=transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=16,
    shuffle=False
)

# --------------------------------------------------
# 5. Create EfficientNet-B0
# --------------------------------------------------

model = efficientnet_b0(weights=None)

input_features = model.classifier[1].in_features

model.classifier[1] = torch.nn.Linear(
    input_features,
    num_classes
)

# --------------------------------------------------
# 6. Load saved model
# --------------------------------------------------

model.load_state_dict(
    torch.load(
        "model/efficientnet_b0_rice_pest.pth",
        map_location=device
    )
)

model = model.to(device)

model.eval()

print("\nSaved model loaded successfully.")

# --------------------------------------------------
# 7. Test model
# --------------------------------------------------

all_predictions = []
all_labels = []

correct = 0
total = 0

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

        all_predictions.extend(predicted.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

# --------------------------------------------------
# 8. Test accuracy
# --------------------------------------------------

test_accuracy = 100 * correct / total

print(f"\nTest Accuracy: {test_accuracy:.2f}%")

# --------------------------------------------------
# 9. Classification report
# --------------------------------------------------

print("\nClassification Report:")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=classes,
        zero_division=0
    )
)

# --------------------------------------------------
# 10. Confusion matrix
# --------------------------------------------------

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        all_labels,
        all_predictions
    )
)