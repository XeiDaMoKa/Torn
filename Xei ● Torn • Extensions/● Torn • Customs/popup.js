// popup.js

// Gather all features into customData object.
const customData = {};

// Change Background Color
$('#bodyColor').on('input', function() {
    customData['body'] = { backgroundColor: this.value };
    sendToCustoms();
});

// Change Title Text Color
$('#titleColor').on('input', function() {
    // Assuming you want to change h4 and .line-h24 elements' colors
    customData['h4'] = { color: this.value };
    customData['.line-h24'] = { color: this.value };
    sendToCustoms();
});

// Send customData to customs.js, ensuring not to overwrite existing settings
function sendToCustoms() {
    chrome.storage.local.get('customSettings', function(data) {
        let updatedSettings = {...data.customSettings, ...customData};
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, updatedSettings);
        });
        // Save the merged settings back to storage
        chrome.storage.local.set({ customSettings: updatedSettings });
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
