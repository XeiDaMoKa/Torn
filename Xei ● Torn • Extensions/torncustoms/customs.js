




// Apply the body color from Storage
chrome.storage.local.get("body", function(data) {
    document.querySelector('body').style.backgroundColor = data.body;
});
