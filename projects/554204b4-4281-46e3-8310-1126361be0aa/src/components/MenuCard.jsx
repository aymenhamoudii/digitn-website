import React from 'react';

const MenuCard = ({ item, index }) => {
  // Stagger odd/even cards
  const isEven = index % 2 === 0;
  
  return (
    <article className={`
      relative group bg-white shadow-sm overflow-hidden 
      transition-all duration-500 hover:shadow-xl hover:-translate-y-2
      ${isEven ? 'mt-0 md:mt-24' : 'mt-12 md:mt-0'}
    `}>
      {/* Aspect Ratio Container for Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-beige-200">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Ingredient Tags */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {item.ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="px-3 py-1 bg-terracotta text-white text-[10px] uppercase tracking-wider font-sans opacity-90 backdrop-blur-sm shadow-sm">
              {ing}
            </span>
          ))}
        </div>
        
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content Area */}
      <div className="p-8 bg-beige-50">
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="text-2xl font-serif text-forest-800 leading-tight">
            {item.name}
          </h3>
          <span className="text-terracotta font-sans text-lg font-medium ml-4 shrink-0">
            ${item.price}
          </span>
        </div>
        
        <p className="text-forest-400 font-sans text-sm leading-relaxed mb-6">
          {item.description}
        </p>

        {/* Decorative separator */}
        <div className="w-12 h-[1px] bg-forest-200"></div>
      </div>
    </article>
  );
};

export default MenuCard;