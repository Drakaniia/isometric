/**
 * Chart scenes: a stacked column chart, an exploded pie, a candlestick price
 * chart, a 3D scatter plot, a conversion funnel, a 3D heatmap and a layered
 * area chart. Each is a physical model of the chart, built on a deck.
 */
import { defineDrawing, box, cbox, cyl, ball, prism, slots, textLines, tickRing } from '../build.js';
import type { Decal, Part, Role, Track } from '../model.js';

const CREATED = '2026-11-13';

type Seg = [number, number, number, number];

/** Horizontal gridlines on a wall's front face, every `step` from the bottom. */
const wallGrid = (w: number, h: number, step: number, x0 = 0.5, x1 = w - 0.2): Decal => {
  const segs: Seg[] = [];
  for (let y = h - step; y > 0.15; y -= step) segs.push([x0, y, x1, y]);
  return { t: 'segs', segs, stroke: 'soft' };
};

/** Short bars down the left edge of a wall, standing in for axis values. */
const axisLabels = (h: number, step: number, x = 0.12, w = 0.24): Decal[] => {
  const out: Decal[] = [];
  for (let y = h - step; y > 0.15; y -= step) out.push({ t: 'bar', x, y: y - 0.035, w, h: 0.07, fill: 'soft' });
  return out;
};

/** An annular sector in a plane, angles in degrees from +u toward +v. */
function sector(r0: number, r1: number, a0: number, a1: number, n = 14, ou = 0, ov = 0): [number, number][] {
  const pts: [number, number][] = [];
  const at = (i: number) => ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
  for (let i = 0; i <= n; i++) pts.push([ou + Math.cos(at(i)) * r1, ov + Math.sin(at(i)) * r1]);
  if (r0 <= 0) pts.push([ou, ov]);
  else for (let i = n; i >= 0; i--) pts.push([ou + Math.cos(at(i)) * r0, ov + Math.sin(at(i)) * r0]);
  return pts;
}

/** A floating ink tooltip card on a stem: value pill plus a caption bar. */
function tooltip(id: string, x: number, y: number, z: number, group: string, stem = 0.32): Part[] {
  return [
    cyl([x, y, z], 0.025, stem, { id: `${id}-stem`, role: 'ink', n: 8, group }),
    cbox(x, y + stem, z, [1.05, 0.52, 0.08], {
      id, r: 0.1, axis: 'z', role: 'ink', group,
      decals: { front: [{ t: 'circle', cx: 0.2, cy: 0.19, r: 0.06, fill: 'accent' }, { t: 'bar', x: 0.33, y: 0.16, w: 0.55, h: 0.06, fill: 'face' }, { t: 'bar', x: 0.14, y: 0.32, w: 0.66, h: 0.09, fill: 'face' }] },
    }),
  ];
}

/* ---------------------------------------------------- stacked column chart */
const SC = { w: 8.6, d: 5.4, h: 0.25 };
const SC_WALL = { x: 0.6, z: 0.6, w: 7.4, h: 3.8, t: 0.12 };
const SC_COL = { x: (k: number) => 1.45 + k * 1.08, z: 2.35, w: 0.62, d: 0.9 };
const SERIES: { h: number[]; role: Role }[] = [
  { h: [0.8, 0.9, 1.0, 1.1, 1.15, 1.2], role: 'body' },
  { h: [0.5, 0.6, 0.55, 0.7, 0.8, 0.85], role: 'detail' },
  { h: [0.2, 0.35, 0.5, 0.7, 0.95, 1.25], role: 'accent' },
];
const SC_BASE = (k: number, s: number) => SC.h + SERIES.slice(0, s).reduce((a, S) => a + S.h[k], 0);
const SC_DIP = 0.45;

