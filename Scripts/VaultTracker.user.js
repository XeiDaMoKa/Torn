// ==UserScript==
// @name         Torn - Vault Tracker
// @version      1.0
// @description  Keeps track of yours and your spouse's transactions. Fixed reset behavior.
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/properties.php*
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'torn_vault_equity_data';
    let isProcessing = false;
    let setupDismissed = false;

    function saveTrackerData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function loadTrackerData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
    }

    function formatMoney(num) {
        const sign = num < 0 ? "-" : "";
        return sign + "$" + Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function isVaultShared() {
        const sharingEnableRadio = document.getElementById('radio-enable-sharing');
        return sharingEnableRadio && sharingEnableRadio.checked;
    }

    function runLogic() {
        if (isProcessing || setupDismissed || !document.querySelector('.vault-trans-list') || !isVaultShared()) {
            const display = document.getElementById('equity-display-custom');
            const originalP = document.getElementById('vault-wvalue')?.closest('p');
            if (display && !isVaultShared()) {
                display.style.display = 'none';
                if (originalP) originalP.style.display = 'block';
            }
            return;
        }

        const totalSpan = document.getElementById('vault-wvalue');
        const entries = Array.from(document.querySelectorAll('li[transaction_id]'));
        if (!totalSpan || entries.length === 0) return;

        isProcessing = true;
        let data = loadTrackerData();
        const currentVaultTotal = parseInt(totalSpan.innerText.replace(/[$,\s+]/g, '').split('=')[0]) || 0;

        // 1. Initial Setup
        if (!data) {
            let input = prompt("Enter Spouse Vault Balance:", "0");
            if (input === null) {
                setupDismissed = true;
                isProcessing = false;
                return;
            }
            const spouseBalance = parseInt(input.replace(/,/g, '')) || 0;
            const myName = document.querySelector('script[playername]')?.getAttribute('playername') || "Unknown";
            data = {
                myName: myName,
                myValue: currentVaultTotal - spouseBalance,
                spouseValue: spouseBalance,
                lastTransactionId: entries[0].getAttribute('transaction_id'),
                previousAnchorId: entries[0].getAttribute('transaction_id')
            };
            saveTrackerData(data);
        }

        const entryIds = entries.map(el => el.getAttribute('transaction_id'));
        const lastKnownIndex = entryIds.indexOf(data.lastTransactionId);
        let statusColor = "green";
        let statusText = "";

        if (lastKnownIndex !== -1) {
            const toProcess = entries.slice(0, lastKnownIndex).reverse();
            if (toProcess.length > 0) {
                data.previousAnchorId = data.lastTransactionId;
                toProcess.forEach(el => {
                    const user = el.querySelector('.user.name')?.innerText || "";
                    const type = el.querySelector('.type')?.innerText.trim() || "";
                    const amount = parseInt(el.querySelector('.amount')?.innerText.replace(/[$,\s+]/g, '')) || 0;
                    const isMe = user.toLowerCase() === data.myName.toLowerCase();
                    const mult = (type === "Deposit" || type === "Received") ? 1 : -1;

                    if (isMe) data.myValue += (amount * mult);
                    else data.spouseValue += (amount * mult);
                });
                data.lastTransactionId = entries[0].getAttribute('transaction_id');
                saveTrackerData(data);
            }
            const diff = currentVaultTotal - (data.myValue + data.spouseValue);
            if (diff !== 0) {
                statusColor = "orange";
                statusText = ` (Mismatch: ${formatMoney(diff)})`;
            }
        } else {
            statusColor = "red";
            statusText = " (Needs Scroll)";
        }

        // 2. UI Update: Header
        let display = document.getElementById('equity-display-custom');
        const originalP = totalSpan.closest('p');
        if (!display && originalP) {
            display = document.createElement('p');
            display.id = 'equity-display-custom';
            display.className = "m-top10";
            originalP.after(display);
            originalP.style.display = 'none';
        }

        if (display) {
            display.style.display = 'block';
            display.innerHTML = `
                <span style="color: ${data.myValue < 0 ? 'red' : '#fff'}">${formatMoney(data.myValue)}</span>
                <span style="color:#888"> + </span>
                <span style="color: ${data.spouseValue < 0 ? 'red' : '#fff'}">${formatMoney(data.spouseValue)}</span>
                <span style="color:#888"> = </span>
                <span style="font-weight: bold; color: ${statusColor};">${formatMoney(currentVaultTotal)}</span>
                <span style="color: ${statusColor}; font-size: 0.8em; margin-left: 5px;">${statusText}</span>
            `;
        }

        // 3. UI Update: Row Coloring
        entries.forEach(el => {
            const id = el.getAttribute('transaction_id');
            const balanceEl = el.querySelector('.balance');
            if (id === data.lastTransactionId || id === data.previousAnchorId) {
                if (balanceEl) {
                    balanceEl.style.color = "green";
                    balanceEl.style.fontWeight = "bold";
                }
            } else if (balanceEl) {
                balanceEl.style.color = "";
                balanceEl.style.fontWeight = "normal";
            }
        });

        isProcessing = false;
    }

    setInterval(runLogic, 800);

    // Reset Button
    setInterval(() => {
        if (!isVaultShared() || document.getElementById('vault-equity-reset') || !document.querySelector('.options-wrap')) return;
        const wrap = document.querySelector('.options-wrap');
        const li = document.createElement('li');
        li.className = 'to-share';
        li.id = 'vault-equity-reset';
        li.innerHTML = `
            <input type="radio" id="radio-reset-tracker" class="radio-css" name="share" value="reset">
            <label for="radio-reset-tracker" class="marker-css">Reset Vault Tracker Script</label>
        `;
        li.onclick = (e) => {
            e.preventDefault();
            if(confirm("Clear storage and start over?")) {
                isProcessing = true;
                setupDismissed = true;
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
            }
        };
        wrap.appendChild(li);
    }, 1500);
})();
