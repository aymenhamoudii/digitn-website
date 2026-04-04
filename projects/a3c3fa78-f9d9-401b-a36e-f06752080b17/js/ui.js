/**
 * UI Controller
 * Manages all overlay transitions and menu interactions
 */

class UIController {
  constructor() {
    this.overlays = {
      menu: document.getElementById('menu-overlay'),
      upgrades: document.getElementById('upgrade-overlay'),
      gameOver: document.getElementById('game-over-overlay')
    };
    
    this.setupListeners();
  }

  setupListeners() {
    // Menu Buttons
    document.getElementById('start-btn').addEventListener('click', () => {
      this.hideOverlay('menu');
      game.startGame();
      audio.play('start');
    });

    document.getElementById('upgrades-btn').addEventListener('click', () => {
      this.showOverlay('upgrades');
      this.updateUpgradeUI();
    });

    document.getElementById('close-upgrades-btn').addEventListener('click', () => {
      this.hideOverlay('upgrades');
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this.hideOverlay('gameOver');
      game.startGame();
      audio.play('start');
    });
  }

  showOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('hidden');
  }

  hideOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('hidden');
  }

  updateUpgradeUI() {
    // Sync UI with upgrade system levels and affordability
    if (window.upgrades) {
      window.upgrades.updateUI();
    }
  }
}

// Global UI instance
const ui = new UIController();