export const stackedColumns = defineDrawing({
  id: 'stacked-columns',
  name: 'Stacked column chart',
  category: 'charts',
  tags: ['chart', 'column chart', 'stacked', 'bar chart', 'revenue', 'quarterly', 'growth', 'report', 'segments', 'breakdown', 'analytics', 'finance'],
  kind: 'scene',
  prompt: '/isometric create a stacked column chart as a physical model with gridded axis walls, a legend and a tooltip, for our quarterly report page',
  description: 'Six columns stand on a gridded floor between two axis walls, each stacked from three segments. The top segment, the fastest-growing series, is lit and swells quarter by quarter; a tooltip marks the latest value, a dashed target line runs along the back wall and a legend card stands at the front.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [SC.w, SC.h, SC.d], {
      id: 'deck', r: 0.15, role: 'face',
      decals: {
        top: [
          { t: 'segs', segs: [1.2, 1.8, 2.4, 3.0, 3.6].map((z): Seg => [0.85, z, 7.9, z]), stroke: 'soft' },
          ...[0, 1, 2, 3, 4, 5].map((k): Decal => ({ t: 'bar', x: SC_COL.x(k) - 0.2, y: 3.15, w: 0.4, h: 0.08, fill: 'soft' })),
          { t: 'segs', segs: [[0.85, 2.9, 7.9, 2.9]], stroke: true },
        ],
        front: [slots(0.4, 0.08, 40, 0.2, 0.09, 'v')],
      },
    }),
    // Axis walls.
    box([SC_WALL.x, SC.h, SC_WALL.z], [SC_WALL.w, SC_WALL.h, SC_WALL.t], {
      id: 'wall-back', r: 0.04,
      decals: {
        front: [
          wallGrid(SC_WALL.w, SC_WALL.h, 0.5),
          ...axisLabels(SC_WALL.h, 0.5),
          { t: 'segs', segs: Array.from({ length: 18 }, (_, k): Seg => [0.55 + k * 0.38, SC_WALL.h - 3.2, 0.75 + k * 0.38, SC_WALL.h - 3.2]), stroke: 'accent', width: 1.5 },
          { t: 'bar', x: 5.6, y: 0.18, w: 1.6, h: 0.14, fill: 'detail' },
        ],
      },
    }),
    box([SC_WALL.x, SC.h, SC_WALL.z + SC_WALL.t], [SC_WALL.t, SC_WALL.h, 3.0], {
      id: 'wall-left', r: 0.04,
      decals: { right: [{ t: 'segs', segs: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5].map((y): Seg => [0.2, y, 2.8, y]), stroke: 'soft' }] },
    }),
    // Columns.
    ...SERIES.flatMap((S, s) => S.h.map((h, k): Part => cbox(SC_COL.x(k), SC_BASE(k, s), SC_COL.z, [SC_COL.w, h, SC_COL.d], {
      id: `col${k}-${s}`, role: S.role, group: s === 2 ? `grow${k}` : undefined,
      decals: s === 2 ? { top: [{ t: 'segs', segs: [[0.08, 0.1, SC_COL.w - 0.08, 0.1]], stroke: 'soft' }] } : undefined,
    }))),
    ...tooltip('tip', SC_COL.x(5), SC_BASE(5, 3), SC_COL.z, 'tip'),
    // Legend card standing at the front right.
    box([5.9, SC.h, 4.35], [2.2, 0.75, 0.1], {
      id: 'legend', r: 0.08, axis: 'z',
      decals: {
        front: SERIES.flatMap((S, s): Decal[] => [
          { t: 'rect', x: 0.18 + s * 0.68, y: 0.29, w: 0.18, h: 0.18, r: 0.04, fill: S.role, stroke: 'soft' },
          { t: 'bar', x: 0.42 + s * 0.68, y: 0.34, w: 0.3, h: 0.07, fill: 'soft' },
        ]),
      },
    }),
    box([1.0, SC.h, 4.4], [2.6, 0.08, 0.6], { id: 'axis-title', r: 0.04, role: 'detail', decals: { top: textLines(0.2, 0.2, 2.2, [0.7], 0.1, 0.12, 'face') } }),
  ],
  motion: {
    duration: 3.2,
    label: 'the lit series regrows quarter by quarter',
    tracks: [
      ...SERIES[2].h.map((_, k): Track => ({
        group: `grow${k}`, s: { k: [1, SC_DIP, 1], pivot: [SC_COL.x(k), SC_BASE(k, 2), SC_COL.z] },
        from: k * 0.07, to: 0.55 + k * 0.07, ease: 'inOut',
      })),
      { group: 'tip', t: [0, -SERIES[2].h[5] * (1 - SC_DIP), 0], from: 5 * 0.07, to: 0.55 + 5 * 0.07, ease: 'inOut' },
    ],
  },
});

/* -------------------------------------------------------------- pie chart */
const PIE = { x: 2.9, z: 2.9, r: 1.75, h: 0.5, plate: 2.35, gap: 0.05, pull: 0.5 };
const PIE_Y = 0.25 + 0.14;
const SHARES = [0.12, 0.34, 0.22, 0.18, 0.14];
const PIE_ROLES: Role[] = ['accent', 'body', 'detail', 'face', 'ink'];
/** Slice angles; the accent slice is centred on 45 degrees, pointing at the viewer. */
const SLICES = (() => {
  let a = 45 - (SHARES[0] * 360) / 2;
  return SHARES.map((s) => {
    const a0 = a;
    a += s * 360;
    return { a0, a1: a, mid: (a0 + a) / 2 };
  });
})();
const off = (mid: number, d: number): [number, number] => [Math.cos((mid * Math.PI) / 180) * d, Math.sin((mid * Math.PI) / 180) * d];
const PULL = off(45, PIE.pull);

