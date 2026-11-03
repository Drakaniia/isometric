'use client';

import type { CategoryCount } from '@/lib/library';
import { Panel as PanelIcon } from '../icons';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  cats: CategoryCount[];
  active: string;
  onPick: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ cats, active, onPick, collapsed, onToggle }: Props) {
  return (
    <aside className="side" aria-label="Categories">
      <div className="side-head">
        {!collapsed && <span className="label">Categories</span>}
        <button type="button" className="icon-btn sm" onClick={onToggle} aria-label={collapsed ? 'Show categories' : 'Hide categories'} aria-expanded={!collapsed}>
          <PanelIcon />
        </button>
      </div>
      {!collapsed && (
        <ul className="cats">
          {cats.map((c) => (
            <li key={c.id}>
              <button type="button" className={active === c.id ? 'cat on' : 'cat'} aria-pressed={active === c.id} onClick={() => onPick(c.id)}>
                <CategoryIcon id={c.id} />
                <span className="cat-name">{c.label}</span>
                <span className="count">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
