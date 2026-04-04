import React, { useState } from 'react';
import { useRestaurantData } from '../context/RestaurantContext';
import GalleryItem from './GalleryItem';

const Gallery = () => {
  const { galleryImages } = useRestaurantData();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!galleryImages || galleryImages.length === 0) return null;

  // Split images into 3 columns for desktop masonry effect
  const col1 = galleryImages.filter((_, i) => i % 3 === 0);
  const col2 = galleryImages.filter((_, i) => i % 3 === 1);
  const col3 = galleryImages.filter((_, i) => i % 3 === 2);

  return (
    <section id="gallery" className="py-32 bg-beige overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20 reveal">
          <p className="text-terracotta font-sans tracking-[0.2em] text-sm uppercase mb-4">
            Atmosphere
          </p>
          <h2 className="text-5xl md:text-6xl font-serif text-forest-900">
            A sense of <span className="italic font-light text-forest-500">place.</span>
          </h2>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 sm:gap-8 reveal" style={{ transitionDelay: '100ms' }}>
            {col1.map((img) => (
              <GalleryItem key={img.id} image={img} onClick={setSelectedImage} />
            ))}
          </div>
          
          {/* Column 2 - Offset slightly down */}
          <div className="flex flex-col gap-4 sm:gap-8 mt-0 sm:mt-16 reveal" style={{ transitionDelay: '200ms' }}>
            {col2.map((img) => (
              <GalleryItem key={img.id} image={img} onClick={setSelectedImage} />
            ))}
          </div>
          
          {/* Column 3 - Offset more down on desktop */}
          <div className="flex flex-col gap-4 sm:gap-8 mt-0 lg:mt-32 reveal" style={{ transitionDelay: '300ms' }}>
            {col3.map((img) => (
              <GalleryItem key={img.id} image={img} onClick={setSelectedImage} />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 bg-forest-900/95 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button 
            className="absolute top-6 right-6 text-beige hover:text-terracotta transition-colors z-50"
            onClick={() => setSelectedImage(null)}
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center animate-[fadeInUp_0.4s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt={selectedImage.caption} 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl"
            />
            <p className="text-beige font-serif italic text-xl mt-6 text-center">
              {selectedImage.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;