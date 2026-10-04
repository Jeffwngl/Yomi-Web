import type {
    OCRRegion,
    Selection,
} from '@/lib/types';

export function showDetectedRegions(
    regions: OCRRegion[],
    selection: Selection,
) {
    for (const region of regions) {
        const box = document.createElement('div');

        Object.assign(box.style, {
            position: 'fixed',

            left: `${
                selection.x +
                region.x * selection.width
            }px`,

            top: `${
                selection.y +
                region.y * selection.height
            }px`,

            width: `${
                region.width *
                selection.width
            }px`,

            height: `${
                region.height *
                selection.height
            }px`,

            border: '2px solid red',

            zIndex: '2147483647',

            pointerEvents: 'none',
        });

        document.documentElement.appendChild(box);
    }
}

export function showOCRRegions(
    regions: OCRRegion[],
    selection: Selection,
) {
    for (const region of regions) {
        const text = document.createElement('div');

        Object.assign(text.style, {
            position: 'fixed',

            left: `${
                selection.x +
                region.x * selection.width
            }px`,

            top: `${
                selection.y +
                region.y * selection.height
            }px`,

            width: `${
                region.width *
                selection.width
            }px`,

            height: `${
                region.height *
                selection.height
            }px`,

            zIndex: '2147483647',

            fontSize: '8px',

            background:
                'rgba(255, 255, 255, 0.85)',

            color: 'black',

            overflow: 'visible',

            writingMode: 'vertical-rl',

            textOrientation: 'upright',

            userSelect: 'text',
        });

        text.textContent = region.text;

        document.documentElement.appendChild(text);
    }
}