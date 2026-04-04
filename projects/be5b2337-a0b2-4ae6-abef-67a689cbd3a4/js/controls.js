document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.y === 0) {
        direction = { x: 0, y: -1 };
      }
      break;
    case 'ArrowDown':
    case 's':
      if (direction.y === 0) {
        direction = { x: 0, y: 1 };
      }
      break;
    case 'ArrowLeft':
    case 'a':
      if (direction.x === 0) {
        direction = { x: -1, y: 0 };
      }
      break;
    case 'ArrowRight':
    case 'd':
      if (direction.x === 0) {
        direction = { x: 1, y: 0 };
      }
      break;
  }
});

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

startButton.addEventListener('click', () => {
  direction = { x: 0, y: -1 }; // Start moving upwards
});

restartButton.addEventListener('click', () => {
  resetGame();
});