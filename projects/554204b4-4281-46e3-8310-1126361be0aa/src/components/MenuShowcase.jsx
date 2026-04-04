import React from 'react';
import { useRestaurantData } from '../context/RestaurantContext';
import MenuCard from './MenuCard';
import { useParallax } from '../hooks/useParallax';

const MenuShowcase = () => {
  const { menuItems } = useRestaurantData();
  const parallaxOffset = useParallax(0.15);

  return (
    <section id="menu" className="relative py-32 bg-beige overflow-hidden">
      {/* Decorative background element */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full bg-beige-100 -z-10"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      />

      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <div className="max-w-2xl mb-24 reveal">
          <p className="text-terracotta font-sans tracking-[0.2em] text-sm uppercase mb-4">
            Our Offerings
          </p>
          <h2 className="text-5xl md:text-6xl font-serif text-forest-900 leading-tight mb-8">
            Seasonal<br />
            <span className="italic font-light text-forest-500">Provisions.</span>
          </h2>
          <p className="text-forest-500 font-sans text-lg leading-relaxed">
            Sourced daily from local purveyors. Our menu evolves with the rhythm of the seasons, celebrating the inherent flavor profiles of organic, responsibly grown produce.
          </p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {menuItems.map((item, index) => (
            <div key={item.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
              <MenuCard item={item} index={index} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-32 text-center reveal">
          <p className="text-forest-400 font-serif italic text-2xl mb-8">
            "A dialogue between earth and plate."
          </p>
          <a href="#" className="inline-block border-b-2 border-terracotta text-forest-900 font-sans tracking-widest uppercase text-sm pb-1 hover:text-terracotta transition-colors duration-300">
            View Full Menu
          </a>
        </div>
      </div>
    </section>
  );
};

export default MenuShowcase;