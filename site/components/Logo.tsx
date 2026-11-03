/** The mark: one isometric cube drawn in ink with the accent top. */
export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.6 20.2 7.3 12 12 3.8 7.3Z" fill="var(--accent)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.8 7.3 12 12v9.4L3.8 16.7Z" fill="var(--tile)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M20.2 7.3 12 12v9.4l8.2-4.7Z" fill="var(--shade)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
