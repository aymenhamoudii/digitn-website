import React, { useEffect, useState } from 'react';

const MobileMenu = ({ isOpen, onClose, links }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      // Delay unmounting to allow exit animation to complete
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = 'auto';
      }, 500); // Match longest transition duration
      return () => clearTimeout(timer);
    }
    
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
        isOpen ? 'visible' : 'invisible'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-forest-900/80 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Slide-in Menu Panel */}
      <div 
        className={`absolute top-0 right-0 w-full max-w-sm h-full bg-beige shadow-2xl flex flex-col pt-32 px-8 pb-12 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ul className="flex flex-col gap-8 flex-grow">
          {links.map((link, index) => (
            <li 
              key={link.name}
              className={`transition-all duration-500 ease-out transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${isOpen ? 100 + (index * 100) : 0}ms` }}
            >
              <a 
                href={link.href}
                onClick={onClose}
                className="text-4xl font-serif text-forest-900 hover:text-terracotta transition-colors block border-b border-forest-200/50 pb-4"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Footer Info */}
        <div 
          className={`mt-auto transition-all duration-500 ease-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: `${isOpen ? 100 + (links.length * 100) : 0}ms` }}
        >
          <a 
            href="#reservation"
            onClick={onClose}
            className="block w-full text-center py-4 bg-terracotta text-white font-sans uppercase tracking-widest text-sm mb-8 hover:bg-forest-900 transition-colors"
          >
            Make a Reservation
          </a>
          
          <div className="font-sans text-forest-500 text-sm space-y-2 text-center">
            <p>1428 Hearthside Way, CA</p>
            <p>Wed-Sun | Dinner Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;