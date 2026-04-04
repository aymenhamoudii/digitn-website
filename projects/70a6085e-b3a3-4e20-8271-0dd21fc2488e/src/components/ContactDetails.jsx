import React from 'react';

const ContactDetails = () => {
  return (
    <div className="p-12 lg:p-24 bg-obsidian text-champagne-light h-full flex flex-col justify-center">
      <div className="space-y-6 mb-16">
        <span className="text-gold tracking-[0.5em] text-xs uppercase font-semibold">Reservations</span>
        <h2 className="text-4xl md:text-5xl font-serif text-champagne leading-tight">Begin Your Journey</h2>
        <div className="h-[1px] w-24 bg-gold/30 mt-6"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <h4 className="text-gold font-serif text-lg tracking-wide italic">Contact Concierge</h4>
          <div className="space-y-2 text-sm md:text-base opacity-70 leading-relaxed font-light">
            <p>Direct: +1 (555) 123-4567</p>
            <p>Events: events@lumiere.com</p>
            <p>1245 Culinary Ave, SF, CA 94103</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-gold font-serif text-lg tracking-wide italic">Operating Hours</h4>
          <div className="space-y-2 text-sm md:text-base opacity-70 leading-relaxed font-light">
            <p>Tue - Thu: 17:00 - 22:30</p>
            <p>Fri - Sat: 17:00 - 23:30</p>
            <p>Sun: 12:00 - 21:00</p>
          </div>
        </div>
      </div>

      <div id="reservation" className="space-y-8 p-10 border border-gold/20 bg-obsidian-light/40 relative group overflow-hidden">
        {/* Subtle decorative border corner */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/40 transition-all group-hover:w-12 group-hover:h-12"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/40 transition-all group-hover:w-12 group-hover:h-12"></div>

        <p className="text-lg md:text-xl font-serif text-champagne leading-relaxed">
          For parties larger than 6 guests, please contact our concierge directly via phone for availability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="btn-primary flex-1 py-4 text-sm font-bold tracking-[0.2em] uppercase">
            Book Online via OpenTable
          </button>
          <button className="btn-outline flex-1 py-4 text-sm font-bold tracking-[0.2em] uppercase">
            Email Request
          </button>
        </div>
      </div>
      
      {/* Social Links */}
      <div className="mt-16 flex items-center space-x-8">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">Follow Us</span>
        <div className="flex space-x-6 text-sm opacity-60">
          <a href="#" className="hover:text-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-gold transition-colors">Facebook</a>
          <a href="#" className="hover:text-gold transition-colors">Twitter</a>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;