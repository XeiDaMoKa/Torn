

//  popup.js //


// Gather all fueatures into customData object.

    const customData = {};






// Reads the color picker , associates it to body and sends to customs.js.

    $('#bodyColor').on('input', function() {
        customData['body'] = { backgroundColor: this.value };
            sendToCustoms();
});





// Initially disable the slider
$('#opacitySlider').prop('disabled', true);
$('#bodyIMG').on('change', applyImageWithOpacity);
$('#opacitySlider').on('input', applyImageWithOpacity);
$('#bodyColor').on('input', function() {
    customData['body'] = { backgroundColor: this.value };
    sendToCustoms();
});

function applyImageWithOpacity() {
    customData['.custom-bg-desktop, .custom-bg-mobile'] = {
        opacity: $('#opacitySlider').val(),
        filter: 'invert(0%)'
    };

    // Process the chosen image
    var fileReader = new FileReader();
    fileReader.onloadend = function(event) {
        customData['.custom-bg-desktop, .custom-bg-mobile'].backgroundImage = `url(${event.target.result})`;
        customData['.custom-bg-desktop, .custom-bg-mobile'].backgroundSize = 'cover';
        customData['.custom-bg-desktop, .custom-bg-mobile'].position = 'fixed';
        customData['.custom-bg-desktop, .custom-bg-mobile'].width = '100vw';
        customData['.custom-bg-desktop, .custom-bg-mobile'].height = '100vh';
        sendToCustoms();

        // Enable the slider when an image is selected
        $('#opacitySlider').prop('disabled', false);
    };
    fileReader.readAsDataURL(document.getElementById('bodyIMG').files[0]);
}


















function sendToCustoms() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, customData);
    });
}