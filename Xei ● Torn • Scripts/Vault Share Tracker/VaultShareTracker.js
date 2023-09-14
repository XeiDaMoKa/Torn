// ==UserScript==
// @name         Torn Vault Share Tracker
// @version      0.2
// @description  Tracks your share of the vault
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/properties.php*
// ==/UserScript==
/* global $ */


(async function() {
    const $$ = console.log;
    $$("Script started");



// Step 1
// Create Storage Vars
var xvstDATA
var xvstTEMP


// Step 2
// Create Update Text
// Jquery const called textElement , empty because its just a placeholder to append things we will create next on the element .vault-cont.left .title p.m-bottom10
// const textElement = $('.vault-cont.left .title p.m-bottom10'); and empty
const textElement = $('.vault-cont.left .title p.m-bottom10');
textElement.empty();
$$("textElement PlaceHolder Created");


// Step 3
// Create Real Value Element
    const updateText {
        const textElement = $('.vault-cont.left .title p.m-bottom10');
        textElement.empty();
        textElement.append("Your Value: ");
        $('<span></span>').text(`$${isTemporary ? xvstTEMP : xvstDATA.yourVALUE}`).css({ color: isTemporary ? 'yellow' : 'green', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Your Value Created");

        const totalVaultValue = parseInt($('.wvalue').text().replace(/,/g, ''));
        const yourValue = parseInt(xvstDATA.yourVALUE.replace(/,/g, ''));
        const spouseValue = totalVaultValue - yourValue;

        textElement.append(" Spouse Value: ");
        $('<span></span>').text(`$${spouseValue.toLocaleString()}`).css({ color: 'red', fontWeight: 'bolder' }).appendTo(textElement);
        $$("Spouse Value Created");
    };










})();