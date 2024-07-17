// ==UserScript==
// @name         Torn Vault Share Tracker
// @version      0.2
// @description  Tracks your share of the vault
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/properties.php*
// ==/UserScript==
/* global $ */

(async function() {
    const $$ = console.log;
    $$("Script started");

    // Create Storage Var
    var xvstDATA;
    var xvstTEMP;
let valueSource = 'api'; // Default to 'api'
    // Loading Element
    const showLoader = () => {
        const textElement = $('.vault-cont.left .title p.m-bottom10');
        textElement.empty();
        $('<span></span>').addClass('ajax-preloader').css({'left': 'auto','margin': '0'}).appendTo(textElement);
        $$("Loader Created");
    };

    // Value Element
    const updateText = (source) => {
        const textElement = $('.vault-cont.left .title p.m-bottom10');
        textElement.empty();
        textElement.append("Your Value: ");

        let displayValue;
        if (source === 'api') {
            displayValue = xvstDATA.yourVALUE;
        } else if (source === 'temp') {
            displayValue = xvstTEMP;
        }

        $('<span></span>').text(`$${displayValue}`).css({ color: source === 'temp' ? 'yellow' : 'green', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Your Value Created");

        const totalVaultValue = parseInt($('.wvalue').text().replace(/,/g, ''), 10);
        const yourValue = parseInt(xvstDATA.yourVALUE.replace(/,/g, ''), 10);
        const spouseValue = totalVaultValue - yourValue;

        textElement.append(" Spouse Value: ");
        $('<span></span>').text(`$${spouseValue.toLocaleString()}`).css({ color: 'red', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Spouse Value Created");
    };

    // Observe Element to show loader then call API to calculate
    const startObserver = () => {
        const observer = new MutationObserver(async (mutations) => {
            $$("Element Observed");
            observer.disconnect();
            $$("Observer disconnected");
            showLoader();
            $$("Loader Shown");

            if (valueSource === 'api') {
                xvstDATA = JSON.parse(localStorage.getItem('xvstDATA'));
                const apiResponse = await $.get(`https://api.torn.com/user/?selections=log&cat=138&from=0&to=*&key=${xvstDATA.apiKEY}`);
                $$("API Called");

                let valueChange = 0;
                let newLogID = Object.keys(apiResponse.log)[0];
                for (const [logID, logEntry] of Object.entries(apiResponse.log)) {
                    if (logID === xvstDATA.logID) {
                        break;
                    }
                    if (logEntry.title === "Vault deposit") {
                        valueChange += logEntry.data.deposited;
                    } else if (logEntry.title === "Vault withdraw") {
                        valueChange -= logEntry.data.withdrawn;
                    }
                }
                xvstDATA.yourVALUE = (parseInt(xvstDATA.yourVALUE.replace(/,/g, '')) + valueChange).toLocaleString();
                xvstDATA.logID = newLogID;
                localStorage.setItem('xvstDATA', JSON.stringify(xvstDATA));

                updateText('api');
                $$("Real Value Displayed");
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        $$("Observer started");
    };

    // Listener logic
    document.addEventListener('click', async (event) => {
        $$("Listening for Transactions");
        if (event.target && (event.target.value === 'WITHDRAW' || event.target.value === 'DEPOSIT')) {
            $$("Button Clicked");
            const amount = parseInt(event.target.closest('form').querySelector('.input-money').value.replace(/,/g, ''), 10);
            let newCurrentValue = parseInt(xvstDATA.yourVALUE.replace(/,/g, ''), 10);
            if (event.target.value === 'WITHDRAW') {
                newCurrentValue -= amount;
            } else if (event.target.value === 'DEPOSIT') {
                newCurrentValue += amount;
            }
            xvstTEMP = newCurrentValue.toLocaleString();
            localStorage.setItem('xvstTEMP', xvstTEMP);
            updateText('temp');
            $$("Temporary Value Updated and Displayed");
        }
    });

    // Initialize
    if (localStorage.getItem('xvstDATA')) {
        xvstDATA = JSON.parse(localStorage.getItem('xvstDATA'));
        updateText('api');
        $$("Real Value Displayed");
    } else {
        // Prompt logic for the first time
        xvstDATA = {};
        xvstDATA.apiKEY = prompt("Requires Full Torn API Key to calculate vault logs:");
        xvstDATA.yourVALUE = prompt("Please enter your value:");
        $$("Prompted");

        const response = await $.get(`https://api.torn.com/key/?selections=info&key=${xvstDATA.apiKEY}`);
        if (response.access_type !== "Full Access") {
            $$("API is not Full Access");
            alert("Error: Requires Full Torn API Key");
            return;
        }
        $$("API verified");

        const logData = await $.get(`https://api.torn.com/user/?selections=log&cat=138&from=0&to=*&key=${xvstDATA.apiKEY}`);
        const logID = Object.keys(logData.log)[0];
        if (!logID) {
            $$("Could not Verify Log ID");
            alert("Error: API is Full but Could not retrieve logID");
            return;
        }
        $$("First Log ID verified");

        xvstDATA.logID = logID;
        localStorage.setItem('xvstDATA', JSON.stringify(xvstDATA));
        $$("Prompts Saved to Storage");
    }

    startObserver();
    $$("Script execution completed");
})();
