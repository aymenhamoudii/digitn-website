import React from 'react';

const GalleryItem = ({ image, onClick }) => {
  return (
    <div 
      className="group relative cursor-pointer overflow-hidden bg-beige-200 mb-4 sm:mb-8 w-full"
      onClick={() => onClick(image)}
    >
      <img 
        src={image.url} 
        alt={image.caption} 
        className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-beige font-sans tracking-widest uppercase text-xs border border-beige/30 px-4 py-2 bg-forest/20 backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          View
        </span>
      </div>
      
      {/* Caption snippet */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-forest-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-beige font-serif italic text-sm">{image.caption}</p>
      </div>
    </div>
  );
};

export default GalleryItem;