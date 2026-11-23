/**
 * Commerce scenes: a high-street shop front with a striped awning, a
 * supermarket checkout lane, a grocery aisle with a rolling cart, a pair of
 * vending machines and a bank-wall ATM.
 */
import { defineDrawing, box, cyl, ball, prism, slots, textLines, grid, tickRing } from '../build.js';
import type { Decal, Part, Role } from '../model.js';

const CREATED = '2026-11-14';
type V3 = [number, number, number];
type Seg = [number, number, number, number];
/** Floor slab thickness shared by every scene. */
const F = 0.2;
const ROLES: Role[] = ['face', 'detail', 'body'];
const pick = (k: number, roles: Role[] = ROLES): Role => roles[((k % roles.length) + roles.length) % roles.length];

/* ---------------------------------------------------------- shared parts */

/** Floor tile joints across a top face. */
const tiles = (w: number, d: number, step: number, z0 = 0): Decal => ({
  t: 'segs', stroke: 'soft',
  segs: [
    ...Array.from({ length: Math.ceil(w / step) - 1 }, (_, k): Seg => [step * (k + 1), z0 + 0.02, step * (k + 1), d - 0.02]),
    ...Array.from({ length: Math.ceil((d - z0) / step) - 1 }, (_, k): Seg => [0.02, z0 + step * (k + 1), w - 0.02, z0 + step * (k + 1)]),
  ],
});

/** A drinks can: rim ring and ring pull on the lid. */
const can = (id: string, at: V3, r: number, h: number, role: Role, group?: string): Part =>
  cyl(at, r, h, {
    id, role, group, n: 20,
    decals: { top: [
      { t: 'circle', cx: r, cy: r, r: r * 0.78, stroke: 'soft' },
      { t: 'rect', x: r * 0.72, y: r * 0.3, w: r * 0.56, h: r * 0.26, r: r * 0.1, fill: 'ink' },
    ] },
  });

/** A bottle: body, tapered shoulder and cap. */
function bottle(id: string, at: V3, r: number, h: number, role: Role, group?: string): Part[] {
  const [x, y, z] = at, b = h * 0.6, s = h * 0.28, c = h - b - s;
  return [
    cyl([x, y, z], r, b, { id: `${id}-body`, role, group, n: 18 }),
    cyl([x, y + b, z], r, s, { id: `${id}-neck`, role, group, r2: r * 0.42, n: 18 }),
    cyl([x, y + b + s, z], r * 0.44, c, { id: `${id}-cap`, role: 'ink', group, n: 12 }),
  ];
}

/** A jar with a screw lid. */
function jar(id: string, at: V3, r: number, h: number, role: Role): Part[] {
  const [x, y, z] = at;
  return [
    cyl([x, y, z], r, h, { id, role, n: 20 }),
    cyl([x, y + h, z], r * 1.04, h * 0.22, { id: `${id}-lid`, role: 'ink', n: 20, decals: { top: [{ t: 'circle', cx: r * 1.04, cy: r * 1.04, r: r * 0.7, stroke: 'soft' }] } }),
  ];
}

/** A cereal box: header band, bowl roundel, a line of copy. */
const cereal = (id: string, at: V3, size: V3, role: Role, group?: string): Part => {
  const [w, h] = size;
  return box(at, size, {
    id, role, group,
    decals: { front: [
      { t: 'rect', x: w * 0.1, y: h * 0.08, w: w * 0.8, h: h * 0.18, r: 0.02, fill: 'ink' },
      { t: 'circle', cx: w / 2, cy: h * 0.6, r: Math.min(w, h) * 0.26, fill: 'face', stroke: 'soft' },
      { t: 'bar', x: w * 0.2, y: h * 0.88, w: w * 0.6, h: 0.03, fill: 'soft' },
    ] },
  });
};

/** A gable-top milk carton. */
function milk(id: string, at: V3, size: V3, role: Role): Part[] {
  const [x, y, z] = at, [w, h, d] = size, g = d * 0.4;
  return [
    box(at, size, {
      id, role,
      decals: { front: [
        { t: 'rect', x: w * 0.15, y: h * 0.22, w: w * 0.7, h: h * 0.38, r: 0.02, fill: 'face', stroke: 'soft' },
        { t: 'circle', cx: w / 2, cy: h * 0.41, r: w * 0.12, fill: 'detail' },
      ] },
    }),
    prism([x, 0, 0], [[z, y + h], [z + d, y + h], [z + d / 2, y + h + g]], w, { id: `${id}-gable`, role, axis: 'x' }),
    box([x, y + h + g, z + d / 2 - 0.025], [w, 0.06, 0.05], { id: `${id}-fin`, role }),
  ];
}

/** A puffy bag of chips. */
const chips = (id: string, at: V3, size: V3, role: Role, group?: string): Part => {
  const [w, h, d] = size;
  return box(at, size, {
    id, role, group, r: Math.min(d, h) * 0.3, axis: 'x',
    decals: { front: [
      { t: 'rect', x: w * 0.15, y: h * 0.14, w: w * 0.7, h: h * 0.14, r: 0.02, fill: 'ink' },
      { t: 'circle', cx: w / 2, cy: h * 0.58, r: w * 0.22, fill: 'face', stroke: 'soft' },
    ] },
  });
};

/** A shipping carton with tape and a label. */
const carton = (id: string, at: V3, size: V3, role: Role): Part => {
  const [w, h, d] = size;
  return box(at, size, {
    id, role, r: 0.02,
    decals: {
      top: [{ t: 'rect', x: w / 2 - 0.05, y: 0, w: 0.1, h: d, fill: 'detail', stroke: 'soft' }],
      front: [
        { t: 'rect', x: w * 0.12, y: h * 0.22, w: w * 0.3, h: h * 0.3, r: 0.015, fill: 'face', stroke: 'soft' },
        { t: 'bar', x: w * 0.14, y: h * 0.33, w: w * 0.2, h: 0.03, fill: 'ink' },
      ],
    },
  });
};

/** A paper carrier bag with rope handles. */
function carrier(id: string, at: V3, size: V3, role: Role): Part[] {
  const [x, y, z] = at, [w, h, d] = size, hz = z + d / 2 - 0.015, top = y + h;
  return [
    box(at, size, {
      id, role,
      decals: {
        front: [{ t: 'segs', stroke: 'soft', segs: [[0.02, 0.08, w - 0.02, 0.08]] }, { t: 'circle', cx: w / 2, cy: h * 0.5, r: Math.min(w, h) * 0.18, stroke: 'soft' }],
        top: [{ t: 'rect', x: 0.03, y: 0.03, w: w - 0.06, h: d - 0.06, r: 0.01, fill: 'ink' }],
      },
    }),
    box([x + w * 0.25, top, hz], [0.03, 0.16, 0.03], { id: `${id}-h0`, role: 'ink' }),
    box([x + w * 0.72, top, hz], [0.03, 0.16, 0.03], { id: `${id}-h1`, role: 'ink' }),
    box([x + w * 0.25, top + 0.16, hz], [w * 0.5, 0.03, 0.03], { id: `${id}-h2`, role: 'ink' }),
  ];
}

/* ------------------------------------------------------------ shop front */
const FZ = 2.0, SILL = 0.8, HEAD = 3.0, GLZ = 1.86, TOP = 4.6;
const AW_X0 = 0.6, AW_W = 0.5, AW_N = 8, AW_OUT = 2.75;
// Pivot on the canopy's top edge, so folding up never swings it into the fascia.
const AW_PIVOT: V3 = [0, 3.05, FZ];
const BLADE_PIVOT: V3 = [7.03, 2.6, 0];

/** One stripe of the awning: the sloped canopy and its hanging valance. */
function awningStripe(i: number): Part[] {
  const x = AW_X0 + i * AW_W, role: Role = i % 2 ? 'face' : 'accent';
  return [
    prism([x, 0, 0], [[FZ, 3.05], [AW_OUT, 2.72], [AW_OUT, 2.64], [FZ, 2.97]], AW_W, { id: `awning-${i}`, role, axis: 'x', group: 'awning' }),
    box([x, 2.42, AW_OUT], [AW_W, 0.3, 0.05], {
      id: `valance-${i}`, role, group: 'awning',
      decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.02, 0.24, AW_W - 0.02, 0.24]] }] },
    }),
  ];
}

const pendant = (id: string, x: number, z: number): Part[] => [
  box([x - 0.01, 2.75, z - 0.01], [0.02, HEAD - 2.75, 0.02], { id: `${id}-cord`, role: 'ink' }),
  cyl([x, 2.6, z], 0.16, 0.15, { id: `${id}-shade`, role: 'detail', r2: 0.04, n: 20 }),
];

