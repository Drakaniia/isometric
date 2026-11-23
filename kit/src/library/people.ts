/**
 * People scenes: a team meeting, a classroom, an org chart, a support
 * centre and a keynote stage. Figures come from people-kit.ts; the rooms
 * around them are ordinary boxes, cylinders and decals.
 */
import { defineDrawing, box, cbox, cyl, ball, slots, textLines, tickRing, grid } from '../build.js';
import type { Decal, Paint, Part, Role } from '../model.js';
import { person, chair, FL, DESK, type Figure } from './people-kit.js';

const CREATED = '2026-11-14';
const TOP = FL + DESK; // desk and table surface
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A filled pie wedge as a closed line decal. */
const sector = (cx: number, cy: number, r: number, a0: number, a1: number, fill: Paint): Decal => {
  const pts: [number, number][] = [[cx, cy]];
  for (let i = 0; i <= 8; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / 8);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return { t: 'line', pts, closed: true, fill, stroke: 'soft' };
};

/** A wall clock face, in the frame of a cylinder's end face. */
const clockFace = (r: number, h: number, m: number): Decal[] => [
  tickRing(r, r, r * 0.9, 12, 3, r * 0.2),
  { t: 'segs', stroke: true, segs: [[r, r, r + Math.cos(rad(h)) * r * 0.5, r + Math.sin(rad(h)) * r * 0.5], [r, r, r + Math.cos(rad(m)) * r * 0.75, r + Math.sin(rad(m)) * r * 0.75]] },
  { t: 'circle', cx: r, cy: r, r: 0.05, fill: 'ink' },
];

/** Window panes on a left wall's visible (+x) face; x runs back to front. */
const windows = (list: [number, number, number, number][]): Decal[] =>
  list.flatMap(([x, y, w, h]): Decal[] => [
    { t: 'rect', x, y, w, h, r: 0.05, fill: 'bg', stroke: true },
    { t: 'segs', stroke: 'soft', segs: [[x + w / 2, y, x + w / 2, y + h], [x, y + h / 2, x + w, y + h / 2]] },
  ]);

/** A seated person with a chair. */
const seated = (id: string, x: number, z: number, dir: 'z+' | 'z-' | 'x+' | 'x-', o: Partial<Parameters<typeof person>[0]> = {}): { fig: Figure; parts: Part[] } => {
  const fig = person({ id, x, z, dir, sit: 1.0, armA: 'forward', armB: 'forward', ...o });
  return { fig, parts: [...chair(`${id}-ch`, x, z, dir), ...fig.parts] };
};

/** A tabletop slab with side panels. */
const deskUnit = (id: string, x: number, z: number, w: number, d: number, o: { top?: Role; decals?: Part['decals'] } = {}): Part[] => [
  box([x, TOP - 0.16, z], [w, 0.16, d], { id: `${id}-top`, r: 0.05, axis: 'y', role: o.top ?? 'face', decals: o.decals }),
  box([x + 0.12, FL, z + 0.12], [0.12, TOP - 0.16 - FL, d - 0.24], { id: `${id}-pl`, role: 'detail' }),
  box([x + w - 0.24, FL, z + 0.12], [0.12, TOP - 0.16 - FL, d - 0.24], { id: `${id}-pr`, role: 'detail' }),
];

const floor = (w: number, d: number, decals?: Part['decals']): Part =>
  box([0, 0, 0], [w, FL, d], { id: 'floor', r: 0.15, role: 'face', decals: decals ?? { top: [{ t: 'rect', x: 0.2, y: 0.2, w: w - 0.4, h: d - 0.4, r: 0.12, stroke: 'soft' }] } });

/* ------------------------------------------------------------ team meeting */
const MT = { w: 10.6, d: 8.6, wall: 5.2 };
const MT_SCREEN = { x: 2.6, y: 1.9, w: 6.4, h: 2.9 };
const MT_BAR_BASE = 2.5;
const mtBars = [0.5, 0.8, 0.65, 1.0, 1.25];

const presenter = person({ id: 'pres', x: 1.5, z: 1.5, dir: 'z-', shirt: 'accent', hair: 'short', armA: 'down', armB: 'up', gB: 'point', tie: true });
const mtSeats = [
  seated('mtA', 3.6, 2.1, 'z+', { shirt: 'detail', hair: 'long', pants: 'ink' }),
  seated('mtB', 6.6, 2.1, 'z+', { shirt: 'body', hair: 'short', pants: 'detail' }),
  seated('mtC', 3.6, 6.5, 'z-', { shirt: 'body', hair: 'bun', pants: 'ink' }),
  seated('mtD', 6.6, 6.5, 'z-', { shirt: 'detail', hair: 'curly', pants: 'ink' }),
  seated('mtE', 9.0, 4.3, 'x-', { shirt: 'detail', hair: 'short', pants: 'detail', tie: true }),
  seated('mtF', 1.8, 4.3, 'x+', { shirt: 'body', hair: 'long', pants: 'ink' }),
];
const laptop = (id: string, x: number): Part[] => [
  box([x - 0.55, TOP, 4.7], [1.1, 0.06, 0.65], { id: `${id}-base`, r: 0.03, axis: 'y', role: 'body', decals: { top: grid(0.1, 0.1, 6, 2, 0.1, 0.1, 0.06, { fill: 'face' }) } }),
  box([x - 0.55, TOP + 0.06, 4.65], [1.1, 0.7, 0.05], { id: `${id}-screen`, r: 0.04, axis: 'z', role: 'ink', decals: { front: [{ t: 'bar', x: 0.12, y: 0.12, w: 0.5, h: 0.06, fill: 'face' }, { t: 'bar', x: 0.12, y: 0.26, w: 0.8, h: 0.05, fill: 'soft' }, { t: 'rect', x: 0.12, y: 0.4, w: 0.4, h: 0.18, r: 0.03, fill: 'accent' }] } }),
];
const notepad = (id: string, x: number, z: number): Part[] => [
  box([x - 0.4, TOP, z], [0.8, 0.04, 0.55], { id: `${id}-pad`, r: 0.02, axis: 'y', role: 'face', decals: { top: [{ t: 'segs', stroke: 'soft', segs: [0.14, 0.26, 0.38].map((y): [number, number, number, number] => [0.1, y, 0.7, y]) }] } }),
  cyl([x + 0.5, TOP + 0.04, z + 0.2], 0.03, 0.5, { id: `${id}-pen`, axis: 'z', n: 8, role: 'ink' }),
  cyl([x + 0.9, TOP, z + 0.1], 0.16, 0.3, { id: `${id}-mug`, n: 14, role: 'detail', decals: { top: [{ t: 'circle', cx: 0.16, cy: 0.16, r: 0.11, fill: 'ink' }] } }),
];

