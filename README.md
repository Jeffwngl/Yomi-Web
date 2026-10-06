# Yomi Web
A web OCR tool to convert images to text.

This project is a tool I developed around my own workflow for learning Japanese through manga. I primarily use Yomitan to look up unfamiliar words, build vocabulary, and support reading comprehension, one thing that I have found tedious when reading japanese manga specifically is the whole workflow of image to OCR to translation, prevously I had to use an OCR tool like textsniper to extract the text then paste it into the browser to use yomitan on it which was incredibly tedious, additionally, tools like this doesn't work well with several blocks of text so I had to translate text bubbles one by one. Thus, this project aims to bridge the process of image selection to extracted text in one easy to use extension.  

I considered several existing tools, including Mokuro and YomiNinja. Both solve similar problems well, but they didn't quite fit the way I read manga (Mokuro uses local files and YomiNinja OCRs the whole screen). My workflow is focused primarily on reading directly from the web through websites like SJP, and I didn't like bothering with downloading manga. Because of this, I wanted something that could work directly into the browser and process the content I was already viewing in the browser as well as focus only on areas that I needed.

I mainly use this tool locally on my MacBook Air, so development has so far been focused around macOS and the Apple ecosystem. Some implementation decisions and platform-specific features may currently favour macOS, but the plan is to broaden the scope to windows and linux too.

- NOTE THAT THIS PROJECT IS CURRENTLY STILL IN DEVELOPMENT.

## Usage

![usage](/public/usage.mov)

Ctrl/Cmd + Shift + O       |  Select region
:-------------------------:|:-------------------------:
![select](/public/cropped1.png)  |  ![process](/public/cropped2.png)
- Then wait for the OCR to process the image.
- `Ctrl/Cmd + Shift + X` erases the processed texts.
- From here you can use Yomitan or other tools you have;

![yomi](/public/yomi.png)

## Requirements

You will need:
- Python 3.10–3.12
- Node.js
- npm
- Chrome / Chromium or Firefox
- Git

## Install

- Three different types of models can be installed depending on the input size of the CTD OCR, for day-to-day use, the 768 model is recommended and is what this application comes with my default, see benchmarking below for more details.
- To change the model input size, drag the desired model into your backend files under models and update the `detector.py` input size and model path parameters.
- Currently a install is still in the works, Check back later,

## Development
1. Clone the repository
```
git clone <repository-url>
cd <repository-name>
```
### Backend Setup
2. Navigate to backend
```
cd ocr
```
3. Create a python venv
- On macOS/Linux;
```
python3 -m venv .venv
source .venv/bin/activate
```
- On windows;
```
python -m venv .venv
.venv\Scripts\activate
```
4. Install python dependencies
```
pip install -r requirements.txt
```
- The backend primarily uses;
```
FastAPI
Uvicorn
Pillow
Manga OCR
NumPy
OpenCV
PyTorch
TorchVision
```
5. Start the backend
```
uvicorn main:app --reload
```
- Note this may take a while in the first instance as Manga OCR will need to install 400MB of data.
### Frontend Setup
6. Navigate to frontend;
```
cd web-extension
```
7. Install dependencies and run dev mode;
```
npm install
npm run dev
```
8. Add extension
- On chrome, go to extensions, load unpacked and load the chrome-mv3-dev folder.
## Alternatives
There are many alternatives that may better suit your use case, here are some that I have found.
- Yomi Ninja
- Mokuro

## Performance/Benchmarking
- My understanding of machine learning and OCR models is still relatively limited, so some of my explanations or assumptions regarding model behaviour and performance may not be entirely accurate. Corrections and suggestions are welcome.
- The pipeline requires running two fairly large ML models locally, Comic Text Detector is used for detecting the bounding boxes of the text in a page and Manga OCR is used to extract the text in the bounding boxes.
- On a M4 macbook air, the main performance bottleneck lies in the detection using Manga OCR to extract characters out of the bounding boxes, an initial benchmark using the original model, on average, extracting bounding boxes take around 1.5s sec while extracting a single sentence takes around 0.1 sec, collectively for an average of 15 boxes per image for a page of manga, this adds up to be quite significant.
- As such, text detection can be coupled with different OCR models which will be added in a future update, so far, Apple's Vision framework provides OCR detection with hardware acceleration, provides some performance improvements, a method for windows is still in the works.  

- Tweaking the input size parameter on the CTD model can be managed in `detector.py` (credit to [Comic Text Detector](https://github.com/dmMaze/comic-text-detector)). The original `onnx` file model uses a fixed input size of 1024, which produces the baseline performance shown above.
- The `pytorch` model allows tweaking input size parameters but doesn't provide more reliable performance enhancements compared to the `onnx` version due to the pytorch runtime overhead.
- To retain the performance benefits of ONNX while experimenting with different input resolutions, I also exported additional ONNX models with fixed input sizes of 768 and 640.

Machine: Apple M4 (average across 6 pages)
| Input Size | CTD time | MangaOCR time | Blocks |
| --- | --- | --- | --- |
| 1024 | 1.497s | 0.902s | 9.67 |
| 768 | 0.787s | 0.930s | 9.33 |
| 640 | 0.543s | 0.929s | 9.5 |

- I have found the 768 model currently provides the best overall balance between detection accuracy and performance. It produced results very similar to the original 1024 model while reducing CTD inference time from approximately 1.50 s to 0.79 s.
- The 640 model is faster again, reducing CTD inference time to approximately 0.54 s, and still performs well on many pages. However, its reliability is more dependent on page layout, text size, and image quality, with smaller or more difficult text regions being more likely to be missed.
- Interestingly, changing the CTD input resolution has very little effect on MangaOCR inference time. This is expected because the input size primarily affects the text-detection stage; MangaOCR still processes the resulting cropped text regions independently.
- For day-to-day use, 768 is the recommended default, while 640 is useful when prioritising speed and 1024 can be used when maximum detection reliability is preferred.

| CTD Input Size 768 | CTD Input Size 640 |
:-------------------------:|:-------------------------:
![768](/public/768.png) | ![640](/public/640.png)

## Future Updates

- I would like to add the ability to tweak the text extraction OCR in the future, so far, it just uses Manga OCRS's fixed settings, I will also add the ability to choose between using Apple's Vision OCR as well.
- I've heard that adding batch processing instead of individual passes is much better for ML models, I'll add this in a future update for text extraction.

## OCR Tools
Manga OCR - [manga ocr](https://github.com/kha-white/manga-ocr)  
Comic Text Detector - [comic text detector](https://github.com/zyddnys/manga-image-translator/releases/tag/beta-0.3)  
https://github.com/zyddnys/manga-image-translator/releases/tag/beta-0.3