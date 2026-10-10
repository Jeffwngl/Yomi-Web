# preserved only for onnx model wrapper

import cv2

class TextDetBaseDNN:
    def __init__(self, input_size, model_path):
        if isinstance(input_size, int):
            input_size = (input_size, input_size)

        self.input_size = input_size
        self.model = cv2.dnn.readNetFromONNX(model_path)
        self.uoln = self.model.getUnconnectedOutLayersNames()
    
    def __call__(self, im_in):
        blob = cv2.dnn.blobFromImage(im_in, scalefactor=1 / 255.0, size=self.input_size)
        self.model.setInput(blob)
        blks, mask, lines_map = self.model.forward(self.uoln)
        return blks, mask, lines_map