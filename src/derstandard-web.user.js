// ==UserScript==
// @name           derStandard.at > Web - Section Remover
// @description    Removes the chaotic section from derStandard.at/web page for a cleaner reading experience.
// @version        3
// @namespace      https://github.com/kamilsarelo
// @author         kamilsarelo
// @icon           https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/derstandard-logo.png
// @include        *://derstandard.at/web
// @include        *://*.derstandard.at/web
// @grant          none
// @run-at         document-start
// ==/UserScript==

(function() {
    'use strict';

    // Hide the section immediately via CSS to prevent flickering
    const style = document.createElement('style');
    style.textContent = 'section[data-id="s1"] { display: none !important; }';
    (document.head || document.documentElement).appendChild(style);

    // Remove the section and cleanup when DOM is ready
    const removeSection = function() {
        const sectionChaos = document.querySelector('section[data-id="s1"]');
        if (sectionChaos) {
            sectionChaos.remove();
            style.remove();
            return true;
        }
        return false;
    };

    // Try immediately if DOM is already ready
    if (document.readyState() !== 'loading') {
        if (removeSection()) return;
    }

    // Use MutationObserver for instant detection
    const observer = new MutationObserver(function(mutations, obs) {
        if (removeSection()) {
            obs.disconnect();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Fallback: stop observing after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        observer.disconnect();
        removeSection();
    });
})();
