// ==UserScript==
// @name         Trackmania Timings
// @version      0.1
// @description  Fetch and display personal best, medal timings, and time difference for Trackmania tracks
// @author       XeiDaMoKa
// @match        https://www.trackmania.com/*
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    function timeToSeconds(time) {
        const parts = time.split(/[:.]/).map(Number);
        let minutes = 0, seconds = 0, milliseconds = 0;
        if (parts.length === 3) {
            [minutes, seconds, milliseconds] = parts;
        } else {
            [seconds, milliseconds] = parts;
        }
        return (minutes * 60 + seconds) + milliseconds / 1000;
    }

    function secondsToTime(seconds) {
        seconds = Math.abs(seconds);
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        const fullSeconds = Math.floor(seconds);
        const milliseconds = Math.round((seconds - fullSeconds) * 1000);
        return `${minutes.toString().padStart(2, '0')}:${fullSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
function disableAllButtons() {
    $('#btnAll').prop('disabled', true);
    $('#btnHideEmpty').prop('disabled', true);
    $('#btnHideAuthor').prop('disabled', true);
    $('#btnSortTime').prop('disabled', true);
    $('#btnSortPercent').prop('disabled', true);
}

function enableAllButtons() {
    $('#btnAll').prop('disabled', false);
    $('#btnHideEmpty').prop('disabled', false);
    $('#btnHideAuthor').prop('disabled', false);
    $('#btnSortTime').prop('disabled', false);
    $('#btnSortPercent').prop('disabled', false);
}

    const customCSS = `
<style>
    .btn:focus {
        box-shadow: none !important;
    }
    .btn.shadow-toggle, .btn.shadow-toggle:focus {
        box-shadow: 0 0 5px 4px #005d41 !important;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .tracks-loading::before {
        content: "";
        position: absolute;
        top: calc(50% - 62.5px);
        left: 50%;
        width: 40px;
        height: 40px;
        border: 3px solid #84fbae;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 5px 5px #005d41;
    }
</style>

    `;
    $('head').append(customCSS);

    async function fetchSeason(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    const data = $(new DOMParser().parseFromString(response.responseText, 'text/html'));
                    const tracks = data.find('.col.p-1');
                    resolve(tracks);
                },
                onerror: function(err) {
                    reject(err);
                }
            });
        });
    }

async function populateTrackData(trackDIV) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: trackDIV.find('.tm-map-card-official-link').attr('href'),
            onload: function(response) {
                const data = $(new DOMParser().parseFromString(response.responseText, 'text/html'));
                const PBtime = data.find('p.tm-map-score').text().trim();
                const authorMedalTime = data.find('ul.list-unstyled.tm-map-score li:first-child').text().trim();
                trackDIV.attr('data-author-medal-time', timeToSeconds(authorMedalTime));
                const existingHeader = trackDIV.find('.tm-map-card-official-header');

                let timeDifference;
                if (PBtime === '--:--.---') {
                    trackDIV.attr('data-gap', Infinity);
                    timeDifference = timeToSeconds(authorMedalTime);
                } else {
                    timeDifference = timeToSeconds(authorMedalTime) - timeToSeconds(PBtime);
                    trackDIV.attr('data-gap', timeDifference);
                }

                const formattedTimeDifference = secondsToTime(Math.abs(timeDifference));
                if (trackDIV.attr('data-gap') === "Infinity") {
                    trackDIV.find('.tm-map-card-official-footer > div:last-child').html(`
                        <img src="/build/images/Medals/Icon_128_Medal_Null_Dark.57d55dd1.png" height="20" style="margin-bottom: 1px;">
                        <span>--:--.---</span>
                    `);
                } else {
                    trackDIV.find('.tm-map-card-official-footer > div:last-child').html(`
                        <img src="${data.find('p.tm-map-score img').attr('src')}" height="20" style="margin-bottom: 1px;">
                        <span>${PBtime}</span>
                    `);
                }



                    const medalTimes = data.find('ul.list-unstyled.tm-map-score');
                    const formattedMedalTimes = $('<div style="position: absolute; top: 42.5%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 200px;"></div>');
                    medalTimes.find('li').each(function() {
                        const medalImg = $(this).find('img').clone().attr('height', '20').css({'display': 'inline-block', 'vertical-align': 'middle'});
                        const medalTime = $('<span>').text($(this).text().trim()).css({'display': 'inline-block','font-size': '17.5px', 'vertical-align': 'middle', 'margin-left': '5px', 'color': 'white', 'text-shadow': 'black 2px 2px 1px, black -2px -2px 1px, black 2px -2px 1px, black -2px 2px 1px', 'font-weight': 'bold'});
                        formattedMedalTimes.append(medalImg).append(medalTime).append('<br>');
                    });
                    trackDIV.find('.tm-map-card-official-img').wrap('<div style="position: relative;"></div>').parent().append(formattedMedalTimes);

                    if (trackDIV.attr('data-gap') !== Infinity) {
const percentageDifference = Math.abs((trackDIV.attr('data-gap') / parseFloat(trackDIV.attr('data-author-medal-time'))) * 100);
let formattedPercentageDifference = percentageDifference !== Infinity ? percentageDifference.toFixed(2) + '%' : '-.--';

if (trackDIV.attr('data-gap') === "Infinity") {
    existingHeader.html(`<small style="color: white;">${authorMedalTime}</small>`);
}

if (!trackDIV.find('.tm-map-card-official-footer img').attr('src').includes("Stack_Author")) {
    const percentageHeaderDiv = $(`<div class="tm-map-card-official-header" style="position: absolute; top: 10%; left: 83.5%; transform: translate(-50%, -50%);"><small>${formattedPercentageDifference}</small></div>`);
    trackDIV.find('.tm-map-card-official').append(percentageHeaderDiv);
}

if (trackDIV.attr('data-gap') !== "Infinity") {
    if (trackDIV.attr('data-gap') > 0) {
        existingHeader.html(`<small style="color: green;">${formattedTimeDifference}</small>`);
    } else {
        existingHeader.html(`<small style="color: red;">${formattedTimeDifference}</small>`);
    }

    if (trackDIV.find('.tm-map-card-official-footer img').attr('src').includes("Stack_Author")) {
        const authorImageHeaderDiv = $(`<div class="tm-map-card-official-header" style="position: absolute; top: 20%; left: 83.5%; transform: translate(-50%, -50%);"><img src="/build/images/Medals/Icon_128_Medal_Author.5f0fa372.png" height="20"></div>`);
        trackDIV.find('.tm-map-card-official').append(authorImageHeaderDiv);
    }
}




                        if (trackDIV.find('.tm-map-card-official-footer img').attr('src').includes("Stack_Author")) {
                            const authorImageHeaderDiv = $(`<div class="tm-map-card-official-header" style="position: absolute; top: 30%; left: 83.5%; transform: translate(-50%, -50%);"><img src="/build/images/Medals/Icon_128_Medal_Author.5f0fa372.png" height="20"></div>`);
                            trackDIV.find('.tm-map-card-official').append(authorImageHeaderDiv);
                        } else {
                            const percentageHeaderDiv = $(`<div class="tm-map-card-official-header" style="position: absolute; top: 40%; left: 83.5%; transform: translate(-50%, -50%);"><small>${formattedPercentageDifference}</small></div>`);
                            trackDIV.find('.tm-map-card-official').append(percentageHeaderDiv);
                        }
                    }

                    resolve();
                }
            });
        });
    }

function sortTracks(comparator) {
    return $('.col.p-1').toArray().sort((a, b) => {
        const primaryComparison = comparator(a, b);
        if (primaryComparison !== 0) {
            return primaryComparison;
        }

        // Secondary sort by the author medal time
        const authorTimeA = parseFloat($(a).attr('data-author-medal-time'));
        const authorTimeB = parseFloat($(b).attr('data-author-medal-time'));
        return authorTimeA - authorTimeB;
    }).reverse();
}

    $(window).on('load', function() {
        const toggleButtonsHTML = `
            <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                <button id="btnAll" class="btn btn-sm btn-primary">All Seasons</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: 10px;">
                <button id="btnHideEmpty" class="btn btn-sm btn-primary">Hide Unfinished</button>
                <button id="btnHideAuthor" class="btn btn-sm btn-primary">Hide Authors</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: 10px;">
                <button id="btnSortTime" class="btn btn-sm btn-primary">Sort by Time</button>
                <button id="btnSortPercent" class="btn btn-sm btn-primary">Sort by %</button>
            </div>
        `;
        $('.row.d-flex.justify-content-center.mt-3').append(toggleButtonsHTML);

let emptyTracksHidden = false;
$('#btnHideEmpty').click(function() {
    $(this).toggleClass('shadow-toggle');
    if ($(this).hasClass('shadow-toggle')) {
        $('.col.p-1').each(function() {
            const trackDIV = $(this);
            if (trackDIV.attr('data-gap') === "Infinity") {
                trackDIV.hide();
            }
        });
        emptyTracksHidden = true;
    } else {
        $('.col.p-1').show();
        emptyTracksHidden = false;
    }

    if ($('#btnHideAuthor').hasClass('shadow-toggle')) {
        $('.col.p-1').each(function() {
            const trackDIV = $(this);
            if (trackDIV.find('.tm-map-card-official-footer img').attr('src').includes("Stack_Author")) {
                trackDIV.hide();
            }
        });
    }

    $(this).blur();
});


        let authorTracksHidden = false;
 $('#btnHideAuthor').click(function() {
    $(this).toggleClass('shadow-toggle');
    if ($(this).hasClass('shadow-toggle')) {
        $('.col.p-1').each(function() {
            const trackDIV = $(this);
            if (trackDIV.find('.tm-map-card-official-footer img').attr('src').includes("Stack_Author")) {
                trackDIV.hide();
            }
        });
        authorTracksHidden = true;
    } else {
        $('.col.p-1').show();
        authorTracksHidden = false;
    }

    if ($('#btnHideEmpty').hasClass('shadow-toggle')) {
        $('.col.p-1').each(function() {
            const trackDIV = $(this);
            if (trackDIV.attr('data-gap') === "Infinity") {
                trackDIV.hide();
            }
        });
    }

    $(this).blur();
});


        const btnSortTime = $('#btnSortTime');
        const btnSortPercent = $('#btnSortPercent');

        let originalOrder = $('.col.p-1').toArray();

btnSortTime.click(function() {
    btnSortPercent.removeClass('shadow-toggle');
    $(this).toggleClass('shadow-toggle');

    if ($(this).hasClass('shadow-toggle')) {
        const sortedTracks = sortTracks((a, b) => {
            const gapA = parseFloat($(a).attr('data-gap') || Infinity);
            const gapB = parseFloat($(b).attr('data-gap') || Infinity);
            const headerTimeA = timeToSeconds($(a).find('.tm-map-card-official-header small').text());
            const headerTimeB = timeToSeconds($(b).find('.tm-map-card-official-header small').text());

            if (gapA === Infinity && gapB === Infinity) return headerTimeA - headerTimeB;
            if (gapA === Infinity) return 1;
            if (gapB === Infinity) return -1;
            return gapA - gapB;
        });
        $('.col.p-1').parent().append(sortedTracks);
    } else {
        $('.col.p-1').parent().append(originalOrder);
    }
    $(this).blur();
});

btnSortPercent.click(function() {
    btnSortTime.removeClass('shadow-toggle');
    $(this).toggleClass('shadow-toggle');

    if ($(this).hasClass('shadow-toggle')) {
        const sortedTracks = sortTracks((a, b) => {
            const gapA = parseFloat($(a).attr('data-gap') || Infinity);
            const gapB = parseFloat($(b).attr('data-gap') || Infinity);
            const headerTimeA = timeToSeconds($(a).find('.tm-map-card-official-header small').text());
            const headerTimeB = timeToSeconds($(b).find('.tm-map-card-official-header small').text());
            const authorTimeA = parseFloat($(a).attr('data-author-medal-time'));
            const authorTimeB = parseFloat($(b).attr('data-author-medal-time'));
            const percentageA = (gapA / authorTimeA) * 100;
            const percentageB = (gapB / authorTimeB) * 100;

            if (gapA === Infinity && gapB === Infinity) return headerTimeA - headerTimeB;
            if (gapA === Infinity) return 1;
            if (gapB === Infinity) return -1;
            return percentageA - percentageB;
        });
        $('.col.p-1').parent().append(sortedTracks);
    } else {
        $('.col.p-1').parent().append(originalOrder);
    }
    $(this).blur();
});

        $('.col.p-1').each(function() {
            const trackDIV = $(this);
            populateTrackData(trackDIV);
        });

        let defaultTracks = null;
        let allSeasonsViewActive = false;

$('#btnAll').click(async function() {
    disableAllButtons();

    $(this).toggleClass('shadow-toggle');
    const parentContainer = $('.col.p-1').parent();

    if (allSeasonsViewActive) {
        parentContainer.empty().append(defaultTracks);
        $(this).text('All Seasons');
        allSeasonsViewActive = false;
        parentContainer.removeClass('tracks-loading');
    } else {
        if (!defaultTracks) {
            defaultTracks = $('.col.p-1').clone();
        }

        parentContainer.empty().addClass('tracks-loading'); // Add the loading class

        const seasonsURLs = [
                    "https://www.trackmania.com/campaigns/2020/summer",
                    "https://www.trackmania.com/campaigns/2020/fall",
                    "https://www.trackmania.com/campaigns/2021/winter",
                    "https://www.trackmania.com/campaigns/2021/spring",
                    "https://www.trackmania.com/campaigns/2021/summer",
                    "https://www.trackmania.com/campaigns/2021/fall",
                    "https://www.trackmania.com/campaigns/2022/winter",
                    "https://www.trackmania.com/campaigns/2022/spring",
                    "https://www.trackmania.com/campaigns/2022/summer",
                    "https://www.trackmania.com/campaigns/2022/fall",
                    "https://www.trackmania.com/campaigns/2023/winter",
                    "https://www.trackmania.com/campaigns/2023/spring",
                    "https://www.trackmania.com/campaigns/2023/summer"
        ];

        const allTrackDataPromises = []; // Store promises for each track's data fetch

        for (const url of seasonsURLs.reverse()) {
            await fetchSeason(url).then(tracks => {
                parentContainer.prepend(tracks);
                tracks.each(function() {
                    const trackDIV = $(this);
                    allTrackDataPromises.push(populateTrackData(trackDIV));
                });
            });
        }

        await Promise.all(allTrackDataPromises);
enableAllButtons();

        $(this).text('Default View');
        allSeasonsViewActive = true;
        parentContainer.removeClass('tracks-loading');
    }
});
    });
})();