export const pieChart = defineDrawing({
  id: 'pie-chart',
  name: 'Exploded pie chart',
  category: 'charts',
  tags: ['chart', 'pie chart', 'pie', 'share', 'market share', 'breakdown', 'percentage', 'proportion', 'segments', 'budget', 'distribution', 'analytics'],
  kind: 'scene',
  prompt: '/isometric create an exploded pie chart with one slice pulled out, a callout and a legend, for our market share section',
  description: 'A five-slice pie stands on a ticked turntable plate, its slices parted by thin gaps. The lit slice is pulled out toward the viewer and lifts further as its callout card rises; a legend card with swatches stands at the right.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.0, 0.25, 6.0], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 7.6, h: 5.6, r: 0.12, stroke: 'soft' }], front: [slots(0.4, 0.08, 36, 0.2, 0.09, 'v')] } }),
    cyl([PIE.x, 0.25, PIE.z], PIE.plate, 0.14, {
      id: 'plate', n: 64, role: 'detail',
      decals: { top: [tickRing(PIE.plate, PIE.plate, PIE.plate - 0.08, 48, 4, 0.16), { t: 'circle', cx: PIE.plate, cy: PIE.plate, r: PIE.r + 0.12, stroke: 'soft' }] },
    }),
    ...SLICES.slice(1).map((S, k) => {
      const [du, dv] = off(S.mid, PIE.gap);
      return prism([PIE.x, PIE_Y, PIE.z], sector(0, PIE.r, S.a0, S.a1, 18, du, dv), PIE.h, { id: `slice${k + 1}`, axis: 'y', role: PIE_ROLES[k + 1] });
    }),
    prism([PIE.x, PIE_Y, PIE.z], sector(0, PIE.r, SLICES[0].a0, SLICES[0].a1, 10, PULL[0], PULL[1]), PIE.h, { id: 'slice0', axis: 'y', role: 'accent', group: 'slice', bias: 2 }),
    // Callout above the pulled slice.
    ...tooltip('callout', PIE.x + PULL[0] + off(45, PIE.r * 0.6)[0], PIE_Y + PIE.h, PIE.z + PULL[1] + off(45, PIE.r * 0.6)[1], 'slice', 0.7),
    // Legend.
    box([5.7, 0.25, 1.1], [1.8, 2.6, 0.12], {
      id: 'legend', r: 0.1, axis: 'z',
      decals: {
        front: [
          ...textLines(0.22, 0.25, 1.3, [0.8], 0.1, 0.14, 'detail'),
          ...PIE_ROLES.flatMap((role, k): Decal[] => [
            { t: 'rect', x: 0.22, y: 0.7 + k * 0.36, w: 0.2, h: 0.2, r: 0.05, fill: role, stroke: 'soft' },
            { t: 'bar', x: 0.55, y: 0.76 + k * 0.36, w: 0.5 + SHARES[k] * 1.2, h: 0.07, fill: 'soft' },
          ]),
        ],
      },
    }),
    box([5.55, 0.25, 1.22], [2.1, 0.1, 0.5], { id: 'legend-foot', r: 0.04, role: 'detail' }),
  ],
  motion: {
    duration: 2.8,
    label: 'the lit slice slides out and lifts',
    tracks: [{ group: 'slice', t: [PULL[0] * 0.7, 0.35, PULL[1] * 0.7], from: 0.1, to: 0.75, ease: 'back' }],
  },
});

/* ------------------------------------------------------- candlestick chart */
const CS = { w: 9.6, d: 4.2, h: 0.25 };
const CS_WALL = { x: 0.5, z: 0.5, w: 8.6, h: 5.0, t: 0.12 };
const CANDLE = { x: (k: number) => 1.2 + k * 0.62, z: 0.95, w: 0.42 };
/** World y of a price: steep, so the uptrend still reads against the isometric fall-off to the right. */
const P = (p: number) => CS.h + 0.35 + (p - 0.85) * 2.4;
/** open, close, high, low */
const OHLC: [number, number, number, number][] = [
  [1.0, 1.3, 1.45, 0.85], [1.3, 1.15, 1.4, 1.0], [1.15, 1.5, 1.6, 1.1], [1.5, 1.75, 1.9, 1.4],
  [1.75, 1.55, 1.85, 1.45], [1.55, 1.4, 1.6, 1.25], [1.4, 1.7, 1.8, 1.35], [1.7, 1.95, 2.05, 1.6],
  [1.95, 1.8, 2.1, 1.7], [1.8, 2.05, 2.15, 1.75], [2.05, 1.9, 2.2, 1.85], [1.9, 2.55, 2.7, 1.85],
];
const LAST = OHLC.length - 1;
const VOLUME = [0.28, 0.21, 0.38, 0.42, 0.25, 0.21, 0.35, 0.45, 0.28, 0.38, 0.25, 0.75];
const VOL_Z = 2.35;
const CS_DIP = 0.35;

function candle(k: number): Part[] {
  const [o, c, h, l] = OHLC[k];
  const x = CANDLE.x(k), lo = Math.min(o, c), hi = Math.max(o, c);
  const up = c >= o, lit = k === LAST;
  const role: Role = lit ? 'accent' : up ? 'face' : 'ink';
  const group = lit ? 'today' : undefined;
  return [
    cyl([x, P(l), CANDLE.z], 0.035, P(lo) - P(l), { id: `wick-lo${k}`, role: 'ink', n: 8 }),
    cbox(x, P(lo), CANDLE.z, [CANDLE.w, Math.max(P(hi) - P(lo), 0.06), CANDLE.w], { id: `candle${k}`, r: 0.03, role, group }),
    cyl([x, P(hi), CANDLE.z], 0.035, P(h) - P(hi), { id: `wick-hi${k}`, role: 'ink', n: 8, group }),
  ];
}

/** A three-period moving average of the closes, drawn on the wall's front face. */
const maLine = (): [number, number][] => OHLC.map((_, k) => {
  const w = OHLC.slice(Math.max(0, k - 2), k + 1);
  const avg = w.reduce((a, q) => a + q[1], 0) / w.length;
  return [CANDLE.x(k) - CS_WALL.x, CS_WALL.h - (P(avg) - CS.h)];
});

