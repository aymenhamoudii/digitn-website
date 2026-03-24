/**
 * Snake Game - Minimalist Edition
 * Logic: Canvas rendering, dynamic difficulty, wrap-around, sound, high score.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('status-text');
const instructionText = document.getElementById('instruction-text');

// Configuration
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

// State
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopTimeout = null;
let isPaused = false;
let isGameOver = true;
let currentSpeed = INITIAL_SPEED;

// Initialize High Score Display
highScoreEl.textContent = String(highScore).padStart(3, '0');

// Audio Context for synthetic sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'eat') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'move') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'gameover') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    score = 0;
    currentSpeed = INITIAL_SPEED;
    scoreEl.textContent = '000';
    isGameOver = false;
    isPaused = false;
    overlay.classList.add('hidden');
    spawnFood();
    gameLoop();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Ensure food doesn't spawn on snake body
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
            break;
        }
    }
}

function gameLoop() {
    if (isGameOver || isPaused) return;

    gameLoopTimeout = setTimeout(() => {
        update();
        draw();
        gameLoop();
    }, currentSpeed);
}

function update() {
    // Commit buffered direction
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wrap-around logic
    if (head.x < 0) head.x = TILE_COUNT - 1;
    if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    if (head.y >= TILE_COUNT) head.y = 0;

    // Check collision with self
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = String(score).padStart(3, '0');
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = String(highScore).padStart(3, '0');
            localStorage.setItem('snakeHighScore', highScore);
        }
        playSound('eat');
        spawnFood();
        // Dynamic speed increase
        if (currentSpeed > MIN_SPEED) {
            currentSpeed -= SPEED_INCREMENT;
        }
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Subtle)
    ctx.strokeStyle = '#f1f3f5';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#212529' : '#dee2e6';
        
        // Rounded rectangles for minimalist look
        const r = 4; // corner radius
        const x = segment.x * GRID_SIZE + 2;
        const y = segment.y * GRID_SIZE + 2;
        const w = GRID_SIZE - 4;
        const h = GRID_SIZE - 4;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    });
}

function gameOver() {
    isGameOver = true;
    playSound('gameover');
    statusText.textContent = 'GAME OVER';
    instructionText.textContent = 'Press SPACE to Restart';
    overlay.classList.remove('hidden');
}

function togglePause() {
    if (isGameOver) {
        initGame();
        return;
    }

    isPaused = !isPaused;
    if (isPaused) {
        statusText.textContent = 'PAUSED';
        instructionText.textContent = 'Press SPACE to Resume';
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        gameLoop();
    }
}

window.addEventListener('keydown', (e) => {
    // Prevent scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === ' ' || e.code === 'Space') {
        togglePause();
        return;
    }

    if (isPaused || isGameOver) return;

    // Change direction with buffering to prevent 180-degree turns
    switch (e.key) {
        case 'ArrowUp':
            if (dy !== 1) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { nextDx = 1; nextDy = 0; }
            break;
    }
});

// Initial draw
draw();
statusText.textContent = 'SNAKE';
instructionText.textContent = 'Press SPACE to Start';
overlay.classList.remove('hidden');
