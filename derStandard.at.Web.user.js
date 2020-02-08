// ==UserScript==
// @name       derStandard.at > Web
// @version    1
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @update     https://github.com/kamilsarelo/violentmonkey/raw/master/derStandard.at.Web.user.js
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey/master/derStandard.at.logo.png
// @grant      none
// @include    *://derstandard.at/web
// @include    *://www.derstandard.at/web
// ==/UserScript==

setInterval(function(){
  const sectionChaos = document.querySelector('section[data-id="s1"]');
  if (sectionChaos) { 
    sectionChaos.remove();
  }
}, 100);
