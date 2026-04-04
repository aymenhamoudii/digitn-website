import React from 'react';

const ScoreBoard = ({ score, highScore }) => {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
            Best
          </span>
          <span className="text-xl font-black text-neutral-600 tabular-nums">
            {highScore.toLocaleString()}
          </span>
        </div>
        <div className="h-8 w-px bg-neutral-200 mx-1" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
            Score
          </span>
          <span className="text-2xl font-black text-neutral-900 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
