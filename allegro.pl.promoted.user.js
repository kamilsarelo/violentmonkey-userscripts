// ==UserScript==
// @name         Allegro Sponsored/Promoted Highlighter
// @description  Highlight sponsored and promoted articles on Allegro search results with a simple overlay
// @namespace    https://github.com/kamilsarelo
// @version      31
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

    // Configurable parameters
    const CONFIG = {
        INITIAL_DELAY_MS: 1000,   // Delay before first check after page load
        DEBOUNCE_DELAY_MS: 250    // Debounce delay for all events
    };

    // Constants
    const SPONSORED_CLASS = '_1e32a_62rFQ';
    const SPONSORED_IMAGE_SRC = 'https://a.allegroimg.com/original/34a646/639f929246af8f23da49cf64e9d7/action-common-information-33306995c6';
    const OVERLAY_CLASS = 'sponsored-promoted-overlay';
    const ARTICLE_CLASS = 'sponsored-promoted-article';
    const LOGGER_NAME = '[Allegro Highlighter]';
    const SEARCH_RESULTS_SELECTOR = 'div[data-box-name="Items Container"]';

    // State variables
    let ENABLE_LOGGING = false;
    let processingPromise = null;

    const customStyles = `
        .${ARTICLE_CLASS} {
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

    function log(...args) {
        if (ENABLE_LOGGING) {
            console.log(LOGGER_NAME, ...args);
        }
    }

    window.allegroHighlighter = {
        enableLogging: () => {
            ENABLE_LOGGING = true;
            console.log(LOGGER_NAME, 'Logging enabled');
        },
        disableLogging: () => {
            ENABLE_LOGGING = false;
            console.log(LOGGER_NAME, 'Logging disabled');
        }
    };

    console.log(`
${LOGGER_NAME} Logging Control Instructions:
- To enable logging, run:  allegroHighlighter.enableLogging()
- To disable logging, run: allegroHighlighter.disableLogging()
    `);

    function addOverlay(article) {
        if (!article.querySelector(`.${OVERLAY_CLASS}`)) {
            article.classList.add(ARTICLE_CLASS);
            const overlay = document.createElement('div');
            overlay.className = OVERLAY_CLASS;
            article.appendChild(overlay);
            log('Overlay added to article');
        }
    }

    function isSponsoredByImage(article) {
        const img = article.querySelector(`div > div > div > button > img[src="${SPONSORED_IMAGE_SRC}"]`);
        return img !== null;
    }

    function highlightSponsoredPromoted() {
        if (processingPromise) {
            log('Highlighting process already running, skipping this iteration');
            return processingPromise;
        }

        processingPromise = new Promise((resolve) => {
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
            resolve();
        }).finally(() => {
            processingPromise = null;
        });

        return processingPromise;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedHighlight = debounce(highlightSponsoredPromoted, CONFIG.DEBOUNCE_DELAY_MS);

    function handleScroll() {
        log('Scroll event detected');
        debouncedHighlight();
    }

    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldHighlight = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName.toLowerCase() === 'article') {
                                log('New article added directly');
                                shouldHighlight = true;
                            } else {
                                const newArticles = node.querySelectorAll('article');
                                if (newArticles.length > 0) {
                                    log(`${newArticles.length} new article(s) added within a container`);
                                    shouldHighlight = true;
                                }
                            }
                        }
                    });
                }
            });
            if (shouldHighlight) {
                debouncedHighlight();
            }
        });

        const targetNode = document.querySelector(SEARCH_RESULTS_SELECTOR);
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
            log('MutationObserver set up for search results container');
        } else {
            log('Search results container not found, MutationObserver not set up');
        }
    }

    function init() {
        log('Initializing script');
        addStyle(customStyles);
        highlightSponsoredPromoted(); // Initial check
        window.addEventListener('scroll', handleScroll, { passive: true });
        observeDOMChanges();
    }

    setTimeout(init, CONFIG.INITIAL_DELAY_MS);

    log('Script loaded, will initialize after delay');
})();
