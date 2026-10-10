# Clarification

- Note that I am only using a small subset of the original Comic Text Detector repository, so the code included here is a stripped-down version tailored specifically for bounding-box detection.
- The original project contains additional functionality for training, segmentation, text-line detection, mask generation, inpainting, and other utilities that are not required for this application.
- Only the components needed for ONNX inference, image preprocessing, YOLO post-processing, and non-maximum suppression have been retained.
- As a result, this version does not provide the full functionality of the original Comic Text Detector repository and should not be treated as a drop-in replacement for it.
- The detector is used only to locate text regions in manga images. OCR itself is handled separately by the OCR backend.
- Some upstream dependencies have also been removed where they were only required by functionality that is no longer used.
- yolov5_utils is rewritten using numpy to not have to install torch.