'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Drawing, RenderOptions } from '@kit';
import { render } from '@kit';
import { framesFor, prefersReducedMotion } from '@/lib/motion';

interface Props {
  drawing: Drawing;
  opts: RenderOptions;
  /** Unique per instance on the page; scopes the SVG's style rules. */
  uid: string;
  /** Play the drawing's motion (hover, focus or autoplay). */
  playing?: boolean;
  className?: string;
  decorative?: boolean;
  style?: React.CSSProperties;
}

/** One drawing, rendered by the kit. Re-renders whenever the settings change. */
export default function DrawingView({ drawing, opts, uid, playing = false, className, decorative, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useMemo(() => render(drawing, { ...opts, id: uid, decorative }).svg, [drawing, opts, uid, decorative]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!playing || !drawing.motion || prefersReducedMotion()) {
      if (el.innerHTML !== svg) el.innerHTML = svg;
      return;
    }
    const frames = framesFor(drawing, { ...opts, decorative }, uid);
    const dur = drawing.motion.duration * 1000;
    let raf = 0;
    let last = -1;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (prefersReducedMotion()) { el.innerHTML = svg; return; }
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) { raf = requestAnimationFrame(tick); return; }
      const k = Math.floor((((now - t0) % dur) / dur) * frames.length);
      if (k !== last) {
        el.innerHTML = frames[k];
        last = k;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.innerHTML = svg;
    };
  }, [playing, drawing, opts, uid, svg, decorative]);

  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}
