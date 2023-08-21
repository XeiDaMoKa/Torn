function sendToCustoms(selector, property, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "applyChanges",
            data: { selector: selector, property: property, value: value }
        });
    });
}

$('.bodyColorPicker').on('input', function() {
    sendToCustoms('body', 'backgroundColor', $(this).val());
});

$('#bodyIMG').on('change', function() {
    let reader = new FileReader();
    reader.onloadend = function(event) {
        sendToCustoms('.custom-bg-desktop', 'backgroundImage', `url(${event.target.result})`);
    };
    reader.readAsDataURL(this.files[0]);
});
