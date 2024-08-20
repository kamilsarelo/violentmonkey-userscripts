// ==UserScript==
// @name         Allegro Seller Name Replacement
// @description  Replace seller type labels with actual seller names on Allegro search results, running periodically
// @namespace    https://github.com/kamilsarelo
// @version      13
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/allegro.pl.sellername.user.js
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/allegro.pl.logo.png
// @grant        none
// @include      *://allegro.pl/*
// @include      *://www.allegro.pl/*
// @include      *://allegro.com/*
// @include      *://www.allegro.com/*
// ==/UserScript==

// ==UserScript==
// @name         Allegro Seller Name Replacement (Universal, Content-Based)
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Replace and highlight seller type labels with actual seller names and quantity on Allegro search results, using content-based selection
// @match        https://allegro.pl/listing*
// @grant        none
// ==/UserScript==

// ==UserScript==
// @name         Allegro Seller Name Replacement (Universal, Content-Based, 5-min)
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  Replace and highlight seller type labels with actual seller names and quantity on Allegro search results, using content-based selection, running for 5 minutes
// @match        https://allegro.pl/listing*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration constants
    const INITIAL_DELAY_MS = 1000; // 1 second
    const PERIODIC_DELAY_MS = 1000; // 1 second
    const ENABLE_LOGGING = false; // Set to true to enable logging
    const EXECUTION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    // Custom styles
    const customStyles = `
        .highlighted-seller {
            background-color: #ffff99;
            color: #000000;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }
    `;

    // Function to add styles, compatible with all userscript managers
    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    // Apply the custom styles
    addStyle(customStyles);

    function log(...args) {
        if (ENABLE_LOGGING) {
            console.log(...args);
        }
    }

    function extractJsonData() {
        log('Attempting to extract JSON data...');
        const scripts = document.querySelectorAll('script[type="application/json"][data-serialize-box-id]');
        for (const script of scripts) {
            try {
                const data = JSON.parse(script.textContent);
                if (data && data.__listing_StoreState && data.__listing_StoreState.items) {
                    log('JSON data extracted successfully');
                    return data;
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
        log('No matching script tag found');
        return null;
    }

    function findSellerElement(articleElement) {
        const sellerTypes = ['Firma', 'Oficjalny sklep', 'Prywatny sprzedawca'];
        for (const type of sellerTypes) {
            const element = Array.from(articleElement.querySelectorAll('span, div')).find(el => 
                el.textContent.trim() === type
            );
            if (element) return element;
        }
        return null;
    }

    function replaceSellerName(jsonData) {
        log('Starting seller name replacement process...');
        if (!jsonData || !jsonData.__listing_StoreState || !jsonData.__listing_StoreState.items) {
            log('Required JSON data not found');
            return;
        }

        const items = jsonData.__listing_StoreState.items.elements;
        log(`Found ${items.length} items in JSON data`);

        let replacementCount = 0;

        items.forEach((item, index) => {
            if (item.url && item.seller && item.seller.login && item.quantity !== undefined) {
                const sellerName = item.seller.login;
                const quantity = item.quantity;
                const displayText = `${sellerName} (${quantity} szt.)`;
                log(`Searching for article with URL: ${item.url}`);
                const articleElement = document.querySelector(`article a[href="${item.url}"]`);
                
                if (articleElement) {
                    const sellerElement = findSellerElement(articleElement.closest('article'));
                    
                    if (sellerElement) {
                        const highlightedSpan = sellerElement.querySelector('.highlighted-seller');
                        if (highlightedSpan) {
                            // If the highlighted span already exists, just update its text content if different
                            if (highlightedSpan.textContent !== displayText) {
                                highlightedSpan.textContent = displayText;
                                log(`Updated existing span with "${displayText}" for URL: ${item.url}`);
                                replacementCount++;
                            }
                        } else {
                            // If the highlighted span doesn't exist, create it
                            sellerElement.innerHTML = `<span class="highlighted-seller">${displayText}</span>`;
                            log(`Created new span with "${displayText}" for URL: ${item.url}`);
                            replacementCount++;
                        }
                    } else {
                        log(`Seller element not found for URL: ${item.url}`);
                    }
                }
            }
        });

        log(`Replacement process completed. Total replacements: ${replacementCount}`);
    }

    function initScript() {
        log('Initializing script...');
        const jsonData = extractJsonData();
        if (jsonData) {
            replaceSellerName(jsonData);
        } else {
            log('Failed to extract JSON data, script execution halted');
        }
    }

    function startPeriodicExecution() {
        log(`Starting periodic execution every ${PERIODIC_DELAY_MS}ms for ${EXECUTION_DURATION_MS}ms`);
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            initScript();
            if (Date.now() - startTime >= EXECUTION_DURATION_MS) {
                clearInterval(intervalId);
                log('Reached maximum execution time. Stopping periodic updates.');
            }
        }, PERIODIC_DELAY_MS);
    }

    function waitForPageLoad() {
        log('Waiting for page to fully load...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(startPeriodicExecution, INITIAL_DELAY_MS));
        } else {
            setTimeout(startPeriodicExecution, INITIAL_DELAY_MS);
        }
    }

    // Start the script
    waitForPageLoad();
})();
