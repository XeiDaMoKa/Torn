




chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "changeBackgroundColor") {
        document.body.style.backgroundColor = request.color;
        console.log("Received message:", request);
    }
});