const goose = (id: string, x: number): Part[] => [
  box([x - 0.03, 4.4, FZ], [0.06, 0.06, 0.45], { id: `${id}-arm`, role: 'ink' }),
  cyl([x, 4.25, FZ + 0.45], 0.14, 0.15, { id: `${id}-shade`, role: 'ink', r2: 0.05, n: 18 }),
];

const brick = (w: number, h: number): Decal[] => [slots(0.05, 0.25, Math.floor((h - 0.3) / 0.25), 0.25, w - 0.1, 'h')];

export const storefront = defineDrawing({
  id: 'storefront',
  name: 'Shop front',
  category: 'commerce',
  tags: ['shop', 'store', 'storefront', 'boutique', 'retail', 'high street', 'awning', 'shop window', 'local business', 'small business', 'commerce'],
  kind: 'scene',
  prompt: '/isometric create a boutique shop front with a striped awning and a dressed display window, for our small-business landing page',
  description: 'A high-street boutique: a dressed display window with a mannequin, a handbag, a hat box and pendant lamps behind the glass, a recessed glass door with an open sign, a sign band lit by gooseneck lamps and a hanging blade sign. A striped awning shades the window and folds up; planters, an A-frame board, carrier bags, a bin and a street lamp stand on the paved pavement beside the kerb.',
  createdAt: CREATED,
  parts: [
    // Pavement and road.
    box([0, 0, 0], [8, F, 4.6], {
      id: 'pavement', role: 'face',
      decals: { top: [
        { t: 'segs', stroke: 'soft', segs: [[0.05, 2.8, 7.95, 2.8], [0.05, 3.6, 7.95, 3.6], ...Array.from({ length: 9 }, (_, k): Seg => [0.8 + k * 0.8, FZ + 0.05, 0.8 + k * 0.8, 4.3])] },
        { t: 'segs', stroke: true, segs: [[0.02, 4.32, 7.98, 4.32]] },
      ] },
    }),
    box([0, 0, 4.6], [8, 0.08, 1.4], { id: 'road', role: 'detail', decals: { top: [{ t: 'segs', stroke: 'face', width: 2, segs: Array.from({ length: 5 }, (_, k): Seg => [0.4 + k * 1.6, 0.85, 1.2 + k * 1.6, 0.85]) }] } }),
    // The building shell.
    box([0.4, F, 0], [7.2, TOP - F, 0.3], {
      id: 'shop-back', role: 'face',
      decals: { front: [{ t: 'rect', x: 0.55, y: 1.75, w: 3.2, h: 1.9, r: 0.03, stroke: 'soft' }, ...textLines(2.4, 2.0, 1.2, [1, 0.7, 0.85], 0.2, 0.07)] },
    }),
    box([0.4, F, 0.3], [0.4, HEAD - F, FZ - 0.3], { id: 'pier-left', role: 'body', decals: { front: [{ t: 'rect', x: 0, y: HEAD - F - 0.3, w: 0.4, h: 0.3, fill: 'detail' }] } }),
    box([0.8, F, 0.3], [3.8, SILL - F, FZ - 0.3], {
      id: 'stall-riser', role: 'body',
      decals: { front: [{ t: 'rect', x: 0.15, y: 0.12, w: 1.65, h: 0.36, r: 0.03, stroke: 'soft' }, { t: 'rect', x: 2.0, y: 0.12, w: 1.65, h: 0.36, r: 0.03, stroke: 'soft' }], top: [{ t: 'segs', stroke: 'soft', segs: [[0.02, 1.62, 3.78, 1.62]] }] },
    }),
    box([4.6, F, 0.3], [0.4, HEAD - F, FZ - 0.3], { id: 'pier-mid', role: 'body', decals: { front: [{ t: 'rect', x: 0, y: HEAD - F - 0.3, w: 0.4, h: 0.3, fill: 'detail' }] } }),
    box([5.0, F, 0.3], [1.2, HEAD - F, 1.5], {
      id: 'door', role: 'face',
      decals: { front: [
        { t: 'rect', x: 0.08, y: 0.22, w: 1.04, h: 2.5, r: 0.02, stroke: true },
        { t: 'rect', x: 0.2, y: 0.36, w: 0.8, h: 1.2, r: 0.02, fill: 'ink' },
        { t: 'rect', x: 0.4, y: 0.62, w: 0.4, h: 0.22, r: 0.02, fill: 'face', stroke: 'soft' },
        { t: 'bar', x: 0.47, y: 0.71, w: 0.26, h: 0.04, fill: 'ink' },
        { t: 'rect', x: 0.22, y: 1.72, w: 0.76, h: 0.07, r: 0.03, fill: 'detail', stroke: true },
        { t: 'rect', x: 0.2, y: 1.95, w: 0.8, h: 0.6, r: 0.02, stroke: 'soft' },
      ] },
    }),
    box([6.2, F, 0.3], [1.4, HEAD - F, FZ - 0.3], {
      id: 'pier-right', role: 'body',
      decals: {
        front: [
          { t: 'rect', x: 0.3, y: 0.45, w: 0.8, h: 1.1, r: 0.03, fill: 'face', stroke: 'soft' },
          ...textLines(0.42, 0.62, 0.56, [1, 0.6, 0.85, 0.5], 0.2, 0.06),
          ...grid(0.08, 1.75, 1, 3, 0.16, 0.1, 0.05, { fill: 'face' }),
          { t: 'rect', x: 0, y: HEAD - F - 0.3, w: 1.4, h: 0.3, fill: 'detail' },
        ],
        right: brick(FZ - 0.3, HEAD - F),
      },
    }),
    box([0.4, HEAD, 0.3], [7.2, TOP - HEAD, FZ - 0.3], { id: 'fascia', role: 'body', decals: { right: brick(FZ - 0.3, TOP - HEAD) } }),
    box([1.0, 3.3, FZ], [5.0, 0.9, 0.1], {
      id: 'sign-band', r: 0.04, axis: 'z', role: 'face',
      decals: { front: [{ t: 'circle', cx: 0.6, cy: 0.45, r: 0.28, stroke: true }, { t: 'circle', cx: 0.6, cy: 0.45, r: 0.12, fill: 'ink' }, { t: 'bar', x: 1.15, y: 0.28, w: 3.0, h: 0.16, fill: 'ink' }, { t: 'bar', x: 1.15, y: 0.56, w: 1.9, h: 0.07, fill: 'soft' }] },
    }),
    box([0.3, TOP, 0.2], [7.4, 0.18, 1.95], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.04, 36, 0.2, 0.1, 'v')] } }),
    ...goose('lamp0', 1.6), ...goose('lamp1', 3.5), ...goose('lamp2', 5.4),
    // The window display.
    box([1.0, 2.2, 0.3], [1.3, 0.05, 0.32], { id: 'wall-shelf', role: 'detail' }),
    ...[0, 1, 2].map((k) => box([1.06 + k * 0.4, 2.25, 0.36], [0.34, 0.12, 0.22], { id: `folded-${k}`, r: 0.02, role: pick(k) })),
    // Display pieces stand close behind the glass so they show under the awning.
    box([1.0, SILL, 1.0], [1.15, 0.3, 0.8], { id: 'plinth-a', r: 0.02, role: 'face' }),
    box([1.15, SILL + 0.3, 1.3], [0.5, 0.38, 0.25], { id: 'handbag', r: 0.08, axis: 'z', role: 'detail', decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.04, 0.12, 0.46, 0.12]] }, { t: 'rect', x: 0.2, y: 0.08, w: 0.1, h: 0.08, r: 0.01, fill: 'ink' }] } }),
    box([1.24, SILL + 0.68, 1.41], [0.04, 0.16, 0.04], { id: 'handbag-h0', role: 'ink' }),
    box([1.52, SILL + 0.68, 1.41], [0.04, 0.16, 0.04], { id: 'handbag-h1', role: 'ink' }),
    box([1.24, SILL + 0.84, 1.41], [0.32, 0.04, 0.04], { id: 'handbag-h2', role: 'ink' }),
    ...bottle('perfume', [1.9, SILL + 0.3, 1.45], 0.08, 0.34, 'body'),
    cyl([2.65, SILL, 1.4], 0.36, 0.5, { id: 'plinth-b', role: 'face', n: 32 }),
    cyl([2.65, SILL + 0.5, 1.4], 0.25, 0.3, { id: 'hat-box', role: 'detail', n: 28 }),
    cyl([2.65, SILL + 0.8, 1.4], 0.27, 0.06, { id: 'hat-lid', role: 'ink', n: 28, decals: { top: [{ t: 'circle', cx: 0.27, cy: 0.27, r: 0.15, fill: 'face' }] } }),
    cyl([3.7, SILL, 1.4], 0.22, 0.05, { id: 'mannequin-base', role: 'ink', n: 20 }),
    cyl([3.7, SILL + 0.05, 1.4], 0.03, 0.45, { id: 'mannequin-pole', role: 'ink', n: 10 }),
    cyl([3.7, SILL + 0.5, 1.4], 0.34, 0.55, { id: 'mannequin-skirt', role: 'detail', r2: 0.15, n: 28 }),
    cyl([3.7, SILL + 1.05, 1.4], 0.15, 0.35, { id: 'mannequin-torso', role: 'detail', r2: 0.21, n: 24 }),
    cyl([3.7, SILL + 1.4, 1.4], 0.05, 0.08, { id: 'mannequin-neck', role: 'face', n: 12 }),
    ball([3.7, SILL + 1.6, 1.4], 0.12, { id: 'mannequin-head', role: 'face' }),
    ...pendant('pendant0', 2.0, 1.2), ...pendant('pendant1', 3.0, 1.0),
    // Glazing: the display window is drawn as its frame so the display stays readable;
    // a bottom rail, a mullion, a transom and a clerestory pane.
    box([0.8, SILL, GLZ - 0.02], [3.8, 0.06, 0.1], { id: 'window-rail', role: 'ink' }),
    box([2.66, SILL + 0.06, GLZ - 0.02], [0.08, 1.69, 0.1], { id: 'mullion', role: 'ink' }),
    box([0.8, 2.55, GLZ - 0.02], [3.8, 0.1, 0.1], { id: 'transom', role: 'ink' }),
    box([0.8, 2.65, GLZ], [3.8, HEAD - 2.65, 0.06], { id: 'pane-top', role: 'glass' }),
    // Awning and blade sign.
    ...Array.from({ length: AW_N }, (_, i) => awningStripe(i)).flat(),
    box([7.0, 2.6, FZ], [0.06, 0.06, 0.95], { id: 'blade-bracket', role: 'ink' }),
    box([7.01, 2.5, 2.3], [0.04, 0.1, 0.04], { id: 'blade-hanger0', role: 'ink', group: 'blade' }),
    box([7.01, 2.5, 2.75], [0.04, 0.1, 0.04], { id: 'blade-hanger1', role: 'ink', group: 'blade' }),
    box([6.97, 1.85, 2.15], [0.12, 0.65, 0.78], {
      id: 'blade-sign', r: 0.06, axis: 'x', role: 'face', group: 'blade',
      decals: { right: [{ t: 'circle', cx: 0.39, cy: 0.28, r: 0.16, stroke: true }, { t: 'circle', cx: 0.39, cy: 0.28, r: 0.07, fill: 'ink' }, { t: 'bar', x: 0.2, y: 0.52, w: 0.38, h: 0.05, fill: 'ink' }] },
    }),
    // Pavement furniture.
    box([4.95, F, FZ], [1.3, 0.08, 0.4], { id: 'door-step', role: 'detail' }),
    box([0.9, F, 2.05], [1.5, 0.4, 0.42], { id: 'planter-left', role: 'face', decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.03, 0.08, 1.47, 0.08]] }] } }),
    ...[1.17, 1.65, 2.13].map((x, k) => ball([x, F + 0.4 + 0.19, 2.26], 0.19, { id: `shrub-l${k}`, role: 'detail' })),
    box([6.4, F, 2.05], [1.0, 0.4, 0.42], { id: 'planter-right', role: 'face', decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.03, 0.08, 0.97, 0.08]] }] } }),
    ...[6.65, 7.15].map((x, k) => ball([x, F + 0.4 + 0.2, 2.26], 0.2, { id: `shrub-r${k}`, role: 'detail' })),
    prism([3.3, 0, 0], [[2.95, F], [3.2, F + 0.95], [3.45, F]], 0.6, { id: 'a-board', role: 'ink', axis: 'x' }),
    ...carrier('bag-a', [2.05, F, 3.5], [0.42, 0.5, 0.22], 'face'),
    ...carrier('bag-b', [2.55, F, 3.55], [0.36, 0.42, 0.2], 'detail'),
    cyl([0.75, F, 3.9], 0.24, 0.75, { id: 'bin', role: 'detail', n: 22 }),
    cyl([0.75, F + 0.75, 3.9], 0.26, 0.06, { id: 'bin-lid', role: 'ink', n: 22, decals: { top: [{ t: 'rect', x: 0.14, y: 0.2, w: 0.24, h: 0.12, r: 0.03, fill: 'face' }] } }),
    cyl([7.4, F, 4.0], 0.14, 0.25, { id: 'lamp-base', role: 'ink', n: 16 }),
    cyl([7.4, F + 0.25, 4.0], 0.05, 3.1, { id: 'lamp-pole', role: 'ink', n: 12 }),
    box([7.25, 3.55, 3.85], [0.3, 0.4, 0.3], { id: 'lamp-lantern', role: 'face', decals: { front: [{ t: 'rect', x: 0.05, y: 0.05, w: 0.2, h: 0.3, r: 0.02, fill: 'detail' }], right: [{ t: 'rect', x: 0.05, y: 0.05, w: 0.2, h: 0.3, r: 0.02, fill: 'detail' }] } }),
    cyl([7.4, 3.95, 4.0], 0.24, 0.2, { id: 'lamp-cap', role: 'ink', r2: 0, n: 16 }),
  ],
  motion: {
    duration: 3.6,
    label: 'the awning folds up and the blade sign swings',
    tracks: [
      { group: 'awning', r: { axis: 'x', deg: -22, pivot: AW_PIVOT }, from: 0.1, to: 0.8, ease: 'inOut' },
      { group: 'blade', r: { axis: 'z', deg: 9, pivot: BLADE_PIVOT }, from: 0, to: 0.6, ease: 'inOut' },
    ],
  },
});

