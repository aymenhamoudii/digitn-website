import React from 'react';

export default function ContactCard(){
  return (
    <div className="card">
      <h3 className="font-serif">Contact</h3>
      <address className="not-italic mt-2 text-sm text-neutral-700">
        Eat Time<br/>
        123 Culinary Ave<br/>
        Food City, FC 12345
      </address>
      <p className="mt-3 text-sm">Phone: <a href="tel:+1234567890" className="text-primary-700">+1 (234) 567-890</a></p>
      <p className="mt-2 text-sm text-neutral-600">Reservations are by phone only. Please call during business hours to secure a booking.</p>
      <p className="mt-2 text-sm">Hours: Tue - Sat: 5:30pm — 11:00pm</p>
      <p className="mt-2 text-sm"><a href="https://www.google.com/maps/search/?api=1&query=123+Culinary+Ave" target="_blank" rel="noreferrer" className="text-primary-700">View on map</a></p>
    </div>
  );
}
