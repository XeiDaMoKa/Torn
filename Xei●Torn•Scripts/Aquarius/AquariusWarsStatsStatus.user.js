// ==UserScript==
// @name         Aquarius Wars - SS
// @version      0.7
// @description  changes torn html status text for customized ones from tornstats oficial api
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/factions.php?step*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';



    function getFactionId() {
        const factionLink = document.querySelector('.opponentFactionName___vhESM');
        return factionLink ? factionLink.href.split('ID=')[1] : null;
    }



    function fetchFactionData(factionId) {
        const apiUrl = `https://www.tornstats.com/api/v2/TS_TNgBQ6rqvJMrCSGZ/spy/faction/${factionId}`;
        GM.xmlHttpRequest({
            method: "GET",
            url: apiUrl,
            onload: function(response) {
                if (response.status === 200) {
                    console.log(`Faction Data for ID ${factionId}:`, JSON.parse(response.responseText));
                } else {
                    console.error(`Failed to fetch faction data for ID ${factionId}:`, response.status);
                }
            }
        });
    }



    function handleMutations(mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const removedNodes = Array.from(mutation.removedNodes);
                addedNodes.forEach(node => {
                    if (node.querySelector && node.querySelector('.enemy-faction')) {
                        console.log('Members list appeared');
                        const factionId = getFactionId();
                        console.log(`Faction ID: ${factionId}`);
                        fetchFactionData(factionId);
                        observePlayerStatusChanges(node);
                    }
                });
                removedNodes.forEach(node => {
                    if (node.querySelector && node.querySelector('.enemy-faction')) {
                        console.log('Members list disappeared');
                    }
                });
            }
        }
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
                            const factionId = getFactionId();
                            console.log(`Player: ${playerName}, ID: ${playerId}, Faction: ${factionId}, Status: ${currentStatus}`);
                            fetchFactionData(factionId);
                        }
                    }
                });
                statusObserver.observe(statusNode, config);
            }
        });
    }



    const observer = new MutationObserver(handleMutations);
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
    document.querySelectorAll('.enemy-faction').forEach(observePlayerStatusChanges);
    console.log('Aquarius Wars - SS script loaded');
})();
