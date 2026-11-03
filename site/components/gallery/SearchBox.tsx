'use client';

import { useEffect, useRef } from 'react';
import { Search } from '../icons';

export default function SearchBox({ value, onChange, total }: { value: string; onChange: (v: string) => void; total: number }) {
  const ref = useRef<HTMLInputElement>(null);
  // "/" focuses search, as on most galleries.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !t.closest('input,textarea,select,[contenteditable]')) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <label className="search">
      <Search />
      <span className="sr">Search drawings</span>
      <input ref={ref} type="search" value={value} placeholder={`Search ${total} drawings`} onChange={(e) => onChange(e.target.value)} />
      <kbd aria-hidden="true">/</kbd>
    </label>
  );
}
