// Poo Catcher Game - JavaScript

const game = {
    score: 0,
    lives: 3,
    isPlaying: false,
    basketX: 50, // percentage
    speed: 3,
    items: ['💩'],
    activeItem: null,
    isPaused: false
};

const elements = {
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    basket: document.getElementById('basket'),
    gameArea: document.getElementById('gameArea'),
    startScreen: document.getElementById('startScreen'),
    gameOver: document.getElementById('gameOver'),
    finalScore: document.getElementById('finalScore'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn')
};

// Keyboard state
const keys = {
    left: false,
    right: false
};

// Initialize game
function init() {
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', startGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Touch controls for mobile
    let touchStartX = 0;
    elements.gameArea.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    elements.gameArea.addEventListener('touchmove', (e) => {
        if (!game.isPlaying) return;
        const touchX = e.touches[0].clientX;
        const diff = touchX - touchStartX;
        
        if (Math.abs(diff) > 10) {
            if (diff > 0) {
                moveBasket(5);
            } else {
                moveBasket(-5);
            }
            touchStartX = touchX;
        }
    });
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
}

function startGame() {
    // Reset game state
    game.score = 0;
    game.lives = 3;
    game.isPlaying = true;
    game.basketX = 50;
    game.speed = 3;
    
    // Remove any existing falling items
    const existingItems = document.querySelectorAll('.falling-item');
    existingItems.forEach(item => item.remove());
    
    updateScore();
    updateLives();
    updateBasketPosition();
    
    elements.startScreen.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    
    // Start game loop
    gameLoop();
    
    // Spawn first item after a short delay
    setTimeout(spawnItem, 800);
}

function gameLoop() {
    if (!game.isPlaying) return;
    
    // Move basket based on keys
    if (keys.left) {
        moveBasket(-3);
    }
    if (keys.right) {
        moveBasket(3);
    }
    
    requestAnimationFrame(gameLoop);
}

function moveBasket(direction) {
    game.basketX += direction;
    
    // Clamp to boundaries
    if (game.basketX < 5) game.basketX = 5;
    if (game.basketX > 95) game.basketX = 95;
    
    updateBasketPosition();
}

function updateBasketPosition() {
    elements.basket.style.left = `calc(${game.basketX}% - 32px)`;
}

function spawnItem() {
    if (!game.isPlaying) return;
    
    // Create new falling item
    const item = document.createElement('div');
    item.className = 'falling-item';
    item.textContent = '💩';
    
    // Random X position (10% to 90%)
    const randomX = 10 + Math.random() * 80;
    item.style.left = `${randomX}%`;
    item.style.top = '0px';
    
    elements.gameArea.appendChild(item);
    game.activeItem = item;
    
    // Animate falling
    const startTime = Date.now();
    // Calculate duration based on speed - slower = longer fall
    const gameAreaHeight = elements.gameArea.clientHeight;
    const basketHeight = 60;
    const fallDistance = gameAreaHeight - basketHeight - 20;
    const duration = fallDistance / game.speed * 100; // milliseconds per pixel
    
    function fall() {
        if (!game.isPlaying) return;
        
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            // Item hit the ground - lose a life
            if (game.activeItem && game.activeItem.parentNode) {
                game.activeItem.remove();
            }
            game.activeItem = null;
            loseLife();
            
            // Spawn next item if still playing
            if (game.isPlaying) {
                setTimeout(spawnItem, 1000);
            }
            return;
        }
        
        const top = progress * fallDistance;
        item.style.top = `${top}px`;
        
        // Check collision with basket
        const itemRect = item.getBoundingClientRect();
        const basketRect = elements.basket.getBoundingClientRect();
        
        if (checkCollision(itemRect, basketRect)) {
            // Caught the item!
            catchItem(item);
            return;
        }
        
        requestAnimationFrame(fall);
    }
    
    requestAnimationFrame(fall);
}

function checkCollision(itemRect, basketRect) {
    // Check if item overlaps with basket
    return !(
        itemRect.right < basketRect.left + 10 ||
        itemRect.left > basketRect.right - 10 ||
        itemRect.bottom < basketRect.top
    );
}

function catchItem(item) {
    // Add score
    game.score += 10;
    updateScore();
    
    // Increase speed slightly every 50 points
    if (game.score % 50 === 0) {
        game.speed = Math.min(game.speed + 0.5, 8);
    }
    
    // Visual feedback
    const rect = item.getBoundingClientRect();
    const areaRect = elements.gameArea.getBoundingClientRect();
    const x = rect.left - areaRect.left;
    const y = rect.top - areaRect.top;
    createParticles(x, y);
    
    // Remove item
    item.remove();
    game.activeItem = null;
    
    // Spawn next item
    if (game.isPlaying) {
        setTimeout(spawnItem, 800);
    }
}

function loseLife() {
    game.lives--;
    updateLives();
    
    // Screen shake effect
    elements.gameArea.classList.add('shake');
    setTimeout(() => {
        elements.gameArea.classList.remove('shake');
    }, 500);
    
    if (game.lives <= 0) {
        gameOver();
    }
}

function updateScore() {
    elements.score.textContent = game.score;
}

function updateLives() {
    let hearts = '';
    for (let i = 0; i < game.lives; i++) {
        hearts += '❤️';
    }
    elements.lives.textContent = hearts;
}

function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = '⭐';
        particle.style.left = `${x + Math.random() * 40 - 20}px`;
        particle.style.top = `${y}px`;
        
        elements.gameArea.appendChild(particle);
        
        // Animate and remove
        particle.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: `translateY(${50 + Math.random() * 30}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        setTimeout(() => particle.remove(), 600);
    }
}

function gameOver() {
    game.isPlaying = false;
    game.activeItem = null;
    elements.finalScore.textContent = game.score;
    elements.gameOver.classList.remove('hidden');
}

// Start the game
init();
