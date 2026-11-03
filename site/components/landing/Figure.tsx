'use client';

import { useMemo, useState } from 'react';
import type { RenderOptions } from '@kit';
import { byId } from '@kit';
import DrawingView from '../DrawingView';
import { useSettings } from '../SettingsProvider';

/** A drawing on the landing page that follows the site theme and moves on hover. */
export default function Figure({ id, opts, uid, className }: { id: string; opts: RenderOptions; uid: string; className?: string }) {
  const d = byId(id)!;
  const { settings } = useSettings();
  const [hover, setHover] = useState(false);
  const o = useMemo(() => ({ ...opts, theme: settings.theme }), [opts, settings.theme]);
  return (
    <div className={className} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <DrawingView drawing={d} opts={o} uid={uid} playing={hover} className="fig-art" />
    </div>
  );
}
