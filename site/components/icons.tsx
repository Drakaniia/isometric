/** Small UI glyphs (lines only, currentColor). */
const P = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const Sun = () => (
  <svg {...P}><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></svg>
);
export const Moon = () => (
  <svg {...P}><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" /></svg>
);
export const Search = () => (
  <svg {...P}><circle cx="7" cy="7" r="4.6" /><path d="m10.4 10.4 3.6 3.6" /></svg>
);
export const Reset = () => (
  <svg {...P}><path d="M2.6 8a5.4 5.4 0 1 0 1.6-3.8" /><path d="M2.4 2.4v2.8h2.8" /></svg>
);
export const Close = () => (
  <svg {...P}><path d="m4 4 8 8M12 4l-8 8" /></svg>
);
export const Copy = () => (
  <svg {...P}><rect x="5.2" y="5.2" width="8.3" height="8.3" rx="1.6" /><path d="M10.8 5.2V3.8a1.3 1.3 0 0 0-1.3-1.3H3.8a1.3 1.3 0 0 0-1.3 1.3v5.7a1.3 1.3 0 0 0 1.3 1.3h1.4" /></svg>
);
export const Download = () => (
  <svg {...P}><path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M2.8 13.5h10.4" /></svg>
);
export const Code = () => (
  <svg {...P}><path d="M5.6 4.4 2 8l3.6 3.6M10.4 4.4 14 8l-3.6 3.6" /></svg>
);
export const Quote = () => (
  <svg {...P}><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2Z" /><path d="M5 6.2h6M5 8.2h4" /></svg>
);
export const Panel = () => (
  <svg {...P}><rect x="2" y="2.5" width="12" height="11" rx="1.8" /><path d="M6 2.5v11" /></svg>
);
export const Pointer = () => (
  <svg {...P}><path d="m3 3 3.6 10 1.6-4.4L12.6 7Z" /><path d="M10.6 1.6v1.6M13.6 3.6l-1.2 1.1M14.4 6.6h-1.6" /></svg>
);
export const Chevron = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <svg {...P}>{dir === 'right' ? <path d="m6 3.5 4.5 4.5L6 12.5" /> : <path d="M10 3.5 5.5 8l4.5 4.5" />}</svg>
);
