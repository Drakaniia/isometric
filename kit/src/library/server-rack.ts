import { defineDrawing, box, slots } from '../build.js';
import type { Decal, Part } from '../model.js';

/**
 * Server rack: an open cabinet with six units. The lit unit slides out on
 * its rails; a small UPS stands beside the rack.
 */
const W = 2.8, H = 5.4, D = 2.5, T = 0.14;
const inner = W - 2 * T;
const unitH = 0.62, gap = 0.08;

function unit(i: number, kind: 'server' | 'storage' | 'switch', o: { accent?: boolean; group?: string } = {}): Part {
  const y = T + 0.25 + i * (unitH + gap);
  const front: Decal[] = [];
  if (kind === 'server') {
    front.push(slots(0.25, 0.14, 9, 0.12, unitH - 0.28, 'v'));
    front.push({ t: 'rect', x: 1.5, y: 0.17, w: 0.62, h: 0.26, r: 0.04, fill: 'face', stroke: 'soft' });
    front.push({ t: 'circle', cx: inner - 0.3, cy: 0.22, r: 0.05, fill: o.accent ? 'face' : 'accent' });
    front.push({ t: 'circle', cx: inner - 0.3, cy: 0.4, r: 0.05, fill: 'ink' });
  } else if (kind === 'storage') {
    for (let k = 0; k < 4; k++) {
      front.push({ t: 'rect', x: 0.18 + k * 0.5, y: 0.12, w: 0.42, h: unitH - 0.24, r: 0.04, fill: 'face', stroke: 'soft' });
      front.push({ t: 'circle', cx: 0.27 + k * 0.5, cy: 0.22, r: 0.03, fill: 'ink' });
    }
  } else {
    for (let k = 0; k < 8; k++) front.push({ t: 'rect', x: 0.22 + k * 0.24, y: 0.22, w: 0.16, h: 0.14, r: 0.02, fill: 'ink' });
    front.push({ t: 'circle', cx: inner - 0.22, cy: 0.29, r: 0.05, fill: 'accent' });
  }
  return box([T + 0.04, y, T + 0.25], [inner - 0.08, unitH, D - T - 0.3], {
    id: `unit${i}`, r: 0.04, axis: 'z', role: o.accent ? 'accent' : 'body', group: o.group, decals: { front },
  });
}

export default defineDrawing({
  id: 'server-rack',
  name: 'Server rack',
  category: 'data',
  tags: ['server', 'rack', 'data center', 'hosting', 'infrastructure', 'cloud', 'backend', 'hardware'],
  kind: 'scene',
  prompt: '/isometric create an isometric server rack for the infrastructure section of my landing page',
  description: 'An open server cabinet holding servers, a storage shelf and a network switch. One server slides out on its rails. A small UPS stands beside it.',
  createdAt: '2026-11-03',
  parts: [
    // Cabinet: plinth, back, two sides, roof. Open at the front.
    box([0, 0, 0], [W, T, D], { id: 'floor', role: 'face' }),
    box([0, T, 0], [W, H - 2 * T, T], { id: 'back', role: 'face' }),
    box([0, T, T], [T, H - 2 * T, D - T], {
      id: 'left', role: 'body',
    }),
    box([W - T, T, T], [T, H - 2 * T, D - T], {
      id: 'right', role: 'body',
      decals: { right: [slots(0.35, 0.5, 6, 0.28, 1.0, 'v'), slots(0.35, 3.4, 6, 0.28, 1.0, 'v')] },
    }),
    box([0, H - T, 0], [W, T, D], {
      id: 'roof', r: 0.06, role: 'body',
      decals: { top: [{ t: 'rect', x: 0.4, y: 0.4, w: W - 0.8, h: D - 0.8, r: 0.1, fill: 'face', stroke: 'soft' }, slots(0.6, 0.7, 8, 0.2, D - 1.4, 'v')] },
    }),
    unit(0, 'storage'),
    unit(1, 'storage'),
    unit(2, 'server'),
    unit(3, 'server', { accent: true, group: 'drawer' }),
    unit(4, 'server'),
    unit(5, 'switch'),
    // UPS beside the rack.
    box([W + 0.45, 0, 0.9], [0.9, 1.5, 1.5], {
      id: 'ups', r: 0.08, role: 'body',
      decals: {
        front: [
          { t: 'rect', x: 0.18, y: 0.2, w: 0.54, h: 0.3, r: 0.04, fill: 'face', stroke: 'soft' },
          { t: 'circle', cx: 0.45, cy: 0.8, r: 0.12, fill: 'detail', stroke: 'soft' },
          slots(0.2, 1.1, 5, 0.12, 0.25, 'v'),
        ],
      },
    }),
  ],
  motion: {
    duration: 2.6,
    label: 'a server slides out on its rails',
    tracks: [{ group: 'drawer', t: [0, 0, 1.25], from: 0.05, to: 0.75, ease: 'inOut' }],
  },
});
