




// Apply the body color from Storage
chrome.storage.local.get("body", function(data) {
    document.body.style.backgroundColor = data.body;
});

// Apply the background image from Storage
chrome.storage.local.get("bodyImage", function(data) {
    document.querySelector('.custom-bg-desktop').style.backgroundImage = `url(${data.bodyImage})`;
});
