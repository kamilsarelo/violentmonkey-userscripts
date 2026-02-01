// ==UserScript==
// @name         Google AI Studio UI Tweaks
// @description  Applies a background color to user prompts and the input area, and removes the separator line for a cleaner look.
// @namespace    https://github.com/kamilsarelo
// @version      3
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
    const promptHighlightColor = '#D4F3FB';

    // Color for the active input area
    const inputHighlightColor = '#D4F3FB';


    // This function finds the target elements and applies all UI tweaks.
    function applyUiTweaks() {
        // --- Task 1 & 2: Style past prompts and remove their separators ---
        // New selector targets the specific user turn container
        const userTurns = document.querySelectorAll('div.chat-turn-container.user');
        
        userTurns.forEach(turn => {
            // Apply background color
            if (turn.style.backgroundColor !== promptHighlightColor) {
                turn.style.backgroundColor = promptHighlightColor;
            }

            // Apply text color
            const textWrapper = turn.querySelector('ms-prompt-chunk.text-chunk');
            if (textWrapper) {
                textWrapper.style.setProperty('color', '#24628B', 'important');
            }

            // Remove the separator
            const separator = turn.querySelector('div.turn-separator');
            if (separator) {
                separator.remove();
            }
        });

        // --- Task 3: Style the main prompt input wrapper ---
        // New selector for the input box area
        const inputWrapper = document.querySelector('div.prompt-box-container');
        if (inputWrapper && inputWrapper.style.backgroundColor !== inputHighlightColor) {
            inputWrapper.style.backgroundColor = inputHighlightColor;
            // Optional: ensure the inner wrapper matches
            const textWrapper = inputWrapper.querySelector('.text-wrapper');
            if (textWrapper) textWrapper.style.backgroundColor = 'transparent';
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
