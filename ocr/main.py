from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

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

    print(
        "received:",
        image.filename,
        len(data),
        "bytes"
    )

    return {
        "text": "テストです"
    }
