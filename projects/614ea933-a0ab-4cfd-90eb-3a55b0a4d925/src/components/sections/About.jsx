import React from 'react';

const About = () => {
  return (
    <section id="about" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80" 
              alt="Chef plating food" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary rounded-2xl -z-10 hidden md:block"></div>
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-background p-8 rounded-xl shadow-xl hidden md:block">
            <p className="text-4xl font-display font-bold text-primary">15+</p>
            <p className="text-sm text-text-secondary">Years of Culinary <br /> Excellence</p>
          </div>
        </div>

        <div>
          <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Our Story</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">Crafting Bold Flavors Since 2008</h3>
          <p className="text-text-secondary text-lg mb-6 leading-relaxed">
            VIBE EATS started with a simple idea: that food should be an event. Our founder, Chef Antonio, spent years traveling the world, collecting spices and techniques to create a menu that defies categorization.
          </p>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            From our hand-picked ingredients to our curated music playlists, every detail is designed to transport you. We don't just serve meals; we serve experiences.
          </p>
          
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <h4 className="font-bold text-xl mb-2">Locally Sourced</h4>
              <p className="text-sm text-text-secondary">We partner with local farmers to ensure peak freshness daily.</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2">Award Winning</h4>
              <p className="text-sm text-text-secondary">Recognized as the City's Most Innovative Kitchen 2023.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
