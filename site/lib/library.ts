/** The drawing library as the site sees it: search, filter, sort, paginate. */
import type { Drawing, CategoryId } from '@kit';
import { library, CATEGORIES, STYLES } from '@kit';
import type { Filters, Settings } from './settings';

export { library };

export const PAGE_SIZE = 20;

export interface CategoryCount {
  id: CategoryId | 'all';
  label: string;
  count: number;
}

/** Only categories that have drawings appear. */
export function categoryCounts(): CategoryCount[] {
  const out: CategoryCount[] = [{ id: 'all', label: 'All', count: library.length }];
  for (const c of CATEGORIES) {
    const n = library.filter((d) => d.category === c.id).length;
    if (n) out.push({ id: c.id, label: c.label, count: n });
  }
  return out;
}

export function matches(d: Drawing, q: string): boolean {
  if (!q) return true;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = [d.name, d.id, d.category, ...d.tags].join(' ').toLowerCase();
  return words.every((w) => hay.includes(w));
}

export function query(f: Filters): { items: Drawing[]; total: number; pages: number; page: number } {
  let items = library.filter((d) => (f.cat === 'all' || d.category === f.cat) && (f.kind === 'all' || d.kind === f.kind) && matches(d, f.q));
  items = [...items].sort((a, b) =>
    f.sort === 'name' ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name),
  );
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page), pages);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, pages, page };
}

export const caption = (d: Drawing, s: Settings): string => (d.kind === 'scene' ? `${d.name}, ${STYLES[s.style].label}` : d.name);
