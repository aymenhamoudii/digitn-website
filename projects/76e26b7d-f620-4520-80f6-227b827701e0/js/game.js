import { 
    GRID_SIZE, 
    INITIAL_SPEED, 
    MIN_SPEED, 
    SPEED_DECREMENT, 
    DIRECTIONS,
    SCORE_UNIT,
    LOCAL_STORAGE_KEY,
    INITIAL_SNAKE_LENGTH
} from './constants.js';
import { getRandomPosition } from './utils.js';

/**
 * SnakeGame Logic Engine
 * Handles state, physics, and game rules
 */
export class SnakeGame {
    constructor() {
        this.reset();
    }

    /**
     * Resets game state to initial values
     */
    reset() {
        // Snake starting in the middle, facing UP
        const middle = Math.floor(GRID_SIZE / 2);
        this.snake = [];
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            this.snake.push({ x: middle, y: middle + i });
        }

        this.direction = DIRECTIONS.UP;
        this.nextDirection = DIRECTIONS.UP;
        
        // Spawn first food, ensuring it's not on the snake
        this.food = getRandomPosition(GRID_SIZE, this.snake);
        
        this.score = 0;
        this.speed = INITIAL_SPEED;
        this.isGameOver = false;
        this.isPaused = false;
    }

    /**
     * Updates requested direction for next tick
     * Includes logic to prevent 180-degree turns
     */
    setDirection(dirName) {
        if (this.isPaused || this.isGameOver) return;
        
        const requestedDir = DIRECTIONS[dirName];
        if (!requestedDir) return;

        // Prevent moving directly opposite to current direction
        const isOpposite = (
            requestedDir.x === -this.direction.x && 
            requestedDir.y === -this.direction.y
        );

        if (!isOpposite) {
            this.nextDirection = requestedDir;
        }
    }

    /**
     * Main game logic tick
     * Moves snake, handles collisions, food, and wrapping
     */
    update() {
        if (this.isGameOver || this.isPaused) return;

        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { 
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Handle wall wrapping (Boundary looping)
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;

        // Self-collision check
        if (this.checkSelfCollision(head)) {
            this.isGameOver = true;
            return;
        }

        // Add new head to snake
        this.snake.unshift(head);

        // Food consumption check
        if (head.x === this.food.x && head.y === this.food.y) {
            this.handleScore();
        } else {
            // If no food, remove tail to maintain length
            this.snake.pop();
        }
    }

    /**
     * Check if head position overlaps any body segment
     */
    checkSelfCollision(head) {
        // We only check against body segments, excluding the tail 
        // because the tail moves forward in the same tick if no food is eaten.
        // However, for safety in various edge cases, we check all segments.
        return this.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    /**
     * Processes food consumption: increments score, increases speed, spawns new food
     */
    handleScore() {
        this.score += SCORE_UNIT;
        
        // Difficulty scaling
        if (this.speed > MIN_SPEED) {
            this.speed -= SPEED_DECREMENT;
        }

        this.food = getRandomPosition(GRID_SIZE, this.snake);
    }

    /**
     * High score persistence logic
     */
    static getHighScore() {
        return parseInt(localStorage.getItem(LOCAL_STORAGE_KEY)) || 0;
    }

    saveHighScore() {
        const currentHigh = SnakeGame.getHighScore();
        if (this.score > currentHigh) {
            localStorage.setItem(LOCAL_STORAGE_KEY, this.score.toString());
            return true;
        }
        return false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
}