




$(document).ready(function() {
    // Listen for changes in the background color input
    $('.input-color-picker[data-id="bg-color"]').on('input', function() {
        var newColor = $(this).val();

        // Log the color change message for debugging
        console.log("Sending color change message: " + newColor);

        // Send the new color to the content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "changeBackgroundColor", color: newColor});
        });
    });
});
