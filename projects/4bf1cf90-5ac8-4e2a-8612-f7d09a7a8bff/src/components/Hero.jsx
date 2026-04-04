import React from 'react';

function Hero() {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://picsum.photos/id/292/2000/1200')"
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/30 via-neutral-dark/50 to-neutral-dark/80" />

      {/* Accent Radial */}
      <div className="absolute inset-0 bg-[radial-gradient(at_bottom_right,#c2410f25_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Status badge */}
        <div className="inline-flex items-center gap-x-3 bg-white/10 backdrop-blur-xl text-cream text-sm font-medium px-8 py-3 rounded-3xl border border-white/20 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta"></span>
          </span>
          OPEN TONIGHT • 5PM–10PM
        </div>

        {/* Headline */}
        <h1 className="text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] leading-none font-serif tracking-[-2px] text-cream mb-4">
          Bella Vista
        </h1>

        <p className="max-w-lg mx-auto text-cream/90 text-2xl md:text-3xl font-light tracking-tight mb-16">
          Mediterranean soul.<br />Modern craft.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-12 py-6 bg-terracotta hover:bg-neutral-dark text-cream font-medium text-xl rounded-3xl transition-all duration-300 flex items-center gap-x-4"
          >
            Explore the Menu
            <span className="text-3xl transition-transform group-active:rotate-45">→</span>
          </button>

          <button
            onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-6 border-2 border-cream text-cream font-medium text-xl rounded-3xl hover:bg-cream hover:text-neutral-dark transition-all duration-300"
          >
            Reserve a Table
          </button>
        </div>

        {/* Trust signals */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-x-8 text-cream/70 text-xs uppercase tracking-[1px] font-medium">
          <div className="flex items-center gap-x-1.5">
            <span>★</span>
            <span>James Beard Award</span>
          </div>
          <div>Chef Maria Rossi</div>
          <div>Est. 2018 • Florence, Italy</div>
        </div>
      </div>

      {/* Scroll prompt */}
      <div className="absolute bottom-10 left-1/2 flex flex-col items-center text-cream/60 text-xs tracking-widest">
        <div className="animate-bounce text-2xl mb-1">↓</div>
        DISCOVER MORE
      </div>
    </section>
  );
}

export default Hero;
