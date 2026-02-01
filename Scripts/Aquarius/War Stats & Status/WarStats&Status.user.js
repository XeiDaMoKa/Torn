// ==UserScript==
// @name         Aquarius - War Stats & Status
// @description  Adds custom stats column from Aquarius wartable with detailed tooltips and customizes status text using TornStats API
// @author       XeiDaMoKa [2373510] - Enhanced by Claude & Grok
// @version      1.7.2
// @icon         https://xeidamoka.com/Torn/Scripts/Aquarius/AWSSlogo.jpg
// @match        https://www.torn.com/factions.php?step*
// @homepageURL  https://xeidamoka.com/AquariusWarStats&Status
// @homepageURL  https://github.com/XeiDaMoKa/Torn/blob/Xei/Scripts/Aquarius/WarStats%26Status.user.js
// @downloadURL  https://github.com/XeiDaMoKa/Torn/raw/Xei/Scripts/Aquarius/WarStats&Status.user.js
// @updateURL    https://github.com/XeiDaMoKa/Torn/raw/Xei/Scripts/Aquarius/WarStats&Status.user.js
// @supportURL   https://github.com/XeiDaMoKa/Torn/issues
// @grant        GM_xmlhttpRequest
// @connect      aquarius.cosiso.nl
// @connect      tornstats.com
// ==/UserScript==

