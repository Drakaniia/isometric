import { defineDrawing, box, cbox, cyl, ball, prism, textLines } from '../build.js';
import type { Decal } from '../model.js';

/**
 * Login page: a browser window standing on two feet, a sign-in card in front
 * of it, and a padlock whose shackle lifts when the button is pressed.
 */
const W = 6.2, H = 4.3, D = 0.28;
const winX = -W / 2, winZ = -0.6;

const chrome: Decal[] = [
  { t: 'rect', x: 0.12, y: 0.12, w: W - 0.24, h: 0.42, r: 0.08, fill: 'face', stroke: 'soft' },
  { t: 'circle', cx: 0.36, cy: 0.33, r: 0.07, fill: 'detail', stroke: 'soft' },
  { t: 'circle', cx: 0.6, cy: 0.33, r: 0.07, fill: 'detail', stroke: 'soft' },
  { t: 'circle', cx: 0.84, cy: 0.33, r: 0.07, fill: 'detail', stroke: 'soft' },
  { t: 'rect', x: 1.3, y: 0.22, w: 3.2, h: 0.22, r: 0.11, fill: 'body', stroke: 'soft' },
  { t: 'bar', x: 1.5, y: 0.29, w: 1.4, h: 0.08 },
  // Page behind the card: a left column of copy and an image block.
  ...textLines(0.45, 1.1, 1.3, [1, 0.8, 0.9, 0.6], 0.26, 0.1),
  { t: 'rect', x: 0.45, y: 2.35, w: 1.25, h: 1.3, r: 0.08, fill: 'face', stroke: 'soft' },
  { t: 'line', pts: [[0.55, 3.5], [0.95, 2.95], [1.2, 3.25], [1.35, 3.05], [1.6, 3.5]], stroke: 'soft' },
  ...textLines(W - 1.55, 1.1, 1.1, [1, 0.7], 0.26, 0.1),
];

const cardW = 2.7, cardH = 3.1, cardX = -cardW / 2 + 0.35, cardY = 0.55;
const cardZ = winZ + D;

const card: Decal[] = [
  { t: 'circle', cx: cardW / 2, cy: 0.62, r: 0.3, fill: 'face', stroke: true },
  { t: 'circle', cx: cardW / 2, cy: 0.55, r: 0.1, fill: 'detail' },
  { t: 'line', pts: [[cardW / 2 - 0.17, 0.82], [cardW / 2 - 0.1, 0.72], [cardW / 2 + 0.1, 0.72], [cardW / 2 + 0.17, 0.82]], stroke: 'soft' },
  { t: 'bar', x: cardW / 2 - 0.55, y: 1.08, w: 1.1, h: 0.1, fill: 'soft' },
  { t: 'bar', x: 0.3, y: 1.38, w: 0.55, h: 0.07 },
  { t: 'rect', x: 0.3, y: 1.5, w: cardW - 0.6, h: 0.34, r: 0.07, fill: 'face', stroke: true },
  { t: 'bar', x: 0.42, y: 1.62, w: 1.0, h: 0.09 },
  { t: 'bar', x: 0.3, y: 1.98, w: 0.7, h: 0.07 },
  { t: 'rect', x: 0.3, y: 2.1, w: cardW - 0.6, h: 0.34, r: 0.07, fill: 'face', stroke: true },
  ...[0, 1, 2, 3, 4, 5].map((i): Decal => ({ t: 'circle', cx: 0.5 + i * 0.2, cy: 2.27, r: 0.045, fill: 'ink' })),
];

// U-shaped shackle profile (x, y), extruded along z.
const shackle: [number, number][] = [
  [0, 0], [0.16, 0], [0.16, 0.5], [0.2, 0.62], [0.3, 0.7], [0.5, 0.7], [0.6, 0.62], [0.64, 0.5], [0.64, 0],
  [0.8, 0], [0.8, 0.56], [0.74, 0.74], [0.6, 0.85], [0.2, 0.85], [0.06, 0.74], [0, 0.56],
];

export default defineDrawing({
  id: 'login-page',
  name: 'Login page',
  category: 'interface',
  tags: ['login', 'sign in', 'auth', 'browser', 'form', 'password', 'padlock', 'page'],
  kind: 'scene',
  prompt: '/isometric create an isometric for my login page',
  description: 'A browser window on a stand with a sign-in card in front of it: avatar, email and password fields and a sign-in button. A padlock stands beside it.',
  createdAt: '2026-11-03',
  parts: [
    // Feet and stand.
    cbox(winX + 1.1, 0, winZ + D / 2, [0.9, 0.16, 1.5], { r: 0.12, role: 'detail', only: 'standing' }),
    cbox(winX + W - 1.1, 0, winZ + D / 2, [0.9, 0.16, 1.5], { r: 0.12, role: 'detail', only: 'standing' }),
    // The window.
    box([winX, 0.16, winZ], [W, H, D], { id: 'window', r: 0.14, axis: 'z', decals: { front: chrome } }),
    // The card, standing proud of the window.
    box([cardX, 0.16 + cardY, cardZ], [cardW, cardH, 0.14], { id: 'card', r: 0.12, axis: 'z', role: 'face', decals: { front: card } }),
    // Sign-in button: the one accent; it presses in.
    box([cardX + 0.3, 0.16 + cardY + 0.22, cardZ + 0.14], [cardW - 0.6, 0.38, 0.12], {
      id: 'button', r: 0.08, axis: 'z', role: 'accent', group: 'button',
      decals: { front: [{ t: 'bar', x: (cardW - 0.6) / 2 - 0.35, y: 0.15, w: 0.7, h: 0.08, fill: 'face' }] },
    }),
    // Padlock: body, keyhole plate, shackle.
    box([2.55, 0, 1.0], [1.15, 0.95, 0.62], {
      id: 'lock', r: 0.12, axis: 'z', role: 'body',
      decals: {
        front: [
          { t: 'circle', cx: 0.575, cy: 0.38, r: 0.1, fill: 'ink' },
          { t: 'rect', x: 0.54, y: 0.42, w: 0.07, h: 0.22, r: 0.03, fill: 'ink' },
        ],
      },
    }),
    prism([2.725, 0.95, 1.16], shackle, 0.3, { id: 'shackle', axis: 'z', role: 'detail', group: 'shackle' }),
    // A little potted plant to give the desk a sense of scale.
    cyl([-3.85, 0, 1.25], 0.3, 0.52, { r2: 0.38, role: 'detail', id: 'pot' }),
    cyl([-3.85, 0.52, 1.25], 0.4, 0.06, { role: 'face', id: 'pot-rim' }),
    ball([-3.85, 1.0, 1.25], 0.46, { role: 'face', id: 'leaves' }),
  ],
  motion: {
    duration: 2.4,
    label: 'the button presses and the padlock opens',
    tracks: [
      { group: 'button', t: [0, 0, -0.1], from: 0, to: 0.35, ease: 'inOut' },
      { group: 'shackle', t: [0, 0.32, 0], from: 0.35, to: 1, ease: 'back' },
    ],
  },
});
