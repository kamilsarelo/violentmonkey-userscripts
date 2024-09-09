// ==UserScript==
// @name         Allegro Sponsored/Promoted Highlighter
// @description  Highlight sponsored and promoted articles on Allegro search results, running periodically
// @namespace    https://github.com/yourusername
// @version      1
// @author       kamilsarelo
// @update       https://github.com/yourusername/violentmonkey/raw/master/allegro.pl.promoted.user.js
// @icon         https://raw.githubusercontent.com/yourusername/violentmonkey/master/allegro.pl.logo.png
// @grant        none
// @include      *://allegro.pl/*
// @include      *://www.allegro.pl/*
// @include      *://allegro.com/*
// @include      *://www.allegro.com/*
// ==/UserScript==

(function() {
    'use strict';

    // Configuration constants
    const INITIAL_DELAY_MS = 1000; // 1 second
    const PERIODIC_DELAY_MS = 2000; // 2 seconds

    // Logging configuration
    let ENABLE_LOGGING = false; // Logging is disabled by default

    // Custom styles
    const customStyles = `
        .sponsored-article {
            background-color: #FF5A00 !important; // Allegro orange
        }
        .promoted-article {
            background-color: #FF0000 !important; // Red
        }
    `;

    // Function to add styles, compatible with all userscript managers
    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
        log('Custom styles added to the page');
    }

    // Apply the custom styles
    addStyle(customStyles);

    // Logging function
    function log(...args) {
        if (ENABLE_LOGGING) {
            console.log('[Allegro Highlighter Script]', ...args);
        }
    }

    // Function to enable logging
    function enableLogging() {
        ENABLE_LOGGING = true;
        console.log('[Allegro Highlighter Script] Logging enabled');
    }

    // Function to disable logging
    function disableLogging() {
        ENABLE_LOGGING = false;
        console.log('[Allegro Highlighter Script] Logging disabled');
    }

    // Make logging control functions available globally
    window.allegroHighlighterScript = {
        enableLogging: enableLogging,
        disableLogging: disableLogging
    };

    // Log the instructions for enabling/disabling logging
    console.log(`
[Allegro Highlighter Script] Logging Control Instructions:
- To enable logging, run:  allegroHighlighterScript.enableLogging()
- To disable logging, run: allegroHighlighterScript.disableLogging()
    `);

    function highlightArticles() {
        log('Starting article highlighting process');
        const articles = document.querySelectorAll('article');
        log(`Found ${articles.length} articles`);

        articles.forEach((article, index) => {
            const html = article.innerHTML;
            log(`Processing article ${index + 1}/${articles.length}`);

            if (html.includes('Sponsorowane') && !article.classList.contains('sponsored-article')) {
                article.classList.add('sponsored-article');
                log(`Article ${index + 1} marked as sponsored`);
            } else if (html.includes('Promowane') && !article.classList.contains('promoted-article')) {
                article.classList.add('promoted-article');
                log(`Article ${index + 1} marked as promoted`);
            } else {
                log(`Article ${index + 1} is neither sponsored nor promoted`);
            }
        });

        log('Article highlighting process completed');
    }

    function initScript() {
        log('Initializing script');
        highlightArticles();
    }

    function startPeriodicExecution() {
        log(`Starting periodic execution every ${PERIODIC_DELAY_MS}ms`);
        setInterval(() => {
            log('Executing periodic update');
            initScript();
        }, PERIODIC_DELAY_MS);
    }

    function waitForPageLoad() {
        log('Waiting for page to fully load');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                log('DOMContentLoaded event fired');
                setTimeout(() => {
                    log(`Initial delay of ${INITIAL_DELAY_MS}ms completed, starting script`);
                    startPeriodicExecution();
                }, INITIAL_DELAY_MS);
            });
        } else {
            log('Page already loaded, starting script after initial delay');
            setTimeout(startPeriodicExecution, INITIAL_DELAY_MS);
        }
    }

    // Start the script
    log('Script loaded, waiting for page load');
    waitForPageLoad();
})();
