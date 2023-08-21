

// customs.js //


// Event listener for messages received from other scripts (e.g., popup.js).
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    for (let selector in data) {
        for (let property in data[selector]) {
            applyChanges(selector, property, data[selector][property]);
        }
    }
});
// Function to apply the chosen styles to specific elements on the page and save them to local storage
function applyChanges(selector, property, value) {
    document.querySelector(selector).style[property] = value;
    chrome.storage.local.set({ [selector]: { property: property, value: value } });
}
// Function to retrieve and apply stored customizations on page load.
chrome.storage.local.get(null, function(items) {
    for (let selector in items) {
        let data = items[selector];
        document.querySelector(selector).style[data.property] = data.value;
    }
});
