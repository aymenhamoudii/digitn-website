/**
 * Snake Game - Retro Edition
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const wrapToggle = document.getElementById('wrap-toggle');
const soundToggle = document.getElementById('sound-toggle');

// Game constants
const GRID_SIZE = 15; // Smaller grid for retro feel
const TILE_COUNT = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

// Game state
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snake-highscore') || 0;
let gameLoop = null;
let isPaused = true;
let isGameOver = false;
let currentSpeed = INITIAL_SPEED;

// Sound Synth (Web Audio API for retro beeps)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type = 'square') {
    if (!soundToggle.checked) return;
    
    // Resume context if it was suspended (browser policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

const sounds = {
    move: () => playTone(120, 0.03, 'square'),
    eat: () => {
        playTone(440, 0.05, 'square');
        setTimeout(() => playTone(880, 0.08, 'square'), 40);
    },
    die: () => {
        playTone(300, 0.2, 'sawtooth');
        setTimeout(() => playTone(150, 0.3, 'sawtooth'), 200);
        setTimeout(() => playTone(75, 0.4, 'sawtooth'), 500);
    },
    pause: () => playTone(660, 0.05, 'sine')
};

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
    isGameOver = false;
    isPaused = true;
    updateScore();
    spawnFood();
    showOverlay('SNAKE', 'PRESS SPACE');
    draw();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Don't spawn food on snake body
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

function update() {
    if (isPaused || isGameOver) return;

    // Apply next direction
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wrap logic
    if (wrapToggle.checked) {
        if (head.x < 0) head.x = TILE_COUNT - 1;
        if (head.x >= TILE_COUNT) head.x = 0;
        if (head.y < 0) head.y = TILE_COUNT - 1;
        if (head.y >= TILE_COUNT) head.y = 0;
    } else {
        // Wall collision
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            gameOver();
            return;
        }
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake-highscore', highScore);
        }
        updateScore();
        sounds.eat();
        spawnFood();
        // Increase speed
        if (currentSpeed > MIN_SPEED) {
            currentSpeed -= SPEED_INCREMENT;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, currentSpeed);
        }
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid faint lines (optional for retro look)
    ctx.strokeStyle = '#050505';
    ctx.lineWidth = 0.5;
    for(let i=0; i<=TILE_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(i*GRID_SIZE, 0); ctx.lineTo(i*GRID_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*GRID_SIZE); ctx.lineTo(canvas.width, i*GRID_SIZE); ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff0044';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff0044';
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? '#33ff33' : '#00aa00';
        
        // Add a slight "glow" to segments
        if (index === 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#33ff33';
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // Eyes for the head
        if (index === 0) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            if (dx === 1) { // Right
                ctx.fillRect(segment.x * GRID_SIZE + 10, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 10, segment.y * GRID_SIZE + 10, eyeSize, eyeSize);
            } else if (dx === -1) { // Left
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 10, eyeSize, eyeSize);
            } else if (dy === -1) { // Up
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 10, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
            } else if (dy === 1) { // Down
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 10, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 10, segment.y * GRID_SIZE + 10, eyeSize, eyeSize);
            }
        }
    });
}

function updateScore() {
    scoreElement.textContent = score.toString().padStart(4, '0');
    highScoreElement.textContent = highScore.toString().padStart(4, '0');
}

function gameOver() {
    isGameOver = true;
    sounds.die();
    clearInterval(gameLoop);
    showOverlay('GAME OVER', 'PRESS SPACE');
}

function togglePause() {
    if (isGameOver) {
        initGame();
        startGameLoop();
        return;
    }

    isPaused = !isPaused;
    sounds.pause();
    
    if (isPaused) {
        showOverlay('PAUSED', 'PRESS SPACE');
        clearInterval(gameLoop);
    } else {
        hideOverlay();
        startGameLoop();
    }
}

function startGameLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
}

function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

// Input handling
window.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrows
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { nextDx = 0; nextDy = -1; sounds.move(); }
            break;
        case 'ArrowDown':
            if (dy === 0) { nextDx = 0; nextDy = 1; sounds.move(); }
            break;
        case 'ArrowLeft':
            if (dx === 0) { nextDx = -1; nextDy = 0; sounds.move(); }
            break;
        case 'ArrowRight':
            if (dx === 0) { nextDx = 1; nextDy = 0; sounds.move(); }
            break;
        case ' ':
            togglePause();
            break;
    }
});

// Initialize
initGame();
updateScore();
