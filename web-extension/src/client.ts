export async function sendToOCR(blob: Blob) {
    const formData = new FormData();

    formData.append(
        'image',
        blob,
        'capture.png',
    );

    const response = await fetch(
        'http://127.0.0.1:8765/ocr',
            {
            method: 'POST',
            body: formData,
        },
    );

    if (!response.ok) {
        throw new Error(
            `OCR request failed: ${response.status}`,
        );
    }

    return response.json();
}
