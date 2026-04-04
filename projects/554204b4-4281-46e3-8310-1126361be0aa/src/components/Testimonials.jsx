import React, { useRef, useEffect, useState } from 'react';
import { useRestaurantData } from '../context/RestaurantContext';
import ReviewCard from './ReviewCard';

const Testimonials = () => {
  const { reviews } = useRestaurantData();
  const scrollContainerRef = useRef(null);
  const [showLeftGrad, setShowLeftGrad] = useState(false);
  const [showRightGrad, setShowRightGrad] = useState(true);

  if (!reviews || reviews.length === 0) return null;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftGrad(scrollLeft > 0);
      setShowRightGrad(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" className="py-32 bg-beige-50 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-beige -z-10 transform skew-x-12 translate-x-1/2"></div>

      <div className="container mx-auto px-6 lg:px-12 mb-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 reveal">
        <div className="max-w-xl">
          <p className="text-terracotta font-sans tracking-[0.2em] text-sm uppercase mb-4">
            Guest Experiences
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-forest-900 leading-tight">
            Words from our <span className="italic font-light text-forest-500">community.</span>
          </h2>
        </div>
        
        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-4">
          <button 
            onClick={() => scroll('left')}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${showLeftGrad ? 'border-forest text-forest hover:bg-forest hover:text-white' : 'border-forest-200 text-forest-200 cursor-not-allowed'}`}
            disabled={!showLeftGrad}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${showRightGrad ? 'border-forest text-forest hover:bg-forest hover:text-white' : 'border-forest-200 text-forest-200 cursor-not-allowed'}`}
            disabled={!showRightGrad}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="relative w-full reveal" style={{ transitionDelay: '200ms' }}>
        
        {/* Scroll Gradients */}
        <div className={`absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-beige-50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftGrad ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-beige-50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightGrad ? 'opacity-100' : 'opacity-0'}`}></div>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory px-6 lg:px-12 pb-12 pt-4 no-scrollbar scroll-smooth"
        >
          {reviews.map((review, idx) => (
            <ReviewCard key={review.id} review={review} index={idx} />
          ))}
          
          {/* Spacer for right edge */}
          <div className="min-w-[1px] md:min-w-[24px] snap-center shrink-0"></div>
        </div>
      </div>
      
    </section>
  );
};

export default Testimonials;