




// Listens for changes in background color picker
$('.bodyColorPicker[data-id="bodyColor"]').on('input', function() {
    var newBodyColor = $(this).val();

    // Dynamically change the body color from the color picker
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: setBackgroundColor,
            args: [newBodyColor]
        });

        // Save the body color to storage
        chrome.storage.local.set({ body: newBodyColor });
    });
});

// Listens for changes in background color picker and applies the color to the body
function setBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}
