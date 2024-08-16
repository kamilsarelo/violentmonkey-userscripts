// ==UserScript==
// @name       allegro.pl
// @namespace  https://github.com/kamilsarelo
// @version    2
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
            console.log(`Processing item ${index + 1}/${items.length}`);
            if (item.url && item.seller && item.seller.login) {
                const sellerName = item.seller.login;
                console.log(`Searching for article with URL: ${item.url}`);
                const articleElement = document.querySelector(`article a[href="${item.url}"]`);
                
                if (articleElement) {
                    console.log('Matching article element found');
                    const firmaElement = articleElement.closest('article').querySelector('span.mpof_z0.mgmw_3z.mgn2_12._6a66d_gjNQR');
                    
                    if (firmaElement && firmaElement.textContent.trim() === 'Firma') {
                        firmaElement.textContent = sellerName;
                        console.log(`Replaced "Firma" with "${sellerName}" for URL: ${item.url}`);
                        replacementCount++;
                    } else {
                        console.log('No "Firma" text found in the article or already replaced');
                    }
                } else {
                    console.log('No matching article element found');
                }
            } else {
                console.log('Item does not have required properties (url, seller.login)');
            }
        });

        console.log(`Replacement process completed. Total replacements: ${replacementCount}`);
    }

    function waitForPageLoad() {
        console.log('Waiting for page to fully load...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', delayedInit);
        } else {
            delayedInit();
        }
    }

    function delayedInit() {
        console.log('Page loaded, waiting 3 seconds before initializing script...');
        setTimeout(initScript, 3000);  // 3000 milliseconds = 3 seconds
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

    // Start the script
    waitForPageLoad();
})();
