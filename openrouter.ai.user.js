// ==UserScript==
// @name         OpenRouter Wider Content
// @description  Widens the main content area on openrouter.ai by modifying the .max-w-3xl class.
// @namespace    https://github.com/kamilsarelo
// @version      2
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/openrouter.ai.user.js
// @icon         https://openrouter.ai/favicon.ico
// @grant        GM_addStyle
// @include      *://openrouter.ai/*
// @include      *://www.openrouter.ai/*
// ==/UserScript==

(function() {
    'use strict';

    // Define the CSS rule to inject
    // Use width to set a specific size, overriding min/max constraints.
    // Use calc() for the dynamic width calculation.
    // Use !important to ensure this rule takes precedence.
    const newCss = `
        .max-w-3xl {
            width: calc(100% - 50px) !important;
            /* Optionally, you might want to ensure max-width doesn't interfere,
               though 'width' usually overrides 'max-width'. Setting it explicitly
               can sometimes help avoid unexpected interactions. */
            max-width: none !important; /* Usually redundant when 'width' is set, but safe */
        }
    `;

    // Use GM_addStyle to inject the CSS into the page head
    GM_addStyle(newCss);

    // Optional: Log a message to the console to confirm the script ran
    console.log("OpenRouter Wider Content script applied.");
})();
