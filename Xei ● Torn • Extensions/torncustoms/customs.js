




// Dynamically apply the body color
chrome.runtime.onMessage.addListener(function(request) {
    document.querySelector('body').style.backgroundColor = request.body;
});

// Apply the body color from Storage
chrome.storage.local.get("body", function(data) {
    document.querySelector('body').style.backgroundColor = data.body;
});
