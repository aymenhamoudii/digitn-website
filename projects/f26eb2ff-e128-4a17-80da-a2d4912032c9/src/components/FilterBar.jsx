import React from 'react';

const FilterBar = ({ categories, activeFilter, setActiveFilter }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveFilter(cat)}
          className={`px-4 py-2 font-mono text-xs font-bold tracking-widest brutal-border transition-all ${
            activeFilter === cat 
              ? 'bg-earth-clay text-white shadow-none translate-x-1 translate-y-1' 
              : 'bg-white text-earth-ink shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5'
          }`}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
