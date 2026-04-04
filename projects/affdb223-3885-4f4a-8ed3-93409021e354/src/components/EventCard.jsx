import React from 'react';

export default function EventCard({ event }){
  return (
    <article className="card">
      <h3 className="font-serif">{event.title}</h3>
      <p className="text-sm text-neutral-600 mt-1">{event.excerpt}</p>
      <p className="text-xs text-neutral-500 mt-2">Date: {new Date(event.date).toLocaleDateString()}</p>
      <div className="mt-4">
        <details>
          <summary className="nav-link">Learn more</summary>
          <div className="mt-2 text-sm text-neutral-700">{event.details}</div>
        </details>
      </div>
    </article>
  );
}
