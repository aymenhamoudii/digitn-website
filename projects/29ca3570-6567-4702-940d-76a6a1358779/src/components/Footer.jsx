import { MapPin, Phone, Clock, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-cream-50">La Maison d'Or</h3>
            <p className="text-cream-400 text-sm leading-relaxed">
              An intimate fine dining experience where rustic tradition meets 
              culinary excellence. Every dish tells a story of passion and craftsmanship.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="#" 
                className="text-cream-500 hover:text-gold-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="text-cream-500 hover:text-gold-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-gold-500">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-cream-400 text-sm">
                <MapPin size={18} className="text-gold-600 flex-shrink-0 mt-0.5" />
                <span>123 Culinary Avenue<br />Wine Country, CA 95448</span>
              </li>
              <li className="flex items-center space-x-3 text-cream-400 text-sm">
                <Phone size={18} className="text-gold-600 flex-shrink-0" />
                <a href="tel:+15551234567" className="hover:text-gold-400 transition-colors">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center space-x-3 text-cream-400 text-sm">
                <Mail size={18} className="text-gold-600 flex-shrink-0" />
                <a href="mailto:reservations@lamaisondor.com" className="hover:text-gold-400 transition-colors">
                  reservations@lamaisondor.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-gold-500">Hours</h4>
            <ul className="space-y-2 text-cream-400 text-sm">
              <li className="flex items-center space-x-3">
                <Clock size={18} className="text-gold-600 flex-shrink-0" />
                <span>Tuesday - Thursday</span>
              </li>
              <li className="pl-9">5:00 PM - 10:00 PM</li>
              <li className="flex items-center space-x-3 pt-2">
                <Clock size={18} className="text-gold-600 flex-shrink-0 opacity-0" />
                <span>Friday - Saturday</span>
              </li>
              <li className="pl-9">5:00 PM - 11:00 PM</li>
              <li className="flex items-center space-x-3 pt-2">
                <Clock size={18} className="text-gold-600 flex-shrink-0 opacity-0" />
                <span>Sunday</span>
              </li>
              <li className="pl-9">4:00 PM - 9:00 PM</li>
            </ul>
            <p className="text-gold-600 text-xs italic pl-9">Closed Mondays</p>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-gold-500">Stay Connected</h4>
            <p className="text-cream-400 text-sm">
              Receive updates on seasonal menus and special events.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-sm px-4 py-3 text-cream-100 text-sm placeholder-cream-600 focus:border-gold-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-gold-700 text-charcoal-950 py-3 px-4 rounded-sm font-medium text-sm hover:bg-gold-600 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-charcoal-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-cream-600 text-xs">
            © {currentYear} La Maison d'Or. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs">
            <a href="#" className="text-cream-600 hover:text-gold-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-cream-600 hover:text-gold-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