export const candlestickChart = defineDrawing({
  id: 'candlestick-chart',
  name: 'Candlestick chart',
  category: 'charts',
  tags: ['chart', 'candlestick', 'stock', 'trading', 'market', 'price', 'finance', 'crypto', 'ohlc', 'volume', 'investing', 'fintech', 'exchange'],
  kind: 'scene',
  prompt: '/isometric create a candlestick stock chart with wicks, volume bars and a moving average, for our trading app landing page',
  description: 'Twelve candlesticks float in front of a gridded price wall: hollow candles for up days, solid ones for down days, each with thin high and low wicks. A moving average traces the wall, volume bars stand on the floor in front, and the lit breakout candle at the end climbs with its tall volume bar and a price tag.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [CS.w, CS.h, CS.d], {
      id: 'deck', r: 0.15, role: 'face',
      decals: {
        top: [
          { t: 'segs', segs: [[0.8, 3.05, 8.9, 3.05]], stroke: true },
          ...OHLC.map((_, k): Decal => ({ t: 'bar', x: CANDLE.x(k) - 0.12, y: 3.4, w: 0.24, h: 0.06, fill: 'soft' })),
          { t: 'segs', segs: OHLC.map((_, k): Seg => [CANDLE.x(k), 3.05, CANDLE.x(k), 3.22]), stroke: true },
          { t: 'segs', segs: [[0.8, 1.55, 8.9, 1.55]], stroke: 'soft' },
        ],
        front: [slots(0.4, 0.08, 44, 0.2, 0.09, 'v')],
      },
    }),
    box([CS_WALL.x, CS.h, CS_WALL.z], [CS_WALL.w, CS_WALL.h, CS_WALL.t], {
      id: 'wall', r: 0.04,
      decals: {
        front: [
          wallGrid(CS_WALL.w, CS_WALL.h, 0.6, 0.2, CS_WALL.w - 0.8),
          ...axisLabels(CS_WALL.h, 0.6, CS_WALL.w - 0.55, 0.36),
          { t: 'line', pts: maLine(), stroke: true, width: 1.5 },
          ...textLines(0.25, 0.22, 1.6, [0.6, 1], 0.22, 0.1, 'detail'),
          { t: 'rect', x: 5.6, y: 0.18, w: 2.0, h: 0.3, r: 0.15, stroke: 'soft' },
          ...[0, 1, 2, 3].map((k): Decal => ({ t: 'bar', x: 5.75 + k * 0.46, y: 0.29, w: 0.24, h: 0.08, fill: k === 2 ? 'ink' : 'soft' })),
        ],
      },
    }),
    ...OHLC.flatMap((_, k) => candle(k)),
    // Volume.
    ...VOLUME.map((h, k) => cbox(CANDLE.x(k), CS.h, VOL_Z, [0.4, h, 0.4], {
      id: `vol${k}`, r: 0.03, role: k === LAST ? 'accent' : 'detail', group: k === LAST ? 'volume' : undefined,
    })),
    // Price tag at the latest close.
    box([CANDLE.x(LAST) + 0.3, P(OHLC[LAST][1]) - 0.2, CANDLE.z - 0.04], [0.9, 0.4, 0.08], {
      id: 'price-tag', r: 0.12, axis: 'z', role: 'ink', group: 'tag',
      decals: { front: [{ t: 'circle', cx: 0.18, cy: 0.2, r: 0.06, fill: 'accent' }, { t: 'bar', x: 0.32, y: 0.16, w: 0.45, h: 0.08, fill: 'face' }] },
    }),
  ],
  motion: {
    duration: 3,
    label: 'the breakout candle climbs on rising volume',
    tracks: [
      { group: 'today', s: { k: [1, CS_DIP, 1], pivot: [CANDLE.x(LAST), P(OHLC[LAST][0]), CANDLE.z] }, from: 0.1, to: 0.8, ease: 'inOut' },
      { group: 'tag', t: [0, -(P(OHLC[LAST][1]) - P(OHLC[LAST][0])) * (1 - CS_DIP), 0], from: 0.1, to: 0.8, ease: 'inOut' },
      { group: 'volume', s: { k: [1, 0.4, 1], pivot: [CANDLE.x(LAST), CS.h, VOL_Z] }, from: 0.05, to: 0.7, ease: 'inOut' },
    ],
  },
});

/* --------------------------------------------------------- 3D scatter plot */
const SP = { w: 7.8, d: 6.6, h: 0.2, plot: 6.0, wall: 4.2, t: 0.1 };
const SP_Y = SP.h;
type Pt = [number, number, number];
const CLUSTERS: { pts: Pt[]; r: number; role: Role }[] = [
  { pts: [[1.2, 0.9, 4.7], [1.8, 1.4, 4.0], [2.4, 1.0, 4.9], [1.5, 1.9, 3.2], [2.7, 1.6, 3.9], [1.0, 1.3, 3.6]], r: 0.22, role: 'body' },
  { pts: [[3.8, 2.1, 1.5], [4.7, 1.7, 2.2], [4.2, 2.7, 1.0], [5.1, 2.4, 1.4], [3.5, 1.6, 2.6], [5.0, 2.9, 2.7]], r: 0.2, role: 'face' },
  { pts: [[4.3, 3.0, 4.2], [5.1, 2.7, 5.0], [3.6, 3.4, 4.9]], r: 0.3, role: 'accent' },
  { pts: [[2.8, 3.1, 1.4], [0.9, 2.6, 1.3]], r: 0.14, role: 'detail' },
];
const RISE = 0.45;

