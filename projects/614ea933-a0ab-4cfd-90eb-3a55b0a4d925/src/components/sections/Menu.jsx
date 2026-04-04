import React, { useState } from 'react';
import Button from '../ui/Button';
import { useCart } from '../../hooks/useCart';

const menuData = {
  Starters: [
    { id: 1, name: 'Crispy Calamari', price: 16, desc: 'Tossed in sea salt and cracked pepper with chili aioli.' },
    { id: 2, name: 'Truffle Fries', price: 12, desc: 'Hand-cut fries, parmesan, white truffle oil, rosemary.' },
    { id: 3, name: 'Burrata Roast', price: 18, desc: 'Heirloom tomatoes, balsamic glaze, toasted sourdough.' },
  ],
  Mains: [
    { id: 4, name: 'Ribeye Steak', price: 42, desc: '12oz prime cut, garlic butter, asparagus, mash.' },
    { id: 5, name: 'Pan-Seared Salmon', price: 34, desc: 'Quinoa pilaf, lemon caper sauce, seasonal greens.' },
    { id: 6, name: 'Mushroom Risotto', price: 28, desc: 'Wild mushrooms, carnaroli rice, pecorino.' },
  ],
  Desserts: [
    { id: 7, name: 'Lava Cake', price: 14, desc: 'Dark chocolate, vanilla bean gelato, berry coulis.' },
    { id: 8, name: 'Lemon Tart', price: 12, desc: 'Zesty lemon curd, shortbread crust, burnt meringue.' },
  ]
};

const Menu = () => {
  const [activeTab, setActiveTab] = useState('Mains');
  const { addToCart, cart, total } = useCart();

  return (
    <section id="menu" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Culinary Selection</h2>
          <h3 className="text-4xl md:text-6xl font-display font-bold">The Vibe Menu</h3>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap">
          {Object.keys(menuData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 border-2 ${
                activeTab === tab ? 'bg-primary border-primary text-white' : 'border-white/10 text-text-secondary hover:border-white/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuData[activeTab].map((item) => (
            <div key={item.id} className="bg-surface p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                <span className="text-primary font-bold text-lg">${item.price}</span>
              </div>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">{item.desc}</p>
              <Button 
                variant="ghost" 
                className="w-full text-xs py-2"
                onClick={() => addToCart(item)}
              >
                Add to Order
              </Button>
            </div>
          ))}
        </div>

        {/* Floating Cart (Simple version) */}
        {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
            <div className="bg-primary text-white p-6 rounded-2xl shadow-2xl flex items-center gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Your Order</p>
                <p className="text-xl font-bold">{cart.length} items — ${total}</p>
              </div>
              <Button variant="accent" className="px-6 py-2 shadow-xl">Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
