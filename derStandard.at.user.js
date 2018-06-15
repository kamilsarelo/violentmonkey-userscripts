// ==UserScript==
// @name       derStandard.at
// @version    1
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/derStandard.at.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/logo.png
// @grant      none
// @include    *://derstandard.at/*
// ==/UserScript==

var cls = [
	"ContentAd1",
	"ad-std",
	"TopEW",
	"w-immosuche", // immobilien button oben
	"w-jobsuche", // jobsuche button oben
	"w-abo", // abo button oben
	"ohne-box" // stellenanzeige und meistgelesen in der sidebar
];

var ids = [
	"dynamicCharts", // stock charts
	"looptool", // immobilien oder jobs unterhalb der kommentare
	"hint-push-service", // kurznachrichten link oben
	"wetterWidget", // ...und weiterer müll daneben
	"promotion-banner", // banner oben auf starseite
	"articleTools" // müll zwischen artikel und kommentaren
]

var timeStart = Date.now();

var timerId = setTimeout(function clear() {
	cls.forEach(function(cl) {
	var els = document.getElementsByClassName(cl);
	if (els.length > 0) {
		els = Array.prototype.slice.call(els);
		els.forEach((el) => { el.remove(); });
	}
	});

	ids.forEach(function(id) {
	var el = document.getElementById(id);
	if (el !== null) {
		el.remove();
	}
});

var timeDiff = Date.now() - timeStart;
	if (timeDiff < 10 * 1000) {
		timerId = setTimeout(clear, 250);
	} else if (timeDiff < 60 * 1000) {
		timerId = setTimeout(clear, 1000);
	} else if (timeDiff < 10 * 60 * 1000) {
		timerId = setTimeout(clear, 4000);
	}

}, 500);