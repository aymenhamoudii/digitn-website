// ===============================================
// demo-data.js - Demo Seeding for Instant Preview
// Global scope, file:// compatible, production-ready
// Seeds realistic high score (320 points) on first load only
// ===============================================

function initDemoData() {
  if (localStorage.getItem('demoSeeded') === 'true') {
    return;
  }

  // Seed realistic high score - impressive but achievable in classic Snake
  localStorage.setItem('snakeHighScore', '320');
  localStorage.setItem('demoSeeded', 'true');

  // Override global highScore (already declared in game.js)
  if (typeof highScore !== 'undefined') {
    highScore = 320;
  }

  // Force UI update if display function exists
  if (typeof updateHighScoreDisplay === 'function') {
    updateHighScoreDisplay();
  }

  console.log('%c✅ Demo data seeded - High Score: 320 points (instant preview ready)', 'color:#ffcc33; font-family:monospace;');
}

// Run immediately when script loads (before DOMContentLoaded in app.js)
initDemoData();

console.log('%c✅ demo-data.js loaded - high score demo ready', 'color:#00ff9f; font-family:monospace;');