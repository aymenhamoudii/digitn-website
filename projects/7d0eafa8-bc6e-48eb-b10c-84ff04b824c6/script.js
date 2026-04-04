const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fixed logical size for consistent gameplay
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;
canvas.width = LOGICAL_WIDTH;
canvas.height = LOGICAL_HEIGHT;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const currentScoreEl = document.getElementById('current-score');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');

// Game State
let isPlaying = false;
let score = 0;
let highScore = localStorage.getItem('neonJumperHighScore') || 0;
let gameSpeed = 5;
let baseSpeed = 6;
let frameCount = 0;
let animationId;
let distanceScrolled = 0;

// Game Entities
let player;
let platforms = [];
let particles = [];

// Palette
const COLORS = {
    bg: '#0b0914',
    player: '#00f3ff',       // Cyan
    platform: '#ff007f',     // Neon Pink
    platformOutline: '#fff',
    particleMain: '#00f3ff',
    particleAlt: '#f9f871',  // Yellow accent
    grid: 'rgba(255, 0, 127, 0.15)'
};

class Player {
    constructor() {
        this.size = 32;
        this.x = 100;
        this.y = LOGICAL_HEIGHT / 2;
        this.vy = 0;
        this.gravity = 0.6;
        this.jumpForce = -11.5;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.isGrounded = false;
        this.trail = [];
        this.rotation = 0;
    }

    update() {
        // Physics
        this.vy += this.gravity;
        this.y += this.vy;

        // Rotation logic (rotate when jumping)
        if (!this.isGrounded) {
            this.rotation += 0.1;
        } else {
            // Snap rotation to nearest 90 degrees when grounded
            this.rotation = Math.round(this.rotation / (Math.PI/2)) * (Math.PI/2);
        }

        // Trail effect
        this.trail.push({ x: this.x, y: this.y, rotation: this.rotation });
        if (this.trail.length > 8) {
            this.trail.shift();
        }

        // Death by falling
        if (this.y > LOGICAL_HEIGHT + this.size) {
            triggerGameOver();
        }

        this.isGrounded = false;
    }

    draw() {
        // Draw Trail
        this.trail.forEach((pos, index) => {
            const alpha = (index / this.trail.length) * 0.4;
            ctx.save();
            ctx.translate(pos.x + this.size / 2, pos.y + this.size / 2);
            ctx.rotate(pos.rotation);
            ctx.fillStyle = `rgba(0, 243, 255, ${alpha})`;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        });

        // Draw Player Body
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = COLORS.player;
        ctx.shadowColor = COLORS.player;
        ctx.shadowBlur = 15;
        
        // Slightly rounded rect for style
        ctx.beginPath();
        ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 4);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Inner detail
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(-this.size / 4, -this.size / 4, this.size/2, this.size/2, 2);
        ctx.fill();
        
        ctx.restore();
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.vy = this.jumpForce;
            this.jumpCount++;
            this.isGrounded = false;
            
            // Visual feedback
            spawnParticles(this.x + this.size/2, this.y + this.size, 15, COLORS.particleMain, COLORS.particleAlt);
            
            // Give a little forward boost if double jumping
            if (this.jumpCount === 2) {
                this.rotation += 0.5; // spin faster
            }
        }
    }
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 24;
        this.scored = false;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.fillStyle = COLORS.platform;
        ctx.shadowColor = COLORS.platform;
        ctx.shadowBlur = 10;
        
        // Main block
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        
        // Bright outline
        ctx.strokeStyle = COLORS.platformOutline;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Striped pattern inside platform for detail
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 4;
        for (let i = 10; i < this.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y + 2);
            ctx.lineTo(this.x + i - 10, this.y + this.height - 2);
            ctx.stroke();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10 - 2; // Bias upwards
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // slight gravity for particles
        this.life -= this.decay;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

function spawnParticles(x, y, amount, color1, color2) {
    for (let i = 0; i < amount; i++) {
        const color = Math.random() > 0.5 ? color1 : color2;
        particles.push(new Particle(x, y, color));
    }
}

function checkCollisions() {
    for (let i = 0; i < platforms.length; i++) {
        let p = platforms[i];
        
        // AABB check
        if (player.x < p.x + p.width &&
            player.x + player.size > p.x &&
            player.y < p.y + p.height &&
            player.y + player.size > p.y) {
            
            // Determine if landed on top
            // Using previous Y position to ensure we fell onto it
            let prevPlayerBottom = (player.y - player.vy) + player.size;
            
            // Allow a small margin for precision errors at high speeds
            if (prevPlayerBottom <= p.y + Math.max(12, player.vy + 2)) {
                // Landed successfully
                player.isGrounded = true;
                player.jumpCount = 0;
                player.vy = 0;
                player.y = p.y - player.size;
                player.rotation = 0; // Reset rotation
            } else {
                // Hit the side or bottom -> Crash
                triggerGameOver();
            }
        }
    }
}

