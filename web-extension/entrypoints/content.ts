import {
    startSelection,
    cropScreenshot,
} from '@/src/selection';

import {
    showDetectedRegions,
    showOCRRegions
} from '@/src/ui';

import {
    sendToOCR,
} from '@/src/client';


export default defineContentScript({
    matches: ['<all_urls>'],

    main() {
        console.log('Extension loaded.');

        browser.runtime.onMessage.addListener(
            async message => {
                if (message.type === 'START_SELECTION') {
                    console.log(
                        'Selection requested.',
                    );

                    startSelection();

                    return;
                }

                if (
                    message.type ===
                    'SCREENSHOT_CAPTURED'
                ) {
                    const blob =
                        await cropScreenshot(
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

                    const result =
                        await sendToOCR(blob);

                    console.log(
                        '[content] detected regions:',
                        result.regions,
                    );

                    showOCRRegions(
                        result.regions,
                        message.selection,
                    );
                }
            },
        );
    },
});