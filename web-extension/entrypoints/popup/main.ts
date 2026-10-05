import './style.css';
import {
    getFontSize,
    setFontSize,
} from '@/src/settings';

import {
    getDisplayMode,
    setDisplayMode,
    type OCRDisplayMode,
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
    <p>Use Crtl + shift + O to highlight text you want to process.</p>
  </div>
`;

// font size
const slider =
    document.querySelector<HTMLInputElement>(
        '#font-size'
    )!;

slider.value =
    String(await getFontSize());

slider.addEventListener('input', async () => {
    await setFontSize(
        Number(slider.value)
    );
});

// display mode
const select =
    document.querySelector<HTMLSelectElement>(
        '#display-mode',
    )!;

select.value =
    await getDisplayMode();

select.addEventListener('change', async () => {
    await setDisplayMode(
        select.value as OCRDisplayMode,
    );
});