/* --------------------------------------------------------- checkout lane */
const BELT_Y = 1.09;

export const checkoutLane = defineDrawing({
  id: 'checkout-lane',
  name: 'Checkout lane',
  category: 'commerce',
  tags: ['checkout', 'till', 'pos', 'point of sale', 'cashier', 'supermarket', 'grocery', 'card payment', 'contactless', 'scanner', 'receipt', 'retail', 'payments', 'commerce'],
  kind: 'scene',
  prompt: '/isometric create a supermarket checkout lane with groceries on the belt and a customer tapping a card, for our POS payments page',
  description: 'A supermarket checkout lane: groceries ride a conveyor belt behind a divider bar toward a flatbed scanner and scanner tower, with paper bags waiting in the bagging area. On the cashier side a POS monitor, a receipt printer and a stool sit behind the counter, and a lane light marked 4 stands on a pole. A card taps the lit payment terminal on its pole while the receipt prints. A candy rack and a stack of baskets stand on the tiled floor.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.6, F, 4.8], { id: 'floor', role: 'face', decals: { top: [tiles(8.6, 4.8, 0.6), { t: 'segs', stroke: true, segs: [[3.0, 3.6, 4.8, 3.6]] }] } }),
    // Belt counter.
    box([0.6, F, 2.2], [4.2, 0.85, 1.0], {
      id: 'belt-counter', role: 'face',
      decals: { front: [{ t: 'rect', x: 0, y: 0.7, w: 4.2, h: 0.15, fill: 'detail' }, { t: 'rect', x: 0.2, y: 0.12, w: 1.8, h: 0.45, r: 0.03, stroke: 'soft' }, { t: 'rect', x: 2.2, y: 0.12, w: 1.8, h: 0.45, r: 0.03, stroke: 'soft' }] },
    }),
    box([0.6, 1.05, 2.2], [4.2, 0.08, 0.1], { id: 'lip-back', role: 'detail' }),
    box([0.6, 1.05, 3.1], [4.2, 0.08, 0.1], { id: 'lip-front', role: 'detail' }),
    box([0.6, 1.05, 2.3], [4.0, 0.04, 0.8], { id: 'belt', role: 'ink', decals: { top: [slots(0.3, 0.04, 13, 0.3, 0.72, 'v', 'soft')] } }),
    box([4.6, 1.05, 2.3], [0.2, 0.08, 0.8], { id: 'belt-roller', role: 'detail' }),
    box([2.2, BELT_Y, 2.38], [0.1, 0.1, 0.64], { id: 'divider', r: 0.04, axis: 'z', role: 'detail' }),
    // Groceries on the belt.
    ...milk('milk', [0.85, BELT_Y, 2.5], [0.34, 0.55, 0.34], 'face'),
    cereal('cereal', [1.35, BELT_Y, 2.62], [0.6, 0.78, 0.2], 'body'),
    can('can0', [2.56, BELT_Y, 2.55], 0.13, 0.3, 'detail'),
    can('can1', [2.56, BELT_Y + 0.3, 2.55], 0.13, 0.3, 'face'),
    can('can2', [2.56, BELT_Y, 2.85], 0.13, 0.3, 'body'),
    ...bottle('belt-bottle', [3.0, BELT_Y, 2.7], 0.12, 0.7, 'face'),
    box([3.32, BELT_Y, 2.45], [0.68, 0.06, 0.5], { id: 'fruit-tray', role: 'face' }),
    ...[3.44, 3.66, 3.88].flatMap((x, i) => [2.58, 2.81].map((z, j) => ball([x, BELT_Y + 0.06 + 0.11, z], 0.11, { id: `apple${i}${j}`, role: (i + j) % 2 ? 'detail' : 'body' }))),
    box([4.08, BELT_Y, 2.45], [0.48, 0.24, 0.55], { id: 'bread', r: 0.1, axis: 'z', role: 'detail', decals: { top: [{ t: 'segs', stroke: 'soft', segs: [[0.12, 0.1, 0.2, 0.2], [0.12, 0.25, 0.2, 0.35], [0.12, 0.4, 0.2, 0.5]] }] } }),
    // Scanner bed, tower and the jar being scanned.
    box([4.8, F, 2.2], [1.4, 0.85, 1.0], {
      id: 'scanner-bed', role: 'body',
      decals: {
        top: [{ t: 'rect', x: 0.3, y: 0.3, w: 0.8, h: 0.45, r: 0.04, fill: 'ink' }, { t: 'segs', stroke: 'face', segs: [[0.35, 0.52, 1.05, 0.52], [0.7, 0.33, 0.7, 0.72]] }],
        front: [{ t: 'rect', x: 0.15, y: 0.15, w: 1.1, h: 0.4, r: 0.03, stroke: 'soft' }],
        right: [slots(0.15, 0.2, 7, 0.1, 0.4, 'v')],
      },
    }),
    box([5.1, 1.05, 2.22], [0.8, 0.55, 0.14], { id: 'scanner-tower', r: 0.05, axis: 'z', role: 'detail', decals: { front: [{ t: 'rect', x: 0.12, y: 0.1, w: 0.56, h: 0.3, r: 0.04, fill: 'ink' }] } }),
    ...jar('scan-jar', [5.5, 1.05, 2.8], 0.13, 0.3, 'face'),
    // Payment terminal and card.
    cyl([6.05, 1.05, 2.99], 0.03, 0.32, { id: 'terminal-pole', role: 'ink', n: 10 }),
    box([5.83, 1.37, 2.92], [0.44, 0.62, 0.14], {
      id: 'terminal', r: 0.06, axis: 'z', role: 'accent',
      decals: { front: [{ t: 'rect', x: 0.06, y: 0.06, w: 0.32, h: 0.2, r: 0.02, fill: 'ink' }, ...grid(0.08, 0.32, 3, 3, 0.08, 0.06, 0.03, { fill: 'face' })] },
    }),
    box([5.88, 1.6, 3.32], [0.34, 0.22, 0.02], {
      id: 'card', r: 0.03, axis: 'z', role: 'face', group: 'card',
      decals: { front: [{ t: 'rect', x: 0.05, y: 0.06, w: 0.07, h: 0.05, r: 0.01, fill: 'detail', stroke: 'soft' }, { t: 'bar', x: 0.05, y: 0.15, w: 0.2, h: 0.025, fill: 'ink' }] },
    }),
    // Bagging area.
    box([6.2, F, 2.2], [1.9, 0.72, 1.0], { id: 'bagging-shelf', role: 'face', decals: { front: [{ t: 'rect', x: 0, y: 0.57, w: 1.9, h: 0.15, fill: 'detail' }] } }),
    carrier('bag-a', [6.35, 0.92, 2.35], [0.6, 0.7, 0.42], 'detail')[0],
    cyl([6.5, 1.62, 2.5], 0.06, 0.4, { id: 'baguette', role: 'face', n: 12 }),
    ball([6.78, 1.72, 2.6], 0.1, { id: 'greens', role: 'body' }),
    ...carrier('bag-b', [7.1, 0.92, 2.5], [0.6, 0.55, 0.4], 'face'),
    // Cashier side.
    box([4.8, F, 1.0], [1.4, 0.85, 1.2], { id: 'cash-wrap', role: 'face' }),
    cyl([5.3, 1.05, 1.5], 0.14, 0.04, { id: 'monitor-foot', role: 'ink', n: 16 }),
    box([5.27, 1.09, 1.47], [0.06, 0.35, 0.06], { id: 'monitor-arm', role: 'ink' }),
    box([5.33, 1.3, 1.1], [0.08, 0.6, 0.8], {
      id: 'pos-monitor', r: 0.04, axis: 'x', role: 'body',
      decals: { right: [{ t: 'rect', x: 0.06, y: 0.06, w: 0.68, h: 0.42, r: 0.03, fill: 'ink' }, ...grid(0.1, 0.12, 3, 2, 0.16, 0.12, 0.04, { fill: 'face', stroke: false })] },
    }),
    box([4.9, 1.05, 1.15], [0.32, 0.22, 0.4], { id: 'receipt-printer', r: 0.05, axis: 'x', role: 'detail', decals: { top: [{ t: 'rect', x: 0.06, y: 0.12, w: 0.2, h: 0.04, fill: 'ink' }] } }),
    box([4.98, 1.27, 1.29], [0.16, 0.25, 0.015], { id: 'receipt', role: 'face', group: 'receipt', decals: { front: textLines(0.03, 0.04, 0.1, [1, 0.7, 1, 0.5], 0.05, 0.02) } }),
    cyl([4.0, F, 1.3], 0.28, 0.05, { id: 'stool-base', role: 'ink', n: 18 }),
    cyl([4.0, F + 0.05, 1.3], 0.04, 0.6, { id: 'stool-post', role: 'ink', n: 10 }),
    cyl([4.0, F + 0.65, 1.3], 0.25, 0.08, { id: 'stool-seat', role: 'detail', n: 20 }),
    // Lane light.
    cyl([0.85, F, 1.9], 0.05, 3.0, { id: 'lane-pole', role: 'ink', n: 12 }),
    box([0.575, F + 3.0, 1.625], [0.55, 0.55, 0.55], {
      id: 'lane-light', r: 0.05, role: 'face',
      decals: { front: [{ t: 'circle', cx: 0.275, cy: 0.275, r: 0.2, stroke: true }, { t: 'text', x: 0.275, y: 0.38, size: 0.28, text: '4', anchor: 'middle', fill: 'ink' }], right: [{ t: 'circle', cx: 0.275, cy: 0.275, r: 0.2, stroke: 'soft' }] },
    }),
    // Candy rack and baskets.
    box([0.8, F, 3.35], [1.8, 1.0, 0.45], {
      id: 'candy-rack', role: 'detail',
      decals: { front: [...grid(0.1, 0.1, 6, 3, 0.22, 0.22, 0.07, { fill: 'face' })], right: [slots(0.05, 0.33, 2, 0.33, 0.35, 'h')] },
    }),
    ...[0, 1, 2, 3, 4].map((k) => box([0.88 + k * 0.34, F + 1.0, 3.45], [0.3, 0.18, 0.25], { id: `candy-${k}`, r: 0.03, role: pick(k + 1) })),
    box([7.0, F, 3.9], [0.85, 0.55, 0.6], {
      id: 'baskets', r: 0.04, role: 'detail',
      decals: { front: [slots(0.05, 0.12, 4, 0.12, 0.75, 'h')], right: [slots(0.05, 0.12, 4, 0.12, 0.5, 'h')], top: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.69, h: 0.44, r: 0.03, fill: 'ink' }] },
    }),
    box([7.1, F + 0.55, 4.08], [0.65, 0.04, 0.05], { id: 'basket-handle0', role: 'ink' }),
    box([7.1, F + 0.55, 4.32], [0.65, 0.04, 0.05], { id: 'basket-handle1', role: 'ink' }),
  ],
  motion: {
    duration: 3.2,
    label: 'a card taps the terminal and the receipt prints',
    tracks: [
      { group: 'card', t: [0, 0, -0.22], from: 0.05, to: 0.45, ease: 'out' },
      { group: 'receipt', s: { k: [1, 2.2, 1], pivot: [5.06, 1.27, 1.3] }, from: 0.45, to: 0.95, ease: 'linear' },
    ],
  },
});

