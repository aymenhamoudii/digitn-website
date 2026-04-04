import React, { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Navbar = () => {
  // Initialize scroll reveal globally
  useScrollReveal();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll events for navbar style and active section
  useEffect(() => {
    const handleScroll = () => {
      // Toggle navbar background
      setIsScrolled(window.scrollY > 50);

      // Determine active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      let currentSectionId = 'home';
      
      const scrollPosition = window.scrollY + 100; // Offset for navbar

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      // Special case for footer/bottom of page
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
          currentSectionId = 'reviews'; // Or a footer ID if applicable
      }

      setActiveSection(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'Story', href: '#story' },
    { name: 'Chef', href: '#chef' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'bg-beige/95 backdrop-blur-md shadow-sm py-4' 
            : 'bg-transparent py-6 md:py-8'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <a 
            href="#home" 
            className={`font-serif text-2xl tracking-widest uppercase transition-colors duration-300 z-50 relative ${
              isScrolled || isMobileMenuOpen ? 'text-forest-900' : 'text-beige'
            }`}
          >
            Lumina
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className={`font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group ${
                      isScrolled ? 'text-forest-600 hover:text-terracotta' : 'text-beige-200 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {/* Active/Hover underline */}
                    <span 
                      className={`absolute -bottom-2 left-0 h-[1px] transition-all duration-300 ${
                        activeSection === link.href.substring(1) 
                          ? `w-full ${isScrolled ? 'bg-terracotta' : 'bg-white'}` 
                          : `w-0 group-hover:w-full ${isScrolled ? 'bg-terracotta/50' : 'bg-white/50'}`
                      }`}
                    ></span>
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <a 
              href="#reservation"
              className={`hidden lg:inline-flex items-center justify-center px-6 py-3 font-sans text-xs tracking-widest uppercase transition-all duration-300 border ${
                isScrolled 
                  ? 'border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-forest-900'
              }`}
            >
              Reserve
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 relative p-2 text-current focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className={`w-6 h-[2px] transition-all duration-300 relative ${
              isScrolled || isMobileMenuOpen ? 'bg-forest-900' : 'bg-white'
            } ${isMobileMenuOpen ? 'rotate-45 translate-y-[2px]' : '-translate-y-1'}`}></div>
            <div className={`w-6 h-[2px] transition-all duration-300 relative ${
              isScrolled || isMobileMenuOpen ? 'bg-forest-900' : 'bg-white'
            } ${isMobileMenuOpen ? '-rotate-45 -translate-y-[2px]' : 'translate-y-1'}`}></div>
          </button>
          
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        links={navLinks} 
      />
    </>
  );
};

export default Navbar;