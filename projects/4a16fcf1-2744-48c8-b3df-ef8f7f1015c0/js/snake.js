// ===============================================
// snake.js - Core Snake Logic & Movement
// Global scope, file:// compatible, production-ready
// Handles position tracking, direction changes, body growth, keyboard input
// ===============================================

// Global snake state (shared across renderer, game, app, demo-data)
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let growNextMove = false;

// Initialize snake at center of 20x20 grid, length 3, moving right
function initSnake() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  growNextMove = false;
  console.log('%c✅ Snake initialized - length: ' + snake.length, 'color:#00ff9f; font-family:monospace;');
}

// Prevent reverse direction and queue next move (called by keyboard or swipe)
function setDirection(newDx, newDy) {
  // Safety check - invalid direction
  if (Math.abs(newDx) + Math.abs(newDy) !== 1) return;

  // Prevent 180-degree reversal (classic Snake rule)
  if (direction.x === -newDx && direction.y === -newDy) {
    return;
  }

  nextDirection = { x: newDx, y: newDy };
}

// Keyboard handler - arrow keys only (exposed globally for app.js)
function handleKeyDown(e) {
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;

  e.preventDefault(); // prevent page scroll

  let newDx = direction.x;
  let newDy = direction.y;

  switch (e.key) {
    case 'ArrowLeft':  newDx = -1; newDy = 0; break;
    case 'ArrowRight': newDx = 1;  newDy = 0; break;
    case 'ArrowUp':    newDx = 0;  newDy = -1; break;
    case 'ArrowDown':  newDx = 0;  newDy = 1; break;
  }

  setDirection(newDx, newDy);
}

// Core movement logic - called every game tick by game.js
// Returns new head position for collision checks
function moveSnake() {
  if (snake.length === 0) return null;

  // Apply queued direction
  direction = { ...nextDirection };

  // Calculate new head
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Add new head to front
  snake.unshift(head);

  // Remove tail unless growing this tick
  if (!growNextMove) {
    snake.pop();
  } else {
    growNextMove = false;
  }

  return head;
}

// Grow snake on next move (called by game.js when food is eaten)
function growSnake() {
  growNextMove = true;
}

// Check if a coordinate is occupied by snake body (used for food spawn & self-collision)
function isPositionOccupied(x, y) {
  return snake.some(segment => segment.x === x && segment.y === y);
}

// Get current snake head (for game collision detection)
function getSnakeHead() {
  return snake.length > 0 ? snake[0] : null;
}

// Reset snake to initial state for new game
function resetSnake() {
  initSnake();
}

// Public API for other files (all globals are already accessible in shared scope)
console.log('%c✅ Snake logic module loaded - keyboard + movement ready', 'color:#00ff9f; font-family:monospace;');