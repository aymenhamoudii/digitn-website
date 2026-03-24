// Snake Game - Retro Edition
// Complete game logic with sound, levels, obstacles, and score system

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

// DOM elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const currentLevelEl = document.getElementById('currentLevel');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const overlayContent = document.querySelector('.overlay-content');
const levelIndicator = document.getElementById('levelIndicator');

// Game state
let snake = [];
let food = {};
let obstacles = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameSpeed = 150;
let gameLoop = null;
let isPlaying = false;
let isPaused = false;
let audioContext = null;

// Initialize high score display
highScoreEl.textContent = highScore;

// Sound system using Web Audio API
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'eat':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'move':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
            
        case 'levelUp':
            // Play a rising sequence
            [400, 500, 600, 800].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.1);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.1);
            });
            break;
            
        case 'gameOver':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
            
        case 'start':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

// Initialize game
function initGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    gameSpeed = 150;
    obstacles = [];
    
    scoreEl.textContent = score;
    levelEl.textContent = level;
    
    generateFood();
    generateObstacles();
}

// Generate food at random position
function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        
        validPosition = !snake.some(seg => seg.x === food.x && seg.y === food.y) &&
                       !obstacles.some(obs => obs.x === food.x && obs.y === food.y);
    }
}

// Generate obstacles based on level
function generateObstacles() {
    obstacles = [];
    const obstacleCount = Math.min(level * 3, 20);
    
    for (let i = 0; i < obstacleCount; i++) {
        let validPosition = false;
        let obs;
        
        while (!validPosition) {
            obs = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            // Keep obstacles away from snake head
            const safeZone = 5;
            const tooCloseToSnake = snake.some(seg => 
                Math.abs(seg.x - obs.x) < safeZone && Math.abs(seg.y - obs.y) < safeZone
            );
            
            validPosition = !tooCloseToSnake && 
                           !(obs.x === food.x && obs.y === food.y) &&
                           !obstacles.some(o => o.x === obs.x && o.y === obs.y);
        }
        
        obstacles.push(obs);
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(canvas.width, y * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillRect(obs.x * GRID_SIZE + 2, obs.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        
        // Add detail
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x * GRID_SIZE + 4, obs.y * GRID_SIZE + 4, GRID_SIZE - 8, GRID_SIZE - 8);
    });
    ctx.shadowBlur = 0;
    
    // Draw food
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 20;
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    
    // Food inner glow
    ctx.fillStyle = '#aaffaa';
    ctx.fillRect(food.x * GRID_SIZE + 5, food.y * GRID_SIZE + 5, GRID_SIZE - 10, GRID_SIZE - 10);
    ctx.shadowBlur = 0;
    
    // Draw snake
    snake.forEach((seg, index) => {
        const isHead = index === 0;
        
        if (isHead) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 15;
        } else {
            // Gradient from head to tail
            const brightness = Math.max(0.3, 1 - (index / snake.length) * 0.7);
            ctx.fillStyle = `rgba(0, ${Math.floor(255 * brightness)} 0, 1)`;
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // Draw eyes on head
        if (isHead) {
            ctx.fillStyle = '#000000';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            // Position eyes based on direction
            let eye1X, eye1Y, eye2X, eye2Y;
            
            if (direction.x === 1) { // Right
                eye1X = seg.x * GRID_SIZE + 12;
                eye1Y = seg.y * GRID_SIZE + 5;
                eye2X = seg.x * GRID_SIZE + 12;
                eye2Y = seg.y * GRID_SIZE + 12;
            } else if (direction.x === -1) { // Left
                eye1X = seg.x * GRID_SIZE + 5;
                eye1Y = seg.y * GRID_SIZE + 5;
                eye2X = seg.x * GRID_SIZE + 5;
                eye2Y = seg.y * GRID_SIZE + 12;
            } else if (direction.y === -1) { // Up
                eye1X = seg.x * GRID_SIZE + 5;
                eye1Y = seg.y * GRID_SIZE + 5;
                eye2X = seg.x * GRID_SIZE + 12;
                eye2Y = seg.y * GRID_SIZE + 5;
            } else { // Down
                eye1X = seg.x * GRID_SIZE + 5;
                eye1Y = seg.y * GRID_SIZE + 12;
                eye2X = seg.x * GRID_SIZE + 12;
                eye2Y = seg.y * GRID_SIZE + 12;
            }
            
            ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
            ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
        }
    });
    ctx.shadowBlur = 0;
}

// Update game state
function update() {
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Wrap around walls
    if (head.x < 0) head.x = GRID_WIDTH - 1;
    if (head.x >= GRID_WIDTH) head.x = 0;
    if (head.y < 0) head.y = GRID_HEIGHT - 1;
    if (head.y >= GRID_HEIGHT) head.y = 0;
    
    // Check collision with obstacles
    if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
        gameOver();
        return;
    }
    
    // Check collision with self
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
    }
    
    // Move snake
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        playSound('eat');
        score += 10 * level;
        scoreEl.textContent = score;
        
        // Check for level up
        if (score >= level * 100) {
            levelUp();
        }
        
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

// Level up
function levelUp() {
    level++;
    levelEl.textContent = level;
    
    // Increase speed
    gameSpeed = Math.max(50, 150 - (level - 1) * 15);
    
    playSound('levelUp');
    
    // Show level indicator
    currentLevelEl.textContent = level;
    levelIndicator.classList.add('visible');
    setTimeout(() => {
        levelIndicator.classList.remove('visible');
    }, 2000);
    
    // Generate new obstacles
    generateObstacles();
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// Game over
function gameOver() {
    playSound('gameOver');
    clearInterval(gameLoop);
    isPlaying = false;
    
    overlayContent.classList.add('game-over');
    overlayTitle.textContent = 'GAME OVER';
    overlayMessage.textContent = `Score: ${score} | Press SPACE to Restart`;
    overlay.classList.remove('hidden');
}

// Start game
function startGame() {
    initAudio();
    playSound('start');
    
    initGame();
    draw();
    
    overlay.classList.add('hidden');
    overlayContent.classList.remove('game-over', 'paused');
    
    isPlaying = true;
    isPaused = false;
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (!isPaused) {
            update();
        }
    }, gameSpeed);
}

// Toggle pause
function togglePause() {
    if (!isPlaying) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        overlayContent.classList.add('paused');
        overlayTitle.textContent = 'PAUSED';
        overlayMessage.textContent = 'Press SPACE to Resume';
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    
    switch (e.code) {
        case 'ArrowUp':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
            
        case 'ArrowDown':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
            
        case 'ArrowLeft':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
            
        case 'ArrowRight':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
            
        case 'Space':
            if (!isPlaying || overlayContent.classList.contains('game-over')) {
                startGame();
            } else {
                togglePause();
            }
            break;
    }
});

// Initial draw
draw();

// Show start overlay
overlayTitle.textContent = 'SNAKE';
overlayMessage.textContent = 'Press SPACE to Start';
