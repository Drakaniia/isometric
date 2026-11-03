import type { Metadata, Viewport } from 'next';
import { Inter, EB_Garamond } from 'next/font/google';
import SettingsProvider from '@/components/SettingsProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = EB_Garamond({ subsets: ['latin'], variable: '--font-serif', display: 'swap', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: { default: 'Isometric · a skill for Claude Code', template: '%s · Isometric' },
  description:
    'Name a page in one line and Claude draws it in isometric: login pages, dashboards, devices and icons in Stroke, Two-tone, Duotone, Fill, Anatomy or your own colours.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

// Set the theme before first paint (URL wins over storage), so dark mode never flashes light.
const themeBoot = `try{var q=new URLSearchParams(location.search).get('theme');var t=q||localStorage.getItem('isometric.theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
