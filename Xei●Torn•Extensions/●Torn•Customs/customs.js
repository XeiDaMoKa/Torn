

// customs.js

// Event listener for messages received from popup.js.
chrome.runtime.onMessage.addListener(function(data) {
    for (let selector in data) {
        for (let prop in data[selector]) {
            document.querySelector(selector).style[prop] = data[selector][prop];
        }
    }
    // No need to save here, as popup.js handles merging and saving
});

// Apply stored customizations on page load
chrome.storage.local.get('customSettings', function(data) {
    if (data.customSettings) {
        for (let selector in data.customSettings) {
            for (let prop in data.customSettings[selector]) {
                document.querySelector(selector).style[prop] = data.customSettings[selector][prop];
            }
        }
    }
});
