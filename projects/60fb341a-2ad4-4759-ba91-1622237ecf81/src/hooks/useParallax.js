import { useEffect, useRef } from 'react';

const useParallax = (depth = 0.5, elementRef = null) => {
  const ref = useRef(elementRef?.current || null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const yPos = -(scrolled * depth);
      
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      element.style.willChange = 'transform';
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial positioning
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [depth]);

  const handleMouseMove = (e) => {
    const element = ref.current;
    if (!element) return;

    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 30;
    const yPos = (clientY / window.innerHeight - 0.5) * 30;
    
    element.style.transform = `perspective(1000px) rotateX(${yPos}deg) rotateY(${-xPos}deg) translate3d(0, 0, 0)`;
  };

  const handleMouseLeave = () => {
    const element = ref.current;
    if (!element) return;
    
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
  };

  const handleTilt = (e) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * 10;
    const rotateY = (centerX - x) / centerX * 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const resetTilt = () => {
    const element = ref.current;
    if (!element) return;
    
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return {
    ref,
    handleMouseMove,
    handleMouseLeave,
    handleTilt,
    resetTilt,
  };
};

export default useParallax;