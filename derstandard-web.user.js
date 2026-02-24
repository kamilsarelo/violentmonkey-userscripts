// ==UserScript==
// @name       derStandard.at > Web
// @version    1
// @namespace  https://github.com/kamilsarelo
// @author     kamilsarelo
// @icon       https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/derstandard-logo.png
// @include    *://derstandard.at/web
// @include    *://*.derstandard.at/web
// @grant      none
// ==/UserScript==

setInterval(function(){
  const sectionChaos = document.querySelector('section[data-id="s1"]');
  if (sectionChaos) { 
    sectionChaos.remove();
  }
}, 100);
