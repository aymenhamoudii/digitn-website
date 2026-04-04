import React, { useState } from 'react';
import { Sparkles, ArrowUpRight } from './Icons';
import { menuItems } from '../data/menuItems';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="relative space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">The Menu</h2>
          <h3 className="text-4xl md:text-5xl font-serif">A Seasonal <br /><span className="text-gold italic">Curation</span></h3>
          <p className="text-gray-400 max-w-md">Our menu evolves with the seasons, focusing on locally sourced ingredients and classic techniques.</p>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-semibold tracking-widest uppercase transition-all relative
                ${activeCategory === category ? 'text-gold' : 'text-gray-500 hover:text-champagne'}`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-slide-up" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredItems.map((item, index) => (
          <div 
            key={index} 
            className="group relative flex flex-col p-6 rounded-2xl border border-white/5 bg-charcoal-light/50 hover:bg-charcoal-light transition-all duration-500"
          >
            <div className="absolute top-4 right-4 text-gold/20 group-hover:text-gold transition-colors">
              {item.isSpecial && <Sparkles size={20} />}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-xl font-serif font-bold group-hover:text-gold transition-colors pr-8">
                  {item.name}
                </h4>
                <span className="text-gold font-bold text-lg">{item.price}</span>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.description}
              </p>

              <div className="pt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {item.category}
                </span>
                <button className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
                  Details <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-12">
        <button className="relative px-12 py-5 bg-gold text-charcoal font-bold uppercase tracking-[0.2em] text-sm group overflow-hidden">
          <span className="relative z-10">Download Full PDF Menu</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </div>
    </section>
  );
};

export default Menu;
