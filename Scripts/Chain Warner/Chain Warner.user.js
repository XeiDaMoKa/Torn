// ==UserScript==
// @name         Torn Chain Warner
// @version      0.1
// @description  Check the timer and apply a flashing shadow based on the time remaining
// @author       XeiDaMoKa
// @match        https://www.torn.com/*
// ==/UserScript==

// jQuery
/* global $ */

// Change colors, times, and audio settings
const settings = {
    color1: { color: 'green', time: '4:55' },
    color2: { color: 'orange', time: '4:50' },
    color3: { color: 'red', time: '4:45' },
    audio: { audioURL: 'https://dl.sndup.net/v6zq/XeiTornMusic.mp3', time: '4:55' } // 1:42 lenght of the music
};






// Elements with visuals glowing
const elements = [
    '#header-root',
    '#sidebarroot',
    '.content-wrapper',
];

// Create an Audio element
let audio = new Audio(settings.audio.audioURL);

// Check if the sidebar timer (needs change to check if theres at least 10 hits because the timer is always present)
function checkTimer() {
    let timerElement = $(".bar-timeleft___B9RGV");

    // If the regular timer element is not found, try finding the combat page timer
    if (timerElement.length === 0) {
        timerElement = $(".labelTitle___ZtfnD span span");
    }

    // If neither timer element is found, stop the script
    if (timerElement.length === 0) {
        return;
    }

    const totalSeconds = parseTime(timerElement.text());
    const audioStartOffset = parseTime(settings.audio.time);

    // Calculate the remaining time before the audio should start
    const remainingTime = totalSeconds - audioStartOffset;

    // Check if the remaining time is below zero or above 1:42 (lenthgs of the audio), meaning the audio should start now at certain point
    if (remainingTime <= 0) {
        if (audio.paused) {
            audio.currentTime = audioStartOffset - totalSeconds;
            audio.play();
        }
    } else {
        if (!audio.paused) {
            audio.pause();
        }
    }

    // Loop through the colors depending on the timer
    if (totalSeconds > parseTime(settings.color1.time)) {
        changeColor('transparent');
    } else if (totalSeconds > parseTime(settings.color2.time)) {
        changeColor(settings.color1.color);
    } else if (totalSeconds > parseTime(settings.color3.time)) {
        changeColor(settings.color2.color);
    } else {
        changeColor(settings.color3.color);
    }
}


// Visuals Style
function changeColor(color) {
    $('#breathe-animation').remove();

    if (color !== 'transparent') {
        const style = $('<style>')
            .attr('id', 'breathe-animation')
            .html(`
                @keyframes breathe {
                    0% { box-shadow: 0 0 5px ${color}; }
                    20% { box-shadow: 0 0 25px ${color}, 0 0 25px ${color}; }
                    50% { box-shadow: 0 0 5px ${color}; }
                    80% { box-shadow: 0 0 25px ${color}, 0 0 25px ${color}; }
                    100% { box-shadow: 0 0 5px ${color}; }
                }
            `);

        // Breathing animation
        $('head').append(style);
        for (const selector of elements) {
            $(selector).css('animation', 'breathe 5s infinite');
        }
    } else {
        // Remove transparent animation above 1:42
        for (const selector of elements) {
            $(selector).css('animation', 'none');
        }
    }
}

// Function to parse mm:ss into seconds
function parseTime(timeStr) {
    var [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

// Check timer
setInterval(checkTimer, 1000);
