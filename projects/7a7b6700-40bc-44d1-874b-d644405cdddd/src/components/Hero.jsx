import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden !py-0 !px-0 !max-w-none">
      <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center bg-no-repeat scale-105 animate-fade-in" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal" />
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="mb-6 inline-block">
          <span className="text-gold tracking-[0.5em] uppercase text-sm mb-4 block animate-slide-up [animation-delay:0.2s] opacity-0">
            Est. 2012 Paris
          </span>
          <div className="h-[1px] w-24 bg-gold mx-auto animate-slide-up [animation-delay:0.3s] opacity-0" />
        </div>
        
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-champagne leading-tight mb-8 animate-slide-up [animation-delay:0.4s] opacity-0">
          Where <span className="italic font-normal">Soul</span> Meets <span className="text-gold">Savor</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-champagne/80 font-light mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:0.6s] opacity-0">
          A contemporary casual bistro experience dedicated to artisanal ingredients, 
          hand-selected wines, and the art of conversation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up [animation-delay:0.8s] opacity-0">
          <a href="#menu" className="btn-primary">
            Explore Menu
          </a>
          <a href="#about" className="btn-outline">
            Our Story
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold/60 rotate-90 mb-4">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
