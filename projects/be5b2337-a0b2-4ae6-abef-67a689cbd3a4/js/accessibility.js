let soundEnabled = true;

function toggleSound() {
  soundEnabled = !soundEnabled;
  const toggleButton = document.getElementById('sound-toggle');
  if (soundEnabled) {
    toggleButton.textContent = 'Sound: On';
  } else {
    toggleButton.textContent = 'Sound: Off';
  }
}

function playSound(soundName) {
  if (!soundEnabled) return;
  const audio = new Audio(`sounds/${soundName}.mp3`);
  audio.play();
}

function initAccessibilityFeatures() {
  const button = document.createElement('button');
  button.id = 'sound-toggle';
  button.textContent = 'Sound: On';
  button.setAttribute('aria-label', 'Toggle sound on or off');
  button.onclick = toggleSound;
  document.body.appendChild(button);

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      playSound('move');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAccessibilityFeatures();
});