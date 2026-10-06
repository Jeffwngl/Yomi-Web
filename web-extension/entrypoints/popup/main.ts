import './style.css';
import { getFontSize, setFontSize } from '@/src/settings';

import {
    getDisplayMode,
    setDisplayMode,
    getCaptureMode,
    setCaptureMode,
    type OCRDisplayMode,
    type CaptureMode,
} from '@/src/settings';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <label>
        OCR text size
        <input
            id="font-size"
            type="range"
            min="8"
            max="32"
            value="14"
        >
    </label>
    <label for="display-mode">
        Text style
    </label>

    <select id="display-mode">
        <option value="boxed">
            Black text / white background
        </option>

        <option value="outlined">
            White text / black outline
        </option>
    </select>

    <label for="capture-mode">
        Capture mode
    </label>
    <select id="capture-mode">
        <option value="page">
            Whole page
        </option>

        <option value="textbox">
            Single text box
        </option>
    </select>
    <p>Use Cmd/Crtl + shift + O to highlight text you want to process.</p>
    <p>Use Cmd/Crtl + shift + X to delete all text.</p>
  </div>
`;

// font size
const slider = document.querySelector<HTMLInputElement>('#font-size')!;

slider.value = String(await getFontSize());

slider.addEventListener('input', async () => {
    await setFontSize(Number(slider.value));
});

// display mode
const displaySelect = document.querySelector<HTMLSelectElement>('#display-mode')!;

displaySelect.value = await getDisplayMode();

displaySelect.addEventListener('change', async () => {
    await setDisplayMode(displaySelect.value as OCRDisplayMode);
});

// capture mode
const captureSelect = document.querySelector<HTMLSelectElement>('#capture-mode')!;

captureSelect.value = await getCaptureMode();

captureSelect.addEventListener('change', async () => {
    await setCaptureMode(captureSelect.value as CaptureMode);
});
