import { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, DIRECTIONS, INITIAL_SNAKE, DIFFICULTIES, GAME_STATUS } from '../utils/constants';

// Singleton AudioContext to avoid hitting browser limits
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'eat':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
      case 'move':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, now);
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;
      case 'gameOver':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, now);
        oscillator.frequency.exponentialRampToValueAtTime(55, now + 0.5);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
      case 'start':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};

const useSnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(DIRECTIONS.UP);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('snakeHighScore') || '0', 10)
  );
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.IDLE);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [isMuted, setIsMuted] = useState(false);
  
  const lastDirectionRef = useRef(DIRECTIONS.UP);
  const nextDirectionRef = useRef(DIRECTIONS.UP);

  const triggerSound = useCallback((type) => {
    if (!isMuted) playSound(type);
  }, [isMuted]);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    let attempts = 0;
    while (attempts < 100) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
      attempts++;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;

    setSnake((prevSnake) => {
      if (!prevSnake || prevSnake.length === 0) return INITIAL_SNAKE;

      const currentDirection = nextDirectionRef.current;
      lastDirectionRef.current = currentDirection;

      const head = prevSnake[0];
      const newHead = {
        x: (head.x + currentDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + currentDirection.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameStatus(GAME_STATUS.GAME_OVER);
        triggerSound('gameOver');
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check collision with food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        triggerSound('eat');
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, highScore, gameStatus, triggerSound]);

  const changeDirection = useCallback((newDir) => {
    const lastDir = lastDirectionRef.current;
    
    // Prevent 180 degree turns
    const isOpposite = (
      (newDir.x !== 0 && newDir.x === -lastDir.x) ||
      (newDir.y !== 0 && newDir.y === -lastDir.y)
    );

    // Only play sound and update if the direction is actually different from the current intended direction
    if (!isOpposite && (newDir.x !== nextDirectionRef.current.x || newDir.y !== nextDirectionRef.current.y)) {
      nextDirectionRef.current = newDir;
      triggerSound('move');
    }
  }, [triggerSound]);

  const startGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setScore(0);
    lastDirectionRef.current = DIRECTIONS.UP;
    nextDirectionRef.current = DIRECTIONS.UP;
    setFood(generateFood(INITIAL_SNAKE));
    setGameStatus(GAME_STATUS.PLAYING);
    triggerSound('start');
  }, [generateFood, triggerSound]);

  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  useEffect(() => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;

    const interval = setInterval(moveSnake, DIFFICULTIES[difficulty].speed);
    return () => clearInterval(interval);
  }, [gameStatus, moveSnake, difficulty]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key repeat to prevent "trrrrr" sound and excessive context creation
      if (e.repeat) return;

      // Start game on any movement key if idle or game over
      if (gameStatus === GAME_STATUS.IDLE || gameStatus === GAME_STATUS.GAME_OVER) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
          startGame();
          return;
        }
      }

      if (gameStatus !== GAME_STATUS.PLAYING) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 'arrowup':
        case 'w':
          changeDirection(DIRECTIONS.UP);
          break;
        case 'arrowdown':
        case 's':
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'arrowleft':
        case 'a':
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'arrowright':
        case 'd':
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case 'm':
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameStatus, startGame, toggleMute]);

  return {
    snake,
    food,
    score,
    highScore,
    gameStatus,
    difficulty,
    isMuted,
    startGame,
    resetGame,
    changeDirection,
    setDifficulty,
    toggleMute
  };
};

export default useSnakeGame;
