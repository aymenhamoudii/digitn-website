import React, { useState } from 'react';
import MenuItem from './MenuItem';

// Sample menu data - in a real app, this would come from an API
const menuData = {
  starters: [
    { id: 1, name: 'Truffle Arancini', description: 'Crispy risotto balls with black truffle, parmesan, and herb aioli', price: '14' },
    { id: 2, name: 'Seared Scallops', description: 'Pan-seared sea scallops with cauliflower purée, crispy prosciutto, and microgreens', price: '18' },
    { id: 3, name: 'Wild Mushroom Bruschetta', description: 'Toasted sourdough with mixed wild mushrooms, thyme, garlic, and aged balsamic', price: '12' },
  ],
  mains: [
    { id: 4, name: 'Herb-Crusted Rack of Lamb', description: 'Rosemary and thyme crust, served with roasted root vegetables and mint jus', price: '32' },
    { id: 5, name: 'Pan-Seared Sea Bass', description: 'Crispy skin sea bass with lemon beurre blanc, seasonal vegetables, and potato purée', price: '28' },
    { id: 6, name: 'Wild Mushroom Risotto', description: 'Carnaroli rice with porcini, shiitake, and oyster mushrooms, finished with truffle oil and parmesan', price: '24' },
  ],
  desserts: [
    { id: 7, name: 'Chocolate Fondant', description: 'Warm molten chocolate cake with vanilla bean ice cream and raspberry coulis', price: '12' },
    { id: 8, name: 'Lemon Tart', description: 'Buttery shortbread crust with tangy lemon curd, meringue, and fresh berries', price: '10' },
    { id: 9, name: 'Cheese Plate', description: 'Selection of artisanal cheeses with honey, nuts, and dried fruits', price: '16' },
  ],
};

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('starters');

  const categories = Object.keys(menuData);

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-display text-neutral-900 text-center mb-12">
          Our Menu
        </h2>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                ${activeCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuData[activeCategory].map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;