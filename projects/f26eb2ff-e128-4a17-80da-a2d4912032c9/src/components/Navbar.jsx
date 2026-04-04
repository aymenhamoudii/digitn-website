import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'PROJECTS', href: '#projects' },
    { name: 'EXPERIENCE', href: '#experience' },
    { name: 'BLOG', href: '#blog' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex justify-between items-center bg-white brutal-border p-4 transition-all duration-300 ${scrolled ? 'shadow-brutal' : ''}`}>
          <a href="#" className="font-serif font-black text-2xl tracking-tighter hover:text-earth-clay transition-colors">
            PORTFELIO.
          </a>
          
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="font-bold text-sm tracking-widest hover:text-earth-clay transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-earth-clay transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="md:hidden">
            {/* Simple Mobile Toggle (Functional but minimalist) */}
            <button className="brutal-btn p-2 px-4 text-xs">MENU</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
