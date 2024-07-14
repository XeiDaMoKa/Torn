// ==UserScript==
// @name         Aquarius Chain Watchers
// @version      1.0
// @description  Displays who's currently watching the chain in the header of the faction chat with easy status edit.
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/*
// @homepageURL   https://https://xeidamoka.com/AquariusChainWatchers
// @homepageURL   https://github.com/XeiDaMoKa/Xei-Torn/edit/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusChainWatchers.user.js
// @downloadURL   https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusChainWatchers.user.js
// @updateURL     https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%E2%97%8FTorn%E2%80%A2Scripts/Aquarius/AquariusChainWatchers.user.js
// @supportURL    https://github.com/XeiDaMoKa/Xei-Torn-Aquarius-Scripts/issues
//@require             C:\Users\XeiDaMoKa\OneDrive\● XeiDaMoKa •\🧑‍💻 • CoDeS •\Xei-Torn\Xei●Torn•Scripts\Aquarius\AquariusChainWatchers.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* global $ */

(function() {
    'use strict';

	const $$ = console.log;
	const $$$ = console.error;
	const $$$$ = console.groupCollapsed;
	const $$$$$ = console.groupEnd;

	const integrationToken = 'secret_53NwQj7UfjNqYVCbZAM91gVC0KX1Pxl9rx1wGIsdGt0';
	const databaseId = 'a2f366e80c9e43ca898bec09750ebb75';

	let isHeaderVisible = false;
	let observerInitialized = false;
	let playerName;
	let currentPlayerStatus;

	function init() {
		observeHeaderChanges();
		const websocketData = document.getElementById('websocketConnectionData').textContent;
		const playerData = JSON.parse(websocketData);
		const imgElement = document.querySelector('img.mini-avatar-image');
		const imgSrc = imgElement.getAttribute('src');
		const fileName = imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
		const cleanedFileName = fileName.replace(/^48X48_/, '');
		const profileImageUrl = `https://profileimages.torn.com/${cleanedFileName}`;
		playerName = playerData.playername;
		checkIfPlayerExistsInDB(playerName, profileImageUrl);
				setInterval(fetchAllPlayers, 60000);
}



    function checkIfPlayerExistsInDB(playerName, profileImage) {
        const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
        const headers = {
            'Authorization': `Bearer ${integrationToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
        const requestData = JSON.stringify({
            "filter": {
                "property": "title",
                "title": {
                    "contains": playerName
                }
            }
        });
        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            headers: headers,
            data: requestData,
            responseType: "json",
            onload: function(response) {
                $$('Database query response:', response.response);
                if (response.response.error) {
                    $$$('Error querying Notion database:', response.response.error);
                } else {
                    if (response.response.results && response.response.results.length > 0) {
                        $$(`Player ${playerName} exists in the database.`);
                        if (!observerInitialized) {
                            observeHeaderChanges();
                        }
                    } else {
                        $$(`Player ${playerName} does not exist in the database.`);
                        savePlayerToDB(playerName, profileImage);
                    }
                }
            },
            onerror: function(error) {
                $$$('Error querying Notion database:', error);
            }
        });
    }

function savePlayerToDB(playerName, profileImage) {
    const createEntryUrl = 'https://api.notion.com/v1/pages';
    const headers = {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    };
    const dataToSend = {
        "parent": {
            "database_id": databaseId
        },
        "properties": {
            "title": {
                "title": [
                    {
                        "text": {
                            "content": playerName
                        }
                    }
                ]
            },
            "Image": {
                "type": "url",
                "url": profileImage // Profile image URL
            },
            "Status": {
                "type": "select",
                "select": {
                    "name": "🔴 Off"
                }
            }
        },
        "cover": {
            "type": "external",
            "external": {
                "url": profileImage // Set profile image as the cover image
            }
        }
    };
    GM_xmlhttpRequest({
        method: "POST",
        url: createEntryUrl,
        headers: headers,
        data: JSON.stringify(dataToSend),
        responseType: "json",
        onload: function(response) {
            $$('New entry created in Notion database:', response.response);
            if (!observerInitialized) {
                observeHeaderChanges();
            }
        },
        onerror: function(error) {
            $$$('Error creating entry in Notion database:', error);
        }
    });
}



	    function observeHeaderChanges() {
        const chatArea = document.querySelector('body');
        if (!chatArea) return;
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                const headerElement = document.querySelector('.chat-box-header___P15jw');
                if (headerElement && headerElement.textContent.includes('Faction')) {
                    if (!isHeaderVisible) {
                        $$('Faction chat header is visible.');
                        isHeaderVisible = true;
                        loadPlayersFromLocalStorage();
                        fetchAllPlayers();
                    }
                } else {
                    if (isHeaderVisible) {
                        $$('Faction chat header is not visible.');
                        isHeaderVisible = false;
                    }
                }
            });
        });
        const config = { childList: true, subtree: true };
        observer.observe(chatArea, config);
        observerInitialized = true;
    }

function loadPlayersFromLocalStorage() {
    const allPlayers = JSON.parse(localStorage.getItem('allPlayers') || '[]');

    if (allPlayers.length > 0) {
        // Process current player
        const currentPlayer = allPlayers.find(player => player.playerName === playerName);
        if (currentPlayer) {
            currentPlayerStatus = currentPlayer.status;
            updatePlayerImage(currentPlayer.profileImage, currentPlayer.status, currentPlayer.playerName, true, true);
        }

        // Process other players
        const otherPlayers = allPlayers.filter(player => player.playerName !== playerName && player.status !== '🔴 Off');
        const sortedPlayers = sortPlayersByStatus(otherPlayers);

        const actionsContainer = document.querySelector('.chat-box-header__actions___XuOq2');
        if (actionsContainer) {
            Array.from(actionsContainer.querySelectorAll('img')).forEach(img => {
                if (img.title !== playerName) {
                    img.remove();
                }
            });
        }

        sortedPlayers.forEach(player => {
            updatePlayerImage(player.profileImage, player.status, player.playerName, false, true);
        });
    } else {
        $$('No players data in local storage.');
    }
}





function fetchAllPlayers() {
    const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const headers = {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    };
    const requestData = JSON.stringify({
        "filter": {
            "and": [
                {
                    "property": "Name",
                    "title": {
                        "is_not_empty": true
                    }
                },
                {
                    "property": "Name",
                    "title": {
                        "does_not_contain": "Session"
                    }
                }
            ]
        }
    });

    GM_xmlhttpRequest({
        method: "POST",
        url: apiUrl,
        headers: headers,
        data: requestData,
        responseType: "json",
        onload: function(response) {
            console.log('All players query response:', response.response);
            if (response.response.error) {
                console.error('Error querying Notion database for players:', response.response.error);
                return;
            }
            if (response.response.results && response.response.results.length > 0) {
                const allPlayers = [];
                response.response.results.forEach((player, index) => {
                    if (player.properties) {
                        const playerData = player.properties;
                        const playerName = playerData.Name.title[0].text.content;
                        const profileImage = playerData.Image.url;
                        const status = playerData.Status.select.name;

                        allPlayers.push({ playerName, profileImage, status });
                    }
                });

                // Save to local storage
                localStorage.setItem('allPlayers', JSON.stringify(allPlayers));

                // Process current player
                const currentPlayer = allPlayers.find(player => player.playerName === playerName);
                if (currentPlayer) {
                    currentPlayerStatus = currentPlayer.status;
                    updatePlayerImage(currentPlayer.profileImage, currentPlayer.status, currentPlayer.playerName, true);
                }

                // Process other players
                const otherPlayers = allPlayers.filter(player => player.playerName !== playerName && player.status !== '🔴 Off');
                const sortedPlayers = sortPlayersByStatus(otherPlayers);

                const actionsContainer = document.querySelector('.chat-box-header__actions___XuOq2');
                if (actionsContainer) {
                    Array.from(actionsContainer.querySelectorAll('img')).forEach(img => {
                        if (img.title !== playerName) {
                            img.remove();
                        }
                    });
                }

                sortedPlayers.forEach(player => {
                    // Inside the forEach loop where you process players
                    updatePlayerImage(player.profileImage, player.status, player.playerName, player.playerName === playerName, false);
                });
            } else {
                console.log('No valid players found in the database.');
            }
        },
        onerror: function(error) {
            console.error('Error querying Notion database for players:', error);
        }
    });
}





    function displayPopup(clickedPlayerName) {
        const existingPopups = document.querySelectorAll('.player-popup');
        existingPopups.forEach(popup => popup.remove());

        const popupDiv = document.createElement('div');
        popupDiv.classList.add('player-popup');
        popupDiv.style.cssText = `
            font-weight: bold;
            position: fixed;
            background-color: #1a0025;
            color: #ffffff;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1000;
            text-align: center;
            width: auto;
            border: 2px solid #333;
        `;

        const nameDiv = document.createElement('div');
        nameDiv.textContent = clickedPlayerName;
        nameDiv.style.marginBottom = '15px';
        popupDiv.appendChild(nameDiv);

        // Check if the clicked player is the current player
        if (clickedPlayerName === playerName) {
            const statusButtons = [
                { text: '🟢 Watch', color: '#00ff00' },
                { text: '🟠 Break', color: '#ff5500' },
                { text: '🔴 Off', color: '#ff0000' }
            ];

            statusButtons.forEach(status => {
                if (status.text !== currentPlayerStatus) {
                    const statusButton = document.createElement('button');
                    statusButton.textContent = status.text;
                    statusButton.style.cssText = `
                        display: block;
                        margin: 5px 0;
                        color: ${status.color};
                        border: 1.5px solid ${status.color};
                        background: none;
                        padding: 5px;
                        font-weight: bold;
                        border-radius: 5px;
                        font-size: 12px;
                        cursor: pointer;
                        width: 100%;
                        box-sizing: border-box;
                        white-space: nowrap;
                        transition: background-color 0.3s, border-color 0.3s;
                    `;

                    statusButton.addEventListener('mouseenter', function() {
                        statusButton.style.boxShadow = `inset 0 0 0 2px ${status.color}`;
                    });

                    statusButton.addEventListener('mouseleave', function() {
                        statusButton.style.boxShadow = 'none';
                    });

                    statusButton.addEventListener('click', function() {
                        updatePlayerStatusinDB(clickedPlayerName, status.text);
                        popupDiv.remove();
                    });

                    popupDiv.appendChild(statusButton);
                }
            });
        }

        document.body.appendChild(popupDiv);

        const clickedImage = event.target;
        const rect = clickedImage.getBoundingClientRect();
        const imageCenterX = rect.left + rect.width / 2;
        const imageTop = rect.top - popupDiv.offsetHeight - 10;
        const popupLeft = imageCenterX - popupDiv.offsetWidth / 2 - 5;

        popupDiv.style.top = `${imageTop}px`;
        popupDiv.style.left = `${popupLeft}px`;

        const clickOutsideHandler = function(event) {
            if (!popupDiv.contains(event.target) && !clickedImage.contains(event.target)) {
                popupDiv.remove();
                document.removeEventListener('click', clickOutsideHandler);
            }
        };

        document.addEventListener('click', clickOutsideHandler);
    }



function updatePlayerStatusinDB(playerName, status) {
    const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const headers = {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    };
    const requestData = JSON.stringify({
        "filter": {
            "property": "title",
            "title": {
                "contains": playerName
            }
        }
    });
    GM_xmlhttpRequest({
        method: "POST",
        url: apiUrl,
        headers: headers,
        data: requestData,
        responseType: "json",
        onload: function(response) {
            if (response.response.results && response.response.results.length > 0) {
                const playerId = response.response.results[0].id;
                const updateUrl = `https://api.notion.com/v1/pages/${playerId}`;
                const updateData = {
                    "properties": {
                        "Status": {
                            "type": "select",
                            "select": {
                                "name": status
                            }
                        }
                    }
                };
                GM_xmlhttpRequest({
                    method: "PATCH",
                    url: updateUrl,
                    headers: headers,
                    data: JSON.stringify(updateData),
                    responseType: "json",
                    onload: function(updateResponse) {
                        $$(`Player ${playerName} status updated to ${status}`);
                        if (status === '🟢 Watch') {
                            createWatchEntry(playerName);
                        } else if (status === '🟠 Break' || status === '🔴 Off') {
                            updateEndDate(playerName);
                        }
                        fetchAllPlayers();
                    },
                    onerror: function(updateError) {
                        $$$('Error updating player status:', updateError);
                    }
                });
            } else {
                $$('Player not found in the database.');
            }
        },
        onerror: function(error) {
            $$$('Error fetching player data:', error);
        }
    });
}



