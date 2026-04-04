import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-primary-500 font-display text-xl">Savory</span>
              <span className="text-neutral-400 font-display text-lg">Bistro</span>
            </a>
            <p className="text-neutral-400">
              Fine dining experience with a vibrant twist. Join us for unforgettable culinary journeys.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-neutral-100 font-medium mb-2">Contact Us</h3>
            <div className="space-y-3">
              <p className="flex items-center text-neutral-400">
                <FaMapMarkerAlt className="w-5 h-5 text-primary-500 mr-3" />
                <span>123 Gourmet Street, Culinary City, GC 12345</span>
              </p>
              <p className="flex items-center text-neutral-400">
                <FaPhone className="w-5 h-5 text-primary-500 mr-3" />
                <span>+1 (234) 567-8900</span>
              </p>
              <p className="flex items-center text-neutral-400">
                <FaEnvelope className="w-5 h-5 text-primary-500 mr-3" />
                <span>info@savorybistro.com</span>
              </p>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-neutral-100 font-medium mb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FaFacebookF className="w-6 h-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-neutral-100 font-medium mb-2">Newsletter</h3>
            <p className="text-neutral-400 mb-4">
              Stay updated with our latest events, menu changes, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="bg-primary-500 text-white px-5 py-2 rounded-md hover:bg-primary-600 transition-colors flex-1 sm:flex-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-center text-neutral-500 text-sm">
            © 2023 Savory Bistro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;