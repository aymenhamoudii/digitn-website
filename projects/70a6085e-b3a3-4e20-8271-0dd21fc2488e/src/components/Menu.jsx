import React, { useState } from 'react';
import { menuCategories, menuItems } from '../data/menuData';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]);
  const [animationClass, setAnimationClass] = useState('opacity-100');

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  const handleCategoryChange = (category) => {
    setAnimationClass('opacity-0 translate-y-4');
    setTimeout(() => {
      setActiveCategory(category);
      setAnimationClass('opacity-100 translate-y-0');
    }, 300);
  };

  return (
    <section id="menu" className="section-padding bg-obsidian text-champagne relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-gold tracking-[0.5em] text-xs uppercase font-semibold">Seasonal Palette</span>
          <h2 className="text-4xl md:text-6xl font-serif">The Gastronomic Menu</h2>
          <div className="h-[1px] w-24 bg-gold/30 mx-auto mt-6"></div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-20 border-b border-champagne/10 pb-6">
          {menuCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`text-sm tracking-[0.2em] uppercase transition-all duration-300 relative py-2 ${
                activeCategory === category 
                  ? 'text-gold font-bold scale-110' 
                  : 'text-champagne-light/40 hover:text-champagne-light'
              }`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 transition-all duration-500 ease-in-out ${animationClass}`}>
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col space-y-3 p-6 border border-transparent hover:border-gold/20 hover:bg-obsidian-light/40 transition-all duration-300 rounded-lg"
            >
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl md:text-2xl font-serif text-champagne group-hover:text-gold transition-colors">
                  {item.name}
                </h3>
                <span className="text-gold font-serif text-lg">${item.price}</span>
              </div>
              
              <p className="text-champagne-light/50 text-sm leading-relaxed font-light">
                {item.description}
              </p>

              {item.tags.length > 0 && (
                <div className="flex gap-3 pt-2">
                  {item.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-champagne/20 text-champagne/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dietary Note */}
        <div className="mt-24 text-center">
          <p className="text-champagne-light/30 text-xs italic">
            * Please inform your server of any food allergies or dietary restrictions.<br />
            Our menu changes periodically to reflect the finest seasonal produce.
          </p>
          <div className="mt-8">
            <a href="#" className="btn-outline text-xs uppercase px-12">
              Full Wine List (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;