/* ---------------------------------------------------------- grocery aisle */
const UPW = 0.12, BAYW = 2.36;
const upX = (i: number): number => 0.4 + i * (BAYW + UPW);
const bayX0 = (b: number): number => upX(b) + UPW;
const UNIT_X1 = upX(3) + UPW;
const SHELF_Z0 = 0.35, SHELF_Z1 = 1.3, LEVELS = [0.5, 1.3, 2.1, 2.9], UNIT_TOP = 3.8;
type Stock = 'cereal' | 'cans' | 'bottles' | 'jars' | 'chips' | 'boxes' | 'jugs';
const STOCK: Stock[][] = [
  ['boxes', 'jugs', 'chips'],
  ['cereal', 'cans', 'jars'],
  ['jars', 'cereal', 'bottles'],
  ['cans', 'chips', 'cereal'],
];

/** Fill one shelf of one bay, front row flush with the shelf edge. */
function stockShelf(b: number, l: number, kind: Stock): Part[] {
  const x0 = bayX0(b) + 0.06, y = LEVELS[l], id = `s${b}${l}`, fz = SHELF_Z1 - 0.03;
  const row = (n: number, pitch: number, f: (k: number, x: number) => Part[]): Part[] =>
    Array.from({ length: n }, (_, k) => f(k, x0 + (BAYW - 0.12 - n * pitch) / 2 + k * pitch)).flat();
  switch (kind) {
    case 'cereal': return row(6, 0.37, (k, x) => [cereal(`${id}-c${k}`, [x + 0.015, y, fz - 0.24], [0.34, 0.56, 0.24], pick(k + l))]);
    case 'cans': return row(8, 0.27, (k, x) => [0, 1].map((t) => can(`${id}-n${k}${t}`, [x + 0.135, y + t * 0.26, fz - 0.13], 0.12, 0.26, pick(k + t + b))));
    case 'bottles': return row(7, 0.31, (k, x) => bottle(`${id}-b${k}`, [x + 0.155, y, fz - 0.12], 0.11, 0.56, pick(k, ['face', 'body'])));
    case 'jugs': return row(6, 0.37, (k, x) => bottle(`${id}-j${k}`, [x + 0.185, y, fz - 0.17], 0.16, 0.56, pick(k + 1, ['face', 'detail'])));
    case 'jars': return row(7, 0.32, (k, x) => [fz - 0.44, fz - 0.15].flatMap((z, r) => jar(`${id}-r${k}${r}`, [x + 0.16, y, z], 0.13, 0.26, pick(k + r + l))));
    case 'chips': return row(5, 0.46, (k, x) => [chips(`${id}-p${k}`, [x + 0.02, y, fz - 0.22], [0.42, 0.52, 0.22], pick(k + b, ['detail', 'face', 'body']))]);
    case 'boxes': return row(4, 0.57, (k, x) => [box([x + 0.025, y, fz - 0.42], [0.52, 0.5, 0.42], {
      id: `${id}-d${k}`, role: pick(k + 2), r: 0.02,
      decals: { front: [{ t: 'rect', x: 0.06, y: 0.08, w: 0.4, h: 0.12, r: 0.02, fill: 'ink' }, { t: 'rect', x: 0.18, y: 0.26, w: 0.16, h: 0.16, r: 0.08, fill: 'face', stroke: 'soft' }], top: [{ t: 'rect', x: 0.16, y: 0.08, w: 0.2, h: 0.06, r: 0.03, fill: 'ink' }] },
    })]);
  }
}