export const teamMeeting = defineDrawing({
  id: 'team-meeting',
  name: 'Team meeting',
  category: 'people',
  tags: ['meeting', 'team', 'collaboration', 'presentation', 'conference room', 'standup', 'colleagues', 'workshop', 'office', 'people', 'about us', 'culture'],
  kind: 'scene',
  prompt: '/isometric create a team meeting: six people round a conference table while a colleague presents a chart on the wall screen, for our about-the-team page',
  description: 'A meeting room with a wall screen showing a raised bar chart and a pie, a window wall and a clock. A presenter in an accent shirt stands beside the screen and points at the chart. Six colleagues sit round a conference table, four with laptops and notepads and mugs, with a speakerphone in the middle. The chart bars grow and the presenter swings his arm toward the screen.',
  createdAt: CREATED,
  parts: [
    floor(MT.w, MT.d),
    box([0, FL, 0], [MT.w, MT.wall, 0.25], { id: 'wall-back', role: 'body', decals: { front: [{ t: 'segs', stroke: 'soft', segs: [[0.3, 0.4, MT.w - 0.3, 0.4]] }] } }),
    box([0, FL, 0.25], [0.25, MT.wall, MT.d - 0.25], { id: 'wall-left', role: 'face', decals: { right: windows([[1.0, 1.2, 1.6, 2.4], [3.2, 1.2, 1.6, 2.4], [5.4, 1.2, 1.6, 2.4]]) } }),
    // Screen with a pie and raised bars.
    box([MT_SCREEN.x, MT_SCREEN.y, 0.25], [MT_SCREEN.w, MT_SCREEN.h, 0.12], {
      id: 'screen', r: 0.1, axis: 'z', role: 'ink',
      decals: {
        front: [
          { t: 'rect', x: 0.12, y: 0.12, w: MT_SCREEN.w - 0.24, h: MT_SCREEN.h - 0.24, r: 0.06, fill: 'bg', stroke: 'soft' },
          ...textLines(0.4, 0.3, 2.4, [1, 0.55], 0.18, 0.08, 'ink'),
          { t: 'segs', stroke: 'soft', segs: [[0.4, 2.4, 3.8, 2.4]] },
          { t: 'circle', cx: 5.0, cy: 1.3, r: 0.8, fill: 'face', stroke: true },
          sector(5.0, 1.3, 0.8, -90, 20, 'accent'),
          { t: 'segs', stroke: 'soft', segs: [[5.0, 1.3, 4.4, 0.75], [5.0, 1.3, 4.35, 1.75]] },
          ...textLines(4.1, 2.25, 1.9, [1, 0.7], 0.14, 0.06, 'soft'),
        ],
      },
    }),
    ...mtBars.map((h, i) =>
      box([MT_SCREEN.x + 0.6 + i * 0.6, MT_BAR_BASE, 0.37], [0.4, h, 0.06], { id: `bar${i}`, r: 0.03, axis: 'z', role: i === 4 ? 'accent' : 'face', group: 'bars' }),
    ),
    cyl([1.5, 4.3, 0.25], 0.5, 0.1, { id: 'clock', axis: 'z', n: 28, role: 'face', decals: { front: clockFace(0.5, -60, 20) } }),
    // Plant in the corner.
    cyl([9.8, FL, 1.1], 0.4, 0.6, { id: 'pot', r2: 0.32, n: 18, role: 'detail' }),
    cyl([9.8, FL + 0.6, 1.1], 0.06, 0.7, { id: 'stem', n: 8, role: 'ink' }),
    ball([9.8, FL + 1.55, 1.1], 0.4, { id: 'leaf0', role: 'face' }),
    ball([9.4, FL + 1.25, 1.1], 0.3, { id: 'leaf1', role: 'detail' }),
    ball([10.2, FL + 1.3, 1.1], 0.3, { id: 'leaf2', role: 'detail' }),
    // Table.
    ...deskUnit('tbl', 2.6, 2.9, 5.6, 2.8, { decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 5.2, h: 2.4, r: 0.1, stroke: 'soft' }] } }),
    cyl([5.4, TOP, 4.3], 0.46, 0.1, { id: 'phone', n: 24, role: 'ink' }),
    cyl([5.4, TOP + 0.1, 4.3], 0.3, 0.04, { id: 'phone-ring', n: 24, role: 'accent' }),
    ...laptop('lapC', 3.6),
    ...laptop('lapD', 6.6),
    ...notepad('padA', 3.6, 3.4),
    ...notepad('padB', 6.6, 3.4),
    box([7.25, TOP, 4.2], [0.7, 0.05, 0.5], { id: 'papers0', role: 'face', decals: { top: textLines(0.08, 0.1, 0.5, [1, 0.7, 0.9], 0.12, 0.04) } }),
    box([7.3, TOP + 0.05, 4.22], [0.7, 0.05, 0.5], { id: 'papers1', role: 'body' }),
    cyl([4.5, TOP, 4.35], 0.17, 0.6, { id: 'carafe', n: 16, role: 'glass' }),
    cyl([4.1, TOP, 4.5], 0.12, 0.2, { id: 'cup0', n: 12, role: 'detail' }),
    // People.
    ...presenter.parts,
    ...mtSeats.flatMap((s) => s.parts),
  ],
  motion: {
    duration: 3.6,
    label: 'the chart bars grow while the presenter points at the screen',
    tracks: [
      { group: 'bars', s: { k: [1, 1.35, 1], pivot: [0, MT_BAR_BASE, 0.4] }, ease: 'inOut' },
      { group: 'point', r: { axis: 'z', deg: -55, pivot: presenter.shoulderB }, ease: 'inOut' },
    ],
  },
});

