import { useState, useEffect } from 'react';

const useMouseParallax = (intensity = 0.1) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let animationFrameId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.1,
        y: prev.y + (targetPosition.y - prev.y) * 0.1
      }));
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleMouseMove = (e) => {
      if (!isMounted) return;
      
      const x = (e.clientX / window.innerWidth - 0.5) * 2 * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * 2 * intensity;
      setTargetPosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setTargetPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return {
    transform: `translate3d(${position.x * 50}px, ${position.y * 50}px, 0) rotateX(${position.y * 10}deg) rotateY(${position.x * 10}deg)`,
    isActive: isHovering,
    position,
  };
};

export default useMouseParallax;