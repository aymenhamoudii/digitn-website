const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: canvas.height - 60,
    width: 20,
    height: 20,
    color: 'hsl(142, 71%, 45%)',
    dx: 0,
    dy: 0,
    gravity: 0.8,
    jumpPower: -15,
    isJumping: false,
};

const platform = {
    x: 0,
    y: canvas.height - 40,
    width: canvas.width,
    height: 40,
    color: 'hsl(210, 20%, 70%)',
};

let gameRunning = false;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function updatePlayer() {
    // Apply gravity
    player.dy += player.gravity;

    // Move the player up or down
    player.y += player.dy;

    // Prevent player from falling below the platform
    if (player.y + player.height > platform.y) {
        player.y = platform.y - player.height;
        player.isJumping = false;
    }

    drawRect(player.x, player.y, player.width, player.height, player.color);
}

function drawPlatform() {
    drawRect(platform.x, platform.y, platform.width, platform.height, platform.color);
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform();
    updatePlayer();

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!player.isJumping) {
        player.dy = player.jumpPower;
        player.isJumping = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

const playPauseBtn = document.getElementById('playPauseBtn');
playPauseBtn.addEventListener('click', () => {
    gameRunning = !gameRunning;
    playPauseBtn.textContent = gameRunning ? 'Pause' : 'Play';
    if (gameRunning) {
        gameLoop();
    }
});