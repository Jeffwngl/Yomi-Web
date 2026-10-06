import type { OCRResponse } from '@/lib/types';
import type { CaptureMode } from './settings';

export async function sendToOCR(blob: Blob, captureMode: CaptureMode): Promise<OCRResponse> {
    const formData = new FormData();

    formData.append('image', blob, 'capture.png');

    formData.append('captureMode', captureMode);

    const response = await fetch('http://127.0.0.1:8765/ocr', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`OCR request failed: ${response.status}`);
    }

    return response.json();
}
