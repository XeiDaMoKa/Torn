




$(document).ready(function() {
    chrome.storage.local.get("backgroundColor", function(data) {
        if (data.backgroundColor) {
            $('.input-color-picker[data-id="bg-color"]').val(data.backgroundColor);
        }
    });
    // Listens for changes in color picker
    $('.input-color-picker[data-id="bg-color"]').on('input', function() {
        var newColor = $(this).val();

// Sends the color to the customs script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "changeBackgroundColor", color: newColor});

// Saves in Local Storage
            chrome.storage.local.set({"backgroundColor": newColor});
        });
    });
});