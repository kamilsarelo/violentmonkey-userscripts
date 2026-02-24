// ==UserScript==
// @name           derStandard.at > Web - Section Remover
// @description    Removes the chaotic section from derStandard.at/web page for a cleaner reading experience.
// @version        2
// @namespace      https://github.com/kamilsarelo
// @author         kamilsarelo
// @icon           https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/derstandard-logo.png
// @include        *://derstandard.at/web
// @include        *://*.derstandard.at/web
// @grant          none
// ==/UserScript==

(function() {
    'use strict';

    const intervalId = setInterval(function() {
        const sectionChaos = document.querySelector('section[data-id="s1"]');
        if (sectionChaos) {
            sectionChaos.remove();
            clearInterval(intervalId);
        }
    }, 100);
})();
