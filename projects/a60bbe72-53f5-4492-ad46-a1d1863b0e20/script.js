// Game Constants and State
const GRAVITY = 0.25;
const JUMP_STRENGTH = -5.5;
const PIPE_WIDTH = 60;
const PIPE_SPAWN_RATE = 1500;
const GROUND_HEIGHT = 100;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const BIRD_X = 50;

let gameRunning = false;
let physicsRunning = false;
let score = 0;
let highScore = localStorage.getItem('bird-high-score') || 0;
let birdY = 0;
let birdVelocity = 0;
let birdRotation = 0;
let pipes = [];
let lastPipeSpawn = 0;
let frameId = null;

// Difficulty Settings
const difficulties = {
    easy: { gap: 200, speed: 2 },
    normal: { gap: 160, speed: 3 },
    hard: { gap: 130, speed: 4.5 }
};
let currentDiff = 'normal';

// DOM Elements
const bird = document.getElementById('bird');
const gameWorld = document.getElementById('game-world');
const scoreDisplay = document.getElementById('score-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const bestScoreDisplay = document.getElementById('best-score');
const highScoreLabel = document.getElementById('high-score');
const gameContainer = document.getElementById('game-container');

// Sound Effects (Web Audio API)
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'jump') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start();
        oscillator.stop(now + 0.1);
    } else if (type === 'score') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.setValueAtTime(1000, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start();
        oscillator.stop(now + 0.1);
    } else if (type === 'hit') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start();
        oscillator.stop(now + 0.3);
    }
}

// Initialization
highScoreLabel.textContent = highScore;

function resetBird() {
    const worldHeight = gameContainer.clientHeight || 700;
    birdY = (worldHeight - GROUND_HEIGHT) / 2 - BIRD_HEIGHT / 2;
    birdVelocity = 0;
    birdRotation = 0;
    bird.style.transform = `translateY(${birdY}px) rotate(0deg)`;
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) {
            if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
                startGame();
            }
        } else {
            handleInput();
        }
    }
});

gameContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        if (gameRunning) {
            handleInput();
        }
    }
});

gameContainer.addEventListener('touchstart', (e) => {
    if (gameRunning) {
        e.preventDefault();
        handleInput();
    }
}, { passive: false });

function handleInput() {
    if (!gameRunning) return;
    if (!physicsRunning) {
        physicsRunning = true;
        lastPipeSpawn = performance.now();
    }
    birdVelocity = JUMP_STRENGTH;
    playSound('jump');
}

// Menu Controls
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDiff = btn.dataset.diff;
    });
});

document.querySelectorAll('.skin-preview').forEach(preview => {
    preview.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.skin-preview').forEach(p => p.classList.remove('active'));
        preview.classList.add('active');
        const skin = preview.dataset.skin;
        bird.className = `skin-${skin}`;
    });
});

document.getElementById('start-button').addEventListener('click', (e) => {
    e.stopPropagation();
    startGame();
});

document.getElementById('restart-button').addEventListener('click', (e) => {
    e.stopPropagation();
    startGame();
});

function startGame() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    score = 0;
    resetBird();
    
    // Clear existing pipes
    pipes.forEach(p => {
        if (p.topEl) p.topEl.remove();
        if (p.bottomEl) p.bottomEl.remove();
    });
    pipes = [];
    
    scoreDisplay.textContent = '0';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    gameRunning = true;
    physicsRunning = false; // Wait for first click/space to start falling
    
    if (frameId) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(gameLoop);
}

function spawnPipe(timestamp) {
    const worldHeight = gameContainer.clientHeight || 700;
    const worldWidth = gameContainer.clientWidth || 400;
    const gap = difficulties[currentDiff].gap;
    const minHeight = 50;
    const availableHeight = worldHeight - GROUND_HEIGHT;
    const maxHeight = availableHeight - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    const topEl = document.createElement('div');
    topEl.className = 'pipe pipe-top';
    topEl.style.height = `${topHeight}px`;
    topEl.style.left = `${worldWidth}px`;
    topEl.style.top = '0';
    topEl.innerHTML = '<div class="pipe-cap"></div>';

    const bottomEl = document.createElement('div');
    bottomEl.className = 'pipe pipe-bottom';
    bottomEl.style.height = `${availableHeight - topHeight - gap}px`;
    bottomEl.style.left = `${worldWidth}px`;
    bottomEl.style.bottom = `${GROUND_HEIGHT}px`;
    bottomEl.innerHTML = '<div class="pipe-cap"></div>';

    gameWorld.appendChild(topEl);
    gameWorld.appendChild(bottomEl);

    pipes.push({
        x: worldWidth,
        topHeight: topHeight,
        gap: gap,
        topEl: topEl,
        bottomEl: bottomEl,
        passed: false
    });
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const worldHeight = gameContainer.clientHeight || 700;
    const worldWidth = gameContainer.clientWidth || 400;
    const groundTop = worldHeight - GROUND_HEIGHT;

    if (physicsRunning) {
        // Bird Physics
        birdVelocity += GRAVITY;
        birdY += birdVelocity;
        
        // Rotation based on velocity
        birdRotation = Math.min(Math.max(birdVelocity * 4, -25), 90);
        
        // Pipe Spawning
        if (timestamp - lastPipeSpawn > PIPE_SPAWN_RATE) {
            spawnPipe(timestamp);
            lastPipeSpawn = timestamp;
        }

        // Pipe Movement and Collision
        const speed = difficulties[currentDiff].speed;

        for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= speed;
            p.topEl.style.left = `${p.x}px`;
            p.bottomEl.style.left = `${p.x}px`;

            // Score Check
            if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
                score++;
                p.passed = true;
                scoreDisplay.textContent = score;
                playSound('score');
            }

            // Collision Check
            if (BIRD_X + BIRD_WIDTH > p.x + 5 && BIRD_X < p.x + PIPE_WIDTH - 5) {
                if (birdY < p.topHeight - 5 || birdY + BIRD_HEIGHT > p.topHeight + p.gap + 5) {
                    endGame();
                    return;
                }
            }

            // Cleanup
            if (p.x < -PIPE_WIDTH - 20) {
                p.topEl.remove();
                p.bottomEl.remove();
                pipes.splice(i, 1);
            }
        }

        // Collision with ground/ceiling
        if (birdY < -100 || birdY + BIRD_HEIGHT > groundTop) {
            endGame();
            return;
        }
    } else {
        // Hover effect before starting
        birdY = (worldHeight - GROUND_HEIGHT) / 2 - BIRD_HEIGHT / 2 + Math.sin(timestamp / 150) * 10;
        birdRotation = 0;
    }

    bird.style.transform = `translateY(${birdY}px) rotate(${birdRotation}deg)`;
    frameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    if (!gameRunning) return;
    gameRunning = false;
    physicsRunning = false;
    cancelAnimationFrame(frameId);
    playSound('hit');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bird-high-score', highScore);
        highScoreLabel.textContent = highScore;
    }

    finalScoreDisplay.textContent = score;
    bestScoreDisplay.textContent = highScore;
    gameOverScreen.classList.remove('hidden');
}

// Initial position on load
window.addEventListener('resize', () => {
    if (!gameRunning) resetBird();
});
resetBird();
