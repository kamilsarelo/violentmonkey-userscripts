// ==UserScript==
// @name         allegro.pl
// @description  Removes sponsored and promoted offers from Allegro search results
// @namespace    https://github.com/kamilsarelo
// @version      2
// @author       kamilsarelo
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/allegro-logo.png
// @match        *://allegro.pl/*
// @match        *://*.allegro.pl/*
// @match        *://allegro.com/*
// @match        *://*.allegro.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function removePromotedOffers() {
        const offerElements = document.querySelectorAll('[class*="mqen_m6"]');
        let removedCount = 0;

        offerElements.forEach(offerElement => {
            const text = offerElement.textContent.toLowerCase();
            if (text.includes('sponsorowane') || text.includes('promowane')) {
                offerElement.remove();
                removedCount++;
            }
        });

        if (removedCount > 0) {
            console.log(`Removed ${removedCount} promoted offers.`);
        }
    }

    // Run immediately
    removePromotedOffers();

    // Set up MutationObserver
    const observer = new MutationObserver((mutations) => {
        let shouldRemove = false;
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldRemove = true;
                break;
            }
        }
        if (shouldRemove) {
            removePromotedOffers();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Allegro Promoted Offer Remover is active.");
})();
