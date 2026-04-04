// ===============================================
// game.js - Core Game Mechanics for Retro Neon Snake
// Global scope, file:// compatible, production-ready
// Food spawning, collision detection, scoring, game loop, pause/resume
// Integrates with snake.js + renderer.js
// ===============================================

// Global game state (shared with app.js, snake.js, renderer.js)
let score = 0;
let highScore = 0;
let gameRunning = false;
let gamePaused = false;
let gameInterval = null;
let tickRate = 160; // Classic Snake speed (ms per tick)
let food = null;
let lastTickTime = 0;

// Load high score from localStorage (demo data will seed this)
function loadHighScore() {
  const saved = localStorage.getItem('snakeHighScore');
  if (saved) {
    highScore = parseInt(saved, 10);
    updateHighScoreDisplay();
  }
}

// Save new high score
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore.toString());
    updateHighScoreDisplay();
  }
}

// Update UI displays (called after every score change)
function updateScoreDisplay() {
  const scoreEl = document.getElementById('score-display');
  if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0');
}

function updateHighScoreDisplay() {
  const highEl = document.getElementById('high-score-display');
  if (highEl) highEl.textContent = String(highScore).padStart(3, '0');
}

// Spawn food in random empty cell (never on snake)
function spawnFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * 20);
    y = Math.floor(Math.random() * 20);
  } while (isPositionOccupied(x, y));
  return { x: x, y: y };
}

// Wall collision check
function checkWallCollision(head) {
  return head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
}

// Self collision check (body only, head ignored)
function checkSelfCollision(head) {
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

// Main game tick - called by setInterval
function gameTick() {
  if (!gameRunning || gamePaused) return;

  const head = moveSnake();
  if (!head) return;

  // Collision detection
  if (checkWallCollision(head) || checkSelfCollision(head)) {
    endGame();
    return;
  }

  // Food eaten?
  if (head.x === food.x && head.y === food.y) {
    growSnake();
    score += 10;
    updateScoreDisplay();
    food = spawnFood();

    // Classic progressive speed increase every 50 points
    if (score % 50 === 0 && tickRate > 80) {
      tickRate -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(gameTick, tickRate);
    }
  }

  // Render updated state
  renderGame(snake, food);
}

// Start / resume the game loop
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, tickRate);
}

// Initialize a fresh game (called from app.js on start/restart)
function initGame() {
  resetSnake();
  score = 0;
  tickRate = 160;
  food = spawnFood();
  gameRunning = false;
  gamePaused = false;
  updateScoreDisplay();
  renderGame(snake, food);
  console.log('%c✅ Game initialized - ready to play', 'color:#00ff9f; font-family:monospace;');
}

// Start new game (hides overlays, starts loop)
function startGame() {
  if (gameRunning) return;
  initGame();
  gameRunning = true;
  gamePaused = false;
  startGameLoop();
  // Hide overlays will be called from app.js
}

// End game - show game over
function endGame() {
  gameRunning = false;
  if (gameInterval) clearInterval(gameInterval);
  saveHighScore();
  renderGame(snake, food); // final frame
  console.log('%cGame Over - Final score: ' + score, 'color:#ff3366; font-family:monospace;');
  // Game over overlay handled in app.js
}

// Toggle pause (Space or P key support)
function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  if (gamePaused) {
    clearInterval(gameInterval);
    console.log('%c⏸️ Game paused', 'color:#ffcc33; font-family:monospace;');
  } else {
    startGameLoop();
    console.log('%c▶️ Game resumed', 'color:#00ff9f; font-family:monospace;');
  }
}

// Reset everything for new game
function resetGame() {
  initGame();
}

// Public API (all globals accessible via shared scope)
loadHighScore();
console.log('%c✅ Game mechanics module loaded - collisions, scoring, loop ready', 'color:#00ff9f; font-family:monospace;');