/** Price tags along a shelf edge. */
const priceTags = (w: number, n: number, y = 0.04): Decal[] => Array.from({ length: n }, (_, k): Decal[] => [
  { t: 'rect', x: 0.2 + k * ((w - 0.4) / n), y, w: 0.24, h: 0.12, r: 0.015, fill: 'face', stroke: 'soft' },
  { t: 'bar', x: 0.24 + k * ((w - 0.4) / n), y: y + 0.05, w: 0.12, h: 0.03, fill: 'ink' },
]).flat();

const CART_X = 1.3, CART_Z = 3.3;
function shoppingCart(): Part[] {
  const x0 = CART_X, z0 = CART_Z, g = 'cart';
  return [
    ...[x0 - 0.1, x0 + 1.45].flatMap((x, i) => [z0 + 0.02, z0 + 0.81].map((z, j) => cyl([x, F + 0.11, z], 0.11, 0.07, { id: `cart-wheel${i}${j}`, axis: 'z', role: 'ink', group: g, n: 16 }))),
    box([x0 - 0.25, F + 0.22, z0], [1.85, 0.05, 0.9], { id: 'cart-chassis', role: 'ink', group: g }),
    box([x0, F + 0.27, z0 + 0.1], [1.5, 0.04, 0.7], { id: 'cart-tray', role: 'detail', group: g }),
    box([x0 + 0.2, F + 0.31, z0 + 0.15], [0.7, 0.3, 0.55], { id: 'cart-water', r: 0.03, role: 'face', group: g, decals: { front: [{ t: 'bar', x: 0.1, y: 0.12, w: 0.5, h: 0.05, fill: 'ink' }], top: [...grid(0.06, 0.05, 4, 3, 0.11, 0.11, 0.05, { fill: 'detail', r: 0.055 })] } }),
    ...[x0, x0 + 1.55].flatMap((x, i) => [z0, z0 + 0.85].map((z, j) => box([x, F + 0.27, z], [0.05, 0.43, 0.05], { id: `cart-strut${i}${j}`, role: 'ink', group: g }))),
    box([x0, 0.9, z0], [1.6, 0.75, 0.9], {
      id: 'cart-basket', role: 'accent', group: g,
      decals: {
        front: [...grid(0.08, 0.08, 7, 3, 0.16, 0.16, 0.06, { fill: 'face', r: 0.02 })],
        right: [...grid(0.07, 0.08, 4, 3, 0.15, 0.16, 0.06, { fill: 'face', r: 0.02 })],
        top: [{ t: 'rect', x: 0.06, y: 0.06, w: 1.48, h: 0.78, r: 0.03, fill: 'ink' }],
      },
    }),
    ...[z0 + 0.06, z0 + 0.78].flatMap((z, k) => [
      box([x0 - 0.22, F + 0.27, z], [0.06, 1.48, 0.06], { id: `cart-post${k}`, role: 'ink', group: g }),
      box([x0 - 0.16, 1.45, z], [0.16, 0.06, 0.06], { id: `cart-brace${k}`, role: 'ink', group: g }),
    ]),
    box([x0 - 0.27, 1.75, z0 - 0.02], [0.16, 0.14, 0.94], { id: 'cart-handle', r: 0.06, axis: 'z', role: 'ink', group: g }),
    cereal('cart-cereal', [x0 + 0.2, 1.65, z0 + 0.3], [0.45, 0.4, 0.18], 'face', g),
    ...bottle('cart-bottle', [x0 + 0.95, 1.65, z0 + 0.42], 0.1, 0.45, 'face', g),
    ball([x0 + 1.3, 1.75, z0 + 0.6], 0.1, { id: 'cart-greens', role: 'body', group: g }),
  ];
}

