/**
 * Industry scenes: a CNC milling machine cutting a part, a wind turbine with
 * its substation, a thermal power station, an oil refinery and a bottling line.
 */
import { defineDrawing, box, cbox, cyl, cone, ball, prism, slots, textLines, grid, tickRing, gearProfile } from '../build.js';
import type { Decal, Part, Role } from '../model.js';
import type { Vec3 } from '../math.js';

const CREATED = '2026-11-13';

/* ------------------------------------------------------- CNC milling machine */
const BASE_TOP = 1.5;
const SP = { x: 3.3, z: 2.8 }; // spindle axis
const HEAD_Y = 3.85; // underside of the spindle head
const PLUNGE = 0.5, TRAVEL = -0.35;
const MAG = { x: 4.3, z: 1.5, y: 4.6, n: 12 };

export const cncMill = defineDrawing({
  id: 'cnc-mill',
  name: 'CNC milling machine',
  category: 'industry',
  tags: ['cnc', 'milling', 'machining', 'machine tool', 'manufacturing', 'factory', 'spindle', 'industry', 'precision', 'fabrication'],
  kind: 'scene',
  prompt: '/isometric create a CNC milling machine cutting a part, with its tool magazine and control cabinet, for our manufacturing page',
  description: 'A vertical machining centre: a cast base with a sliding table and a vise holding the lit workpiece, a column carrying the spindle head and a notched tool magazine, a chip conveyor emptying into a bin and a control cabinet with a screen, keypad and stack light. The spindle plunges, the table feeds the part under the cutter and the magazine indexes.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.6, 0.3, 5.6], { id: 'deck', r: 0.15, role: 'face', decals: { top: [slots(0.3, 5.2, 41, 0.2, 0.2, 'v')] } }),
    // Machine base and column.
    box([1.0, 0.3, 1.0], [4.6, 1.2, 3.6], {
      id: 'base', r: 0.06,
      decals: {
        front: [
          { t: 'rect', x: 0.3, y: 0.2, w: 1.6, h: 0.8, r: 0.05, stroke: 'soft' },
          { t: 'bar', x: 1.55, y: 0.55, w: 0.25, h: 0.07, fill: 'ink' },
          slots(2.4, 0.3, 10, 0.18, 0.6, 'v'),
        ],
        right: [slots(0.3, 0.3, 8, 0.2, 0.6, 'v'), { t: 'rect', x: 2.2, y: 0.25, w: 1.1, h: 0.7, r: 0.05, stroke: 'soft' }],
      },
    }),
    box([2.3, BASE_TOP, 1.0], [2.0, 4.0, 1.0], {
      id: 'column',
      decals: {
        front: [
          { t: 'rect', x: 0.06, y: 0.2, w: 0.14, h: 3.6, r: 0.04, fill: 'detail', stroke: 'soft' },
          { t: 'rect', x: 1.8, y: 0.2, w: 0.14, h: 3.6, r: 0.04, fill: 'detail', stroke: 'soft' },
        ],
        right: [slots(0.2, 2.3, 4, 0.2, 1.4, 'v')],
      },
    }),
    // Tool magazine on the column side: a notched disc that indexes.
    prism([MAG.x, 0, 0], gearProfile(MAG.n, 0.65, 0.5, MAG.z, MAG.y), 0.15, { id: 'magazine', axis: 'x', role: 'detail', group: 'mag' }),
    cyl([MAG.x + 0.15, MAG.y, MAG.z], 0.2, 0.1, { id: 'magazine-hub', axis: 'x', role: 'ink', group: 'mag', n: 24 }),
    // Spindle head, motor and cutter.
    box([2.55, HEAD_Y, 2.0], [1.5, 1.2, 1.4], {
      id: 'head', r: 0.08, role: 'face', group: 'head',
      decals: {
        front: [
          { t: 'rect', x: 0.15, y: 0.15, w: 0.6, h: 0.32, r: 0.04, fill: 'detail', stroke: 'soft' },
          { t: 'circle', cx: 1.2, cy: 0.3, r: 0.07, fill: 'accent' },
          slots(0.2, 0.7, 7, 0.18, 0.3, 'v'),
        ],
        right: [slots(0.25, 0.25, 6, 0.18, 0.5, 'v')],
      },
    }),
    cyl([SP.x, HEAD_Y + 1.2, SP.z], 0.35, 0.45, { id: 'spindle-motor', role: 'detail', group: 'head', n: 32, decals: { top: [tickRing(0.35, 0.35, 0.3, 16, 4, 0.1)] } }),
    cyl([SP.x, HEAD_Y, SP.z], 0.32, -0.35, { id: 'spindle', role: 'detail', group: 'head', n: 32 }),
    cyl([SP.x, HEAD_Y - 0.35, SP.z], 0.18, -0.25, { id: 'tool-holder', role: 'ink', group: 'head', n: 24 }),
    cyl([SP.x, HEAD_Y - 0.6, SP.z], 0.07, -0.35, { id: 'cutter', role: 'ink', group: 'head', n: 16 }),
    // Saddle, table, vise and workpiece.
    box([1.6, BASE_TOP, 2.05], [3.4, 0.2, 1.6], { id: 'saddle', role: 'detail' }),
    box([1.3, BASE_TOP + 0.2, 2.1], [4.0, 0.25, 1.4], {
      id: 'table', role: 'face', group: 'table',
      decals: { top: [slots(0.2, 0.35, 3, 0.35, 3.6, 'h')], front: [{ t: 'circle', cx: 0.15, cy: 0.12, r: 0.06, fill: 'ink' }, { t: 'circle', cx: 3.85, cy: 0.12, r: 0.06, fill: 'ink' }] },
    }),
    box([2.65, 1.95, 2.3], [0.3, 0.45, 1.0], { id: 'jaw-fixed', r: 0.03, role: 'ink', group: 'table' }),
    box([2.95, 1.95, 2.3], [0.8, 0.1, 1.0], { id: 'vise-bed', role: 'detail', group: 'table' }),
    box([3.75, 1.95, 2.3], [0.3, 0.45, 1.0], { id: 'jaw-moving', r: 0.03, role: 'ink', group: 'table' }),
    cyl([4.05, 2.15, 2.8], 0.05, 0.4, { id: 'vise-screw', axis: 'x', role: 'ink', group: 'table', n: 12 }),
    box([2.95, 2.05, 2.4], [0.8, 0.35, 0.8], {
      id: 'workpiece', r: 0.02, role: 'accent', group: 'table',
      decals: { top: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.5, h: 0.5, r: 0.05, fill: 'face', stroke: true }] },
    }),
    // Chip conveyor and bin.
    box([5.6, 0.3, 3.2], [1.5, 0.5, 1.0], { id: 'chip-conveyor', role: 'detail', decals: { top: [slots(0.15, 0.1, 9, 0.15, 0.8, 'v')] } }),
    box([7.1, 0.3, 3.0], [1.0, 0.75, 1.4], { id: 'chip-bin', r: 0.05, role: 'face', decals: { front: [{ t: 'rect', x: 0.2, y: 0.2, w: 0.6, h: 0.3, r: 0.04, stroke: 'soft' }], top: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.8, h: 1.2, r: 0.05, fill: 'detail', stroke: 'soft' }] } }),
    // Control cabinet with a stack light.
    box([6.0, 0.3, 0.9], [1.3, 2.4, 0.9], {
      id: 'cabinet', r: 0.04,
      decals: {
        front: [
          { t: 'rect', x: 0.15, y: 0.2, w: 1.0, h: 0.7, r: 0.04, fill: 'ink' },
          ...textLines(0.25, 0.32, 0.7, [0.8, 0.5, 0.65], 0.15, 0.05, 'soft'),
          ...grid(0.2, 1.05, 4, 3, 0.18, 0.14, 0.06, { fill: 'detail' }),
          { t: 'circle', cx: 0.35, cy: 1.85, r: 0.1, fill: 'accent' },
          { t: 'circle', cx: 0.9, cy: 1.85, r: 0.12, fill: 'ink' },
        ],
        right: [slots(0.2, 0.3, 4, 0.15, 1.6, 'v')],
      },
    }),
    cyl([6.35, 2.7, 1.25], 0.04, 0.3, { id: 'light-pole', role: 'ink', n: 10 }),
    cyl([6.35, 3.0, 1.25], 0.1, 0.18, { id: 'light-1', role: 'detail', n: 20 }),
    cyl([6.35, 3.18, 1.25], 0.1, 0.18, { id: 'light-2', role: 'accent', n: 20 }),
    cyl([6.35, 3.36, 1.25], 0.1, 0.18, { id: 'light-3', role: 'face', n: 20 }),
    cyl([6.35, 3.54, 1.25], 0.1, 0.05, { id: 'light-cap', role: 'ink', n: 20 }),
  ],
  motion: {
    duration: 4.4,
    label: 'the spindle plunges, the table feeds and the magazine indexes',
    tracks: [
      { group: 'head', t: [0, -PLUNGE, 0], from: 0, to: 0.35, ease: 'inOut' },
      { group: 'table', t: [TRAVEL, 0, 0], from: 0.4, to: 1, ease: 'inOut' },
      { group: 'mag', r: { axis: 'x', deg: 60, pivot: [0, MAG.y, MAG.z] }, from: 0, to: 0.3, ease: 'inOut' },
    ],
  },
});

