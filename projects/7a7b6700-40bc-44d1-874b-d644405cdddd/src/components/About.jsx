import React from 'react';
import { ChefHat, Grape, UtensilsCrossed } from './Icons';

const About = () => {
  const values = [
    {
      icon: ChefHat,
      title: "Artisanal Craft",
      description: "Every dish is a testament to traditional techniques met with modern flair."
    },
    {
      icon: Grape,
      title: "Vineyard Selection",
      description: "Curated pairings from local estates and renowned international cellars."
    },
    {
      icon: UtensilsCrossed,
      title: "Atmosphere",
      description: "A sophisticated yet intimate space designed for conversation and comfort."
    }
  ];

  return (
    <section id="about" className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">The Story</h2>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight">
              Where tradition meets <br />
              <span className="text-gold italic">modern refinement</span>
            </h3>
          </div>
          
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            Born from a passion for honest ingredients and culinary storytelling, L'Essence brings the warmth of a classic bistro into a contemporary setting. We believe that fine dining should feel accessible, and every meal should be a celebration of the senses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
            {values.map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-snug">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-gold/10 rounded-2xl blur-2xl transition-all group-hover:bg-gold/20" />
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=1200" 
              alt="Our Chef preparing a dish"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-8 left-8">
              <p className="text-champagne font-serif italic text-xl">"Flavor is the memory of the land."</p>
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mt-2">— Executive Chef</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
