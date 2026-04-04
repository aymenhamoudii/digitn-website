import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-10 bg-luxury-gradient"></div>

      {/* Background Image (placeholder for high-quality culinary image) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-100 hover:scale-110"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl px-6">
        <div className="mb-6 opacity-0 animate-[fadeIn_1.5s_ease-out_forwards]">
          <span className="text-gold tracking-[0.5em] text-xs uppercase font-medium">Est. 1994</span>
          <div className="h-[1px] w-12 bg-gold/40 mx-auto mt-4"></div>
        </div>

        <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 tracking-tight leading-tight opacity-0 animate-[slideUp_1.5s_ease-out_forwards_0.5s]">
          Elevated <span className="italic font-light text-white">Elegance</span><br />
          on Every Plate.
        </h1>

        <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed opacity-0 animate-[fadeIn_1.5s_ease-out_forwards_1s]">
          Journey through a world of refined flavors and meticulous craftsmanship in the heart of the city.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 opacity-0 animate-[fadeIn_1.5s_ease-out_forwards_1.5s]">
          <a href="#reservation" className="btn-primary group">
            Book a Table
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2">→</span>
          </a>
          <a href="#menu" className="btn-outline">
            Discover the Menu
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 opacity-0 animate-[bounce_2s_infinite_2s,fadeIn_1s_ease-out_forwards_2s]">
        <div className="w-[1px] h-16 bg-gradient-to-b from-gold/80 to-transparent"></div>
      </div>

      {/* Custom Keyframes for Hero Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;