/* --------------------------------------------------------------- classroom */
const CR = { w: 10.8, d: 9.4, wall: 5.4 };
const BOARD = { x: 2.4, y: 1.7, w: 6.2, h: 2.5 };
const studentDesk = (id: string, cx: number, back: number): Part[] => [
  ...deskUnit(id, cx - 1.0, back - 1.2, 2.0, 1.2),
  box([cx - 0.5, TOP, back - 0.95], [0.8, 0.08, 0.6], { id: `${id}-book`, r: 0.03, axis: 'y', role: 'face', decals: { top: [{ t: 'bar', x: 0.1, y: 0.25, w: 0.5, h: 0.06, fill: 'soft' }] } }),
  cyl([cx + 0.6, TOP, back - 0.5], 0.1, 0.22, { id: `${id}-cup`, n: 10, role: 'detail' }),
];
const crRows: { z: number; xs: number[] }[] = [
  { z: 4.2, xs: [2.8, 5.4, 8.0] },
  { z: 7.0, xs: [2.8, 5.4, 8.0] },
];
const crStyles: { shirt: Role; hair: 'short' | 'long' | 'bun' | 'curly'; pants: Role }[] = [
  { shirt: 'detail', hair: 'short', pants: 'ink' },
  { shirt: 'body', hair: 'long', pants: 'detail' },
  { shirt: 'detail', hair: 'curly', pants: 'ink' },
  { shirt: 'body', hair: 'bun', pants: 'ink' },
  { shirt: 'accent', hair: 'short', pants: 'detail' },
  { shirt: 'detail', hair: 'long', pants: 'ink' },
];
const students = crRows.flatMap((row, ri) =>
  row.xs.map((x, ci) => {
    const k = ri * 3 + ci;
    const hand = k === 4;
    return seated(`st${k}`, x, row.z + 0.8, 'z-', { ...crStyles[k], armA: hand ? 'up' : 'forward', gA: hand ? 'hand' : undefined });
  }),
);
const teacher = person({ id: 'teach', x: 9.7, z: 1.6, dir: 'z-', shirt: 'body', pants: 'ink', hair: 'bun', armA: 'up', gA: 'ptr', armB: 'down' });
const handStudent = students[4].fig;

