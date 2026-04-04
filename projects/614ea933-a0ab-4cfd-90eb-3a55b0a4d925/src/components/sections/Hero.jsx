import React from 'react';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80" 
          alt="Restaurant ambiance" 
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl animate-slide-up">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
            The Ultimate Dining Experience
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold leading-tight mb-6">
            Where Taste <br />
            <span className="text-primary">Meets Vibe.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-lg">
            Experience a symphony of flavors in an atmosphere designed for the bold. 
            Crafted cocktails, artisanal plates, and memories that last.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" className="group">
              Book a Table
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <a href="#menu">
              <Button variant="ghost">View Full Menu</Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
