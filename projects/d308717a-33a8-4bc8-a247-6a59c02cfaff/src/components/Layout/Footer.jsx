import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }
  };

  return (
    <footer className="bg-lux-black text-lux-pearl">
      {/* Main Footer */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl font-medium tracking-widest text-lux-white">
                LUMIÈRE
              </span>
            </Link>
            <p className="body-text text-lux-silver mb-6 max-w-xs">
              An exceptional dining experience featuring signature cuisine in an elegant modern-rustic atmosphere.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-lux-graphite text-lux-silver hover:border-lux-brass hover:text-lux-brass transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-lux-graphite text-lux-silver hover:border-lux-brass hover:text-lux-brass transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-lux-graphite text-lux-silver hover:border-lux-brass hover:text-lux-brass transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-lux-white mb-6 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Our Menu', path: '/menu' },
                { name: 'Reservations', path: '/reservations' },
                { name: 'Order Online', path: '/ordering' },
                { name: 'Private Events', path: '/events' },
                { name: 'About Us', path: '/contact' },
                { name: 'Gallery', path: '/gallery' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-lux-silver hover:text-lux-brass transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg text-lux-white mb-6 tracking-wide">
              Hours
            </h4>
            <ul className="space-y-3 text-lux-silver">
              <li className="flex justify-between">
                <span>Monday - Thursday</span>
                <span className="text-lux-pewter">5PM - 10PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday - Saturday</span>
                <span className="text-lux-pewter">5PM - 11PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-lux-pewter">4PM - 9PM</span>
              </li>
              <li className="pt-2 border-t border-lux-graphite">
                <span className="text-lux-brass">Happy Hour</span>
                <span className="block text-lux-pewter text-sm">Daily 5PM - 6:30PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg text-lux-white mb-6 tracking-wide">
              Newsletter
            </h4>
            <p className="text-lux-silver mb-4">
              Subscribe for exclusive offers and event invitations.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-lux-graphite/30 border border-lux-graphite text-lux-white placeholder-lux-pewter/60 focus:outline-none focus:border-lux-brass transition-colors duration-300"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-lux-brass text-lux-black font-medium tracking-wide hover:bg-lux-brass-light transition-colors duration-300"
              >
                Subscribe
              </button>
              {subscribeStatus === 'success' && (
                <p className="text-lux-brass text-sm">Thank you for subscribing!</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-lux-graphite/50">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-lux-pewter text-sm">
            <p>© {new Date().getFullYear()} Lumière Restaurant. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/contact" className="hover:text-lux-brass transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-lux-brass transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;