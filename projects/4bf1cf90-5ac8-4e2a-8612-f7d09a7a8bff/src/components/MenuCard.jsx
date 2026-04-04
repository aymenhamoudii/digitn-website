import React from 'react';

function MenuCard({ item }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-neutral/10 hover:border-terracotta/30 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-white text-neutral-dark font-medium text-sm px-4 py-1.5 rounded-3xl shadow-sm">
          {item.price}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-1">
            {item.tags.map((tag, i) => (
              <span 
                key={i}
                className="text-[10px] leading-none font-medium bg-cream text-neutral px-2.5 py-2 rounded-3xl"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <h3 className="font-serif text-2xl leading-tight text-neutral-dark mb-3 group-hover:text-terracotta transition-colors">
          {item.name}
        </h3>
        <p className="text-neutral text-[15px] leading-relaxed flex-1">
          {item.description}
        </p>
        
        <div className="pt-6 mt-auto border-t border-neutral/10 text-xs uppercase font-medium flex items-center justify-between text-neutral">
          <span>Chef’s selection</span>
          <span className="text-terracotta">→</span>
        </div>
      </div>
    </div>
  );
}

export default MenuCard;
