// ==UserScript==
// @name          Flat Earth Travel
// @description   Changes the Mercator projection for the Gleason's projection and adds Flat Earth videos when traveling
// @author        XeiDaMoKa [2373510]
// @version       3.5
// @icon          https://i.imgur.com/BRwykI5.jpg
// @match         https://www.torn.com/travelagency.php
// @match         https://www.torn.com/index.php
// @homepageURL   https://www.xeidamoka.com/torn/scripts/flat-earth-travel
// @updateURL     https://github.com/XeiDaMoKa/Torn-Scripts/raw/Xei/TamperMonkey/Flat-Earth-Travel.user.js
// @supportURL    https://github.com/XeiDaMoKa/Torn-Scripts/issues
// @grant        GM_addStyle
// ==/UserScript==

/* global $ */

$(document).ready(function() {
    $('.travel-map').css({
        'background': 'url("https://i.imgur.com/HA2uCZa.jpg")'
    });

    $('.d .travel-agency .to-cayman').empty().append('<img src="https://i.imgur.com/S9Rmxvf.png" style="width: 30px; height: 30px;">').css({
        'background': 'none',
        'top': '280px',
        'left': '387px'
    });

    GM_addStyle(`
        .d .travel-agency .raceway.active {
            left: 383px !important;
            top: 272px !important
        }
        .d .travel-agency .raceway.mexico {
            left: 363px !important;
            top: 269px !important
        }
        .d .travel-agency .raceway.cayman {
            left: 406px !important;
            top: 282px !important
        }
        .d .travel-agency .raceway.canada {
            left: 399px !important;
            top: 250px !important
        }
        .d .travel-agency .raceway.hawaii {
            left: 299px !important;
            top: 250px !important
        }
        .d .travel-agency .raceway.uk {
            left: 445px !important;
            top: 177px !important
        }
        .d .travel-agency .raceway.argentina {
            left: 477px !important;
            top: 313px !important
        }
        .d .travel-agency .raceway.switzerland {
            left: 451px !important;
            top: 159px !important
        }
        .d .travel-agency .raceway.japan {
            left: 314px !important;
            top: 129px !important
        }
        .d .travel-agency .raceway.china {
            left: 341px !important;
            top: 114px !important
        }
        .d .travel-agency .raceway.uae {
            left: 432px !important;
            top: 91px !important
        }
        .d .travel-agency .raceway.south-africa {
            left: 514px !important;
            top: 93px !important
        }
    `);


    var $newElement1 = $('.tt-travel').clone();
    var $newElement2 = $('.tt-travel').clone();
 // Store original content
    var originalStageContent = $('.stage').clone();

    // Add a flag to indicate if the playlist or video is showing
    $newElement1.data('mediaShowing', false);
    $newElement2.data('mediaShowing', false);

    // Change the class, id, and inner HTML as needed
    $newElement1.attr('aria-labelledby', 'playlist');
    $newElement1.html('<img src="https://i.imgur.com/hZVj2dj.jpg" width="16" height="16" style="margin-right: 5px; margin-top: 4px;"><span>Flat Earth Playlist</span>');

    $newElement2.attr('aria-labelledby', 'video');
    $newElement2.html('<img src="https://i.imgur.com/hZVj2dj.jpg" width="16" height="16" style="margin-right: 5px; margin-top: 4px;"><span>Flat Earth 24/7</span>');

    // Append the new elements to the list
    $('#top-page-links-list').append($newElement1);
    $('#top-page-links-list').append($newElement2);

    // Add click event to the new elements
    $newElement1.on('click', function(e) {
        e.preventDefault();

        // Check if the playlist is currently showing
        if ($newElement1.data('mediaShowing')) {
            // If it is, replace the iframe with the original stage content
            $('iframe').replaceWith(originalStageContent);
            // Update the flag
            $newElement1.data('mediaShowing', false);
        } else {
            // If it's not, replace the original stage content with the iframe
            $('.stage').replaceWith('<iframe width="775" height="525" src="https://www.youtube.com/embed/videoseries?list=PLfmX6IOmyvlitUQyCKv5K5vEB-9dShlxu" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
            // Update the flag
            $newElement1.data('mediaShowing', true);
        }
    });

    $newElement2.on('click', function(e) {
        e.preventDefault();

        // Check if the video is currently showing
        if ($newElement2.data('mediaShowing')) {
            // If it is, replace the iframe with the original stage content
            $('iframe').replaceWith(originalStageContent);
            // Update the flag
            $newElement2.data('mediaShowing', false);
        } else {
            // If it's not, replace the original stage content with the iframe
            $('.stage').replaceWith('<iframe width="775" height="525" src="https://www.youtube.com/embed/1n8nLj7R74I" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
            // Update the flag
            $newElement2.data('mediaShowing', true);
        }
    });
});