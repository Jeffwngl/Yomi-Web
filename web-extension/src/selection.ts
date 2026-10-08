import type { Point, Selection } from '@/lib/types';
import { BELOW_MAX_Z } from '@/lib/vals';
import { showPopup, clearPopups, showPopupAnimated } from './ui';

let cachedSelection: Selection | null = null;

export function startSelection() {
    const overlay = document.createElement('div');
    // showPopup('Press Esc to exit out of selection');
    showPopupAnimated('Press Esc to exit out of selection');

    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.25)',
        cursor: 'crosshair',
        zIndex: BELOW_MAX_Z,
    });

    const selectionBox = document.createElement('div');

    Object.assign(selectionBox.style, {
        position: 'fixed',
        border: '1px solid white',
        pointerEvents: 'none',
        display: 'none',
    });

    overlay.appendChild(selectionBox);
    document.documentElement.appendChild(overlay);

    let start: Point | null = null;

    // handle stop selection
    const stopSelection = () => {
        //clearPopups();
        start = null;
        overlay.remove();
        document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            stopSelection();
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    overlay.addEventListener('mousedown', (event) => {
        start = {
            x: event.clientX,
            y: event.clientY,
        };

        selectionBox.style.display = 'block';
    });

    overlay.addEventListener('mousemove', (event) => {
        if (!start) {
            return;
        }

        const x = Math.min(start.x, event.clientX);
        const y = Math.min(start.y, event.clientY);

        const width = Math.abs(event.clientX - start.x);
        const height = Math.abs(event.clientY - start.y);

        Object.assign(selectionBox.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
        });
    });

    overlay.addEventListener('mouseup', (event) => {
        //clearPopups();
        if (!start) {
            return;
        }

        const selection: Selection = {
            x: Math.min(start.x, event.clientX),
            y: Math.min(start.y, event.clientY),
            width: Math.abs(event.clientX - start.x),
            height: Math.abs(event.clientY - start.y),
        };

        cachedSelection = selection;

        captureSelection(selection);

        overlay.remove();
    });
}

export function reselectSelection() {
    if (cachedSelection === null) {
        console.log('No previously selected region.');
        return;
    }

    // TODO: error handle this

    captureSelection(cachedSelection);
}

function captureSelection(selection: Selection) {
    showPopupAnimated('Analyzing page...');
    browser.runtime.sendMessage({
        type: 'CAPTURE_SELECTION',
        selection,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    });
}

export async function cropScreenshot(
    screenshot: string,
    selection: Selection,
    viewportWidth: number,
    viewportHeight: number,
): Promise<Blob> {
    const image = new Image();

    image.src = screenshot;

    await image.decode();

    const scaleX = image.naturalWidth / viewportWidth;
    const scaleY = image.naturalHeight / viewportHeight;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(selection.width * scaleX);
    canvas.height = Math.round(selection.height * scaleY);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Unable to get 2D canvas context');
    }

    ctx.drawImage(
        image,

        selection.x * scaleX,
        selection.y * scaleY,
        selection.width * scaleX,
        selection.height * scaleY,

        0,
        0,
        canvas.width,
        canvas.height,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to create crop'));

                return;
            }

            resolve(blob);
        }, 'image/png');
    });
}
