/**
 * Bomb Game - Minimalist Bomberman Endless Mode
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level-val');
const scoreEl = document.getElementById('score-val');
const livesEl = document.getElementById('lives-val');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const TILE_SIZE = 40;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 13;
canvas.width = GRID_WIDTH * TILE_SIZE;
canvas.height = GRID_HEIGHT * TILE_SIZE;

const ENTITY_TYPES = {
    EMPTY: 0,
    WALL: 1,      // Indestructible
    SOFT_WALL: 2, // Destructible
    PLAYER: 3,
    ENEMY: 4,
    BOMB: 5,
    EXPLOSION: 6,
    EXIT: 7
};

// Game State
let gameState = {
    level: 1,
    score: 0,
    lives: 3,
    grid: [],
    player: {
        x: 1,
        y: 1,
        bombs: 1,
        maxBombs: 1,
        bombRange: 2,
        speed: 1, // dummy for now
        isDead: false
    },
    bombs: [],
    explosions: [],
    enemies: [],
    exitFound: false,
    gameOver: false,
    keys: {}
};

// Initialization
function initGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    setupLevel();
    requestAnimationFrame(gameLoop);
}

function setupLevel() {
    gameState.grid = [];
    gameState.bombs = [];
    gameState.explosions = [];
    gameState.enemies = [];
    gameState.exitFound = false;
    gameState.player.x = 1;
    gameState.player.y = 1;
    gameState.player.isDead = false;

    // Build map
    for (let y = 0; y < GRID_HEIGHT; y++) {
        gameState.grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
                gameState.grid[y][x] = ENTITY_TYPES.WALL;
            } else if (x % 2 === 0 && y % 2 === 0) {
                gameState.grid[y][x] = ENTITY_TYPES.WALL;
            } else {
                // Random soft walls
                if ((x > 2 || y > 2) && Math.random() < 0.3) {
                    gameState.grid[y][x] = ENTITY_TYPES.SOFT_WALL;
                } else {
                    gameState.grid[y][x] = ENTITY_TYPES.EMPTY;
                }
            }
        }
    }

    // Place exit under a soft wall
    let softWalls = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (gameState.grid[y][x] === ENTITY_TYPES.SOFT_WALL) {
                softWalls.push({ x, y });
            }
        }
    }
    if (softWalls.length > 0) {
        const exitWall = softWalls[Math.floor(Math.random() * softWalls.length)];
        gameState.exitPos = exitWall;
    } else {
        // Fallback if no soft walls
        gameState.exitPos = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
        gameState.grid[gameState.exitPos.y][gameState.exitPos.x] = ENTITY_TYPES.SOFT_WALL;
    }

    // Spawn enemies
    let enemyCount = 1 + Math.floor(gameState.level / 2);
    for (let i = 0; i < enemyCount; i++) {
        spawnEnemy();
    }

    updateUI();
}

function spawnEnemy() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
        y = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
    } while (gameState.grid[y][x] !== ENTITY_TYPES.EMPTY || (x < 4 && y < 4));
    
    gameState.enemies.push({
        x, y,
        dir: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
        moveCooldown: 0,
        moveDelay: Math.max(20, 40 - gameState.level * 2)
    });
}

// Input handling
window.addEventListener('keydown', e => {
    if (gameState.gameOver) return;
    
    const key = e.key.toLowerCase();
    
    if (['arrowup', 'w'].includes(key)) movePlayer(0, -1);
    if (['arrowdown', 's'].includes(key)) movePlayer(0, 1);
    if (['arrowleft', 'a'].includes(key)) movePlayer(-1, 0);
    if (['arrowright', 'd'].includes(key)) movePlayer(1, 0);
    if (key === ' ' || key === 'spacebar') placeBomb();
});

function movePlayer(dx, dy) {
    if (gameState.player.isDead) return;
    
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;

    if (canMoveTo(newX, newY)) {
        gameState.player.x = newX;
        gameState.player.y = newY;
        
        // Check exit
        if (gameState.exitFound && gameState.player.x === gameState.exitPos.x && gameState.player.y === gameState.exitPos.y) {
            nextLevel();
        }
    }
}

function canMoveTo(x, y) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
    const tile = gameState.grid[y][x];
    if (tile === ENTITY_TYPES.WALL || tile === ENTITY_TYPES.SOFT_WALL) return false;
    
    // Check for bombs
    for (let bomb of gameState.bombs) {
        if (bomb.x === x && bomb.y === y) return false;
    }
    
    return true;
}

function placeBomb() {
    if (gameState.player.isDead) return;
    if (gameState.bombs.length >= gameState.player.maxBombs) return;

    // Don't place bomb on top of another bomb
    const alreadyBomb = gameState.bombs.some(b => b.x === gameState.player.x && b.y === gameState.player.y);
    if (alreadyBomb) return;

    gameState.bombs.push({
        x: gameState.player.x,
        y: gameState.player.y,
        timer: 120, // 2 seconds at 60fps
        range: gameState.player.bombRange
    });
}

function nextLevel() {
    gameState.level++;
    gameState.score += 100;
    setupLevel();
}

function die() {
    if (gameState.player.isDead) return;
    
    gameState.player.isDead = true;
    gameState.lives--;
    updateUI();
    
    if (gameState.lives <= 0) {
        endGame();
    } else {
        setTimeout(() => {
            resetPlayerPosition();
        }, 1000);
    }
}

function resetPlayerPosition() {
    gameState.player.x = 1;
    gameState.player.y = 1;
    gameState.player.isDead = false;
    // Clear area around spawn
    gameState.grid[1][1] = ENTITY_TYPES.EMPTY;
    gameState.grid[1][2] = ENTITY_TYPES.EMPTY;
    gameState.grid[2][1] = ENTITY_TYPES.EMPTY;
}

function endGame() {
    gameState.gameOver = true;
    finalScoreEl.innerText = gameState.score;
    overlay.classList.remove('hidden');
}

// Logic updates
function update() {
    if (gameState.gameOver) return;

    // Update bombs
    for (let i = gameState.bombs.length - 1; i >= 0; i--) {
        const bomb = gameState.bombs[i];
        bomb.timer--;
        if (bomb.timer <= 0) {
            explode(bomb);
            gameState.bombs.splice(i, 1);
        }
    }

    // Update explosions
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const exp = gameState.explosions[i];
        exp.timer--;
        if (exp.timer <= 0) {
            gameState.explosions.splice(i, 1);
        }
    }

    // Update enemies
    for (let enemy of gameState.enemies) {
        enemy.moveCooldown--;
        if (enemy.moveCooldown <= 0) {
            moveEnemy(enemy);
            enemy.moveCooldown = enemy.moveDelay;
        }

        // Collision with player
        if (!gameState.player.isDead && enemy.x === gameState.player.x && enemy.y === gameState.player.y) {
            die();
        }
    }
}

function moveEnemy(enemy) {
    const dirs = [
        { dx: 0, dy: -1 }, // 0: up
        { dx: 1, dy: 0 },  // 1: right
        { dx: 0, dy: 1 },  // 2: down
        { dx: -1, dy: 0 }  // 3: left
    ];

    // Try current direction
    let dir = dirs[enemy.dir];
    let nx = enemy.x + dir.dx;
    let ny = enemy.y + dir.dy;

    if (canMoveTo(nx, ny)) {
        enemy.x = nx;
        enemy.y = ny;
    } else {
        // Change direction randomly
        enemy.dir = Math.floor(Math.random() * 4);
    }
}

function explode(bomb) {
    const coords = [{ x: bomb.x, y: bomb.y }];
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    dirs.forEach(dir => {
        for (let i = 1; i <= bomb.range; i++) {
            const nx = bomb.x + dir.dx * i;
            const ny = bomb.y + dir.dy * i;

            if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) break;

            const tile = gameState.grid[ny][nx];
            if (tile === ENTITY_TYPES.WALL) {
                break; // Stop at hard walls
            }

            coords.push({ x: nx, y: ny });

            if (tile === ENTITY_TYPES.SOFT_WALL) {
                gameState.grid[ny][nx] = ENTITY_TYPES.EMPTY;
                gameState.score += 10;
                updateUI();
                
                // Check if exit was here
                if (gameState.exitPos.x === nx && gameState.exitPos.y === ny) {
                    gameState.exitFound = true;
                }
                break; // Stop at soft walls after destroying
            }
        }
    });

    // Create explosion entities
    coords.forEach(c => {
        gameState.explosions.push({ x: c.x, y: c.y, timer: 20 });
        
        // Check for player hit
        if (!gameState.player.isDead && gameState.player.x === c.x && gameState.player.y === c.y) {
            die();
        }

        // Check for enemy hit
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const e = gameState.enemies[i];
            if (e.x === c.x && e.y === c.y) {
                gameState.enemies.splice(i, 1);
                gameState.score += 50;
                updateUI();
            }
        }

        // Trigger other bombs (chain reaction)
        for (let i = gameState.bombs.length - 1; i >= 0; i--) {
            const otherBomb = gameState.bombs[i];
            if (otherBomb.x === c.x && otherBomb.y === c.y && otherBomb.timer > 5) {
                otherBomb.timer = 5; // Explode almost immediately
            }
        }
    });
}

function updateUI() {
    levelEl.innerText = gameState.level;
    scoreEl.innerText = gameState.score;
    livesEl.innerText = gameState.lives;
}

// Rendering
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const tile = gameState.grid[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (tile === ENTITY_TYPES.WALL) {
                ctx.fillStyle = '#333';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile === ENTITY_TYPES.SOFT_WALL) {
                ctx.fillStyle = '#888';
                ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }

            // Draw Exit if found
            if (gameState.exitFound && gameState.exitPos.x === x && gameState.exitPos.y === y) {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Draw Bombs
    ctx.fillStyle = '#2c3e50';
    gameState.bombs.forEach(bomb => {
        const pulse = Math.sin(Date.now() / 100) * 2;
        ctx.beginPath();
        ctx.arc(bomb.x * TILE_SIZE + TILE_SIZE / 2, bomb.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2.5 + pulse, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Explosions
    ctx.fillStyle = 'rgba(241, 196, 15, 0.7)';
    gameState.explosions.forEach(exp => {
        ctx.fillRect(exp.x * TILE_SIZE, exp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });

    // Draw Enemies
    ctx.fillStyle = '#e74c3c';
    gameState.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x * TILE_SIZE + 5, enemy.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });

    // Draw Player
    if (!gameState.player.isDead) {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(gameState.player.x * TILE_SIZE + 5, gameState.player.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

restartBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    initGame();
});

// Start the game
initGame();
