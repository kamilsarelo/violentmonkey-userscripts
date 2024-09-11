// ==UserScript==
// @name         Allegro Sponsored/Promoted Highlighter
// @description  Highlight sponsored and promoted articles on Allegro search results with a simple overlay
// @namespace    https://github.com/kamilsarelo
// @version      18
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
    let ENABLE_LOGGING = false;
    const SPONSORED_IMAGE_IDENTIFIER = 'action-common-information-33306995c6';

    const customStyles = `
        .sponsored-promoted-article {
            position: relative !important;
        }
        .sponsored-promoted-overlay {
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
        if (!article.querySelector('.sponsored-promoted-overlay')) {
            article.classList.add('sponsored-promoted-article');
            const overlay = document.createElement('div');
            overlay.className = 'sponsored-promoted-overlay';
            article.appendChild(overlay);
            log('Overlay added to article');
        }
    }

    function isSponsoredArticle(article) {
        return article.innerHTML.includes(SPONSORED_IMAGE_IDENTIFIER);
    }

    function highlightSponsoredPromoted() {
        log('Starting highlighting process');
        
        const allArticles = document.querySelectorAll('article');
        let sponsoredCount = 0;
        
        allArticles.forEach((article, index) => {
            if (isSponsoredArticle(article)) {
                addOverlay(article);
                sponsoredCount++;
                log(`Article ${index + 1} processed as sponsored/promoted`);
            }
        });

        log(`Processed ${sponsoredCount} sponsored/promoted articles out of ${allArticles.length} total articles`);
    }

    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName.toLowerCase() === 'article' && isSponsoredArticle(node)) {
                                addOverlay(node);
                                log('Overlay added to dynamically loaded sponsored article');
                            } else {
                                const articles = node.querySelectorAll('article');
                                articles.forEach(article => {
                                    if (isSponsoredArticle(article)) {
                                        addOverlay(article);
                                        log('Overlay added to dynamically loaded sponsored article');
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        log('DOM observer started');
    }

    function init() {
        log('Initializing script');
        highlightSponsoredPromoted();
        observeDOMChanges();
    }

    setTimeout(init, INITIAL_DELAY_MS);

    log('Script loaded, will initialize after delay');
})();
