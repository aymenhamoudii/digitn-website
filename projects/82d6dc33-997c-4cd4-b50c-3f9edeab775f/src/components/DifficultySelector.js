import React from 'react';
import { DIFFICULTIES } from '../utils/constants';

const DifficultySelector = ({ current, onChange, disabled }) => {
  return (
    <div className="flex flex-col gap-3 px-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
          Difficulty Level
        </span>
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.1em]">
          {DIFFICULTIES[current].label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl">
        {Object.keys(DIFFICULTIES).map((key) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            disabled={disabled}
            className={`
              py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all duration-200
              ${current === key 
                ? 'bg-neutral-900 text-white shadow-md' 
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent'}
            `}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
