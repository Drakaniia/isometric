/** Line glyphs for the category list. */
const P = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

const paths: Record<string, React.ReactNode> = {
  all: <><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" /><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" /><rect x="9" y="9" width="4.5" height="4.5" rx="1" /></>,
  shapes: <><circle cx="5" cy="5" r="2.5" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" /><path d="M5 9.2 7.6 13.5H2.4Z" /><path d="m9 9 4.5 4.5M13.5 9 9 13.5" /></>,
  data: <><ellipse cx="8" cy="4" rx="5" ry="1.8" /><path d="M3 4v8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8" /></>,
  code: <path d="M5.6 4.4 2 8l3.6 3.6M10.4 4.4 14 8l-3.6 3.6" />,
  ai: <><path d="M8 2.2v1.4M8 12.4v1.4M2.2 8h1.4M12.4 8h1.4" /><path d="M8 5.2 9 7l1.8 1L9 9l-1 1.8L7 9 5.2 8 7 7Z" /></>,
  files: <><path d="M4 2.5h5l3 3v8H4Z" /><path d="M9 2.5v3h3" /></>,
  interface: <><rect x="2.2" y="3" width="11.6" height="10" rx="1.6" /><path d="M2.2 5.8h11.6M5 8.5h3" /></>,
  charts: <path d="M3 13.5V9M6.5 13.5V5M10 13.5V7.5M13.5 13.5V3" />,
  commerce: <><path d="M2 3h2l1.5 7.5h7L14 5.5H5" /><circle cx="6.5" cy="13" r="1" /><circle cx="11.5" cy="13" r="1" /></>,
  logistics: <><rect x="1.8" y="4.5" width="7.5" height="6" rx=".8" /><path d="M9.3 6.5h2.6l2.2 2.4v1.6H9.3" /><circle cx="4.5" cy="12" r="1.3" /><circle cx="11.5" cy="12" r="1.3" /></>,
  industry: <path d="M2 13.5V7l3.5 2V7L9 9V4.5h2.5V13.5ZM2 13.5h12" />,
  communication: <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2Z" />,
  media: <><rect x="2" y="3.5" width="12" height="9" rx="1.6" /><path d="m6.8 6 3.2 2-3.2 2Z" /></>,
  time: <><circle cx="8" cy="8" r="5.6" /><path d="M8 4.8V8l2.2 1.4" /></>,
  status: <path d="M8 2 13 4v4.2c0 3-2.2 4.8-5 5.8-2.8-1-5-2.8-5-5.8V4Z" />,
  arrows: <path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5" />,
  people: <><circle cx="8" cy="5.4" r="2.6" /><path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" /></>,
  health: <path d="M8 13.4S2.5 10.2 2.5 6.3A2.9 2.9 0 0 1 8 4.8a2.9 2.9 0 0 1 5.5 1.5c0 3.9-5.5 7.1-5.5 7.1Z" />,
};

export function CategoryIcon({ id }: { id: string }) {
  return <svg {...P}>{paths[id] || paths.all}</svg>;
}
