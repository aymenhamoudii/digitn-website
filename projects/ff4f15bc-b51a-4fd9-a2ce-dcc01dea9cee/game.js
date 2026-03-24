// Snake Game - Main Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const BASE_SPEED = 150;

// Audio context for sound effects
let audioCtx = null;
let soundEnabled = true;

// Game state
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let powerups = [];
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = BASE_SPEED;
let gameInterval = null;
let level = 1;
let activePowerup = null;
let powerupTimer = null;
let hasShield = false;

// DOM elements
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const levelEl = document.getElementById('level');
const speedEl = document.getElementById('speed');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const soundBtn = document.getElementById('soundBtn');

// Powerup elements
const powerupSpeedEl = document.getElementById('powerupSpeed');
const powerupSlowEl = document.getElementById('powerupSlow');
const powerupDoubleEl = document.getElementById('powerupDouble');
const powerupShieldEl = document.getElementById('powerupShield');

// Powerup types
const POWERUP_TYPES = {
    SPEED: { type: 'speed', icon: '⚡', color: '#ffcc00', duration: 5000 },
    SLOW: { type: 'slow', icon: '🐢', color: '#00ccff', duration: 5000 },
    DOUBLE: { type: 'double', icon: '✖2', color: '#ff66ff', duration: 8000 },
    SHIELD: { type: 'shield', icon: '🛡', color: '#66ffcc', duration: 10000 }
};

// Initialize audio
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Sound generation
function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        switch(type) {
            case 'eat':
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.1);
                break;
            case 'powerup':
                oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
                break;
            case 'death':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
                break;
            case 'levelup':
                oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
            case 'gameover':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
                break;
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    gameSpeed = BASE_SPEED;
    activePowerup = null;
    hasShield = false;
    powerups = [];
    
    updateScore();
    updateHighScore();
    updateLevel();
    updateSpeed();
    spawnFood();
    
    clearPowerupHighlights();
}

// Spawn food
function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);
        
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
        if (!validPosition) continue;
        validPosition = !powerups.some(p => p.x === food.x && p.y === food.y);
    }
}

// Spawn powerup
function spawnPowerup() {
    if (powerups.length >= 2) return;
    
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    let validPosition = false;
    let x, y;
    
    while (!validPosition) {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
        
        validPosition = !snake.some(segment => segment.x === x && segment.y === y);
        if (!validPosition) continue;
        validPosition = !(food.x === x && food.y === y);
        if (!validPosition) continue;
        validPosition = !powerups.some(p => p.x === x && p.y === y);
    }
    
    powerups.push({ x, y, ...type, spawnTime: Date.now() });
}

// Clear powerup after duration
function clearPowerup(powerup) {
    powerups = powerups.filter(p => p !== powerup);
    clearPowerupHighlights();
    activePowerup = null;
    gameSpeed = BASE_SPEED - (level - 1) * 10;
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    updateSpeed();
}

// Clear all powerup highlights
function clearPowerupHighlights() {
    powerupSpeedEl.classList.remove('active');
    powerupSlowEl.classList.remove('active');
    powerupDoubleEl.classList.remove('active');
    powerupShieldEl.classList.remove('active');
}

// Activate powerup
function activatePowerup(powerup) {
    clearTimeout(powerupTimer);
    activePowerup = powerup;
    
    clearPowerupHighlights();
    switch(powerup.type) {
        case 'speed':
            powerupSpeedEl.classList.add('active');
            gameSpeed = Math.max(50, gameSpeed - 50);
            break;
        case 'slow':
            powerupSlowEl.classList.add('active');
            gameSpeed = Math.min(300, gameSpeed + 80);
            break;
        case 'double':
            powerupDoubleEl.classList.add('active');
            break;
        case 'shield':
            powerupShieldEl.classList.add('active');
            hasShield = true;
            break;
    }
    
    playSound('powerup');
    updateSpeed();
    
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    powerupTimer = setTimeout(() => {
        if (powerup.type === 'shield') {
            hasShield = false;
        }
        clearPowerup(powerup);
    }, powerup.duration);
}

// Update score
function updateScore() {
    scoreEl.textContent = score;
}

// Update high score
function updateHighScore() {
    highscoreEl.textContent = highScore;
}

// Update level
function updateLevel() {
    levelEl.textContent = level;
}

// Update speed display
function updateSpeed() {
    const speedMultiplier = (BASE_SPEED / gameSpeed).toFixed(1);
    speedEl.textContent = speedMultiplier + 'x';
}

