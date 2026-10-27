import torch

from flask import Flask, render_template, request
from PIL import Image

from torchvision import transforms
from torchvision.models import efficientnet_b0


# --------------------------------------------------
# 1. Create Flask application
# --------------------------------------------------

app = Flask(__name__)


# --------------------------------------------------
# 2. Select device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)

if torch.cuda.is_available():
    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )


# --------------------------------------------------
# 3. Define classes
# --------------------------------------------------

classes = [
    "healthy_rice",
    "rice_leaffolder",
    "rice_stem_borer",
    "unknown"
]

num_classes = len(classes)


# --------------------------------------------------
# 4. Original image preprocessing
# --------------------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


# --------------------------------------------------
# 5. Create EfficientNet-B0
# --------------------------------------------------

model = efficientnet_b0(
    weights=None
)


# --------------------------------------------------
# 6. Replace classifier
# --------------------------------------------------

input_features = (
    model.classifier[1].in_features
)

model.classifier[1] = torch.nn.Linear(
    input_features,
    num_classes
)


# --------------------------------------------------
# 7. Load trained model
# --------------------------------------------------

model.load_state_dict(
    torch.load(
        "model/efficientnet_b0_rice_pest.pth",
        map_location=device
    )
)


# --------------------------------------------------
# 8. Move model to device
# --------------------------------------------------

model = model.to(device)

model.eval()

print("Model loaded successfully.")


# --------------------------------------------------
# 9. Prediction function
# --------------------------------------------------

def predict_image(image):

    # Apply the same preprocessing used by
    # the original model
    image_tensor = transform(image)

    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)

    # Move image to GPU/CPU
    image_tensor = image_tensor.to(device)

    # Make prediction
    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1
        )

    # Get predicted class
    predicted_class = classes[
        predicted_index.item()
    ]

    # Convert confidence to percentage
    confidence_percentage = (
        confidence.item()
    )

    return (
        predicted_class,
        confidence_percentage
    )


# --------------------------------------------------
# 10. Home page
# --------------------------------------------------

@app.route("/", methods=["GET", "POST"])
def index():

    prediction = None
    confidence = None
    error = None

    if request.method == "POST":

        # Check whether an image was uploaded
        if "image" not in request.files:

            error = "Please select an image."

            return render_template(
                "index.html",
                prediction=prediction,
                confidence=confidence,
                error=error
            )

        file = request.files["image"]

        # Check whether a file was selected
        if file.filename == "":

            error = "Please select an image."

            return render_template(
                "index.html",
                prediction=prediction,
                confidence=confidence,
                error=error
            )

        try:

            # Open uploaded image
            image = Image.open(
                file
            ).convert("RGB")

            # Predict
            prediction, confidence = (
                predict_image(image)
            )

        except Exception as e:

            error = (
                "Unable to process the image: "
                + str(e)
            )

    return render_template(
        "index.html",
        prediction=prediction,
        confidence=confidence,
        error=error
    )


# --------------------------------------------------
# 11. Run application
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )