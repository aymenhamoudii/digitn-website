import React, { useRef } from 'react';
import useParallax from '../hooks/useParallax';

const GalleryItem = ({ image, index, onClick }) => {
  const itemRef = useRef(null);
  const { handleTilt, resetTilt } = useParallax(0.1, { current: itemRef.current });
  const [hovered, setHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    handleTilt(e);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    resetTilt();
    setHovered(false);
  };

  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (image.aspect) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square': return 'aspect-square';
      default: return 'aspect-[4/3]';
    }
  };

  return (
    <div
      ref={itemRef}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
        hovered ? 'z-10 shadow-2xl' : 'shadow-lg'
      }`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {/* Image container */}
      <div className={`relative ${getAspectClass()}`}>
        {/* Image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-cinematic-black-light to-cinematic-silver-dark/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-80">{image.emoji}</div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinematic-black/80 via-transparent to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-cinematic-black/80 backdrop-blur-sm text-cinematic-silver-primary border border-cinematic-silver-primary/30">
              {image.categoryName}
            </span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-cinematic-black/90 via-cinematic-black/40 to-transparent transition-all duration-500 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Image info */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500 ${
            hovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <h3 className="text-xl font-bold text-cinematic-white mb-2">
              {image.title}
            </h3>
            <p className="text-cinematic-silver-primary text-sm mb-4">
              {image.description}
            </p>
            
            {/* View button */}
            <div className="flex items-center justify-between">
              <button className="text-cinematic-silver-accent text-sm font-medium flex items-center gap-2 group">
                <span>View Details</span>
                <svg 
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <div className="text-xs text-cinematic-silver-dark">
                {image.date}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Border glow effect */}
      <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-500 ${
        hovered 
          ? 'border-cinematic-silver-primary/50' 
          : 'border-cinematic-silver-primary/20'
      }`} />
      
      {/* Shadow layer */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
        hovered 
          ? 'bg-cinematic-silver-primary/10 -inset-4' 
          : 'bg-transparent'
      }`} />
    </div>
  );
};

export default GalleryItem;