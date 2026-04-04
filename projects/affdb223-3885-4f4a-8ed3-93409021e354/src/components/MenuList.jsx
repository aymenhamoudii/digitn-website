import React, { useMemo, useState } from 'react';
import MenuItem from './MenuItem';
import MenuFilters from './MenuFilters';
import DishModal from './DishModal';

export default function MenuList({ items = [], filters = {}, onChangeFilters = () => {} }){
  const [selected, setSelected] = useState(null);

  const courses = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.course)))], [items]);
  const tags = useMemo(() => ['All', ...Array.from(new Set(items.flatMap(i => i.tags || [])))], [items]);

  const filtered = useMemo(() => {
    return items.filter(it => {
      if(filters.course && filters.course !== 'All' && it.course !== filters.course) return false;
      if(filters.tag && filters.tag !== 'All' && !(it.tags || []).includes(filters.tag)) return false;
      return true;
    });
  }, [items, filters]);

  return (
    <div>
      <MenuFilters courses={courses} tags={tags} filters={filters} onChange={onChangeFilters} />

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <MenuItem key={item.id} item={item} onOpen={() => setSelected(item)} />
        ))}
      </div>

      {selected && <DishModal item={selected} onClose={() => setSelected(null)} />}

      <div className="mt-8 text-sm text-neutral-600">
        <p>Printable menu: use your browser print (Ctrl/Cmd+P) for a clean, print-friendly view.</p>
      </div>
    </div>
  );
}
