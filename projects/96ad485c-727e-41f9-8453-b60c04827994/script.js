const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_COUNT = 20;

canvas.width = GRID_SIZE * TILE_COUNT;
canvas.height = GRID_SIZE * TILE_COUNT;

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverEl = document.getElementById('gameOver');
const startScreenEl = document.getElementById('startScreen');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 150;
let isRunning = false;
let isPaused = false;

highScoreEl.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    direction = { x: 0, y: -1 };
    nextDirection = { x: 0, y: -1 };
    score = 0;
    gameSpeed = 150;
    scoreEl.textContent = score;
    spawnFood();
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawFood();
    drawSnake();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
}

function drawFood() {
    const gradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        0,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ee5a5a');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        if (isHead) {
            const headGradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
            headGradient.addColorStop(0, '#00ff88');
            headGradient.addColorStop(1, '#00cc6a');
            ctx.fillStyle = headGradient;
        } else {
            const alpha = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        }
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
        ctx.fill();
        
        if (isHead) {
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
}

function update() {
    direction = { ...nextDirection };
    
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };

    if (head.x < 0 || head.x >= TILE_COUNT || 
        head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
        
        spawnFood();
    } else {
        snake.pop();
    }
}

function gameStep() {
    update();
    draw();
}

function gameOver() {
    isRunning = false;
    clearInterval(gameLoop);
    finalScoreEl.textContent = score;
    gameOverEl.classList.add('show');
}

function startGame() {
    initGame();
    startScreenEl.classList.remove('show');
    gameOverEl.classList.remove('show');
    isRunning = true;
    gameLoop = setInterval(gameStep, gameSpeed);
    draw();
}

function resetGame() {
    gameOverEl.classList.remove('show');
    startScreenEl.classList.add('show');
}

document.addEventListener('keydown', (e) => {
    if (!isRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
    }
});

upBtn.addEventListener('click', () => {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
});
downBtn.addEventListener('click', () => {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
});
leftBtn.addEventListener('click', () => {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
});
rightBtn.addEventListener('click', () => {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

startScreenEl.classList.add('show');
draw();