function point(c: number, k: number): Part[] {
  const { pts, r, role } = CLUSTERS[c];
  const [x, y, z] = pts[k];
  const lit = role === 'accent';
  const top = SP_Y + y - r;
  return [
    cyl([x, SP_Y, z], 0.025, top - SP_Y, { id: `stem${c}-${k}`, role: lit ? 'ink' : 'detail', n: 8, group: lit ? `stem${k}` : undefined }),
    ball([x, SP_Y + y, z], r, { id: `pt${c}-${k}`, role, group: lit ? `pt${k}` : undefined }),
  ];
}

const gridSegs = (len: number, step: number, other: number, along: 'u' | 'v', from = 0): Seg[] => {
  const out: Seg[] = [];
  for (let s = from + step; s < len - 0.05; s += step) out.push(along === 'u' ? [0.15, s, other - 0.15, s] : [s, 0.15, s, other - 0.15]);
  return out;
};

export const scatterPlot = defineDrawing({
  id: 'scatter-3d',
  name: '3D scatter plot',
  category: 'charts',
  tags: ['chart', 'scatter plot', 'scatter', '3d', 'clusters', 'correlation', 'data science', 'statistics', 'bubble chart', 'segmentation', 'machine learning', 'regression'],
  kind: 'scene',
  prompt: '/isometric create a 3D scatter plot inside gridded axis walls with clusters of points on stems, for our data science feature',
  description: 'A three-axis plot corner: a gridded floor and two gridded walls. Points on thin stems form two clusters with shadow marks on the floor, a few outliers drift at the back, and a lit cluster of larger bubbles rises above the rest. A legend card lies beside the plot.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [SP.w, SP.h, SP.d], {
      id: 'deck', r: 0.15, role: 'face',
      decals: {
        top: [
          { t: 'segs', segs: [...gridSegs(SP.plot, 0.75, SP.plot, 'u'), ...gridSegs(SP.plot, 0.75, SP.plot, 'v')], stroke: 'soft' },
          { t: 'rect', x: 0.1, y: 0.1, w: SP.plot - 0.1, h: SP.plot - 0.1, r: 0.06, stroke: true },
          ...CLUSTERS.flatMap((C) => C.pts.map(([x, , z]): Decal => ({ t: 'circle', cx: x, cy: z, r: C.r * 0.75, fill: 'soft', opacity: 0.35 }))),
        ],
        front: [slots(0.4, 0.07, 36, 0.2, 0.08, 'v')],
      },
    }),
    box([0, SP_Y, 0], [SP.plot, SP.wall, SP.t], {
      id: 'wall-back', r: 0.03,
      decals: { front: [{ t: 'segs', segs: [...gridSegs(SP.wall, 0.75, SP.plot, 'u'), ...gridSegs(SP.plot, 0.75, SP.wall, 'v')], stroke: 'soft' }] },
    }),
    box([0, SP_Y, SP.t], [SP.t, SP.wall, SP.plot - SP.t], {
      id: 'wall-left', r: 0.03,
      decals: { right: [{ t: 'segs', segs: [...gridSegs(SP.wall, 0.75, SP.plot - SP.t, 'u'), ...gridSegs(SP.plot - SP.t, 0.75, SP.wall, 'v')], stroke: 'soft' }] },
    }),
    // Axis rods along the floor edges, with end caps.
    box([0.1, SP_Y, SP.plot - 0.06], [SP.plot - 0.1, 0.06, 0.06], { id: 'axis-x', role: 'ink' }),
    box([SP.plot - 0.06, SP_Y, 0.1], [0.06, 0.06, SP.plot - 0.16], { id: 'axis-z', role: 'ink' }),
    ...CLUSTERS.flatMap((C, c) => C.pts.flatMap((_, k) => point(c, k))),
    // Legend.
    box([6.3, SP_Y, 3.6], [1.25, 0.1, 2.6], {
      id: 'legend', r: 0.06,
      decals: {
        top: [
          ...textLines(0.18, 0.2, 0.9, [0.8], 0.1, 0.1, 'detail'),
          ...CLUSTERS.flatMap((C, c): Decal[] => [
            { t: 'circle', cx: 0.3, cy: 0.7 + c * 0.45, r: 0.11, fill: C.role, stroke: 'soft' },
            { t: 'bar', x: 0.52, y: 0.67 + c * 0.45, w: 0.5, h: 0.06, fill: 'soft' },
          ]),
        ],
      },
    }),
  ],
  motion: {
    duration: 3,
    label: 'the lit cluster rises on its stems',
    tracks: CLUSTERS[2].pts.flatMap(([x, y, z], k): Track[] => {
      const len = y - CLUSTERS[2].r;
      return [
        { group: `pt${k}`, t: [0, RISE, 0], from: k * 0.1, to: 0.7 + k * 0.1, ease: 'inOut' },
        { group: `stem${k}`, s: { k: [1, (len + RISE) / len, 1], pivot: [x, SP_Y, z] }, from: k * 0.1, to: 0.7 + k * 0.1, ease: 'inOut' },
      ];
    }),
  },
});

