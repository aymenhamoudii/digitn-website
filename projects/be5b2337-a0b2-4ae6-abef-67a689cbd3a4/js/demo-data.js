// Seed demo data on first load
function initDemoData() {
  if (!localStorage.getItem('demoSeeded')) {
    localStorage.setItem('highScore', '50');
    localStorage.setItem('demoSeeded', 'true');
  }
}

// Load demo high score
function loadDemoHighScore() {
  const highScore = localStorage.getItem('highScore');
  const scoreboard = document.getElementById('scoreboard');
  const highScoreElement = document.createElement('div');
  highScoreElement.id = 'high-score';
  highScoreElement.textContent = `High Score: ${highScore}`;
  scoreboard.appendChild(highScoreElement);
}

window.addEventListener('DOMContentLoaded', () => {
  initDemoData();
  loadDemoHighScore();
});