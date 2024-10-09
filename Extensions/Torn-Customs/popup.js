// popup.js

let customData = {};
let selectorOrder = [];
let resetConfirmationActive = false;

// Constant Definitions
const $bodyColor = $('#bodyColor');
const $titleColor = $('#titleColor');
const $cssText = $('#cssText');
const $clearStorage = $('#clearStorage');
const $copyCss = $('#copyCss');
const $cssTextContainer = $('#cssTextContainer');
const $resetBodyColor = $('#resetBodyColor');
const $resetTitleColor = $('#resetTitleColor');

// Load settings when the document is ready
$(document).ready(() => {
    loadSettings();
    $cssTextContainer.hide();
});

// Listen for storage changes and reload settings
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.customSettings || changes.selectorOrder)) loadSettings();
});

// Load settings from storage and apply them
function loadSettings() {
    chrome.storage.local.get(['customSettings', 'selectorOrder'], ({ customSettings = {}, selectorOrder = [] }) => {
        customData = customSettings;
        selectorOrder = order;
        updateUI();
        updateCssText();
    });
}

// Apply settings by sending a message to the content script
function applySettings() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { customData, selectorOrder });
        }
    });
}

// Event Listeners
$bodyColor.on('input', function() {
    handleSettingChange('body', 'backgroundColor', this.value);
    $resetBodyColor.show();
});

$titleColor.on('input', function() {
    handleSettingChange('.content-title *, .topSection___U7sVi *', 'color', this.value);
    $resetTitleColor.show();
});

$resetBodyColor.click(function() {
    resetColorSetting('body', 'backgroundColor');
    $(this).hide();
});

$resetTitleColor.click(function() {
    resetColorSetting('.content-title *, .topSection___U7sVi *', 'color');
    $(this).hide();
});

// Add event listener for the "Hide Area Titles" checkbox
$('#hideAreaTitles').change(function() {
    handleCheckboxChange('.header___RpWar', this.checked);
});

// Add event listener for the "Hide Sidebar Labels" checkbox
$('#hideSidebarLabels').change(function() {
    handleSidebarLabelsChange(this.checked);
});

// Checkbox Initialization Function
function initializeCheckboxes() {
    $('#hideAreaTitles').prop('checked', customData['.header___RpWar']?.display === 'none');
    $('#hideSidebarLabels').prop('checked', customData['.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p']?.display === 'none'); // Check for sidebar labels
}

// Event Listeners
$bodyColor.on('click', function() {
    $resetBodyColor.show();
});

$titleColor.on('click', function() {
    $resetTitleColor.show();
});

$(document).on('click', function(event) {
    if (!$(event.target).closest('.bodyColorPickerContainer').length) {
        $('.resetButton').hide();
    }
});

$bodyColor.on('input', function() {
    handleSettingChange('body', 'backgroundColor', this.value);
});

$titleColor.on('input', function() {
    handleSettingChange('.content-title *, .topSection___U7sVi *', 'color', this.value);
});

$resetBodyColor.click(function() {
    resetColorSetting('body', 'backgroundColor');
    $(this).hide();
});

$resetTitleColor.click(function() {
    resetColorSetting('.content-title *, .topSection___U7sVi *', 'color');
    $(this).hide();
});

function handleSidebarLabelsChange(isChecked) {
    if (isChecked) {
        customData['.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p'] = { display: 'none' };
        if (!selectorOrder.includes('.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p')) {
            selectorOrder.push('.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p');
        }
    } else {
        delete customData['.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p'];
        selectorOrder = selectorOrder.filter(item => item !== '.menu-name___DvWEr, .name___ChDL3, .bar-name___cHBD8, .bar-name___EcY8p'); // Remove from selectorOrder
    }
    saveSettings();
    applySettings();
}

function handleCheckboxChange(selector, isChecked) {
    if (isChecked) {
        customData[selector] = { display: 'none' };
        if (!selectorOrder.includes(selector)) selectorOrder.push(selector);
    } else {
        delete customData[selector];
        selectorOrder = selectorOrder.filter(item => item !== selector);
    }
    saveSettings();
    applySettings();
}

