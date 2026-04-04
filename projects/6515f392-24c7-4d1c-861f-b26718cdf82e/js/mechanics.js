// Game Mechanics
function updateScore(points) {
  score += points;
  document.getElementById("scores").innerText = `Score: ${score}`;
}

function checkGameEndCondition() {
  if (score >= 100) {
    alert("You Win!");
    resetGame();
  }
}

function resetGame() {
  gameRunning = false;
  score = 0;
  document.getElementById("scores").innerText = "Score: 0";
  startGame();
}

// Example mechanic: collect item
function collectItem() {
  updateScore(10);
  checkGameEndCondition();
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      collectItem();
    }
  });
});