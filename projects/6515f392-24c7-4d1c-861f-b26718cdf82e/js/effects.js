// Audio Feedback Setup
const backgroundMusic = new Audio("audio/background.mp3");
const collectEffect = new Audio("audio/collect.mp3");

function playBackgroundMusic() {
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  backgroundMusic.play();
}

function playCollectSound() {
  collectEffect.volume = 1.0;
  collectEffect.play();
}

function setupAudioControls() {
  const muteButton = document.createElement("button");
  muteButton.innerText = "Mute";
  muteButton.style.position = "absolute";
  muteButton.style.bottom = "10px";
  muteButton.style.right = "10px";
  muteButton.addEventListener("click", () => {
    if (backgroundMusic.muted) {
      backgroundMusic.muted = false;
      muteButton.innerText = "Mute";
    } else {
      backgroundMusic.muted = true;
      muteButton.innerText = "Unmute";
    }
  });
  document.body.appendChild(muteButton);
}

document.addEventListener("DOMContentLoaded", () => {
  playBackgroundMusic();
  setupAudioControls();
});