export const classroom = defineDrawing({
  id: 'classroom',
  name: 'Classroom',
  category: 'people',
  tags: ['classroom', 'school', 'teacher', 'students', 'education', 'learning', 'lesson', 'lecture', 'course', 'e-learning', 'training', 'university', 'people'],
  kind: 'scene',
  prompt: '/isometric create a classroom with a teacher at the blackboard and six students at desks, one raising a hand, for our learning platform landing page',
  description: 'A classroom with a window wall, a bookcase, a wall clock and a blackboard with chalk drawings and lines of writing. A teacher beside the board points at it with a raised arm; her desk holds an apple, a globe and a book stack. Six students sit at desks in two rows with their backs to us, books and pencil cups in front of them, and one in an accent shirt raises a hand. The writing on the board grows, the teacher points, and the hand waves.',
  createdAt: CREATED,
  parts: [
    floor(CR.w, CR.d),
    box([0, FL, 0], [CR.w, CR.wall, 0.25], { id: 'wall-back', role: 'body' }),
    box([0, FL, 0.25], [0.25, CR.wall, CR.d - 0.25], { id: 'wall-left', role: 'face', decals: { right: windows([[3.0, 1.4, 1.9, 2.4], [5.7, 1.4, 1.9, 2.4]]) } }),
    // Bookcase on the left wall.
    box([0.25, FL, 7.2], [0.6, 3.2, 1.9], { id: 'case', role: 'detail', decals: { right: [0.35, 1.3, 2.25].flatMap((y, r): Decal[] => [
      { t: 'segs', stroke: 'soft', segs: Array.from({ length: 11 }, (_, i): [number, number, number, number] => [0.12 + i * 0.15, y, 0.12 + i * 0.15, y + 0.75 - ((i + r) % 3) * 0.1]) },
      { t: 'segs', stroke: true, segs: [[0.05, y + 0.85, 1.85, y + 0.85]] },
    ]) } }),
    // Blackboard and its ledge.
    box([BOARD.x - 0.15, BOARD.y - 0.15, 0.25], [BOARD.w + 0.3, BOARD.h + 0.3, 0.06], { id: 'board-frame', r: 0.05, axis: 'z', role: 'detail' }),
    box([BOARD.x, BOARD.y, 0.31], [BOARD.w, BOARD.h, 0.05], {
      id: 'board', r: 0.05, axis: 'z', role: 'ink',
      decals: { front: [
        { t: 'line', closed: true, stroke: 'face', pts: Array.from({ length: 20 }, (_, i): [number, number] => [4.9 + Math.cos(rad(i * 18)) * 0.55, 0.9 + Math.sin(rad(i * 18)) * 0.55]) },
        { t: 'line', pts: [[3.9, 1.9], [4.6, 0.95], [5.3, 1.9]], closed: true, stroke: 'face' },
        { t: 'segs', stroke: 'face', segs: [[5.7, 0.4, 5.7, 1.9], [5.7, 1.9, 6.0, 1.9], [5.9, 0.6, 5.9, 1.0]] },
        ...textLines(0.4, 0.4, 2.0, [1, 0.7], 0.2, 0.06, 'face'),
      ] },
    }),
    box([BOARD.x, BOARD.y - 0.1, 0.36], [BOARD.w, 0.1, 0.22], { id: 'ledge', role: 'detail' }),
    ...[0, 1, 2].map((i) => box([BOARD.x + 0.4, BOARD.y + 1.55 - i * 0.28, 0.36], [[1.0, 1.2, 0.8][i], 0.07, 0.04], { id: `line${i}`, r: 0.02, axis: 'z', role: 'face', group: 'write' })),
    cyl([5.5, 4.6, 0.25], 0.4, 0.1, { id: 'clock', axis: 'z', n: 24, role: 'face', decals: { front: clockFace(0.4, 200, 50) } }),
    // Teacher's desk with apple, globe and books.
    ...deskUnit('tdesk', 0.5, 0.5, 1.8, 1.2),
    ball([1.0, TOP + 0.14, 1.1], 0.14, { id: 'apple', role: 'accent' }),
    cyl([1.7, TOP, 1.1], 0.3, 0.06, { id: 'globe-base', n: 16, role: 'ink' }),
    cyl([1.7, TOP + 0.06, 1.1], 0.05, 0.3, { id: 'globe-stem', n: 8, role: 'ink' }),
    ball([1.7, TOP + 0.36 + 0.34, 1.1], 0.34, { id: 'globe', role: 'face' }),
    box([0.8, TOP, 0.7], [0.5, 0.1, 0.35], { id: 'tbook0', r: 0.02, axis: 'y', role: 'detail' }),
    box([0.82, TOP + 0.1, 0.72], [0.45, 0.1, 0.32], { id: 'tbook1', r: 0.02, axis: 'y', role: 'face' }),
    cyl([1.4, FL, 1.9], 0.35, 0.8, { id: 'bin', r2: 0.4, n: 14, role: 'detail' }),
    // Student desks.
    ...crRows.flatMap((row, ri) => row.xs.flatMap((x, ci) => studentDesk(`sd${ri * 3 + ci}`, x, row.z))),
    ...students.flatMap((s) => s.parts),
    ...teacher.parts,
  ],
  motion: {
    duration: 3.6,
    label: 'the writing on the board grows, the teacher points and a student waves',
    tracks: [
      { group: 'write', s: { k: [2.0, 1, 1], pivot: [BOARD.x + 0.4, 0, 0] }, ease: 'inOut' },
      { group: 'ptr', r: { axis: 'z', deg: 50, pivot: teacher.shoulderA }, ease: 'inOut' },
      { group: 'hand', r: { axis: 'z', deg: 22, pivot: handStudent.shoulderA }, ease: 'inOut', from: 0.1, to: 0.9 },
    ],
  },
});

/* --------------------------------------------------------------- org chart */
const OC = { w: 12.2, d: 9.4 };
const OC_M = [2.9, 6.1, 9.3];
const OC_S = [1.7, 4.1, 6.1, 8.1, 10.5];
const PED = 0.5;
const ped = (id: string, cx: number, cz: number, role: Role, plate: number[]): Part =>
  box([cx - 0.95, FL, cz - 0.95], [1.9, PED, 1.9], {
    id, r: 0.1, axis: 'y', role,
    decals: {
      front: [{ t: 'rect', x: 0.4, y: 0.12, w: 1.1, h: 0.26, r: 0.05, fill: 'face', stroke: 'soft' }, ...textLines(0.55, 0.2, 0.8, plate, 0.08, 0.05, 'ink')],
      top: [{ t: 'circle', cx: 0.95, cy: 0.95, r: 0.8, stroke: 'soft' }],
    },
  });
const lanyard: Decal[] = [{ t: 'line', pts: [[0.2, 0], [0.42, 0.55], [0.64, 0]], stroke: 'soft' }, { t: 'rect', x: 0.34, y: 0.55, w: 0.16, h: 0.22, r: 0.03, fill: 'face', stroke: 'soft' }];
const link = (id: string, x: number, z: number, w: number, d: number, role: Role = 'ink'): Part => box([x, FL, z], [w, 0.2, d], { id, r: 0.05, axis: 'y', role });
const ocPeople = {
  ceo: person({ id: 'ceo', x: 6.1, z: 1.7, y: FL + PED, dir: 'z+', shirt: 'accent', hair: 'short', tie: true, armA: 'forward', armB: 'down' }),
  m: [
    person({ id: 'm0', x: OC_M[0], z: 4.6, y: FL + PED, dir: 'z+', shirt: 'detail', hair: 'long', chest: lanyard, armA: 'down', armB: 'down' }),
    person({ id: 'm1', x: OC_M[1], z: 4.6, y: FL + PED, dir: 'z+', shirt: 'body', hair: 'short', tie: true, armA: 'down', armB: 'forward' }),
    person({ id: 'm2', x: OC_M[2], z: 4.6, y: FL + PED, dir: 'z+', shirt: 'detail', hair: 'bun', chest: lanyard, armA: 'forward', armB: 'down' }),
  ],
  s: [
    person({ id: 's0', x: OC_S[0], z: 7.8, y: FL + PED, dir: 'z+', shirt: 'body', hair: 'curly', pants: 'detail', armA: 'down', armB: 'down' }),
    person({ id: 's1', x: OC_S[1], z: 7.8, y: FL + PED, dir: 'z+', shirt: 'detail', hair: 'short', armA: 'up', gA: 'wave', armB: 'down' }),
    person({ id: 's2', x: OC_S[2], z: 7.8, y: FL + PED, dir: 'z+', shirt: 'body', hair: 'long', pants: 'detail', armA: 'down', armB: 'down' }),
    person({ id: 's3', x: OC_S[3], z: 7.8, y: FL + PED, dir: 'z+', shirt: 'detail', hair: 'bun', armA: 'down', armB: 'down' }),
    person({ id: 's4', x: OC_S[4], z: 7.8, y: FL + PED, dir: 'z+', shirt: 'body', hair: 'short', pants: 'detail', armA: 'down', armB: 'down' }),
  ],
};

