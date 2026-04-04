import React, { useState, useEffect } from 'react';

const reviews = [
  {
    quote: "A culinary experience that transcends the ordinary. The attention to detail in every dish is simply unparalleled. Truly the pinnacle of fine dining.",
    author: "Eleanor Sterling",
    role: "Gastronomy Enthusiast",
    rating: 5
  },
  {
    quote: "LUMIÈRE is not just a restaurant; it's a sensory journey. The fusion of flavors and the impeccable service left us completely enchanted.",
    author: "Dr. Marcus Vance",
    role: "Culinary Critic",
    rating: 5
  },
  {
    quote: "From the moment we walked in, we were treated like royalty. Each course was a masterpiece of both presentation and taste.",
    author: "Sofia Loren",
    role: "Architectural Designer",
    rating: 5
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-obsidian relative overflow-hidden">
      {/* Decorative quotes icon background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.03] text-[300px] lg:text-[600px] font-serif leading-none pointer-events-none text-champagne">
        &ldquo;
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <span className="text-gold tracking-[0.5em] text-xs uppercase font-semibold block mb-12">The Guest Experience</span>
        
        <div className="relative min-h-[300px] flex items-center justify-center">
          {reviews.map((review, idx) => (
            <div 
              key={idx}
              className={`absolute top-0 left-0 w-full transition-all duration-1000 flex flex-col items-center ${
                idx === activeIndex 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex space-x-1 mb-8">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </div>

              <blockquote className="text-2xl md:text-3xl font-serif text-champagne-light italic leading-relaxed mb-10 max-w-2xl">
                &ldquo;{review.quote}&rdquo;
              </blockquote>

              <div className="space-y-1">
                <cite className="text-lg font-bold text-champagne not-italic block">{review.author}</cite>
                <span className="text-xs uppercase tracking-[0.2em] text-gold/60">{review.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-4 mt-16">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1 transition-all duration-500 rounded-full ${
                idx === activeIndex ? 'w-12 bg-gold' : 'w-4 bg-champagne/20'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;