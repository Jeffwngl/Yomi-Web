import type { OCRRegion, Selection } from '@/lib/types';

import { getFontSize, getDisplayMode } from '@/src/settings';

export function showDetectedRegions(regions: OCRRegion[], selection: Selection) {
    for (const region of regions) {
        const box = document.createElement('div');

        Object.assign(box.style, {
            position: 'fixed',

            left: `${selection.x + region.x * selection.width}px`,

            top: `${selection.y + region.y * selection.height}px`,

            width: `${region.width * selection.width}px`,

            height: `${region.height * selection.height}px`,

            border: '2px solid red',
            zIndex: '2147483647',
            pointerEvents: 'none',
        });

        document.documentElement.appendChild(box);
    }
}

export async function showOCRRegions(regions: OCRRegion[], selection: Selection) {
    const fontSize = await getFontSize();
    const displayMode = await getDisplayMode();

    for (const region of regions) {
        const text = document.createElement('div');
        text.classList.add('ocr-overlay');

        Object.assign(text.style, {
            position: 'fixed',

            left: `${selection.x + region.x * selection.width}px`,

            top: `${selection.y + region.y * selection.height}px`,

            // width: `${region.width * selection.width}px`,

            height: `${region.height * selection.height}px`,

            zIndex: '2147483647',
            fontSize: `${fontSize}px`,
            overflow: 'visible',
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            userSelect: 'text',
        });

        if (displayMode === 'boxed') {
            Object.assign(text.style, {
                color: 'black',
                background: 'white',
                display: 'inline-block',
                width: 'max-content',
                padding: '1px 2px',
                textShadow: 'none',
            });
        }

        if (displayMode === 'outlined') {
            Object.assign(text.style, {
                color: 'white',
                background: 'transparent',
                textShadow: `
                    -1px -1px 0 black,
                     1px -1px 0 black,
                    -1px  1px 0 black,
                     1px  1px 0 black
                `,
            });
        }

        text.textContent = region.text;

        document.documentElement.appendChild(text);
    }
}

export function clearOCRRegions() {
    const overlays = document.querySelectorAll('.ocr-overlay');

    for (const overlay of overlays) {
        overlay.remove();
    }
}
