import React, { useState, useEffect } from 'react';
import DishCard from './DishCard';
import { getMenuItems, getCategories } from '../data/demoData';

const MenuPreview = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('signature');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const items = getMenuItems();
      const cats = getCategories();
      setMenuItems(items);
      setCategories(cats);
    };
    loadData();
  }, []);

  const filteredItems = menuItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="relative">
      {/* Section header with parallax */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-cinematic-white">
          <span className="text-gradient-silver">SIGNATURE</span> DISHES
        </h2>
        <p className="text-lg text-cinematic-silver-primary max-w-3xl mx-auto">
          Each creation is a masterpiece of flavor and presentation, crafted with precision 
          and served with silver refinement.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-full font-display font-semibold tracking-wider transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-cinematic-white text-cinematic-black'
                : 'bg-transparent border border-cinematic-silver-primary/30 text-cinematic-silver-primary hover:border-cinematic-silver-primary hover:text-cinematic-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Dish grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {filteredItems.slice(0, 6).map((dish, index) => (
          <DishCard
            key={dish.id}
            dish={dish}
            index={index}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        ))}
      </div>

      {/* View all button */}
      <div className="text-center mt-16">
        <button className="btn-secondary group relative overflow-hidden">
          <span className="relative z-10 flex items-center gap-3">
            View Complete Menu
            <svg 
              className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-cinematic-silver-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 border border-cinematic-silver-primary/10 rounded-full opacity-30" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 border border-cinematic-silver-primary/5 rounded-full opacity-20" />
    </div>
  );
};

export default MenuPreview;