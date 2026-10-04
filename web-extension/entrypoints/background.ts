export default defineBackground(() => {
    console.log("[background] loaded");

    browser.commands.onCommand.addListener(async (command) => {
        console.log("[background] command:", command);

        if (command !== "start-ocr") {
            return;
        }

        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab?.id) {
            console.log("[background] no active tab");
            return;
        }

        console.log("[background] sending START_SELECTION");

        await browser.tabs.sendMessage(tab.id, {
            type: "START_SELECTION",
        });
    });

    browser.runtime.onMessage.addListener(
    async (message, sender) => {
        if (message.type !== 'CAPTURE_SELECTION') {
            return;
        }

        try {
            if (!sender.tab?.id) {
                throw new Error('Message did not come from a tab');
            }

            const screenshot =
                await browser.tabs.captureVisibleTab(
                    sender.tab.windowId,
                    {
                        format: 'png',
                    },
                );

            await browser.tabs.sendMessage(
                sender.tab.id,
                {
                    type: 'SCREENSHOT_CAPTURED',
                    screenshot,
                    selection: message.selection,
                    viewport: message.viewport,
                },
            );
            } catch (error) {
                console.error(
                    '[background] screenshot failed:',
                    error,
                );
            }
        },
    );
});
