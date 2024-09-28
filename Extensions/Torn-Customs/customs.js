// customs.js

// This part should already be in your customs.js file
chrome.runtime.onMessage.addListener(function(data) {
    $.each(data, function(selector, properties) {
        $.each(properties, function(prop, value) {
            $(selector).css(prop, value);
        });
    });
});

// Apply stored customizations on page load
chrome.storage.local.get('customSettings', function(data) {
    if (data.customSettings) {
        $.each(data.customSettings, function(selector, properties) {
            $.each(properties, function(prop, value) {
                $(selector).css(prop, value);
            });
        });
    }
});