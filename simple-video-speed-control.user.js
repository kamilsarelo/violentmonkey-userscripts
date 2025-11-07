// ==UserScript==
// @name         Simple Video Speed Control
// @description  Simple speed controls for HTML5 videos with global speed persistence
// @namespace    https://github.com/kamilsarelo
// @version      1
// @author       kamilsarelo
// @update       https://github.com/kamilsarelo/violentmonkey/raw/master/simple-video-speed-control.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @match        *://*/*
// ==/UserScript==

(function () {
    'use strict';

    // Storage key for remembering the last selected speed
    const STORAGE_KEY = 'h5player_last_speed';

    // Define available speeds globally so we can reuse it
    const SPPEDS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 4, 8, 16];

    // Function to save the current speed globally using GM_setValue
    function saveSpeed(speed) {
        try {
            GM_setValue(STORAGE_KEY, speed.toString());
            console.log('[Video Speed Control] Speed saved globally:', speed);
        } catch (e) {
            console.warn('[Video Speed Control] Failed to save speed globally:', e);
            // Fallback to localStorage if GM_setValue fails
            try {
                localStorage.setItem(STORAGE_KEY, speed.toString());
                console.log('[Video Speed Control] Speed saved to localStorage as fallback:', speed);
            } catch (fallbackError) {
                console.warn('[Video Speed Control] Failed to save speed to localStorage:', fallbackError);
            }
        }
    }

    // Function to retrieve the last saved speed globally using GM_getValue
    function getSavedSpeed() {
        try {
            const savedSpeed = GM_getValue(STORAGE_KEY);
            if (savedSpeed !== undefined && savedSpeed !== null) {
                return parseFloat(savedSpeed);
            }
            // If no value in GM storage, try localStorage as fallback
            const localSpeed = localStorage.getItem(STORAGE_KEY);
            if (localSpeed) {
                return parseFloat(localSpeed);
            }
            return 1.0; // Default to 1.0x if no saved speed
        } catch (e) {
            console.warn('[Video Speed Control] Failed to retrieve saved speed globally:', e);
            // Fallback to localStorage if GM_getValue fails
            try {
                const localSpeed = localStorage.getItem(STORAGE_KEY);
                return localSpeed ? parseFloat(localSpeed) : 1.0;
            } catch (fallbackError) {
                console.warn('[Video Speed Control] Failed to retrieve speed from localStorage:', fallbackError);
                return 1.0; // Default to 1.0x on error
            }
        }
    }

    // Function to create and add speed controls to a video element
    function addSpeedControls(video) {
        // Skip if video already has controls
        if (video.dataset.speedControlAdded) return;
        video.dataset.speedControlAdded = 'true';

        // Create control container
        const controlContainer = document.createElement('div');
        controlContainer.style.position = 'absolute';
        controlContainer.style.top = '10px';
        controlContainer.style.left = '10px';
        controlContainer.style.zIndex = '999999';
        controlContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        controlContainer.style.color = 'white';
        controlContainer.style.padding = '8px';  // Larger padding for mobile
        controlContainer.style.borderRadius = '8px';
        controlContainer.style.fontSize = '16px';  // Larger font for mobile
        controlContainer.style.fontFamily = 'Arial, sans-serif';
        controlContainer.style.flexDirection = 'column';  // Stack controls vertically
        controlContainer.style.alignItems = 'flex-start';  // Align to left
        controlContainer.style.gap = '8px';
        controlContainer.style.pointerEvents = 'auto';
        controlContainer.style.userSelect = 'none';
        controlContainer.style.cursor = 'pointer';
        // Add pointer-events to ensure clicks work
        controlContainer.setAttribute('data-no-intercept', 'true');

        // Don't block events at container level - let buttons handle their own events

        // Global button styles
        const BUTTON_STYLES = {
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            padding: '8px',
            transition: 'transform 0.1s ease',
            transform: 'scale(1)',
            hoverScale: '1.05',
            clickScale: '0.9',
            clickAnimationDuration: 100,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        };

        const REGULAR_BUTTON_STYLES = {
            ...BUTTON_STYLES,
            // backgroundColor: '#444',
            // color: 'white',
            // hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        };

        const SPEED_OPTION_STYLES = {
            ...BUTTON_STYLES,
            // backgroundColor: 'rgba(255, 255, 255, 0.1)',
            // color: 'black',
            // hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
            
            currentSpeedBackgroundColor: 'rgba(255, 255, 255, 0.3)',
            currentSpeedFontWeight: 'bold',
            currentSpeedBoxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
        };

        // Function to update speed display with proper formatting
        function updateSpeedDisplay(speed) {
            if (speed === Math.floor(speed)) {
                // Whole number, no decimal places needed
                speedDisplay.textContent = speed.toFixed(0) + 'x';
            } else {
                // Decimal number, show appropriate decimal places
                const decimalPlaces = speed.toString().split('.')[1]?.length || 1;
                speedDisplay.textContent = speed.toFixed(decimalPlaces) + 'x';
            }
        }

        // Function to change speed and update display
        function changeSpeed(direction) {
            showControls();

            let currentIndex = SPPEDS.indexOf(video.playbackRate);
            if (currentIndex === -1) {
                // If current speed not in list, find closest speed in the specified direction
                currentIndex = SPPEDS.findIndex(s =>
                    direction === 'decrease' ? s < video.playbackRate : s > video.playbackRate
                );
            }

            // Calculate new index based on direction
            const newIndex = direction === 'decrease'
                ? Math.max(0, currentIndex - 1)
                : Math.min(SPPEDS.length - 1, currentIndex + 1);

            // Only change speed if index is valid and different from current
            if (newIndex >= 0 && newIndex < SPPEDS.length && newIndex !== currentIndex) {
                video.playbackRate = SPPEDS[newIndex];
                saveSpeed(video.playbackRate);
                updateSpeedDisplay(video.playbackRate);
                console.log(`[Video Speed Control] Speed ${direction === 'decrease' ? 'decreased' : 'increased'} to:`, video.playbackRate);
            }
        }

        // Function to create a control element with consistent styling and event handling
        function createControlElement(styleType, content, clickHandler) {
            const element = document.createElement('button');
            element.textContent = content;
            element.style.width = '70px';
            element.style.height = '40px';
            element.style.borderRadius = '4px';
            element.style.cursor = 'pointer';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.style.overflow = 'hidden';

            element.style.backgroundColor = REGULAR_BUTTON_STYLES.backgroundColor;
            element.style.color = REGULAR_BUTTON_STYLES.color;
            element.style.border = REGULAR_BUTTON_STYLES.border;
            element.style.padding = REGULAR_BUTTON_STYLES.padding;
            element.style.transition = REGULAR_BUTTON_STYLES.transition;
            element.style.transform = REGULAR_BUTTON_STYLES.transform;

            // Apply different styling based on styleType
            if (styleType === 'emoji') {
                element.style.lineHeight = '24px';
                element.style.fontSize = '32px'; // '28px';
            } else {
                // For speed display
                element.style.fontSize = '16px';
            }

            // Hover effect
            element.addEventListener('mouseenter', () => {
                element.style.transform = `scale(${REGULAR_BUTTON_STYLES.hoverScale})`;
                element.style.backgroundColor = REGULAR_BUTTON_STYLES.hoverBackgroundColor;
            });
            element.addEventListener('mouseleave', () => {
                element.style.transform = REGULAR_BUTTON_STYLES.transform;
                element.style.backgroundColor = REGULAR_BUTTON_STYLES.backgroundColor;
            });

            // Add click handler with animation if provided
            if (clickHandler) {
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Execute the provided click handler
                    clickHandler(e);

                    // Animate button press
                    // element.style.transform = 'scale(0.9)';
                    // setTimeout(() => {
                    //     element.style.transform = 'scale(1)';
                    // }, 100);
                    element.style.transform = `scale(${REGULAR_BUTTON_STYLES.clickScale})`;
                    setTimeout(() => {
                        element.style.transform = REGULAR_BUTTON_STYLES.transform;
                    }, REGULAR_BUTTON_STYLES.clickAnimationDuration);
                }, true);
            }

            // Prevent double-click
            element.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                e.preventDefault();
            }, true);

            return element;
        }

        // Create control elements using the reusable function
        const slowerBtn = createControlElement('emoji', '🐢', () => changeSpeed('decrease')); // ◀◀ 🐢 Slower «
        const speedDisplay = createControlElement('text', '1x', (e) => {
            console.log('[Video Speed Control] Speed display clicked');
            const isVisible = speedGrid.style.display === 'grid';
            speedGrid.style.display = isVisible ? 'none' : 'grid';
            showControls();
        });
        const fasterBtn = createControlElement('emoji', '🐇', () => changeSpeed('increase')); // ⏩ 🐇 ➕ + ▶▶ »

        // Create first row container for basic controls
        const firstRow = document.createElement('div');
        firstRow.style.display = 'flex';
        firstRow.style.alignItems = 'center';
        firstRow.style.gap = '8px';
        firstRow.style.marginBottom = '0';  // No margin when grid is hidden
        firstRow.style.transition = 'margin-bottom 0.2s';  // Smooth transition when grid toggles

        // Create speed grid container (second row)
        const speedGrid = document.createElement('div');
        speedGrid.style.display = 'grid';
        speedGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        speedGrid.style.gap = '8px';
        speedGrid.style.paddingTop = '16px';
        // speedGrid.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        // speedGrid.style.borderRadius = '4px';
        speedGrid.style.width = '100%';  // Full width of container
        speedGrid.style.boxSizing = 'border-box';
        speedGrid.style.display = 'none';  // Hidden by default

        // Create speed options in grid
        SPPEDS.forEach(speed => {
            const speedOption = document.createElement('div');
            speedOption.textContent = speed + 'x';
            speedOption.style.fontSize = '14px';

            // Apply global button styles for speed options
            speedOption.style.borderRadius = SPEED_OPTION_STYLES.borderRadius;
            speedOption.style.cursor = SPEED_OPTION_STYLES.cursor;
            speedOption.style.textAlign = SPEED_OPTION_STYLES.textAlign;
            speedOption.style.border = SPEED_OPTION_STYLES.border;
            speedOption.style.padding = SPEED_OPTION_STYLES.padding;
            speedOption.style.transition = SPEED_OPTION_STYLES.transition;
            speedOption.style.transform = SPEED_OPTION_STYLES.transform;
            speedOption.style.backgroundColor = SPEED_OPTION_STYLES.backgroundColor;
            speedOption.style.color = SPEED_OPTION_STYLES.color;

            // Highlight current speed
            if (speed === video.playbackRate) {
                speedOption.style.backgroundColor = SPEED_OPTION_STYLES.currentSpeedBackgroundColor;
                speedOption.style.fontWeight = SPEED_OPTION_STYLES.currentSpeedFontWeight;
                speedOption.style.boxShadow = SPEED_OPTION_STYLES.currentSpeedBoxShadow;
            }

            // Hover effect
            speedOption.addEventListener('mouseenter', () => {
                if (speed !== video.playbackRate) {
                    speedOption.style.transform = `scale(${SPEED_OPTION_STYLES.hoverScale})`;
                    speedOption.style.backgroundColor = SPEED_OPTION_STYLES.hoverBackgroundColor;
                }
            });
            speedOption.addEventListener('mouseleave', () => {
                if (speed !== video.playbackRate) {
                    speedOption.style.transform = SPEED_OPTION_STYLES.transform;
                    speedOption.style.backgroundColor = SPEED_OPTION_STYLES.backgroundColor;
                }
            });

            // Click handler with animation
            speedOption.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('[Video Speed Control] Speed option clicked:', speed);
                video.playbackRate = speed;
                saveSpeed(speed);
                speedGrid.style.display = 'none';  // Hide grid after selection
                showControls();
                
                // Update display using shared function
                updateSpeedDisplay(speed);
                
                // Update grid highlights
                updateGridHighlights(speed);
                
                // // Animate button press
                // speedOption.style.transform = `scale(${SPEED_OPTION_STYLES.clickScale})`;
                // setTimeout(() => {
                //     speedOption.style.transform = SPEED_OPTION_STYLES.transform;
                // }, SPEED_OPTION_STYLES.clickAnimationDuration);
                
                console.log('[Video Speed Control] Speed set to:', speed);
            }, true);

            // Prevent double-click
            speedOption.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                e.preventDefault();
            }, true);

            speedGrid.appendChild(speedOption);
        });


        // Close grid when clicking outside
        document.addEventListener('click', (e) => {
            if (!speedGrid.contains(e.target) && e.target !== speedDisplay) {
                speedGrid.style.display = 'none';
            }
        }, true);

        // Function to update grid highlights
        function updateGridHighlights(currentSpeed) {
            const options = speedGrid.querySelectorAll('div');
            options.forEach(option => {
                const optionSpeed = parseFloat(option.textContent);
                if (optionSpeed === currentSpeed) {
                    option.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    option.style.fontWeight = 'bold';
                    option.style.boxShadow = '0 0 4px rgba(255, 255, 255, 0.3)';
                } else {
                    option.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    option.style.fontWeight = 'normal';
                    option.style.boxShadow = 'none';
                }
            });
        }

        // Update grid highlights when speed changes
        video.addEventListener('ratechange', () => {
            updateGridHighlights(video.playbackRate);
        });


        // Update speed display when video rate changes
        video.addEventListener('ratechange', () => {
            updateSpeedDisplay(video.playbackRate);
        });

        // Assemble first row (basic controls)
        firstRow.appendChild(slowerBtn);
        firstRow.appendChild(speedDisplay);
        firstRow.appendChild(fasterBtn);

        // Assemble container with both rows
        controlContainer.appendChild(firstRow);
        controlContainer.appendChild(speedGrid);

        // Find a suitable parent to position controls
        let parent = video.parentNode;

        // If parent is not positioned, we need to make it relative
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
            parent.style.position = 'relative';
        }

        // Add controls to parent
        parent.appendChild(controlContainer);

        // Hide controls when video is not playing
        let hideTimeout;
        let isMouseOverControls = false;

        function showControls() {
            controlContainer.style.opacity = '1';
            controlContainer.style.pointerEvents = 'auto';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (!video.paused && !isMouseOverControls) {
                    hideControls();
                }
            }, 2000); // Hide after 2 seconds
        }

        function hideControls() {
            if (!isMouseOverControls) {
                controlContainer.style.opacity = '0';
                controlContainer.style.pointerEvents = 'none';
            }
        }

        // Show controls on hover
        video.addEventListener('mouseenter', showControls);

        // Show controls when mouse moves inside video
        video.addEventListener('mousemove', showControls);

        video.addEventListener('mouseleave', () => {
            if (!isMouseOverControls) {
                hideControls();
            }
        });

        // Add touch events for mobile support
        video.addEventListener('touchstart', (e) => {
            e.preventDefault();
            showControls();
        });

        // Also show controls on touch move for mobile
        video.addEventListener('touchmove', (e) => {
            e.preventDefault();
            showControls();
        });

        // Control container mouse events
        controlContainer.addEventListener('mouseenter', () => {
            isMouseOverControls = true;
            controlContainer.style.opacity = '1';
            controlContainer.style.pointerEvents = 'auto';
            clearTimeout(hideTimeout);
        });

        controlContainer.addEventListener('mouseleave', () => {
            isMouseOverControls = false;
            hideControls();
        });

        // Add touch events for controls on mobile
        controlContainer.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            showControls();
        });

        // Show controls when video is played/paused
        video.addEventListener('play', showControls);
        video.addEventListener('pause', () => {
            controlContainer.style.opacity = '1';
            controlContainer.style.pointerEvents = 'auto';
            clearTimeout(hideTimeout);
        });

        // Apply the saved speed to this video
        const savedSpeed = getSavedSpeed();
        if (savedSpeed !== video.playbackRate) {
            video.playbackRate = savedSpeed;
            console.log('[Video Speed Control] Applied saved speed:', savedSpeed);
        }

        // Update the display to show the current speed
        updateSpeedDisplay(video.playbackRate);

        // Initially show controls
        showControls();
    }

    // Function to show controls for any video
    function showControlsForVideo(video) {
        const controlContainer = video.parentElement?.querySelector('div[style*="position: absolute"]');
        if (controlContainer) {
            controlContainer.style.opacity = '1';
            controlContainer.style.pointerEvents = 'auto';
            setTimeout(() => {
                if (!video.paused) {
                    controlContainer.style.opacity = '0';
                    controlContainer.style.pointerEvents = 'none';
                }
            }, 2000);
        }
    }

    // Function to find and add controls to all videos
    function processVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.dataset.speedControlAdded) {
                addSpeedControls(video);
            }
        });
    }

    // Initial processing
    processVideos();

    // Set up a MutationObserver to detect new videos
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check if any video elements were added
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeName === 'VIDEO' || (node.querySelectorAll && node.querySelectorAll('video').length > 0)) {
                        shouldProcess = true;
                        break;
                    }
                }
            }
        });

        if (shouldProcess) {
            setTimeout(processVideos, 100);
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also process videos periodically as a fallback
    setInterval(processVideos, 2000);

    // Simple keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Skip if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Get first video element
        const video = document.querySelector('video');
        if (!video) return;

        switch (e.key) {
            case '-':
                e.preventDefault();
                // Find current speed index and move to previous
                let minusIndex = SPPEDS.indexOf(video.playbackRate);
                if (minusIndex <= 0) minusIndex = 1; // Prevent going below first element
                video.playbackRate = SPPEDS[minusIndex - 1];
                saveSpeed(video.playbackRate);
                showControlsForVideo(video);
                break;
            case '+':
                e.preventDefault();
                // Find current speed index and move to next
                let plusIndex = SPPEDS.indexOf(video.playbackRate);
                if (plusIndex === -1 || plusIndex >= SPPEDS.length - 1) plusIndex = SPPEDS.length - 2; // Prevent going above last element
                video.playbackRate = SPPEDS[plusIndex + 1];
                saveSpeed(video.playbackRate);
                showControlsForVideo(video);
                break;
            case '1':
            case '2':
            case '3':
                e.preventDefault();
                const speedValue = parseInt(e.key);
                video.playbackRate = speedValue;
                saveSpeed(speedValue);
                showControlsForVideo(video);
                break;
        }
    });
})();
