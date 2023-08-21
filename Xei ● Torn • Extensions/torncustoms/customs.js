

// customs.js //


// Event listener for messages received from popup.js.
chrome.runtime.onMessage.addListener(function(data) {
    for (let selector in data) {
        for (let prop in data[selector]) {
            document.querySelector(selector).style[prop] = data[selector][prop];
        }
    }

    // Save the received data to local storage for persistence
    chrome.storage.local.set({ customSettings: data });
});

// Apply stored customizations on page load
chrome.storage.local.get('customSettings', function(data) {
    for (let selector in data.customSettings) {
        for (let prop in data.customSettings[selector]) {
            document.querySelector(selector).style[prop] = data.customSettings[selector][prop];
        }
    }
});
