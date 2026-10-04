from io import BytesIO

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from manga_ocr import MangaOcr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

mocr = MangaOcr()

@app.post("/ocr")
async def ocr(image: UploadFile = File(...)):
    data = await image.read()

    pil_image = Image.open(
        BytesIO(data)
    )

    text = mocr(pil_image)

    print(
        "OCR result:",
        text
    )

    return {
        "text": text
    }   
