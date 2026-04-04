import React from 'react';
import { useRestaurantData } from '../context/RestaurantContext';

const ChefIntro = () => {
  const { chefInfo } = useRestaurantData();

  if (!chefInfo) return null;

  return (
    <section id="chef" className="py-24 md:py-40 bg-beige-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          
          {/* Portrait with decorative elements */}
          <div className="w-full md:w-1/2 relative reveal">
            <div className="aspect-[4/5] overflow-hidden relative z-10 max-w-md mx-auto md:mr-auto md:ml-0 bg-beige-200">
              <img 
                src={chefInfo.image} 
                alt={chefInfo.name} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-terracotta/10 mix-blend-multiply"></div>
            </div>
            
            {/* Decorative pull quote overlay */}
            <div className="absolute -bottom-8 -right-4 md:-right-12 z-20 bg-white p-8 shadow-xl max-w-xs reveal" style={{ transitionDelay: '300ms' }}>
              <span className="text-terracotta text-6xl font-serif absolute -top-4 left-4 opacity-40">"</span>
              <p className="font-serif text-forest-800 text-xl leading-snug relative z-10 italic">
                {chefInfo.quote}
              </p>
            </div>
            
            {/* Background offset block */}
            <div className="absolute -top-8 -left-8 w-2/3 h-2/3 bg-beige-200 -z-0"></div>
          </div>

          {/* Bio Text */}
          <div className="w-full md:w-1/2 mt-16 md:mt-0 reveal" style={{ transitionDelay: '200ms' }}>
            <p className="text-terracotta font-sans tracking-[0.2em] text-sm uppercase mb-4">
              Executive Chef
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-forest-900 mb-2">
              {chefInfo.name}
            </h2>
            
            <div className="w-16 h-[2px] bg-forest-200 my-8"></div>
            
            <div className="prose prose-lg prose-p:font-sans prose-p:text-forest-600 prose-p:leading-relaxed max-w-xl">
              <p className="mb-6">{chefInfo.bio_p1}</p>
              <p>{chefInfo.bio_p2}</p>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              {/* Signature representation */}
              <span className="font-serif italic text-3xl text-forest-800 opacity-80">{chefInfo.name}</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ChefIntro;