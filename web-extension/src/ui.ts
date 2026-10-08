import background from '@/entrypoints/background';
import type { OCRRegion, Selection } from '@/lib/types';
import { MAX_Z, BELOW_MAX_Z } from '@/lib/vals';
import { getFontSize, getDisplayMode } from '@/src/settings';

export function showDetectedRegions(regions: OCRRegion[], selection: Selection) {
    console.log('Showing regions.');

    for (const region of regions) {
        const box = document.createElement('div');

        Object.assign(box.style, {
            position: 'fixed',

            left: `${selection.x + region.x * selection.width}px`,

            top: `${selection.y + region.y * selection.height}px`,

            width: `${region.width * selection.width}px`,

            height: `${region.height * selection.height}px`,

            border: '2px solid red',
            zIndex: MAX_Z,
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

            // yomichan is z index 2147483647
            zIndex: BELOW_MAX_Z,
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

export async function showEscapeSelectionHelp() {
    const text = document.createElement('div');

    text.classList.add('selection-help-overlay');

    Object.assign(text.style, {
        position: 'fixed',
        background: 'white',
        padding: '5px',
        borderRadius: '3px',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: MAX_Z,
    });

    text.textContent = 'Press Esc to exit out of selection';
    document.documentElement.appendChild(text);
}

export function clearShowEscapeSelectionHelp() {
    const overlays = document.querySelectorAll('.selection-help-overlay');

    for (const overlay of overlays) {
        overlay.remove();
    }
}