/* ------------------------------------------------------- conversion funnel */
const FN = { x: 2.7, z: 3.0, spout: 0.5, stage: 0.62, gap: 0.08, rb: 0.6, rt: 2.0 };
const FN_Y0 = 0.25 + FN.spout;
const FN_H = 4 * (FN.stage + FN.gap) - FN.gap;
const FN_R = (h: number) => FN.rb + ((FN.rt - FN.rb) * h) / FN_H;
const STAGES: { role: Role; rate: number }[] = [
  { role: 'accent', rate: 0.22 }, { role: 'detail', rate: 0.45 }, { role: 'body', rate: 0.7 }, { role: 'face', rate: 1 },
];
const stageY = (j: number) => FN_Y0 + j * (FN.stage + FN.gap);
const FN_TOP = FN_Y0 + FN_H;
const CARD = { x: 5.4, z: 2.85, w: 2.0, h: 0.5 };
const LEADS: [number, number, number, Role][] = [[-0.5, 0.45, 0.1, 'detail'], [0.15, 0.85, -0.45, 'body'], [0.45, 0.4, 0.45, 'detail'], [-0.1, 1.25, 0.3, 'face'], [0.55, 1.05, -0.1, 'body']];
const COIN = { x: 4.4, z: 4.9, r: 0.32, h: 0.1 };

export const conversionFunnel = defineDrawing({
  id: 'conversion-funnel',
  name: 'Conversion funnel',
  category: 'charts',
  tags: ['chart', 'funnel', 'conversion', 'sales funnel', 'marketing', 'pipeline', 'leads', 'growth', 'acquisition', 'checkout', 'stages', 'analytics'],
  kind: 'scene',
  prompt: '/isometric create a sales funnel chart with stacked stages, leads dropping in and conversion cards per stage, for our growth marketing page',
  description: 'Four stacked frustum stages narrow from a wide visits stage to the lit purchase stage at the bottom, standing on a short spout. Each stage is wired to a card showing its conversion rate. Leads drop into the open top while converted coins stack up on a tray at the front.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.0, 0.25, 6.0], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 7.6, h: 5.6, r: 0.12, stroke: 'soft' }, { t: 'circle', cx: FN.x, cy: FN.z, r: 0.75, stroke: 'soft' }], front: [slots(0.4, 0.08, 36, 0.2, 0.09, 'v')] } }),
    cyl([FN.x, 0.25, FN.z], 0.38, FN.spout, { id: 'spout', role: 'ink', n: 32 }),
    ...STAGES.map((S, j) => {
      const h0 = j * (FN.stage + FN.gap), rt = FN_R(h0 + FN.stage);
      return cyl([FN.x, stageY(j), FN.z], FN_R(h0), FN.stage, {
        id: `stage${j}`, r2: rt, n: 56, role: S.role,
        decals: j === 3 ? { top: [{ t: 'circle', cx: rt, cy: rt, r: rt - 0.18, fill: 'bg', stroke: true }, { t: 'circle', cx: rt, cy: rt, r: 0.3, fill: 'detail', stroke: 'soft' }] } : undefined,
      });
    }),
    // Leader rods and stage cards.
    ...STAGES.flatMap((S, j): Part[] => {
      const ym = stageY(j) + FN.stage / 2, x0 = FN.x + FN_R(j * (FN.stage + FN.gap) + FN.stage) + 0.06;
      return [
        box([x0, ym - 0.03, CARD.z + 0.12], [CARD.x - x0, 0.06, 0.06], { id: `lead-rod${j}`, role: 'ink' }),
        box([CARD.x, ym - CARD.h / 2, CARD.z], [CARD.w, CARD.h, 0.1], {
          id: `card${j}`, r: 0.1, axis: 'z', role: j === 0 ? 'ink' : 'face',
          decals: {
            front: [
              { t: 'circle', cx: 0.22, cy: 0.25, r: 0.09, fill: j === 0 ? 'accent' : S.role, stroke: 'soft' },
              { t: 'rect', x: 0.42, y: 0.19, w: 1.4, h: 0.12, r: 0.06, fill: j === 0 ? 'face' : 'soft', opacity: 0.4 },
              { t: 'rect', x: 0.42, y: 0.19, w: 1.4 * S.rate, h: 0.12, r: 0.06, fill: j === 0 ? 'accent' : 'detail' },
            ],
          },
        }),
      ];
    }),
    // Leads above the open top.
    ...LEADS.map(([dx, dy, dz, role], k) => ball([FN.x + dx, FN_TOP + 0.18 + dy, FN.z + dz], 0.17, { id: `lead${k}`, role, group: 'leads' })),
    // Coin tray at the front with a stack and one coin landing.
    box([3.6, 0.25, 4.3], [1.6, 0.1, 1.2], { id: 'tray', r: 0.08, role: 'detail' }),
    ...[0, 1, 2].map((k) => cyl([COIN.x, 0.35 + k * COIN.h, COIN.z], COIN.r, COIN.h, { id: `coin${k}`, n: 32, role: 'face', decals: k === 2 ? { top: [{ t: 'circle', cx: COIN.r, cy: COIN.r, r: COIN.r * 0.6, stroke: 'soft' }] } : undefined })),
    cyl([COIN.x, 0.35 + 3 * COIN.h + 0.55, COIN.z], COIN.r, COIN.h, { id: 'coin-new', n: 32, role: 'accent', group: 'coin', decals: { top: [{ t: 'circle', cx: COIN.r, cy: COIN.r, r: COIN.r * 0.6, stroke: 'soft' }] } }),
  ],
  motion: {
    duration: 3,
    label: 'leads drop in and a conversion lands',
    tracks: [
      { group: 'leads', t: [0, -0.5, 0], from: 0, to: 0.6, ease: 'in' },
      { group: 'coin', t: [0, -0.55, 0], from: 0.4, to: 0.95, ease: 'in' },
    ],
  },
});

