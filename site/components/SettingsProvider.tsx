'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Settings } from '@/lib/settings';
import { DEFAULTS, sanitize, loadStored, store, settingsFromParams } from '@/lib/settings';

interface Ctx {
  settings: Settings;
  set: (patch: Partial<Settings> | ((s: Settings) => Partial<Settings>)) => void;
  /** True once stored and URL settings have been applied (after hydration). */
  ready: boolean;
}

const SettingsContext = createContext<Ctx | null>(null);

export function useSettings(): Ctx {
  const c = useContext(SettingsContext);
  if (!c) throw new Error('useSettings outside SettingsProvider');
  return c;
}

/** Holds the appearance settings for the whole site; the theme drives the page too. */
export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const stored = sanitize(loadStored());
    const fromUrl = sanitize(settingsFromParams(new URLSearchParams(window.location.search)), stored);
    setSettings(fromUrl);
    setReady(true);
    const restore = () => setSettings((s) => sanitize(settingsFromParams(new URLSearchParams(window.location.search)), s));
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = settings.theme;
    if (first.current) { first.current = false; return; }
    store(settings);
  }, [settings, ready]);

  const set = useCallback<Ctx['set']>((patch) => {
    setSettings((s) => {
      const p = typeof patch === 'function' ? patch(s) : patch;
      return { ...s, ...p, custom: { ...s.custom, ...(p.custom || {}) } };
    });
  }, []);

  const value = useMemo(() => ({ settings, set, ready }), [settings, set, ready]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
