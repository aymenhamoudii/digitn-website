// ===============================================
// renderer.js - Canvas Renderer for Retro Neon Snake
// Global scope, file:// compatible, production-ready
// ===============================================

// Global canvas references (shared across all JS files)
let canvas;
let ctx;

// Game constants - 20x20 grid (classic Snake feel)
const GRID_SIZE = 20;
const CELL_SIZE = 32; // 640px / 20 = perfect retro pixels

// Initialize the renderer once DOM is ready
// Called from app.js
function initRenderer() {
  canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Snake renderer: Canvas element not found');
    return false;
  }
  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    console.error('Snake renderer: Could not get 2D context');
    return false;
  }
  // Retro pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  return true;
}

// Clear canvas with deep obsidian background
function clearCanvas() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw faint cyber-grid background (retro arcade board)
function drawGrid() {
  ctx.strokeStyle = '#1a1a22';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }
}

// Draw snake with electric lime neon glow
// snake = [{x: number, y: number}, ...] - head first
function drawSnake(snake) {
  if (!snake || snake.length === 0) return;

  // Neon glow effect
  ctx.shadowColor = '#00ff9f';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#00ff9f';

  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE + 2;
    const y = segment.y * CELL_SIZE + 2;
    const size = CELL_SIZE - 4;

    ctx.fillRect(x, y, size, size);

    // Head detail - simple eyes for classic Snake personality
    if (index === 0) {
      ctx.fillStyle = '#0a0a0f';
      const eyeSize = Math.floor(CELL_SIZE / 7);
      // Left eye
      ctx.fillRect(x + size * 0.25, y + size * 0.3, eyeSize, eyeSize);
      // Right eye
      ctx.fillRect(x + size * 0.65, y + size * 0.3, eyeSize, eyeSize);
      ctx.fillStyle = '#00ff9f'; // reset for body
    }
  });

  // Reset shadow for next draw
  ctx.shadowBlur = 0;
}

// Draw food as glowing crimson orb
function drawFood(food) {
  if (!food) return;

  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
  const radius = CELL_SIZE / 3.2;

  // Outer neon glow
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#ff3366';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright core for "glowing orb" effect
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3.5, 0, Math.PI * 2);
  ctx.fill();
}

// Main global render function
// Called every frame by the game loop (in game.js / app.js)
// snake and food come from game state
function renderGame(snake, food) {
  if (!ctx) return;
  clearCanvas();
  drawGrid();
  drawSnake(snake);
  drawFood(food);
}

// Optional utility to force a single render (used during pause / init)
function forceRender(snake, food) {
  renderGame(snake, food);
}

// Expose renderer init for app.js to call safely
// No automatic loop here - game.js controls timing for classic Snake tick rate
console.log('%c✅ Snake Renderer initialized - ready for game loop', 'color:#00ff9f; font-family:monospace;');