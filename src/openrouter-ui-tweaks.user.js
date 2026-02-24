// ==UserScript==
// @name         OpenRouter Wider Content
// @description  Widens the main content area on openrouter.ai by modifying the .max-w-3xl class.
// @version      3
// @namespace    https://github.com/kamilsarelo
// @author       kamilsarelo
// @icon         https://openrouter.ai/favicon.ico
// @include      *://openrouter.ai/*
// @include      *://*.openrouter.ai/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Define the CSS rule to inject
    // We use calc() for the dynamic width calculation.
    // We add !important to increase the chance of overriding the original style,
    // especially important with utility CSS frameworks like Tailwind (which OpenRouter seems to use).
    const newCss = `
        .max-w-3xl {
            min-width: calc(100% - 5rem) !important;
        }
    `;

    // Use GM_addStyle to inject the CSS into the page head
    // This is the recommended way to add styles via userscripts
    GM_addStyle(newCss);

    // Optional: Log a message to the console to confirm the script ran
    console.log("OpenRouter Wider Content script applied.");
})();
