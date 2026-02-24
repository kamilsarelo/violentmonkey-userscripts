// ==UserScript==
// @name         derStandard.at - Ad & Paywall Remover
// @description  Removes advertisements, paywall modals, and promotional banners from derStandard.at. Auto-expands compact navbar and handles paywall bypass.
// @namespace    https://github.com/kamilsarelo
// @version      28
// @author       kamilsarelo
// @icon         https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/assets/derstandard-logo.png
// @match        *://derstandard.at/*
// @match        *://*.derstandard.at/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Expand navbar
    setInterval(function() {
        const navbar = document.querySelector("#vue-header-app");
        if (navbar) {
            navbar.classList.remove("compact");
        }
    }, 50);

    const classes = [
        "tile-ad", // front page top banner
        "usabilla_live_button_container", // new design feedback button right
        "ad-container-used", // sidebar ads
        "native-ad", // ads separating articles
        "dstpiano-container", // PUR + Wochenende banner
        "tp-modal", // AdBlocker warning + subscription advertisement
        "tp-backdrop", // ...full page blurry blocker related to the warning above
    ];

    const ids = [
        "piano-supporter-inline-container", // Mit Ihrem Beitrag sichern Sie unsere Live-Berichte!
        "piano-pur-container", // Alle PUR-Vorteile plus die STANDARD Wochenendausgabe
        "piano-supporter-container", // Gemeinsam Qualitätsjournalismus unterstützen
        "piano-limesurvey-container", // STANDARD-Umfrage
    ];

    const timeStart = Date.now();
    let timerId;

    function clear() {
        const paywall = document.querySelector("#purwall");
        if (paywall != null) {
            const success = document.querySelector("#page_success");
            if (success != null) {
                const aList = success.getElementsByTagName("a");
                if (aList.length > 0) {
                    setTimeout(function() {
                        aList[0].click();
                    }, 5 * 1000);
                    return;
                }
            }
            timerId = setTimeout(clear, 100);
            return;
        }

        classes.forEach(function(cl) {
            const els = document.getElementsByClassName(cl);
            if (els.length > 0) {
                Array.from(els).forEach((el) => el.remove());
            }
        });

        ids.forEach(function(id) {
            const el = document.getElementById(id);
            if (el !== null) {
                el.remove();
            }
        });

        const timeDiff = Date.now() - timeStart;
        let nextDelay;
        if (timeDiff < 5 * 10 * 1000) {
            nextDelay = 100;
        } else if (timeDiff < 30 * 60 * 1000) {
            nextDelay = 1000;
        } else {
            nextDelay = 5000;
        }
        timerId = setTimeout(clear, nextDelay);
    }

    timerId = setTimeout(clear, 100);
})();
