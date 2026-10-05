from PIL import Image

from detector import detect_text
from image_utils import pil_to_cv
from extractor import recognize_text

# comic text detector expects cv format but manga ocr expects pil
# we convert the image to pil then to cv and we can use the original
# pil image later.
def detect_regions(image: Image.Image):
    cv_image = pil_to_cv(image)

    blocks = detect_text(cv_image)
    
    image_width, image_height = image.size
    
    regions = []

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

        text = recognize_text(crop).strip()
        if not text:
            continue

        regions.append({
            "text": text,
            "x": x1 / image_width,
            "y": y1 / image_height,
            "width": (x2 - x1) / image_width,
            "height": (y2 - y1) / image_height,
        })

    return regions
