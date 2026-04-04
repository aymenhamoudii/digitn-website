let currentScore = 0;
let highScore = 0;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
const gridSize = 20;

function initGame() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = '';
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.dataset.x = i;
      cell.dataset.y = j;
      gameContainer.appendChild(cell);
    }
  }

  document.addEventListener('keydown', handleKeyPress);
  setInterval(gameLoop, 100);
}

function handleKeyPress(event) {
  if (event.key === 'ArrowUp' && direction.y === 0) {
    direction = { x: 0, y: -1 };
  } else if (event.key === 'ArrowDown' && direction.y === 0) {
    direction = { x: 0, y: 1 };
  } else if (event.key === 'ArrowLeft' && direction.x === 0) {
    direction = { x: -1, y: 0 };
  } else if (event.key === 'ArrowRight' && direction.x === 0) {
    direction = { x: 1, y: 0 };
  }
}

function gameLoop() {
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (newHead.x === food.x && newHead.y === food.y) {
    currentScore++;
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }

  if (checkCollision(newHead)) {
    alert('Game Over!');
    resetGame();
    return;
  }

  snake.unshift(newHead);
  drawSnake();
}

function checkCollision(head) {
  return (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= gridSize ||
    head.y >= gridSize ||
    snake.some(part => part.x === head.x && part.y === head.y)
  );
}

function drawSnake() {
  const cells = document.querySelectorAll('#game-container div');
  cells.forEach(cell => cell.className = '');

  snake.forEach(part => {
    const cell = document.querySelector(`[data-x="${part.x}"][data-y="${part.y}"]`);
    if (cell) cell.classList.add('snake');
  });

  const foodCell = document.querySelector(`[data-x="${food.x}"][data-y="${food.y}"]`);
  if (foodCell) foodCell.classList.add('food');
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
}

function updateScore() {
  document.getElementById('current-score').textContent = currentScore;
  highScore = Math.max(highScore, currentScore);
  document.getElementById('high-score').textContent = highScore;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  currentScore = 0;
  updateScore();
  placeFood();
  drawSnake();
}

document.addEventListener('DOMContentLoaded', () => {
  resetGame();
  initGame();
});