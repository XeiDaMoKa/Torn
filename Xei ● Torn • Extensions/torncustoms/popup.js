

//  popup.js //


// Gather all fueatures into customData object.

    const customData = {};






// Reads the color picker , associates it to body and sends to customs.js.

    $('#bodyColor').on('input', function() {
        customData['body'] = { backgroundColor: this.value };
            sendToCustoms();
});





    // Handle the change event for the file input
    $('#bodyIMG').on('change', function() {
        var fileReader = new FileReader();
        fileReader.onloadend = function(event) {
            customData['.custom-bg-desktop, .custom-bg-mobile'] = {
                backgroundImage: `url(${event.target.result})`,
                backgroundSize: 'cover',
                position: 'fixed',
                filter: 'none',
                width: '100vw',
                height: '100vh'
            };

            sendToCustoms();
        };
        fileReader.readAsDataURL(this.files[0]);
    });














function sendToCustoms() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, customData);
    });
}