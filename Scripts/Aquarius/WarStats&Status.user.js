// ==UserScript==
// @name         Aquarius - War Stats & Status
// @version      1.1
// @description  Adds custom stats column from Google Sheet and customizes status text using TornStats API
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/factions.php?step*
// @icon            https://www.xeidamoka.com/Torn/Scripts/Aquarius/ACWlogo.jpg
// @homepageURL   https://github.com/XeiDaMoKa/Xei-Torn/blob/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusWarsStatsStatus.user.js
// @downloadURL   https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusWarsStatsStatus.user.js
// @updateURL     https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusWarsStatsStatus.user.js
// @supportURL    https://github.com/XeiDaMoKa/Xei-Torn/issues
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const $$ = console.log;
    const $$$ = console.error;

    let membersData = {};
    let playerStats = {};
    let unmatchedStatuses = 0;
    let scheduledFetch = null;
    let lastFetchTime = 0;

    const STORAGE_KEY = 'playerStatsStates';

    const countryFlagMap = {
        'United Kingdom': 'uk',
        'South Africa': 'south_africa',
        'Cayman Islands': 'cayman',
    };

    function getFactionId() {
        const factionLink = document.querySelector('.opponentFactionName___vhESM');
        return factionLink ? factionLink.href.split('ID=')[1] : null;
    }

    function parseCSV(csv) {
        const rows = csv.split('\n');
        return rows.map(row => {
            const columns = [];
            let inQuotes = false;
            let currentColumn = '';
            for (let i = 0; i < row.length; i++) {
                if (row[i] === '"') {
                    inQuotes = !inQuotes;
                } else if (row[i] === ',' && !inQuotes) {
                    columns.push(currentColumn.trim());
                    currentColumn = '';
                } else {
                    currentColumn += row[i];
                }
            }
            columns.push(currentColumn.trim());
            return columns;
        });
    }

    function createFlagSvg(country) {
        let flagName = country.toLowerCase();
        if (countryFlagMap[country]) {
            flagName = countryFlagMap[country];
        } else {
            flagName = flagName.replace(/\s+/g, '').replace(/[^a-z]/g, '');
        }
        return `<img src="https://www.torn.com/images/v2/travel_agency/flags/fl_${flagName}.svg" alt="${country}" style="height: 16px; vertical-align: middle;">`;
    }

    function formatTotal(total) {
        if (total >= 1e9) {
            const billions = total / 1e9;
            return billions.toFixed(1).replace(/\.0$/, '') + 'b';
        } else if (total >= 1e6) {
            return Math.floor(total / 1e6) + 'm';
        } else if (total >= 1e3) {
            return Math.floor(total / 1e3) + 'k';
        } else {
            return total.toString();
        }
    }

    function parseStatValue(statString) {
        const multipliers = { 'k': 1e3, 'm': 1e6, 'b': 1e9 };
        const match = statString.match(/^(\d+(?:\.\d+)?)([kmb])?$/i);
        if (match) {
            const [, num, unit] = match;
            return parseFloat(num) * (multipliers[unit?.toLowerCase()] || 1);
        }
        return 0;
    }

    function getStoredStates() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    function setStoredStates(states) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    }

    function updateStoredState(playerId, color) {
        const states = getStoredStates();
        if (color) {
            states[playerId] = color;
        } else {
            delete states[playerId];
        }
        setStoredStates(states);
    }

    function fetchFactionData(factionId) {
        const now = Date.now();
        lastFetchTime = now;
        const apiUrl = `https://www.tornstats.com/api/v2/TS_TNgBQ6rqvJMrCSGZ/spy/faction/${factionId}`;
        GM.xmlHttpRequest({
            method: "GET",
            url: apiUrl,
            onload: function(response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    $$(`[AWSS] API`, data);
                    membersData = data.faction.members;
                    updatePlayerStatuses();
                    fetchSheetData();
                } else {
                    $$$(`Failed to fetch faction data for ID ${factionId}:`, response.status);
                    scheduleNextFetchIfNeeded();
                }
            },
            onerror: function(error) {
                $$$("Error fetching faction data:", error);
                scheduleNextFetchIfNeeded();
            }
        });
    }

    function fetchSheetData() {
        $$('[AWSS] Fetching sheet data...');
        const sheetId = '1rZPGL3wB2J3L0EI3D1AKI4bQy0XW7SXkfthVAYJCxXQ';
        const sheetName = 'Sheet1';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
        GM.xmlHttpRequest({
            method: 'GET',
            url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            onload: function(response) {
                if (response.status === 200) {
                    const data = parseCSV(response.responseText);
                    processSheetData(data);
                } else {
                    console.error('Failed to fetch sheet data');
                }
            },
            onerror: function(error) {
                console.error('Error fetching sheet data:', error);
            }
        });
    }

    function processSheetData(data) {
        playerStats = {};
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 7) {
                const nameWithId = row[0];
                const strength = parseFloat(row[2].replace(/,/g, ''));
                const defense = parseFloat(row[3].replace(/,/g, ''));
                const speed = parseFloat(row[4].replace(/,/g, ''));
                const dexterity = parseFloat(row[5].replace(/,/g, ''));
                const total = parseFloat(row[6].replace(/,/g, ''));
                const match = nameWithId.match(/\[(\d+)\]/);
                if (match) {
                    const id = match[1];
                    playerStats[id] = {
                        strength,
                        defense,
                        speed,
                        dexterity,
                        total
                    };
                }
            }
        }
        updateStatsCells();
    }

    function updatePlayerStatuses() {
        const playerNodes = document.querySelectorAll('.enemy');
        let statusesCustomized = 0;
        unmatchedStatuses = 0;
        playerNodes.forEach(playerNode => {
            const statusNode = playerNode.querySelector('.status');
            if (statusNode) {
                const playerName = playerNode.querySelector('.honor-text:not(.honor-text-svg)').innerText.trim();
                const playerId = new URL(playerNode.querySelector('.honorWrap___BHau4 a').href).searchParams.get('XID');
                const member = membersData[playerId];
                if (member) {
                    const statusClasses = statusNode.className.split(' ');
                    const currentStatus = statusClasses[2].toLowerCase();
                    const apiState = member.status.state.toLowerCase();
                    if (apiState === 'okay' && currentStatus === 'okay') {
                        statusNode.textContent = 'Alive';
                        statusesCustomized++;
                    } else if (['hospital', 'jail', 'federal'].includes(apiState) && apiState === currentStatus) {
                        const releaseTime = member.status.until;
                        const countdownTimer = createCountdownTimer(releaseTime);
                        statusNode.textContent = '';
                        statusNode.appendChild(countdownTimer);
                        statusesCustomized++;
                    } else if (apiState === 'abroad' && currentStatus === 'abroad') {
                        const country = member.status.description.split('In ')[1];
                        statusNode.innerHTML = `In &nbsp;${createFlagSvg(country)}`;
                        statusesCustomized++;
                    } else if (apiState === 'traveling' && currentStatus === 'traveling') {
                        const description = member.status.description;
                        if (description.startsWith('Traveling to')) {
                            const country = description.split('Traveling to ')[1];
                            statusNode.innerHTML = `to &nbsp;${createFlagSvg(country)}`;
                        } else if (description.startsWith('Returning to Torn from')) {
                            const country = description.split('Returning to Torn from ')[1];
                            statusNode.innerHTML = `to &nbsp;${createFlagSvg('torn')}`;
                        }
                        statusesCustomized++;
                    } else if (apiState === currentStatus) {
                        statusesCustomized++;
                    } else {
                        unmatchedStatuses++;
                        $$(`[AWSS] ${playerName} ${currentStatus} X ${apiState}`);
                    }
                }
            }
        });
        $$(`[AWSS] ${unmatchedStatuses} Unmatched`);
        $$(`[AWSS] ${statusesCustomized} Updated`);
        scheduleNextFetchIfNeeded();
    }

    function scheduleNextFetchIfNeeded() {
        clearTimeout(scheduledFetch);
        if (unmatchedStatuses > 0) {
            $$("[AWSS] Scheduling 5 seconds");
            scheduledFetch = setTimeout(() => {
                const factionId = getFactionId();
                if (factionId) {
                    fetchFactionData(factionId);
                }
            }, 5000);
        } else {
            scheduledFetch = null;
        }
    }

