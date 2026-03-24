const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highscore');
const levelElement = document.getElementById('level');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const restartBtn = document.getElementById('restartBtn');

let gridSize = 20;
let tileSize = 20;
let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let level = 1;
let highscore = localStorage.getItem('snakeHighscore') || 0;
let gameLoop = null;
let gameSpeed = 150;

highscoreElement.textContent = highscore;

document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        gridSize = parseInt(e.target.dataset.size);
        startGame();
    });
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    menu.classList.remove('hidden');
});

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (key === 'w' && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
    } else if (key === 's' && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
    } else if (key === 'a' && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
    } else if (key === 'd' && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
    }
});

function startGame() {
    menu.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    tileSize = Math.floor(600 / gridSize);
    canvas.width = gridSize * tileSize;
    canvas.height = gridSize * tileSize;
    
    snake = [
        { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
        { x: Math.floor(gridSize / 2) - 1, y: Math.floor(gridSize / 2) },
        { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    gameSpeed = 150;
    
    updateScore();
    spawnFood();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function spawnFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function update() {
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Wrap around boundaries
    if (head.x < 0) head.x = gridSize - 1;
    if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    if (head.y >= gridSize) head.y = 0;
    
    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
        
        // Level up every 50 points
        if (score % 50 === 0) {
            level++;
            levelElement.textContent = level;
            gameSpeed = Math.max(50, gameSpeed - 10);
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }
    
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * tileSize,
            segment.y * tileSize,
            (segment.x + 1) * tileSize,
            (segment.y + 1) * tileSize
        );
        
        if (index === 0) {
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
        } else {
            gradient.addColorStop(0, '#86efac');
            gradient.addColorStop(1, '#4ade80');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * tileSize + 1,
            segment.y * tileSize + 1,
            tileSize - 2,
            tileSize - 2
        );
        
        // Add shine effect on head
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                segment.x * tileSize + 2,
                segment.y * tileSize + 2,
                tileSize / 2,
                tileSize / 2
            );
        }
    });
    
    // Draw food with glow
    const foodGradient = ctx.createRadialGradient(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        0,
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize
    );
    foodGradient.addColorStop(0, '#f87171');
    foodGradient.addColorStop(0.5, '#ef4444');
    foodGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw food core
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function updateScore() {
    scoreElement.textContent = score;
    
    if (score > highscore) {
        highscore = score;
        highscoreElement.textContent = highscore;
        localStorage.setItem('snakeHighscore', highscore);
    }
}

function gameOver() {
    clearInterval(gameLoop);
    canvas.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
}