/* -------------------------------------------------------------- 3D heatmap */
const HM = { cols: 9, rows: 7, cell: 0.6, gap: 0.08, x0: 0.6, z0: 0.6, y: 0.25 };
const HM_PEAK = { i: 6, j: 2 };
const hmHeight = (i: number, j: number) =>
  0.12 + 2.1 * Math.exp(-(((i - HM_PEAK.i) ** 2) / 5 + ((j - HM_PEAK.j) ** 2) / 3.5)) + 1.0 * Math.exp(-(((i - 2) ** 2) / 4 + ((j - 5) ** 2) / 3));
const HM_LEVELS: Role[] = ['face', 'body', 'detail', 'ink'];
const hmRole = (h: number): Role => HM_LEVELS[Math.min(3, Math.floor(h / 0.6))];
const hmX = (i: number) => HM.x0 + i * (HM.cell + HM.gap);
const hmZ = (j: number) => HM.z0 + j * (HM.cell + HM.gap);
const HM_DIP = 0.55;

export const heatmap3d = defineDrawing({
  id: 'heatmap-3d',
  name: '3D heatmap',
  category: 'charts',
  tags: ['chart', 'heatmap', 'heat map', '3d', 'surface', 'matrix', 'density', 'grid', 'usage', 'activity', 'correlation', 'histogram', 'terrain'],
  kind: 'scene',
  prompt: '/isometric create a 3D heatmap where every cell is a column whose height and shade follow its value, with a colour scale legend, for our usage analytics page',
  description: 'A nine-by-seven grid of square columns rises from a ruled board into two hills; taller cells take darker shades. The single highest cell is lit and carries a tooltip. A stepped colour-scale key stands to the right, and a ripple passes across the grid column by column.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.4, HM.y, 6.0], {
      id: 'deck', r: 0.15, role: 'face',
      decals: {
        top: [
          ...Array.from({ length: HM.cols }, (_, i): Decal => ({ t: 'bar', x: hmX(i) + 0.15, y: hmZ(HM.rows) + 0.08, w: 0.3, h: 0.07, fill: 'soft' })),
          ...Array.from({ length: HM.rows }, (_, j): Decal => ({ t: 'bar', x: 0.12, y: hmZ(j) + 0.26, w: 0.3, h: 0.07, fill: 'soft' })),
          { t: 'rect', x: HM.x0 - 0.1, y: HM.z0 - 0.1, w: HM.cols * (HM.cell + HM.gap) + 0.12, h: HM.rows * (HM.cell + HM.gap) + 0.12, r: 0.08, stroke: 'soft' },
        ],
        front: [slots(0.4, 0.08, 38, 0.2, 0.09, 'v')],
      },
    }),
    ...Array.from({ length: HM.cols * HM.rows }, (_, n): Part => {
      const i = n % HM.cols, j = Math.floor(n / HM.cols), h = hmHeight(i, j);
      const peak = i === HM_PEAK.i && j === HM_PEAK.j;
      return box([hmX(i), HM.y, hmZ(j)], [HM.cell, h, HM.cell], {
        id: `cell${i}-${j}`, r: 0.03, role: peak ? 'accent' : hmRole(h), group: `col${i}`,
      });
    }),
    ...tooltip('tip', hmX(HM_PEAK.i) + HM.cell / 2, HM.y + hmHeight(HM_PEAK.i, HM_PEAK.j), hmZ(HM_PEAK.j) + HM.cell / 2, 'tip', 0.35),
    // Colour-scale key.
    box([7.0, HM.y, 1.0], [0.9, 0.1, 3.4], { id: 'key-base', r: 0.05, role: 'detail' }),
    ...HM_LEVELS.map((role, k) => box([7.15, HM.y + 0.1, 1.2 + k * 0.8], [0.6, 0.12 + k * 0.12, 0.6], {
      id: `key${k}`, r: 0.03, role,
      decals: { top: [{ t: 'bar', x: 0.15, y: 0.27, w: 0.3, h: 0.06, fill: role === 'ink' ? 'face' : 'soft' }] },
    })),
  ],
  motion: {
    duration: 3.6,
    label: 'a ripple passes across the grid',
    tracks: [
      ...Array.from({ length: HM.cols }, (_, i): Track => ({
        group: `col${i}`, s: { k: [1, HM_DIP, 1], pivot: [hmX(i), HM.y, HM.z0] }, from: i * 0.06, to: 0.5 + i * 0.06, ease: 'inOut',
      })),
      { group: 'tip', t: [0, -hmHeight(HM_PEAK.i, HM_PEAK.j) * (1 - HM_DIP), 0], from: HM_PEAK.i * 0.06, to: 0.5 + HM_PEAK.i * 0.06, ease: 'inOut' },
    ],
  },
});