function createCountdownTimer(targetTimestamp) {
    const countdownContainer = document.createElement('span');
    countdownContainer.classList.add('countdown-timer');
    let countdownInterval;
    targetTimestamp -= 3;
    const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = targetTimestamp - now;
        if (timeRemaining <= 0) {
            countdownContainer.textContent = '0';
            clearInterval(countdownInterval);
        } else {
                const seconds = timeRemaining % 60;
                const minutes = Math.floor((timeRemaining / 60) % 60);
                const hours = Math.floor((timeRemaining / 3600) % 24);
                const days = Math.floor(timeRemaining / 86400);
                const weeks = Math.floor(days / 7);
                const months = Math.floor(days / 30.44);
                const years = Math.floor(days / 365.25);
                let timeString = '';
                if (years > 0) {
                    timeString = `${years} Year${years > 1 ? 's' : ''}`;
                } else if (months > 0) {
                    timeString = `${months} Month${months > 1 ? 's' : ''}`;
                } else if (weeks > 0) {
                    timeString = `${weeks} Week${weeks > 1 ? 's' : ''}`;
                } else if (days > 0) {
                    timeString = `${days}d ${hours}:${padZero(minutes)}:${padZero(seconds)}`;
                } else if (hours > 0) {
                    timeString = `${hours}:${padZero(minutes)}:${padZero(seconds)}`;
                } else if (minutes > 0) {
                    timeString = `${minutes}:${padZero(seconds)}`;
                } else {
                    timeString = `${seconds}`;
                }
                countdownContainer.textContent = timeString;
            }
        };
        const padZero = (value) => value.toString().padStart(2, '0');
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
        return countdownContainer;
    }

    function observePlayerStatusChanges(parentNode) {
        const playerNodes = parentNode.querySelectorAll('.enemy');
        playerNodes.forEach(playerNode => {
            const statusNode = playerNode.querySelector('.status');
            if (statusNode) {
                const config = { attributes: true, attributeFilter: ['class'] };
                const statusObserver = new MutationObserver((mutationsList) => {
                    for (let mutation of mutationsList) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            const playerName = playerNode.querySelector('.honor-text:not(.honor-text-svg)').innerText.trim();
                            const playerId = new URL(playerNode.querySelector('.honorWrap___BHau4 a').href).searchParams.get('XID');
                            const newStatusClass = mutation.target.className;
                            const statusClasses = newStatusClass.split(' ');
                            const currentStatus = statusClasses[2];
                            $$(`[AWSS] ${playerName} changed to ${currentStatus}`);
                            const factionId = getFactionId();
                            if (factionId && !scheduledFetch) {
                                fetchFactionData(factionId);
                            }
                        }
                    }
                });
                statusObserver.observe(statusNode, config);
            }
        });
    }

    function sortPlayersByStats(ascending = true) {
        const playerList = document.querySelector('.members-list');
        const players = Array.from(playerList.querySelectorAll('.enemy'));
        players.sort((a, b) => {
            const statsCellA = a.querySelector('.stats-column');
            const statsCellB = b.querySelector('.stats-column');
            const valueA = parseStatValue(statsCellA.textContent);
            const valueB = parseStatValue(statsCellB.textContent);

            return ascending ? valueA - valueB : valueB - valueA;
        });
        players.forEach(player => playerList.appendChild(player));
    }

    function addStatsColumn(listContainer) {
        const headerRow = listContainer.querySelector('.white-grad');
        if (headerRow) {
            const statusHeader = headerRow.querySelector('.status');
            if (statusHeader) {
                const statsHeader = document.createElement('div');
                statsHeader.className = 'level left level___g3CWR tab___UztMc bs stats-column';
                statsHeader.textContent = 'Stats';
                let ascending = true;
                statsHeader.addEventListener('click', () => {
                    sortPlayersByStats(ascending);
                    ascending = !ascending;
                });
                headerRow.insertBefore(statsHeader, statusHeader);
            }
        }

        const playerRows = listContainer.querySelectorAll('.enemy');
        playerRows.forEach(row => {
            const statusCell = row.querySelector('.status');
            if (statusCell) {
                const statsCell = document.createElement('div');
                statsCell.className = 'table-cell bs level lvl left iconShow finally-bs-col stats-column';
                statsCell.textContent = 'N/A';
                row.insertBefore(statsCell, statusCell);
            }
        });
        const sortIcons = headerRow.querySelectorAll('.sortIcon___SmuX8');
        sortIcons.forEach(icon => icon.remove());
        applyConsistentStyling(listContainer);
    }

    function applyConsistentStyling(listContainer) {
        const style = document.createElement('style');
        style.textContent = `
            .stats-column, .level, .table-cell, .points, .status, .attack {
                width: 57px !important;
                min-width: 57px !important;
                max-width: 57px !important;
                box-sizing: border-box !important;
                padding: 5px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }
            .level {
                width: 39px !important;
                min-width: 39px !important;
            }
            .white-grad > div {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
            }
            .stats-column {
                position: relative;
            }
            .custom-tooltip {
                position: relative;
                cursor: pointer;
            }
            .custom-tooltip::after {
                content: attr(title);
                position: absolute;
                bottom: 100%;
                left: 50%;
                background-color: #333;
                color: white;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: normal;
                visibility: hidden;
                opacity: 0;
                z-index: 1000;
                text-align: left;
            }
            .custom-tooltip:hover::after {
                visibility: visible;
                opacity: 1;
            }
            .custom-tooltip::after p {
                margin: 0;
                padding: 2px 0;
            }
            .stats-column {
                position: relative;
                cursor: pointer;
            }
        `;
        listContainer.appendChild(style);
    }

    function updateStatsCells() {
        const storedStates = getStoredStates();
        const playerRows = document.querySelectorAll('.enemy');
        playerRows.forEach(row => {
            const profileLink = row.querySelector('a[href^="/profiles.php?XID="]');
            if (profileLink) {
                const playerId = profileLink.href.split('XID=')[1];
                const statsCell = row.querySelector('.stats-column');
                if (statsCell) {
                    if (playerStats[playerId]) {
                        const stats = playerStats[playerId];
                        statsCell.textContent = formatTotal(stats.total);
                        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        statsCell.title = `
<p>Str: ${formatNumber(stats.strength)}</p>
<p>Def: ${formatNumber(stats.defense)}</p>
<p>Spd: ${formatNumber(stats.speed)}</p>
<p>Dex: ${formatNumber(stats.dexterity)}</p>`;
                        statsCell.classList.add('custom-tooltip');
                    } else {
                        statsCell.textContent = 'N/A';
                        statsCell.title = '';
                    }
                    if (storedStates[playerId]) {
                        applyState(statsCell, storedStates[playerId]);
                    }
                    addColorCyclingListener(statsCell, playerId);
                }
            }
        });
    }

    function addColorCyclingListener(element, playerId) {
        element.addEventListener('click', function(event) {
            event.stopPropagation();
            const colors = ['', 'green', 'orange', 'red'];
            let currentColorIndex = colors.indexOf(this.style.color);
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            const newColor = colors[currentColorIndex];
            applyState(this, newColor);
            if (newColor === '') {
                updateStoredState(playerId, null);
            } else {
                updateStoredState(playerId, newColor);
            }
        });
    }

    function applyState(element, color) {
        element.style.color = color;
        element.style.fontWeight = color ? 'bold' : 'normal';
    }

    function handleMutations(mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.querySelector && node.querySelector('.enemy-faction')) {
                        $$('[AWSS] List appeared');
                        addStatsColumn(node);
                        const factionId = getFactionId();
                        fetchFactionData(factionId);
                        observePlayerStatusChanges(node);
                        const statsHeader = node.querySelector('.stats-column');
                        if (statsHeader) {
                            statsHeader.textContent = 'Stats';
                        }
                    }
                }
                for (let i = 0; i < mutation.removedNodes.length; i++) {
                    const node = mutation.removedNodes[i];
                    if (node.querySelector && node.querySelector('.enemy-faction')) {
                        $$('[AWSS] List disappeared');
                        clearTimeout(scheduledFetch);
                        scheduledFetch = null;
                    }
                }
            }
        }
    }

    const observer = new MutationObserver(handleMutations);
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
    $$('Aquarius - War Stats & Status Started');
})();
