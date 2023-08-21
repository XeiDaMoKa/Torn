




// When color picker value changes
$('.bodyColorPicker').on('input', function() {
    // Get the new color value
    let newBodyColor = $(this).val();

    // Apply the new color to the active tab
    applyToTab('body', 'backgroundColor', newBodyColor);

    // Save the new color to local storage for persistence
    saveToStorage('body', newBodyColor);
});

// Listen for a new image being uploaded
$('#bodyIMG').on('change', function() {
    let reader = new FileReader();
    reader.onloadend = function(event) {
        // Apply the uploaded image as background to the active tab
        applyToTab('.custom-bg-desktop', 'backgroundImage', `url(${event.target.result})`);

        // Save the image to local storage for persistence
        saveToStorage('bodyImage', event.target.result);
    };
    reader.readAsDataURL(this.files[0]);
});

// Apply CSS changes to the tab
function applyToTab(selector, property, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: changeStyle,
            args: [selector, property, value]
        });
    });
}

// Helper function for changing styles
function changeStyle(selector, property, value) {
    document.querySelector(selector).style[property] = value;
}

// Function to save data to chrome's local storage
function saveToStorage(key, value) {
    chrome.storage.local.set({ [key]: value });
}
