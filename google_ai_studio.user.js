// ==UserScript==
// @name         Google AI Studio UI Tweaks
// @description  Applies a background color to user prompts and the input area, and removes the separator line for a cleaner look.
// @namespace    https://github.com/kamilsarelo
// @version      1
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/google_ai_studio.user.js
// @icon         https://www.gstatic.com/aistudio/ai_studio_favicon_2_32x32.png
// @grant        none
// @include      *://aistudio.google.com/*
// ==/UserScript==

(function() {
    'use strict';

    // --- Color Palette ---
    // Color for previous user prompts
    const promptHighlightColor = 'rgb(230, 247, 255)'; // #E6F7FF

    // Color for the active input area
    const inputHighlightColor = 'rgb(245, 240, 255)'; // #F5F0FF


    // This function finds the target elements and applies all UI tweaks.
    function applyUiTweaks() {
        // --- Task 1 & 2: Style past prompts and remove their separators ---
        const userPrompts = document.querySelectorAll('div.user-prompt-container');
        userPrompts.forEach(promptDiv => {
            // Apply background color to the parent
            const parentDiv = promptDiv.parentElement;
            if (parentDiv && parentDiv.style.backgroundColor !== promptHighlightColor) {
                parentDiv.style.backgroundColor = promptHighlightColor;
            }

            // Find and remove the separator div inside the prompt
            const separator = promptDiv.querySelector('div.turn-separator');
            if (separator) {
                separator.remove();
            }
        });

        // --- Task 3: Style the main prompt input wrapper ---
        const inputWrapper = document.querySelector('div.prompt-input-wrapper');
        if (inputWrapper && inputWrapper.style.backgroundColor !== inputHighlightColor) {
            inputWrapper.style.backgroundColor = inputHighlightColor;
        }
    }

    // --- Handling Dynamically Loaded Content ---
    const observer = new MutationObserver(() => {
        applyUiTweaks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Run once on initial load.
    applyUiTweaks();

    console.log("Google AI Studio UI Tweaks script is active.");

})();
