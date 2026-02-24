// ==UserScript==
// @name           YouTube Auto-Continue Watching
// @description    Automatically dismisses the "Video paused. Continue watching?" dialog on YouTube, allowing uninterrupted playback
// @version        4
// @namespace      https://github.com/kamilsarelo
// @author         kamilsarelo
// @icon           https://raw.githubusercontent.com/kamilsarelo/violentmonkey-userscripts/master/youtube-logo.png
// @match          *://youtube.com/*
// @match          *://*.youtube.com/*
// @grant          none
// @run-at         document-idle
// ==/UserScript==

function handleContinueWatchingDialog() {
  let elementMessageArray = [...document.querySelectorAll('yt-formatted-string')]
    .filter(element => element.innerText?.toLowerCase().includes('continue watching'));
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
}

const observer = new MutationObserver(handleContinueWatchingDialog);
observer.observe(document.body, { childList: true, subtree: true });
