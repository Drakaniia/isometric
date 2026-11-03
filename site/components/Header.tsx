'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useSettings } from './SettingsProvider';
import { Sun, Moon } from './icons';

export default function Header({ search }: { search?: React.ReactNode }) {
  const path = usePathname() || '/';
  const { settings, set } = useSettings();
  const dark = settings.theme === 'dark';
  const on = (p: string) => (p === '/' ? path === '/' : path.startsWith(p));
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Link href="/" className="brand" aria-label="Isometric, home">
          <Logo />
          <span>Isometric</span>
        </Link>
        <nav className="tabs" aria-label="Main">
          <Link href="/gallery/" className={on('/gallery') ? 'tab on' : 'tab'} aria-current={on('/gallery') ? 'page' : undefined}>
            Gallery
          </Link>
          <Link href="/" className={on('/') ? 'tab on' : 'tab'} aria-current={on('/') ? 'page' : undefined}>
            The skill
          </Link>
          <Link href="/#install" className="tab">Install</Link>
        </nav>
        <div className="hdr-right">
          {search}
          <button
            type="button"
            className="icon-btn"
            onClick={() => set({ theme: dark ? 'light' : 'dark' })}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={dark ? 'Light theme' : 'Dark theme'}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          <Link href="/#install" className="cta">Get the skill</Link>
        </div>
      </div>
    </header>
  );
}
