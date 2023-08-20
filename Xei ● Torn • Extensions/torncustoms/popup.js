




    // Listens for changes in background color picker
    $('.input-color-picker[data-id="bg-color"]').on('input', function() {
        var newBodyColor = $(this).val();

        // Sends the color to customs.js
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "changeBodyColor", body: newBodyColor});

            // Saves in local storage
            chrome.storage.local.set({"body": newBodyColor});
        });
    });
