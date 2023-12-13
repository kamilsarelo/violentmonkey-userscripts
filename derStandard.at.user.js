// ==UserScript==
// @name       derStandard.at
// @version    26
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/derStandard.at.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/derStandard.at.logo.png
// @grant      none
// @include    *://derstandard.at/*
// @include    *://www.derstandard.at/*
// ==/UserScript==

setInterval(function(){
	let navbar = document.querySelector("#vue-header-app");
	if (navbar) { 
		navbar.classList.remove("compact");
	}
}, 50);

const cls = [
	"tile-ad", // front page top banner
	"usabilla_live_button_container", // new design feedback button right
	"ad-container-used", // sidebar ads
	"native-ad", // ads separating articles
	"dstpiano-container", // PUR + Wochenende banner
	"tp-modal", // AdBlocker warning + subscription advertisement
	"tp-backdrop", // ...full page blurry blocker related to the warning above
];

var ids = [
	"piano-supporter-inline-container", // Mit Ihrem Beitrag sichern Sie unsere Live-Berichte!
	"piano-pur-container", // Alle PUR-Vorteile plus die STANDARD Wochenendausgabe
	"piano-supporter-container", // Gemeinsam Qualitätsjournalismus unterstützen
	"piano-limesurvey-container", // STANDARD-Umfrage
];

var timeStart = Date.now();
var timerId = setTimeout(function clear() {
	var paywall = document.querySelector("#purwall");
	if (paywall != null) {
		var success = document.querySelector("#page_success");
		if (success != null) {
			var aList = success.getElementsByTagName("a");
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
