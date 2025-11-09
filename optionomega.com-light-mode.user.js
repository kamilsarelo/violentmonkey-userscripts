// ==UserScript==
// @name         Option Omega Light Mode
// @description  Convert Option Omega's dark theme to light mode for better readability
// @namespace    https://github.com/kamilsarelo
// @version      1
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/optionomega.com-light-mode.user.js
// @match        https://optionomega.com/*
// @match        https://www.optionomega.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Common conversion for light gray to darker
    function convertLightGrayToDark(color) {
        if (color === 'rgb(229, 231, 235)') {
            return '#4b5563';
        }
        return color;
    }

    // Function to convert white text to black
    function convertTextColor(color) {
        // Only convert pure white
        if (color === 'rgb(255, 255, 255)' || color === '#ffffff' || color === '#fff') {
            return '#000000';
        }
        // Convert calendar light text colors to black
        if (color === 'rgb(191, 219, 254)' || color === 'rgb(241, 245, 249)' || color === 'rgb(203, 213, 225)') {
            return '#000000';
        }
        // Convert light gray to slightly darker
        return convertLightGrayToDark(color);
    }

    // Function to convert specific dark backgrounds to light
    function convertBackgroundColor(color) {
        // Convert pure black to white
        if (color === 'rgb(0, 0, 0)' || color === '#000000' || color === '#000') {
            return '#ffffff';
        }
        // Convert rgb(40, 40, 39) to light gray
        if (color === 'rgb(40, 40, 39)') {
            // return '#f0f0f0';
            return '#eee';
        }
        // Convert calendar dark backgrounds to lighter shades
        if (color === 'rgb(15, 23, 42)') {
            return 'rgb(241, 245, 249)'; // Light slate blue-gray
        }
        if (color === 'rgb(30, 41, 59)') {
            return 'rgb(241, 245, 249)'; // Light slate blue-gray
        }
        return color;
    }

    // Function to convert light borders to darker
    function convertBorderColor(color) {
        return convertLightGrayToDark(color);
    }

    // Function to inject light mode CSS overrides and enhancements
    function injectLightModeStyles() {
        const lightModeCSS = `
            /* Override dark hover state with light equivalent */
            .hover\\:bg-gray-800:hover { background-color: #e5e7eb !important; }
            
            /*
             * Canvas Chart Enhancement for Light Mode
             *
             * Rationale for CSS filter approach:
             * 1. Canvas renders as pixels - inaccessible to DOM manipulation
             * 2. Filters provide optimal performance with no redraw overhead
             * 3. Maintains full chart interactivity and functionality
             * 4. Universal application to all canvas elements
             *
             * Rejected alternatives:
             * - Canvas wrapper: Disrupts layout and positioning
             * - Pixel manipulation: Computationally expensive and breaks interactions
             * - Chart redraw: Requires complex reverse-engineering of chart libraries
             *
             * Filter configuration:
             * - contrast(1.2): Enhances readability of light elements
             * - brightness(0.8): Optimizes canvas visibility in light theme
             * - Combined effect: Improves text contrast while preserving data visualization
             */

            canvas {
                filter: contrast(1.2) brightness(0.8) !important;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = lightModeCSS;
        style.id = 'light-mode-styles';
        
        const targetElement = document.head || document.documentElement;
        targetElement.appendChild(style);
    }

    // Function to process all elements and convert their colors
    function processElements() {
        const allElements = document.querySelectorAll('*');
        const formElements = document.querySelectorAll(''
            + 'input:not([disabled]), '
            + 'select:not([disabled]):not(.selectInput--nested), '
            + 'textarea:not([disabled]), '
            + 'button.selectInput:not([disabled]):not(.selectInput--nested)'
        );

        allElements.forEach(element => {
            try {
                const styles = window.getComputedStyle(element);

                // Check and convert background color
                const bgColor = styles.backgroundColor;
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    // Handle toggle buttons specially
                    if (element.classList.contains('toggle')) {
                        const isToggleOff = element.classList.contains('bg-ooGray');
                        if (isToggleOff) {
                            // Apply conversion when OFF (has bg-ooGray class)
                            const newBgColor = convertBackgroundColor(bgColor);
                            if (newBgColor !== bgColor) {
                                element.style.backgroundColor = newBgColor;
                            }
                        } else {
                            // Restore original style when ON (no bg-ooGray class)
                            element.style.backgroundColor = '';
                        }
                    } else {
                        // Normal conversion for non-toggle elements
                        const newBgColor = convertBackgroundColor(bgColor);
                        if (newBgColor !== bgColor) {
                            element.style.backgroundColor = newBgColor;
                        }
                    }
                }

                // Check and convert text color
                const textColor = styles.color;
                if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
                    const newTextColor = convertTextColor(textColor);
                    if (newTextColor !== textColor) {
                        element.style.color = newTextColor;
                    }
                }

                // Check and convert border color
                const borderColor = styles.borderColor;
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
                    const newBorderColor = convertBorderColor(borderColor);
                    if (newBorderColor !== borderColor) {
                        element.style.borderColor = newBorderColor;
                    }
                }
            } catch (e) {
                // Skip elements that can't be styled
                console.debug('Error processing element:', e);
            }
        });

        // Apply amber background to form elements
        formElements.forEach(element => {
            element.style.backgroundColor = '#fef3c7'; // Light amber
        });
    }

    // Function to handle dynamic content
    function handleDynamicContent() {
        // Create a mutation observer to handle dynamically loaded content
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    // Process new elements after a short delay to allow styles to be applied
                    // 100ms gives browser time to apply CSS styles before we process them
                    setTimeout(processElements, 100);
                }
            });
        });

        // Start observing document body for changes
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        return observer;
    }

    // Initialize userscript
    function init() {
        // Inject light mode CSS styles and enhancements
        injectLightModeStyles();
        
        // Process elements immediately (includes form styling)
        processElements();

        // Set up mutation observer for dynamic content
        const observer = handleDynamicContent();

        // Clean up observer when page unloads
        window.addEventListener('beforeunload', function () {
            if (observer) {
                observer.disconnect();
            }
        });

        // Re-process elements periodically to catch any missed changes
        // 2000ms (2 seconds) balances responsiveness with performance
        // MutationObserver handles most real-time changes, this catches edge cases
        setInterval(processElements, 2000);

        // Also process when window gains focus (in case tab was inactive)
        window.addEventListener('focus', processElements);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also run immediately for fast injection
    init();

})();
