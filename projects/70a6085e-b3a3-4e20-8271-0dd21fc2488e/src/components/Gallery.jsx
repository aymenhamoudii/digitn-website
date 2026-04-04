import React from 'react';

const Gallery = () => {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1550966842-2849a224ff88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Elegant dining room",
      span: "col-span-2 row-span-2",
      label: "The Main Hall"
    },
    {
      src: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      alt: "Gourmet dessert",
      span: "col-span-1 row-span-1",
      label: "Artisanal Pastries"
    },
    {
      src: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      alt: "Wine selection",
      span: "col-span-1 row-span-2",
      label: "Our Private Cellar"
    },
    {
      src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      alt: "Fine dining detail",
      span: "col-span-1 row-span-1",
      label: "The Intimate Corner"
    }
  ];

  return (
    <section id="gallery" className="section-padding bg-obsidian-light overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="text-gold tracking-[0.5em] text-xs uppercase font-semibold">Atmosphere</span>
            <h2 className="text-4xl md:text-5xl font-serif text-champagne leading-tight">Visual Journey</h2>
          </div>
          <p className="text-champagne-light/50 max-w-sm text-sm italic font-light">
            Every corner of LUMIÈRE is designed to evoke emotion, from the warm mahogany tones to the curated ambient lighting.
          </p>
        </div>

        {/* Masonry-Lite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-none md:grid-rows-3 gap-6 h-auto md:h-[900px]">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative group overflow-hidden ${img.span} border border-champagne/10`}
            >
              <img 
                src={img.src} 
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-90 grayscale-[10%]"
              />
              {/* Overlay Label */}
              <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                <span className="text-gold font-serif text-2xl md:text-3xl tracking-wide opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                  {img.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;