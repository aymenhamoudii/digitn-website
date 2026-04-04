import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rustic-950 text-rustic-50 py-16 md:py-24 border-t-8 border-rustic-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          {/* Brand and Story */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Link href="/" className="flex flex-col items-center md:items-start group">
              <span className="font-serif text-3xl font-bold tracking-[0.15em] transition-colors group-hover:text-rustic-400">
                RUSTIC TABLE
              </span>
              <span className="text-xs uppercase tracking-[0.3em] font-light text-rustic-400">
                Crafted with Passion
              </span>
            </Link>
            <p className="text-rustic-300 text-sm font-light leading-relaxed max-w-xs mt-4">
              Born from a love for local ingredients and traditional cooking methods. 
              We believe in the power of a shared meal and the stories told around the table.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-semibold border-b border-rustic-800 pb-3 inline-block">
              Hours
            </h4>
            <ul className="space-y-3 text-sm text-rustic-300">
              <li className="flex justify-between items-center max-w-[200px] mx-auto md:mx-0">
                <span>Mon – Thu</span>
                <span className="text-rustic-50">11:00 – 21:00</span>
              </li>
              <li className="flex justify-between items-center max-w-[200px] mx-auto md:mx-0">
                <span>Fri – Sat</span>
                <span className="text-rustic-50">11:00 – 22:30</span>
              </li>
              <li className="flex justify-between items-center max-w-[200px] mx-auto md:mx-0">
                <span>Sunday</span>
                <span className="text-rustic-50">10:00 – 20:00</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-semibold border-b border-rustic-800 pb-3 inline-block">
              Visit Us
            </h4>
            <address className="not-italic space-y-3 text-sm text-rustic-300">
              <p className="flex items-start space-x-3 justify-center md:justify-start">
                <span className="text-accent-gold">📍</span>
                <span>124 Heritage Lane,<br />Pinebrook, VT 05401</span>
              </p>
              <p className="flex items-center space-x-3 justify-center md:justify-start">
                <span className="text-accent-gold">📞</span>
                <a href="tel:+18025550123" className="hover:text-rustic-50 transition-colors">
                  (802) 555-0123
                </a>
              </p>
              <p className="flex items-center space-x-3 justify-center md:justify-start">
                <span className="text-accent-gold">✉️</span>
                <a href="mailto:hello@rustictable.com" className="hover:text-rustic-50 transition-colors">
                  hello@rustictable.com
                </a>
              </p>
            </address>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-semibold border-b border-rustic-800 pb-3 inline-block">
              Stay in Touch
            </h4>
            <p className="text-sm text-rustic-300">
              Subscribe to get seasonal updates and special offers.
            </p>
            <form className="flex flex-col space-y-2 max-w-[280px] mx-auto md:mx-0">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="bg-rustic-900 border border-rustic-800 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-gold transition-all"
                required
              />
              <button type="submit" className="bg-rustic-800 hover:bg-rustic-700 text-rustic-50 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 md:mt-24 pt-8 border-t border-rustic-900 flex flex-col md:flex-row justify-between items-center text-xs text-rustic-500 uppercase tracking-widest gap-4">
          <p>&copy; {currentYear} The Rustic Table. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-accent-gold transition-colors">Instagram</a>
            <a href="#" className="hover:text-accent-gold transition-colors">Facebook</a>
            <a href="#" className="hover:text-accent-gold transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
