// ==UserScript==
// @name         Allegro Seller Name Replacement
// @description  Replace seller type labels with actual seller names on Allegro search results, running periodically
// @namespace    https://github.com/kamilsarelo
// @version      14
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/allegro.pl.sellername.user.js
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/allegro.pl.logo.png
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
    const ENABLE_LOGGING = true; // Set to false to disable logging in production

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
        log('Custom styles added to the page');
    }

    // Apply the custom styles
    addStyle(customStyles);

    function log(...args) {
        if (ENABLE_LOGGING) {
            console.log('[Allegro Seller Script]', ...args);
        }
    }

    function extractJsonData() {
        log('Attempting to extract JSON data...');
        const scripts = document.querySelectorAll('script[type="application/json"][data-serialize-box-id]');
        log(`Found ${scripts.length} script tags with JSON data`);
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
        log('No matching script tag found with required data');
        return null;
    }

    function findSellerElement(articleElement) {
        log('Searching for seller element within article');
        const sellerTypes = ['Firma', 'Oficjalny sklep', 'Prywatny sprzedawca'];
        for (const type of sellerTypes) {
            const element = Array.from(articleElement.querySelectorAll('span, div')).find(el => 
                el.textContent.trim() === type
            );
            if (element) {
                log(`Found seller element with type: ${type}`);
                return element;
            }
        }
        log('Seller element not found in article');
        return null;
    }

    function replaceSellerName(jsonData) {
        log('Starting seller name replacement process');
        if (!jsonData || !jsonData.__listing_StoreState || !jsonData.__listing_StoreState.items) {
            log('Required JSON data not found, aborting replacement process');
            return;
        }

        const items = jsonData.__listing_StoreState.items.elements;
        log(`Found ${items.length} items in JSON data`);

        items.forEach((item, index) => {
            if (item.url && item.seller && item.seller.login && item.quantity !== undefined) {
                const sellerName = item.seller.login;
                const quantity = item.quantity;
                const displayText = `${sellerName} (${quantity} szt.)`;
                log(`Processing item ${index + 1}/${items.length}: ${displayText}`);
                const articleElement = document.querySelector(`article a[href="${item.url}"]`);
                
                if (articleElement) {
                    log(`Found article element for URL: ${item.url}`);
                    const sellerElement = findSellerElement(articleElement.closest('article'));
                    
                    if (sellerElement) {
                        let highlightedSpan = sellerElement.querySelector('.highlighted-seller');
                        if (!highlightedSpan) {
                            log('Creating new highlighted span');
                            highlightedSpan = document.createElement('span');
                            highlightedSpan.className = 'highlighted-seller';
                            sellerElement.innerHTML = '';
                            sellerElement.appendChild(highlightedSpan);
                        }
                        if (highlightedSpan.textContent !== displayText) {
                            highlightedSpan.textContent = displayText;
                            log(`Updated span with "${displayText}" for URL: ${item.url}`);
                        } else {
                            log(`Span already up to date for URL: ${item.url}`);
                        }
                    } else {
                        log(`Seller element not found for URL: ${item.url}`);
                    }
                } else {
                    log(`Article element not found for URL: ${item.url}`);
                }
            } else {
                log(`Skipping item ${index + 1} due to missing data`);
            }
        });
        log('Seller name replacement process completed');
    }

    function initScript() {
        log('Initializing script');
        const jsonData = extractJsonData();
        if (jsonData) {
            replaceSellerName(jsonData);
        } else {
            log('Failed to extract JSON data, script execution halted');
        }
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
