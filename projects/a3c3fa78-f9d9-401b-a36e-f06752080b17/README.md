# NEON DRIVE | MINIMALIST ENDLESS RACER

A top-down endless car game built with pure HTML5, CSS3, and JavaScript.

## Features
- **Endless Gameplay**: Procedurally generated road and traffic that gets harder over time.
- **Minimalist Design**: Clean, high-contrast neon aesthetic with fluid animations.
- **Upgrade System**: Collect "Bits" to improve your car's top speed and handling in the Garage.
- **Responsive Controls**: Supports both Arrow keys and WASD.
- **Audio Feedback**: Procedural sound effects using the Web Audio API.

## Setup Instructions
1. Open `index.html` in any modern web browser.
2. Click **START ENGINE** to begin.
3. Use **WASD** or **Arrow Keys** to steer and control acceleration.
4. Collect Bits (earned by distance) to purchase upgrades.

## Project Structure
- `index.html`: Entry point and UI structure.
- `css/style.css`: Visual styling and minimalist theme.
- `js/`:
  - `game.js`: Core engine and state management.
  - `player.js`: Player vehicle physics and rendering.
  - `road.js`: Procedural road generation.
  - `traffic.js`: Enemy AI and spawning logic.
  - `upgrades.js`: Stats and shop mechanics.
  - `input.js`: Keyboard handling.
  - `audio.js`: Sound synthesis.
  - `utils.js`: Math and helper functions.

## Technical Details
- **Rendering**: HTML5 Canvas API (2D Context).
- **Physics**: AABB Collision detection.
- **Data Persistence**: LocalStorage for high scores, bits, and upgrades.
- **Accessibility**: Semantic HTML and keyboard-navigable menus.
