import type { Point, Selection } from "@/lib/types";
import { sendToOCR } from "@/src/client.ts"

export default defineContentScript({
    matches: ['<all_urls>'],

    main() {
        console.log('Extension loaded.');

        browser.runtime.onMessage.addListener(async message => {
            if (message.type === 'START_SELECTION') {
                console.log('Selection requested.');
                startSelection();
                return;
            }
            else if (message.type === 'SCREENSHOT_CAPTURED') {
                const blob = await cropScreenshot(
                    message.screenshot,
                    message.selection,
                    message.viewport.width,
                    message.viewport.height,
                );

                console.log(
                    'Crop created:',
                    blob.size,
                    'bytes',
                );

                // const url = URL.createObjectURL(blob);

                // window.open(url);

                const result = await sendToOCR(blob);

                console.log('[content] OCR result:', result);
            }
        });
    },
});

function startSelection() {
    const overlay = document.createElement('div');

    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.25)',
        cursor: 'crosshair',
        zIndex: '2147483647',
    });

    const selectionBox = document.createElement('div');

    Object.assign(selectionBox.style, {
        position: 'fixed',
        border: '2px solid white',
        pointerEvents: 'none',
        display: 'none',
    });

    overlay.appendChild(selectionBox);

    document.documentElement.appendChild(overlay);

    let start: Point | null = null;

    overlay.addEventListener('mousedown', event => {
        start = {
            x: event.clientX,
            y: event.clientY,
        };

        selectionBox.style.display = 'block';
    });

    overlay.addEventListener('mousemove', event => {
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

    overlay.addEventListener('mouseup', event => {
        if (!start) {
            return;
        }

        const selection: Selection = {
            x: Math.min(start.x, event.clientX),
            y: Math.min(start.y, event.clientY),

            width: Math.abs(event.clientX - start.x),
            height: Math.abs(event.clientY - start.y),
        };

        console.log(selection);

        browser.runtime.sendMessage({
            type: 'CAPTURE_SELECTION',
            selection,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        });

        console.log('[content] sent selection to background');

        overlay.remove();
    });
}

// scale viewport to screenshot dimensions
async function cropScreenshot(
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
        throw new Error(
            'Unable to get 2D canvas context',
        );
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
        canvas.toBlob(blob => {
            if (!blob) {
                reject(
                    new Error(
                        'Failed to create crop',
                    ),
                );
                return;
            }
            resolve(blob);
        }, 'image/png');
    });
}