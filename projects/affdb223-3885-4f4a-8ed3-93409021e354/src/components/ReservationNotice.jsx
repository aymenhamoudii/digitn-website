import React from 'react';

export default function ReservationNotice(){
  return (
    <div className="card">
      <h3 className="font-serif">Reservations</h3>
      <p className="mt-2 text-neutral-700 text-sm">We accept reservations by phone only. To arrange a table for dinner or a private event, please call us during operating hours at <a href="tel:+1234567890" className="text-primary-700">+1 (234) 567-890</a>.</p>
      <div className="mt-4 bg-neutral-50 p-4 rounded">
        <p className="text-sm"><strong>Accessibility:</strong> Our dining room has accessible seating and restroom facilities. If you have specific requirements, please mention them when calling.</p>
      </div>
    </div>
  );
}