/* ----------------------------------------------------- layered area chart */
const AC = { w: 9.0, d: 5.6, h: 0.25 };
const AC_WALL = { x: 0.5, z: 0.5, w: 8.0, h: 3.5, t: 0.1 };
const AC_X0 = 1.0, AC_STEP = 0.55, AC_LEN = 0.5;
const LAYERS: { z: number; ys: number[]; role: Role }[] = [
  { z: 1.1, ys: [1.6, 1.9, 1.8, 2.2, 2.5, 2.3, 2.6, 2.9, 2.7, 2.5, 2.8, 3.0, 2.9], role: 'body' },
  { z: 2.2, ys: [1.0, 1.2, 1.5, 1.3, 1.6, 1.9, 1.7, 1.8, 2.1, 2.0, 2.3, 2.2, 2.4], role: 'detail' },
  { z: 3.3, ys: [0.4, 0.6, 0.5, 0.8, 0.7, 1.0, 1.2, 1.1, 1.4, 1.6, 1.5, 1.8, 2.05], role: 'accent' },
];
const FRONT = LAYERS[2];
const MARK_R = 0.09;
const MARK_Z = FRONT.z + AC_LEN + MARK_R;
const AC_K = 0.55;
const areaProfile = (ys: number[]): [number, number][] => [[0, 0], ...ys.map((y, k): [number, number] => [k * AC_STEP, y]), [(ys.length - 1) * AC_STEP, 0]];
const ACX = (k: number) => AC_X0 + k * AC_STEP;

export const areaChart = defineDrawing({
  id: 'area-chart',
  name: 'Layered area chart',
  category: 'charts',
  tags: ['chart', 'area chart', 'line chart', 'time series', 'trend', 'growth', 'ridgeline', 'traffic', 'forecast', 'metrics', 'monitoring', 'analytics'],
  kind: 'scene',
  prompt: '/isometric create a layered 3D area chart with three series one behind another, data markers and a tooltip, for our traffic analytics hero',
  description: 'Three extruded area series stand in rows in front of a gridded wall, each rising over thirteen periods. The lit front series carries ink data markers along its edge and a tooltip at the latest point, and it climbs while the series behind hold still. Legend chips and period ticks line the floor.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [AC.w, AC.h, AC.d], {
      id: 'deck', r: 0.15, role: 'face',
      decals: {
        top: [
          { t: 'segs', segs: FRONT.ys.map((_, k): Seg => [ACX(k), 4.45, ACX(k), 4.62]), stroke: true },
          { t: 'segs', segs: [[AC_X0 - 0.2, 4.45, ACX(12) + 0.2, 4.45]], stroke: true },
          ...FRONT.ys.filter((_, k) => k % 2 === 0).map((_, k): Decal => ({ t: 'bar', x: ACX(k * 2) - 0.15, y: 4.8, w: 0.3, h: 0.07, fill: 'soft' })),
          ...LAYERS.flatMap((L, k): Decal[] => [
            { t: 'rect', x: 5.6 + k * 1.05, y: 5.05, w: 0.18, h: 0.18, r: 0.04, fill: L.role, stroke: 'soft' },
            { t: 'bar', x: 5.85 + k * 1.05, y: 5.1, w: 0.5, h: 0.07, fill: 'soft' },
          ]),
        ],
        front: [slots(0.4, 0.08, 42, 0.2, 0.09, 'v')],
      },
    }),
    box([AC_WALL.x, AC.h, AC_WALL.z], [AC_WALL.w, AC_WALL.h, AC_WALL.t], {
      id: 'wall', r: 0.04,
      decals: {
        front: [
          wallGrid(AC_WALL.w, AC_WALL.h, 0.5),
          ...axisLabels(AC_WALL.h, 0.5),
          { t: 'segs', segs: FRONT.ys.map((_, k): Seg => [ACX(k) - AC_WALL.x, 0.5, ACX(k) - AC_WALL.x, AC_WALL.h - 0.1]), stroke: 'soft' },
          ...textLines(0.5, 0.15, 2.0, [0.7], 0.1, 0.13, 'detail'),
        ],
      },
    }),
    ...LAYERS.map((L, k) => prism([AC_X0, AC.h, L.z], areaProfile(L.ys), AC_LEN, { id: `area${k}`, axis: 'z', role: L.role, group: k === 2 ? 'front' : undefined })),
    ...FRONT.ys.map((y, k) => ball([ACX(k), AC.h + y, MARK_Z], MARK_R, { id: `mark${k}`, role: 'ink', group: `mark${k}` })),
    ...tooltip('tip', ACX(12), AC.h + FRONT.ys[12] + MARK_R, MARK_Z, 'mark12', 0.4),
  ],
  motion: {
    duration: 3.2,
    label: 'the front series climbs to its latest value',
    tracks: [
      { group: 'front', s: { k: [1, AC_K, 1], pivot: [AC_X0, AC.h, FRONT.z] }, from: 0.05, to: 0.75, ease: 'inOut' },
      ...FRONT.ys.map((y, k): Track => ({ group: `mark${k}`, t: [0, -y * (1 - AC_K), 0], from: 0.05, to: 0.75, ease: 'inOut' })),
    ],
  },
});

