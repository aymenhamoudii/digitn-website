import React, { useState, useEffect } from 'react';
import GalleryItem from './GalleryItem';
import Lightbox from './Lightbox';
import { getGalleryImages } from '../data/demoData';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      const galleryImages = getGalleryImages();
      setImages(galleryImages);
    };
    loadData();
  }, []);

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'dining', name: 'Dining Room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'dishes', name: 'Signature Dishes' },
    { id: 'chef', name: 'Chef at Work' },
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  return (
    <div className="relative">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-cinematic-white">
          The <span className="text-gradient-silver">Éclat</span> Experience
        </h2>
        <p className="text-lg text-cinematic-silver-primary max-w-3xl mx-auto">
          Step into our world of culinary artistry, where every detail is crafted 
          to create an unforgettable dining atmosphere.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
              filter === category.id
                ? 'bg-cinematic-white text-cinematic-black shadow-lg'
                : 'bg-transparent border border-cinematic-silver-primary/30 text-cinematic-silver-primary hover:border-cinematic-silver-primary hover:text-cinematic-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredImages.map((image, index) => (
          <GalleryItem
            key={image.id}
            image={image}
            index={index}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>

      {/* Gallery stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Gallery Images', value: images.length },
          { label: 'Featured Dishes', value: images.filter(img => img.category === 'dishes').length },
          { label: 'Chef Moments', value: images.filter(img => img.category === 'chef').length },
          { label: 'Ambiance Shots', value: images.filter(img => img.category === 'dining').length },
        ].map((stat, index) => (
          <div
            key={index}
            className="glass-silver rounded-xl p-6 text-center border border-cinematic-silver-primary/20"
          >
            <div className="text-3xl md:text-4xl font-bold text-cinematic-silver-accent mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-cinematic-silver-primary uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={handleCloseLightbox}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          totalImages={images.length}
          currentIndex={images.findIndex(img => img.id === selectedImage.id) + 1}
        />
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 -left-20 w-64 h-64 border border-cinematic-silver-primary/10 rounded-full opacity-20" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 border border-cinematic-silver-primary/5 rounded-full opacity-20" />
      
      {/* Grid overlay effect */}
      <div className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(rgba(192,192,192,0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(192,192,192,0.02) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

export default Gallery;