/**
 * Snake Game - Main Application
 * Event handlers, keyboard controls, mobile touch controls
 */

(function() {
    'use strict';

    // Touch control variables
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMinSwipe = 30;

    /**
     * Initialize application
     */
    function init() {
        initKeyboardControls();
        initMobileControls();
        initButtons();
        initMobileTouchSwipe();
    }

    /**
     * Initialize keyboard controls
     */
    function initKeyboardControls() {
        document.addEventListener('keydown', function(e) {
            var gameState = window.getGameState ? window.getGameState() : null;
            
            // Ignore if no game state
            if (!gameState) return;
            
            // Handle pause with Escape or P
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                if (!gameState.isRunning) return;
                
                if (gameState.isPaused) {
                    window.resumeGame();
                } else {
                    window.pauseGame();
                }
                return;
            }
            
            // Ignore other keys if game not running
            if (!gameState.isRunning || gameState.isPaused) return;
            
            var direction = null;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = { x: 0, y: -1 };
                    e.preventDefault();
                    break;
                    
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = { x: 0, y: 1 };
                    e.preventDefault();
                    break;
                    
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = { x: -1, y: 0 };
                    e.preventDefault();
                    break;
                    
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = { x: 1, y: 0 };
                    e.preventDefault();
                    break;
            }
            
            if (direction && window.changeDirection) {
                window.changeDirection(direction);
            }
        });
    }

    /**
     * Initialize mobile on-screen controls
     */
    function initMobileControls() {
        var directions = {
            'btnUp': { x: 0, y: -1 },
            'btnDown': { x: 0, y: 1 },
            'btnLeft': { x: -1, y: 0 },
            'btnRight': { x: 1, y: 0 }
        };
        
        for (var btnId in directions) {
            var btn = document.getElementById(btnId);
            if (!btn) continue;
            
            // Touch events
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.classList.add('active');
                handleControlButton(this.dataset.direction);
            }, { passive: false });
            
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.classList.remove('active');
            }, { passive: false });
            
            // Mouse events for testing
            btn.addEventListener('mousedown', function() {
                this.classList.add('active');
                handleControlButton(this.dataset.direction);
            });
            
            btn.addEventListener('mouseup', function() {
                this.classList.remove('active');
            });
            
            btn.addEventListener('mouseleave', function() {
                this.classList.remove('active');
            });
            
            // Set direction data
            var dir = directions[btnId];
            btn.dataset.direction = JSON.stringify(dir);
        }
    }

    /**
     * Handle control button press
     */
    function handleControlButton(directionStr) {
        try {
            var direction = JSON.parse(directionStr);
            var gameState = window.getGameState ? window.getGameState() : null;
            
            if (!gameState || !gameState.isRunning || gameState.isPaused) return;
            
            if (direction && window.changeDirection) {
                window.changeDirection(direction);
            }
        } catch (e) {
            console.warn('Invalid direction:', directionStr);
        }
    }

    /**
     * Initialize mobile swipe controls
     */
    function initMobileTouchSwipe() {
        var gameCanvas = document.getElementById('gameCanvas');
        if (!gameCanvas) return;
        
        gameCanvas.addEventListener('touchstart', function(e) {
            var touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });
        
        gameCanvas.addEventListener('touchend', function(e) {
            var touch = e.changedTouches[0];
            var deltaX = touch.clientX - touchStartX;
            var deltaY = touch.clientY - touchStartY;
            
            // Check minimum swipe distance
            if (Math.abs(deltaX) < touchMinSwipe && Math.abs(deltaY) < touchMinSwipe) {
                return;
            }
            
            var gameState = window.getGameState ? window.getGameState() : null;
            if (!gameState || !gameState.isRunning || gameState.isPaused) return;
            
            var direction = null;
            
            // Determine swipe direction (horizontal vs vertical)
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                direction = { x: deltaX > 0 ? 1 : -1, y: 0 };
            } else {
                // Vertical swipe
                direction = { x: 0, y: deltaY > 0 ? 1 : -1 };
            }
            
            if (direction && window.changeDirection) {
                window.changeDirection(direction);
            }
        }, { passive: true });
    }

    /**
     * Initialize button handlers
     */
    function initButtons() {
        // Start button
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                if (window.initAudio) window.initAudio();
                if (window.playClickSound) window.playClickSound();
                
                window.hideOverlay('startOverlay');
                window.startGame();
            });
        }
        
        // Restart button
        var restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                if (window.playClickSound) window.playClickSound();
                
                window.hideOverlay('gameOverOverlay');
                window.resetGame();
                window.startGame();
            });
        }
        
        // Resume button
        var resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', function() {
                if (window.playClickSound) window.playClickSound();
                window.resumeGame();
            });
        }
        
        // Pause button
        var pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                if (window.playClickSound) window.playClickSound();
                
                var gameState = window.getGameState ? window.getGameState() : null;
                if (!gameState || !gameState.isRunning) return;
                
                if (gameState.isPaused) {
                    window.resumeGame();
                    this.textContent = 'Pause';
                } else {
                    window.pauseGame();
                    this.textContent = 'Resume';
                }
            });
        }
        
        // Sound toggle button
        var soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.addEventListener('click', function() {
                var enabled = window.toggleSound ? window.toggleSound() : false;
                this.textContent = enabled ? 'Sound: On' : 'Sound: Off';
            });
        }
        
        // Keyboard accessibility for buttons
        document.querySelectorAll('.btn').forEach(function(btn) {
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();