export const orgChart = defineDrawing({
  id: 'org-chart',
  name: 'Org chart',
  category: 'people',
  tags: ['org chart', 'organisation', 'hierarchy', 'team structure', 'reporting', 'company', 'management', 'leadership', 'hr', 'people', 'directory', 'staff'],
  kind: 'scene',
  prompt: '/isometric create an org chart where each person stands on a name plate and reporting lines run along the floor, for our HR product page',
  description: 'An organisation chart laid out on the floor. A chief in an accent shirt and tie stands on an accent plate at the back; three managers stand on plates in the middle row, two with lanyards; five staff stand on plates in the front row, one waving. Raised reporting lines run from the chief to a bus bar, to each manager and on to their reports. A small accent message travels from the chief along the line to the right-hand manager.',
  createdAt: CREATED,
  parts: [
    floor(OC.w, OC.d, { top: [slots(0.6, 0.2, 11, 1.0, OC.d - 0.4, 'v')] }),
    // Reporting lines.
    link('l-ceo', 6.0, 2.65, 0.2, 0.45),
    link('l-bus1', OC_M[0] - 0.1, 3.1, OC_M[2] - OC_M[0] + 0.2, 0.2),
    ...OC_M.map((x, i) => link(`l-m${i}`, x - 0.1, 3.3, 0.2, 0.3)),
    link('l-d0', OC_M[0] - 0.1, 5.55, 0.2, 0.5), link('l-d1', OC_M[1] - 0.1, 5.55, 0.2, 1.25), link('l-d2', OC_M[2] - 0.1, 5.55, 0.2, 0.5),
    link('l-bus0', OC_S[0] - 0.1, 6.05, OC_S[1] - OC_S[0] + 0.2, 0.2), link('l-bus2', OC_S[3] - 0.1, 6.05, OC_S[4] - OC_S[3] + 0.2, 0.2),
    ...[0, 1, 3, 4].map((i) => link(`l-s${i}`, OC_S[i] - 0.1, 6.25, 0.2, 0.55)),
    // Plates.
    ped('p-ceo', 6.1, 1.7, 'accent', [1, 0.6]),
    ...OC_M.map((x, i) => ped(`p-m${i}`, x, 4.6, 'face', [0.9, 0.5])),
    ...OC_S.map((x, i) => ped(`p-s${i}`, x, 7.8, 'face', [0.8, 0.45])),
    // People.
    ...ocPeople.ceo.parts,
    ...ocPeople.m.flatMap((f) => f.parts),
    ...ocPeople.s.flatMap((f) => f.parts),
    // The message that travels down the chain.
    ball([6.1, FL + 0.2 + 0.2, 2.85], 0.2, { id: 'msg', role: 'accent', group: 'msg' }),
  ],
  motion: {
    duration: 4,
    label: 'a message travels down the reporting line while a report waves',
    tracks: [
      { group: 'msg', t: [0, 0, 0.35], from: 0, to: 0.2, ease: 'inOut' },
      { group: 'msg', t: [OC_M[2] - 6.1, 0, 0], from: 0.2, to: 0.75, ease: 'inOut' },
      { group: 'msg', t: [0, 0, 0.4], from: 0.75, to: 1, ease: 'inOut' },
      { group: 'wave', r: { axis: 'z', deg: 24, pivot: ocPeople.s[1].shoulderA }, ease: 'inOut', from: 0.1, to: 0.9 },
    ],
  },
});

