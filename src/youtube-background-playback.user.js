// ==UserScript==
// @name         YouTube Background Playback
// @description  Disable Page Visibility API to enable background playback on YouTube web
// @version      2
// @namespace    https://github.com/kamilsarelo
// @author       kamilsarelo
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/youtube-logo.png
// @match        *://youtube.com/*
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
// Inspired by / adapted from:
// - https://www.androidauthority.com/youtube-background-playback-browsers-fix-3636806/
// - https://greasyfork.org/en/scripts/415290-disable-page-visibility-api/code

(function() {
    'use strict';

    // Block the visibilitychange event so YouTube doesn't know you left the tab
    document.addEventListener('visibilitychange', function (e) {
        e.stopImmediatePropagation();
    }, true);

    // Block the blur event so YouTube doesn't know the window lost focus
    window.addEventListener('blur', function (e) {
        e.stopImmediatePropagation();
    }, true);

    // Force YouTube to read the tab as 'visible' and 'not hidden'
    Object.defineProperty(document, 'visibilityState', { get: function() { return 'visible'; } });
    Object.defineProperty(document, 'hidden', { get: function() { return false; } });
})();
