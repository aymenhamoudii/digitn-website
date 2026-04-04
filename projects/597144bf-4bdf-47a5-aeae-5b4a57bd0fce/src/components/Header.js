import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-primary-600 font-display text-xl">Savory</span>
              <span className="text-neutral-700 font-display text-lg">Bistro</span>
            </a>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-6">
            <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              Menu
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              Reservations
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              Events
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              Loyalty
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              Reviews
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <button
              className="p-2 rounded-md hover:bg-neutral-100"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Open menu"
            >
              {isOpen ? (
                <FaTimes className="text-neutral-600" />
              ) : (
                <FaBars className="text-neutral-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50">
              Menu
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50">
              Reservations
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50">
              Events
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50">
              Loyalty
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50">
              Reviews
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;