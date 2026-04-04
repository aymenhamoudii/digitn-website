import React, { useState, useEffect, useRef } from 'react';
import useParallax from '../hooks/useParallax';

const DishCard = ({ dish, index, isFlipped, onFlip }) => {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const { handleTilt, resetTilt } = useParallax(0.2, { current: cardRef.current });

  useEffect(() => {
    setFlipped(isFlipped);
  }, [isFlipped]);

  const handleMouseMove = (e) => {
    if (!flipped) {
      handleTilt(e);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    if (onFlip) onFlip();
  };

  return (
    <div 
      ref={cardRef}
      className={`relative w-full h-96 perspective-1000 cursor-pointer transition-all duration-500 ${
        hovered ? 'z-10' : ''
      }`}
      onClick={handleFlip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resetTilt();
      }}
      onMouseMove={handleMouseMove}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Card container */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-700 ${flipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
          <div className="relative h-full glass-silver border border-cinematic-silver-primary/20 p-6">
            {/* Dish image placeholder */}
            <div className="h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-cinematic-black-light to-cinematic-silver-dark/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">{dish.emoji}</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cinematic-black/80 to-transparent" />
            </div>
            
            {/* Dish info */}
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-cinematic-white">{dish.name}</h3>
                <span className="text-cinematic-silver-accent font-display font-bold text-lg">
                  ${dish.price}
                </span>
              </div>
              <p className="text-cinematic-silver-primary text-sm mb-4 line-clamp-2">
                {dish.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dish.tags.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-cinematic-silver-primary/10 text-cinematic-silver-primary border border-cinematic-silver-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Flip indicator */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-cinematic-silver-dark text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Tap for details</span>
            </div>
            
            {/* Hover effect */}
            <div className={`absolute inset-0 bg-gradient-to-t from-cinematic-silver-primary/5 to-transparent opacity-0 transition-opacity duration-300 ${
              hovered ? 'opacity-100' : ''
            }`} />
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          <div className="relative h-full glass-silver border border-cinematic-silver-primary/20 p-6">
            {/* Ingredients header */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-cinematic-white mb-2">Ingredients</h4>
              <div className="h-1 w-12 bg-gradient-to-r from-cinematic-silver-primary to-transparent" />
            </div>
            
            {/* Ingredients list */}
            <ul className="space-y-2 mb-6">
              {dish.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-center gap-3 text-cinematic-silver-primary">
                  <svg className="w-4 h-4 text-cinematic-silver-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
            
            {/* Preparation info */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-cinematic-white mb-2">Preparation</h4>
              <p className="text-sm text-cinematic-silver-primary">{dish.prepTime}</p>
            </div>
            
            {/* Chef's note */}
            <div className="p-4 bg-cinematic-black-light/50 rounded-lg border border-cinematic-silver-primary/10">
              <p className="text-sm italic text-cinematic-silver-primary">
                "{dish.chefNote}"
              </p>
            </div>
            
            {/* Flip back indicator */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-cinematic-silver-dark text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Tap to return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card shadow */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
        hovered ? 'bg-cinematic-silver-primary/20 -translate-y-2' : 'bg-cinematic-silver-primary/5'
      }`} />
    </div>
  );
};

export default DishCard;