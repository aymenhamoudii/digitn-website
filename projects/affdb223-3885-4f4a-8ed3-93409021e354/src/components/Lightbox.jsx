import React, { useEffect } from 'react';

export default function Lightbox({ items = [], startIndex = 0, onClose = () => {}, onNavigate = () => {} }){
  useEffect(() => {
    function onKey(e){
      if(e.key === 'Escape') onClose();
      if(e.key === 'ArrowRight') onNavigate(i => Math.min(items.length - 1, (i ?? startIndex) + 1));
      if(e.key === 'ArrowLeft') onNavigate(i => Math.max(0, (i ?? startIndex) - 1));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [items.length, onClose, onNavigate, startIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-70" onClick={onClose} />
      <div className="z-10 max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden p-4">
          <div className="flex items-center justify-between mb-4">
            <div />
            <button onClick={onClose} className="nav-link">Close</button>
          </div>
          <div className="w-full">
            <img src={items[startIndex].src} alt={items[startIndex].alt} className="w-full h-96 object-contain" />
            <div className="mt-2 text-center text-sm text-neutral-600">{items[startIndex].caption}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
