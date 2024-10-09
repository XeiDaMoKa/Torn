// customs.js
// Apply stored settings styles dynamically
function applyStyles(styles) {
    let styleString = '';
    if (styles && Object.keys(styles).length > 0) {
        $.each(styles, function (selector, properties) {
            styleString += selector + ' { ';
            $.each(properties, function (property, value) {
                styleString += property + ': ' + value + '; ';
            });
            styleString += '} ';
        });
    }
    $('style[data-custom-styles]').remove();
    if (styleString) {
        $('head').append('<style type="text/css" data-custom-styles>' + styleString + '</style>');
    }
}

// Apply stored styles on load
chrome.storage.sync.get(['tornCustomsStyles', 'customCSSRules'], function (data) {
    if (data.tornCustomsStyles) {
        applyStyles(data.tornCustomsStyles);
    }
    if (data.customCSSRules) {
        $('head').append('<style type="text/css" data-custom-css>' + data.customCSSRules + '</style>');
    }
});

// Listen to storage changes to apply styles live
chrome.storage.onChanged.addListener(function (changes) {
    if (changes.tornCustomsStyles) {
        applyStyles(changes.tornCustomsStyles.newValue);
    }
    if (changes.customCSSRules) {
        $('style[data-custom-css]').remove();
        $('head').append('<style type="text/css" data-custom-css>' + changes.customCSSRules.newValue + '</style>');
    }
});