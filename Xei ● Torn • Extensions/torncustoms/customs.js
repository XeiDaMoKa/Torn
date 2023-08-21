chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "applyChanges") {
        handleChangesInCustoms(message.data.selector, message.data.property, message.data.value);
    }
});

function handleChangesInCustoms(selector, property, value) {
    // Apply changes to the page
    document.querySelector(selector).style[property] = value;

    // Save to storage
    chrome.storage.local.set({ [selector]: { property: property, value: value } });
}

// Apply changes from storage on page load
chrome.storage.local.get(null, function(items) {
    for (let selector in items) {
        let data = items[selector];
        if (data && data.property && data.value) {
            document.querySelector(selector).style[data.property] = data.value;
        }
    }
});
