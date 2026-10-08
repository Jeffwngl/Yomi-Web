import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: 'Yomi Web',
        description: 'An OCR tool to extract text from webpages.',
        permissions: ['activeTab', 'storage'],
        commands: {
            'start-ocr': {
                suggested_key: {
                    default: 'Ctrl+Shift+O',
                    mac: 'Command+Shift+O',
                },
                description: 'Start OCR selection',
            },
            'clear-ocr': {
                suggested_key: {
                    default: 'Ctrl+Shift+X',
                    mac: 'Command+Shift+X',
                },
                description: 'Clear OCR overlays',
            },
            'reselect-region': {
                suggested_key: {
                    default: 'Ctrl+Shift+Y',
                    mac: 'Command+Shift+Y',
                },
                description: 'Reselect previously selected region',
            },
        },
    },
});
