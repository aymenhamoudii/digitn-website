import React from 'react';

export default function MenuItem({ item, onOpen }){
  return (
    <article className="card flex items-start gap-4" role="article" aria-labelledby={`dish-${item.id}`}>
      <div className="flex-1">
        <h3 id={`dish-${item.id}`} className="font-serif">{item.name} <span className="text-sm text-neutral-500">${item.price}</span></h3>
        <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
        <div className="mt-3 flex gap-2">
          {(item.tags || []).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-neutral-100 rounded-full text-neutral-700">{tag}</span>
          ))}
        </div>
      </div>
      <div className="self-center">
        <button onClick={onOpen} className="nav-link" aria-label={`View details for ${item.name}`}>Details</button>
      </div>
    </article>
  );
}
