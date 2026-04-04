import React, { useEffect } from 'react';

export default function DishModal({ item, onClose }){
  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-lg z-10 max-w-lg mx-4 p-6">
        <h2 id="modal-title" className="font-serif text-2xl">{item.name}</h2>
        <p className="text-neutral-600 mt-2">{item.description}</p>
        <ul className="mt-3 text-sm text-neutral-700">
          <li><strong>Ingredients:</strong> {(item.ingredients || []).join(', ')}</li>
          <li><strong>Price:</strong> ${item.price}</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <button className="nav-link" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