// Game loop
function gameLoop() {
    if (gamePaused || !gameRunning) return;
    
    direction = { ...nextDirection };
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (hasShield) {
            direction.x = -direction.x;
            direction.y = -direction.y;
            nextDirection = { ...direction };
            playSound('powerup');
            return;
        } else {
            gameOver();
            return;
        }
    }
    
    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        if (hasShield) {
            direction.x = -direction.x;
            direction.y = -direction.y;
            nextDirection = { ...direction };
            playSound('powerup');
            return;
        } else {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Food collision
    if (head.x === food.x && head.y === food.y) {
        let points = 10;
        if (activePowerup && activePowerup.type === 'double') {
            points *= 2;
        }
        score += points;
        updateScore();
        playSound('eat');
        spawnFood();
        
        // Level up every 50 points
        if (score >= level * 50) {
            level++;
            updateLevel();
            playSound('levelup');
            gameSpeed = Math.max(50, BASE_SPEED - (level - 1) * 10);
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
            updateSpeed();
        }
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            updateHighScore();
        }
    }
    
    // Powerup collision
    const powerupIndex = powerups.findIndex(p => p.x === head.x && p.y === head.y);
    if (powerupIndex !== -1) {
        const powerup = powerups[powerups.length - 1];
        activatePowerup(powerup);
        powerups.splice(powerupIndex, 1);
    }
    
    // Remove tail if not eating
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
    
    // Clean up expired powerups
    const now = Date.now();
    powerups = powerups.filter(p => now - p.spawnTime < 10000);
    
    // Random spawn powerup (10% chance)
    if (Math.random() < 0.1) {
        spawnPowerup();
    }
    
    render();
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#0d0d15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw powerups
    powerups.forEach(powerup => {
        const x = powerup.x * CELL_SIZE + CELL_SIZE / 2;
        const y = powerup.y * CELL_SIZE + CELL_SIZE / 2;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE);
        gradient.addColorStop(0, powerup.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, x, y);
    });
    
    // Draw food
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    
    const foodGradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, CELL_SIZE);
    foodGradient.addColorStop(0, '#ff3366');
    foodGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, CELL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.arc(foodX, foodY, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw snake
    snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE + 2;
        const y = segment.y * CELL_SIZE + 2;
        const size = CELL_SIZE - 4;
        
        if (index === 0) {
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
        } else {
            const alpha = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.shadowBlur = 0;
        }
        
        const radius = 6;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    });
    
    // Draw shield
    if (hasShield) {
        const head = snake[0];
        const x = head.x * CELL_SIZE + CELL_SIZE / 2;
        const y = head.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.strokeStyle = '#66ffcc';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#66ffcc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    playSound('death');
    
    setTimeout(() => {
        playSound('gameover');
    }, 300);
    
    showOverlay('GAME OVER', `Final Score: ${score}\nPress SPACE to Restart`);
}

// Show overlay
function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlay.classList.remove('hidden');
    if (title === 'GAME OVER') {
        overlay.classList.add('game-over-overlay');
    } else {
        overlay.classList.remove('game-over-overlay');
    }
}

// Hide overlay
function hideOverlay() {
    overlay.classList.add('hidden');
    overlay.classList.remove('game-over-overlay');
}

// Start game
function startGame() {
    initAudio();
    initGame();
    hideOverlay();
    gameRunning = true;
    gamePaused = false;
    render();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Pause game
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    if (gamePaused) {
        showOverlay('PAUSED', 'Press SPACE to Resume');
    } else {
        hideOverlay();
    }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }
    
    if (key === ' ') {
        if (!gameRunning) {
            startGame();
        } else if (gamePaused) {
            togglePause();
        }
        return;
    }
    
    if (!gameRunning || gamePaused) return;
    
    switch(key) {
        case 'arrowup':
        case 'w':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case 'p':
            togglePause();
            break;
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning || gamePaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction.x !== -1) {
            nextDirection = { x: 1, y: 0 };
        } else if (diffX < 0 && direction.x !== 1) {
            nextDirection = { x: -1, y: 0 };
        }
    } else {
        if (diffY > 0 && direction.y !== -1) {
            nextDirection = { x: 0, y: 1 };
        } else if (diffY < 0 && direction.y !== 1) {
            nextDirection = { x: 0, y: -1 };
        }
    }
    e.preventDefault();
});

// Sound toggle
soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    soundBtn.classList.toggle('muted', !soundEnabled);
    if (soundEnabled) {
        initAudio();
    }
});

// Initialize
updateHighScore();
render();

showOverlay('SNAKE', 'Press SPACE to Start');