/* ------------------------------------------------------------ wind turbine */
const WT = { x: 3.4, z: 3.0 };
const TT = 0.55 + 5.6; // top of the tower
const NAC = { z0: 2.0, d: 1.7, h: 0.85 };
const HUB: Vec3 = [WT.x, TT + NAC.h / 2, NAC.z0 + NAC.d];
const ROTOR_Z = HUB[2] + 0.25; // blades sit between the hub and the spinner
const BLADE_LEN = 3.4;

const blade = (k: number): Part =>
  prism(
    [0, 0, ROTOR_Z],
    ([[-0.13, 0.15], [0.13, 0.15], [0.27, 0.75], [0.1, BLADE_LEN], [0.0, BLADE_LEN], [-0.12, 0.9]] as [number, number][]).map(([u, v]): [number, number] => [HUB[0] + u, HUB[1] + v]),
    0.1,
    { id: `blade${k}`, axis: 'z', role: 'face', group: 'rotor', rot: [{ axis: 'z', deg: 20 + k * 120, pivot: HUB }] },
  );

const tree = (k: number, x: number, z: number, s = 1): Part[] => [
  cyl([x, 0.3, z], 0.09 * s, 0.6 * s, { id: `trunk${k}`, role: 'ink', n: 12 }),
  ball([x, 0.3 + 0.6 * s + 0.45 * s, z], 0.45 * s, { id: `canopy${k}`, role: 'body' }),
];

