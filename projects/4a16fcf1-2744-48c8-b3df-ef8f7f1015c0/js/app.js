// ===============================================
// app.js - UI Controls & Application Glue for Retro Neon Snake
// Global scope, file:// compatible, production-ready
// Connects renderer + snake + game modules, handles overlays, keyboard, touch swipe, start/restart
// ===============================================

function initApp() {
  console.log('%c🚀 Initializing DIGITN Snake UI controls...', 'color:#ffcc33; font-family:monospace;');

  // Initialize renderer (must be first)
  const rendererInitSuccess = initRenderer();
  if (!rendererInitSuccess) {
    console.error('Renderer failed to initialize');
    return;
  }

  // Initialize core game state (renders initial snake + food under start overlay)
  initGame();

  // Ensure high score display shows seeded demo value immediately (post-DOM)
  if (typeof updateHighScoreDisplay === 'function') {
    updateHighScoreDisplay();
  }

  // Monkey-patch endGame (per game.js comment "Game over overlay handled in app.js")
  // This ensures overlay appears with final score + new high score badge
  const originalEndGame = endGame;
  endGame = function() {
    const oldHighScore = highScore;
    originalEndGame();

    // Show game over overlay
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');

      // Update final score display
      const finalScoreEl = document.getElementById('final-score-display');
      if (finalScoreEl) {
        finalScoreEl.textContent = String(score).padStart(3, '0');
      }

      // Show "NEW HIGH SCORE" badge if applicable
      const newHighEl = document.getElementById('new-high-score');
      if (newHighEl) {
        if (score > oldHighScore) {
          newHighEl.classList.remove('hidden');
        } else {
          newHighEl.classList.add('hidden');
        }
      }
    }
  };

  // Keyboard controls (snake.js handler already defined globally)
  document.addEventListener('keydown', handleKeyDown);

  // Pause/resume support (Space or P key)
  document.addEventListener('keydown', function(e) {
    if ((e.key === ' ' || e.key.toLowerCase() === 'p') && gameRunning) {
      e.preventDefault();
      togglePause();
    }
  });

  // Start button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      const startOverlay = document.getElementById('start-overlay');
      if (startOverlay) startOverlay.classList.add('hidden');
      startGame();
    });
  }

  // Restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      const gameOverOverlay = document.getElementById('game-over-overlay');
      if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
      startGame();
    });
  }

  // Mobile touch swipe support (direction changes without arrows)
  let touchStartX = 0;
  let touchStartY = 0;
  const canvasEl = document.getElementById('game-canvas');
  if (canvasEl) {
    canvasEl.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvasEl.addEventListener('touchend', function(e) {
      if (!gameRunning || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipe = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipe) {
        // Horizontal swipe
        if (deltaX > 0) setDirection(1, 0);
        else setDirection(-1, 0);
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipe) {
        // Vertical swipe
        if (deltaY > 0) setDirection(0, 1);
        else setDirection(0, -1);
      }
    }, { passive: true });
  }

  // Ensure start overlay is visible on load
  const startOverlay = document.getElementById('start-overlay');
  if (startOverlay) {
    startOverlay.classList.remove('hidden');
  }

  console.log('%c✅ DIGITN Snake fully connected - UI, inputs, overlays, swipe & pause active!', 'color:#00ff9f; font-family:monospace;');
}

// Auto-initialize when DOM is ready (classic script execution)
document.addEventListener('DOMContentLoaded', initApp);

// Global hook so demo-data.js can force re-init after seeding if needed
window.initSnakeApp = initApp;

console.log('%c✅ app.js loaded - UI controls & glue layer ready', 'color:#00ff9f; font-family:monospace;');