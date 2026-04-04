/**
 * engine.js
 * Manages the main game loop, canvas context, and state transitions.
 */

import { Player } from './player.js';
import { World } from './world.js';
import { ObstacleManager } from './obstacles.js';
import { ScoringSystem } from './scoring.js';
import { AudioManager } from './audio.js';
import { Shop } from './store.js';

export const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER',
    SHOP: 'SHOP'
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Handle High DPI displays
        this.setupCanvas();

        this.state = GameState.MENU;
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS target

        // Components
        this.audio = new AudioManager();
        this.scoring = new ScoringSystem();
        this.world = new World(this.canvas.width, this.canvas.height);
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.obstacles = new ObstacleManager(this.canvas.width, this.canvas.height);
        this.shop = new Shop(this.scoring);

        this.bindEvents();
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    setupCanvas() {
        // Logical resolution (pixel art scale)
        this.canvas.width = 900;
        this.canvas.height = 500;
        
        // Disable image smoothing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('shop-btn').addEventListener('click', () => this.openShop());
        document.getElementById('close-shop').addEventListener('click', () => this.closeShop());
        document.getElementById('menu-btn').addEventListener('click', () => this.goToMenu());

        window.addEventListener('keydown', (e) => this.player.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.player.handleKeyUp(e));
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.scoring.reset();
        this.player.reset();
        this.obstacles.reset();
        this.audio.playMusic('gameplay');
        this.updateUI();
    }

    openShop() {
        this.state = GameState.SHOP;
        this.updateUI();
    }

    closeShop() {
        this.state = GameState.MENU;
        this.updateUI();
    }

    goToMenu() {
        this.state = GameState.MENU;
        this.audio.playMusic('menu');
        this.updateUI();
    }

    gameOver() {
        this.state = GameState.GAMEOVER;
        this.audio.stopMusic();
        this.audio.playSFX('crash');
        this.scoring.saveHighScore();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('main-menu').classList.toggle('hidden', this.state !== GameState.MENU);
        document.getElementById('shop-overlay').classList.toggle('hidden', this.state !== GameState.SHOP);
        document.getElementById('game-over').classList.toggle('hidden', this.state !== GameState.GAMEOVER);
        document.getElementById('hud').classList.toggle('hidden', this.state !== GameState.PLAYING);

        if (this.state === GameState.GAMEOVER) {
            document.getElementById('final-score').textContent = Math.floor(this.scoring.distance);
            document.getElementById('final-coins').textContent = this.scoring.coins;
            document.getElementById('high-score').textContent = Math.floor(this.scoring.highScore);
        }
        
        if (this.state === GameState.SHOP) {
            this.shop.updateDisplay();
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.state === GameState.PLAYING) {
            this.update(deltaTime);
        }
        
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        // Player logic
        this.player.update(dt, this.shop.upgrades);
        
        // World / Background scrolling
        this.world.update(dt, this.player.speed);

        // Obstacles & Spawning
        this.obstacles.update(dt, this.player.speed);

        // Collision Detection
        this.checkCollisions();

        // Scoring
        this.scoring.update(dt, this.player.speed);
        this.scoring.updateHUD(this.player.health, this.player.nitro);

        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    checkCollisions() {
        const pBox = this.player.getCollisionBox();
        
        this.obstacles.items.forEach(obs => {
            if (!obs.hit && this.rectIntersect(pBox, obs.getCollisionBox())) {
                if (obs.type === 'coin') {
                    obs.hit = true;
                    this.scoring.addCoin();
                    this.audio.playSFX('coin');
                } else if (obs.type === 'nitro') {
                    obs.hit = true;
                    this.player.refillNitro();
                    this.audio.playSFX('boost');
                } else {
                    obs.hit = true;
                    this.player.takeDamage(25);
                    this.audio.playSFX('hit');
                }
            }
        });
    }

    rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.w || 
                 r2.x + r2.w < r1.x || 
                 r2.y > r1.y + r1.h ||
                 r2.y + r2.h < r1.y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render stack
        this.world.draw(this.ctx);
        
        if (this.state === GameState.PLAYING || this.state === GameState.GAMEOVER) {
            this.obstacles.draw(this.ctx);
            this.player.draw(this.ctx);
        }
    }
}

// Main App Entry
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});
