from PIL import Image
import time

from detector import detect_text
from image_utils import pil_to_cv
from extractor import recognize_text

from enum import Enum

class CaptureMode(str, Enum):
    PAGE = "page"
    TEXTBOX = "textbox"

# comic text detector expects cv format but manga ocr expects pil
# we convert the image to pil then to cv and we can use the original
# pil image later.
def detect_regions(image: Image.Image, captureMode: CaptureMode):

    image_width, image_height = image.size

    if (image_height < 100 or image_width < 100):
        return {
            "regions": [],
            "reason": "Selected image size too small.",
            "valid": False
        }

    if (captureMode == CaptureMode.TEXTBOX):
        text = recognize_text(image).strip()

        if (image_height > 1200 or image_width > 1200):
            return {
                "regions": [],
                "reason": "Selected image size too large.",
                "valid": False
            }
        
        if not text:
            return {
                "regions": [],
                "reason": "No text found.",
                "valid": False,
            }

        return {
            "regions": [
                {
                    "text": text,
                    "x": 0.0,
                    "y": 0.0,
                    "width": 1.0,
                    "height": 1.0,
                }
            ],
            "reason": None,
            "valid": True,
        }

    cv_image = pil_to_cv(image)

    # performance debug
    if __debug__:
        start = time.perf_counter()

    blocks = detect_text(cv_image)

    # performance debug
    if __debug__:
        print(
            "Detection:",
            time.perf_counter() - start,
            "seconds",
        )
    
    regions = []

    if (len(blocks) == 0):
        return {
            "regions": [],
            "reason": "No text blocks detected.",
            "valid": False
        }
    
    # performance debug
    ocr_total = 0.0

    for block in blocks:
        x1, y1, x2, y2 = block.xyxy
        padding = 10
        crop = image.crop(
            (
                max(0, x1 - padding),
                max(0, y1 - padding),
                min(image_width, x2 + padding),
                min(image_height, y2 + padding),
            )
        )

        # performance debug
        if __debug__:
            start = time.perf_counter()

        text = recognize_text(crop).strip()

        # performance debug
        if __debug__:
            ocr_total += time.perf_counter() - start

        if not text:
            continue

        regions.append({
            "text": text,
            "x": x1 / image_width,
            "y": y1 / image_height,
            "width": (x2 - x1) / image_width,
            "height": (y2 - y1) / image_height,
        })

    if (len(regions) == 0):
        return {
            "regions": [],
            "reason": "No text found.",
            "valid": False
        }

    # performance debug
    if __debug__:
        print("Manga OCR Total:", ocr_total, "seconds")
        print("Manga OCR Individual:", ocr_total / len(regions), "seconds")

    return {
        "regions": regions,
        "reason": None,
        "valid": True
    }