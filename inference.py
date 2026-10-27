"""Model-specific adapter. Keep training labels and preprocessing in this module."""
import logging
from threading import Lock


class RiceClassifier:
    # ImageFolder sorts the existing directories: healthy, leaffolder, stemborer, unknown.
    # These public IDs preserve the original application's exact output order.
    classes = ("healthy_rice", "rice_leaffolder", "rice_stem_borer", "unknown")

    def __init__(self, model_path):
        self.available = False
        self._lock = Lock()
        try:
            import torch
            from torchvision import transforms
            from torchvision.models import efficientnet_b0

            self.torch = torch
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
            ])
            self.model = efficientnet_b0(weights=None)
            self.model.classifier[1] = torch.nn.Linear(
                self.model.classifier[1].in_features, len(self.classes)
            )
            self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=True))
            self.model.to(self.device).eval()
            self.available = True
        except Exception:
            logging.getLogger(__name__).exception("Trained model unavailable; educational interface remains usable")

    def predict(self, image):
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        with self._lock, self.torch.inference_mode():
            values = self.torch.softmax(self.model(tensor), dim=1)[0].cpu().tolist()
        best = max(range(len(values)), key=values.__getitem__)
        return {
            "prediction": self.classes[best],
            "confidence": values[best],
            "probabilities": dict(zip(self.classes, values)),
            "model": "EfficientNet-B0",
            "unknown_method": "trained_class",
        }
