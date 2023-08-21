

// customs.js //


// Event listener for messages received from popup.js.
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    for (let selector in data) {
        let properties = data[selector];
        for (let prop in properties) {
            document.querySelector(selector).style[prop] = properties[prop];
        }
    }

    // Save the received data to local storage for persistence
    chrome.storage.local.set({ customSettings: data });
});

// Apply stored customizations on page load
chrome.storage.local.get('customSettings', function(data) {
    if (data.customSettings) {
        for (let selector in data.customSettings) {
            let properties = data.customSettings[selector];
            for (let prop in properties) {
                document.querySelector(selector).style[prop] = properties[prop];
            }
        }
    }
});
