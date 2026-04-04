/**
 * scoring.js
 * Tracks distance, coins, and manages the High Score.
 */

export class ScoringSystem {
    constructor() {
        this.distance = 0;
        this.coins = 0;
        this.highScore = parseInt(localStorage.getItem('pixelNitroHighScore')) || 0;
        
        // HUD Elements
        this.els = {
            score: document.getElementById('score-val'),
            coins: document.getElementById('coins-val'),
            health: document.getElementById('health-bar'),
            boost: document.getElementById('boost-bar')
        };
    }

    reset() {
        this.distance = 0;
        this.coins = 0;
        this.updateHUD(100, 0);
    }

    update(dt, speed) {
        // Distance is speed over time
        const distGain = (speed / 1000) * (dt / 16.67);
        this.distance += distGain;
    }

    addCoin() {
        this.coins += 10; // Worth 10 distance units or actual currency
    }

    updateHUD(health, nitro) {
        if (this.els.score) this.els.score.textContent = Math.floor(this.distance);
        if (this.els.coins) this.els.coins.textContent = this.coins;
        
        if (this.els.health) {
            this.els.health.style.width = `${health}%`;
            // Color feedback
            this.els.health.style.background = health > 50 ? '#00ff00' : (health > 25 ? '#ffff00' : '#ff0000');
        }

        if (this.els.boost) {
            this.els.boost.style.width = `${nitro}%`;
        }
    }

    saveHighScore() {
        if (this.distance > this.highScore) {
            this.highScore = this.distance;
            localStorage.setItem('pixelNitroHighScore', Math.floor(this.highScore));
        }
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
}
