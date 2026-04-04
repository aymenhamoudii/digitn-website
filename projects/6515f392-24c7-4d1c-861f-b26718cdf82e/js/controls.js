// Movement controls
const controls = {
  left: false,
  right: false
};

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') controls.left = true;
  if (e.key === 'ArrowRight') controls.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') controls.left = false;
  if (e.key === 'ArrowRight') controls.right = false;
});

// Update player position
function updatePlayerPosition() {
  if (controls.left) {
    gameState.player.x = Math.max(0, gameState.player.x - gameState.player.speed);
  }
  if (controls.right) {
    gameState.player.x = Math.min(canvas.width - gameState.player.width, gameState.player.x + gameState.player.speed);
  }
}

// Detect collisions
function checkCollisions() {
  gameState.sakeBottles.forEach((bottle, index) => {
    if (
      gameState.player.x < bottle.x + bottle.width &&
      gameState.player.x + gameState.player.width > bottle.x &&
      gameState.player.y < bottle.y + bottle.height &&
      gameState.player.y + gameState.player.height > bottle.y
    ) {
      // Collision detected
      gameState.score++;
      gameState.sakeBottles.splice(index, 1);
      document.getElementById('current-score').textContent = `Score: ${gameState.score}`;
    }
  });
}

// Integrate controls and collision updates
gameLoop = (function (originalLoop) {
  return function wrappedGameLoop() {
    updatePlayerPosition();
    checkCollisions();
    originalLoop();
  };
})(gameLoop);