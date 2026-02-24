// ==UserScript==
// @name         YouTube Auto-Continue Watching
// @description  Automatically dismisses the "Video paused. Continue watching?" dialog on YouTube, allowing uninterrupted playback
// @namespace    https://github.com/kamilsarelo
// @version      6
// @author       kamilsarelo
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/youtube-logo.png
// @match        *://youtube.com/*
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /**
   * Attempts to close a dialog by clicking buttons with aria-label.
   * First tries the direct button, then traverses up to parent elements
   * with "button" in their tag name.
   */
  function handleContinueWatchingDialog() {
    // Find all dialogs with role="dialog"
    const dialogs = document.querySelectorAll('[role="dialog"]');

    for (const dialog of dialogs) {
      // Find all buttons with aria-label inside this dialog
      const buttons = dialog.querySelectorAll('button[aria-label]');

      // Only proceed if there's exactly one button with aria-label
      // This prevents clicking on dialogs with multiple options (e.g., Yes/No)
      if (buttons.length !== 1) {
        continue;
      }

      const button = buttons[0];

      // Try clicking the button directly
      button.click();

      // Check if dialog closed
      if (!document.body.contains(dialog)) {
        return; // Success, dialog is gone
      }

      // Fallback: traverse up clicking parent elements with "button" in tag name
      let parent = button.parentElement;
      while (parent && dialog.contains(parent)) {
        const tagName = parent.tagName.toLowerCase();
        if (tagName.includes('button')) {
          parent.click();

          // Check if dialog closed after clicking parent
          if (!document.body.contains(dialog)) {
            return; // Success, dialog is gone
          }
        }
        parent = parent.parentElement;
      }
    }
  }

  // Observe DOM changes to detect dialog appearance
  const observer = new MutationObserver(handleContinueWatchingDialog);
  observer.observe(document.body, { childList: true, subtree: true });

  // Also run on initial load in case dialog is already present
  handleContinueWatchingDialog();
})();