export const windTurbine = defineDrawing({
  id: 'wind-turbine',
  name: 'Wind turbine',
  category: 'industry',
  tags: ['wind', 'turbine', 'renewable', 'energy', 'clean energy', 'power', 'green', 'sustainability', 'utility', 'industry', 'substation'],
  kind: 'scene',
  prompt: '/isometric create a wind turbine with turning blades, a substation and a service van, for our renewable energy page',
  description: 'A wind turbine on its foundation in a field: a tapered tower with a door, a nacelle with cooler and anemometer, and three blades turning around a lit spinner. A buried cable runs to a fenced substation with a transformer and a kiosk; a service van waits on the access road and trees stand behind.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [8.4, 0.3, 7.2], {
      id: 'ground', r: 0.15, role: 'face',
      decals: {
        top: [
          { t: 'rect', x: 0.3, y: 4.4, w: 2.4, h: 2.5, r: 0.1, stroke: 'soft' },
          slots(0.3, 4.65, 11, 0.2, 2.4, 'h'),
          { t: 'rect', x: 3.0, y: 4.1, w: 0.8, h: 3.1, fill: 'detail' },
          { t: 'line', pts: [[WT.x + 0.6, WT.z + 0.6], [5.2, 4.0], [5.9, 4.9]], stroke: 'soft', width: 2 },
        ],
      },
    }),
    ...tree(0, 5.9, 0.8), ...tree(1, 6.8, 1.6, 0.8), ...tree(2, 7.5, 0.7, 0.9),
    // Foundation, tower and door.
    cyl([WT.x, 0.3, WT.z], 1.1, 0.25, { id: 'foundation', role: 'detail', n: 44 }),
    cyl([WT.x, 0.55, WT.z], 0.36, TT - 0.55, { id: 'tower', r2: 0.2, role: 'face', n: 40 }),
    box([WT.x - 0.15, 0.55, WT.z + 0.36], [0.3, 0.55, 0.05], { id: 'door', r: 0.03, role: 'detail' }),
    box([WT.x - 0.25, 0.55, WT.z + 0.45], [0.5, 0.08, 0.5], { id: 'landing', role: 'detail' }),
    // Nacelle and its fittings.
    box([WT.x - 0.5, TT, NAC.z0], [1.0, NAC.h, NAC.d], {
      id: 'nacelle', r: 0.22, axis: 'z',
      decals: { right: [slots(0.25, 0.22, 6, 0.18, 0.4, 'v')], top: [{ t: 'rect', x: 0.3, y: 0.3, w: 0.4, h: 0.5, r: 0.05, stroke: 'soft' }] },
    }),
    box([WT.x - 0.25, TT + NAC.h, 2.15], [0.5, 0.28, 0.45], { id: 'cooler', role: 'detail', decals: { top: [slots(0.08, 0.06, 5, 0.08, 0.33, 'v')], right: [slots(0.06, 0.06, 5, 0.08, 0.16, 'v')] } }),
    cyl([WT.x + 0.15, TT + NAC.h, 3.35], 0.025, 0.42, { id: 'mast', role: 'ink', n: 8 }),
    box([WT.x + 0.13, TT + NAC.h + 0.42, 3.2], [0.04, 0.12, 0.3], { id: 'vane', role: 'ink' }),
    ball([WT.x - 0.18, TT + NAC.h + 0.08, 3.4], 0.08, { id: 'beacon', role: 'accent' }),
    // Rotor: hub, three blades, spinner.
    cyl([HUB[0], HUB[1], HUB[2]], 0.34, 0.25, { id: 'hub', axis: 'z', role: 'detail', group: 'rotor', n: 32 }),
    blade(0), blade(1), blade(2),
    cone([HUB[0], HUB[1], ROTOR_Z + 0.1], 0.3, 0.45, { id: 'spinner', axis: 'z', role: 'accent', group: 'rotor', n: 32 }),
    // Substation: pad, transformer, bushings, kiosk and fence.
    box([5.6, 0.3, 4.8], [2.4, 0.08, 1.9], { id: 'sub-pad', role: 'detail' }),
    box([5.9, 0.38, 5.15], [1.1, 0.8, 0.8], { id: 'transformer', r: 0.04, decals: { front: [slots(0.12, 0.12, 9, 0.11, 0.56, 'v')], right: [slots(0.12, 0.12, 6, 0.11, 0.56, 'v')] } }),
    ...[0, 1, 2].map((k) => cyl([6.15 + k * 0.3, 1.18, 5.55], 0.06, 0.3, { id: `bushing${k}`, role: 'ink', n: 12 })),
    box([7.2, 0.38, 4.95], [0.6, 0.9, 0.7], { id: 'kiosk', r: 0.04, role: 'face', decals: { front: [{ t: 'rect', x: 0.12, y: 0.12, w: 0.36, h: 0.66, r: 0.03, stroke: 'soft' }, { t: 'circle', cx: 0.4, cy: 0.45, r: 0.03, fill: 'ink' }] } }),
    box([5.6, 0.38, 6.65], [2.4, 0.35, 0.05], { id: 'fence-front', role: 'face', decals: { front: [slots(0.1, 0.03, 23, 0.1, 0.3, 'v')] } }),
    box([7.95, 0.38, 4.8], [0.05, 0.35, 1.85], { id: 'fence-right', role: 'face', decals: { right: [slots(0.1, 0.03, 18, 0.1, 0.3, 'v')] } }),
    // Service van on the access road.
    ...[5.3, 6.0].flatMap((z, k): Part[] => [
      cyl([3.75, 0.48, z], 0.18, 0.08, { id: `van-wheel-n${k}`, axis: 'x', role: 'ink', n: 20 }),
      cyl([3.05, 0.48, z], 0.18, -0.08, { id: `van-wheel-f${k}`, axis: 'x', role: 'ink', n: 20, only: 'standing' }),
    ]),
    box([3.05, 0.48, 5.0], [0.7, 0.62, 1.3], {
      id: 'van', r: 0.12, axis: 'x', role: 'face',
      decals: {
        front: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.54, h: 0.22, r: 0.04, fill: 'ink' }, { t: 'rect', x: 0.06, y: 0.42, w: 0.12, h: 0.07, r: 0.02, fill: 'detail' }, { t: 'rect', x: 0.52, y: 0.42, w: 0.12, h: 0.07, r: 0.02, fill: 'detail' }],
        right: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2, r: 0.04, fill: 'ink' }, { t: 'bar', x: 0.55, y: 0.32, w: 0.55, h: 0.07, fill: 'detail' }],
      },
    }),
  ],
  motion: {
    duration: 3,
    label: 'the blades turn',
    tracks: [{ group: 'rotor', r: { axis: 'z', deg: -120, pivot: HUB }, mode: 'loop' }],
  },
});