export const groceryAisle = defineDrawing({
  id: 'grocery-aisle',
  name: 'Grocery aisle',
  category: 'commerce',
  tags: ['grocery', 'supermarket', 'aisle', 'shelves', 'shopping cart', 'trolley', 'produce', 'retail', 'merchandising', 'planogram', 'inventory', 'store', 'commerce'],
  kind: 'scene',
  prompt: '/isometric create a supermarket aisle with stocked shelves and a shopping cart rolling past, for our retail inventory app',
  description: 'A supermarket aisle: a three-bay shelving unit stocked with cereal boxes, stacked cans, bottles, jugs, jars, chip bags and boxed goods, price tags along every shelf edge, overstock cartons on top and a category header. An aisle sign hangs overhead and a produce island holds three crates of fruit. A shopping cart with a basket of groceries and a case of water on its tray rolls down the aisle.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [9, F, 5.2], { id: 'floor', role: 'face', decals: { top: [tiles(9, 5.2, 0.75, 1.3)] } }),
    // Shelving unit.
    box([0.4, F, 0.2], [UNIT_X1 - 0.4, LEVELS[0] - F, SHELF_Z1 - 0.2], { id: 'unit-base', role: 'detail', decals: { front: [0, 1, 2].flatMap((b) => priceTags(BAYW, 4).map((d) => ({ ...d, x: (d as { x: number }).x + bayX0(b) - 0.4 }) as Decal)) } }),
    box([0.4, LEVELS[0], 0.2], [UNIT_X1 - 0.4, UNIT_TOP - LEVELS[0], 0.15], { id: 'unit-back', role: 'face', decals: { front: [slots(0.3, 0.15, 24, 0.31, UNIT_TOP - LEVELS[0] - 0.3, 'v')] } }),
    ...[0, 1, 2, 3].map((i) => box([upX(i), LEVELS[0], SHELF_Z0], [UPW, UNIT_TOP - LEVELS[0], SHELF_Z1 - SHELF_Z0], { id: `upright${i}`, role: 'body' })),
    ...[0, 1, 2].flatMap((b) => [1, 2, 3].flatMap((l): Part[] => [
      box([bayX0(b), LEVELS[l] - 0.06, SHELF_Z0], [BAYW, 0.06, SHELF_Z1 - SHELF_Z0], { id: `shelf-${b}${l}`, role: 'detail' }),
      box([bayX0(b), LEVELS[l] - 0.2, SHELF_Z1], [BAYW, 0.2, 0.04], { id: `strip-${b}${l}`, role: 'face', decals: { front: priceTags(BAYW, 4) } }),
    ])),
    ...STOCK.flatMap((row, l) => row.flatMap((k, b) => stockShelf(b, l, k))),
    box([0.4, UNIT_TOP, 0.2], [UNIT_X1 - 0.4, 0.1, SHELF_Z1 - 0.16], { id: 'unit-cap', role: 'body' }),
    box([0.4, UNIT_TOP + 0.1, 0.2], [UNIT_X1 - 0.4, 0.5, 0.15], {
      id: 'unit-header', role: 'detail',
      decals: { front: [0, 1, 2].flatMap((b): Decal[] => [{ t: 'circle', cx: bayX0(b) - 0.4 + 0.4, cy: 0.25, r: 0.15, fill: 'face' }, { t: 'bar', x: bayX0(b) - 0.4 + 0.7, y: 0.21, w: 1.2, h: 0.08, fill: 'face' }]) },
    }),
    carton('over0', [0.7, UNIT_TOP + 0.1, 0.45], [0.9, 0.55, 0.65], 'detail'),
    carton('over1', [1.7, UNIT_TOP + 0.1, 0.5], [0.7, 0.4, 0.6], 'face'),
    carton('over2', [4.2, UNIT_TOP + 0.1, 0.45], [0.95, 0.6, 0.65], 'face'),
    carton('over3', [4.35, UNIT_TOP + 0.7, 0.5], [0.6, 0.35, 0.5], 'detail'),
    carton('over4', [6.6, UNIT_TOP + 0.1, 0.5], [0.8, 0.45, 0.6], 'detail'),
    // Hanging aisle sign.
    box([3.0, 5.6, 3.04], [0.02, 0.8, 0.02], { id: 'sign-cable0', role: 'ink' }),
    box([5.2, 5.6, 3.04], [0.02, 0.8, 0.02], { id: 'sign-cable1', role: 'ink' }),
    box([2.7, 4.9, 3.0], [2.8, 0.7, 0.1], {
      id: 'aisle-sign', r: 0.05, axis: 'z', role: 'face',
      decals: { front: [{ t: 'circle', cx: 0.4, cy: 0.35, r: 0.22, fill: 'ink' }, { t: 'bar', x: 0.8, y: 0.2, w: 1.6, h: 0.1, fill: 'ink' }, { t: 'bar', x: 0.8, y: 0.42, w: 1.1, h: 0.07, fill: 'soft' }] },
    }),
    // Produce island.
    box([5.6, F, 3.3], [2.6, 0.55, 1.3], { id: 'produce-table', role: 'detail', decals: { front: [slots(0.05, 0.14, 3, 0.14, 2.5, 'h')], right: [slots(0.05, 0.14, 3, 0.14, 1.2, 'h')] } }),
    ...[5.65, 6.5, 7.35].flatMap((cx, c): Part[] => [
      box([cx, F + 0.55, 3.4], [0.8, 0.22, 1.1], { id: `crate${c}`, role: 'face', decals: { front: [slots(0.04, 0.06, 2, 0.1, 0.72, 'h'), { t: 'rect', x: 0.26, y: 0.03, w: 0.28, h: 0.14, r: 0.02, fill: 'face', stroke: true }], right: [slots(0.04, 0.06, 2, 0.1, 1.02, 'h')] } }),
      ...[0, 1, 2].flatMap((i) => [0, 1, 2, 3].map((j) => ball([cx + 0.16 + i * 0.24, F + 0.77 + 0.12, 3.59 + j * 0.24], 0.12, { id: `fruit${c}${i}${j}`, role: (['body', 'detail', 'ink'] as Role[])[c] }))),
    ]),
    ...shoppingCart(),
  ],
  motion: {
    duration: 4,
    label: 'the shopping cart rolls down the aisle',
    tracks: [{ group: 'cart', t: [1.6, 0, 0], from: 0.05, to: 0.9, ease: 'inOut' }],
  },
});

/* -------------------------------------------------------- vending machines */
const VX0 = 0.6, VX1 = 2.2, VZ0 = 0.45, VBASE = 0.9, VTOP = 3.5, VGLASS = 1.7, TRAY_Z1 = 1.35;
const TRAYS = [1.0, 1.65, 2.3, 2.95];
const SLOT_W = 0.4;
const DROP: V3 = [VX0 + 2 * SLOT_W + 0.04, TRAYS[2] + 0.04, TRAY_Z1 - 0.16];
const DROP_FALL = DROP[1] - VBASE;

/** A spiral coil seen from above, drawn on a tray top for one slot. */
const coil = (s: number): Decal => ({
  t: 'line', stroke: 'soft',
  pts: Array.from({ length: 10 }, (_, k): [number, number] => [s * SLOT_W + SLOT_W / 2 + (k % 2 ? 0.13 : -0.13), 0.05 + k * 0.085]),
});

function trayStock(t: number): Part[] {
  const y = TRAYS[t] + 0.04, out: Part[] = [];
  for (let s = 0; s < 4; s++) {
    const cx = VX0 + s * SLOT_W + SLOT_W / 2, id = `v${t}${s}`;
    if (t === 0) for (const [k, z] of [TRAY_Z1 - 0.14, TRAY_Z1 - 0.44].entries()) out.push(can(`${id}-can${k}`, [cx, y, z], 0.12, 0.3, pick(s + k)));
    if (t === 1) for (const [k, z] of [TRAY_Z1 - 0.3, TRAY_Z1 - 0.62].entries()) for (const h of [0, 1]) out.push(box([cx - 0.15, y + h * 0.12, z], [0.3, 0.12, 0.28], { id: `${id}-bar${k}${h}`, r: 0.02, role: pick(s + h), decals: { top: [{ t: 'rect', x: 0.06, y: 0.08, w: 0.18, h: 0.12, r: 0.02, fill: 'ink' }] } }));
    if (t === 2) for (const [k, z] of [TRAY_Z1 - 0.16, TRAY_Z1 - 0.46, TRAY_Z1 - 0.76].entries()) {
      if (s === 2 && k === 0) continue; // the accent bag, added separately
      out.push(chips(`${id}-chips${k}`, [cx - 0.16, y, z], [0.32, 0.48, 0.14], pick(s + 1, ['detail', 'face', 'body'])));
    }
    if (t === 3) for (const [k, z] of [TRAY_Z1 - 0.13, TRAY_Z1 - 0.43].entries()) out.push(...bottle(`${id}-btl${k}`, [cx, y, z], 0.1, 0.48, pick(s + k, ['face', 'body'])));
  }
  return out;
}

