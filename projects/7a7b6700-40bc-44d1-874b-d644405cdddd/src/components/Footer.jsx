import React from 'react';
import { Instagram, Facebook, Twitter, Phone, MapPin, Mail, ChevronRight } from './Icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-32 pb-16 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold tracking-tight">
              L'ESSENCE<span className="text-gold italic">.</span>
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Crafting unforgettable culinary memories through artisanal precision and a passion for refined flavors.
            </p>
          </div>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a 
                key={i}
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal hover:border-gold transition-all"
                aria-label="Social Media Link"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">Dining Hours</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Mon – Thu</span>
              <span className="text-champagne font-semibold">17:00 – 22:30</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Fri – Sat</span>
              <span className="text-champagne font-semibold">17:00 – 23:30</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Sunday</span>
              <span className="text-gold font-semibold italic">Closed</span>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">Contact Details</h3>
          <ul className="space-y-6">
            <li className="flex items-start gap-4 text-gray-400">
              <MapPin size={20} className="text-gold shrink-0 mt-1" />
              <span>124 Gastronomy Ave, <br />Culinary District, NY 10012</span>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <Phone size={20} className="text-gold shrink-0" />
              <span>+1 (212) 555-0198</span>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <Mail size={20} className="text-gold shrink-0" />
              <span>reservations@lessence.com</span>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">Reservations</h3>
          <div className="p-6 rounded-2xl bg-gold/5 border border-gold/10 space-y-6">
            <p className="text-sm text-gray-400">Join our newsletter for seasonal menu updates and special event invitations.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full bg-charcoal border border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <button className="absolute right-2 top-1.5 p-1.5 bg-gold text-charcoal rounded-lg hover:bg-gold-light transition-colors group-hover:translate-x-1 duration-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-semibold uppercase tracking-widest text-gray-600">
        <p>© {currentYear} L'Essence Bistro. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
