import React from 'react';

const LocationMap = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-obsidian-light group grayscale-[80%] hover:grayscale-0 transition-all duration-700">
      {/* Visual Overlay to create a stylized map look */}
      <div className="absolute inset-0 bg-bordeaux/10 mix-blend-multiply z-10 pointer-events-none"></div>
      
      {/* Stylized background SVG to represent a map */}
      <div className="absolute inset-0 z-0">
        <svg 
          className="w-full h-full opacity-20 stroke-gold/40" 
          viewBox="0 0 1000 1000" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,200 L1000,200 M0,500 L1000,500 M0,800 L1000,800" strokeWidth="2" fill="none" />
          <path d="M300,0 L300,1000 M600,0 L600,1000 M900,0 L900,1000" strokeWidth="2" fill="none" />
          <circle cx="450" cy="450" r="100" strokeWidth="1" fill="none" strokeDasharray="10 5" />
          <circle cx="450" cy="450" r="200" strokeWidth="1" fill="none" strokeDasharray="10 5" />
        </svg>
      </div>

      {/* Actual Map Content Placeholder - Using image for high fidelity */}
      <img 
        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
        alt="Map location"
        className="w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
      />

      {/* Central Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="w-12 h-12 bg-bordeaux border-4 border-gold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse">
           <span className="text-gold font-serif text-xl">L</span>
        </div>
        <div className="h-6 w-0.5 bg-gradient-to-b from-gold to-transparent"></div>
        
        <div className="bg-obsidian/90 backdrop-blur-sm border border-gold/20 p-3 mt-2 rounded shadow-2xl scale-100 group-hover:scale-110 transition-transform">
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-gold">LUMIÈRE GASTRONOMIE</p>
          <p className="text-[9px] tracking-widest text-champagne/60 mt-1">1245 Culinary Ave, SF</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-30">
        <a 
          href="https://maps.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary py-2 px-4 text-xs font-bold uppercase flex items-center gap-3"
        >
          Open in Maps
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default LocationMap;