/* ---------------------------------------------------------- power station */
const coolingTower = (k: number, cx: number, cz: number): Part[] => [
  cyl([cx, 0.3, cz], 1.4, 0.18, { id: `ct${k}-legs`, role: 'detail', n: 48, decals: { front: [slots(0.1, 0.03, 28, 0.1, 0.12, 'v')] } }),
  cyl([cx, 0.48, cz], 1.3, 2.1, { id: `ct${k}-shell`, r2: 0.82, role: 'face', n: 48 }),
  cyl([cx, 2.58, cz], 0.82, 1.0, { id: `ct${k}-throat`, r2: 0.95, role: 'face', n: 48, decals: { top: [{ t: 'circle', cx: 0.95, cy: 0.95, r: 0.84, fill: 'ink' }] } }),
  ball([cx, 3.58 + 0.7, cz], 0.7, { id: `ct${k}-steam-a`, role: 'face', group: `steam${k}` }),
  ball([cx + 0.55, 3.58 + 1.2, cz - 0.25], 0.5, { id: `ct${k}-steam-b`, role: 'face', group: `steam${k}` }),
];

const pylon = (k: number, px: number, pz: number): Part[] => [
  cbox(px, 0.3, pz, [0.5, 0.1, 0.5], { id: `pylon${k}-foot`, role: 'ink' }),
  // Lattice mast: a zig-zag of braces drawn on its front.
  cbox(px, 0.4, pz, [0.18, 3.0, 0.18], { id: `pylon${k}-mast`, role: 'detail', decals: { front: [{ t: 'segs', segs: Array.from({ length: 14 }, (_, i): [number, number, number, number] => i % 2 ? [0.02, i * 0.2 + 0.1, 0.16, i * 0.2 + 0.3] : [0.16, i * 0.2 + 0.1, 0.02, i * 0.2 + 0.3]), stroke: 'soft' }] } }),
  cbox(px, 3.4, pz, [1.7, 0.12, 0.14], { id: `pylon${k}-arm`, role: 'detail' }),
  cbox(px, 3.52, pz, [0.14, 0.45, 0.14], { id: `pylon${k}-peak`, role: 'detail' }),
  ...[-0.7, 0.7].map((dx, i) => cyl([px + dx, 3.4, pz], 0.05, -0.32, { id: `pylon${k}-ins${i}`, role: 'ink', n: 10 })),
];

export const powerStation = defineDrawing({
  id: 'power-station',
  name: 'Power station',
  category: 'industry',
  tags: ['power plant', 'power station', 'energy', 'cooling tower', 'electricity', 'utility', 'grid', 'chimney', 'industry', 'thermal', 'generation'],
  kind: 'scene',
  prompt: '/isometric create a thermal power station with cooling towers, a turbine hall and a transformer yard, for our energy sector page',
  description: 'Two hyperbolic cooling towers breathe steam behind a power station: a boiler house with a tall banded chimney, a turbine hall with a clerestory roof fed by a cooling-water header, and a transformer yard with a gantry where the lit step-up transformer sends power out to a pylon. Coal piles sit at the front.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [11.5, 0.3, 7.6], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 11.1, h: 7.2, r: 0.12, stroke: 'soft' }] } }),
    ...coolingTower(0, 1.9, 2.2), ...coolingTower(1, 4.8, 1.8),
    // Cooling water: risers from each tower to a header into the turbine hall.
    cyl([1.9, 0.45, 3.6], 0.15, 0.35, { id: 'riser0', axis: 'z', role: 'detail', n: 20 }),
    cyl([4.8, 0.45, 3.2], 0.15, 0.75, { id: 'riser1', axis: 'z', role: 'detail', n: 20 }),
    cyl([1.75, 0.45, 4.1], 0.15, 4.85, { id: 'header', axis: 'x', role: 'detail', n: 20 }),
    // Boiler house, flue and chimney.
    box([6.6, 0.3, 0.6], [2.0, 3.8, 2.2], {
      id: 'boiler-house',
      decals: {
        front: [...grid(0.2, 0.2, 4, 2, 0.3, 0.32, 0.13, { fill: 'face' })],
        right: [...grid(0.2, 0.2, 4, 6, 0.38, 0.32, 0.14, { fill: 'face' })],
      },
    }),
    box([8.6, 3.0, 1.1], [0.38, 0.6, 0.6], { id: 'flue', role: 'detail' }),
    cyl([9.4, 0.3, 1.4], 0.42, 4.6, { id: 'chimney', r2: 0.36, role: 'face', n: 36 }),
    cyl([9.4, 4.9, 1.4], 0.36, 0.3, { id: 'chimney-band', role: 'detail', n: 36 }),
    cyl([9.4, 5.2, 1.4], 0.36, 0.9, { id: 'chimney-top', r2: 0.33, role: 'face', n: 36 }),
    cyl([9.4, 6.1, 1.4], 0.33, 0.15, { id: 'chimney-cap', role: 'ink', n: 36 }),
    // Turbine hall with a clerestory roof.
    box([6.6, 0.3, 2.8], [4.0, 2.0, 2.0], {
      id: 'turbine-hall', role: 'face',
      decals: {
        front: [
          ...grid(0.2, 0.22, 7, 1, 0.34, 0.4, 0.1, { fill: 'detail' }),
          { t: 'rect', x: 3.0, y: 0.85, w: 0.75, h: 1.15, r: 0.03, fill: 'detail', stroke: 'soft' },
          { t: 'segs', segs: [[3.375, 0.85, 3.375, 2.0]], stroke: 'soft' },
          slots(0.2, 1.0, 14, 0.18, 0.7, 'v'),
        ],
        right: [...grid(0.2, 0.22, 4, 1, 0.33, 0.4, 0.1, { fill: 'detail' }), slots(0.25, 1.0, 9, 0.18, 0.7, 'v')],
      },
    }),
    prism([6.6, 0, 0], [[2.8, 2.3], [4.8, 2.3], [4.5, 2.75], [3.1, 2.75]], 4.0, { id: 'hall-roof', axis: 'x', role: 'detail' }),
    box([7.0, 2.75, 3.5], [3.2, 0.18, 0.6], { id: 'roof-vent', role: 'face', decals: { top: [slots(0.15, 0.1, 21, 0.15, 0.4, 'v')] } }),
    // Transformer yard.
    box([7.0, 0.3, 5.3], [3.6, 0.1, 1.8], { id: 'yard', role: 'detail', decals: { top: [slots(0.2, 0.2, 18, 0.2, 1.4, 'v')] } }),
    ...[7.0, 10.45].map((x, k) => box([x, 0.4, 5.35], [0.15, 2.0, 0.15], { id: `gantry-post${k}`, role: 'ink' })),
    box([7.0, 2.4, 5.35], [3.6, 0.15, 0.15], { id: 'gantry-beam', role: 'ink' }),
    ...[0, 1, 2].map((k) => cyl([7.9 + k * 1.0, 2.4, 5.425], 0.06, -0.35, { id: `gantry-ins${k}`, role: 'detail', n: 12 })),
    ...[0, 1].flatMap((k): Part[] => {
      const x = 7.3 + k * 1.7;
      const role: Role = k === 1 ? 'accent' : 'body';
      return [
        box([x, 0.4, 5.6], [1.2, 0.9, 0.9], { id: `xfmr${k}`, r: 0.04, role, decals: { front: [slots(0.12, 0.12, 10, 0.105, 0.66, 'v')], right: [slots(0.12, 0.12, 7, 0.105, 0.66, 'v')] } }),
        cyl([x + 0.1, 1.42, 5.75], 0.12, 1.0, { id: `xfmr${k}-tank`, axis: 'x', role: 'face', n: 20 }),
        ...[0, 1, 2].map((i) => cyl([x + 0.3 + i * 0.3, 1.3, 6.15], 0.06, 0.35, { id: `xfmr${k}-bush${i}`, role: 'ink', n: 12 })),
      ];
    }),
    ...pylon(0, 5.6, 6.6),
    // Coal stockpile: a long ridge with a flat crest.
    prism([0.7, 0, 0], [[4.9, 0.3], [6.9, 0.3], [6.05, 1.15], [5.75, 1.15]], 3.6, { id: 'coal', axis: 'x', role: 'detail' }),
  ],
  motion: {
    duration: 4.2,
    label: 'steam rises from the cooling towers',
    tracks: [
      { group: 'steam0', t: [0, 0.35, 0], ease: 'inOut' },
      { group: 'steam1', t: [0, 0.35, 0], from: 0.25, to: 1, ease: 'inOut' },
    ],
  },
});

