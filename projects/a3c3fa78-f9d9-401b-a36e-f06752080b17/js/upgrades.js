/**
 * Upgrade System
 * Handles purchasing and applying vehicle improvements
 */

class UpgradeSystem {
  constructor() {
    this.upgrades = {
      speed: {
        level: parseInt(localStorage.getItem('neonDrive_up_speed')) || 0,
        maxLevel: 5,
        baseCost: 50,
        costMultiplier: 1.5,
        benefit: 2 // +2 top speed per level
      },
      handling: {
        level: parseInt(localStorage.getItem('neonDrive_up_handling')) || 0,
        maxLevel: 5,
        baseCost: 75,
        costMultiplier: 1.8,
        benefit: 1.5 // +1.5 lateral speed per level
      }
    };
    
    this.setupListeners();
  }

  setupListeners() {
    const upgradeSpeedBtn = document.getElementById('upgrade-speed-btn');
    const upgradeHandlingBtn = document.getElementById('upgrade-handling-btn');
    
    if (upgradeSpeedBtn) {
      upgradeSpeedBtn.addEventListener('click', () => this.purchase('speed'));
    }
    if (upgradeHandlingBtn) {
      upgradeHandlingBtn.addEventListener('click', () => this.purchase('handling'));
    }
  }

  getCost(type) {
    const up = this.upgrades[type];
    return Math.floor(up.baseCost * Math.pow(up.costMultiplier, up.level));
  }

  purchase(type) {
    const up = this.upgrades[type];
    const cost = this.getCost(type);
    
    if (game.bits >= cost && up.level < up.maxLevel) {
      game.bits -= cost;
      up.level++;
      
      // Save progress
      localStorage.setItem(`neonDrive_up_${type}`, up.level);
      game.saveBits();
      
      // Apply benefit immediately to player
      this.applyToPlayer();
      
      // Feedback
      audio.play('upgrade');
      ui.updateUpgradeUI();
    }
  }

  applyToPlayer() {
    if (!game || !game.player) return;

    // Base speed upgrades
    game.player.maxSpeed = 8 + (this.upgrades.speed.level * this.upgrades.speed.benefit);
    
    // Handling upgrades
    game.player.lateralSpeed = 5 + (this.upgrades.handling.level * this.upgrades.handling.benefit);
  }

  updateUI() {
    const speedBtn = document.getElementById('upgrade-speed-btn');
    const handlingBtn = document.getElementById('upgrade-handling-btn');
    
    // Update labels and check affordability
    this.updateButton(speedBtn, 'speed');
    this.updateButton(handlingBtn, 'handling');
  }

  updateButton(btn, type) {
    if (!btn) return;
    
    const up = this.upgrades[type];
    const cost = this.getCost(type);
    
    if (up.level >= up.maxLevel) {
      btn.textContent = 'MAXED';
      btn.disabled = true;
    } else {
      btn.textContent = `${cost} BITS`;
      btn.disabled = game.bits < cost;
    }
  }
}

// Global upgrade instance
const upgrades = new UpgradeSystem();
