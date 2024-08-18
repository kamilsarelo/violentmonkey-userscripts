// ==UserScript==
// @name         Allegro Seller Name Replacement
// @description  Replace seller type labels with actual seller names on Allegro search results, running periodically
// @namespace    https://github.com/kamilsarelo
// @version      9
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
    const PERIODIC_DELAY_MS = 1000; // 1 second
    const ENABLE_LOGGING = true; // Set to true to enable logging

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
            if (item.url && item.seller && item.seller.login) {
                const sellerName = item.seller.login;
                log(`Searching for article with URL: ${item.url}`);
                const articleElement = document.querySelector(`article a[href="${item.url}"]`);
                
                if (articleElement) {
                    // Find the seller element using a more robust selector
                    const sellerElement = articleElement.closest('article').querySelector('div[class*="mqu1_"] > span[class*="mpof_"]');
                    
                    if (sellerElement && sellerElement.textContent.trim() !== sellerName) {
                        const originalText = sellerElement.textContent.trim();
                        sellerElement.textContent = sellerName;
                        log(`Replaced "${originalText}" with "${sellerName}" for URL: ${item.url}`);
                        replacementCount++;
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
        log(`Starting periodic execution every ${PERIODIC_DELAY_MS}ms`);
        setInterval(initScript, PERIODIC_DELAY_MS);
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
