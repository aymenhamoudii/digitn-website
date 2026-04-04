import React from 'react';
import { DIRECTIONS } from '../utils/constants';

const Controls = ({ onMove }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[180px] mx-auto md:hidden opacity-90">
      <div />
      <button
        onClick={() => onMove(DIRECTIONS.UP)}
        className="bg-neutral-100 aspect-square flex items-center justify-center rounded-xl active:scale-90 transition-all border border-neutral-200"
        aria-label="Up"
      >
        <span className="text-xl text-neutral-900">↑</span>
      </button>
      <div />
      
      <button
        onClick={() => onMove(DIRECTIONS.LEFT)}
        className="bg-neutral-100 aspect-square flex items-center justify-center rounded-xl active:scale-90 transition-all border border-neutral-200"
        aria-label="Left"
      >
        <span className="text-xl text-neutral-900">←</span>
      </button>
      <button
        onClick={() => onMove(DIRECTIONS.DOWN)}
        className="bg-neutral-100 aspect-square flex items-center justify-center rounded-xl active:scale-90 transition-all border border-neutral-200"
        aria-label="Down"
      >
        <span className="text-xl text-neutral-900">↓</span>
      </button>
      <button
        onClick={() => onMove(DIRECTIONS.RIGHT)}
        className="bg-neutral-100 aspect-square flex items-center justify-center rounded-xl active:scale-90 transition-all border border-neutral-200"
        aria-label="Right"
      >
        <span className="text-xl text-neutral-900">→</span>
      </button>
    </div>
  );
};

export default Controls;
