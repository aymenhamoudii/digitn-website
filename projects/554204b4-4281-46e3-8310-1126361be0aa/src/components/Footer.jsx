import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest-900 text-beige pt-32 pb-12 relative overflow-hidden">
      
      {/* Decorative large text */}
      <div className="absolute top-10 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none flex justify-center">
        <span className="font-serif text-[15vw] leading-none whitespace-nowrap">Lumina</span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Top Section - Reservation CTA */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-20 border-b border-forest-700 gap-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-center md:text-left">
            Join us at the<br />
            <span className="italic font-light text-terracotta">table.</span>
          </h2>
          
          <button className="px-8 py-4 bg-terracotta text-white font-sans text-sm tracking-widest uppercase hover:bg-white hover:text-forest-900 transition-colors duration-300 shrink-0">
            Make a Reservation
          </button>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-20">
          
          {/* Info Block */}
          <div>
            <h3 className="font-sans uppercase tracking-widest text-sm text-forest-400 mb-6">Location</h3>
            <address className="not-italic font-sans text-beige-200 leading-loose">
              1428 Hearthside Way<br />
              Boulder Creek, CA 95006<br />
              <a href="tel:+15551234567" className="hover:text-terracotta transition-colors mt-2 inline-block">(555) 123-4567</a><br />
              <a href="mailto:hello@luminarestaurant.com" className="hover:text-terracotta transition-colors">hello@luminarestaurant.com</a>
            </address>
          </div>

          {/* Hours Block */}
          <div>
            <h3 className="font-sans uppercase tracking-widest text-sm text-forest-400 mb-6">Hours</h3>
            <ul className="font-sans text-beige-200 leading-loose">
              <li className="flex justify-between max-w-[200px]">
                <span>Wed - Thu</span>
                <span>5pm - 10pm</span>
              </li>
              <li className="flex justify-between max-w-[200px]">
                <span>Fri - Sat</span>
                <span>5pm - 11pm</span>
              </li>
              <li className="flex justify-between max-w-[200px]">
                <span>Sunday</span>
                <span>4pm - 9pm</span>
              </li>
              <li className="text-forest-500 mt-4 italic text-sm">
                Closed Mon & Tue
              </li>
            </ul>
          </div>

          {/* Links Block */}
          <div>
            <h3 className="font-sans uppercase tracking-widest text-sm text-forest-400 mb-6">Navigation</h3>
            <ul className="font-sans text-beige-200 space-y-4">
              <li>
                <a href="#menu" className="relative group inline-block">
                  Menu
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-terracotta transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#story" className="relative group inline-block">
                  Our Story
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-terracotta transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#gallery" className="relative group inline-block">
                  Atmosphere
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-terracotta transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#private-events" className="relative group inline-block">
                  Private Events
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-terracotta transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Block */}
          <div>
            <h3 className="font-sans uppercase tracking-widest text-sm text-forest-400 mb-6">Social</h3>
            <ul className="font-sans text-beige-200 space-y-4">
              <li>
                <a href="#" className="hover:text-terracotta transition-colors flex items-center gap-2">
                  Instagram
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-terracotta transition-colors flex items-center gap-2">
                  Facebook
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row justify-between items-center gap-4 text-forest-500 font-sans text-xs uppercase tracking-wider">
          <p>&copy; {currentYear} Lumina Restaurant. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-beige transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-beige transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;