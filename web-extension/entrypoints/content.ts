import { startSelection, cropScreenshot, reselectSelection } from '@/src/selection';
import { showDetectedRegions, showOCRRegions, clearOCRRegions } from '@/src/ui';
import { sendToOCR } from '@/src/client';
import { getCaptureMode } from '@/src/settings';

export default defineContentScript({
    matches: ['<all_urls>'],

    main() {
        console.log('Extension loaded.');

        browser.runtime.onMessage.addListener(async (message) => {
            if (message.type === 'START_SELECTION') {
                clearOCRRegions();
                console.log('[content] Selection requested.');
                startSelection();

                return;
            }

            if (message.type === 'RESELECT_REGION') {
                clearOCRRegions();
                console.log('[content] Reselection requested.');
                reselectSelection();

                return;
            }

            if (message.type === 'CLEAR_OCR') {
                console.log('[content] clearing OCR');
                clearOCRRegions();

                return;
            }

            if (message.type === 'SCREENSHOT_CAPTURED') {
                const blob = await cropScreenshot(
                    message.screenshot,
                    message.selection,
                    message.viewport.width,
                    message.viewport.height,
                );

                const captureMode = await getCaptureMode();

                // console.log('Crop created:', blob.size, 'bytes');

                const result = await sendToOCR(blob, captureMode);

                if (!result.valid) {
                    alert(result.reason);
                    return;
                }

                console.log('[content] detected regions:', result.regions);

                // showDetectedRegions(result.regions, message.selection);

                await showOCRRegions(result.regions, message.selection);
            }
        });
    },
});
