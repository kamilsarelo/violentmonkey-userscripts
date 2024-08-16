// ==UserScript==
// @name         Allegro Seller Name Replacement (Periodic Execution)
// @description  Replace seller type labels with actual seller names on Allegro search results, running periodically
// @namespace  https://github.com/kamilsarelo
// @version    6
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/allegro.pl.sellername.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/allegro.pl.logo.png
// @grant      none
// @include    *://allegro.pl/*
// @include    *://www.allegro.pl/*
// @include    *://allegro.com/*
// @include    *://www.allegro.com/*
// ==/UserScript==

(function() {
    'use strict';

    // Configuration constants
    const INITIAL_DELAY_MS = 1000;
    const PERIODIC_DELAY_MS = 1000;

    function extractJsonData() {
        console.log('Attempting to extract JSON data...');
        const script = document.querySelector('script[data-serialize-box-id="q3sWcOVSTx268bHXp9P4Fw=="]');
        if (script) {
            try {
                const data = JSON.parse(script.textContent);
                console.log('JSON data extracted successfully');
                return data;
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        } else {
            console.log('Script tag with specified data-serialize-box-id not found');
        }
        return null;
    }

    function replaceSellerName(jsonData) {
        console.log('Starting seller name replacement process...');
        if (!jsonData || !jsonData.__listing_StoreState || !jsonData.__listing_StoreState.items) {
            console.log('Required JSON data not found');
            return;
        }

        const items = jsonData.__listing_StoreState.items.elements;
        console.log(`Found ${items.length} items in JSON data`);

        let replacementCount = 0;

        items.forEach((item, index) => {
            if (item.url && item.seller && item.seller.login) {
                const sellerName = item.seller.login;
                const articleElement = document.querySelector(`article a[href="${item.url}"]`);
                
                if (articleElement) {
                    const sellerElement = articleElement.closest('article').querySelector('span.mpof_z0.mgmw_3z.mgn2_12._6a66d_gjNQR');
                    
                    if (sellerElement && sellerElement.textContent.trim() !== sellerName) {
                        const originalText = sellerElement.textContent.trim();
                        sellerElement.textContent = sellerName;
                        console.log(`Replaced "${originalText}" with "${sellerName}" for URL: ${item.url}`);
                        replacementCount++;
                    }
                }
            }
        });

        console.log(`Replacement process completed. Total replacements: ${replacementCount}`);
    }

    function initScript() {
        console.log('Initializing script...');
        const jsonData = extractJsonData();
        if (jsonData) {
            replaceSellerName(jsonData);
        } else {
            console.log('Failed to extract JSON data, script execution halted');
        }
    }

    function startPeriodicExecution() {
        console.log(`Starting periodic execution every ${PERIODIC_DELAY_MS}ms`);
        setInterval(initScript, PERIODIC_DELAY_MS);
    }

    function waitForPageLoad() {
        console.log('Waiting for page to fully load...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(startPeriodicExecution, INITIAL_DELAY_MS));
        } else {
            setTimeout(startPeriodicExecution, INITIAL_DELAY_MS);
        }
    }

    // Start the script
    waitForPageLoad();
})();
