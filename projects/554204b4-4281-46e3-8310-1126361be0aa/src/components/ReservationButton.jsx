import React from 'react';

const ReservationButton = ({ className = '' }) => {
  return (
    <button className={`
      relative group overflow-hidden px-8 py-4 
      bg-terracotta text-white font-sans text-sm tracking-widest uppercase
      transition-all duration-300 ease-out
      hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 
      focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-beige
      ${className}
    `}>
      <span className="relative z-10 flex items-center gap-2">
        Reserve a Table
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </span>
      <div className="absolute inset-0 h-full w-full scale-0 rounded-full bg-white/20 transition-all duration-300 ease-out group-hover:scale-150 group-hover:rounded-none"></div>
    </button>
  );
};

export default ReservationButton;