function createWatchEntry(playerName) {
    const createEntryUrl = 'https://api.notion.com/v1/pages';
    const headers = {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    };
    const currentDate = new Date();
    const sessionTitle = `Session`;

    // You need to query your database to find the playerId first
    const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const requestData = JSON.stringify({
        "filter": {
            "property": "Name",
            "title": {
                "contains": playerName
            }
        }
    });

    GM_xmlhttpRequest({
        method: "POST",
        url: apiUrl,
        headers: headers,
        data: requestData,
        responseType: "json",
        onload: function(response) {
            if (response.response.results && response.response.results.length > 0) {
                const playerId = response.response.results[0].id;

                // Now create the watch entry with the correct Parent Item relation
                const dataToSend = {
                    "parent": {
                        "database_id": databaseId
                    },
                    "properties": {
                        "Name": {
                            "title": [
                                {
                                    "text": {
                                        "content": sessionTitle
                                    }
                                }
                            ]
                        },
                        "Parent Item": {
                            "relation": [
                                {
                                    "id": playerId
                                }
                            ]
                        },
                        "Start Date": {
                            "date": {
                                "start": currentDate.toISOString()
                            }
                        }
                    }
                };

                GM_xmlhttpRequest({
                    method: "POST",
                    url: createEntryUrl,
                    headers: headers,
                    data: JSON.stringify(dataToSend),
                    responseType: "json",
                    onload: function(response) {
                        $$('New Watch entry created in Notion database:', response.response);
                    },
                    onerror: function(error) {
                        $$$('Error creating Watch entry in Notion database:', error);
                    }
                });
            } else {
                $$$('Error: Player not found in the database for relation property.');
            }
        },
        onerror: function(error) {
            $$$('Error querying Notion database for player relation:', error);
        }
    });
}


