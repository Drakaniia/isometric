'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { Drawing } from '@kit';
import type { Settings } from '@/lib/settings';
import { renderOpts } from '@/lib/settings';
import { caption } from '@/lib/library';
import DrawingView from '../DrawingView';

interface Props {
  items: Drawing[];
  settings: Settings;
  openId: string | null;
  onOpen: (id: string) => void;
}

export default function Grid({ items, settings, openId, onOpen }: Props) {
  const opts = useMemo(() => renderOpts(settings), [settings]);
  return (
    <ul className="grid" style={{ '--cols': settings.columns } as React.CSSProperties}>
      {items.map((d) => (
        <Tile key={d.id} d={d} opts={opts} settings={settings} open={openId === d.id} onOpen={onOpen} />
      ))}
    </ul>
  );
}

const Tile = memo(function Tile({ d, opts, settings, open, onOpen }: { d: Drawing; opts: ReturnType<typeof renderOpts>; settings: Settings; open: boolean; onOpen: (id: string) => void }) {
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!settings.autoplay || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [settings.autoplay]);

  const scene = d.kind === 'scene';
  const maxW = scene ? settings.size * 2.5 : settings.size;
  const label = caption(d, settings);
  return (
    <li ref={ref} className={scene ? 'tile scene' : 'tile'}>
      <button
        type="button"
        className={open ? 'tile-btn on' : 'tile-btn'}
        aria-pressed={open}
        aria-label={`${label}. ${d.motion?.label ? `Moves: ${d.motion.label}. ` : ''}Open`}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => onOpen(d.id)}
      >
        {d.motion && <span className="dot" aria-hidden="true" title="Moves on hover" />}
        <DrawingView
          drawing={d}
          opts={opts}
          uid={`t-${d.id}`}
          decorative
          playing={hover || (settings.autoplay && visible)}
          className="tile-art"
          style={{ maxWidth: maxW }}
        />
        {settings.names && <span className="tile-name">{label}</span>}
      </button>
    </li>
  );
});
