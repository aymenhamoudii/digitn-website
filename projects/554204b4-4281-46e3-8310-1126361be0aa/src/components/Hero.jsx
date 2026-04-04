import React, { useRef } from 'react';
import { useThreeScene } from '../hooks/useThreeScene';
import ReservationButton from './ReservationButton';

const Hero = () => {
  const containerRef = useRef(null);
  useThreeScene(containerRef);

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-forest flex items-center justify-center">
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full z-0 opacity-70"
        aria-hidden="true"
      />
      
      {/* Overlay Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        <p className="text-terracotta font-sans tracking-[0.2em] text-sm md:text-base uppercase mb-6 animate-[fadeIn_1s_ease-out_0.5s_both]">
          Est. 2024 • Wildly Sourced
        </p>
        
        <h1 className="text-beige font-serif text-5xl md:text-7xl lg:text-9xl leading-tight mb-8">
          <span className="block animate-[fadeInUp_1s_ease-out_0.2s_both]">Rooted in</span>
          <span className="block italic font-light animate-[fadeInUp_1s_ease-out_0.4s_both]">Nature.</span>
        </h1>
        
        <p className="text-forest-100 font-sans max-w-md text-lg md:text-xl mb-12 animate-[fadeIn_1s_ease-out_0.8s_both]">
          An elemental dining experience celebrating the raw beauty of earth's seasonal harvest.
        </p>
        
        <div className="animate-[fadeInUp_1s_ease-out_1s_both]">
          <ReservationButton />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-[fadeIn_1s_ease-out_1.5s_both]">
        <span className="text-forest-200 text-xs font-sans tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-forest-200 to-transparent"></div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Hero;