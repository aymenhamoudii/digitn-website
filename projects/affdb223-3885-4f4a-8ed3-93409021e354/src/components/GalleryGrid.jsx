import React, { useState } from 'react';
import Lightbox from './Lightbox';

export default function GalleryGrid({ items = [] }){
  const [index, setIndex] = useState(-1);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <button key={it.id} onClick={() => setIndex(i)} className="block focus:outline-none focus:ring-2 focus:ring-primary-300 rounded overflow-hidden">
            <img src={it.src} alt={it.alt} loading="lazy" className="w-full h-40 object-cover" />
            <div className="text-sm text-neutral-600 mt-1">{it.caption}</div>
          </button>
        ))}
      </div>

      {index >= 0 && <Lightbox items={items} startIndex={index} onClose={() => setIndex(-1)} onNavigate={setIndex} />}
    </div>
  );
}
