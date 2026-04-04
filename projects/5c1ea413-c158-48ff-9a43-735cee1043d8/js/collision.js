/**
 * Snake Game - Collision Detection Module
 * Handles wall and self-collision logic
 */

(function() {
    'use strict';

    /**
     * Check if position collides with walls
     */
    function checkWallCollision(position, tileCount) {
        return position.x < 0 || 
               position.x >= tileCount || 
               position.y < 0 || 
               position.y >= tileCount;
    }

    /**
     * Check if position collides with snake body
     */
    function checkSelfCollision(position, snake) {
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === position.x && snake[i].y === position.y) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if position collides with any obstacle
     */
    function checkObstacleCollision(position, snake, tileCount) {
        return checkWallCollision(position, tileCount) || 
               checkSelfCollision(position, snake);
    }

    /**
     * Get collision type description
     */
    function getCollisionType(position, snake, tileCount) {
        if (checkWallCollision(position, tileCount)) {
            return 'wall';
        }
        if (checkSelfCollision(position, snake)) {
            return 'self';
        }
        return null;
    }

    // Expose functions to window
    window.checkWallCollision = checkWallCollision;
    window.checkSelfCollision = checkSelfCollision;
    window.checkObstacleCollision = checkObstacleCollision;
    window.getCollisionType = getCollisionType;

})();