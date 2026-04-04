// Demo data initialization
function initDemoData() {
  const isSeeded = localStorage.getItem('demoSeeded');
  if (!isSeeded) {
    localStorage.setItem('snakeHighScore', '15'); // Seed a high score
    localStorage.setItem('demoSeeded', 'true');
  }
}

// Call demo data initialization
initDemoData();