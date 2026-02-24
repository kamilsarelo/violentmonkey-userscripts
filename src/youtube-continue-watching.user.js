// ==UserScript==
// @name         YouTube Auto-Continue Watching
// @description  Automatically dismisses the "Video paused. Continue watching?" dialog on YouTube, allowing uninterrupted playback
// @namespace    https://github.com/kamilsarelo
// @version      7
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
   * Handles the "Video paused. Continue watching?" dialog by:
   * 1. Finding the text element with the distinctive message
   * 2. Traversing to its parent dialog
   * 3. Clicking the "Yes" button (with fallback to parent elements)
   */
  function handleContinueWatchingDialog() {
    // Use XPath to find the text directly
    const xpath = "//yt-formatted-string[contains(text(), 'Video paused. Continue watching?')]";
    const textEl = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!textEl) return;

    const dialog = textEl.closest('[role="dialog"]');
    if (!dialog) {
      console.error('[YouTube Auto-Continue] Text found but no parent dialog');
      return;
    }

    // Find button with aria-label="Yes"
    const button = dialog.querySelector('button[aria-label="Yes"]');
    if (!button) {
      console.error('[YouTube Auto-Continue] Dialog found but no "Yes" button');
      return;
    }

    // Helper to check if dialog is closed
    const isDialogClosed = () => !document.body.contains(dialog);

    // Helper to wait for dialog to close
    const waitForClose = (thresholdMs = 100) => new Promise(resolve => {
      setTimeout(() => resolve(isDialogClosed()), thresholdMs);
    });

    // Click cascade: button -> parent -> parent's parent -> abort
    (async () => {
      let element = button;
      let depth = 0;
      const maxDepth = 2; // button, parent, grandparent

      while (element && depth <= maxDepth) {
        element.click();

        if (await waitForClose()) return; // Success

        depth++;
        element = element.parentElement;
      }

      console.error('[YouTube Auto-Continue] Failed to close dialog after clicking button and parents');
    })();
  }

  // Observe DOM changes to detect dialog appearance
  const observer = new MutationObserver(handleContinueWatchingDialog);
  observer.observe(document.body, { childList: true, subtree: true });

  // Also run on initial load in case dialog is already present
  handleContinueWatchingDialog();
})();
