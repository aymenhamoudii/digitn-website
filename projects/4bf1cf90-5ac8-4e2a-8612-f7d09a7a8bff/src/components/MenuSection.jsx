import React, { useState } from 'react';
import MenuCard from './MenuCard.jsx';

function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const menuItems = [
    {
      id: 1,
      category: 'appetizers',
      name: 'Burrata e Prosciutto',
      description: 'Creamy burrata, aged prosciutto di Parma, arugula, and 12-year balsamic.',
      price: '$18',
      image: 'https://picsum.photos/id/201/600/450',
      tags: ['gluten-free']
    },
    {
      id: 2,
      category: 'appetizers',
      name: 'Calamari Fritti',
      description: 'Crispy squid rings, lemon zest, marinara sauce, fresh parsley.',
      price: '$16',
      image: 'https://picsum.photos/id/292/600/450',
      tags: []
    },
    {
      id: 3,
      category: 'appetizers',
      name: 'Bruschetta Classica',
      description: 'Grilled sourdough, heirloom tomatoes, garlic, fresh basil, olive oil.',
      price: '$14',
      image: 'https://picsum.photos/id/312/600/450',
      tags: ['vegan']
    },
    {
      id: 4,
      category: 'mains',
      name: 'Branzino al Forno',
      description: 'Whole Mediterranean sea bass, roasted with lemon, herbs, capers and olives.',
      price: '$42',
      image: 'https://picsum.photos/id/1015/600/450',
      tags: ['gluten-free']
    },
    {
      id: 5,
      category: 'mains',
      name: 'Tagliatelle Bolognese',
      description: 'Fresh egg pasta, slow-cooked beef and pork ragù, aged Parmigiano.',
      price: '$28',
      image: 'https://picsum.photos/id/133/600/450',
      tags: []
    },
    {
      id: 6,
      category: 'mains',
      name: 'Osso Buco Milanese',
      description: 'Braised veal shank, saffron risotto, gremolata, red wine reduction.',
      price: '$48',
      image: 'https://picsum.photos/id/201/600/450',
      tags: []
    },
    {
      id: 7,
      category: 'desserts',
      name: 'Tiramisù Classico',
      description: 'Ladyfingers soaked in espresso, mascarpone, cocoa, and coffee liqueur.',
      price: '$14',
      image: 'https://picsum.photos/id/312/600/450',
      tags: []
    },
    {
      id: 8,
      category: 'desserts',
      name: 'Panna Cotta al Limone',
      description: 'Silky vanilla panna cotta, lemon curd, candied zest, fresh berries.',
      price: '$13',
      image: 'https://picsum.photos/id/1016/600/450',
      tags: ['gluten-free']
    },
    {
      id: 9,
      category: 'drinks',
      name: 'Negroni Sbagliato',
      description: 'Campari, sweet vermouth, prosecco, orange twist.',
      price: '$17',
      image: 'https://picsum.photos/id/133/600/450',
      tags: []
    },
    {
      id: 10,
      category: 'drinks',
      name: 'Aperol Spritz',
      description: 'Aperol, prosecco, soda, orange slice.',
      price: '$15',
      image: 'https://picsum.photos/id/201/600/450',
      tags: []
    }
  ];

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'appetizers', label: 'Appetizers' },
    { key: 'mains', label: 'Mains' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'drinks', label: 'Drinks & Wine' }
  ];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <span className="uppercase text-terracotta text-sm font-medium tracking-[1px]">Fresh daily</span>
          <h2 className="section-header font-serif text-5xl md:text-6xl text-neutral-dark mt-2 mb-4">
            Our Menu
          </h2>
          <p className="text-neutral text-lg max-w-md mx-auto">
            Seasonal ingredients, time-honored recipes, and a touch of modern elegance.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-7 py-3 text-sm font-medium rounded-3xl transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-terracotta text-cream shadow-inner'
                  : 'bg-white text-neutral-dark hover:bg-neutral/5 border border-neutral/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-x-3 text-terracotta hover:text-neutral-dark font-medium text-sm uppercase tracking-widest group"
          >
            View full menu in restaurant
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default MenuSection;
