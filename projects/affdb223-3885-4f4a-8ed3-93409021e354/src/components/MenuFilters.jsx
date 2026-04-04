import React from 'react';

export default function MenuFilters({ courses = [], tags = [], filters = {}, onChange = () => {} }){
  const update = (k,v) => onChange(prev => ({...prev, [k]: v}));

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-neutral-700">Course:</label>
        <select className="input" value={filters.course || 'All'} onChange={e => update('course', e.target.value)} aria-label="Filter by course">
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="text-sm text-neutral-700 ml-4">Tag:</label>
        <select className="input" value={filters.tag || 'All'} onChange={e => update('tag', e.target.value)} aria-label="Filter by tag">
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <button className="nav-link no-print" onClick={() => onChange({course:'All', tag:'All'})}>Reset</button>
      </div>
    </div>
  );
}