/* ---------------------------------------------------------------- refinery */
/** A distillation column: shell sections split by platform rings, ladders on the front, a dome on top. */
function column(id: string, cx: number, cz: number, r: number, segs: number[], plat = 0.25): Part[] {
  const out: Part[] = [];
  let y = 0.3;
  segs.forEach((h, i) => {
    out.push(cyl([cx, y, cz], r, h, { id: `${id}-shell${i}`, role: 'face', n: 36 }));
    out.push(box([cx - 0.1, y, cz + r], [0.2, h, 0.04], { id: `${id}-ladder${i}`, role: 'detail', decals: { front: [slots(0.03, 0.1, Math.floor(h / 0.2), 0.2, 0.14, 'h')] } }));
    y += h;
    if (i < segs.length - 1) {
      out.push(cyl([cx, y, cz], r + plat, 0.07, { id: `${id}-deck${i}`, role: 'detail', n: 36 }));
      y += 0.07;
    }
  });
  out.push(cyl([cx, y, cz], r, 0.3, { id: `${id}-dome`, r2: r * 0.45, role: 'face', n: 36 }));
  return out;
}

const RACK = { x0: 0.6, x1: 7.4, z: [3.42, 3.6, 3.78], y: 1.8 };

export const refinery = defineDrawing({
  id: 'oil-refinery',
  name: 'Oil refinery',
  category: 'industry',
  tags: ['refinery', 'oil', 'gas', 'petrochemical', 'chemical plant', 'distillation', 'tanks', 'pipeline', 'energy', 'industry', 'process plant', 'flare'],
  kind: 'scene',
  prompt: '/isometric create an oil refinery with distillation columns, storage tanks, a pipe rack and a burning flare, for our process industry page',
  description: 'A refinery unit: two distillation columns with platform rings and ladders joined by an overhead line, a spherical gas tank on its skirt, two floating-roof storage tanks and a pipe rack whose lit product line runs across the site. A fired heater with its stack sits at the front, a tanker truck fills at the loading arm, and the flare at the back flickers.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [10.6, 0.3, 7.2], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 3.2, y: 5.2, w: 4.6, h: 1.6, r: 0.08, fill: 'detail', stroke: 'soft' }, slots(0.3, 6.85, 50, 0.2, 0.15, 'v')] } }),
    ...column('colA', 1.8, 1.8, 0.55, [2.0, 2.0, 1.6]),
    ...column('colB', 3.7, 1.5, 0.4, [1.8, 1.8], 0.22),
    cyl([2.35, 3.5, 1.65], 0.09, 0.95, { id: 'overhead-line', axis: 'x', role: 'detail', n: 16 }),
    // Spherical tank on a skirt.
    cyl([6.0, 0.3, 1.7], 0.55, 0.55, { id: 'sphere-skirt', role: 'detail', n: 36, decals: { front: [slots(0.15, 0.1, 6, 0.15, 0.35, 'v')] } }),
    ball([6.0, 0.85 + 1.05, 1.7], 1.05, { id: 'sphere', role: 'face' }),
    cyl([6.0, 2.95, 1.7], 0.12, 0.15, { id: 'sphere-valve', role: 'ink', n: 16 }),
    // Floating-roof storage tanks.
    cyl([8.7, 0.3, 1.7], 1.15, 1.4, {
      id: 'tank0', role: 'face', n: 48,
      decals: { top: [{ t: 'circle', cx: 1.15, cy: 1.15, r: 1.0, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 1.15, cy: 1.15, r: 0.12, fill: 'ink' }], front: [{ t: 'segs', segs: [[0, 0.45, 2.3, 0.45]], stroke: 'soft' }] },
    }),
    cyl([8.9, 0.3, 4.6], 0.95, 1.1, {
      id: 'tank1', role: 'face', n: 48,
      decals: { top: [{ t: 'circle', cx: 0.95, cy: 0.95, r: 0.82, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 0.95, cy: 0.95, r: 0.1, fill: 'ink' }] },
    }),
    // Pipe rack: bents of two posts and a beam, three lines on top.
    ...[0.9, 2.6, 4.3, 6.0, 7.2].flatMap((bx, k): Part[] => [
      box([bx, 0.3, 3.3], [0.12, RACK.y - 0.3, 0.12], { id: `rack-post-b${k}`, role: 'detail' }),
      box([bx, 0.3, 3.78], [0.12, RACK.y - 0.3, 0.12], { id: `rack-post-f${k}`, role: 'detail' }),
      box([bx - 0.04, RACK.y, 3.3], [0.2, 0.1, 0.6], { id: `rack-beam${k}`, role: 'detail' }),
    ]),
    ...RACK.z.map((z, k) => cyl([RACK.x0, RACK.y + 0.18, z], 0.08, RACK.x1 - RACK.x0, { id: `line${k}`, axis: 'x', role: k === 1 ? 'accent' : 'detail', n: 14 })),
    // Fired heater and its stack.
    box([0.6, 0.3, 4.4], [1.8, 1.5, 1.2], {
      id: 'heater',
      decals: {
        front: [...[0.35, 0.9, 1.45].map((cx): Decal => ({ t: 'circle', cx, cy: 1.15, r: 0.12, fill: 'ink' })), slots(0.2, 0.2, 9, 0.18, 0.6, 'v')],
        right: [{ t: 'rect', x: 0.2, y: 0.2, w: 0.8, h: 0.6, r: 0.04, stroke: 'soft' }],
      },
    }),
    cyl([1.5, 1.8, 5.0], 0.22, 2.0, { id: 'heater-stack', role: 'face', n: 24 }),
    cyl([1.5, 3.8, 5.0], 0.22, 0.15, { id: 'heater-stack-band', role: 'ink', n: 24 }),
    // Flare stack at the back corner.
    cyl([10.0, 0.3, 0.6], 0.12, 4.7, { id: 'flare-stack', role: 'detail', n: 16 }),
    cyl([10.0, 5.0, 0.6], 0.17, 0.25, { id: 'flare-tip', role: 'ink', n: 16 }),
    cone([10.0, 5.25, 0.6], 0.22, 0.6, { id: 'flame', role: 'accent', group: 'flame', n: 20 }),
    // Loading arm and tanker truck.
    box([4.6, 0.3, 5.0], [0.15, 2.2, 0.15], { id: 'arm-post', role: 'ink' }),
    box([4.6, 2.5, 5.0], [0.15, 0.15, 1.1], { id: 'arm', role: 'detail' }),
    cyl([4.675, 2.5, 6.0], 0.06, -0.9, { id: 'arm-drop', role: 'ink', n: 12 }),
    ...[3.9, 5.6, 6.9].flatMap((x, k): Part[] => [
      cyl([x, 0.55, 6.4], 0.25, 0.12, { id: `truck-wheel-n${k}`, axis: 'z', role: 'ink', n: 24, decals: { front: [{ t: 'circle', cx: 0.25, cy: 0.25, r: 0.1, fill: 'detail' }] } }),
      cyl([x, 0.55, 5.6], 0.25, -0.12, { id: `truck-wheel-f${k}`, axis: 'z', role: 'ink', n: 24, only: 'standing' }),
    ]),
    box([3.4, 0.55, 5.6], [4.0, 0.15, 0.8], { id: 'chassis', role: 'ink' }),
    cyl([3.5, 1.1, 6.0], 0.4, 2.8, { id: 'tanker', axis: 'x', role: 'face', n: 32 }),
    cyl([4.675, 1.5, 6.0], 0.12, 0.1, { id: 'manway', role: 'ink', n: 16 }),
    box([6.4, 0.7, 5.6], [1.0, 1.0, 0.8], {
      id: 'cab', r: 0.12, axis: 'z', role: 'detail',
      decals: { front: [{ t: 'rect', x: 0.4, y: 0.12, w: 0.45, h: 0.35, r: 0.04, fill: 'ink' }], right: [{ t: 'rect', x: 0.1, y: 0.12, w: 0.6, h: 0.35, r: 0.04, fill: 'ink' }, { t: 'rect', x: 0.08, y: 0.75, w: 0.14, h: 0.08, r: 0.02, fill: 'face' }] },
    }),
  ],
  motion: {
    duration: 1.4,
    label: 'the flare flickers',
    tracks: [{ group: 'flame', s: { k: [1, 1.35, 1], pivot: [10.0, 5.25, 0.6] }, ease: 'inOut' }],
  },
});

