/**
 * Automated Logic Verification Suite
 * Run in a headless or browser-based JS environment
 */

import { SnakeGame } from '../game.js';
import { DIRECTIONS, GRID_SIZE } from '../constants.js';

const test = (name, fn) => {
    try {
        fn();
        console.log(`%c✅ PASS: ${name}`, 'color: #00ff66');
    } catch (err) {
        console.error(`%c❌ FAIL: ${name}`, 'color: #ff3366');
        console.error(err);
    }
};

const expect = (actual) => ({
    toBe: (expected) => {
        if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
    },
    toBeTruthy: () => {
        if (!actual) throw new Error(`Expected value to be truthy`);
    },
    toBeFalsy: () => {
        if (actual) throw new Error(`Expected value to be falsy`);
    }
});

// INITIALIZATION TESTS
test('should boot with correct neural parameters', () => {
    const game = new SnakeGame();
    expect(game.score).toBe(0);
    expect(game.snake.length).toBe(3);
    expect(game.isGameOver).toBeFalsy();
    expect(game.isPaused).toBeFalsy();
});

// MOVEMENT & WRAPPING TESTS
test('should loop across horizontal boundaries (LEFT)', () => {
    const game = new SnakeGame();
    game.snake = [{ x: 0, y: 10 }];
    game.direction = DIRECTIONS.LEFT;
    game.nextDirection = DIRECTIONS.LEFT;
    
    game.update();
    
    expect(game.snake[0].x).toBe(GRID_SIZE - 1);
});

test('should loop across vertical boundaries (UP)', () => {
    const game = new SnakeGame();
    game.snake = [{ x: 10, y: 0 }];
    game.direction = DIRECTIONS.UP;
    game.nextDirection = DIRECTIONS.UP;
    
    game.update();
    
    expect(game.snake[0].y).toBe(GRID_SIZE - 1);
});

// COLLISION TESTS
test('should maintain neural integrity (detect self-collision)', () => {
    const game = new SnakeGame();
    // Create a 2x2 loop where head hits neck
    game.snake = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 11, y: 11 },
        { x: 10, y: 11 }
    ];
    game.direction = DIRECTIONS.DOWN;
    game.nextDirection = DIRECTIONS.UP; // Try to move into self
    
    game.update();
    
    // Note: Directional prevention handles 180s, 
    // but actual body overlap triggers game over
    const head = { x: 11, y: 10 };
    expect(game.checkSelfCollision(head)).toBeTruthy();
});

// SCORING TESTS
test('should increment score when node consumed', () => {
    const game = new SnakeGame();
    const foodPos = { x: 10, y: 9 };
    
    game.snake = [{ x: 10, y: 10 }];
    game.direction = DIRECTIONS.UP;
    game.nextDirection = DIRECTIONS.UP;
    game.food = foodPos;
    
    game.update();
    
    expect(game.score).toBe(10);
    expect(game.snake.length).toBe(2); // Grew by 1
});

test('should increase tick rate on consumption', () => {
    const game = new SnakeGame();
    const initialSpeed = game.speed;
    
    game.handleScore();
    
    expect(game.speed < initialSpeed).toBeTruthy();
});

console.log('%c--- CORE ENGINE TESTS COMPLETE ---', 'font-weight: bold; font-size: 1.2rem; color: #00ffff');