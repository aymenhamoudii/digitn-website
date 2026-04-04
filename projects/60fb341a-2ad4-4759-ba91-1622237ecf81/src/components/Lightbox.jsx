import React, { useEffect, useCallback } from 'react';

const Lightbox = ({ image, onClose, onNext, onPrev, totalImages, currentIndex }) => {
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
        onNext();
        break;
      case 'ArrowLeft':
        onPrev();
        break;
      default:
        break;
    }
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
    >
      {/* Lightbox container */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-cinematic-black-light rounded-2xl overflow-hidden border border-cinematic-silver-primary/30 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-cinematic-silver-primary/30 flex items-center justify-center text-cinematic-white hover:bg-black/70 hover:border-cinematic-silver-primary/50 transition-all duration-300 group"
          aria-label="Close lightbox"
        >
          <svg 
            className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation buttons */}
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-cinematic-silver-primary/30 flex items-center justify-center text-cinematic-white hover:bg-black/70 hover:border-cinematic-silver-primary/50 transition-all duration-300 group"
          aria-label="Previous image"
        >
          <svg 
            className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-cinematic-silver-primary/30 flex items-center justify-center text-cinematic-white hover:bg-black/70 hover:border-cinematic-silver-primary/50 transition-all duration-300 group"
          aria-label="Next image"
        >
          <svg 
            className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Image display */}
        <div className="relative h-[70vh] flex items-center justify-center p-8">
          {/* Image placeholder */}
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-cinematic-black to-cinematic-silver-dark/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl opacity-80">{image.emoji}</div>
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-cinematic-black/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Image info */}
        <div className="p-6 border-t border-cinematic-silver-primary/20 bg-cinematic-black-light">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-2xl font-bold text-cinematic-white">{image.title}</h3>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-cinematic-silver-primary/10 text-cinematic-silver-primary border border-cinematic-silver-primary/30">
                  {image.categoryName}
                </span>
              </div>
              
              <p className="text-cinematic-silver-primary mb-4">{image.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-cinematic-silver-dark">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{image.date}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{image.time}</span>
                </div>
              </div>
            </div>

            {/* Image counter */}
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-cinematic-silver-accent">
                {currentIndex}
              </div>
              <div className="text-sm text-cinematic-silver-primary">
                of {totalImages}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-cinematic-silver-dark tracking-wider">
          Use ← → arrows to navigate • ESC to close
        </div>
      </div>
    </div>
  );
};

export default Lightbox;