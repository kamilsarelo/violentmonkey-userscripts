// ==UserScript==
// @name         Allegro Sponsored/Promoted Highlighter
// @description  Highlight sponsored and promoted articles on Allegro search results, running periodically
// @namespace    https://github.com/yourusername
// @version      3
// @author       kamilsarelo
// @update       https://github.com/yourusername/violentmonkey/raw/master/allegro.pl.promoted.user.js
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

    const customStyles = `
        .sponsored-promoted-article {
            border: 3px solid #FF5A00 !important;
            box-shadow: 0 0 10px #FF5A00 !important;
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

    function highlightSponsoredPromoted() {
        log('Starting highlighting process');
        
        // Find all divs that might contain shadow roots
        const potentialShadowHosts = document.querySelectorAll('div > div:only-child');
        
        potentialShadowHosts.forEach((div, index) => {
            // Check if this div's parent has only one child (which is this div)
            if (div.parentElement.children.length === 1) {
                const article = div.closest('article');
                if (article && !article.classList.contains('sponsored-promoted-article')) {
                    article.classList.add('sponsored-promoted-article');
                    log(`Article ${index + 1} marked as potentially sponsored/promoted`);
                }
            }
        });

        log('Highlighting process completed');
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

    // Start the script after a short delay
    setTimeout(init, INITIAL_DELAY_MS);

    log('Script loaded, will initialize after delay');
})();
