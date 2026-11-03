import { defineDrawing, box, cbox, textLines } from '../build.js';
import type { Decal, Part } from '../model.js';

/**
 * Kanban board: a framed board on two legs with three columns of cards.
 * One card (the accent) slides from "Doing" to "Done".
 */
const W = 6.6, H = 4.6, D = 0.26, Y0 = 0.5;
const x0 = -W / 2, z0 = -0.2;
const colW = 1.86, colGap = 0.22, colX = (i: number) => 0.3 + i * (colW + colGap);

const board: Decal[] = [];
for (let i = 0; i < 3; i++) {
  board.push({ t: 'rect', x: colX(i), y: 0.32, w: colW, h: H - 0.62, r: 0.1, fill: 'face', stroke: 'soft' });
  board.push({ t: 'bar', x: colX(i) + 0.18, y: 0.48, w: [0.7, 0.55, 0.45][i], h: 0.1, fill: 'soft' });
  board.push({ t: 'circle', cx: colX(i) + colW - 0.25, cy: 0.53, r: 0.08, fill: 'detail', stroke: 'soft' });
}

const cardH = 0.78, cardW = colW - 0.3;
/** A card standing proud of the board, in column c, row r (rows from the top). */
function card(c: number, r: number, widths: number[], o: { accent?: boolean; id?: string; group?: string } = {}): Part {
  const top = Y0 + H - 0.85 - r * (cardH + 0.16);
  const decals: Decal[] = [
    ...textLines(0.16, 0.18, cardW - 0.3, widths, 0.18, 0.08, o.accent ? 'face' : 'soft'),
    { t: 'circle', cx: cardW - 0.22, cy: cardH - 0.2, r: 0.09, fill: o.accent ? 'face' : 'detail', stroke: 'soft' },
    { t: 'bar', x: 0.16, y: cardH - 0.25, w: 0.38, h: 0.1, fill: o.accent ? 'face' : 'detail' },
  ];
  return box([x0 + colX(c) + 0.15, top - cardH, z0 + D], [cardW, cardH, 0.09], {
    id: o.id, r: 0.07, axis: 'z', role: o.accent ? 'accent' : 'body', group: o.group, decals: { front: decals },
  });
}

export default defineDrawing({
  id: 'kanban-board',
  name: 'Kanban',
  category: 'interface',
  tags: ['kanban', 'board', 'tasks', 'project', 'dashboard', 'trello', 'columns', 'workflow'],
  kind: 'scene',
  prompt: '/isometric create an isometric of a kanban board for my project dashboard',
  description: 'A framed kanban board on two legs with To do, Doing and Done columns of cards. One highlighted card moves from Doing to Done.',
  createdAt: '2026-11-03',
  parts: [
    // Legs and feet.
    cbox(x0 + 0.9, 0, z0 + D / 2, [0.7, 0.14, 1.6], { r: 0.1, role: 'detail', only: 'standing' }),
    cbox(x0 + W - 0.9, 0, z0 + D / 2, [0.7, 0.14, 1.6], { r: 0.1, role: 'detail', only: 'standing' }),
    cbox(x0 + 0.9, 0.14, z0 + D / 2, [0.18, Y0 - 0.14, 0.18], { role: 'detail', only: 'standing' }),
    cbox(x0 + W - 0.9, 0.14, z0 + D / 2, [0.18, Y0 - 0.14, 0.18], { role: 'detail', only: 'standing' }),
    // The board.
    box([x0, Y0, z0], [W, H, D], { id: 'board', r: 0.16, axis: 'z', decals: { front: board } }),
    // To do.
    card(0, 0, [1, 0.7]),
    card(0, 1, [0.8, 0.9]),
    card(0, 2, [0.9, 0.5]),
    card(0, 3, [0.6, 0.8]),
    // Doing: the accent card starts here and slides to Done.
    card(1, 0, [0.9, 0.6]),
    card(1, 1, [1, 0.7], { accent: true, id: 'moving', group: 'card' }),
    // Done.
    card(2, 0, [0.7, 0.8]),
    // A marker tray along the bottom of the frame.
    box([x0 + 3.6, Y0 + 0.05, z0 + D], [2.4, 0.12, 0.32], { id: 'tray', role: 'detail' }),
    box([x0 + 3.8, Y0 + 0.17, z0 + D + 0.08], [0.9, 0.1, 0.12], { id: 'marker', role: 'ink', r: 0.05, axis: 'x' }),
  ],
  motion: {
    duration: 3.2,
    label: 'a card moves from Doing to Done',
    tracks: [
      { group: 'card', t: [0, 0, 0.3], from: 0, to: 0.2, ease: 'out' },
      { group: 'card', t: [colW + colGap, 0, 0], from: 0.2, to: 0.8, ease: 'inOut' },
      { group: 'card', t: [0, 0, -0.3], from: 0.8, to: 1, ease: 'in' },
    ],
  },
});