/* ---------------------------------------------------------- support centre */
const SC = { w: 11, d: 8.6, wall: 5.6 };
const SB = { x: 2.2, y: 2.4, w: 6.6, h: 2.6 };
const SB_BASE = 2.95;
const sbBars = [0.5, 0.9, 0.7, 1.1, 0.8, 0.6];
const headset = (f: Figure, id: string, role: Role = 'ink'): Part[] => {
  const cy = f.headC[1];
  const place = (idn: string, lat: number, fwd: number, y: number, sl: number, h: number, sf: number, r: Role): Part => {
    const [cx, , cz] = f.at(lat, fwd, y);
    // Direction-aware size: the figure builder maps lateral/forward to x/z.
    const zAxis = Math.abs(f.at(1, 0, 0)[0] - f.at(0, 0, 0)[0]) > 0.5;
    const sx = zAxis ? sl : sf, sz = zAxis ? sf : sl;
    return box([cx - sx / 2, y, cz - sz / 2], [sx, h, sz], { id: `${id}-${idn}`, role: r, r: 0.03, axis: 'y' });
  };
  return [
    place('cupA', -0.4, 0, cy - 0.15, 0.12, 0.3, 0.3, role),
    place('cupB', 0.4, 0, cy - 0.15, 0.12, 0.3, 0.3, role),
    place('riseA', -0.4, 0, cy + 0.15, 0.08, f.headTop + 0.16 - cy - 0.15, 0.1, role),
    place('riseB', 0.4, 0, cy + 0.15, 0.08, f.headTop + 0.16 - cy - 0.15, 0.1, role),
    place('band', 0, 0, f.headTop + 0.16, 0.9, 0.06, 0.12, role),
    place('mic', -0.4, 0.3, cy - 0.12, 0.05, 0.05, 0.4, 'accent'),
  ];
};
const scDesk = (id: string, cx: number, back: number): Part[] => [
  ...deskUnit(id, cx - 1.4, back - 1.4, 2.8, 1.4),
  box([cx - 0.35, TOP, back - 1.2], [0.7, 0.06, 0.5], { id: `${id}-mbase`, r: 0.03, axis: 'y', role: 'detail' }),
  box([cx - 0.1, TOP + 0.06, back - 1.1], [0.2, 0.3, 0.1], { id: `${id}-mneck`, role: 'detail' }),
  box([cx - 0.85, TOP + 0.36, back - 1.15], [1.7, 1.05, 0.1], {
    id: `${id}-mon`, r: 0.06, axis: 'z', role: 'ink',
    decals: { front: [
      { t: 'rect', x: 0.1, y: 0.1, w: 1.5, h: 0.85, r: 0.04, fill: 'bg' },
      { t: 'rect', x: 0.2, y: 0.2, w: 0.7, h: 0.2, r: 0.06, stroke: 'soft' },
      { t: 'rect', x: 0.7, y: 0.45, w: 0.7, h: 0.2, r: 0.06, fill: 'accent' },
      ...textLines(0.25, 0.28, 0.4, [1], 0.1, 0.05),
      ...textLines(0.2, 0.75, 1.2, [1], 0.1, 0.05, 'soft'),
    ] },
  }),
  box([cx - 0.6, TOP, back - 0.7], [1.2, 0.06, 0.4], { id: `${id}-kb`, r: 0.03, axis: 'y', role: 'body', decals: { top: grid(0.08, 0.08, 8, 2, 0.1, 0.1, 0.04, { fill: 'face' }) } }),
  cbox(cx + 1.0, TOP, back - 0.6, [0.25, 0.1, 0.4], { id: `${id}-mouse`, r: 0.1, role: 'body' }),
];
const scAgents = [
  { id: 'ag0', x: 3.3, z: 4.6, shirt: 'detail' as Role, hair: 'long' as const },
  { id: 'ag1', x: 7.5, z: 4.6, shirt: 'body' as Role, hair: 'short' as const },
  { id: 'ag2', x: 3.3, z: 7.2, shirt: 'body' as Role, hair: 'bun' as const },
  { id: 'ag3', x: 7.5, z: 7.2, shirt: 'detail' as Role, hair: 'curly' as const },
].map((a, i) => {
  const s = seated(a.id, a.x, a.z, 'z-', { shirt: a.shirt, hair: a.hair, pants: i % 2 ? 'detail' : 'ink', armA: i === 3 ? 'up' : 'forward', gA: i === 3 ? 'escalate' : undefined });
  return { ...s, parts: [...s.parts, ...headset(s.fig, `${a.id}-hs`)] };
});
const supervisor = person({ id: 'sup', x: 9.9, z: 4.4, dir: 'x-', shirt: 'accent', hair: 'short', tie: true, armA: 'forward', armB: 'forward' });

export const supportCenter = defineDrawing({
  id: 'support-center',
  name: 'Support centre',
  category: 'people',
  tags: ['support', 'customer service', 'call center', 'help desk', 'contact us', 'agents', 'headset', 'tickets', 'queue', 'helpdesk', 'people', 'service'],
  kind: 'scene',
  prompt: '/isometric create a customer support centre with four headset agents at monitors, a queue wallboard and a supervisor, for our contact page',
  description: 'A call centre: a wall board with a raised queue chart, a gauge and a ticket list, an alert beacon on top and a water cooler beside it. Four agents in headsets sit at desks in two rows, each with a monitor showing a chat, a keyboard and a mouse, split by a low partition; one agent raises a hand. A supervisor in an accent shirt stands at the side holding a tablet. The queue bars rise, the beacon swells and the raised hand waves.',
  createdAt: CREATED,
  parts: [
    floor(SC.w, SC.d),
    box([0, FL, 0], [SC.w, SC.wall, 0.25], { id: 'wall-back', role: 'body' }),
    box([0, FL, 0.25], [0.25, SC.wall, SC.d - 0.25], { id: 'wall-left', role: 'face', decals: { right: windows([[1.2, 1.4, 1.8, 2.6], [3.6, 1.4, 1.8, 2.6]]) } }),
    // Wallboard.
    box([SB.x, SB.y, 0.25], [SB.w, SB.h, 0.12], {
      id: 'board', r: 0.1, axis: 'z', role: 'ink',
      decals: { front: [
        { t: 'rect', x: 0.12, y: 0.12, w: SB.w - 0.24, h: SB.h - 0.24, r: 0.06, fill: 'bg', stroke: 'soft' },
        ...textLines(0.4, 0.3, 1.8, [1, 0.5], 0.18, 0.08, 'ink'),
        { t: 'segs', stroke: 'soft', segs: [[0.4, 2.05, 3.8, 2.05]] },
        { t: 'circle', cx: 5.0, cy: 1.25, r: 0.75, stroke: true },
        tickRing(5.0, 1.25, 0.65, 20, 5, 0.12),
        { t: 'segs', stroke: true, segs: [[5.0, 1.25, 5.4, 0.8]] },
        { t: 'rect', x: 4.1, y: 2.0, w: 1.8, h: 0.3, r: 0.06, fill: 'accent' },
      ] },
    }),
    ...sbBars.map((h, i) => box([SB.x + 0.5 + i * 0.55, SB_BASE, 0.37], [0.35, h, 0.06], { id: `q${i}`, r: 0.03, axis: 'z', role: i === 3 ? 'accent' : 'face', group: 'queue' })),
    // Beacon on top of the wall.
    cyl([9.8, FL + SC.wall, 0.12], 0.35, 0.18, { id: 'beacon-base', n: 14, role: 'detail' }),
    cyl([9.8, FL + SC.wall + 0.18, 0.12], 0.24, 0.34, { id: 'beacon', n: 14, role: 'accent', group: 'beacon' }),
    // Water cooler.
    box([0.5, FL, 0.45], [0.95, 1.5, 0.8], { id: 'cooler', r: 0.06, axis: 'y', role: 'detail', decals: { front: [{ t: 'rect', x: 0.2, y: 0.25, w: 0.55, h: 0.3, r: 0.05, stroke: 'soft' }, { t: 'circle', cx: 0.48, cy: 0.9, r: 0.08, fill: 'accent' }] } }),
    cyl([0.975, FL + 1.5, 0.85], 0.33, 0.9, { id: 'bottle', n: 18, role: 'glass' }),
    // Partition between the two desk columns.
    box([5.35, FL, 2.4], [0.14, 2.8, 5.4], { id: 'divider', r: 0.04, axis: 'y', role: 'face', decals: { right: [{ t: 'rect', x: 0.3, y: 0.4, w: 4.8, h: 1.4, r: 0.1, stroke: 'soft' }] } }),
    // Desks and agents.
    ...scDesk('d0', 3.3, 3.8),
    ...scDesk('d1', 7.5, 3.8),
    ...scDesk('d2', 3.3, 6.4),
    ...scDesk('d3', 7.5, 6.4),
    ...scAgents.flatMap((a) => a.parts),
    ...supervisor.parts,
    box([supervisor.at(0, 1.0, 0)[0] - 0.1, TOP + 0.35, supervisor.at(0.0, 0, 0)[2] - 0.35], [0.06, 0.55, 0.7], { id: 'tablet', r: 0.03, axis: 'x', role: 'ink', decals: { right: [{ t: 'rect', x: 0.08, y: 0.1, w: 0.54, h: 0.34, r: 0.03, fill: 'accent' }] } }),
  ],
  motion: {
    duration: 3.4,
    label: 'the queue chart rises, the beacon swells and an agent waves for help',
    tracks: [
      { group: 'queue', s: { k: [1, 1.4, 1], pivot: [0, SB_BASE, 0.4] }, ease: 'inOut' },
      { group: 'beacon', s: { k: [1.25, 1.25, 1.25], pivot: [9.8, FL + SC.wall + 0.18, 0.12] }, ease: 'inOut' },
      { group: 'escalate', r: { axis: 'z', deg: 20, pivot: scAgents[3].fig.shoulderA }, ease: 'inOut', from: 0.1, to: 0.9 },
    ],
  },
});

