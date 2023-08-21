

//  popup.js //


// A central object to store all the customization data that will be sent to customs.js.
let customData = {};

// Event listener for the color picker input.
$('.bodyColorPicker').on('input', function() {
    // Capture the color value from the color picker.
    let colorValue = $(this).val();

    // Update the customData object with the selector (in this case, 'body') and its new style.
    updateCustomData('body', { backgroundColor: colorValue });

    // Send the updated customData to customs.js.
    sendCustomData();
});

// Event listener for the custom image input.
$('#bodyIMG').on('change', function() {
    // Initialize a FileReader to read the selected image.
    let reader = new FileReader();

    reader.onloadend = function(event) {
        // Once the image is read, convert it to a URL format.
        let imageUrl = `url(${event.target.result})`;

        // Update the customData object with the selectors (desktop and mobile backgrounds) and their new style.
        updateCustomData('.custom-bg-desktop, .custom-bg-mobile', { backgroundImage: imageUrl });

        // Send the updated customData to customs.js.
        sendCustomData();
    };

    // Start reading the selected image as a Data URL.
    reader.readAsDataURL(this.files[0]);
});

// Function to update the customData object.
function updateCustomData(selector, properties) {
    // If the selector doesn't exist in the customData, initialize it.
    if (!customData[selector]) {
        customData[selector] = {};
    }

    // For each property in the provided properties, update its value in customData.
    for (let prop in properties) {
        customData[selector][prop] = properties[prop];
    }
}

// Function to send the customData to customs.js.
function sendCustomData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, customData);
    });
}
