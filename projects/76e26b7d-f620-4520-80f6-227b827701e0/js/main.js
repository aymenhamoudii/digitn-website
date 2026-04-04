import { SnakeGame } from './game.js';
import { GRID_SIZE, COLORS, KEY_MAP } from './constants.js';
import { formatScore } from './utils.js';

/**
 * GameRenderer and Input Controller
 * Orchestrates rendering, input, and game engine loop
 */
class GameRenderer {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.overlay = document.getElementById('overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMsg = document.getElementById('overlay-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.startBtn = document.getElementById('start-btn');
        this.startScreen = document.getElementById('start-screen');

        // Logic Instance
        this.game = new SnakeGame();
        
        // Loop State
        this.lastTime = 0;
        this.animationFrameId = null;

        this.init();
    }

    /**
     * One-time setup: Resize, initial draw, events
     */
    init() {
        this.resizeCanvas();
        this.updateStatsDisplay();
        this.bindEvents();
        this.drawInitialState();
    }

    /**
     * Matches internal canvas resolution to high-DPI display if possible
     */
    resizeCanvas() {
        const size = 600;
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / GRID_SIZE;
    }

    /**
     * Binds keyboard, mouse, and resize listeners
     */
    bindEvents() {
        window.addEventListener('keydown', (e) => {
            const dir = KEY_MAP[e.key];
            if (dir) {
                // Prevent scrolling with arrows
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
                this.game.setDirection(dir);
            }

            // Pause functionality
            if (e.key.toLowerCase() === 'p') {
                this.togglePause();
            }

            // Space or Enter to restart when game is over
            if (this.game.isGameOver && (e.key === ' ' || e.key === 'Enter')) {
                this.restartGame();
            }
        });

        this.startBtn.addEventListener('click', () => {
            this.startScreen.classList.add('hidden');
            this.startGame();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Starts or resumes the game loop
     */
    startGame() {
        this.lastTime = performance.now();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animate();
    }

    /**
     * Logic for restarting from Game Over
     */
    restartGame() {
        this.overlay.classList.add('hidden');
        this.game.reset();
        this.startGame();
    }

    /**
     * Toggles game pause state and UI
     */
    togglePause() {
        if (this.game.isGameOver) return;
        
        const isPaused = this.game.togglePause();
        if (isPaused) {
            this.overlayTitle.textContent = "LINK PAUSED";
            this.overlayMsg.textContent = "Ready to resume?";
            this.overlay.classList.remove('hidden');
        } else {
            this.overlay.classList.add('hidden');
            this.lastTime = performance.now();
        }
    }

    /**
     * Core animation loop with precise delta-time throttling
     */
    animate(currentTime = 0) {
        if (this.game.isGameOver) {
            this.handleGameOver();
            return;
        }

        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

        if (this.game.isPaused) return;

        const deltaTime = currentTime - this.lastTime;

        // Perform game logic step only if enough time passed (controlled by speed)
        if (deltaTime > this.game.speed) {
            this.game.update();
            this.draw();
            this.updateStatsDisplay();
            this.lastTime = currentTime;
        }
    }

    /**
     * Logic for ending the session
     */
    handleGameOver() {
        const isNewRecord = this.game.saveHighScore();
        this.overlayTitle.textContent = isNewRecord ? "RECORD BROKEN!" : "LINK SEVERED";
        this.overlayMsg.textContent = `Final Data Transfer: ${this.game.score} Units`;
        this.overlay.classList.remove('hidden');
        this.updateStatsDisplay();
    }

    /**
     * UI Element synchronizer
     */
    updateStatsDisplay() {
        this.currentScoreEl.textContent = formatScore(this.game.score);
        this.highScoreEl.textContent = formatScore(SnakeGame.getHighScore());
    }

    /**
     * Canvas rendering engine
     */
    draw() {
        // Clear viewport
        this.ctx.fillStyle = COLORS.BG_DARK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Background Grid (Cyberpunk style)
        this.drawGrid();

        // Render Data Node (Food)
        this.drawCell(this.game.food.x, this.game.food.y, COLORS.FOOD, true);

        // Render Snake Neural Link (Snake body)
        this.game.snake.forEach((segment, index) => {
            const color = index === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
            this.drawCell(segment.x, segment.y, color, false, index === 0);
        });
    }

    drawInitialState() {
        this.ctx.fillStyle = COLORS.BG_DARK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID_LINE;
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            const pos = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }

    /**
     * Functional unit for drawing grid cells
     */
    drawCell(x, y, color, isFood = false, isHead = false) {
        const padding = isFood ? 8 : 2;
        const radius = isHead ? 8 : 4;
        
        this.ctx.fillStyle = color;
        
        // Add Bloom effect to interactive elements
        if (isFood || isHead) {
            this.ctx.shadowBlur = isFood ? 20 : 10;
            this.ctx.shadowColor = color;
        }

        this.roundedRect(
            x * this.cellSize + padding,
            y * this.cellSize + padding,
            this.cellSize - padding * 2,
            this.cellSize - padding * 2,
            radius
        );

        this.ctx.shadowBlur = 0; // Reset bloom for static elements
    }

    /**
     * Helper for drawing rounded squares on Canvas
     */
    roundedRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// System Entry Point
document.addEventListener('DOMContentLoaded', () => {
    new GameRenderer();
});