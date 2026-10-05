import sys
from pathlib import Path

# to detect bounding boxes and regions where text
# exist on the page, Comic Text Detector is used.

ROOT = Path(__file__).resolve().parent

CTD_ROOT = (
    ROOT
    / "vendor"
    / "comic-text-detector"
)

sys.path.insert(
    0,
    str(CTD_ROOT)
)

# TextDetector is the class in Comic Text Detector
# which performs the bounding region OCR
from inference import TextDetector

# load model
MODEL_PATH = (
    ROOT
    / "models"
    / "comictextdetector.pt.onnx"
)

# TODO: add parameters to tweak input size and device
detector = TextDetector(
    model_path=str(MODEL_PATH),
    input_size=1024,
    device="cpu",
)

def detect_text(image):
    mask, refined_mask, blocks = detector(image)

    return blocks
