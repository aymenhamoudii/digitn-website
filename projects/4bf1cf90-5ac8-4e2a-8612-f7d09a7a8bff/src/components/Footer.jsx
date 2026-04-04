import React from 'react';

function Footer() {
  return (
    <footer className="bg-neutral-dark text-cream py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12">
          {/* Logo &amp; description */}
          <div className="md:col-span-4">
            <span className="text-4xl font-serif tracking-tighter text-cream">Bella Vista</span>
            <p className="text-cream/70 mt-4 max-w-xs">
              Via della Vigna Nuova 12<br />
              50125 Firenze, Italia
            </p>
            <p className="text-xs text-cream/40 mt-8">
              © 2026 Bella Vista. All rights reserved.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-cream/50 mb-6">Explore</div>
            <ul className="space-y-4 text-sm">
              <li><a href="#menu" className="hover:text-terracotta transition-colors">Menu</a></li>
              <li><a href="#reservations" className="hover:text-terracotta transition-colors">Reservations</a></li>
              <li><a href="#about" className="hover:text-terracotta transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-terracotta transition-colors">Private Events</a></li>
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-cream/50 mb-6">Hours</div>
            <ul className="space-y-4 text-sm text-cream/80">
              <li>Tue–Sun: 5:00 PM – 10:00 PM</li>
              <li>Monday: Closed</li>
              <li className="text-terracotta">Last seating 9:00 PM</li>
            </ul>
          </div>

          {/* Contact &amp; Social */}
          <div className="md:col-span-4">
            <div className="uppercase text-xs tracking-widest text-cream/50 mb-6">Get in touch</div>
            <a href="tel:+390552342567" className="block text-xl hover:text-terracotta transition-colors">+39 055 234 2567</a>
            <a href="mailto:reservations@bellavista.firenze" className="block text-xl mt-1 hover:text-terracotta transition-colors">reservations@bellavista.firenze</a>
            
            <div className="mt-12 flex gap-x-6">
              <a href="#" className="text-3xl hover:text-terracotta transition-colors">📸</a>
              <a href="#" className="text-3xl hover:text-terracotta transition-colors">𝕏</a>
              <a href="#" className="text-3xl hover:text-terracotta transition-colors">📘</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
