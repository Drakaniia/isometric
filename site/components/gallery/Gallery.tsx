'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '../SettingsProvider';
import type { Filters } from '@/lib/settings';
import { FILTER_DEFAULTS, filtersFrom, toQuery } from '@/lib/settings';
import { library, query, categoryCounts } from '@/lib/library';
import Sidebar from './Sidebar';
import Panel from './Panel';
import Grid from './Grid';
import Toolbar from './Toolbar';
import Header from '../Header';
import SearchBox from './SearchBox';

const idFromPath = (p: string | null): string | null => {
  const m = /\/gallery\/([^/]+)\/?$/.exec(p || '');
  return m && library.some((d) => d.id === m[1]) ? m[1] : null;
};

export default function Gallery() {
  const { settings, set, ready } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const openId = idFromPath(pathname);
  const [filters, setFilters] = useState<Filters>(FILTER_DEFAULTS);
  const [collapsed, setCollapsed] = useState(false);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    setFilters(filtersFrom(new URLSearchParams(window.location.search)));
    setFiltersReady(true);
    const onPop = () => setFilters(filtersFrom(new URLSearchParams(window.location.search)));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const qs = toQuery(settings, filters);

  // Keep the URL shareable: settings and filters live in the query string.
  useEffect(() => {
    if (!ready || !filtersReady) return;
    const want = `${pathname}${qs}`;
    if (`${window.location.pathname}${window.location.search}` !== want) window.history.replaceState(window.history.state, '', want);
  }, [qs, pathname, ready, filtersReady]);

  const patchFilters = useCallback((p: Partial<Filters>) => setFilters((f) => ({ ...f, page: 1, ...p })), []);
  const open = useCallback((id: string | null) => router.push(id ? `/gallery/${id}/${qs}` : `/gallery/${qs}`, { scroll: false }), [router, qs]);

  const result = useMemo(() => query(filters), [filters]);
  const cats = useMemo(() => categoryCounts(), []);
  const drawing = openId ? library.find((d) => d.id === openId) || null : null;

  // Escape closes the open drawing.
  useEffect(() => {
    if (!drawing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target as HTMLElement)?.closest?.('input,textarea,select')) open(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawing, open]);

  return (
    <>
      <Header search={<SearchBox value={filters.q} onChange={(q) => patchFilters({ q })} total={library.length} />} />
      <div className={collapsed ? 'gallery collapsed' : 'gallery'}>
        <Sidebar cats={cats} active={filters.cat} onPick={(cat) => patchFilters({ cat })} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <Panel drawing={drawing} settings={settings} set={set} onClose={() => open(null)} />
        <main className="results" aria-label="Drawings">
          <div className="intro">
            <h1>Isometric drawings</h1>
            <p>
              {library.length} free drawings in Stroke, Two-tone, Duotone, Fill and Anatomy, or in your own colours. Point at one to move it, open
              one to copy it. Every one came from a single <code>/isometric</code> prompt.
            </p>
          </div>
          <Toolbar filters={filters} total={result.total} onChange={patchFilters} />
          <Grid items={result.items} settings={settings} openId={openId} onOpen={open} />
          {result.total === 0 && (
            <p className="empty">
              No drawings match “{filters.q}”. <button type="button" className="link" onClick={() => patchFilters({ q: '', cat: 'all', kind: 'all' })}>Clear filters</button>
            </p>
          )}
          {result.pages > 1 && (
            <nav className="pager" aria-label="Pages">
              <button type="button" disabled={result.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: result.page - 1 }))}>Previous</button>
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" className={n === result.page ? 'on' : ''} aria-current={n === result.page ? 'page' : undefined} onClick={() => setFilters((f) => ({ ...f, page: n }))}>
                  {n}
                </button>
              ))}
              <button type="button" disabled={result.page >= result.pages} onClick={() => setFilters((f) => ({ ...f, page: result.page + 1 }))}>Next</button>
            </nav>
          )}
        </main>
      </div>
    </>
  );
}
