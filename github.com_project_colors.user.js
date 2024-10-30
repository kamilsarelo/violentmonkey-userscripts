// ==UserScript==
// @name         GitHub Project Stream Timeline Colorizer
// @description  Colorizes GitHub project timeline bars based on their stream colors
// @namespace    github-projects
// @version      1
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/github.com_project_colors.user.js
// @grant        none
// @match        https://github.com/*/projects/*
// ==/UserScript==

(function() {
    'use strict';

    function getStreamColors(streamGroup) {
        const headerRow = streamGroup.querySelector('[data-testid="roadmap-group-header-row"]');
        if (!headerRow) return null;
        
        const groupName = headerRow.querySelector('[data-testid="group-name"]');
        if (!groupName) return null;
        
        const colorBox = Array.from(headerRow.getElementsByClassName('Box-sc-g0xbh4-0'))
            .find(el => !el.hasAttribute('data-testid') && el.nextElementSibling === groupName);
            
        if (!colorBox) return null;

        const style = window.getComputedStyle(colorBox);
        return {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor
        };
    }

    function colorizeTimelineBars() {
        const streamGroups = document.querySelectorAll('div[data-testid^="roadmap-group-"]');
        
        streamGroups.forEach(streamGroup => {
            const colors = getStreamColors(streamGroup);
            if (!colors) return;
            
            const issueRows = streamGroup.querySelectorAll('div[data-testid^="TableRow{index:"]');
            
            issueRows.forEach(row => {
                const pillBackground = row.querySelector('[data-testid="roadmap-view-pill-background"]');
                if (!pillBackground) return;
                
                const targetSpan = pillBackground.querySelector('span');
                if (targetSpan) {
                    targetSpan.style.backgroundColor = colors.backgroundColor;
                    targetSpan.style.borderColor = colors.borderColor;
                }
            });
        });
    }

    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (
                            node.matches?.('div[data-testid^="roadmap-group-"]') ||
                            node.matches?.('div[data-testid^="TableRow{index:"]') ||
                            node.querySelector?.('[data-testid="roadmap-view-pill-background"]')
                        )) {
                            shouldUpdate = true;
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                colorizeTimelineBars();
            }
        });

        const container = document.querySelector('[data-testid="project-view-frame"]');
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

    function init() {
        const checkExists = setInterval(() => {
            const streamGroups = document.querySelectorAll('div[data-testid^="roadmap-group-"]');
            if (streamGroups.length > 0) {
                clearInterval(checkExists);
                colorizeTimelineBars();
                observeChanges();
            }
        }, 100);

        setTimeout(() => clearInterval(checkExists), 10000);
    }

    init();
})();
