// ==UserScript==
// @name         Torn Vault Share Tracker (Combined)
// @version      0.4
// @description  Tracks your share of the vault
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/properties.php*
// ==/UserScript==
/* global $ */

(async function() {
    const $$ = console.log;
    $$("Script started");

    var xvstDATA;
    var xvstTEMP;

    // Function to show the loading element
    const showLoader = () => {
        const textElement = $('.vault-cont.left .title p.m-bottom10');
        textElement.empty();
        $('<span></span>').addClass('ajax-preloader').css({'left': 'auto','margin': '0'}).appendTo(textElement);
        $$("Loader Created");
    };

    // Function to update the text on the page
    const updateText = (isTemporary = false) => {
        const textElement = $('.vault-cont.left .title p.m-bottom10');
        textElement.empty();
        textElement.append("Your Value: ");
        $('<span></span>').text(`$${isTemporary ? xvstTEMP : xvstDATA.yourVALUE}`).css({ color: isTemporary ? 'yellow' : 'green', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Your Value Created");

        const totalVaultValue = parseInt($('.wvalue').text().replace(/,/g, ''));
        const yourValue = parseInt(xvstDATA.yourVALUE.replace(/,/g, ''));
        const spouseValue = totalVaultValue - yourValue;

        textElement.append(" Spouse Value: ");
        $('<span></span>').text(`$${spouseValue.toLocaleString()}`).css({ color: 'red', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Spouse Value Created");
    };

    // Function to start the observer
    const startObserver = () => {
        const observer = new MutationObserver(async () => {
            observer.disconnect();
            $$("Observer disconnected");
            showLoader();
            await updateRealValue();
            $$("Real Value Displayed");
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        $$("Observer started");
    };

    // Function to update the real value
    const updateRealValue = async () => {
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
        updateText(false);
    };

    // Function to update the temporary value
    const updateTemporaryValue = (event) => {
        const target = event.target;
        const formElement = target.closest('form');
        const inputElement = formElement.querySelector('.input-money');
        const amount = parseInt(inputElement.value.replace(/,/g, ''), 10);

        let newCurrentValue = parseInt(xvstDATA.yourVALUE.replace(/,/g, ''), 10);

        if (target.value === 'WITHDRAW') {
            newCurrentValue -= amount;
        } else if (target.value === 'DEPOSIT') {
            newCurrentValue += amount;
        }

        xvstTEMP = newCurrentValue.toLocaleString();
        localStorage.setItem('xvstTEMP', xvstTEMP);
        updateText(true);
    };

    // Initialize
    if (localStorage.getItem('xvstDATA')) {
        xvstDATA = JSON.parse(localStorage.getItem('xvstDATA'));
        startObserver(); // Start the observer to update the real value
    } else {
        xvstDATA = {};
        xvstDATA.apiKEY = prompt("Requires Full Torn API Key to calculate vault logs:");
        xvstDATA.yourVALUE = prompt("Please enter your value:");
        $$("Prompted");
        localStorage.setItem('xvstDATA', JSON.stringify(xvstDATA));
        updateText(false); // Display the real value right away
    }

    // Add click event listener for transactions
    document.addEventListener('click', async (event) => {
        const target = event.target;
        $$("Listening for Transactions");
        if (target && (target.value === 'WITHDRAW' || target.value === 'DEPOSIT')) {
            updateTemporaryValue(event);
            $$("Temporary Value Updated");
            startObserver(); // Start the observer again to update the temporary value
        }
    });
})();
