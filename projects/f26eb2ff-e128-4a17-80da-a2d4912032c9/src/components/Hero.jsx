import React from 'react';

const Hero = () => {
  return (
    <section className="section-container pt-40 md:pt-64 pb-20 overflow-hidden">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        
        {/* Availability Badge */}
        <div className="lg:col-span-12 mb-8">
          <div className="inline-flex items-center gap-3 bg-white brutal-border px-4 py-2 font-bold text-xs tracking-widest shadow-brutal animate-bounce">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-moss opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-earth-moss"></span>
            </span>
            AVAILABLE FOR PROJECTS
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black leading-[0.8] mb-8">
            DESIGN <br />
            <span className="text-earth-clay italic">THAT WORKS</span> <br />
            HARD.
          </h1>
          
          <p className="font-mono text-lg md:text-xl max-w-xl border-l-4 border-earth-ink pl-6 py-2">
            Independent developer and designer crafting <span className="bg-earth-sand/30 font-bold px-1">robust digital experiences</span> with an earthy soul and a brutalist heart.
          </p>
        </div>

        {/* Technical Sub-header / Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-earth-moss p-6 text-white brutal-border shadow-brutal transform rotate-2">
            <h3 className="font-mono text-xs mb-2">CURRENT_LOCATION:</h3>
            <p className="font-serif text-2xl">Earth-1218 // Berlin</p>
          </div>
          
          <div className="bg-white p-6 brutal-border shadow-brutal transform -rotate-1">
            <h3 className="font-mono text-xs mb-2">EXPERIENCE_LOG:</h3>
            <p className="font-serif text-2xl">08+ Solar Cycles</p>
          </div>
          
          <div className="mt-8">
            <a href="#projects" className="brutal-btn text-xl w-full text-center inline-block">
              VIEW ARTEFACTS ↓
            </a>
          </div>
        </div>
      </div>

      {/* Decorative large background text */}
      <div className="absolute -bottom-10 -right-20 opacity-5 pointer-events-none select-none hidden lg:block">
        <span className="text-[25rem] font-serif font-black leading-none uppercase">Raw</span>
      </div>
    </section>
  );
};

export default Hero;