/* ----------------------------------------------------------- bottling line */
const BL = { x: 0.2, len: 8.8, z: 2.6, d: 0.8, y: 0.9, h: 0.2 };
const BT = BL.y + BL.h; // belt top
const BZ = BL.z + BL.d / 2;
const BR = 0.17;
const FILL_X = [2.9, 3.5, 4.1];
const CAP_X = 6.0;
const NOZZLE_DROP = 0.3, CAP_DROP = 0.18;

interface BottleOpts { cap?: Role; label?: boolean; group?: string }
/** A bottle from its base centre: foot, label band, body, shoulder, neck and an optional cap. */
function bottle(id: string, cx: number, cz: number, y: number, o: BottleOpts = {}): Part[] {
  const g = o.group;
  const parts: Part[] = [
    cyl([cx, y, cz], BR, 0.14, { id: `${id}-foot`, role: 'face', n: 24, group: g }),
    cyl([cx, y + 0.14, cz], BR, 0.24, { id: `${id}-label`, role: o.label ? 'detail' : 'face', n: 24, group: g }),
    cyl([cx, y + 0.38, cz], BR, 0.1, { id: `${id}-body`, role: 'face', n: 24, group: g }),
    cyl([cx, y + 0.48, cz], BR, 0.18, { id: `${id}-shoulder`, r2: 0.07, role: 'face', n: 24, group: g }),
    cyl([cx, y + 0.66, cz], 0.07, 0.14, { id: `${id}-neck`, role: 'face', n: 16, group: g }),
  ];
  if (o.cap) parts.push(cyl([cx, y + 0.8, cz], 0.085, 0.07, { id: `${id}-cap`, role: o.cap, n: 16, group: g }));
  return parts;
}

