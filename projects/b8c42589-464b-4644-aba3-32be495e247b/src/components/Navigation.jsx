import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, UtensilsCrossed, Phone, MapPin, Clock } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'atmosphere', label: 'Atmosphere', icon: MapPin },
    { id: 'reservation', label: 'Reservation', icon: Clock },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-concrete-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => scrollToSection('hero')}>
                <div className="relative">
                  <div className="w-10 h-10 gradient-brass rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 border-2 border-brass-500/30 rounded-xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-black-matte">Éclat</h1>
                  <p className="text-xs font-body text-concrete-500">Industrial Dining</p>
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="group flex items-center space-x-2 font-body font-medium text-concrete-700 hover:text-terracotta-500 transition-colors duration-200 focus:outline-none focus:text-terracotta-500"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>{item.label}</span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-terracotta-500 group-hover:w-full transition-all duration-300" />
                  </button>
                );
              })}
              <button 
                onClick={() => scrollToSection('reservation')}
                className="btn-primary px-6 py-2"
              >
                Book Table
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg bg-concrete-100 hover:bg-concrete-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-concrete-700" />
              ) : (
                <Menu className="w-6 h-6 text-concrete-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMenuOpen ? 'auto' : 0,
          opacity: isMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-concrete-200 shadow-xl md:hidden overflow-hidden"
      >
        <div className="px-4 py-6">
          <div className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center justify-between w-full p-4 rounded-lg bg-concrete-50 hover:bg-concrete-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-concrete-200 rounded-lg">
                      <Icon className="w-5 h-5 text-concrete-700" />
                    </div>
                    <span className="font-body font-medium text-concrete-800">{item.label}</span>
                  </div>
                  <div className="text-concrete-400">→</div>
                </button>
              );
            })}
            <button 
              onClick={() => scrollToSection('reservation')}
              className="w-full btn-primary py-4"
            >
              Reserve a Table
            </button>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-concrete-200">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-concrete-100 rounded-lg">
                  <Clock className="w-5 h-5 text-concrete-700" />
                </div>
                <div>
                  <p className="font-body font-medium text-concrete-800">Hours</p>
                  <p className="text-sm text-concrete-600">Mon-Sun: 5PM - 11PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-concrete-100 rounded-lg">
                  <Phone className="w-5 h-5 text-concrete-700" />
                </div>
                <div>
                  <p className="font-body font-medium text-concrete-800">Phone</p>
                  <p className="text-sm text-concrete-600">(555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Navigation;