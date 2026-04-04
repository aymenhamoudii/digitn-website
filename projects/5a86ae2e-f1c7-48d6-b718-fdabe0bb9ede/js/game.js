const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverlay = document.getElementById('gameOverlay');
const restartBtn = document.getElementById('restartBtn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100;

const COLORS = {
  boardBg: '#1a2e1a',
  boardBorder: '#2d4a2d',
  snakePrimary: '#4ade80',
  snakeSecondary: '#22c55e',
  snakeHead: '#16a34a',
  foodColor: '#ef4444',
  foodGlow: '#fca5a5',
  gridLine: 'rgba(45, 74, 45, 0.3)'
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameLoop = null;
let isGameOver = false;

function initGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isGameOver = false;
  
  scoreElement.textContent = score;
  gameOverlay.classList.remove('visible');
  
  spawnFood();
  render();
}

function spawnFood() {
  let validPosition = false;
  let newFood = { x: 0, y: 0 };
  
  while (!validPosition) {
    newFood.x = Math.floor(Math.random() * TILE_COUNT);
    newFood.y = Math.floor(Math.random() * TILE_COUNT);
    
    validPosition = !snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );
  }
  
  food = newFood;
}

function update() {
  if (isGameOver) return;
  
  direction = { ...nextDirection };
  
  const head = { 
    x: snake[0].x + direction.x, 
    y: snake[0].y + direction.y 
  };
  
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver();
    return;
  }
  
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }
  
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }
}

function render() {
  ctx.fillStyle = COLORS.boardBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
  
  const padding = 2;
  const radius = 3;
  
  snake.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE + padding;
    const y = segment.y * GRID_SIZE + padding;
    const size = GRID_SIZE - padding * 2;
    
    if (index === 0) {
      ctx.fillStyle = COLORS.snakeHead;
    } else {
      const gradient = ctx.createRadialGradient(
        x + size / 2, y + size / 2, 0,
        x + size / 2, y + size / 2, size / 2
      );
      gradient.addColorStop(0, COLORS.snakePrimary);
      gradient.addColorStop(1, COLORS.snakeSecondary);
      ctx.fillStyle = gradient;
    }
    
    roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
  });
  
  const foodPadding = 3;
  const foodX = food.x * GRID_SIZE + foodPadding;
  const foodY = food.y * GRID_SIZE + foodPadding;
  const foodSize = GRID_SIZE - foodPadding * 2;
  
  ctx.shadowColor = COLORS.foodGlow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = COLORS.foodColor;
  roundRect(ctx, foodX, foodY, foodSize, foodSize, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameLoop);
  finalScoreElement.textContent = score;
  gameOverlay.classList.add('visible');
}

function startGame() {
  if (gameLoop) {
    clearInterval(gameLoop);
  }
  initGame();
  gameLoop = setInterval(() => {
    update();
    render();
  }, GAME_SPEED);
}

function handleKeydown(e) {
  const keyMap = {
    'ArrowUp': { x: 0, y: -1 },
    'ArrowDown': { x: 0, y: 1 },
    'ArrowLeft': { x: -1, y: 0 },
    'ArrowRight': { x: 1, y: 0 },
    'w': { x: 0, y: -1 },
    'W': { x: 0, y: -1 },
    's': { x: 0, y: 1 },
    'S': { x: 0, y: 1 },
    'a': { x: -1, y: 0 },
    'A': { x: -1, y: 0 },
    'd': { x: 1, y: 0 },
    'D': { x: 1, y: 0 }
  };
  
  const newDir = keyMap[e.key];
  if (!newDir) return;
  
  if (newDir.x !== 0 && direction.x !== 0) return;
  if (newDir.y !== 0 && direction.y !== 0) return;
  
  e.preventDefault();
  nextDirection = newDir;
}

document.addEventListener('keydown', handleKeydown);
restartBtn.addEventListener('click', startGame);

startGame();
