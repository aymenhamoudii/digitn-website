// Core Game Logic
let gameRunning = false;
let score = 0;
let playerPosition = { x: 5, y: 5 };
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

function drawPlayer() {
  context.fillStyle = "#ffcc00";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(playerPosition.x * 20, playerPosition.y * 20, 20, 20);
}

function updateGame() {
  if (!gameRunning) return;

  // Handle game updates (collision, scoring, etc.)
  drawPlayer();
}

function movePlayer(direction) {
  if (direction === "ArrowUp" && playerPosition.y > 0) {
    playerPosition.y -= 1;
  } else if (direction === "ArrowDown" && playerPosition.y < canvas.height / 20 - 1) {
    playerPosition.y += 1;
  } else if (direction === "ArrowLeft" && playerPosition.x > 0) {
    playerPosition.x -= 1;
  } else if (direction === "ArrowRight" && playerPosition.x < canvas.width / 20 - 1) {
    playerPosition.x += 1;
  }
  drawPlayer();
}

function startGame() {
  gameRunning = true;
  score = 0;
  playerPosition = { x: 5, y: 5 };
  drawPlayer();
}

function handleKeyDown(event) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    movePlayer(event.key);
  }
}

function initializeGame() {
  canvas.width = 600;
  canvas.height = 400;
  document.addEventListener("keydown", handleKeyDown);
  startGame();
}

document.addEventListener("DOMContentLoaded", initializeGame);