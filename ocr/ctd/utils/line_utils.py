
import cv2
import numpy as np

def extract_text_lines(
    lines_map,
    image_shape,
    input_size,
    pad_x=0,
    pad_y=0,
    threshold=0.3,
    min_score=0.6,
    min_area=12,
):
    """
    convert CTD's text-line probability map
    into rectangles in original-image coordinates.

    Returns an (N, 4) int32 array:
    [x1, y1, x2, y2]
    """

    image_h, image_w = image_shape[:2]
    input_h, input_w = input_size

    prob = np.asarray(lines_map)

    # expected DBNet output: (1, 2, H, W)
    if prob.ndim != 4 or prob.shape[0] != 1:
        raise ValueError(f"Unexpected lines_map shape: {prob.shape}")

    prob = prob[0, 0].astype(np.float32)

    map_h, map_w = prob.shape

    binary = (prob > threshold).astype(np.uint8) * 255

    contours, _ = cv2.findContours(binary, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []

    # map coordinates -> model input coordinates.
    scale_x = input_w / map_w
    scale_y = input_h / map_h

    # model input -> original image coordinates.
    content_w = input_w - pad_x
    content_h = input_h - pad_y

    resize_x = image_w / content_w
    resize_y = image_h / content_h

    for contour in contours:
        if cv2.contourArea(contour) < min_area:
            continue

        # Use contour pixels to estimate confidence.
        contour_mask = np.zeros((map_h, map_w),dtype=np.uint8)

        cv2.drawContours(
            contour_mask,
            [contour],
            -1,
            255,
            thickness=-1,
        )

        score = cv2.mean(prob, mask=contour_mask)[0]

        if score < min_score:
            continue

        x, y, w, h = cv2.boundingRect(contour)

        # convert to model input coordinates.
        x1 = x * scale_x
        y1 = y * scale_y
        x2 = (x + w) * scale_x
        y2 = (y + h) * scale_y

        # remove right/bottom padding and scale.
        x1 = np.clip(x1, 0, content_w) * resize_x
        y1 = np.clip(y1, 0, content_h) * resize_y
        x2 = np.clip(x2, 0, content_w) * resize_x
        y2 = np.clip(y2, 0, content_h) * resize_y

        box = [
            max(0, int(np.floor(x1))),
            max(0, int(np.floor(y1))),
            min(image_w, int(np.ceil(x2))),
            min(image_h, int(np.ceil(y2))),
        ]

        if box[2] <= box[0] or box[3] <= box[1]:
            continue

        boxes.append(box)

    if not boxes:
        return np.empty((0, 4), dtype=np.int32)

    return np.asarray(boxes, dtype=np.int32)


def filter_lines_by_blocks(
    lines,
    blocks,
    classes,
    confidences,
    min_overlap=0.5,
):
    """
    keep lines substantially overlapping a YOLO text block.

    returns:
    lines, classes, confidences
    """
    filtered_lines = []
    filtered_classes = []
    filtered_confidences = []

    for line in lines:
        lx1, ly1, lx2, ly2 = line

        line_area = max(1, (lx2 - lx1) * (ly2 - ly1))

        best_overlap = 0.0
        best_index = -1

        for i, block in enumerate(blocks):
            bx1, by1, bx2, by2 = block

            x1 = max(lx1, bx1)
            y1 = max(ly1, by1)
            x2 = min(lx2, bx2)
            y2 = min(ly2, by2)

            intersection = (
                max(0, x2 - x1) * max(0, y2 - y1)
            )

            overlap = intersection / line_area

            if overlap > best_overlap:
                best_overlap = overlap
                best_index = i

        if best_overlap < min_overlap:
            continue

        filtered_lines.append(line)
        filtered_classes.append(classes[best_index])
        filtered_confidences.append(confidences[best_index])

    return (
        np.asarray(filtered_lines, dtype=np.int32).reshape(-1, 4),
        np.asarray(filtered_classes, dtype=np.int32),
        np.asarray(filtered_confidences, dtype=np.float32),
    )
