

//  popup.js //


// A central object to store all the customization data that will be sent to customs.js.
let customData = {};

// Event listener for the color picker input.
$('.bodyColorPicker').on('input', function() {
    // Use the new combined function to update and send data.
    updateAndSendData('body', { backgroundColor: this.value });
});

// Event listener for the custom image input.
$('#bodyIMG').on('change', function() {
    let reader = new FileReader();

    reader.onloadend = function(event) {
        // Use the new combined function to update and send data.
        updateAndSendData('.custom-bg-desktop, .custom-bg-mobile', { backgroundImage: `url(${event.target.result})` });
    };

    reader.readAsDataURL(this.files[0]);
});

function updateAndSendData(selector, properties) {
    // Directly set the properties for the selector.
    customData[selector] = properties;

    // Send the updated customData to customs.js.
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, customData);
    });
}