/* ------------------------------------------------------------ keynote stage */
const KS = { w: 11.4, d: 10, stage: 1.0 };
const STAGE_TOP = FL + KS.stage;
const SCR = { x: 1.6, y: STAGE_TOP, w: 8.2, h: 4.3 };
const SCR_BASE = STAGE_TOP + 0.85;
const slideBars = [0.7, 1.0, 1.4, 1.9, 2.3];
const LECT = { x: 5.7, z: 2.7, h: 1.43 };
const speaker = person({ id: 'spk', x: LECT.x, z: 2.0, y: STAGE_TOP, dir: 'z+', shirt: 'detail', hair: 'short', pants: 'ink', tie: true, armA: 'up', gA: 'gesture', armB: 'forward' });
const audience = [
  seated('au0', 2.6, 6.8, 'z-', { shirt: 'body', hair: 'curly', pants: 'ink', armA: 'down', armB: 'down' }),
  seated('au1', 5.6, 6.8, 'z-', { shirt: 'detail', hair: 'long', pants: 'ink', armA: 'up', armB: 'up', gA: 'cheer', gB: 'cheer' }),
  seated('au2', 8.6, 6.8, 'z-', { shirt: 'body', hair: 'short', pants: 'detail', armA: 'down', armB: 'down' }),
  seated('au3', 2.6, 8.7, 'z-', { shirt: 'body', hair: 'bun', pants: 'detail', armA: 'up', gA: 'cheer2', armB: 'down' }),
  seated('au4', 5.6, 8.7, 'z-', { shirt: 'detail', hair: 'short', pants: 'ink', armA: 'down', armB: 'down' }),
  seated('au5', 8.6, 8.7, 'z-', { shirt: 'body', hair: 'long', pants: 'ink', armA: 'down', armB: 'down' }),
];

