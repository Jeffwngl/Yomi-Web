import cv2
import numpy as np

from .basemodel import TextDetBaseDNN
from .utils.imgproc_utils import letterbox
from .utils.yolov5_utils import non_max_suppression

# convert BGR to RGB, resize and pad for model inference
def preprocess_img(img, input_size=(1024, 1024)):

    if isinstance(input_size, int):
        input_size = (input_size, input_size)

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_in, ratio, (dw, dh) = letterbox(img, new_shape=input_size)

    return img_in, ratio, int(dw), int(dh)

def postprocess_yolo(det, conf_thresh, nms_thresh, resize_ratio, sort_func=None):
    det = non_max_suppression(det, conf_thresh, nms_thresh)[0]

    # removed cpu check, code needs numpy array afterwards anyways
    det = det.detach_().cpu().numpy()

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
        model_input, ratio, _, _ = preprocess_img(
            image,
            self.input_size,
        )

        prediction = self.net(model_input)

        resize_ratio = (
            1.0 / ratio[0],
            1.0 / ratio[1],
        )

        return postprocess_yolo(
            prediction,
            self.conf_thresh,
            self.nms_thresh,
            resize_ratio,
        )