export const vendingMachines = defineDrawing({
  id: 'vending-machines',
  name: 'Vending machines',
  category: 'commerce',
  tags: ['vending machine', 'snacks', 'drinks', 'soda', 'kiosk', 'self-service', 'unattended retail', 'cashless', 'card payment', 'coin', 'retail', 'commerce'],
  kind: 'scene',
  prompt: '/isometric create a snack vending machine next to a soda machine, with a snack dropping into the tray, for our cashless vending payments page',
  description: 'Two vending machines against a tiled wall. The snack machine has a glass front over four coil trays of cans, chocolate bars, chip bags and bottles, and a control column with a display, keypad, coin slot, lit card reader and bill acceptor. The soda machine carries a bottle graphic, a column of selection buttons, a coin box and a delivery flap. A chip bag is pushed off its coil and drops to the pickup bin. A wall clock, a poster and a lidded bin complete the corner.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [6.6, F, 4.2], { id: 'floor', role: 'face', decals: { top: [tiles(6.6, 4.2, 0.7, 0.25)] } }),
    box([0, F, 0], [6.6, 4.2, 0.25], {
      id: 'wall', role: 'face',
      decals: { front: [slots(0.05, 0.6, 6, 0.6, 6.5, 'h'), { t: 'rect', x: 5.65, y: 1.7, w: 0.75, h: 1.0, r: 0.03, fill: 'detail', stroke: 'soft' }, ...textLines(5.75, 1.85, 0.55, [1, 0.6, 0.8], 0.18, 0.06, 'face')] },
    }),
    cyl([5.95, 3.4, 0.25], 0.3, 0.06, { id: 'clock', axis: 'z', role: 'face', n: 28, decals: { front: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.27, stroke: true }, tickRing(0.3, 0.3, 0.24, 12, 3, 0.06), { t: 'segs', stroke: true, segs: [[0.3, 0.3, 0.3, 0.12], [0.3, 0.3, 0.42, 0.36]] }] } }),
    // Snack machine shell.
    box([0.5, F, 0.35], [2.4, VBASE - F, 1.4], {
      id: 'snack-base', role: 'body',
      decals: { front: [{ t: 'rect', x: 0.2, y: 0.12, w: 1.4, h: 0.38, r: 0.04, fill: 'ink' }, { t: 'rect', x: 0.3, y: 0.18, w: 1.2, h: 0.08, r: 0.02, fill: 'detail' }, slots(1.85, 0.15, 4, 0.12, 0.4, 'v')], right: [slots(0.2, 0.15, 9, 0.12, 0.4, 'v')] },
    }),
    box([0.5, VBASE, 0.35], [0.1, VTOP - VBASE, 1.4], { id: 'snack-side', role: 'body' }),
    box([VX0, VBASE, 0.35], [VX1 - VX0, VTOP - VBASE, 0.1], { id: 'snack-back', role: 'face', decals: { front: [slots(0.1, 0.1, 4, 0.4, 2.4, 'v')] } }),
    box([VX1, VBASE, 0.35], [0.7, VTOP - VBASE, 1.4], {
      id: 'snack-controls', role: 'body',
      decals: {
        front: [
          { t: 'rect', x: 0.1, y: 0.2, w: 0.5, h: 0.28, r: 0.03, fill: 'ink' },
          { t: 'bar', x: 0.16, y: 0.3, w: 0.26, h: 0.05, fill: 'face' },
          ...grid(0.12, 0.62, 3, 4, 0.12, 0.1, 0.05, { fill: 'face' }),
          { t: 'rect', x: 0.25, y: 1.33, w: 0.2, h: 0.06, r: 0.02, fill: 'ink' },
          { t: 'rect', x: 0.12, y: 1.5, w: 0.46, h: 0.24, r: 0.03, fill: 'accent', stroke: true },
          { t: 'bar', x: 0.2, y: 1.6, w: 0.3, h: 0.04, fill: 'ink' },
          { t: 'rect', x: 0.12, y: 1.86, w: 0.46, h: 0.12, r: 0.02, fill: 'ink' },
          { t: 'rect', x: 0.2, y: 2.15, w: 0.3, h: 0.22, r: 0.03, fill: 'detail', stroke: true },
        ],
        right: [{ t: 'rect', x: 0.15, y: 0.2, w: 1.1, h: 2.2, r: 0.06, stroke: 'soft' }, { t: 'circle', cx: 0.7, cy: 0.8, r: 0.3, stroke: 'soft' }, ...textLines(0.35, 1.4, 0.7, [1, 0.6], 0.2, 0.07)],
      },
    }),
    box([0.5, VTOP, 0.35], [2.4, 0.3, 1.4], { id: 'snack-header', role: 'detail', decals: { front: [{ t: 'circle', cx: 0.3, cy: 0.15, r: 0.09, fill: 'face' }, { t: 'bar', x: 0.5, y: 0.11, w: 1.2, h: 0.08, fill: 'face' }] } }),
    // Coil trays and stock.
    ...TRAYS.flatMap((ty, t): Part[] => [
      box([VX0, ty, VZ0], [VX1 - VX0, 0.04, TRAY_Z1 - VZ0], { id: `tray${t}`, role: 'detail', decals: { top: [0, 1, 2, 3].map(coil) } }),
      box([VX0, ty - 0.08, TRAY_Z1], [VX1 - VX0, 0.12, 0.04], { id: `tray-lip${t}`, role: 'face', decals: { front: [0, 1, 2, 3].map((s): Decal => ({ t: 'bar', x: s * SLOT_W + 0.12, y: 0.045, w: 0.16, h: 0.03, fill: 'ink' })) } }),
      ...trayStock(t),
    ]),
    chips('snack-drop', DROP, [0.32, 0.48, 0.14], 'accent', 'drop'),
    box([VX0, VBASE, VGLASS], [VX1 - VX0, VTOP - VBASE, 0.05], { id: 'snack-glass', role: 'glass', decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.15, 1.2, 0.85, 0.2], [0.35, 1.5, 1.25, 0.25], [0.5, 2.45, 1.4, 1.4]] }] } }),
    // Soda machine.
    box([3.2, F, 0.35], [2.1, 3.6, 1.3], {
      id: 'soda-body', role: 'body',
      decals: {
        front: [
          { t: 'rect', x: 0.12, y: 0.15, w: 1.35, h: 2.6, r: 0.06, fill: 'face', stroke: 'soft' },
          { t: 'line', closed: true, fill: 'detail', stroke: true, pts: [[0.72, 0.45], [0.88, 0.45], [0.88, 0.9], [1.1, 1.3], [1.1, 2.45], [0.5, 2.45], [0.5, 1.3], [0.72, 0.9]] },
          { t: 'circle', cx: 0.8, cy: 1.8, r: 0.22, fill: 'face', stroke: 'soft' },
          ...Array.from({ length: 5 }, (_, k): Decal => ({ t: 'rect', x: 1.62, y: 0.3 + k * 0.32, w: 0.36, h: 0.22, r: 0.03, fill: 'face', stroke: true })),
          { t: 'rect', x: 1.62, y: 1.95, w: 0.36, h: 0.14, r: 0.02, fill: 'ink' },
        ],
        right: [slots(0.15, 0.3, 11, 0.1, 3.0, 'v')],
      },
    }),
    box([3.15, 3.8, 0.3], [2.2, 0.12, 1.4], { id: 'soda-cap', role: 'detail' }),
    box([4.82, 1.25, 1.65], [0.36, 0.5, 0.1], { id: 'soda-coinbox', r: 0.03, axis: 'z', role: 'detail', decals: { front: [{ t: 'rect', x: 0.13, y: 0.08, w: 0.1, h: 0.14, r: 0.02, fill: 'ink' }, { t: 'rect', x: 0.06, y: 0.3, w: 0.24, h: 0.12, r: 0.02, fill: 'ink' }] } }),
    box([3.5, 0.35, 1.65], [1.0, 0.45, 0.1], { id: 'soda-flap', r: 0.03, axis: 'z', role: 'detail', decals: { front: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.84, h: 0.29, r: 0.03, fill: 'ink' }, { t: 'bar', x: 0.3, y: 0.15, w: 0.4, h: 0.04, fill: 'face' }] } }),
    // Bin.
    cyl([5.95, F, 2.3], 0.3, 0.9, { id: 'bin', role: 'detail', n: 24 }),
    cyl([5.95, F + 0.9, 2.3], 0.32, 0.08, { id: 'bin-lid', role: 'ink', n: 24, decals: { top: [{ t: 'circle', cx: 0.32, cy: 0.32, r: 0.12, fill: 'face' }] } }),
  ],
  motion: {
    duration: 3.4,
    label: 'a chip bag is pushed off its coil and drops',
    tracks: [
      { group: 'drop', t: [0, 0, 0.3], from: 0.05, to: 0.35, ease: 'inOut' },
      { group: 'drop', t: [0, -DROP_FALL, 0], from: 0.4, to: 0.8, ease: 'in' },
    ],
  },
});

/* ------------------------------------------------------------------- ATM */
const WD = 0.7, AX0 = 2.4, AX1 = 4.4, ATOP = 3.2, AZ = 0.55, WALL_TOP = 4.4;

const stanchion = (id: string, x: number, z: number): Part[] => [
  cyl([x, F, z], 0.17, 0.05, { id: `${id}-base`, role: 'ink', n: 18 }),
  cyl([x, F + 0.05, z], 0.04, 0.9, { id: `${id}-pole`, role: 'ink', n: 10 }),
  ball([x, F + 0.95 + 0.06, z], 0.06, { id: `${id}-cap`, role: 'detail' }),
];

const sconce = (id: string, x: number): Part[] => [
  box([x - 0.1, 2.45, WD], [0.2, 0.35, 0.05], { id: `${id}-plate`, role: 'ink' }),
  box([x - 0.15, 2.5, WD + 0.05], [0.3, 0.25, 0.2], { id: `${id}-lamp`, r: 0.04, role: 'face', decals: { front: [{ t: 'rect', x: 0.05, y: 0.05, w: 0.2, h: 0.15, r: 0.02, fill: 'detail' }] } }),
];

