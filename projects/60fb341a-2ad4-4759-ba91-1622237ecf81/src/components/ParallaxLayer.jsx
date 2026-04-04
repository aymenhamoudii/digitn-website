import React, { useEffect, useRef } from 'react';

const ParallaxLayer = ({ depth = 0.5, children, className = '' }) => {
  const layerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!layerRef.current) return;
      
      const scrolled = window.pageYOffset;
      const yPos = -(scrolled * depth);
      
      layerRef.current.style.transform = `translate3d(0, ${yPos}px, 0)`;
      layerRef.current.style.willChange = 'transform';
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial positioning
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [depth]);

  return (
    <div 
      ref={layerRef}
      className={`parallax-layer transition-transform duration-300 ease-out ${className}`}
      data-depth={depth}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxLayer;