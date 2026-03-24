/**
 * Piano Tiles - Minimalist Game
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const finalScoreEl = document.getElementById('final-score');
const finalHighscoreEl = document.getElementById('final-highscore');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');

// Audio Context Setup
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Simple Piano Synth
function playNote(freq) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
}

// Frequencies for a simple C-major scale sequence
const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
let noteIndex = 0;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let gameStarted = false; // Whether the tiles have started moving
let score = 0;
let highscore = localStorage.getItem('piano-tiles-highscore') || 0;
let tiles = [];
let particles = [];
let speed = 4;
let lastTime = 0;
let lastStateChangeTime = 0;
let columnCount = 4;
let tileHeight = 0;
let tileWidth = 0;

// Resize canvas
function resize() {
    const container = document.getElementById('game-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    tileWidth = canvas.width / columnCount;
    tileHeight = canvas.height / 4;
}

window.addEventListener('resize', resize);
resize();

highscoreEl.innerText = `Best: ${highscore}`;

// Particle System
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.color = color;
        this.life = 1.0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.03;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Tile Class
class Tile {
    constructor(column, y, isStartTile = false) {
        this.column = column;
        this.y = y;
        this.clicked = false;
        this.missed = false;
        this.isStartTile = isStartTile;
    }

    draw() {
        const x = this.column * tileWidth;
        if (this.missed) {
            ctx.fillStyle = '#ff4d4d';
        } else if (this.clicked) {
            ctx.fillStyle = '#e0e0e0';
        } else if (this.isStartTile && !gameStarted) {
            ctx.fillStyle = '#4CAF50'; // Green for the first tile to click
        } else {
            ctx.fillStyle = '#000000';
        }
        
        ctx.fillRect(x, this.y, tileWidth, tileHeight);
        
        // Grid lines
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, this.y, tileWidth, tileHeight);

        if (this.isStartTile && !gameStarted && !this.clicked) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('START', x + tileWidth/2, this.y + tileHeight/2 + 8);
        }
    }

    update() {
        if (gameStarted) {
            this.y += speed;
        }
    }
}

function spawnTile(yOffset = -tileHeight, isStartTile = false) {
    const col = Math.floor(Math.random() * columnCount);
    tiles.push(new Tile(col, yOffset, isStartTile));
}

function initGame() {
    score = 0;
    speed = 4;
    noteIndex = 0;
    tiles = [];
    particles = [];
    scoreEl.innerText = score;
    gameStarted = false;
    // We update lastStateChangeTime here but ALSO in the action handlers to be safe
    lastStateChangeTime = Date.now();
    
    // Initial tiles
    for (let i = 0; i < 5; i++) {
        const y = canvas.height - (i + 1) * tileHeight;
        spawnTile(y, i === 0);
    }
}

function gameOver() {
    if (gameState === 'GAMEOVER') return;
    
    // Safety check: Don't allow game over within first 500ms of game start
    // to prevent "ghost click" game overs
    if (Date.now() - lastStateChangeTime < 500) return;

    gameState = 'GAMEOVER';
    gameStarted = false;
    
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('piano-tiles-highscore', highscore);
    }
    finalScoreEl.innerText = `Score: ${score}`;
    finalHighscoreEl.innerText = `Best: ${highscore}`;
    highscoreEl.innerText = `Best: ${highscore}`;
    gameOverScreen.classList.remove('hidden');
}

function handleInput(x, y) {
    if (gameState !== 'PLAYING') return;
    
    // Block any input for a short duration after the screen changes
    if (Date.now() - lastStateChangeTime < 100) return;

    const col = Math.floor(x / tileWidth);
    
    // Find the lowest unclicked tile
    let targetTileIndex = -1;
    let lowestY = -1000;

    for(let i = 0; i < tiles.length; i++) {
        if (!tiles[i].clicked && tiles[i].y > lowestY) {
            lowestY = tiles[i].y;
            targetTileIndex = i;
        }
    }

    if (targetTileIndex !== -1) {
        const tile = tiles[targetTileIndex];
        // Check if the click is on the lowest tile and in the correct column
        const hitSlop = 40; 
        if (col === tile.column && y >= tile.y - hitSlop && y <= tile.y + tileHeight + hitSlop) {
            tile.clicked = true;
            if (!gameStarted) {
                gameStarted = true;
                // Update time when movement starts to prevent immediate game over if something goes wrong
                lastStateChangeTime = Date.now();
            }
            score++;
            scoreEl.innerText = score;
            speed += 0.03;
            
            // Sound
            playNote(notes[noteIndex % notes.length]);
            noteIndex++;
            
            // Particles
            createParticles(x, y, '#000');
        } else {
            // Clicked wrong place
            // IMPORTANT: If game hasn't started moving yet, ignore "misses" to avoid instant restart loops
            if (gameStarted) {
                gameOver();
            }
        }
    }
}

// Unified Pointer Events
canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    handleInput(e.clientX - rect.left, e.clientY - rect.top);
});

// Prevent default touch behaviors
canvas.addEventListener('touchstart', (e) => {
    if (gameState === 'PLAYING') {
        e.preventDefault();
    }
}, { passive: false });

// Key Events
window.addEventListener('keydown', (e) => {
    if (gameState !== 'PLAYING') return;
    
    let col = -1;
    const key = e.key.toLowerCase();
    if (key === 'd') col = 0;
    if (key === 'f') col = 1;
    if (key === 'j') col = 2;
    if (key === 'k') col = 3;

    if (col !== -1) {
        let targetTileIndex = -1;
        let lowestY = -1000;
        for(let i = 0; i < tiles.length; i++) {
            if (!tiles[i].clicked && tiles[i].y > lowestY) {
                lowestY = tiles[i].y;
                targetTileIndex = i;
            }
        }
        
        if (targetTileIndex !== -1) {
            const tile = tiles[targetTileIndex];
            if (tile.column === col) {
                tile.clicked = true;
                if (!gameStarted) {
                    gameStarted = true;
                    lastStateChangeTime = Date.now();
                }
                score++;
                scoreEl.innerText = score;
                speed += 0.03;
                playNote(notes[noteIndex % notes.length]);
                noteIndex++;
                createParticles((col + 0.5) * tileWidth, tile.y + tileHeight/2, '#000');
            } else {
                if (gameStarted) gameOver();
            }
        }
    }
});

// Game Loop
function update(time) {
    if (!lastTime) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        // Update tiles
        for (let i = tiles.length - 1; i >= 0; i--) {
            const tile = tiles[i];
            tile.update();
            tile.draw();

            if (tile.y > canvas.height) {
                if (!tile.clicked) {
                    tile.missed = true;
                    gameOver();
                    return; 
                }
                tiles.splice(i, 1);
                const topTileY = tiles.length > 0 ? Math.min(...tiles.map(t => t.y)) : 0;
                spawnTile(topTileY - tileHeight);
            }
        }

        while (tiles.length < 6) {
            const topTileY = tiles.length > 0 ? Math.min(...tiles.map(t => t.y)) : 0;
            spawnTile(topTileY - tileHeight);
        }
    } else {
        tiles.forEach(tile => tile.draw());
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(update);
}

// UI Controls
function startAction(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    initAudio();
    resize();
    initGame();
    lastStateChangeTime = Date.now(); // Ensure lockout starts now
    startScreen.classList.add('hidden');
    gameState = 'PLAYING';
}

function restartAction(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    initAudio();
    initGame();
    lastStateChangeTime = Date.now(); // Ensure lockout starts now
    gameOverScreen.classList.add('hidden');
    gameState = 'PLAYING';
}

// Use pointerup for buttons to ensure they don't trigger the canvas pointerdown on the same frame/touch
startBtn.addEventListener('pointerup', startAction);
restartBtn.addEventListener('pointerup', restartAction);

// Fallback for click (important for accessibility/weird browsers)
startBtn.addEventListener('click', (e) => {
    if (gameState !== 'PLAYING') startAction(e);
});
restartBtn.addEventListener('click', (e) => {
    if (gameState !== 'PLAYING') restartAction(e);
});

// Start loop
requestAnimationFrame(update);
// Initialize a few tiles for the background
resize();
for (let i = 0; i < 5; i++) {
    spawnTile(canvas.height - (i + 1) * tileHeight);
}
