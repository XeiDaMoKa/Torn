// popup.js

// Gather all features into customData object.
const customData = {};

// Change Background Color
$('#bodyColor').on('input', function() {
    customData['body'] = { backgroundColor: this.value };
    sendToCustoms();
});

// Upload Image
$('#opacitySlider').prop('disabled', true);

// Set Image using URL
$('#setIMGURL').on('click', function() {
    var imageUrl = prompt("Please enter the image URL:", "");
    if (imageUrl) {
        customData['.custom-bg-desktop, .custom-bg-mobile'] = {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            opacity: $('#opacitySlider').val()
        };
        sendToCustoms();
    }
});

// Send customData to customs.js
function sendToCustoms() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, customData);
    });
}

// Event listener for the Clear Storage button
document.getElementById('clearStorage').addEventListener('click', function() {
    chrome.storage.local.clear(function() {
        alert('Storage has been cleared!');
    });
});

// Utility to Convert Customization Data to CSS
function convertToCSS(data) {
    let css = '';
    for (let selector in data) {
        css += `${selector} {\n`;
        for (let prop in data[selector]) {
            css += `    ${prop}: ${data[selector][prop]};\n`;
        }
        css += '}\n';
    }
    return css;
}

// Utility to generate JS based on data (if needed in future)
function generateJSFile(data) {
    let jsContent = '';
    // Placeholder for future logic
    return jsContent;
}

// Utility to allow users to download generated files
function downloadFile(filename, content) {
    const url = URL.createObjectURL(content);

    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    }, function(downloadId) {
        if(chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log("Download started with ID", downloadId);
        }
    });

    URL.revokeObjectURL(url);
}



function exportCustomStyles() {
    console.log("Exporting styles...");
    chrome.storage.local.get('customSettings', function(data) {
        if (!data.customSettings) {
            alert("No custom settings found!");
            return;
        }

        const zip = new JSZip();

        const cssContent = convertToCSS(data.customSettings);
        zip.file("styles.css", cssContent);

        const manifestContent = JSON.stringify({
            // Your manifest data here...
        }, null, 4);
        zip.file("manifest.json", manifestContent);

        const jsContent = generateJSFile(data.customSettings);
        if (jsContent) {
            zip.file("script.js", jsContent);
        }

        zip.generateAsync({type: "blob"}).then(function(content) {
            downloadFile("CustomStyles.zip", content);
        });
    });
}



// Event listener for the "Create Instant Style" button
document.getElementById('export').addEventListener('click', exportCustomStyles);
