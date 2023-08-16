// ==UserScript==
// @name                    Xei ● Torn • Clean SideBar
// @description         Colorizes menu icons and adds icons to Events
// @version                 0.2.6
// @author                  XeiDaMoKa [2373510]
// @icon
// @match                    https://www.torn.com/*
// @homepageURL     https://www.xeidamoka.com/torn/scripts/clean-sidebar
// @updateURL           https://github.com/XeiDaMoKa/Xei-Torn/raw/Xei/Xei%20%E2%97%8F%20Torn%20%E2%80%A2%20Scripts/Better-SideBar.user/Better-SideBar.user.js
// @supportURL          https://github.com/XeiDaMoKa/Xei-Torn/issues
// ==/UserScript==

/* global $ */

(function() {

// change background Color
    $('body').css('background-color', '#1b0025 !important');

// change font color of .h4 and .line-h24 to ff5500
    $('#h4 ').css('color', '#ff5500 !important');

    $('.line-h24').css('color', '#ff00ff !important');




    //  1º value Title / 2º value Fill Color / 3º value Stroke /  4º value Stroke Color
    // All in Alphabetical Order

    const colorizations = {

        "city": [ "#ffffff" , '1' , "#000000" ],

        "ammo_locker": [ "#777777" , '0.1' , "#000000" ],
        "auction_house": [ "#777777" , '0.1' , "#000000" ],
        "bazaar": [ "#777777" , '0.1' , "#000000" ],
        "big_als_bunker": [ "#777777" , '0.1' , "#000000" ],
        "big_als_gun_shop": [ "#777777" , '0.1' , "#000000" ],
        "bits_n_bobs": [ "#777777" , '0.1' , "#000000" ],
        "blackjack": [ "#777777" , '0.1' , "#000000" ],
        "bookie": [ "#777777" , '0.1' , "#000000" ],
        "bounties": [ "#777777" , '0.1' , "#000000" ],
        "bugs__issues": [ "#777777" , '0.1' , "#000000" ],
        "calendar": [ "#777777" , '0.1' , "#000000" ],
        "casino": [ "#777777" , '0.1' , "#000000" ],
        "church": [ "#777777" , '0.1' , "#000000" ],
        "city_bank": [ "#777777" , '0.1' , "#000000" ],
        "city_hall": [ "#777777" , '0.1' , "#000000" ],
        "classified_ads": [ "#777777" , '0.1' , "#000000" ],
        "company_forum": [ "#777777" , '0.1' , "#000000" ],
        "company_funds": [ "#777777" , '0.1' , "#000000" ],
        "craps": [ "#777777" , '0.1' , "#000000" ],
        "crimes": [ "#777777" , '0.1' , "#000000" ],
        "cyber_force": [ "#777777" , '0.1' , "#000000" ],
        "docks": [ "#777777" , '0.1' , "#000000" ],
        "donator_house": [ "#777777" , '0.1' , "#000000" ],
        "dump": [ "#777777" , '0.1' , "#000000" ],
        "education": [ "#777777" , '0.1' , "#000000" ],
        "estate_agents": [ "#777777" , '0.1' , "#000000" ],
        "faction": [ "#777777" , '0.1' , "#000000" ],
        "faction_armory": [ "#777777" , '0.1' , "#000000" ],
        "faction_controls": [ "#777777" , '0.1' , "#000000" ],
        "faction_forum": [ "#777777" , '0.1' , "#000000" ],
        "faction_warfare": [ "#777777" , '0.1' , "#000000" ],
        "forums": [ "#777777" , '0.1' , "#000000" ],
        "general_discussion": [ "#777777" , '0.1' , "#000000" ],
        "gym": [ "#777777" , '0.1' , "#000000" ],
        "hall_of_fame": [ "#777777" , '0.1' , "#000000" ],
        "high-low": [ "#777777" , '0.1' , "#000000" ],
        "home": [ "#777777" , '0.1' , "#000000" ],
        "hospital": [ "#777777" , '0.1' , "#000000" ],
        "item_market": [ "#777777" , '0.1' , "#000000" ],
        "items": [ "#777777" , '0.1' , "#000000" ],
        "jail": [ "#777777" , '0.1' , "#000000" ],
        "jewelry_store": [ "#777777" , '0.1' , "#000000" ],
        "job": [ "#777777" , '0.1' , "#000000" ],
        "job_listings": [ "#777777" , '0.1' , "#000000" ],
        "keno": [ "#777777" , '0.1' , "#000000" ],
        "loan_shark": [ "#777777" , '0.1' , "#000000" ],
        "log": [ "#777777" , '0.1' , "#000000" ],
        "logout": [ "#777777" , '0.1' , "#000000" ],
        "lottery": [ "#777777" , '0.1' , "#000000" ],
        "manage_bazaar": [ "#777777" , '0.1' , "#000000" ],
        "manage_display_case": [ "#777777" , '0.1' , "#000000" ],
        "missions": [ "#777777" , '0.1' , "#000000" ],
        "museum": [ "#777777" , '0.1' , "#000000" ],
        "my_profile": [ "#777777" , '0.1' , "#000000" ],
        "newspaper": [ "#777777" , '0.1' , "#000000" ],
        "nikeh_sports": [ "#777777" , '0.1' , "#000000" ],
        "organized_crimes": [ "#777777" , '0.1' , "#000000" ],
        "pawn_shop": [ "#777777" , '0.1' , "#000000" ],
        "personal_stats": [ "#777777" , '0.1' , "#000000" ],
        "pharmacy": [ "#777777" , '0.1' , "#000000" ],
        "points_building": [ "#777777" , '0.1' , "#000000" ],
        "points_market": [ "#777777" , '0.1' , "#000000" ],
        "poker": [ "#777777" , '0.1' , "#000000" ],
        "post_office": [ "#777777" , '0.1' , "#000000" ],
        "properties": [ "#777777" , '0.1' , "#000000" ],
        "property_vault": [ "#777777" , '0.1' , "#000000" ],
        "questions__answers": [ "#777777" , '0.1' , "#000000" ],
        "raceway": [ "#777777" , '0.1' , "#000000" ],
        "recruit_citizens": [ "#777777" , '0.1' , "#000000" ],
        "roulette": [ "#777777" , '0.1' , "#000000" ],
        "russian_roulette": [ "#777777" , '0.1' , "#000000" ],
        "settings": [ "#777777" , '0.1' , "#000000" ],
        "slots": [ "#777777" , '0.1' , "#000000" ],
        "spin_the_wheel": [ "#777777" , '0.1' , "#000000" ],
        "staff": [ "#777777" , '0.1' , "#000000" ],
        "stock_market": [ "#777777" , '0.1' , "#000000" ],
        "super_store": [ "#777777" , '0.1' , "#000000" ],
        "sweet_shop": [ "#777777" , '0.1' , "#000000" ],
        "tc_clothing": [ "#777777" , '0.1' , "#000000" ],
        "token_shop": [ "#777777" , '0.1' , "#000000" ],
        "trading_post": [ "#777777" , '0.1' , "#000000" ],
        "trades": [ "#777777" , '0.1' , "#000000" ],
        "travel_agency": [ "#777777" , '0.1' , "#000000" ],
        "tutorials__guides": [ "#777777" , '0.1' , "#000000" ],
        "visitors_center": [ "#777777" , '0.1' , "#000000" ],
        "weapon_mods": [ "#777777" , '0.1' , "#000000" ]
};

// Replace icons
    for (let [key, [fillColor, strokeWidth, strokeColor]] of Object.entries(colorizations)) {
        const $svgElement = $(`#nav-${key} .svgIconWrap___AMIqR svg`);
            $svgElement.attr('fill', fillColor);
            $svgElement.attr('stroke-width', strokeWidth);
            $svgElement.attr('stroke', strokeColor);
    }

    // Hide Information Tab
    $('.header___RpWar').hide();
})();