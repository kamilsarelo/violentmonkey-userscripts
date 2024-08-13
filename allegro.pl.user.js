// ==UserScript==
// @name       allegro.pl
// @namespace  https://github.com/kamilsarelo
// @version    1
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/allegro.pl.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/allegro.pl.logo.png
// @grant      none
// @include    *://allegro.pl/*
// @include    *://www.allegro.pl/*
// @include    *://allegro.com/*
// @include    *://www.allegro.com/*
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
