// ==UserScript==
// @name       dynatrace.org
// @version    5
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/dynatrace.org.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/dynatrace.org.logo.png
// @grant      none
// @include    *://devops-rx.lab.dynatrace.org/*
// @require    https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js
// ==/UserScript==

var timeStart = Date.now();
var timerId = setTimeout(function mark() {
	var timeDiff = Date.now() - timeStart;
	if (timeDiff > 10 * 1000) {
    return;
  }

  var markInstance = new Mark(document.querySelector(".overview-container"));
  markInstance.mark("dashboard chart config filter promise report ClientSideRuntimeException");

  var nodes = document.querySelectorAll('[data-markjs]') ;
  if (nodes.length == 0) {
    markInstance.unmark();
    timerId = setTimeout(mark, 100);
  }
}, 100);
