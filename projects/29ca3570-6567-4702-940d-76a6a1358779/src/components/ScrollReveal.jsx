import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export function ScrollReveal({ 
  children, 
  delay = 0, 
  className = '',
  direction = 'up'
}) {
  const { ref, hasIntersected } = useIntersectionObserver();

  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      default: return 'translateY(30px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hasIntersected ? 1 : 0,
        transform: hasIntersected ? 'translate(0)' : getInitialTransform(),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({ children, className = '' }) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div ref={ref} className={className}>
      {hasIntersected && children}
    </div>
  );
}

export function StaggerItem({ children, index = 0, className = '' }) {
  const delay = index * 100;
  
  return (
    <div
      className={className}
      style={{
        opacity: 1,
        animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms forwards`,
      }}
    >
      {children}
    </div>
  );
}
