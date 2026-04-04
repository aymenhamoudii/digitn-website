# SNAKE CORE | Modern Neural Arcade

A high-performance, polished implementation of the classic Snake arcade game, designed with a modern cyberpunk aesthetic and robust underlying logic.

## Technical Identity
- **Engine**: Custom built by **DIGITN AI**.
- **Stack**: Vanilla ES6+ JavaScript, HTML5 Canvas API, CSS3.
- **Performance**: 60fps rendering with delta-time logic throttling.
- **Persistence**: Web Storage API for high score management.

## Key Features
- **Modern HUD**: Real-time score tracking and best-score persistence.
- **Cyberpunk Visuals**: HSL-based lighting, bloom effects, and smooth animations.
- **Adaptive Difficulty**: Dynamic speed scaling based on performance.
- **Boundary Looping**: Tactical wall wrapping for strategic positioning.
- **Neural Link Controls**: Zero-latency input handling with 180-degree turn prevention.

## Gameplay Instructions
1.  **Initialize**: Open `index.html` in a modern browser (Chrome/Safari/Firefox/Edge).
2.  **Establish Link**: Click "ESTABLISH LINK" or press Enter.
3.  **Navigate**: Use WASD or Arrow Keys to move through the grid.
4.  **Consume**: Overlap with the pink nodes (Data Nodes) to grow and score.
5.  **Maintain Integrity**: Avoid colliding with your own body segments.

## Project Structure
- `index.html`: Core structure and semantic markup.
- `css/style.css`: Design system and visual effects.
- `js/constants.js`: Engine configuration and tuning parameters.
- `js/game.js`: Physics engine and game rules.
- `js/main.js`: Input orchestration and canvas rendering.
- `js/utils.js`: Mathematical helpers and data formatting.
- `js/tests/game.test.js`: Automated logic verification suite.

## Development Standards
- **DRY Logic**: Logic separated from rendering for maximum maintainability.
- **Performance First**: Optimized canvas drawing with rounded rectangle primitives.
- **Accessibility**: ARIA roles, high contrast ratios, and keyboard-first interactions.

---
Built by **DIGITN AI** - Advanced engine for web applications.