(function() {
'use strict';
const $$ = console.log;
const $$$ = console.error;

// Custom Tooltip Setup
const customTooltip = document.createElement('div');
customTooltip.id = 'awss-tooltip';
document.body.appendChild(customTooltip);

const customTooltipStyle = document.createElement('style');
customTooltipStyle.textContent = `
#awss-tooltip {
  position: fixed;
  background-color: #1a0025;
  color: #fff;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ff5500;
  box-shadow: 0 5px 20px rgba(0,0,0,0.8);
  pointer-events: none;
  display: none;
  z-index: 99999;
  max-width: 300px;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  opacity: 0;
  transition: opacity 0.2s;
}
#awss-tooltip::after {
  content: "";
  position: absolute;
  left: 50%;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent;
}
#awss-tooltip.above::after {
  top: 100%;
  border-top-color: #1a0025;
}
#awss-tooltip.below::after {
  bottom: 100%;
  border-bottom-color: #1a0025;
}
#awss-tooltip strong {
  color: #ff5500;
}
#awss-tooltip hr {
  border: 0;
  height: 1px;
  background: rgba(255, 85, 0, 0.3);
  margin: 10px 0;
}
`;
document.head.appendChild(customTooltipStyle);

function showCustomTooltip(element, contentHTML) {
  const tooltip = document.getElementById('awss-tooltip');
  if (!tooltip) return;

  tooltip.innerHTML = contentHTML;

  // Temporarily show off-screen to measure
  tooltip.style.display = 'block';
  tooltip.style.left = '-9999px';
  tooltip.style.top = '-9999px';
  tooltip.style.opacity = '0';

  const tooltipRect = tooltip.getBoundingClientRect();
  const elemRect = element.getBoundingClientRect();

  // Preferred: above
  let topPos = elemRect.top + window.scrollY - tooltipRect.height - 20;
  let leftPos = elemRect.left + window.scrollX + elemRect.width / 2 - tooltipRect.width / 2;
  let direction = 'above';

  // If not enough space above, show below
  if (topPos < window.scrollY) {
    topPos = elemRect.bottom + window.scrollY + 20;
    direction = 'below';
  }

  // Horizontal bounds
  if (leftPos < window.scrollX + 10) leftPos = window.scrollX + 10;
  if (leftPos + tooltipRect.width > window.scrollX + window.innerWidth - 10) {
    leftPos = window.scrollX + window.innerWidth - tooltipRect.width - 10;
  }

  tooltip.style.top = `${topPos}px`;
  tooltip.style.left = `${leftPos}px`;
  tooltip.className = direction;
  tooltip.style.opacity = '1';
}

function hideCustomTooltip() {
  const tooltip = document.getElementById('awss-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }
}

const sheetId = '1lIoY2N29Hsk9gylT02pyWD-qaLZrHSN1tR0nU5u4JzQ';
let apiTS;
function getApiKey() {
  const storedApiKey = localStorage.getItem('tornStatsApiKey');
  if (storedApiKey) {
    return storedApiKey;
  }
  const userApiKey = prompt("Aquarius - War Stats & Status - Please enter your TornStats API key:[](https://tornstats.com/settings/general)");
  if (userApiKey) {
    localStorage.setItem('tornStatsApiKey', userApiKey);
    return userApiKey;
  }
  return null;
}
function initializeApiKey() {
  apiTS = getApiKey();
  if (!apiTS) {
    alert("TornStats API key is required for this script to function properly, Refresh page.");
    return false;
  }
  return true;
}
if (!initializeApiKey()) {
  return;
}

let membersData = {};
let playerStats = {};
let unmatchedStatuses = 0;
let scheduledFetch = null;
let lastFetchTime = 0;
const STORAGE_KEY = 'playerStatsStates';

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

const emojiColorMap = {
  '⚪': '',
  '🔵': 'blue',
  '🟢': 'green',
  '🟡': 'yellow',
  '🟠': 'orange',
  '🔴': 'red',
  '🟣': 'purple',
  '⚫': 'black'
};

const countryFlagMap = {
  'United Kingdom': 'uk',
  'South Africa': 'south_africa',
  'Cayman Islands': 'cayman',
};

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

function updateStoredState(playerId, emoji) {
  const states = getStoredStates();
  if (emoji) {
    states[playerId] = emoji;
  } else {
    delete states[playerId];
  }
  setStoredStates(states);
}

// ENHANCED: Fetch all stat columns from Aquarius table
function fetchAquariusStats() {
  const url = 'https://aquarius.cosiso.nl/index.php/wars/estimates';
  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function(response) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.responseText, 'text/html');
      const table = doc.querySelector('#wartable');
      playerStats = {};
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 9) {
            const nameCell = cells[0];
            const link = nameCell.querySelector('a[href*="XID="]');
            if (!link) return;
            const href = link.getAttribute('href');
            const idMatch = href.match(/XID=(\d+)/);
            if (!idMatch) return;
            const playerId = idMatch[1];
            const level = parseInt(cells[2].innerText.replace(/,/g, '')) || 0;
            const ff = parseFloat(cells[3].innerText.replace(/,/g, '')) || 0;
            const spies = parseFloat(cells[4].innerText.replace(/,/g, '')) || 0;
            const average = parseFloat(cells[5].innerText.replace(/,/g, '')) || 0;
            const ffscouter = parseFloat(cells[6].innerText.replace(/,/g, '')) || 0;
            const bsp = parseFloat(cells[7].innerText.replace(/,/g, '')) || 0;
            const energy = parseFloat(cells[8].innerText.replace(/,/g, '')) || 0;
            const estimates = [spies, average, ffscouter, bsp];
            const maxEstimate = Math.max(...estimates);
            if (maxEstimate > 0) {
              playerStats[playerId] = {
                level: level,
                ff: ff,
                spies: spies * 1e6,
                average: average * 1e6,
                ffscouter: ffscouter * 1e6,
                bsp: bsp * 1e6,
                energy: energy,
                max: maxEstimate * 1e6
              };
            }
          }
        });
      }
      $$('[AWSS] Fetched stats for', Object.keys(playerStats).length, 'players');
      updateStatsCells();
    },
    onerror: function(error) {
      console.error('Error fetching Aquarius wartable:', error);
    }
  });
}

