export default defineBackground(() => {
    console.log('[background] loaded');

    browser.commands.onCommand.addListener(async (command) => {
        console.log('[background] command:', command);

        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab?.id) {
            console.log('[background] no active tab');
            return;
        }

        if (command === 'start-ocr') {
            await browser.tabs.sendMessage(tab.id, {
                type: 'START_SELECTION',
            });

            return;
        }

        if (command === 'clear-ocr') {
            console.log('[background] sending CLEAR_OCR');
            await browser.tabs.sendMessage(tab.id, {
                type: 'CLEAR_OCR',
            });

            return;
        }
    });

    browser.runtime.onMessage.addListener(async (message, sender) => {
        if (message.type !== 'CAPTURE_SELECTION') {
            return;
        }

        try {
            if (!sender.tab?.id) {
                throw new Error('Message did not come from a tab');
            }

            const screenshot = await browser.tabs.captureVisibleTab(sender.tab.windowId, {
                format: 'png',
            });

            await browser.tabs.sendMessage(sender.tab.id, {
                type: 'SCREENSHOT_CAPTURED',
                screenshot,
                selection: message.selection,
                viewport: message.viewport,
            });
        } catch (error) {
            console.error('[background] screenshot failed:', error);
        }
    });
});
