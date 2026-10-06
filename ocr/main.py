from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form
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
async def ocr(image: UploadFile = File(...), captureMode: str = Form(...)):
    data = await image.read()
    pil_image = Image.open(BytesIO(data)).convert("RGB")
    result = detect_regions(pil_image, captureMode)

    print(
        "Detected blocks:",
        len(result["regions"]),
    )

    return result
