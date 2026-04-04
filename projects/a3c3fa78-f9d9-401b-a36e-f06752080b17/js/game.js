/**
 * Core Game Engine
 * Orchestrates game states, loop, and overall logic
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Scale canvas to window size
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Game state
    this.state = 'MENU'; // MENU, PLAYING, UPGRADES, GAMEOVER
    this.lastTime = 0;
    this.score = 0;
    this.bits = parseInt(localStorage.getItem('neonDrive_bits')) || 0;
    this.distance = 0;
    
    // Sub-systems (initialized in order)
    this.road = new Road(this.canvas);
    this.player = new Player(this.canvas);
    this.traffic = new TrafficManager(this.canvas);
    
    // Start game loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    this.canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Refresh sub-systems if needed
    if (this.road) this.road = new Road(this.canvas);
    if (this.player) this.player = new Player(this.canvas);
    if (this.traffic) this.traffic = new TrafficManager(this.canvas);
  }

  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Limit dt to avoid spikes (e.g., when window loses focus)
    const fixedDt = Math.min(dt, 32);

    this.update(fixedDt);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // 1. Update Environments
    this.road.update(this.player.baseSpeed, dt);
    this.traffic.update(this.player.baseSpeed, dt);
    
    // 2. Update Player
    this.player.update(input, dt);

    // 3. Collision Detection (AABB)
    this.checkCollisions();

    // 4. Update Stats
    this.distance += (this.player.baseSpeed * dt) / 1000;
    this.score = Math.floor(this.distance);
    
    // Collect Bits over time
    if (Math.floor(this.distance) % 50 === 0 && this.player.baseSpeed > 1) {
      this.bits += 1;
      this.saveBits();
    }
  }

  checkCollisions() {
    const playerBox = {
      x: this.player.x + 5,
      y: this.player.y + 5,
      w: this.player.width - 10,
      h: this.player.height - 10
    };

    for (const enemy of this.traffic.enemies) {
      const enemyBox = {
        x: enemy.x + 5,
        y: enemy.y + 5,
        w: enemy.width - 10,
        h: enemy.height - 10
      };

      if (
        playerBox.x < enemyBox.x + enemyBox.w &&
        playerBox.x + playerBox.w > enemyBox.x &&
        playerBox.y < enemyBox.y + enemyBox.h &&
        playerBox.y + playerBox.h > enemyBox.y
      ) {
        this.gameOver();
        break;
      }
    }
  }

  draw() {
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render Layers
    this.road.draw();
    this.traffic.draw();
    this.player.draw();
    
    // Update UI Stats
    this.updateHUD();
  }

  updateHUD() {
    const speedEl = document.getElementById('speed-value');
    const distEl = document.getElementById('distance-value');
    const bitsEl = document.getElementById('bits-value');

    if (speedEl) speedEl.textContent = Math.floor(this.player.baseSpeed * 20);
    if (distEl) distEl.textContent = this.score;
    if (bitsEl) bitsEl.textContent = this.bits;
  }

  startGame() {
    this.state = 'PLAYING';
    this.reset();
  }

  gameOver() {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.player.isCrashed = true;
    
    // Trigger Game Over UI
    const finalDistEl = document.getElementById('final-distance');
    const finalBitsEl = document.getElementById('final-bits');
    if (finalDistEl) finalDistEl.textContent = this.score;
    if (finalBitsEl) finalBitsEl.textContent = this.bits;
    
    ui.showOverlay('game-over-overlay');
    audio.play('crash');
  }

  reset() {
    this.player.reset();
    this.traffic.reset();
    this.distance = 0;
    this.score = 0;
  }

  saveBits() {
    localStorage.setItem('neonDrive_bits', this.bits);
  }
}

// Initialization after all scripts load
window.addEventListener('load', () => {
  window.game = new Game();
});
