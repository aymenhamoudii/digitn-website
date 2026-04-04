import React from 'react';

const OurStory = () => {
  return (
    <section id="story" className="relative py-32 bg-forest text-beige overflow-hidden">
      {/* Decorative text watermark */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-0 opacity-[0.03] select-none pointer-events-none w-full overflow-hidden whitespace-nowrap">
        <span className="font-serif text-[30rem] leading-none block transform -translate-x-1/4">Origin</span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          {/* Text Content - Offset */}
          <div className="lg:w-5/12 reveal mt-12 lg:mt-32 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
              A return to the<br />
              <span className="text-terracotta italic font-light">essential.</span>
            </h2>
            
            <p className="font-sans text-forest-100 text-lg leading-relaxed mb-6">
              Lumina was born from a simple belief: that food tastes best when we interfere the least. Founded in an old restored barn surrounded by the very fields that feed us, we strip away the unnecessary to reveal the profound.
            </p>
            
            <p className="font-sans text-forest-200 text-base leading-relaxed mb-12">
              Every ingredient has a story, a season, and a source. We partner exclusively with local artisans, foragers, and regenerative farmers who share our obsession with uncompromising quality and environmental stewardship.
            </p>

            <a href="#chef" className="group inline-flex items-center gap-4 text-sm uppercase tracking-widest font-sans text-beige hover:text-terracotta transition-colors duration-300">
              Meet the Chef
              <span className="w-8 h-[1px] bg-beige group-hover:bg-terracotta group-hover:w-12 transition-all duration-300"></span>
            </a>
          </div>

          {/* Image Grid - Breaks full width */}
          <div className="lg:w-7/12 relative order-1 lg:order-2 w-full">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4 md:space-y-8 mt-12 md:mt-24 reveal" style={{ transitionDelay: '200ms' }}>
                <div className="aspect-[3/4] overflow-hidden bg-forest-800">
                  <img src="https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1000&auto=format&fit=crop" alt="Foraging in the woods" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-square overflow-hidden bg-forest-800">
                  <img src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=1000&auto=format&fit=crop" alt="Fresh harvest vegetables" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="space-y-4 md:space-y-8 reveal" style={{ transitionDelay: '400ms' }}>
                <div className="aspect-square overflow-hidden bg-forest-800">
                  <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1000&auto=format&fit=crop" alt="Kitchen preparation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-forest-800">
                  <img src="https://images.unsplash.com/photo-1559827402-230f2f3900c7?q=80&w=1000&auto=format&fit=crop" alt="Rustic dining table setup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default OurStory;