import type { OCRResponse } from '@/lib/types';
import type { CaptureMode } from './settings';

export async function sendToOCR(blob: Blob, captureMode: CaptureMode, requestId: string): Promise<OCRResponse> {
    if (blob.size > 9 * 1024 * 1024) {
        throw new Error('Selected image is too large. Select a smaller region.');
    }
    const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Unable to read selected image.'));
        reader.readAsDataURL(blob);
    });
    const response = await browser.runtime.sendMessage({ type: 'OCR_REQUEST', image, captureMode, requestId });
    if (!response?.ok) {
        throw new Error(response?.error || 'Unable to contact the OCR backend.');
    }
    return response.result;
}

export function cancelOCR(requestId: string) {
    void browser.runtime.sendMessage({ type: 'CANCEL_OCR', requestId }).catch(console.error);
}
