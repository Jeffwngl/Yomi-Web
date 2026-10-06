const DEFAULT_FONT_SIZE = 8;
const DEFAULT_DISPLAY_MODE: OCRDisplayMode = 'boxed';
const DEFAULT_CAPTURE_MODE: CaptureMode = 'page';

export type OCRDisplayMode = 'boxed' | 'outlined';
export type CaptureMode = 'page' | 'textbox';

export async function getFontSize(): Promise<number> {
    const result = await browser.storage.local.get('ocrFontSize');

    if (typeof result.ocrFontSize === 'number') {
        return result.ocrFontSize;
    }

    return DEFAULT_FONT_SIZE;
}

export async function setFontSize(size: number): Promise<void> {
    await browser.storage.local.set({
        ocrFontSize: size,
    });
}

export async function getDisplayMode(): Promise<OCRDisplayMode> {
    const result = (await browser.storage.local.get('ocrDisplayMode')) as { ocrDisplayMode?: OCRDisplayMode };
    const mode = result.ocrDisplayMode;

    if (mode === 'boxed' || mode === 'outlined') {
        return mode;
    }

    return DEFAULT_DISPLAY_MODE;
}

export async function setDisplayMode(mode: OCRDisplayMode): Promise<void> {
    await browser.storage.local.set({
        ocrDisplayMode: mode,
    });
}

export async function getCaptureMode(): Promise<CaptureMode> {
    const result = (await browser.storage.local.get('captureMode')) as { captureMode?: CaptureMode };
    const mode = result.captureMode;

    if (mode === 'page' || mode === 'textbox') {
        return mode;
    }

    return DEFAULT_CAPTURE_MODE;
}

export async function setCaptureMode(mode: CaptureMode): Promise<void> {
    await browser.storage.local.set({
        captureMode: mode,
    });
}
