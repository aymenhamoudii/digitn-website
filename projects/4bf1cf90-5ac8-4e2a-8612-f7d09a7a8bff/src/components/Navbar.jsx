import React, { useState } from 'react';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-neutral/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-3xl font-serif tracking-tighter text-neutral-dark">Bella Vista</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-x-8 text-sm font-medium">
            <a href="#menu" className="hover:text-terracotta transition-colors duration-200">Menu</a>
            <a href="#reservations" className="hover:text-terracotta transition-colors duration-200">Reservations</a>
            <a href="#about" className="hover:text-terracotta transition-colors duration-200">Our Story</a>
            <a href="#contact" className="hover:text-terracotta transition-colors duration-200">Visit Us</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-terracotta hover:bg-neutral-dark text-cream text-sm font-medium rounded-3xl transition-all duration-300 active:scale-[0.97]"
            >
              Reserve Table
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-neutral-dark hover:text-terracotta transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6h12v12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream border-t border-neutral/10 py-6 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-y-6 text-base font-medium">
            <a href="#menu" className="hover:text-terracotta transition-colors" onClick={toggleMobileMenu}>Menu</a>
            <a href="#reservations" className="hover:text-terracotta transition-colors" onClick={toggleMobileMenu}>Reservations</a>
            <a href="#about" className="hover:text-terracotta transition-colors" onClick={toggleMobileMenu}>Our Story</a>
            <a href="#contact" className="hover:text-terracotta transition-colors" onClick={toggleMobileMenu}>Visit Us</a>
            <button
              onClick={() => {
                toggleMobileMenu();
                document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 w-full py-4 bg-terracotta text-cream font-medium rounded-3xl text-base"
            >
              Reserve Your Table
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
