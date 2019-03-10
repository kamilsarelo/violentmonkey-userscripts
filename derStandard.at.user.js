// ==UserScript==
// @name       derStandard.at
// @version    15
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/derStandard.at.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/derStandard.at.logo.png
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
	"ohne-box", // stellenanzeige und meistgelesen in der sidebar
	"socialsharing", // social mist unterhalb titel
	"communityform-input-textarea", // kommentarfeld
	"lookup-links", // "Ihr Schlüssel zur neuen Immobilie..."
	"newsletter-widget" // newsletter widget
];

var ids = [
	"dynamicCharts", // stock charts
	"looptool", // immobilien oder jobs unterhalb der kommentare
	"hint-push-service", // kurznachrichten link oben
	"wetterWidget", // ...und weiterer müll daneben
	"promotion-banner", // banner oben auf starseite
	"articleTools", // müll zwischen artikel und kommentaren
	"toolbar" // untere sinnlose toolbar
]

var timeStart = Date.now();
var timerId = setTimeout(function clear() {
	var paywall = document.querySelector("#purwall");
	if (paywall != null) {
		var success = document.querySelector("#page_success");
		if (success != null) {
			var aList = success.getElementsByTagName("a");
			if (aList.length > 0) {
				var wait = new Date().getTime() + 5 * 1000;
				while (new Date().getTime() <= wait) {} // Thread.sleep()
				aList[0].click();
				timerId = setTimeout(clear, 100);
				return;
			}
		}
		timerId = setTimeout(clear, 100);
		return;
	}
	
	cls.forEach(function(cl) {
		els = document.getElementsByClassName(cl);
		if (els.length > 0) {
			els = Array.prototype.slice.call(els);
			els.forEach((el) => { el.remove(); });
		}
		delete els;
	});

	ids.forEach(function(id) {
		el = document.getElementById(id);
		if (el !== null) {
			el.remove();
		}
		delete el;
	});

	var timeDiff = Date.now() - timeStart;
	if (timeDiff < 5 * 10 * 1000) {
		timerId = setTimeout(clear, 100);
	} else if (timeDiff < 30 * 60 * 1000) {
		timerId = setTimeout(clear, 1000);
	} else {
		timerId = setTimeout(clear, 5000);
	}
}, 100);