function updateEndDate(playerName) {
    const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const headers = {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    };

    // Query to get the player page ID first
    const playerRequestData = JSON.stringify({
        "filter": {
            "property": "Name",
            "title": {
                "contains": playerName
            }
        }
    });

    GM_xmlhttpRequest({
        method: "POST",
        url: apiUrl,
        headers: headers,
        data: playerRequestData,
        responseType: "json",
        onload: function(playerResponse) {
            if (playerResponse.response.results && playerResponse.response.results.length > 0) {
                const playerId = playerResponse.response.results[0].id;

                // Now query for sessions with no End Date and the found playerId as Parent Item
                const sessionRequestData = JSON.stringify({
                    "filter": {
                        "and": [
                            {
                                "property": "Parent Item",
                                "relation": {
                                    "contains": playerId
                                }
                            },
                            {
                                "property": "End Date",
                                "date": {
                                    "is_empty": true
                                }
                            }
                        ]
                    }
                });

                GM_xmlhttpRequest({
                    method: "POST",
                    url: apiUrl,
                    headers: headers,
                    data: sessionRequestData,
                    responseType: "json",
                    onload: function(sessionResponse) {
                        if (sessionResponse.response.results && sessionResponse.response.results.length > 0) {
                            const sessionId = sessionResponse.response.results[0].id;
                            const updateUrl = `https://api.notion.com/v1/pages/${sessionId}`;
                            const currentDate = new Date();
                            const updateData = {
                                "properties": {
                                    "End Date": {
                                        "date": {
                                            "start": currentDate.toISOString()
                                        }
                                    }
                                }
                            };

                            GM_xmlhttpRequest({
                                method: "PATCH",
                                url: updateUrl,
                                headers: headers,
                                data: JSON.stringify(updateData),
                                responseType: "json",
                                onload: function(updateResponse) {
                                    $$(`End Date for session of player ${playerName} updated to ${currentDate.toISOString()}`);
                                },
                                onerror: function(updateError) {
                                    $$$('Error updating End Date:', updateError);
                                }
                            });
                        } else {
                            $$('No session found without End Date for player.');
                        }
                    },
                    onerror: function(sessionError) {
                        $$$('Error querying Notion database for sessions:', sessionError);
                    }
                });
            } else {
                $$('Player not found in the database.');
            }
        },
        onerror: function(playerError) {
            $$$('Error querying Notion database for player:', playerError);
        }
    });
}


