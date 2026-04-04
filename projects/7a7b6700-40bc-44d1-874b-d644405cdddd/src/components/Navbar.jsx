import React, { useState, useEffect } from 'react';
import { Menu, X } from './Icons';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Story', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Social Proof', href: '#testimonials' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-charcoal/90 backdrop-blur-md py-4 border-white/5 shadow-2xl' 
          : 'bg-transparent py-8 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="relative group overflow-hidden">
          <span className="text-2xl font-serif font-bold tracking-tight text-white group-hover:text-gold transition-colors duration-300">
            L'ESSENCE<span className="text-gold italic">.</span>
          </span>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-gold transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <button className="px-8 py-3 bg-gold/10 border border-gold/50 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all duration-300 rounded-lg">
            Reserve a Table
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-0 top-[88px] bg-charcoal/98 backdrop-blur-xl z-40 transition-all duration-500 transform ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-12 p-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-3xl font-serif font-bold text-gray-400 hover:text-gold transition-colors italic"
            >
              {link.name}
            </a>
          ))}
          <button className="w-full max-w-xs py-5 bg-gold text-charcoal font-bold uppercase tracking-[0.3em] text-sm shadow-gold/20 shadow-lg rounded-2xl">
            Book Now
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