$('#toggleInstantStyling').click(function() {
    $cssTextContainer.toggle();
    $(this).text($cssTextContainer.is(':visible') ? 'Hide Instant Styling' : 'Show Instant Styling');
});

$copyCss.click(function() {
    const cssContent = $cssText.val();
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom.css';  // The name of the downloaded file
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the DOM by removing the temporary link
    document.body.removeChild(link);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(url);

    $copyCss.text('CSS File Exported').addClass('green-button');
    setTimeout(() => $copyCss.text('Export CSS').removeClass('green-button'), 3000);
});

$('#importCSSBtn').click(function () {
    const fileInput = $('#uploadCustomCSS')[0];
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const fileContent = e.target.result;

            // Save the file content to chrome.storage (or however you want to handle it)
            chrome.storage.local.set({ customCSS: fileContent }, function () {
                console.log('Custom CSS saved!');
            });
        };

        reader.readAsText(file);
    } else {
        alert('No file selected');
    }
});
    // Trigger file input when Import Styles button is clicked
    $('#importStyles').click(function () {
        $('#fileInput').click(); // Show hidden file input
    });

    // Handle file input change (file upload)
    $('#fileInput').on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            // When the file is read, process its content
            reader.onload = function (e) {
                const fileContent = e.target.result;

                // Log the content or do something with it (for testing purposes)
                console.log('Imported CSS content:', fileContent);

                // OPTIONAL: Save it to chrome storage (to use later)
                chrome.storage.local.set({ importedCSS: fileContent }, function () {
                    console.log('Custom CSS imported and saved!');
                });
            };

            // Read the uploaded file as text
            reader.readAsText(file);
        } else {
            alert('No file selected.');
        }
    });

$clearStorage.click(function() {
    if (!resetConfirmationActive) {
        resetConfirmationActive = true;
        $clearStorage.text('U Sure About That?').addClass('red-button');
        setTimeout(() => {
            resetConfirmationActive = false;
            $clearStorage.text('Clear Storage').removeClass('red-button');
        }, 3000);
    } else {
        clearStorage();
    }
});

function updateUI() {
    $bodyColor.val(validateColor(customData.body?.['background-color']) ? customData.body['background-color'] : '#000000');
    $titleColor.val(validateColor(customData['.content-title *, .topSection___U7sVi *']?.color) ? customData['.content-title *, .topSection___U7sVi *'].color : '#000000');
    initializeCheckboxes();

    // Hide reset buttons by default
    $('.resetButton').hide();
}

function validateColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

function handleSettingChange(selector, property, value) {
    if (validateColor(value)) {
        customData[selector] = { [property.replace(/([A-Z])/g, '-$1').toLowerCase()]: value };
        if (!selectorOrder.includes(selector)) selectorOrder.push(selector);
        saveSettings();
        updateCssText();
        applySettings();
    }
}

function resetColorSetting(selector, property) {
    delete customData[selector];
    selectorOrder = selectorOrder.filter(item => item !== selector);
    saveSettings();
    updateUI();
    updateCssText();
    applySettings();
}

function saveSettings() {
    chrome.storage.local.set({ customSettings: customData, selectorOrder });
}



function updateCssText() {
    const cssText = selectorOrder.map(selector => {
        const rules = Object.entries(customData[selector] || {})
            .map(([prop, val]) => `${prop}: ${val} !important;`).join(' ');
        return `${selector} { ${rules} }`;
    }).join('\n');
    $cssText.val(cssText);
}

function clearStorage() {
    chrome.storage.local.clear(() => {
        customData = {};
        selectorOrder = [];
        updateUI();
        updateCssText();
        removeStyles();
        $clearStorage.text('Settings Deleted').addClass('green-button');
        setTimeout(() => {
            $clearStorage.text('Reset All Settings').removeClass('green-button');
        }, 3000);
    });
}

function removeStyles() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => tab && chrome.tabs.sendMessage(tab.id, { removeStyles: true }));
}