function updatePlayerImage(profileImage, status, playerName, isCurrentPlayer, isRotating = false) {
    let borderColor;
    switch (status) {
        case '🟢 Watch': borderColor = '#00ff00'; break;
        case '🟠 Break': borderColor = '#ff5500'; break;
        case '🔴 Off': borderColor = '#ff0000'; break;
    }
    const actionsContainer = document.querySelector('.chat-box-header__actions___XuOq2');
    if (!actionsContainer) {
        console.error('Actions container not found in faction chat header.');
        return;
    }
    let imgElement = Array.from(actionsContainer.querySelectorAll('img')).find(img => img.title === playerName);
    if (imgElement) {
        imgElement.src = profileImage;
        imgElement.style.border = `1.75px solid ${borderColor}`;
        imgElement.classList.toggle('rotating', isRotating);
    } else {
        imgElement = document.createElement('img');
        imgElement.src = profileImage;
        imgElement.title = playerName;
        imgElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1.75px solid ${borderColor};
            vertical-align: middle;
            margin-right: 10px;
            cursor: pointer;
        `;
        if (isRotating) {
            imgElement.classList.add('rotating');
        }
        imgElement.addEventListener('click', function(event) {
            event.stopPropagation();
            displayPopup(playerName);
        });
        if (isCurrentPlayer) {
            const buttonElement = actionsContainer.querySelector('.chat-box-header__action-wrapper___SCl9f');
            if (buttonElement) {
                buttonElement.style.marginRight = '10px';
                actionsContainer.insertBefore(imgElement, buttonElement);
            } else {
                actionsContainer.appendChild(imgElement);
            }
        } else {
            const firstImgElement = actionsContainer.querySelector('img');
            if (firstImgElement) {
                actionsContainer.insertBefore(imgElement, firstImgElement);
            } else {
                actionsContainer.appendChild(imgElement);
            }
        }
    }
    $$(`Updated/Added image for player ${playerName} with status: ${status}`);
}

    function sortPlayersByStatus(players) {
        return players.sort((a, b) => {
            const statusOrder = {
                '🟢 Watch': 0,
                '🟠 Break': 1,
                '🔴 Off': 2
            };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }



const style = document.createElement('style');
style.textContent = `
    @keyframes rotate-counter {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
    }
    .rotating {
        animation: rotate-counter 2s linear infinite;
    }
`;
document.head.appendChild(style);




    init();
})();
