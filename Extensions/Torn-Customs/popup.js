
// Global variable to store custom settings
let customData = {};

// Logging functions
const $$ = console.log;
const $$$ = console.error;

loadSettings();
$$('Torn Customs Started.');

// Function to load settings from storage
function loadSettings() {
    chrome.storage.local.get('customSettings', function(data) {
        if (data.customSettings) {
            customData = data.customSettings;
            applySettings();
            updateCssText();
            updateUI();
            $$('Settings Stored:', customData);
        }
    });
}

// Function to apply settings to the active tab
function applySettings() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, customData);
            $$('Settings style applied', customData);
        } else {
            $$$('No active tab found to apply settings.');
        }
    });
}

// Function to update the UI based on current settings
function updateUI() {
    if (customData['body'] && customData['body'].backgroundColor) {
        $('#bodyColor').val(customData['body'].backgroundColor);
    }
    if (customData['h4'] && customData['h4'].color) {
        $('#titleColor').val(customData['h4'].color);
    }
    if (customData['.header___RpWar'] && customData['.header___RpWar'].display === 'none') {
        $('#hideAreaTitles').prop('checked', true);
    }
}

// Function to update CSS box text
function updateCssText() {
    let cssText = '';
    if (customData['body'] && customData['body'].backgroundColor) {
        cssText += `body { background-color: ${customData['body'].backgroundColor}; }\n`;
    }
    if (customData['h4'] && customData['h4'].color) {
        cssText += `h4 { color: ${customData['h4'].color}; }\n`;
    }
    if (customData['.header___RpWar']) {
        cssText += `.header___RpWar { display: ${customData['.header___RpWar'].display}; }\n`;
    }
    $('#cssText').val(cssText);
    $$('Updated CSS text:', cssText);
}

// Function to handle setting changes
function handleSettingChange(key, value) {
    customData[key] = value;
    applySettings();
    saveSettings();
    updateCssText();
    $$('Setting changed:', key, value);
}

// Function to save settings to storage
function saveSettings() {
    chrome.storage.local.set({ customSettings: customData }, function() {
        $$('Settings saved:', customData);
    });
}

// Event listeners for UI interactions
$('#bodyColor').on('input', function() {
    handleSettingChange('body', { backgroundColor: this.value });
});

$('#titleColor').on('input', function() {
    handleSettingChange('h4', { color: this.value });
});

$('#hideAreaTitles').on('change', function() {
    handleSettingChange('.header___RpWar', { display: this.checked ? 'none' : 'block' });
});

$('#instantStyling').click(function() {
    $('#cssTextContainer').show();
    $$('Instant styling button clicked.');
});


// Add this to the top of your existing popup.js file
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleInstantStyling');
    const cssTextContainer = document.getElementById('cssTextContainer');

    // Hide the cssTextContainer by default
    cssTextContainer.style.display = 'none';

    toggleButton.addEventListener('click', function() {
        if (cssTextContainer.style.display === 'none') {
            cssTextContainer.style.display = 'block';
            toggleButton.textContent = 'Hide Instant Styling';
        } else {
            cssTextContainer.style.display = 'none';
            toggleButton.textContent = 'Show Instant Styling';
        }
    });
});

// Add this function to handle the clear storage button state
function updateClearStorageButton(state) {
    const clearButton = $('#clearStorage');
    if (state === 'initial') {
        clearButton.text('Reset All Settings');
        clearButton.removeClass('red-button');
    } else if (state === 'confirm') {
        clearButton.text('U SURE ABOUT THAT?');
        clearButton.addClass('red-button');
    }
}











// Function to handle the clear storage button state and text
function updateClearStorageButton(state) {
    const clearButton = $('#clearStorage');
    clearButton.removeClass('red-button green-button');

    if (state === 'initial') {
        clearButton.text('Reset All Settings');
    } else if (state === 'confirm') {
        clearButton.text('U SURE ABOUT THAT?');
        clearButton.addClass('red-button');
    } else if (state === 'cleaned') {
        clearButton.text('Storage Cleaned');
        clearButton.addClass('green-button');
    }
}

// Modify the clear storage button click handler
$('#clearStorage').click(function() {
    if ($(this).hasClass('red-button')) {
        chrome.storage.local.clear(function() {
            customData = {};
            updateCssText();
            updateUI();
            updateClearStorageButton('cleaned');

            // Reset button state after 3 seconds
            setTimeout(() => {
                updateClearStorageButton('initial');
            }, 3000);
        });
    } else {
        updateClearStorageButton('confirm');
        // Reset button state after 3 seconds if not clicked
        setTimeout(() => updateClearStorageButton('initial'), 3000);
    }
});

// Don't forget to call this function on initial load
updateClearStorageButton('initial');











// Copy to Clipboard
$('#copyCss').click(function() {
    navigator.clipboard.writeText($('#cssText').val()).then(
        () => {
            alert('CSS copied to clipboard!');
            $$('CSS copied to clipboard.');
        },
        (err) => {
            $$$('Error copying CSS:', err);
            alert('Error copying CSS: ' + err);
        }
    );
});
