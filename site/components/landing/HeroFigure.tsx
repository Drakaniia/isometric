'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { StyleId, Facing } from '@kit';
import { STYLES, STYLE_IDS, byId } from '@kit';
import DrawingView from '../DrawingView';
import { useSettings } from '../SettingsProvider';

/** The live hero: one drawing, a style switcher and a facing toggle. */
export default function HeroFigure({ id = 'login-page' }: { id?: string }) {
  const d = byId(id)!;
  const { settings } = useSettings();
  const [style, setStyle] = useState<StyleId>('anatomy');
  const [facing, setFacing] = useState<Facing>('right');
  const [hover, setHover] = useState(false);
  const opts = useMemo(() => ({ style, theme: settings.theme, facing, weight: 1 as const }), [style, settings.theme, facing]);
  return (
    <figure className="hero-fig" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="hero-stage">
        <DrawingView drawing={d} opts={opts} uid="hero" playing={hover} className="hero-art" />
        <span className="corner tl">Fig. 1</span>
        <span className="corner tr">{d.name}</span>
        <span className="corner bl">Point at it: {d.motion?.label}</span>
        <span className="corner br">{STYLES[style].label} · facing {facing}</span>
      </div>
      <div className="hero-ctl">
        <div className="seg" role="radiogroup" aria-label="Style">
          {STYLE_IDS.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={style === s} className={style === s ? 'on' : ''} onClick={() => setStyle(s)}>
              {STYLES[s].label}
            </button>
          ))}
        </div>
        <div className="seg" role="radiogroup" aria-label="Facing">
          {(['right', 'left'] as Facing[]).map((f) => (
            <button key={f} type="button" role="radio" aria-checked={facing === f} className={facing === f ? 'on' : ''} onClick={() => setFacing(f)}>
              {f === 'right' ? 'Right' : 'Left'}
            </button>
          ))}
        </div>
        <Link className="small-link" href={`/gallery/${d.id}/?style=${style}${facing === 'left' ? '&facing=left' : ''}`}>
          Open in the gallery →
        </Link>
      </div>
      <figcaption>
        From one line: <code>{d.prompt}</code>
      </figcaption>
    </figure>
  );
}