export const keynoteStage = defineDrawing({
  id: 'keynote-stage',
  name: 'Keynote stage',
  category: 'people',
  tags: ['keynote', 'conference', 'speaker', 'talk', 'event', 'audience', 'stage', 'presentation', 'webinar', 'summit', 'meetup', 'people', 'community'],
  kind: 'scene',
  prompt: '/isometric create a keynote stage where a speaker presents at a lectern in a spotlight before an audience, for our events page',
  description: 'A conference stage with a wide LED screen showing a raised bar chart and a donut, a lighting truss with three spot lamps, steps and two floor wedge monitors. A speaker in a tie stands behind a lectern with a gooseneck microphone, one hand resting on it and the other gesturing, in an accent spotlight pool under a light beam. Six audience members sit on chairs in two rows with their backs to us; three raise their hands. The slide bars grow, the speaker gestures and the audience cheers.',
  createdAt: CREATED,
  parts: [
    floor(KS.w, KS.d, { top: [{ t: 'rect', x: 0.2, y: 4.9, w: KS.w - 0.4, h: KS.d - 5.1, r: 0.12, stroke: 'soft' }, slots(1.0, 5.3, 9, 1.2, 0.0, 'h')] }),
    // Stage with steps.
    box([0.6, FL, 0.3], [10.2, KS.stage, 4.4], { id: 'stage', r: 0.06, axis: 'y', role: 'face', decals: { front: [0, 1, 2, 3, 4, 5, 6, 7].map((i): Decal => ({ t: 'rect', x: 0.2 + i * 1.25, y: 0.15, w: 1.0, h: 0.7, r: 0.05, stroke: 'soft' })), top: [{ t: 'rect', x: 0.2, y: 0.2, w: 9.8, h: 4.0, r: 0.08, stroke: 'soft' }] } }),
    box([10.8, FL, 3.2], [0.5, 0.5, 1.2], { id: 'step0', role: 'detail' }),
    box([10.3, FL, 3.2], [0.5, 0.25, 1.2], { id: 'step1', role: 'detail' }),
    // Screen.
    box([SCR.x, SCR.y, 0.3], [SCR.w, SCR.h, 0.2], {
      id: 'led', r: 0.1, axis: 'z', role: 'ink',
      decals: { front: [
        { t: 'rect', x: 0.15, y: 0.15, w: SCR.w - 0.3, h: SCR.h - 0.3, r: 0.08, fill: 'bg', stroke: 'soft' },
        ...textLines(0.6, 0.5, 3.0, [1, 0.55], 0.22, 0.1, 'ink'),
        { t: 'segs', stroke: 'soft', segs: [[0.6, 3.45, 4.6, 3.45]] },
        { t: 'circle', cx: 6.3, cy: 1.8, r: 1.1, fill: 'face', stroke: true },
        sector(6.3, 1.8, 1.1, -90, 40, 'accent'),
        { t: 'circle', cx: 6.3, cy: 1.8, r: 0.5, fill: 'bg', stroke: 'soft' },
        ...textLines(5.2, 3.25, 2.0, [1, 0.7], 0.16, 0.07, 'soft'),
      ] },
    }),
    ...slideBars.map((h, i) => box([SCR.x + 0.7 + i * 0.7, SCR_BASE, 0.5], [0.45, h, 0.07], { id: `sb${i}`, r: 0.03, axis: 'z', role: i === 4 ? 'accent' : 'face', group: 'slide' })),
    // Lighting truss with spot lamps.
    box([0.6, STAGE_TOP, 1.1], [0.3, 4.9, 0.3], { id: 'truss-l', role: 'detail', decals: { front: [{ t: 'segs', stroke: 'soft', segs: Array.from({ length: 12 }, (_, i): [number, number, number, number] => [0, i * 0.4, 0.3, i * 0.4 + 0.4]) }] } }),
    box([10.5, STAGE_TOP, 1.1], [0.3, 4.9, 0.3], { id: 'truss-r', role: 'detail', decals: { front: [{ t: 'segs', stroke: 'soft', segs: Array.from({ length: 12 }, (_, i): [number, number, number, number] => [0, i * 0.4, 0.3, i * 0.4 + 0.4]) }] } }),
    box([0.6, STAGE_TOP + 4.9, 1.1], [10.2, 0.3, 0.3], { id: 'truss-top', role: 'detail', decals: { front: [{ t: 'segs', stroke: 'soft', segs: Array.from({ length: 24 }, (_, i): [number, number, number, number] => [i * 0.425, 0, i * 0.425 + 0.425, 0.3]) }] } }),
    ...[2.8, 5.7, 8.6].map((x, i) => box([x - 0.3, STAGE_TOP + 4.3, 1.05], [0.6, 0.6, 0.4], { id: `lamp${i}`, r: 0.08, axis: 'z', role: 'ink', decals: { front: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.18, stroke: 'soft' }] } })),
    // Light beam and spot pool on the speaker.
    cyl([LECT.x, STAGE_TOP, 2.4], 1.15, 0.04, { id: 'pool', n: 28, role: 'accent' }),
    cyl([LECT.x, STAGE_TOP + 0.04, 2.4], 0.5, 3.75, { id: 'beam', r2: 0.1, n: 20, role: 'glass' }),
    // Lectern and microphone.
    box([LECT.x - 0.6, STAGE_TOP, LECT.z], [1.2, LECT.h, 0.9], { id: 'lectern', r: 0.05, axis: 'y', role: 'body', decals: { front: [{ t: 'circle', cx: 0.6, cy: 0.5, r: 0.22, fill: 'accent' }, ...textLines(0.3, 0.9, 0.6, [1], 0.1, 0.05, 'soft')] } }),
    cyl([LECT.x, STAGE_TOP + LECT.h, LECT.z + 0.1], 0.035, 1.05, { id: 'mic-stalk', n: 8, role: 'ink' }),
    ball([LECT.x, STAGE_TOP + LECT.h + 1.12, LECT.z + 0.1], 0.08, { id: 'mic-head', role: 'ink' }),
    // Floor wedge monitors.
    ...[3.6, 7.8].map((x, i) => box([x - 0.5, STAGE_TOP, 3.95], [1.0, 0.35, 0.5], { id: `wedge${i}`, r: 0.04, axis: 'y', role: 'ink', decals: { front: [{ t: 'circle', cx: 0.5, cy: 0.17, r: 0.1, stroke: 'soft' }] } })),
    ...speaker.parts,
    ...audience.flatMap((a) => a.parts),
  ],
  motion: {
    duration: 3.2,
    label: 'the slide bars grow, the speaker gestures and the audience cheers',
    tracks: [
      { group: 'slide', s: { k: [1, 1.3, 1], pivot: [0, SCR_BASE, 0.5] }, ease: 'inOut' },
      { group: 'gesture', r: { axis: 'z', deg: 28, pivot: speaker.shoulderA }, ease: 'inOut' },
      { group: 'cheer', t: [0, 0.35, 0], ease: 'inOut' },
      { group: 'cheer2', t: [0, 0.35, 0], ease: 'inOut', from: 0.4, to: 1 },
    ],
  },
});

export const peopleScenes = [teamMeeting, classroom, orgChart, supportCenter, keynoteStage];
