import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-obsidian-light border-t border-champagne/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-[0.2em] text-champagne">LUMIÈRE</span>
            <span className="text-[10px] tracking-[0.5em] text-gold/60 -mt-1 uppercase">Gastronomie</span>
          </div>
          <p className="text-champagne-light/60 text-sm leading-relaxed max-w-xs">
            An intersection of traditional culinary arts and contemporary innovation. Experience the gold standard of fine dining.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gold font-serif text-lg mb-6">Explore</h4>
          <ul className="space-y-4 text-sm tracking-wide">
            <li><a href="#about" className="hover:text-gold transition-colors">Our Heritage</a></li>
            <li><a href="#menu" className="hover:text-gold transition-colors">Seasonal Menu</a></li>
            <li><a href="#gallery" className="hover:text-gold transition-colors">The Gallery</a></li>
            <li><a href="#private-events" className="hover:text-gold transition-colors">Private Events</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gold font-serif text-lg mb-6">Connect</h4>
          <ul className="space-y-4 text-sm tracking-wide">
            <li className="flex items-center space-x-3">
              <span className="text-champagne-light/60">Phone:</span>
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-champagne-light/60">Email:</span>
              <span>concierge@lumiere.com</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-champagne-light/60">Visit:</span>
              <span>1245 Culinary Ave,<br />San Francisco, CA 94103</span>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-gold font-serif text-lg mb-6">Service Hours</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-champagne-light/60">Tue - Thu</span>
              <span>17:00 - 22:30</span>
            </li>
            <li className="flex justify-between">
              <span className="text-champagne-light/60">Fri - Sat</span>
              <span>17:00 - 23:30</span>
            </li>
            <li className="flex justify-between">
              <span className="text-champagne-light/60">Sun</span>
              <span>12:00 - 21:00</span>
            </li>
            <li className="pt-2 text-xs text-bordeaux-light font-medium italic">Monday Closed</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 border-t border-champagne/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] tracking-[0.2em] uppercase text-champagne-light/40">
        <p>&copy; {new Date().getFullYear()} LUMIÈRE Gastronomie. All rights reserved.</p>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-gold transition-colors">Privacy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms</a>
          <a href="#" className="hover:text-gold transition-colors">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;