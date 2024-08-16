// ==UserScript==
// @name       allegro.pl-seller-name
// @namespace  https://github.com/kamilsarelo
// @version    1
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

    // Function to extract JSON data from script tag
    function extractJsonData() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.type === 'application/json' && script.getAttribute('data-serialize-box-id')) {
                try {
                    return JSON.parse(script.textContent);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
        }
        return null;
    }

    // Function to replace "Firma" with seller name
    function replaceSellerName(jsonData) {
        if (!jsonData || !jsonData.__listing_StoreState || !jsonData.__listing_StoreState.items) return;

        const items = jsonData.__listing_StoreState.items.elements;
        const currentUrl = window.location.href;

        for (let item of items) {
            if (item.url === currentUrl && item.seller && item.seller.login) {
                const sellerName = item.seller.login;
                const firmaElements = document.querySelectorAll('span.mpof_z0.mgmw_3z.mgn2_12._6a66d_gjNQR');
                
                firmaElements.forEach(element => {
                    if (element.textContent.trim() === 'Firma') {
                        element.textContent = sellerName;
                    }
                });

                break;
            }
        }
    }

    // Main execution
    const jsonData = extractJsonData();
    if (jsonData) {
        // Wait for the DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => replaceSellerName(jsonData));
        } else {
            replaceSellerName(jsonData);
        }
    }
})();
