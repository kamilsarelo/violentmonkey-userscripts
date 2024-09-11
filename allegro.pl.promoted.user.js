// ==UserScript==
// @name         Allegro Sponsored/Promoted Highlighter
// @description  Highlight sponsored and promoted articles on Allegro search results with a simple overlay
// @namespace    https://github.com/kamilsarelo
// @version      23
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/allegro.pl.promoted.user.js
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/allegro.pl.logo.png
// @grant        none
// @include      *://allegro.pl/*
// @include      *://www.allegro.pl/*
// @include      *://allegro.com/*
// @include      *://www.allegro.com/*
// ==/UserScript==

(function() {
    'use strict';

    const INITIAL_DELAY_MS = 1000;
    const PERIODIC_DELAY_MS = 2000;
    let ENABLE_LOGGING = false;
    const SPONSORED_CLASS = '_1e32a_62rFQ';
    const SPONSORED_IMAGE_SRC = 'https://a.allegroimg.com/original/34a646/639f929246af8f23da49cf64e9d7/action-common-information-33306995c6';
    const OVERLAY_CLASS = 'sponsored-promoted-overlay';

    const customStyles = `
        .sponsored-promoted-article {
            position: relative !important;
        }
        .${OVERLAY_CLASS} {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(255, 90, 0, 0.1) !important; /* Semi-transparent Allegro orange */
            pointer-events: none !important;
            z-index: 1000 !important;
        }
    `;

    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        log('Custom styles added to the page');
    }

    addStyle(customStyles);

    function log(...args) {
        if (ENABLE_LOGGING) {
            console.log('[Allegro Highlighter]', ...args);
        }
    }

    window.allegroHighlighter = {
        enableLogging: () => {
            ENABLE_LOGGING = true;
            console.log('[Allegro Highlighter] Logging enabled');
        },
        disableLogging: () => {
            ENABLE_LOGGING = false;
            console.log('[Allegro Highlighter] Logging disabled');
        }
    };

    console.log(`
[Allegro Highlighter] Logging Control Instructions:
- To enable logging, run:  allegroHighlighter.enableLogging()
- To disable logging, run: allegroHighlighter.disableLogging()
    `);

    function addOverlay(article) {
        if (!article.querySelector(`.${OVERLAY_CLASS}`)) {
            article.classList.add('sponsored-promoted-article');
            const overlay = document.createElement('div');
            overlay.className = OVERLAY_CLASS;
            article.appendChild(overlay);
            log('Overlay added to article');
        }
    }

    function isSponsoredByImage(article) {
        const img = article.querySelector('div > div > div > button > img[src="' + SPONSORED_IMAGE_SRC + '"]');
        return img !== null;
    }

    function highlightSponsoredPromoted() {
        log('Starting highlighting process');
        
        const sponsoredPromotedDivs = document.querySelectorAll(`div.${SPONSORED_CLASS}`);
        
        sponsoredPromotedDivs.forEach((div, index) => {
            const article = div.closest('article');
            if (article && !article.querySelector(`.${OVERLAY_CLASS}`)) {
                addOverlay(article);
                log(`Article ${index + 1} processed as sponsored/promoted (class)`);
            }
        });

        // Additional check for the image
        const allArticles = document.querySelectorAll('article');
        allArticles.forEach((article, index) => {
            if (!article.querySelector(`.${OVERLAY_CLASS}`) && isSponsoredByImage(article)) {
                addOverlay(article);
                log(`Article ${index + 1} processed as sponsored/promoted (image)`);
            }
        });

        log(`Processed ${document.querySelectorAll(`.${OVERLAY_CLASS}`).length} sponsored/promoted articles`);
    }

    function startPeriodicExecution() {
        log(`Starting periodic execution every ${PERIODIC_DELAY_MS}ms`);
        setInterval(highlightSponsoredPromoted, PERIODIC_DELAY_MS);
    }

    function init() {
        log('Initializing script');
        highlightSponsoredPromoted();
        startPeriodicExecution();
    }

    setTimeout(init, INITIAL_DELAY_MS);

    log('Script loaded, will initialize after delay');
})();
