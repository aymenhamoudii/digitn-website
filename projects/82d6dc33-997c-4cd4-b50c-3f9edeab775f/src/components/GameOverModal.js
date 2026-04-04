import React from 'react';

const GameOverModal = ({ score, highScore, onRestart }) => {
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md p-8 text-center animate-in zoom-in duration-300">
      <div className="mb-6">
        <h2 className="text-6xl font-black text-neutral-900 drop-shadow-sm mb-2">
          OVER
        </h2>
        {isNewHigh && (
          <div className="inline-block px-3 py-1 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-md shadow-lg mb-2">
            New High Score!
          </div>
        )}
      </div>

      <div className="flex gap-8 mb-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Points
          </span>
          <span className="text-4xl font-black text-neutral-900">
            {score}
          </span>
        </div>
        <div className="w-px bg-neutral-200" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Session Best
          </span>
          <span className="text-4xl font-black text-neutral-600">
            {highScore}
          </span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-12 py-4 bg-neutral-900 text-white text-lg font-black tracking-[0.2em] rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
      >
        RESTART
      </button>
      
      <p className="mt-8 text-neutral-400 text-[10px] uppercase font-bold tracking-widest">
        Monochrome Cycle Complete
      </p>
    </div>
  );
};

export default GameOverModal;
