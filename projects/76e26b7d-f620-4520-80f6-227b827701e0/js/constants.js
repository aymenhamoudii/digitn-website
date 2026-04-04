/**
 * Game Configuration Constants
 * Definitive values for game engine behavior
 */

export const GRID_SIZE = 20; // Cells per axis
export const INITIAL_SPEED = 140; // Default tick interval in ms
export const MIN_SPEED = 50; // Fastest possible tick interval
export const SPEED_DECREMENT = 1.5; // Interval reduction per food unit
export const INITIAL_SNAKE_LENGTH = 3;

export const COLORS = {
    BG_DARK: 'hsl(225, 25%, 7%)',
    BG_CARD: 'hsl(225, 25%, 12%)',
    SNAKE_HEAD: 'hsl(155, 100%, 50%)',
    SNAKE_BODY: 'hsl(155, 100%, 35%)',
    FOOD: 'hsl(325, 100%, 60%)',
    GRID_LINE: 'hsla(225, 20%, 95%, 0.03)',
    UI_TEXT: 'hsl(225, 20%, 95%)'
};

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

export const KEY_MAP = {
    'ArrowUp': 'UP',
    'w': 'UP',
    'W': 'UP',
    'ArrowDown': 'DOWN',
    's': 'DOWN',
    'S': 'DOWN',
    'ArrowLeft': 'LEFT',
    'a': 'LEFT',
    'A': 'LEFT',
    'ArrowRight': 'RIGHT',
    'd': 'RIGHT',
    'D': 'RIGHT'
};

export const SCORE_UNIT = 10;
export const LOCAL_STORAGE_KEY = 'snake-core-high-score';