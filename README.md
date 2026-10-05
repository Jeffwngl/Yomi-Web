# Yomi Web
A web OCR tool to convert images to text.

This is a tool I developed around my method for learning Japanese, I mostly use Yomitan to extract unknown words and as a study aid for unknown words when reading manga, I usually use this locally on my macbook air and thus, development has been focused around the apple ecosystem.

- NOTE THAT THIS PROJECT IS CURRENTLY STILL IN DEVELOPMENT.

## Usage

Ctrl/Cmd + Shift + O       |  Drag and let go to select region to translate
:-------------------------:|:-------------------------:
![select](/public/cropped1.png)  |  ![process](/public/cropped2.png)

- `Ctrl/Cmd + Shift + X` erases the processed texts.
- From here you can use Yomitan or other tools you have;

![yomi](/public/yomi.png)

- Other fonts are also available;

![shadow font](/public/cropped3.png)

- These can be changed in the extension;

![extension](/public/extension.png)

## Install

- Check back later.

## Alternatives

- Yomi Ninja
- Mokuro

## Performance

- The pipeline requires running two fairly large ML models locally, Comic Text Detector is used for detecting the bounding boxes of the text in a page and Manga OCR is used to extract the text in the bounding boxes.
- On a M4 macbook air, the main performance bottleneck lies in the detection using Manga OCR to extract characters out of the bounding boxes, an initial benchmark, on average, extracting bounding boxes take around 1.5s sec while extracting a single sentence takes around 0.1 sec, collectively for an average of 15 boxes per image for a page of manga, this adds up to be quite significant.
- As such, text detection can be coupled with different OCR models, so far, Apple's Vision framework provides OCR detection with hardware acceleration, provides some performance improvements, a method for windows is still in the works.  

- Tweaking the input size parameter on the CTD model can be managed in `detector.py`. Using the `onnx` model requires a fixed input size of 1024, this yields the performance data described above.
- The `pt` model allows tweaking input size parameters but doesn't provide more reliable performance enhancements compared to the `onnx` version due to the pytorch framework overhead.
- Additional benchmark with different sized exported input models `onnx` models are also done;

| Input Size | Processing time (averaged across 10 pages) | Accuracy |
| --- | --- | --- |
| 1024 | 1.57s | .92 |
| 768 |  | |
| 640 | Row 2, Col 2 | |

- So far 

## OCR Tools
Manga OCR - [manga ocr](https://github.com/kha-white/manga-ocr)  
Comic Text Detector - [comic text detector](https://github.com/zyddnys/manga-image-translator/releases/tag/beta-0.3)  
https://github.com/zyddnys/manga-image-translator/releases/tag/beta-0.3