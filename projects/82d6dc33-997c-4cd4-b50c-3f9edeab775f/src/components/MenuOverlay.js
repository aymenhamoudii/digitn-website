import React from 'react';

const MenuOverlay = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-8 text-center animate-in fade-in duration-700">
      <div className="mb-8">
        <h2 className="text-5xl font-black text-neutral-900 mb-2 drop-shadow-sm">
          READY?
        </h2>
        <p className="text-neutral-500 font-medium tracking-wide max-w-[200px] mx-auto opacity-70">
          Precision movement in a monochrome world.
        </p>
      </div>
      
      <button
        onClick={onStart}
        className="group relative px-10 py-4 bg-neutral-900 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
      >
        <span className="relative text-lg font-black tracking-[0.2em] text-white">
          START GAME
        </span>
      </button>

      <div className="mt-12 flex gap-4 opacity-40">
        <div className="flex flex-col items-center gap-1">
          <kbd className="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-900">WASD</kbd>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-900">Move</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <kbd className="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-900">↑↓←→</kbd>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-900">Move</span>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
