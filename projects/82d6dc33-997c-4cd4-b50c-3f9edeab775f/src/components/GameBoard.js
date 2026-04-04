import React from 'react';
import { GRID_SIZE } from '../utils/constants';

const GameBoard = ({ snake, food }) => {
  // Defensive checks to ensure game-loop stability
  const safeSnake = Array.isArray(snake) ? snake : [];
  const safeFood = food || { x: -1, y: -1 };

  const isSnake = (x, y) => safeSnake.some((s) => s.x === x && s.y === y);
  const isFood = (x, y) => safeFood.x === x && safeFood.y === y;
  const isHead = (x, y) => safeSnake.length > 0 && safeSnake[0].x === x && safeSnake[0].y === y;

  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isS = isSnake(x, y);
        const isF = isFood(x, y);
        const isH = isHead(x, y);

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              relative flex items-center justify-center rounded-[2px] transition-all duration-300
              ${isS ? (isH ? 'bg-neutral-900 z-10 scale-110 shadow-lg' : 'bg-neutral-600') : 'bg-transparent border-[0.5px] border-neutral-100'}
            `}
          >
            {isF && (
              <div className="w-[60%] h-[60%] bg-neutral-400 rounded-sm food-pulse shadow-sm" />
            )}
            {isH && (
              <div className="absolute inset-0 bg-neutral-900/10 blur-[1px]" />
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div 
      className="game-grid w-full h-full p-1 sm:p-2 bg-neutral-50/50"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        aspectRatio: '1/1'
      }}
    >
      {renderCells()}
    </div>
  );
};

export default GameBoard;
