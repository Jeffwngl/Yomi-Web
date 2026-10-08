import background from '@/entrypoints/background';
import type { OCRRegion, Selection } from '@/lib/types';
import { MAX_Z, BELOW_MAX_Z } from '@/lib/vals';
import { getFontSize, getDisplayMode } from '@/src/settings';

export function showDetectedRegions(regions: OCRRegion[], selection: Selection) {
    console.log('Showing regions.');

    for (const region of regions) {
        const box = document.createElement('div');
        box.classList.add('ocr-region');

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

        showPopupAnimated('Finished analyzing.');
    }
}

export function clearOCRRegions() {
    const overlays = document.querySelectorAll('.ocr-overlay');
    const regions = document.querySelectorAll('.ocr-region');

    for (const overlay of overlays) {
        overlay.remove();
    }

    for (const region of regions) {
        region.remove();
    }

    showPopupAnimated('Cleared page.');
}

export async function showPopup(content: string) {
    const text = document.createElement('div');

    text.classList.add('popups');

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

    text.textContent = content;
    document.documentElement.appendChild(text);
}

export function clearPopups() {
    const popups = document.querySelectorAll('.popups');

    for (const popup of popups) {
        popup.remove();
    }
}

export async function showPopupAnimated(content: string, duration = 2500) {
    const popup = document.createElement('div');
    popup.classList.add('popups');
    popup.setAttribute('role', 'status');
    popup.textContent = content;

    Object.assign(popup.style, {
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: String(MAX_Z),
        maxWidth: 'min(90vw, 420px)',
        padding: '10px 16px',
        background: '#ffffff',
        color: '#1f2328',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
        font: '500 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif',
        textAlign: 'center',
        pointerEvents: 'none', // doesn't block clicks on the page underneath
    });

    document.documentElement.appendChild(popup);

    const enter = [
        { opacity: 0, transform: 'translate(-50%, -12px)' },
        { opacity: 1, transform: 'translate(-50%, 0)' },
    ];
    const exit = [...enter].reverse();
    const timing = { duration: 200, easing: 'ease-out', fill: 'forwards' } as const;

    await popup.animate(enter, timing).finished;
    await new Promise((r) => setTimeout(r, duration));
    await popup.animate(exit, timing).finished;

    popup.remove();
}
