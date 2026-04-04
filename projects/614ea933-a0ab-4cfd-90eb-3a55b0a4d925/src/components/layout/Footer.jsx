import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <a href="#" className="text-3xl font-display font-bold tracking-tighter">
            VIBE<span className="text-primary">EATS</span>
          </a>
          <p className="text-text-secondary text-sm mt-2">© 2024 Vibe Eats Culinary Group. All rights reserved.</p>
        </div>

        <div className="flex gap-8">
          {['Instagram', 'Facebook', 'Twitter', 'TikTok'].map((social) => (
            <a 
              key={social} 
              href="#" 
              className="text-text-secondary hover:text-primary transition-colors font-medium text-sm"
            >
              {social}
            </a>
          ))}
        </div>

        <div className="flex gap-6 text-sm">
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Terms</a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
