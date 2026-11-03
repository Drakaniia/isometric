/** Tiny models for the panel's buttons (style swatches, facing, pose). */
import type { Drawing } from '@kit';
import { cbox, prism, box } from '@kit';

/** A house: the same mark Overflow-style switchers use, so styles compare at a glance. */
export const house: Drawing = {
  id: 'mini-house',
  name: 'House',
  category: 'shapes',
  tags: [],
  kind: 'icon',
  prompt: '',
  description: 'A small house.',
  createdAt: '2026-01-01',
  parts: [
    cbox(0, 0, 0, [2, 1.4, 2], {
      decals: { front: [{ t: 'rect', x: 0.7, y: 0.55, w: 0.6, h: 0.85, r: 0.05, fill: 'detail', stroke: true }] },
    }),
    prism([0, 1.4, -1.1], [[-1.15, 0], [1.15, 0], [0, 1.1]], 2.2, { axis: 'z', role: 'accent' }),
  ],
};

/** A tablet with a lit screen: reads clearly standing, lying or as drawn. */
export const tablet: Drawing = {
  id: 'mini-tablet',
  name: 'Tablet',
  category: 'shapes',
  tags: [],
  kind: 'icon',
  prompt: '',
  description: 'A tablet.',
  createdAt: '2026-01-01',
  pose: 'standing',
  parts: [
    box([0, 0, 0], [2.4, 1.8, 0.16], {
      r: 0.14,
      axis: 'z',
      decals: { front: [{ t: 'rect', x: 0.14, y: 0.14, w: 2.12, h: 1.52, r: 0.06, fill: 'accent' }] },
    }),
    box([0.4, 0, 0.16], [1.6, 0.1, 0.5], { role: 'detail', only: 'standing' }),
  ],
};