const CRATE = { x: 9.3, z: 2.5, w: 1.4, d: 1.0, y: 1.1, h: 0.55, t: 0.06 };

export const bottlingLine = defineDrawing({
  id: 'bottling-line',
  name: 'Bottling line',
  category: 'industry',
  tags: ['bottling', 'packaging', 'production line', 'conveyor', 'filling', 'capping', 'labeling', 'beverage', 'food and drink', 'manufacturing', 'factory', 'industry'],
  kind: 'scene',
  prompt: '/isometric create a bottling line that fills, caps, labels and crates bottles, for our packaging automation page',
  description: 'Bottles ride a conveyor through a filling bridge whose three nozzles drop into them from a product tank, past a capping turret whose lit chuck presses a cap onto the next bottle, and past a labeler with two spinning reels. Finished bottles stand in a crate on a roller table at the end, and an operator screen stands in front.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [11.4, 0.3, 5.8], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 4.2, w: 11.0, h: 0.12, fill: 'detail' }, slots(0.3, 5.4, 55, 0.2, 0.2, 'v')] } }),
    // Conveyor: legs, frame, belt.
    ...[0.9, 5.1, 8.5].flatMap((x, k): Part[] => [
      box([x, 0.3, BL.z + 0.08], [0.16, BL.y - 0.15 - 0.3, 0.16], { id: `leg-b${k}`, role: 'ink' }),
      box([x, 0.3, BL.z + BL.d - 0.24], [0.16, BL.y - 0.15 - 0.3, 0.16], { id: `leg-f${k}`, role: 'ink' }),
    ]),
    box([BL.x, BL.y - 0.15, BL.z], [BL.len, 0.15, BL.d], { id: 'frame', role: 'detail', decals: { front: [slots(0.2, 0.04, 43, 0.2, 0.07, 'v')] } }),
    box([BL.x, BL.y, BL.z], [BL.len, BL.h, BL.d], { id: 'belt', r: 0.08, axis: 'x', role: 'ink', decals: { top: [slots(0.2, 0.1, 43, 0.2, BL.d - 0.2, 'v', true)] } }),
    // Bottles on the belt: infeed, filling, capping, labeling, outfeed.
    ...bottle('in0', 0.55, BZ, BT, { group: 'ride' }), ...bottle('in1', 1.2, BZ, BT, { group: 'ride' }),
    ...FILL_X.flatMap((x, k) => bottle(`fill${k}`, x, BZ, BT)),
    ...bottle('wait', 5.0, BZ, BT),
    ...bottle('capping', CAP_X, BZ, BT),
    ...bottle('capped', 7.0, BZ, BT, { cap: 'ink' }),
    ...bottle('labeling', 7.85, BZ, BT, { cap: 'ink', label: true }),
    ...bottle('out', 8.6, BZ, BT, { cap: 'ink', label: true }),
    // Filling bridge: four posts, a housing, three nozzles and the product tank.
    ...[2.4, 4.35].flatMap((x, k): Part[] => [
      box([x, 0.3, 2.0], [0.25, 2.3, 0.25], { id: `fill-post-b${k}`, role: 'detail' }),
      box([x, 0.3, 3.75], [0.25, 2.3, 0.25], { id: `fill-post-f${k}`, role: 'detail' }),
    ]),
    box([2.4, 2.6, 2.0], [2.2, 0.7, 2.0], {
      id: 'filler', r: 0.05,
      decals: {
        front: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.8, h: 0.4, r: 0.04, fill: 'ink' }, ...textLines(0.22, 0.25, 0.6, [0.8, 0.5], 0.13, 0.05, 'soft'), slots(1.2, 0.15, 5, 0.18, 0.4, 'v')],
        right: [slots(0.2, 0.15, 9, 0.18, 0.4, 'v')],
      },
    }),
    ...FILL_X.flatMap((x, k): Part[] => [
      cyl([x, 2.6, BZ], 0.11, -0.12, { id: `collar${k}`, role: 'detail', n: 16, group: 'fill' }),
      cyl([x, 2.48, BZ], 0.05, -0.18, { id: `nozzle${k}`, role: 'ink', n: 12, group: 'fill' }),
    ]),
    cyl([3.5, 3.3, 3.0], 0.6, 0.6, { id: 'product-tank', role: 'face', n: 40, decals: { front: [{ t: 'rect', x: 0.5, y: 0.1, w: 0.2, h: 0.4, r: 0.04, fill: 'detail', stroke: 'soft' }] } }),
    cyl([3.5, 3.9, 3.0], 0.6, 0.25, { id: 'tank-dome', r2: 0.3, role: 'face', n: 40 }),
    cyl([3.5, 4.15, 3.0], 0.1, 0.25, { id: 'tank-inlet', role: 'ink', n: 12 }),
    // Capping turret: column, cap hopper, arm, motor, chuck holding a cap.
    box([CAP_X - 0.25, 0.3, 1.9], [0.5, 2.9, 0.5], { id: 'capper-column', decals: { front: [{ t: 'rect', x: 0.1, y: 1.6, w: 0.3, h: 0.5, r: 0.04, stroke: 'soft' }], right: [slots(0.1, 0.3, 3, 0.15, 1.0, 'v')] } }),
    box([CAP_X - 0.35, 3.2, 1.8], [0.7, 0.45, 0.7], { id: 'cap-hopper', r: 0.04, role: 'face', decals: { top: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.5, h: 0.5, r: 0.05, fill: 'ink' }] } }),
    box([CAP_X - 0.25, 2.7, 2.4], [0.5, 0.4, 0.9], { id: 'capper-arm', r: 0.04, role: 'detail' }),
    cyl([CAP_X, 2.7, BZ], 0.2, -0.25, { id: 'capper-motor', role: 'face', n: 24 }),
    cyl([CAP_X, 2.45, BZ], 0.12, -0.3, { id: 'chuck', role: 'accent', n: 20, group: 'cap' }),
    cyl([CAP_X, 2.08, BZ], 0.085, 0.07, { id: 'new-cap', role: 'accent', n: 16, group: 'cap' }),
    // Labeler in front of the belt.
    box([7.3, 0.3, 3.5], [1.1, 1.2, 0.8], { id: 'labeler', r: 0.04, decals: { front: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.5, h: 0.3, r: 0.03, fill: 'ink' }, { t: 'circle', cx: 0.85, cy: 0.3, r: 0.07, fill: 'detail', stroke: 'soft' }, slots(0.15, 0.65, 5, 0.18, 0.4, 'v')] } }),
    box([7.6, 1.15, 3.4], [0.5, 0.3, 0.1], { id: 'applicator', r: 0.03, role: 'detail' }),
    ...[7.6, 8.1].map((x, k) => cyl([x, 1.5, 3.9], 0.24, 0.1, {
      id: `reel${k}`, role: 'face', n: 28, group: `reel${k}`,
      decals: { top: [{ t: 'circle', cx: 0.24, cy: 0.24, r: 0.08, fill: 'ink' }, { t: 'segs', segs: [[0.24, 0.04, 0.24, 0.16], [0.24, 0.32, 0.24, 0.44], [0.04, 0.24, 0.16, 0.24], [0.32, 0.24, 0.44, 0.24]], stroke: 'soft' }] },
    })),
    // Roller table with a crate of finished bottles.
    box([9.1, 0.3, 2.3], [1.8, 0.8, 1.4], { id: 'roller-table', role: 'detail', decals: { top: [slots(0.1, 0.1, 9, 0.2, 1.2, 'v')], front: [slots(0.2, 0.2, 8, 0.2, 0.4, 'v')] } }),
    box([CRATE.x, CRATE.y, CRATE.z], [CRATE.w, CRATE.t, CRATE.d], { id: 'crate-floor', role: 'face' }),
    box([CRATE.x, CRATE.y + CRATE.t, CRATE.z], [CRATE.w, CRATE.h, CRATE.t], { id: 'crate-back', role: 'face' }),
    box([CRATE.x, CRATE.y + CRATE.t, CRATE.z + CRATE.t], [CRATE.t, CRATE.h, CRATE.d - 2 * CRATE.t], { id: 'crate-left', role: 'face' }),
    box([CRATE.x + CRATE.w - CRATE.t, CRATE.y + CRATE.t, CRATE.z + CRATE.t], [CRATE.t, CRATE.h, CRATE.d - 2 * CRATE.t], { id: 'crate-right', role: 'face', decals: { right: [{ t: 'rect', x: 0.25, y: 0.12, w: 0.38, h: 0.14, r: 0.07, fill: 'bg', stroke: 'soft' }] } }),
    ...[9.65, 10.0, 10.35].flatMap((x, i) => [2.78, 3.22].flatMap((z, j) => bottle(`crate${i}${j}`, x, z, CRATE.y + CRATE.t, { cap: 'ink', label: true }))),
    box([CRATE.x, CRATE.y + CRATE.t, CRATE.z + CRATE.d - CRATE.t], [CRATE.w, CRATE.h, CRATE.t], { id: 'crate-front', role: 'face', decals: { front: [{ t: 'rect', x: 0.45, y: 0.12, w: 0.5, h: 0.14, r: 0.07, fill: 'bg', stroke: 'soft' }] } }),
    // Operator screen.
    box([5.7, 0.3, 4.45], [0.6, 0.06, 0.6], { id: 'hmi-foot', r: 0.04, role: 'detail' }),
    cbox(6.0, 0.36, 4.75, [0.12, 1.24, 0.12], { id: 'hmi-pole', role: 'ink' }),
    box([5.4, 1.6, 4.7], [1.2, 0.8, 0.1], {
      id: 'hmi', r: 0.06, axis: 'z',
      decals: {
        front: [
          { t: 'rect', x: 0.08, y: 0.08, w: 1.04, h: 0.64, r: 0.03, fill: 'ink' },
          ...grid(0.16, 0.16, 4, 1, 0.18, 0.12, 0.06, { fill: 'face', stroke: false }),
          { t: 'line', pts: [[0.16, 0.6], [0.4, 0.48], [0.62, 0.53], [0.86, 0.38], [1.02, 0.42]], stroke: 'accent', width: 2 },
        ],
      },
    }),
  ],
  motion: {
    duration: 3.6,
    label: 'bottles ride in, the nozzles fill, the capper presses and the reels spin',
    tracks: [
      { group: 'ride', t: [0.7, 0, 0], mode: 'loop' },
      { group: 'fill', t: [0, -NOZZLE_DROP, 0], from: 0, to: 0.4, ease: 'inOut' },
      { group: 'cap', t: [0, -CAP_DROP, 0], from: 0.3, to: 0.7, ease: 'inOut' },
      { group: 'reel0', r: { axis: 'y', deg: 360, pivot: [7.6, 0, 3.9] }, mode: 'loop' },
      { group: 'reel1', r: { axis: 'y', deg: -360, pivot: [8.1, 0, 3.9] }, mode: 'loop' },
    ],
  },
});