function generatePlatform() {
    const minWidth = 120;
    const maxWidth = 350;
    const width = Math.random() * (maxWidth - minWidth) + minWidth;
    
    let lastPlatform = platforms[platforms.length - 1];
    let y = LOGICAL_HEIGHT - 150;
    let x = LOGICAL_WIDTH;
    
    if (lastPlatform) {
        // Calculate reachable distance
        const maxJumpHeight = 180;
        const yOffset = (Math.random() - 0.5) * maxJumpHeight * 1.8;
        
        y = lastPlatform.y + yOffset;
        // Clamp Y to keep within playable area
        y = Math.max(200, Math.min(y, LOGICAL_HEIGHT - 60));
        
        // Gap depends on speed and random factor
        const minGap = 100;
        const maxGap = Math.min(350, 150 + (gameSpeed * 15));
        const gap = Math.random() * (maxGap - minGap) + minGap;
        
        x = lastPlatform.x + lastPlatform.width + gap;
        
        // Prevent generating overlapping platforms due to screen wrap logic
        if (x < LOGICAL_WIDTH) x = LOGICAL_WIDTH;
    }

    platforms.push(new Platform(x, y, width));
}

function drawGridBackground() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    // Parallax effect for grid
    const offsetX = (distanceScrolled * 0.3) % gridSize;
    const offsetY = (player.y * 0.1) % gridSize; // slight vertical parallax
    
    ctx.beginPath();
    // Vertical lines
    for (let x = -offsetX; x < LOGICAL_WIDTH; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, LOGICAL_HEIGHT);
    }
    // Horizontal lines
    for (let y = -offsetY; y < LOGICAL_HEIGHT; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(LOGICAL_WIDTH, y);
    }
    ctx.stroke();
}

function initGame() {
    player = new Player();
    platforms = [];
    particles = [];
    score = 0;
    distanceScrolled = 0;
    gameSpeed = baseSpeed;
    frameCount = 0;
    
    // Initial safe platform
    platforms.push(new Platform(50, LOGICAL_HEIGHT - 100, 600));
    
    // Pre-generate
    for (let i = 0; i < 4; i++) {
        generatePlatform();
    }
    
    currentScoreEl.innerText = score;
}

function updateGame() {
    if (!isPlaying) return;
    
    animationId = requestAnimationFrame(updateGame);
    frameCount++;
    distanceScrolled += gameSpeed;
    
    // Increase difficulty over time
    if (frameCount % 600 === 0) { // Every ~10 seconds
        gameSpeed += 0.5;
        // Cap speed
        if (gameSpeed > 15) gameSpeed = 15;
    }
    
    // Update score based on distance
    if (frameCount % 10 === 0) {
        score += 1;
        currentScoreEl.innerText = score;
    }
    
    // Clear screen
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    
    drawGridBackground();
    
    // Platforms update & draw
    for (let i = platforms.length - 1; i >= 0; i--) {
        let p = platforms[i];
        p.update();
        p.draw();
        
        // Remove offscreen platforms
        if (p.x + p.width < -100) {
            platforms.splice(i, 1);
        }
    }
    
    // Spawn new platforms continuously
    let lastPlatform = platforms[platforms.length - 1];
    if (lastPlatform && lastPlatform.x + lastPlatform.width < LOGICAL_WIDTH + 300) {
        generatePlatform();
    }
    
    // Particles update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.update();
        pt.draw();
        if (pt.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Player update & draw
    player.update();
    checkCollisions();
    
    // Only draw player if alive (checked inside update)
    if (isPlaying) {
        player.draw();
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    initGame();
    isPlaying = true;
    updateGame();
}

function triggerGameOver() {
    if (!isPlaying) return;
    isPlaying = false;
    cancelAnimationFrame(animationId);
    
    // Explode player
    spawnParticles(player.x + player.size/2, player.y + player.size/2, 60, COLORS.player, COLORS.platform);
    
    // Render one final frame to show explosion
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    drawGridBackground();
    platforms.forEach(p => p.draw());
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // UI Update
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalScoreEl.innerText = score;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonJumperHighScore', highScore);
    }
    highScoreEl.innerText = highScore;
}

// Input Handling
function handleInput(e) {
    // Prevent default scrolling for game keys
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
    }

    if ((e.type === 'keydown' && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) || 
         e.type === 'mousedown' || 
         e.type === 'touchstart') {
        
        if (!isPlaying) {
            // Only start if UI is showing
            if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
                // Ignore clicks on buttons themselves (handled by event listeners below)
                if (e.target.tagName !== 'BUTTON') {
                   startGame();
                }
            }
        } else {
            player.jump();
        }
    }
}

// Event Listeners
window.addEventListener('keydown', handleInput, { passive: false });
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput(e);
}, { passive: false });

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialization
highScoreEl.innerText = highScore;

// Draw a static background frame initially
ctx.fillStyle = COLORS.bg;
ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);