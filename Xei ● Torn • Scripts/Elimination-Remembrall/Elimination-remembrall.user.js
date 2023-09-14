// ==UserScript==
// @name         Elimination Remembrall
// @description  Glows colors to remember you to attack on the last minutes of elimination
// @author        XeiDaMoKa [2373510]
// @version      1.0
// @match        https://www.torn.com/*
// @homepageURL   https://www.xeidamoka.com/torn/scripts/elimination-remembrall
// @updateURL     https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%20%E2%97%8F%20Torn%20%E2%80%A2%20Scripts/Elimination-Remembrall/Elimination-remembrall.user.js
// @downloadURL    https://github.com/XeiDaMoKa/Xei-Torn/blob/Xei/Xei%20●%20Torn%20•%20Scripts/Elimination-Remembrall/Elimination-remembrall.user.js
// @supportURL    https://github.com/XeiDaMoKa/Torn-Scripts/issues
// ==/UserScript==

(function() {
    'use strict';

    // Edit these settings as needed (color, minutes, seconds)
    const settings = {
        green: { color: '#00FF00', minutes: [27, 57], seconds: 30 },
        orange: { color: '#FFA500', minutes: [29, 59], seconds: 0 },
        red: { color: '#FF0000', minutes: [29, 59], seconds: 50 },
        default: { color: 'transparent', minutes: [29, 59], seconds: 59 } // Default color
    };

    const elements = [
        '#header-root',
        '#sidebarroot',
        '.content-wrapper.summer',
        '._chat-box-wrap_1pskg_111'
    ];

    const changeShadowColor = (color) => {
        // Remove existing animation style
        const existingStyle = document.getElementById('breathe-animation');
        if (existingStyle) existingStyle.remove();

        // Add new animation style
        const style = document.createElement('style');
        style.id = 'breathe-animation';
        style.innerHTML = `
            @keyframes breathe {
                0% { box-shadow: 0 0 5px ${color}; }
                50% { box-shadow: 0 0 20px ${color}, 0 0 30px ${color}; }
                100% { box-shadow: 0 0 5px ${color}; }
            }
        `;
        document.head.appendChild(style);

        for (const selector of elements) {
            const element = document.querySelector(selector);
            if (element) {
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'breathe 1s infinite';
            }
        }
    };

    const setImmediateColor = () => {
        const now = new Date();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        const totalMinutes = currentMinutes + currentSeconds / 60;

        for (const [key, { color, minutes, seconds }] of Object.entries(settings)) {
            for (const minute of minutes) {
                if (totalMinutes >= minute + seconds / 60 && totalMinutes < minute + 2 + seconds / 60) {
                    changeShadowColor(color);
                    return;
                }
            }
        }
    };

    const setTimers = () => {
        for (const [key, { color, minutes, seconds }] of Object.entries(settings)) {
            for (const minute of minutes) {
                const now = new Date();
                const currentMinutes = now.getMinutes();
                const currentSeconds = now.getSeconds();
                let timeoutMinutes = minute - currentMinutes;
                if (timeoutMinutes < 0) {
                    timeoutMinutes += 60; // Next hour
                }
                const timeout = (timeoutMinutes * 60 + seconds - currentSeconds) * 1000;

                setTimeout(() => {
                    changeShadowColor(color);
                    setInterval(() => changeShadowColor(color), 60 * 60 * 1000);
                }, timeout);
            }
        }
    };

    // Set the shadow color immediately based on the current time
    setImmediateColor();

    // Then set timers for future changes
    setTimers();
})();
