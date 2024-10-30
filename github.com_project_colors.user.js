// ==UserScript==
// @name         GitHub Project Stream Timeline Colorizer
// @description  Colorizes GitHub project timeline bars based on their stream colors
// @namespace    github-projects
// @version      2
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

    function needsColoring(targetSpan, colors) {
        if (!targetSpan || !colors) return false;
        const currentStyle = window.getComputedStyle(targetSpan);
        return currentStyle.backgroundColor !== colors.backgroundColor || 
               currentStyle.borderColor !== colors.borderColor;
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
                if (targetSpan && needsColoring(targetSpan, colors)) {
                    targetSpan.style.backgroundColor = colors.backgroundColor;
                    targetSpan.style.borderColor = colors.borderColor;
                }
            });
        });
    }

    function init() {
        // Run immediately
        colorizeTimelineBars();
        
        // Run periodically
        setInterval(colorizeTimelineBars, 500);
    }

    init();
})();
