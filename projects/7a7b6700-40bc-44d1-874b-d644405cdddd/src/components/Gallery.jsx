import React from 'react';

const Gallery = () => {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
      alt: "Restaurant Interior",
      className: "col-span-2 row-span-2"
    },
    {
      src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200",
      alt: "Signature Dish",
      className: "col-span-1 row-span-1"
    },
    {
      src: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1200",
      alt: "Chef Plating",
      className: "col-span-1 row-span-1"
    },
    {
      src: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200",
      alt: "Wine Cellar",
      className: "col-span-1 row-span-2"
    },
    {
      src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
      alt: "Gourmet Salad",
      className: "col-span-1 row-span-1"
    }
  ];

  return (
    <section id="gallery" className="bg-charcoal py-20">
      <div className="text-center mb-16">
        <span className="text-gold uppercase tracking-[0.4em] text-xs mb-4 block">Visual Experience</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-6">Our Atmosphere</h2>
        <div className="h-1 w-20 bg-gold mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[250px] lg:auto-rows-[300px]">
        {images.map((img, index) => (
          <div 
            key={index} 
            className={`group relative overflow-hidden rounded-sm gold-border ${img.className}`}
          >
            <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/0 transition-all duration-700 z-10" />
            <img 
              src={img.src} 
              alt={img.alt} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
              <div className="p-4 border border-gold/40 bg-charcoal/60 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-widest text-gold font-bold">
                  {img.alt}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
