// Game constants
const BOARD_SIZE = 30;
const TILE_SIZE = 20;
const SNAKE_COLOR = '#0f0';
const FOOD_COLOR = '#f00';

// Game variables
let snake = [{ x: 15, y: 15 }];
let direction = { x: 0, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let highScore = 0;
let wrapMode = false;
let gameRunning = true;

// Canvas setup
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// DOM Elements
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const modeToggleBtn = document.getElementById('mode-toggle');

// Initialize high score from local storage
function loadHighScore() {
  highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  highScoreEl.textContent = highScore;
}

// Update high score
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreEl.textContent = highScore;
  }
}

// Handle key input for movement
function handleKeydown(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
}

// Place food at random position
function generateFood() {
  food = {
    x: Math.floor(Math.random() * BOARD_SIZE),
    y: Math.floor(Math.random() * BOARD_SIZE),
  };
}

// Check for collisions
function checkCollision() {
  const head = snake[0];

  // Wall collisions
  if (!wrapMode && (head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE)) {
    return true;
  }

  // Self collisions
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

// Update snake position
function updateSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (wrapMode) {
    head.x = (head.x + BOARD_SIZE) % BOARD_SIZE;
    head.y = (head.y + BOARD_SIZE) % BOARD_SIZE;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    currentScoreEl.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

// Draw game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = SNAKE_COLOR;
  snake.forEach(segment => {
    ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });

  // Draw food
  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// Main game loop
function gameLoop() {
  if (!gameRunning) return;

  updateSnake();

  if (checkCollision()) {
    gameRunning = false;
    alert('Game Over!');
    updateHighScore();
    return;
  }

  draw();
  setTimeout(gameLoop, 150);
}

// Toggle wrap mode
function toggleWrapMode() {
  wrapMode = !wrapMode;
  modeToggleBtn.textContent = `Wrap Mode: ${wrapMode ? 'ON' : 'OFF'}`;
}

// Event listeners
window.addEventListener('keydown', handleKeydown);
modeToggleBtn.addEventListener('click', toggleWrapMode);

// Initialize game
function initGame() {
  loadHighScore();
  generateFood();
  draw();
  gameLoop();
}

initGame();