import cv2
import numpy as np

from .basemodel import TextDetBaseDNN
from .utils.imgproc_utils import letterbox
from .utils.yolov5_utils import non_max_suppression
from .utils.line_utils import (
    extract_text_lines,
    filter_lines_by_blocks,
)

# convert BGR to RGB, resize and pad for model inference
def preprocess_img(img, input_size=(1024, 1024)):

    if isinstance(input_size, int):
        input_size = (input_size, input_size)

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_in, ratio, (dw, dh) = letterbox(img, new_shape=input_size)

    return img_in, ratio, int(dw), int(dh)

def postprocess_yolo(det, conf_thresh, nms_thresh, resize_ratio, sort_func=None):
    det = non_max_suppression(det, conf_thresh, nms_thresh)[0]

    det[..., [0, 2]] = det[..., [0, 2]] * resize_ratio[0]
    det[..., [1, 3]] = det[..., [1, 3]] * resize_ratio[1]

    blines = det[..., :4].astype(np.int32)
    confs = np.round(det[..., 4], 3)
    cls = det[..., 5].astype(np.int32)

    return blines, cls, confs

class TextDetector:
    """BBox-only Comic Text Detector using the ONNX model."""

    def __init__(
        self,
        model_path,
        input_size=1024,
        nms_thresh=0.35,
        conf_thresh=0.4,
    ):
        if isinstance(input_size, int):
            input_size = (input_size, input_size)

        self.input_size = input_size
        self.conf_thresh = conf_thresh
        self.nms_thresh = nms_thresh

        self.net = TextDetBaseDNN(
            input_size,
            model_path,
        )

    def __call__(self, image):
        model_input, ratio, dw, dh = preprocess_img(
            image,
            self.input_size,
        )

        blks, mask, lines_map = self.net(model_input)

        # Some OpenCV/CTD versions return these
        # two segmentation outputs in reverse order.
        if mask.ndim == 4 and mask.shape[1] == 2:
            mask, lines_map = lines_map, mask

        resize_ratio = (
            1.0 / ratio[0],
            1.0 / ratio[1],
        )

        blocks, classes, confidences = postprocess_yolo(
            blks,
            self.conf_thresh,
            self.nms_thresh,
            resize_ratio,
        )

        # Extract individual text-line rectangles.
        lines = extract_text_lines(
            lines_map=lines_map,
            image_shape=image.shape,
            input_size=self.input_size,
            pad_x=dw,
            pad_y=dh,
            threshold=0.3,
            min_score=0.6,
        )

        # Keep lines belonging to detected text blocks.
        lines, line_classes, line_confidences = (
            filter_lines_by_blocks(
                lines,
                blocks,
                classes,
                confidences,
                min_overlap=0.5,
            )
        )

        return lines, line_classes, line_confidences
