import numpy as np
import cv2

def pil_to_cv(image):
    arr = np.array(image.convert("RGB"))

    return cv2.cvtColor(
        arr,
        cv2.COLOR_RGB2BGR,
    )
