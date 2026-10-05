from io import BytesIO

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from pipeline import detect_regions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
async def ocr(image: UploadFile = File(...)):
    data = await image.read()
    pil_image = Image.open(BytesIO(data)).convert("RGB")
    regions = detect_regions(pil_image)

    print("Detected blocks:",len(regions))

    return {
        "regions": regions
    }
