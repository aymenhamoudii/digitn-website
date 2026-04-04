let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
const gridSize = 20;

function moveSnake() {
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Check for collisions
  if (
    newHead.x < 0 ||
    newHead.x >= gridSize ||
    newHead.y < 0 ||
    newHead.y >= gridSize ||
    snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    alert('Game Over!');
    resetGame();
    return;
  }

  // Add the new head
  snake.unshift(newHead);

  // Check for food
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    updateScore();
    generateFood();
  } else {
    snake.pop();
  }

  drawSnakeAndFood();
}

function drawSnakeAndFood() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.style.backgroundColor = '#f1f5f9'));

  // Draw snake
  snake.forEach(segment => {
    const index = segment.y * gridSize + segment.x;
    cells[index].style.backgroundColor = '#4a80f6';
  });

  // Draw food
  const foodIndex = food.y * gridSize + food.x;
  cells[foodIndex].style.backgroundColor = '#f65a82';
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

function updateScore() {
  document.getElementById('score').textContent = score;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  food = { x: 5, y: 5 };
  score = 0;
  updateScore();
  drawSnakeAndFood();
}

window.addEventListener('DOMContentLoaded', () => {
  drawSnakeAndFood();
  setInterval(moveSnake, 200);
});