function fetchFactionData(factionId) {
  const now = Date.now();
  lastFetchTime = now;
  const apiUrl = `https://www.tornstats.com/api/v2/${apiTS}/spy/faction/${factionId}`;
  GM_xmlhttpRequest({
    method: "GET",
    url: apiUrl,
    onload: function(response) {
      if (response.status === 200) {
        const data = JSON.parse(response.responseText);
        $$(`[AWSS] API`, data);
        membersData = data.faction.members;
        updatePlayerStatuses();
        fetchAquariusStats();
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
  width: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
  box-sizing: border-box !important;
  padding: 5px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
.status {
  width: 55px !important;
  min-width: 55px !important;
}
.attack {
  width: 55px !important;
  min-width: 55px !important;
}
.level {
  width: 30px !important;
  min-width: 30px !important;
}
.white-grad > div {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}
.stats-column {
  position: relative;
  cursor: pointer;
  width: 45px !important;
  min-width: 45px !important;
}
.color-palette {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-top: 0;
}
.color-palette span {
  font-size: 18px;
  transition: transform 0.1s;
  padding: 2px;
}
.color-palette span:hover {
  transform: scale(1.2);
}
`;
  listContainer.appendChild(style);
}

// ENHANCED: Update stats cells with custom HTML tooltip (reorganized, level removed, colors matched to palette)
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
          statsCell.textContent = formatTotal(stats.max);

          const tooltipHTML = `
<strong>Energy:</strong> ${stats.energy}<br>
<hr>
<strong>Spies:</strong> ${formatTotal(stats.spies)}<br>
<strong>Average:</strong> ${formatTotal(stats.average)}<br>
<strong>FFScouter:</strong> ${formatTotal(stats.ffscouter)}<br>
<strong>BSP:</strong> ${formatTotal(stats.bsp)}<br>
<strong>Max Estimate:</strong> ${formatTotal(stats.max)}<br>
<hr>
<strong>FF:</strong> ${stats.ff.toFixed(2)}
`;

          statsCell.onmouseenter = function() {
            showCustomTooltip(this, tooltipHTML);
          };
          statsCell.onmouseleave = function() {
            hideCustomTooltip();
          };
        } else {
          statsCell.textContent = 'N/A';
          statsCell.onmouseenter = null;
          statsCell.onmouseleave = null;
        }

        if (storedStates[playerId]) {
          applyState(statsCell, emojiColorMap[storedStates[playerId]]);
        }
        addColorSelectionListener(statsCell, playerId);
      }
    }
  });
}

function addColorSelectionListener(element, playerId) {
  element.addEventListener('click', function(event) {
    event.stopPropagation();
    showColorPalette(element, playerId);
  });
}

let currentPalette = null;
function showColorPalette(element, playerId) {
  if (currentPalette) {
    currentPalette.remove();
  }
  const palette = document.createElement('div');
  palette.className = 'color-palette';
  palette.style.position = 'absolute';
  palette.style.zIndex = '9999';
  palette.style.background = '#1a0025';
  palette.style.border = '1px solid #ff5500';
  palette.style.padding = '5px';
  palette.style.borderRadius = '5px';
  palette.style.display = 'flex';
  palette.style.flexDirection = 'row';
  Object.keys(emojiColorMap).forEach(emoji => {
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = emoji;
    emojiSpan.style.cursor = 'pointer';
    emojiSpan.style.margin = '0 2px';
    emojiSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      applyState(element, emojiColorMap[emoji]);
      updateStoredState(playerId, emoji);
      palette.remove();
      currentPalette = null;
    });
    palette.appendChild(emojiSpan);
  });
  document.body.appendChild(palette);
  const rect = element.getBoundingClientRect();
  palette.style.position = 'fixed';
  setTimeout(() => {
    const paletteRect = palette.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2) - (paletteRect.width / 2);
    palette.style.left = `${centerX}px`;
    palette.style.top = `${rect.bottom}px`;
    if (centerX < 0) {
      palette.style.left = '5px';
    } else if (centerX + paletteRect.width > window.innerWidth) {
      palette.style.left = `${window.innerWidth - paletteRect.width - 5}px`;
    }
    if (rect.bottom + paletteRect.height > window.innerHeight) {
      palette.style.top = `${rect.top - paletteRect.height}px`;
    }
  }, 0);
  const closePalette = (e) => {
    if (!palette.contains(e.target) && e.target !== element) {
      palette.remove();
      currentPalette = null;
      document.removeEventListener('click', closePalette);
      document.removeEventListener('scroll', closePalette);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closePalette);
    document.addEventListener('scroll', closePalette);
  }, 0);
  currentPalette = palette;
}

function applyState(element, color) {
  element.style.color = color;
  element.style.fontWeight = color ? 'bold' : 'normal';
}

function addAttackHoldFunctionality() {
  const attackButtons = document.querySelectorAll('.attack a');
  attackButtons.forEach(button => {
    let timer;
    let isHolding = false;
    button.addEventListener('mousedown', (e) => {
      isHolding = false;
      timer = setTimeout(() => {
        isHolding = true;
        const userId = button.href.split('user2ID=')[1];
        showAttackIframe(userId, () => { isHolding = false; });
      }, 1000);
    });
    button.addEventListener('mouseup', (e) => {
      clearTimeout(timer);
      if (isHolding) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    button.addEventListener('mouseleave', () => {
      clearTimeout(timer);
    });
    button.addEventListener('click', (e) => {
      if (isHolding) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });
}

function showAttackIframe(userId, onClose) {
  const existingIframe = document.getElementById('attack-iframe-container');
  if (existingIframe) {
    existingIframe.remove();
  }
  const container = document.createElement('div');
  container.id = 'attack-iframe-container';
  container.style.position = 'fixed';
  container.style.top = '10px';
  container.style.right = '10px';
  container.style.zIndex = '999999';
  container.style.width = '1025px';
  container.style.height = '491px';
  const iframe = document.createElement('iframe');
  iframe.id = 'attack-iframe';
  iframe.src = `https://www.torn.com/loader.php?sid=attack&user2ID=${userId}`;
  iframe.style.width = '977px';
  iframe.style.height = '490px';
  iframe.style.border = '2px solid #ff5500';
  container.appendChild(iframe);
  document.body.appendChild(container);
  const closeIframe = () => {
    container.remove();
    document.removeEventListener('click', handleOutsideClick);
    if (onClose) onClose();
  };
  const handleOutsideClick = (event) => {
    if (!container.contains(event.target)) {
      closeIframe();
    }
  };
  document.addEventListener('click', handleOutsideClick);
  iframe.addEventListener('load', () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDocument) {
      const style = iframeDocument.createElement('style');
      style.textContent = `
body {
  margin: 0;
  overflow: hidden;
  height: 100%;
}
html {
  height: 100%;
}
#header-root, #chatRoot, .appHeaderWrapper___uyPti, .logStatsWrap___ujaj_, .log___HL_LJ {
  display: none !important;
}
.content-wrapper {
  margin: 0 !important;
}
`;
      iframeDocument.head.appendChild(style);
    }
  });
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
          addAttackHoldFunctionality();
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

function addResetApiKeyButton() {
  const leaveBtn = document.querySelector('a.quit-job');
  if (!leaveBtn) return;
  const resetBtn = leaveBtn.cloneNode(true);
  resetBtn.classList.remove('quit-job');
  resetBtn.classList.add('reset-warstats');
  resetBtn.setAttribute('href', '#');
  resetBtn.setAttribute('aria-labelledby', 'reset-warstats');
  resetBtn.querySelector('.link-icon-svg').classList.remove('quit-job');
  resetBtn.querySelector('span#quit-job').id = 'reset-warstats';
  resetBtn.querySelector('span#reset-warstats').textContent = 'Reset War Stats & Status';
  resetBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('tornStatsApiKey');
    alert('TornStats API key removed. Please reload the page.');
    location.reload();
  });
  leaveBtn.parentNode.insertBefore(resetBtn, leaveBtn.nextSibling);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addResetApiKeyButton);
} else {
  addResetApiKeyButton();
}
})();
