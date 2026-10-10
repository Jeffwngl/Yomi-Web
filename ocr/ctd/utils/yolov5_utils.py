import numpy as np

def xywh2xyxy(x):
    """
    convert bounding boxes from:
    [center_x, center_y, width, height]
    to:
    [x1, y1, x2, y2]
    """
    y = x.copy()

    y[:, 0] = x[:, 0] - x[:, 2] / 2
    y[:, 1] = x[:, 1] - x[:, 3] / 2
    y[:, 2] = x[:, 0] + x[:, 2] / 2
    y[:, 3] = x[:, 1] + x[:, 3] / 2

    return y


def nms(boxes, scores, iou_thres, max_det=300):
    """
    non-Maximum Suppression using NumPy.

    boxes: (N, 4) array in xyxy format
    scores: (N,) confidence scores

    returns indices of boxes to keep.
    """
    order = np.argsort(-scores, kind="stable")
    keep = []

    while order.size > 0 and len(keep) < max_det:
        i = order[0]
        keep.append(i)

        if order.size == 1:
            break

        remaining = order[1:]

        x1 = np.maximum(boxes[i, 0], boxes[remaining, 0])
        y1 = np.maximum(boxes[i, 1], boxes[remaining, 1])
        x2 = np.minimum(boxes[i, 2], boxes[remaining, 2])
        y2 = np.minimum(boxes[i, 3], boxes[remaining, 3])

        w = np.maximum(0, x2 - x1)
        h = np.maximum(0, y2 - y1)

        intersection = w * h

        area_i = (
            (boxes[i, 2] - boxes[i, 0])
            * (boxes[i, 3] - boxes[i, 1])
        )

        areas_remaining = (
            (boxes[remaining, 2] - boxes[remaining, 0])
            * (boxes[remaining, 3] - boxes[remaining, 1])
        )

        union = area_i + areas_remaining - intersection

        iou = intersection / np.maximum(union, 1e-7)

        order = remaining[iou <= iou_thres]

    return np.asarray(keep, dtype=np.int64)


def non_max_suppression(
    prediction,
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=300
):
    """
    YOLO Non-Maximum Suppression.

    prediction: (batch, N, 5 + num_classes)

    returns: List of NumPy arrays of shape (N, 6): 
    [x1, y1, x2, y2, confidence, class]
    """
    assert 0 <= conf_thres <= 1
    assert 0 <= iou_thres <= 1

    max_wh = 4096
    max_nms = 30000

    output = []

    for x in prediction:
        # filter by objectness confidence.
        x = x[x[:, 4] > conf_thres].copy()

        if x.shape[0] == 0:
            output.append(np.empty((0, 6), dtype=np.float32))
            continue

        # final confidence = objectness * class confidence.
        class_scores = x[:, 5:] * x[:, 4:5]

        conf = np.max(class_scores, axis=1)
        class_idx = np.argmax(class_scores, axis=1)

        boxes = xywh2xyxy(x[:, :4])

        det = np.concatenate(
            (
                boxes,
                conf[:, None],
                class_idx[:, None],
            ),
            axis=1,
        )

        # filter by final confidence.
        det = det[det[:, 4] > conf_thres]

        if det.shape[0] == 0:
            output.append(np.empty((0, 6), dtype=np.float32))
            continue

        # limit candidates before NMS.
        if det.shape[0] > max_nms:
            indices = np.argsort(-det[:, 4])[:max_nms]
            det = det[indices]

        # offset boxes by class to perform class-aware NMS.
        offsets = det[:, 5:6] * max_wh
        nms_boxes = det[:, :4] + offsets

        keep = nms(
            nms_boxes,
            det[:, 4],
            iou_thres,
            max_det,
        )

        output.append(det[keep].astype(np.float32))

    return output
