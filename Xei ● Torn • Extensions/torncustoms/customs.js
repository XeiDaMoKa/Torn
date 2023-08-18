




// Dynamically Preview background color picker from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "changeBackgroundColor") {
        document.body.style.backgroundColor = request.color;
    }
});


// Apply Saved Background Storage
chrome.storage.local.get("backgroundColor", function(data) {
    if (data.backgroundColor) {
        document.body.style.backgroundColor = data.backgroundColor;
    }
});
