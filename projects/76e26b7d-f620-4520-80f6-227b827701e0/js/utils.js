/**
 * Utility functions for game state and math
 */

/**
 * Generates a random integer between min and max (inclusive)
 */
export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Formats score numbers to 3 digits (e.g., 005)
 * Essential for modern HUD aesthetics
 */
export const formatScore = (score) => {
    return score.toString().padStart(3, '0');
};

/**
 * Generates a random position on the grid that doesn't overlap with the snake body
 * Used for food spawning
 */
export const getRandomPosition = (gridSize, snakeBody) => {
    let position;
    let isColliding = true;
    let attempts = 0;
    const maxAttempts = gridSize * gridSize;

    while (isColliding && attempts < maxAttempts) {
        position = {
            x: getRandomInt(0, gridSize - 1),
            y: getRandomInt(0, gridSize - 1)
        };

        isColliding = snakeBody.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
        attempts++;
    }

    return position;
};

/**
 * Linear interpolation for smooth color transitions or animations
 */
export const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
};

/**
 * Simple debounce function for performance optimization
 */
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};