import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';

const navLinks = [
  { name: 'Story', href: '#story' },
  { name: 'Menu', href: '#menu' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Reserve', href: '#reservation' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollPosition();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-charcoal-900/95 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#hero" 
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex flex-col"
          >
            <span className="font-serif text-2xl font-semibold text-cream-50 tracking-wide">
              La Maison d'Or
            </span>
            <span className="text-xs text-gold-500 tracking-[0.3em] uppercase">
              Fine Dining
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative text-cream-200 hover:text-gold-400 text-sm tracking-wide transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a
              href="tel:+15551234567"
              className="flex items-center space-x-2 bg-gold-600 text-charcoal-950 px-5 py-2.5 rounded-sm font-medium text-sm hover:bg-gold-500 transition-all duration-300 hover:shadow-gold"
            >
              <Phone size={16} />
              <span>Call Us</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-cream-50 p-2 hover:text-gold-400 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-charcoal-900/98 backdrop-blur-md overflow-hidden transition-all duration-400 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block text-cream-200 hover:text-gold-400 text-lg tracking-wide transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
          <a
            href="tel:+15551234567"
            className="flex items-center space-x-2 text-gold-400 pt-4 border-t border-charcoal-700"
          >
            <Phone size={18} />
            <span>(555) 123-4567</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
