// ==UserScript==
// @name       YouTube continue watching
// @version    2
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/YouTube.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/YouTube.logo.png
// @grant      none
// @include    *://youtube.*
// @include    *://www.youtube.*
// ==/UserScript==

setInterval(function() {
  let elementMessageArray = [...document.querySelectorAll('yt-formatted-string')]
    .filter(element => element.innerText == 'Video paused. Continue watching?');
  elementMessageArray.forEach(elementMessage => {
    let elementMain = elementMessage.parentElement.parentElement.parentElement;
    if (elementMain != null) {
      let elementAnchor = elementMain.querySelector('a');
      if (elementAnchor != null) {
        elementAnchor.click();
        elementMain.remove();
      }
    }
  });
}, 1000);
