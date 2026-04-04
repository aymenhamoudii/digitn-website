// Generate the game grid dynamically
function generateGameGrid(size) {
  const grid = document.getElementById('game-grid');
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.style.border = '1px solid #6a4c93';
    cell.style.backgroundColor = '#f1f5f9';
    cell.classList.add('grid-cell');
    grid.appendChild(cell);
  }
}

// Initialize the grid
window.addEventListener('DOMContentLoaded', () => {
  generateGameGrid(20); // Default grid size: 20x20
});