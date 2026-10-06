import cv2

# this is just to pad extra areas, e.g. 760x760 might be padded to 1024x1024 for the model, preserves aspect ratio
def letterbox(img, new_shape=(640, 640), color=(0, 0, 0)):

    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    height, width = img.shape[:2]
    ratio = min(new_shape[0] / height, new_shape[1] / width)
    new_width = int(round(width * ratio))
    new_height = int(round(height * ratio))

    if (width, height) != (new_width, new_height):
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LINEAR)

    pad_width = new_shape[1] - new_width
    pad_height = new_shape[0] - new_height

    img = cv2.copyMakeBorder(
        img,
        0,
        pad_height,
        0,
        pad_width,
        cv2.BORDER_CONSTANT,
        value=color,
    )

    return img, (ratio, ratio), (pad_width, pad_height)