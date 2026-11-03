'use client';

import type { Filters } from '@/lib/settings';

export default function Toolbar({ filters, total, onChange }: { filters: Filters; total: number; onChange: (p: Partial<Filters>) => void }) {
  const kinds: [Filters['kind'], string][] = [['all', 'All'], ['icon', 'Icons'], ['scene', 'Scenes']];
  return (
    <div className="toolbar">
      <span className="count-label" aria-live="polite">
        {total} {total === 1 ? 'drawing' : 'drawings'}
      </span>
      <div className="seg" role="group" aria-label="Kind">
        {kinds.map(([k, label]) => (
          <button key={k} type="button" className={filters.kind === k ? 'on' : ''} aria-pressed={filters.kind === k} onClick={() => onChange({ kind: k })}>
            {label}
          </button>
        ))}
      </div>
      <label className="sort">
        <span>Sort by</span>
        <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as Filters['sort'] })}>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>
  );
}
