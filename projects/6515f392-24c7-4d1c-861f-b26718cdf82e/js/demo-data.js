// Demo Data Seeder
function initDemoData() {
  if (!localStorage.getItem("demoSeeded")) {
    const demoScores = [
      { player: "Alex", score: 80 },
      { player: "Sam", score: 60 },
      { player: "Jamie", score: 100 },
      { player: "Taylor", score: 90 },
    ];

    localStorage.setItem("leaderboard", JSON.stringify(demoScores));
    localStorage.setItem("demoSeeded", true);
  }

  renderScores();
}

function renderScores() {
  const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const scoreboard = document.getElementById("scores");
  scoreboard.innerHTML = "";
  
  scores.forEach((entry, index) => {
    const scoreText = document.createElement("p");
    scoreText.innerText = `${index + 1}. ${entry.player} - ${entry.score} PTS`;
    scoreboard.appendChild(scoreText);
  });
}

document.addEventListener("DOMContentLoaded", initDemoData);