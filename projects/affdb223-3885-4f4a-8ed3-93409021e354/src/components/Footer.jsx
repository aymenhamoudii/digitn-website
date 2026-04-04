import React from 'react';

export default function Footer(){
  return (
    <footer className="bg-white border-t border-neutral-200 mt-12" role="contentinfo">
      <div className="container py-10 flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-serif">Eat Time</h3>
          <p className="text-sm text-neutral-600">Luxury fine dining — private events & seasonal tasting menus</p>
        </div>

        <div>
          <h4 className="font-medium">Contact</h4>
          <address className="not-italic text-sm text-neutral-700">
            123 Culinary Ave<br/>
            Food City, FC 12345<br/>
            <a href="tel:+1234567890" className="text-primary-700">+1 (234) 567-890</a>
          </address>
        </div>

        <div>
          <h4 className="font-medium">Hours</h4>
          <p className="text-sm text-neutral-700">Tue - Sat: 5:30pm — 11:00pm<br/>Sun - Mon: Closed</p>
        </div>
      </div>
      <div className="bg-neutral-100 text-center text-xs text-neutral-600 py-4">© {new Date().getFullYear()} Eat Time. All rights reserved.</div>
    </footer>
  );
}
