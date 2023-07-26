// ==UserScript==
// @name          Vault & Bookie Values
// @description   Each click on the input box will cycle through values picked by you (edit the code)
// @author        XeiDaMoKa [2373510]
// @version       2.2
// @icon          https://i.imgur.com/bz2TZon.jpg
// @match         https://www.torn.com/properties.php
// @match         https://www.torn.com/page.php?sid=bookie
// @downloadURL   https://github.com/XeiDaMoKa/Torn-Scripts/raw/Xei/TamperMonkey/Flat-Earth-Travel.user.js
// @updateURL     https://github.com/XeiDaMoKa/Torn-Scripts/raw/Xei/TamperMonkey/Flat-Earth-Travel.user.js
// @homepageURL   https://www.xeidamoka.com/torn/scripts/vault-&-bookie-values
// @supportURL    https://github.com/XeiDaMoKa/Torn-Scripts/issues
// ==/UserScript==

/* global $ */

(function() {
    'use strict';

    const input_values = {
        'properties': ['100,000', '500,000', '1,051,000', '5,000,000', '10,000,000', '25,000,000', '50,000,000', '100,000,000'],
        'bookie': ['10,000', '100,000', '1,000,000', '10,000,000', '100,000,000']
    };

    let i = {
        'properties': 0,
        'bookie': 0
    };

    const page_type = window.location.href.includes('properties') ? 'properties' : 'bookie';

    $(document).on('click', 'input', function() {
        if ($(this).hasClass('input-money')) {
            $(this).val(input_values[page_type][i[page_type]]).trigger('input');
            i[page_type] = (i[page_type] + 1) % input_values[page_type].length;
        } else if ($(this).hasClass('torn-btn')) {
            i[page_type] = 0;
        }
    });
})
();