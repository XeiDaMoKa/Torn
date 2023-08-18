




    // Listens for changes in background color picker
    $('.input-color-picker[data-id="bg-color"]').on('input', function() {
        var newColor = $(this).val();

// Sends the color to customs.js to preview and apply after refresh
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "changeBackgroundColor", color: newColor});

// Saves in local storage
            chrome.storage.local.set({"backgroundColor": newColor});
        });
    });
