




// Directly set the background color from the message
chrome.runtime.onMessage.addListener(function(request) {
    document.querySelector('body').style.backgroundColor = request.color;
});

// Directly apply the saved background color from local storage
chrome.storage.local.get("bodyColor", function(data) {
    document.querySelector('body').style.backgroundColor = data.bodyColor;
});
