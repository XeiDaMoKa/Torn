

// As soon as the script runs, retrieve the saved color from local storage and apply it to the page background.
chrome.storage.local.get("backgroundColor", function(data) {
    if (data.backgroundColor) {
        document.body.style.backgroundColor = data.backgroundColor;
    }
});

// Listen for messages from popup.js to change the background color.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "changeBackgroundColor") {
        document.body.style.backgroundColor = request.color;
    }
});
