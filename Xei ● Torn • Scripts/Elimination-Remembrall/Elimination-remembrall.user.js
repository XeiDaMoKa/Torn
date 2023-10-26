// ==UserScript==
// @name         Torn Chain Warner
// @version      0.1
// @description  Check the timer and apply an animated shadow based on the time remaining
// @author       XeiDaMoKa
// @match        https://www.torn.com/*
// ==/UserScript==

// jQuery
/* global $ */

// Define your color and time arrays in minutes:seconds format
var colors = ["none", "green", "orange", "red"];
var times = ["0:00", "4:55", "4:50", "4:45"];
var currentIndex = 0; // Index to track the current color

// Function to parse minutes:seconds into seconds
function parseTime(timeStr) {
    var [minutes, seconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds;
}

// Variable to hold the selected elements
var elementsToApplyShadow = $("#header-root, #sidebarroot, .content-wrapper");

// Function to apply animated shadow effect
function applyAnimatedShadow() {
    var timerElement = $(".bar-timeleft___B9RGV");
    var totalSeconds = parseTime($(".bar-timeleft___B9RGV").text());

    if (totalSeconds > parseTime(times[1])) {
        // Timer is above 4:55, no shadow
        elementsToApplyShadow.css("box-shadow", colors[0]);
    } else if (totalSeconds > parseTime(times[2])) {
        // Timer is below 4:55, green shadow
        elementsToApplyShadow.css("box-shadow", "0 0 10px " + colors[1]);
    } else if (totalSeconds > parseTime(times[3])) {
        // Timer is below 4:50, orange shadow
        elementsToApplyShadow.css("box-shadow", "0 0 10px " + colors[2]);
    } else {
        // Timer is below 4:45, apply the animated shadow
        currentIndex = (currentIndex + 1) % 3; // Cycle through 0, 1, 2 for colors
        elementsToApplyShadow.css("box-shadow", "0 0 10px " + colors[3 + currentIndex]);
    }
}

// Periodically check and apply the shadow effect
setInterval(applyAnimatedShadow, 1000); // Check every second
