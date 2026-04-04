import React from 'react';

const MenuItem = ({ item }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Image placeholder */}
      <div className="relative h-48 w-full">
        <img 
          src={`/menu-${item.id}.jpg`} 
          alt={item.name} 
          className="object-cover w-full h-full"
        />
        {/* Price badge */}
        <span className="absolute top-3 right-3 bg-primary-500 text-white px-2 py-1 rounded text-sm font-medium">
          ${item.price}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-display text-neutral-900 mb-2">{item.name}</h3>
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-neutral-800 font-medium">Popular</span>
          <button 
            className="bg-accent-500 text-white px-3 py-1 rounded text-sm hover:bg-accent-600 transition-colors"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;