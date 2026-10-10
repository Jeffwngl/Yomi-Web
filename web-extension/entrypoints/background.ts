import { getOCRToken } from '@/src/settings';
import type { OCRResponse } from '@/lib/types';

export default defineBackground(() => {
    const requests = new Map<number, { requestId: string; controller: AbortController }>();
    const canceled = new Map<number, string>();
    let lastCapture = 0;
    let tabVersion = 0;

    browser.tabs.onActivated.addListener(() => {
        tabVersion++;
    });
    browser.tabs.onUpdated.addListener((tabId, change) => {
        if (change.status === 'loading') {
            tabVersion++;
            requests.get(tabId)?.controller.abort();
        }
    });
    browser.tabs.onRemoved.addListener((tabId) => {
        requests.get(tabId)?.controller.abort();
        requests.delete(tabId);
        canceled.delete(tabId);
    });

    browser.commands.onCommand.addListener(async (command) => {
        const types: Record<string, string> = {
            'start-ocr': 'START_SELECTION',
            'clear-ocr': 'CLEAR_OCR',
            'reselect-region': 'RESELECT_REGION',
        };
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (tab?.id === undefined || !types[command]) return;
            await browser.tabs.sendMessage(tab.id, { type: types[command] });
        } catch (error) {
            console.error('[background] command failed:', error);
            try {
                await browser.notifications.create({
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('/icon.png'),
                    title: 'Yomi Web',
                    message:
                        'OCR is unavailable on this page. On ordinary webpages, refresh after installing or reloading the extension.',
                });
            } catch (notificationError) {
                console.error('[background] notification failed:', notificationError);
            }
        }
    });

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!['CAPTURE_SELECTION', 'OCR_REQUEST', 'CANCEL_OCR'].includes(message?.type)) return;
        // native Chrome messaging needs an explicit open channel for async replies
        void handleMessage(message, sender.tab).then(sendResponse, (error) => {
            sendResponse({ ok: false, error: error instanceof Error ? error.message : 'OCR failed.' });
        });
        return true;
    });

    async function handleMessage(message: any, tab: { id?: number; windowId: number } | undefined) {
        try {
            if (tab?.id === undefined) {
                throw new Error('Message did not come from a tab.');
            }

            const tabId = tab.id;

            if (message.type === 'CANCEL_OCR') {
                canceled.set(tabId, message.requestId);
                const request = requests.get(tabId);

                if (request && request.requestId === message.requestId) {
                    request.controller.abort();
                }

                return { ok: true };
            }
            if (message.type === 'CAPTURE_SELECTION') {
                const version = tabVersion;
                const [active] = await browser.tabs.query({ active: true, windowId: tab.windowId });

                if (active?.id !== tabId) {
                    throw new Error('Keep the manga tab active while capturing.');
                }

                if (Date.now() - lastCapture < 600) {
                    throw new Error('Please wait before capturing again.');
                }

                lastCapture = Date.now();

                const screenshot = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
                const [current] = await browser.tabs.query({ active: true, windowId: tab.windowId });

                if (version !== tabVersion || current?.id !== tabId) {
                    throw new Error('The tab changed during capture. Try again.');
                }

                return { ok: true, screenshot };
            }

            if (!['page', 'textbox'].includes(message.captureMode) || typeof message.requestId !== 'string') {
                throw new Error('Invalid OCR request.');
            }
            if (
                typeof message.image !== 'string' ||
                !message.image.startsWith('data:image/png;base64,') ||
                message.image.length > 13 * 1024 * 1024
            ) {
                throw new Error('Invalid or oversized image.');
            }
            const token = await getOCRToken();

            if (!token) throw new Error('Enter the backend OCR token in the extension popup.');

            if (canceled.get(tabId) === message.requestId) throw new Error('OCR canceled.');

            requests.get(tabId)?.controller.abort();
            const controller = new AbortController();
            requests.set(tabId, { requestId: message.requestId, controller });

            const timer = setTimeout(() => controller.abort(), 60000);

            try {
                const blob = await (await fetch(message.image)).blob();
                const formData = new FormData();

                formData.append('image', blob, 'capture.png');
                formData.append('captureMode', message.captureMode);

                const response = await fetch('http://127.0.0.1:8000/ocr', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const body = await response.json().catch(() => null);

                    throw new Error(
                        typeof body?.detail === 'string' ? body.detail : `OCR request failed: ${response.status}`,
                    );
                }

                const result: OCRResponse = await response.json();

                if (
                    typeof result?.valid !== 'boolean' ||
                    !Array.isArray(result.regions) ||
                    result.regions.length > 2000 ||
                    !(result.reason === null || typeof result.reason === 'string') ||
                    result.regions.some(
                        (region) =>
                            typeof region.text !== 'string' ||
                            ![region.x, region.y, region.width, region.height].every(Number.isFinite) ||
                            region.x < 0 ||
                            region.y < 0 ||
                            region.width <= 0 ||
                            region.height <= 0 ||
                            region.x + region.width > 1.001 ||
                            region.y + region.height > 1.001,
                    )
                ) {
                    throw new Error('The backend returned an invalid OCR response.');
                }

                return { ok: true, result };
            } finally {
                clearTimeout(timer);

                if (requests.get(tabId)?.controller === controller) {
                    requests.delete(tabId);
                }
            }
        } catch (error) {
            let reason = error instanceof Error ? error.message : 'OCR failed.';

            if (error instanceof Error && error.name === 'AbortError') {
                reason = 'OCR was canceled or timed out. Try a smaller region.';
            }

            if (error instanceof TypeError) {
                reason = 'Unable to contact the OCR backend. Make sure it is running on port 8000.';
            }

            return { ok: false, error: reason };
        }
    }
});
