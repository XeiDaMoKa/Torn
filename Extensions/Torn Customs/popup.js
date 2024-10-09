// popup.js

// Configuration for dynamic settings
const settingsConfig = {
    body: {
        inputId: '#bodyColor',
        property: 'background-color',
        defaultColor: '#000000'
    },
    '.content-title *, .topSectionU7sVi *, .crimes-app-header *, .topSection___U7sVi *': {
        inputId: '#titleColor',
        property: 'color',
        defaultColor: '#000000'
    }
};

// Logic to update popup UI based on stored styles
function updateUI(styles) {
    for (const selector in settingsConfig) {
        const { inputId, property } = settingsConfig[selector];
        if (styles && styles[selector] && new RegExp('^#[0-9A-F]{6}$', 'i').test(styles[selector][property].replace(' !important', ''))) {
            $(inputId).val(styles[selector][property].replace(' !important', ''));
        }
    }

    // Logic to display storage in CSS format
    let cssDisplay = '';
    for (const selector in styles) {
        cssDisplay += `${selector} {\n`;
        for (const property in styles[selector]) {
            cssDisplay += `  ${property}: ${styles[selector][property]};\n`;
        }
        cssDisplay += '}\n\n';
    }
    $('#defaultCSSText').val(cssDisplay.trim());
}

// Load styles from storage and update popup UI
function updateFromStorage() {
    chrome.storage.sync.get(['tornCustomsStyles', 'customCSSRules'], function(data) {
        if (data.tornCustomsStyles) {
            updateUI(data.tornCustomsStyles);
        }
        if (data.customCSSRules) {
            $('#customCSSText').val(data.customCSSRules);
            validateCustomCSS(data.customCSSRules, false); // Do not show saved message on load
        } else {
            validateCustomCSS('');
        }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area === 'sync') {
            if (changes.tornCustomsStyles) {
                updateUI(changes.tornCustomsStyles.newValue);
            }
            if (changes.customCSSRules) {
                $('#customCSSText').val(changes.customCSSRules.newValue);
                validateCustomCSS(changes.customCSSRules.newValue, false); // Do not show saved message on load
            }
        }
    });
}

// Validate custom CSS rules
function validateCustomCSS(css, showSavedMessage = true) {
    const isValid = isValidCSS(css);
    const isEmpty = css.trim() === '';

    if (isEmpty) {
        chrome.storage.sync.get('customCSSRules', function(data) {
            if (!data.customCSSRules) {
                $('#customCSSText').removeClass('invalid').addClass('valid');
            } else {
                $('#customCSSText').toggleClass('valid', isValid).toggleClass('invalid', !isValid);
            }
        });
    } else {
        $('#customCSSText').toggleClass('valid', isValid).toggleClass('invalid', !isValid);
        if (isValid) {
            chrome.storage.sync.set({ customCSSRules: css }, function() {
                if (showSavedMessage) {
                    showCustomSettingsSavedFeedback();
                }
            });
        }
    }
}

// Show feedback when custom settings are saved
function showCustomSettingsSavedFeedback() {
    const $resetButton = $('#resetCustomSettings');
    $resetButton.text('Custom Settings Saved').addClass('green-button').prop('disabled', true);
    setTimeout(function() {
        $resetButton.text('Reset Custom Settings').removeClass('green-button').prop('disabled', false);
    }, 1500);
}

// Check if CSS is valid
function isValidCSS(css) {
    if (css.trim() === '') return false; // Empty CSS is not valid
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const isValid = !!style.sheet.cssRules.length;
    document.head.removeChild(style);
    return isValid;
}

// Listen to setting inputs to update storage
for (const selector in settingsConfig) {
    const { inputId, property } = settingsConfig[selector];

    $(inputId).on('input', function() {
        const color = $(this).val();
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            chrome.storage.sync.get('tornCustomsStyles', function(data) {
                const newStyles = data.tornCustomsStyles || {};
                newStyles[selector] = newStyles[selector] || {};
                newStyles[selector][property] = color + ' !important';
                chrome.storage.sync.set({ tornCustomsStyles: newStyles });
            });
        }
    });
}

// Toggle the visibility of the CSS display sections
$('#toggleDefaultCSSDisplay').on('click', function() {
    const $defaultCSSDisplaySection = $('#defaultCSSDisplaySection');
    if ($defaultCSSDisplaySection.is(':visible')) {
        $defaultCSSDisplaySection.hide();
        $(this).text('Show Default Settings');
    } else {
        $defaultCSSDisplaySection.show();
        $(this).text('Hide Default Settings');
    }
});

$('#toggleCustomCSSDisplay').on('click', function() {
    const $customCSSDisplaySection = $('#customCSSDisplaySection');
    if ($customCSSDisplaySection.is(':visible')) {
        $customCSSDisplaySection.hide();
        $(this).text('Show Custom Settings');
    } else {
        $customCSSDisplaySection.show();
        $(this).text('Hide Custom Settings');
    }
});

// Listen to custom CSS text area input
$('#customCSSText').on('input', function() {
    const css = $(this).val();
    validateCustomCSS(css);
});

// Ensure Ctrl+Z and Ctrl+Y work for the custom CSS text area
$(document).on('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
        $('#customCSSText').focus();
    }
});

// Reset Default Settings
$('#resetDefaultSettings').on('click', function() {
    chrome.storage.sync.remove('tornCustomsStyles', function() {
        $('style[data-custom-styles]').remove();
        updateUI({}); // Update UI with default values
    });
});

// Reset Custom Settings
$('#resetCustomSettings').on('click', function() {
    if (!$(this).prop('disabled')) {
        chrome.storage.sync.remove('customCSSRules', function() {
            $('style[data-custom-css]').remove();
            $('#customCSSText').val('');
            validateCustomCSS('', true); // Show saved message on reset
        });
    }
});

// Reset All Settings
$('#clearStorage').on('click', function() {
    chrome.storage.sync.clear(function() {
        $('style[data-custom-styles]').remove();
        $('style[data-custom-css]').remove();
        updateFromStorage();
    });
});

// Initial load of styles
updateFromStorage();updateFromStorage();