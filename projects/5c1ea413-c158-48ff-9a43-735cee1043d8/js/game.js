/**
 * Snake Game - Core Game Logic
 * Manages snake movement, food, and game state
 */

(function() {
    'use strict';

    // Game Configuration
    var GRID_SIZE = 20;
    var TILE_COUNT = 20;
    var INITIAL_SPEED = 120;

    // Color palette for game elements
    var COLORS = {
        snakeHead: '#7BA37B',
        snakeBody: '#A8C5A8',
        snakeBodyAlt: '#C4DBC4',
        food: '#E8B4B8',
        foodGlow: '#F2D0D3',
        grid: '#F5EDE4',
        gridLine: '#EBE3D9'
    };

    // Game State
    var gameState = {
        snake: [],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 0, y: 0 },
        score: 0,
        isRunning: false,
        isPaused: false,
        gameLoop: null,
        lastUpdate: 0,
        speed: INITIAL_SPEED
    };

    // DOM Elements
    var canvas, ctx;

    /**
     * Initialize the game
     */
    function init() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        
        // Set canvas size based on grid
        canvas.width = TILE_COUNT * GRID_SIZE;
        canvas.height = TILE_COUNT * GRID_SIZE;
        
        resetGame();
        draw();
    }

    /**
     * Reset game to initial state
     */
    function resetGame() {
        var centerX = Math.floor(TILE_COUNT / 2);
        var centerY = Math.floor(TILE_COUNT / 2);
        
        gameState.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        gameState.direction = { x: 1, y: 0 };
        gameState.nextDirection = { x: 1, y: 0 };
        gameState.score = 0;
        gameState.isRunning = false;
        gameState.isPaused = false;
        gameState.speed = INITIAL_SPEED;
        
        spawnFood();
        updateScoreDisplay();
    }

    /**
     * Start the game
     */
    function startGame() {
        if (gameState.isRunning) return;
        
        gameState.isRunning = true;
        gameState.lastUpdate = performance.now();
        
        if (gameState.gameLoop) {
            cancelAnimationFrame(gameState.gameLoop);
        }
        
        gameLoop();
    }

    /**
     * Pause the game
     */
    function pauseGame() {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        gameState.isPaused = true;
        showOverlay('pauseOverlay');
    }

    /**
     * Resume the game
     */
    function resumeGame() {
        if (!gameState.isPaused) return;
        
        gameState.isPaused = false;
        hideOverlay('pauseOverlay');
        gameState.lastUpdate = performance.now();
        
        if (gameState.gameLoop) {
            cancelAnimationFrame(gameState.gameLoop);
        }
        
        gameLoop();
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        var deltaTime = timestamp - gameState.lastUpdate;
        
        if (deltaTime >= gameState.speed) {
            update();
            draw();
            gameState.lastUpdate = timestamp;
        }
        
        gameState.gameLoop = requestAnimationFrame(gameLoop);
    }

    /**
     * Update game state
     */
    function update() {
        // Apply next direction
        gameState.direction = { 
            x: gameState.nextDirection.x, 
            y: gameState.nextDirection.y 
        };
        
        // Calculate new head position
        var head = gameState.snake[0];
        var newHead = {
            x: head.x + gameState.direction.x,
            y: head.y + gameState.direction.y
        };
        
        // Check for collisions
        if (checkCollision(newHead)) {
            gameOver();
            return;
        }
        
        // Add new head
        gameState.snake.unshift(newHead);
        
        // Check if food eaten
        if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
            eatFood();
        } else {
            // Remove tail
            gameState.snake.pop();
        }
    }

    /**
     * Check for collisions
     */
    function checkCollision(position) {
        // Wall collision
        if (position.x < 0 || position.x >= TILE_COUNT || 
            position.y < 0 || position.y >= TILE_COUNT) {
            return true;
        }
        
        // Self collision
        for (var i = 0; i < gameState.snake.length; i++) {
            if (gameState.snake[i].x === position.x && 
                gameState.snake[i].y === position.y) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Spawn food at random position
     */
    function spawnFood() {
        var validPositions = [];
        
        // Find all valid positions (not occupied by snake)
        for (var x = 0; x < TILE_COUNT; x++) {
            for (var y = 0; y < TILE_COUNT; y++) {
                var isOccupied = false;
                
                for (var i = 0; i < gameState.snake.length; i++) {
                    if (gameState.snake[i].x === x && gameState.snake[i].y === y) {
                        isOccupied = true;
                        break;
                    }
                }
                
                if (!isOccupied) {
                    validPositions.push({ x: x, y: y });
                }
            }
        }
        
        // Pick random position
        if (validPositions.length > 0) {
            var randomIndex = Math.floor(Math.random() * validPositions.length);
            gameState.food = validPositions[randomIndex];
        }
    }

    /**
     * Handle eating food
     */
    function eatFood() {
        gameState.score += 10;
        
        // Speed up slightly every 50 points
        if (gameState.score % 50 === 0 && gameState.speed > 50) {
            gameState.speed -= 5;
        }
        
        // Trigger particle effect
        if (window.triggerParticles) {
            var foodPixelX = gameState.food.x * GRID_SIZE + GRID_SIZE / 2;
            var foodPixelY = gameState.food.y * GRID_SIZE + GRID_SIZE / 2;
            window.triggerParticles(foodPixelX, foodPixelY, 'eat');
        }
        
        // Play eat sound
        if (window.playEatSound) {
            window.playEatSound();
        }
        
        updateScoreDisplay();
        spawnFood();
    }

    /**
     * Update score display
     */
    function updateScoreDisplay() {
        var scoreEl = document.getElementById('currentScore');
        if (scoreEl) {
            scoreEl.textContent = gameState.score;
            scoreEl.classList.add('pulse');
            setTimeout(function() {
                scoreEl.classList.remove('pulse');
            }, 300);
        }
    }

    /**
     * Draw the game
     */
    function draw() {
        if (!ctx) return;
        
        // Clear canvas
        ctx.fillStyle = COLORS.grid;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw food
        drawFood();
        
        // Draw snake
        drawSnake();
    }

    /**
     * Draw grid lines
     */
    function drawGrid() {
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        
        for (var i = 0; i <= TILE_COUNT; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * GRID_SIZE, 0);
            ctx.lineTo(i * GRID_SIZE, canvas.height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * GRID_SIZE);
            ctx.lineTo(canvas.width, i * GRID_SIZE);
            ctx.stroke();
        }
    }

    /**
     * Draw the snake
     */
    function drawSnake() {
        // Draw body segments
        for (var i = gameState.snake.length - 1; i >= 0; i--) {
            var segment = gameState.snake[i];
            var isHead = i === 0;
            
            ctx.fillStyle = isHead ? COLORS.snakeHead : 
                           (i % 2 === 0 ? COLORS.snakeBody : COLORS.snakeBodyAlt);
            
            // Rounded rectangle for segments
            var x = segment.x * GRID_SIZE + 1;
            var y = segment.y * GRID_SIZE + 1;
            var size = GRID_SIZE - 2;
            var radius = 4;
            
            roundRect(ctx, x, y, size, size, radius, true, false);
            
            // Draw eyes on head
            if (isHead) {
                drawEyes(segment);
            }
        }
    }

    /**
     * Draw eyes on snake head
     */
    function drawEyes(head) {
        var centerX = head.x * GRID_SIZE + GRID_SIZE / 2;
        var centerY = head.y * GRID_SIZE + GRID_SIZE / 2;
        
        ctx.fillStyle = '#2D2D2D';
        
        // Calculate eye positions based on direction
        var eyeOffsetX = gameState.direction.x * 3;
        var eyeOffsetY = gameState.direction.y * 3;
        
        var leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (gameState.direction.x !== 0) {
            // Horizontal direction
            leftEyeX = centerX + eyeOffsetX - 2;
            leftEyeY = centerY - 4;
            rightEyeX = centerX + eyeOffsetX - 2;
            rightEyeY = centerY + 4;
        } else {
            // Vertical direction
            leftEyeX = centerX - 4;
            leftEyeY = centerY + eyeOffsetY - 2;
            rightEyeX = centerX + 4;
            rightEyeY = centerY + eyeOffsetY - 2;
        }
        
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw the food
     */
    function drawFood() {
        var x = gameState.food.x * GRID_SIZE + GRID_SIZE / 2;
        var y = gameState.food.y * GRID_SIZE + GRID_SIZE / 2;
        var radius = GRID_SIZE / 2 - 2;
        
        // Glow effect
        ctx.shadowColor = COLORS.foodGlow;
        ctx.shadowBlur = 10;
        
        // Draw circle
        ctx.fillStyle = COLORS.food;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Inner highlight
        ctx.fillStyle = COLORS.foodGlow;
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Helper function to draw rounded rectangles
     */
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }

    /**
     * Handle game over
     */
    function gameOver() {
        gameState.isRunning = false;
        
        if (gameState.gameLoop) {
            cancelAnimationFrame(gameState.gameLoop);
        }
        
        // Play game over sound
        if (window.playGameOverSound) {
            window.playGameOverSound();
        }
        
        // Update high score
        var highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        if (gameState.score > highScore) {
            localStorage.setItem('snakeHighScore', gameState.score.toString());
            updateHighScoreDisplay(gameState.score);
        }
        
        // Show game over overlay
        var finalScoreEl = document.getElementById('finalScore');
        if (finalScoreEl) {
            finalScoreEl.textContent = gameState.score;
        }
        
        showOverlay('gameOverOverlay');
    }

    /**
     * Update high score display
     */
    function updateHighScoreDisplay(score) {
        var highScoreEl = document.getElementById('highScore');
        if (highScoreEl) {
            highScoreEl.textContent = score;
        }
    }

    /**
     * Show overlay
     */
    function showOverlay(overlayId) {
        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide overlay
     */
    function hideOverlay(overlayId) {
        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Change direction
     */
    function changeDirection(newDirection) {
        // Prevent 180-degree turns
        if (newDirection.x === -gameState.direction.x && 
            newDirection.y === -gameState.direction.y) {
            return;
        }
        
        gameState.nextDirection = newDirection;
    }

    /**
     * Get current game state
     */
    function getGameState() {
        return gameState;
    }

    /**
     * Load high score from storage
     */
    function loadHighScore() {
        var highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        updateHighScoreDisplay(highScore);
    }

    // Expose functions to window for use by other scripts
    window.gameInit = init;
    window.startGame = startGame;
    window.pauseGame = pauseGame;
    window.resumeGame = resumeGame;
    window.resetGame = resetGame;
    window.changeDirection = changeDirection;
    window.getGameState = getGameState;
    window.loadHighScore = loadHighScore;
    window.hideOverlay = hideOverlay;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            loadHighScore();
        });
    } else {
        init();
        loadHighScore();
    }

})();