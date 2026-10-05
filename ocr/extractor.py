from manga_ocr import MangaOcr

# load the model once when the backend starts.
mocr = MangaOcr()

def recognize_text(image):
    return mocr(image)
