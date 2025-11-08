// ==UserScript==
// @name         Simple Video Speed Control
// @description  Simple speed controls for HTML5 videos with global speed persistence
// @namespace    https://github.com/kamilsarelo
// @version      2
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/simple-video-speed-control.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @match        *://*/*
// ==/UserScript==

(function () {
    'use strict';

    // Constants
    const STORAGE_KEY = 'h5player_last_speed';
    const SPEEDS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 4, 8, 16];
    
    // Global variables
    let globalControlBar = null;
    let activeVideo = null;
    let speedSelect = null;

    // Storage functions
    function saveSpeed(speed) {
        try {
            GM_setValue(STORAGE_KEY, speed.toString());
            console.log('[Video Speed Control] Speed saved globally:', speed);
        } catch (e) {
            try {
                localStorage.setItem(STORAGE_KEY, speed.toString());
                console.log('[Video Speed Control] Speed saved to localStorage as fallback:', speed);
            } catch (fallbackError) {
                console.warn('[Video Speed Control] Failed to save speed:', fallbackError);
            }
        }
    }

    function getSavedSpeed() {
        try {
            const savedSpeed = GM_getValue(STORAGE_KEY);---
            if (savedSpeed !== undefined && savedSpeed !== null) {
                return parseFloat(savedSpeed);
            }
            const localSpeed = localStorage.getItem(STORAGE_KEY);
            return localSpeed ? parseFloat(localSpeed) : 1.0;
        } catch (e) {
            try {
                const localSpeed = localStorage.getItem(STORAGE_KEY);
                return localSpeed ? parseFloat(localSpeed) : 1.0;
            } catch (fallbackError) {
                console.warn('[Video Speed Control] Failed to retrieve speed:', fallbackError);
                return 1.0;
            }
        }
    }

    // Style management
    function applyStyles(element, styles) {
        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }

    function addInteractiveEvents(element, baseStyles, hoverStyles, focusStyles) {
        element.addEventListener('mouseenter', () => applyStyles(element, hoverStyles));
        element.addEventListener('mouseleave', () => applyStyles(element, baseStyles));
        element.addEventListener('focus', () => applyStyles(element, focusStyles));
        element.addEventListener('blur', () => applyStyles(element, baseStyles));
    }

    // Control bar creation
    function createGlobalControlBar() {
        if (globalControlBar) return globalControlBar;
        
        // Reset speedSelect if it exists
        speedSelect = null;

        // Create control bar container
        globalControlBar = document.createElement('div');
        globalControlBar.id = 'video-speed-control-bar';
        applyStyles(globalControlBar, {
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: '100%',
            zIndex: '999999',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease',
            transform: 'translateY(100%)' // Initially hidden
        });

        // Define styles
        const baseStyles = {
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            outline: 'none',
            width: '100px',
            textAlign: 'center',
            boxSizing: 'border-box'
        };
        
        const hoverStyles = {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
        };
        
        const focusStyles = {
            borderColor: '#007bff',
            boxShadow: '0 0 0 2px rgba(0,123,255,0.5)'
        };

        // Create controls
        const slowerBtn = document.createElement('button');
        slowerBtn.textContent = '◀◀◀';
        applyStyles(slowerBtn, baseStyles);
        addInteractiveEvents(slowerBtn, baseStyles, hoverStyles, focusStyles);
        
        speedSelect = document.createElement('select');
        applyStyles(speedSelect, baseStyles);
        applyStyles(speedSelect, {
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '16px',
            paddingRight: '30px'
        });
        addInteractiveEvents(speedSelect, baseStyles, hoverStyles, focusStyles);
        
        const fasterBtn = document.createElement('button');
        fasterBtn.textContent = '▶▶▶';
        applyStyles(fasterBtn, baseStyles);
        addInteractiveEvents(fasterBtn, baseStyles, hoverStyles, focusStyles);

        // Add speed options
        SPEEDS.forEach(speed => {
            const option = document.createElement('option');
            option.value = speed;
            option.textContent = speed + 'x';
            speedSelect.appendChild(option);
        });

        // Event listeners
        slowerBtn.addEventListener('click', () => {
            if (activeVideo) changeSpeed('decrease');
        });

        fasterBtn.addEventListener('click', () => {
            if (activeVideo) changeSpeed('increase');
        });

        speedSelect.addEventListener('change', (e) => {
            if (activeVideo) {
                const newSpeed = parseFloat(e.target.value);
                activeVideo.playbackRate = newSpeed;
                saveSpeed(newSpeed);
            }
        });

        // Assemble control bar
        globalControlBar.appendChild(slowerBtn);
        globalControlBar.appendChild(speedSelect);
        globalControlBar.appendChild(fasterBtn);
        document.body.appendChild(globalControlBar);

        return globalControlBar;
    }

    // Speed control functions
    function changeSpeed(direction) {
        if (!activeVideo) return;
        
        let currentIndex = SPEEDS.indexOf(activeVideo.playbackRate);
        if (currentIndex === -1) {
            currentIndex = SPEEDS.findIndex(s =>
                direction === 'decrease' ? s < activeVideo.playbackRate : s > activeVideo.playbackRate
            );
        }

        const newIndex = direction === 'decrease'
            ? Math.max(0, currentIndex - 1)
            : Math.min(SPEEDS.length - 1, currentIndex + 1);

        if (newIndex >= 0 && newIndex < SPEEDS.length && newIndex !== currentIndex) {
            activeVideo.playbackRate = SPEEDS[newIndex];
            saveSpeed(activeVideo.playbackRate);
            if (speedSelect) speedSelect.value = activeVideo.playbackRate;
            console.log(`[Video Speed Control] Speed ${direction} to:`, activeVideo.playbackRate);
        }
    }

    function updateSpeedDisplay() {
        if (speedSelect && activeVideo) {
            speedSelect.value = activeVideo.playbackRate;
        }
    }

    // Control bar visibility
    function showControlBar() {
        if (!globalControlBar) createGlobalControlBar();
        globalControlBar.style.transform = 'translateY(0)';
    }

    function hideControlBar() {
        if (globalControlBar) {
            globalControlBar.style.transform = 'translateY(100%)';
        }
    }

    // Video processing
    function updateControlBarForVideo(video) {
        activeVideo = video;
        
        if (!globalControlBar) createGlobalControlBar();
        
        // Apply saved speed
        const savedSpeed = getSavedSpeed();
        if (savedSpeed !== video.playbackRate) {
            video.playbackRate = savedSpeed;
            console.log('[Video Speed Control] Applied saved speed:', savedSpeed);
        }
        
        updateSpeedDisplay();
        
        // Update speed when video rate changes
        video.addEventListener('ratechange', updateSpeedDisplay);
        
        showControlBar();
    }

    function processVideos() {
        const videos = document.querySelectorAll('video');
        
        if (videos.length === 0) {
            hideControlBar();
            return;
        }
        
        const firstVideo = videos[0];
        if (!firstVideo.dataset.speedControlProcessed) {
            console.log('[Video Speed Control] Processing video:', firstVideo);
            firstVideo.dataset.speedControlProcessed = 'true';
            
            // Add event listeners
            ['play', 'mouseenter', 'loadeddata'].forEach(event => {
                firstVideo.addEventListener(event, () => updateControlBarForVideo(firstVideo));
            });
            
            // Initialize control bar
            updateControlBarForVideo(firstVideo);
        }
    }

    // Keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Skip if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const video = document.querySelector('video');
        if (!video) return;

        switch (e.key) {
            case '-':
                e.preventDefault();
                const minusIndex = Math.max(0, SPEEDS.indexOf(video.playbackRate) - 1);
                video.playbackRate = SPEEDS[minusIndex];
                saveSpeed(video.playbackRate);
                updateSpeedDisplay();
                break;
            case '+':
                e.preventDefault();
                const plusIndex = Math.min(SPEEDS.length - 1, 
                    SPEEDS.indexOf(video.playbackRate) === -1 ? 
                    SPEEDS.findIndex(s => s > video.playbackRate) : 
                    SPEEDS.indexOf(video.playbackRate) + 1);
                video.playbackRate = SPEEDS[plusIndex];
                saveSpeed(video.playbackRate);
                updateSpeedDisplay();
                break;
            case '*':
            case '=':
                e.preventDefault();
                video.playbackRate = 1.0;
                saveSpeed(1.0);
                updateSpeedDisplay();
                break;
        }
    }

    // Initialize
    processVideos();
    
    // Set up MutationObserver
    const observer = new MutationObserver((mutations) => {
        const shouldProcess = mutations.some(mutation => 
            mutation.type === 'childList' && 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeName === 'VIDEO' || (node.querySelectorAll && node.querySelectorAll('video').length > 0)
            )
        );

        if (shouldProcess) {
            processVideos();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
})();
