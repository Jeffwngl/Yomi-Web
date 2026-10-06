import sys
from pathlib import Path

# to detect bounding boxes and regions where text
# exist on the page, CTD is used.

INPUT_SIZE = 768

ROOT = Path(__file__).resolve().parent

# CTD_ROOT = (ROOT / "ctd")

# sys.path.insert(0, str(CTD_ROOT))

# TextDetector is the object in CTD
# which performs the bounding region OCR
from ctd.inference import TextDetector

# load model
MODEL_PATH = (ROOT / "models" / "comictextdetector_768.onnx")

detector = TextDetector(
    model_path=str(MODEL_PATH),
    input_size=INPUT_SIZE,
)

def detect_text(image):
    boxes, classes, confidences = detector(image)

    return boxes
