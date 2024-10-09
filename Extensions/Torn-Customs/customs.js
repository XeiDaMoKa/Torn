

// customs.js

// Function to insert or update custom styles
function insertStyles(cssText) {
    let style = document.getElementById('custom-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'custom-styles';
        document.head.appendChild(style);
    }
    style.textContent = cssText;
}

// Function to remove custom styles
function removeStyles() {
    const style = document.getElementById('custom-styles');
    if (style) {
        style.remove();
    }
}

// Function to apply custom settings
function applySettings(customData, selectorOrder) {
    const cssText = selectorOrder.map(selector => {
        const rules = Object.entries(customData[selector] || {})
            .map(([prop, val]) => `${prop}: ${val} !important;`).join(' ');
        return `${selector} { ${rules} }`;
    }).join('\n');
    insertStyles(cssText);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message) => {
    if (message.removeStyles) {
        removeStyles();
    } else if (message.customData && message.selectorOrder) {
        applySettings(message.customData, message.selectorOrder);
    }
});

// Immediately apply settings on script load
chrome.storage.local.get(['customSettings', 'selectorOrder'], ({ customSettings = {}, selectorOrder = [] }) => {
    applySettings(customSettings, selectorOrder);
});