export const atmKiosk = defineDrawing({
  id: 'atm-kiosk',
  name: 'ATM',
  category: 'commerce',
  tags: ['atm', 'cash machine', 'cashpoint', 'bank', 'banking', 'cash', 'withdrawal', 'debit card', 'fintech', 'payments', 'money', 'commerce'],
  kind: 'scene',
  prompt: '/isometric create a bank wall with an ATM dispensing cash as a card goes in, for our banking app landing page',
  description: 'A stone bank wall with an ATM set into a recess under a lit ATM sign and a security camera. The machine has a privacy hood over its screen, side function keys, a keypad deck, a receipt slot and a card reader. A card slides into the reader and a stack of lit banknotes slides out of the cash dispenser. A night deposit drawer, wall sconces, a barred window, a queue line of stanchions, a floor mat and bollards stand around it.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [7.2, F, 4.4], {
      id: 'pavement', role: 'face',
      decals: { top: [{ t: 'segs', stroke: 'soft', segs: [[0.05, 1.6, 7.15, 1.6], [0.05, 2.6, 7.15, 2.6], [0.05, 3.6, 7.15, 3.6], ...Array.from({ length: 6 }, (_, k): Seg => [1.0 + k * 1.0, WD + 0.05, 1.0 + k * 1.0, 4.35])] }] },
    }),
    // Wall around the recess.
    box([0, F, 0], [AX0, WALL_TOP - F, WD], {
      id: 'wall-left', role: 'face',
      decals: { front: [slots(0.05, 0.7, 5, 0.7, AX0 - 0.1, 'h'), { t: 'segs', stroke: 'soft', segs: [[1.2, 0.7, 1.2, 1.4], [0.6, 1.4, 0.6, 2.1], [1.8, 1.4, 1.8, 2.1], [1.2, 2.1, 1.2, 2.8], [0.6, 2.8, 0.6, 3.5], [1.8, 2.8, 1.8, 3.5]] }] },
    }),
    box([AX1, F, 0], [7.2 - AX1, WALL_TOP - F, WD], {
      id: 'wall-right', role: 'face',
      decals: {
        front: [
          { t: 'rect', x: 0.35, y: 0.6, w: 2.1, h: 2.1, r: 0.03, fill: 'ink' },
          { t: 'segs', stroke: 'face', width: 1.5, segs: [[0.875, 0.62, 0.875, 2.68], [1.4, 0.62, 1.4, 2.68], [1.925, 0.62, 1.925, 2.68], [0.37, 1.65, 2.43, 1.65]] },
          slots(0.05, 3.15, 1, 0.7, 2.7, 'h'),
        ],
        right: [slots(0.05, 0.7, 5, 0.7, WD - 0.1, 'h')],
      },
    }),
    box([AX1 + 0.3, WALL_TOP - 2.7 - 0.08, WD], [2.2, 0.08, 0.15], { id: 'window-sill', role: 'detail' }),
    box([AX0, ATOP, 0], [AX1 - AX0, WALL_TOP - ATOP, WD], { id: 'lintel', role: 'face' }),
    box([-0.05, WALL_TOP, 0], [7.3, 0.15, WD + 0.15], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.03, 36, 0.2, 0.09, 'v')] } }),
    box([AX0 + 0.1, 3.45, WD], [1.8, 0.6, 0.1], { id: 'atm-sign', r: 0.05, axis: 'z', role: 'ink', decals: { front: [{ t: 'text', x: 0.9, y: 0.42, size: 0.32, text: 'ATM', anchor: 'middle', fill: 'face' }] } }),
    box([3.36, 3.27, WD], [0.08, 0.08, 0.06], { id: 'camera-mount', role: 'ink' }),
    ball([3.4, 3.2, WD + 0.16], 0.1, { id: 'camera-dome', role: 'ink' }),
    // The ATM.
    box([AX0, F, 0], [AX1 - AX0, ATOP - F, AZ], {
      id: 'atm-body', role: 'body',
      decals: { front: [
        { t: 'rect', x: 0.35, y: 0.48, w: 1.3, h: 0.7, r: 0.04, fill: 'ink' },
        ...textLines(0.5, 0.62, 0.8, [1, 0.7], 0.14, 0.06, 'face'),
        ...grid(0.53, 0.94, 2, 1, 0.42, 0.14, 0.12, { fill: 'face', stroke: false }),
        ...grid(0.14, 0.58, 1, 3, 0.14, 0.1, 0.1, { fill: 'detail' }),
        ...grid(1.72, 0.58, 1, 3, 0.14, 0.1, 0.1, { fill: 'detail' }),
        { t: 'rect', x: 0.3, y: 2.35, w: 1.4, h: 0.5, r: 0.03, stroke: 'soft' },
        { t: 'circle', cx: 1.55, cy: 2.6, r: 0.05, fill: 'ink' },
      ] },
    }),
    box([AX0 + 0.05, 2.85, AZ], [1.9, 0.1, 0.4], { id: 'hood-top', role: 'detail' }),
    box([AX0 + 0.05, 1.95, AZ], [0.08, 0.9, 0.4], { id: 'hood-left', role: 'detail' }),
    box([AX1 - 0.13, 1.95, AZ], [0.08, 0.9, 0.4], { id: 'hood-right', role: 'detail' }),
    box([AX0 + 0.1, 1.25, AZ], [1.8, 0.1, 0.32], {
      id: 'keypad-deck', role: 'detail',
      decals: { top: [...grid(0.55, 0.03, 3, 4, 0.12, 0.05, 0.02, { fill: 'face' }), ...grid(1.0, 0.03, 1, 4, 0.2, 0.05, 0.02, { fill: 'ink', stroke: false }), { t: 'rect', x: 0.12, y: 0.05, w: 0.3, h: 0.22, r: 0.02, stroke: 'soft' }] },
    }),
    box([AX0 + 0.25, 1.55, AZ], [0.5, 0.14, 0.08], { id: 'receipt-slot', r: 0.03, axis: 'z', role: 'detail', decals: { front: [{ t: 'bar', x: 0.08, y: 0.05, w: 0.34, h: 0.03, fill: 'ink' }] } }),
    box([3.6, 1.5, AZ], [0.45, 0.32, 0.12], { id: 'card-reader', r: 0.04, axis: 'z', role: 'face', decals: { front: [{ t: 'bar', x: 0.08, y: 0.13, w: 0.29, h: 0.04, fill: 'ink' }, { t: 'circle', cx: 0.36, cy: 0.25, r: 0.03, fill: 'detail' }] } }),
    box([3.69, 1.645, AZ + 0.42], [0.27, 0.02, 0.43], {
      id: 'card', r: 0.03, role: 'face', group: 'card',
      decals: { top: [{ t: 'rect', x: 0.05, y: 0.08, w: 0.07, h: 0.06, r: 0.01, fill: 'detail', stroke: 'soft' }, { t: 'bar', x: 0.05, y: 0.3, w: 0.17, h: 0.025, fill: 'ink' }] },
    }),
    box([2.75, 0.5, AZ], [0.9, 0.3, 0.06], { id: 'dispenser', r: 0.03, axis: 'z', role: 'detail', decals: { front: [{ t: 'rect', x: 0.05, y: 0.08, w: 0.8, h: 0.14, r: 0.02, fill: 'ink' }] } }),
    box([2.85, 0.6, AZ + 0.06], [0.7, 0.1, 0.22], {
      id: 'cash', role: 'accent', group: 'cash',
      decals: { top: [{ t: 'rect', x: 0.04, y: 0.03, w: 0.62, h: 0.16, r: 0.01, stroke: 'soft' }, { t: 'circle', cx: 0.35, cy: 0.11, r: 0.05, stroke: 'soft' }], front: [slots(0.02, 0.025, 3, 0.025, 0.66, 'h')] },
    }),
    // Around the machine.
    box([0.6, 1.3, WD], [0.9, 0.6, 0.1], { id: 'night-deposit', r: 0.03, axis: 'z', role: 'detail', decals: { front: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.7, h: 0.12, r: 0.02, fill: 'ink' }, { t: 'rect', x: 0.3, y: 0.34, w: 0.3, h: 0.07, r: 0.03, fill: 'face', stroke: true }, { t: 'circle', cx: 0.78, cy: 0.45, r: 0.04, fill: 'ink' }] } }),
    ...sconce('sconce-l', 2.0), ...sconce('sconce-r', 4.8),
    box([AX0, F, WD], [AX1 - AX0, 0.03, 1.1], { id: 'mat', role: 'ink', decals: { top: [slots(0.1, 0.1, 10, 0.2, 0.9, 'v', 'soft')] } }),
    ...stanchion('post0', 0.4, 2.2), ...stanchion('post1', 1.3, 2.2), ...stanchion('post2', 2.2, 2.2),
    box([0.44, F + 0.82, 2.18], [0.82, 0.08, 0.04], { id: 'belt0', role: 'detail' }),
    box([1.34, F + 0.82, 2.18], [0.82, 0.08, 0.04], { id: 'belt1', role: 'detail' }),
    ...[5.2, 6.5].flatMap((x, k): Part[] => [
      cyl([x, F, 3.7], 0.13, 0.7, { id: `bollard${k}`, role: 'detail', n: 18 }),
      cyl([x, F + 0.7, 3.7], 0.14, 0.06, { id: `bollard-cap${k}`, role: 'ink', n: 18 }),
    ]),
  ],
  motion: {
    duration: 3.6,
    label: 'a card goes in and cash slides out',
    tracks: [
      { group: 'card', t: [0, 0, -0.29], from: 0.05, to: 0.4, ease: 'inOut' },
      { group: 'cash', t: [0, 0, 0.32], from: 0.45, to: 0.85, ease: 'out' },
    ],
  },
});
