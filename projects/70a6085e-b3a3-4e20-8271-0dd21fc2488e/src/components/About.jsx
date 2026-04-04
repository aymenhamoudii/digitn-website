import React from 'react';

const About = () => {
  return (
    <section id="about" className="section-padding bg-obsidian-light relative overflow-hidden">
      {/* Background Motif */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-bordeaux/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        
        {/* Visual Composition (Asymmetric Layout) */}
        <div className="lg:w-1/2 relative flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] border border-champagne/10 p-4">
             <img 
               src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Chef plating dish"
               className="w-full h-full object-cover filter brightness-90 grayscale-[20%]"
             />
             
             {/* Overlapping small image */}
             <div className="absolute -bottom-12 -right-12 w-1/2 aspect-square border-4 border-obsidian shadow-2xl overflow-hidden hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Interior ambiance"
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
          
          {/* Decorative years label */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 rotate-90 hidden lg:block">
            <span className="text-[100px] font-bold text-white/5 leading-none select-none tracking-tighter uppercase">SINCE 1994</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <span className="text-gold tracking-[0.3em] text-xs uppercase font-semibold">Our Heritage</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              A Symphony of <br />
              <span className="italic text-white">Tradition & Innovation</span>
            </h2>
          </div>

          <div className="space-y-6 text-white/70 font-light text-lg leading-relaxed">
            <p>
              Founded on the belief that dining is an art form, LUMIÈRE began as a small boutique kitchen and has since evolved into a sanctuary for culinary exploration.
            </p>
            <p>
              Led by Executive Chef Julian Vance, our team meticulously sources the finest seasonal ingredients from sustainable local purveyors, transforming them into evocative dishes that bridge the gap between classical technique and avant-garde presentation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-8">
            <div className="space-y-2">
              <span className="text-3xl font-serif text-gold block">12</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Michelin Recognitions</span>
            </div>
            <div className="space-y-2">
              <span className="text-3xl font-serif text-gold block">28+</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Years of Excellence</span>
            </div>
          </div>

          <div className="pt-6">
            <a href="#story" className="inline-flex items-center text-sm font-bold tracking-[0.2em] uppercase text-gold hover:text-white transition-colors group">
              Read Our Full Story
              <span className="ml-3 h-[1px] w-8 bg-gold group-hover:w-12 transition-all"></span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;