/**
 * AI scenes: a GPU training server, a neural network that classifies an
 * image, a robot assistant, an autonomous car yielding at a crossing and a
 * computer-vision inspection line.
 */
import { defineDrawing, box, cbox, cyl, cone, ball, prism, slots, textLines, grid, tickRing } from '../build.js';
import type { Decal, Part, Role } from '../model.js';
import type { Vec3 } from '../math.js';

const CREATED = '2026-11-05';

/* ------------------------------------------------------- GPU training server */
const CX = 0.6, CW = 6.4, CZ = 0.6, CD = 4.2, UNIT = 0.9;
const OY = 0.3 + 2 * UNIT; // floor of the open chassis
const WALL = 0.1, WH = 0.88;
const BB = OY + 0.12; // top of the chassis floor
const GPU = { w: 1.3, d: 0.9, board: 0.08, sink: 0.62, x0: 0.95, pitch: 1.45, z: [2.0, 3.0] };
const LIFT = 2.2;

/** A closed rack server: drive bays across the front, vents on the side. */
const closedServer = (k: number): Part =>
  box([CX, 0.3 + k * UNIT, CZ], [CW, UNIT, CD], {
    id: `server${k}`, r: 0.04,
    decals: {
      front: [
        { t: 'rect', x: 0.1, y: 0.1, w: 0.35, h: UNIT - 0.2, r: 0.04, stroke: 'soft' },
        { t: 'rect', x: CW - 0.45, y: 0.1, w: 0.35, h: UNIT - 0.2, r: 0.04, stroke: 'soft' },
        { t: 'circle', cx: 0.275, cy: 0.3, r: 0.05, fill: k === 1 ? 'accent' : 'ink' },
        ...grid(0.6, 0.12, 12, 2, 0.39, 0.28, 0.04, { fill: 'face', r: 0.03 }),
        ...Array.from({ length: 12 }, (_, c): Decal => ({ t: 'bar', x: 0.66 + c * 0.43, y: 0.22, w: 0.18, h: 0.05, fill: 'ink' })),
        ...Array.from({ length: 12 }, (_, c): Decal => ({ t: 'bar', x: 0.66 + c * 0.43, y: 0.54, w: 0.18, h: 0.05, fill: 'ink' })),
      ],
      right: [slots(0.3, 0.15, 18, 0.2, UNIT - 0.3, 'v')],
    },
  });

/** One SXM-style GPU module: a board with a finned heat sink. */
function gpuModule(id: string, x: number, y: number, z: number, role: Role, group?: string): Part[] {
  return [
    box([x, y, z], [GPU.w, GPU.board, GPU.d], { id: `${id}-board`, role: 'ink', group }),
    box([x + 0.05, y + GPU.board, z + 0.05], [GPU.w - 0.1, GPU.sink, GPU.d - 0.1], {
      id: `${id}-sink`, r: 0.03, role, group,
      decals: {
        top: [slots(0.1, 0.06, 12, 0.095, GPU.d - 0.22, 'v')],
        front: [slots(0.1, 0.08, 12, 0.095, GPU.sink - 0.16, 'v')],
        right: [{ t: 'rect', x: 0.1, y: 0.12, w: GPU.d - 0.3, h: 0.2, r: 0.04, fill: role === 'accent' ? 'face' : 'detail' }],
      },
    }),
  ];
}

const gpus: Part[] = [];
for (const [r, z] of GPU.z.entries()) for (let c = 0; c < 4; c++) {
  if (r === 1 && c === 2) continue; // the free socket
  gpus.push(...gpuModule(`gpu-${r}${c}`, CX + 0.35 + c * GPU.pitch, BB + 0.08, z, 'face'));
}

export const gpuServer = defineDrawing({
  id: 'gpu-server',
  name: 'GPU training server',
  category: 'ai',
  tags: ['ai', 'gpu', 'training', 'compute', 'nvidia', 'hgx', 'accelerator', 'server', 'machine learning', 'deep learning', 'cluster', 'hardware'],
  kind: 'scene',
  prompt: '/isometric create a GPU training server with the lid off and a GPU being installed, for our AI compute page',
  description: 'Two closed rack servers carry an open GPU server: power supplies at the back, four switch chips, eight finned GPU modules on a baseboard and a row of fans behind the front panel. The lit GPU module lowers into the one empty socket.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [7.6, 0.3, 5.4], { id: 'deck', r: 0.15, role: 'face', decals: { top: [slots(0.3, 5.0, 36, 0.2, 0.2, 'v')] } }),
    closedServer(0), closedServer(1),
    // Open chassis: floor, then four walls that touch rather than overlap.
    box([CX, OY, CZ], [CW, 0.12, CD], { id: 'chassis-floor', role: 'detail' }),
    box([CX, BB, CZ], [CW, WH, WALL], { id: 'wall-back' }),
    box([CX, BB, CZ + WALL], [WALL, WH, CD - 2 * WALL], { id: 'wall-left' }),
    box([CX + CW - WALL, BB, CZ + WALL], [WALL, WH, CD - 2 * WALL], { id: 'wall-right', decals: { right: [slots(0.4, 0.15, 18, 0.2, WH - 0.3, 'v')] } }),
    box([CX, BB, CZ + CD - WALL], [CW, WH, WALL], {
      id: 'wall-front',
      decals: { front: [...grid(0.6, 0.15, 12, 1, 0.39, 0.55, 0.04, { fill: 'face', r: 0.03 }), { t: 'circle', cx: 0.3, cy: 0.3, r: 0.07, fill: 'accent' }, { t: 'circle', cx: CW - 0.3, cy: 0.3, r: 0.07, fill: 'ink' }] },
    }),
    // Power supplies at the back.
    ...[0, 1, 2, 3].map((k) => box([CX + 0.3 + k * 1.5, BB, CZ + WALL + 0.05], [1.4, 0.62, 0.6], {
      id: `psu${k}`, r: 0.03, role: 'detail',
      decals: { top: [slots(0.12, 0.1, 12, 0.1, 0.4, 'v')], front: [{ t: 'circle', cx: 1.2, cy: 0.18, r: 0.05, fill: 'ink' }, { t: 'bar', x: 0.15, y: 0.15, w: 0.5, h: 0.06, fill: 'ink' }] },
    })),
    // Baseboard with switch chips and GPU sockets.
    box([CX + WALL + 0.1, BB, 1.45], [CW - 2 * WALL - 0.2, 0.08, 2.5], {
      id: 'baseboard', role: 'ink',
      decals: { top: [{ t: 'rect', x: 0.25 + 2 * GPU.pitch, y: 1.55, w: GPU.w, h: GPU.d, r: 0.04, fill: 'face', stroke: true }, ...grid(0.45 + 2 * GPU.pitch, 1.7, 6, 3, 0.12, 0.12, 0.05, { fill: 'detail', stroke: false, r: 0.02 })] },
    }),
    ...[0, 1, 2, 3].map((k) => box([CX + 0.7 + k * 1.45, BB + 0.08, 1.55], [0.6, 0.22, 0.35], {
      id: `switch${k}`, r: 0.03, role: 'detail',
      decals: { top: [{ t: 'rect', x: 0.12, y: 0.08, w: 0.36, h: 0.19, r: 0.03, fill: 'face', stroke: 'soft' }] },
    })),
    ...gpus,
    // Fan wall.
    ...[0, 1, 2, 3, 4].map((k) => box([CX + 0.25 + k * 1.18, BB, 4.0], [1.14, 0.8, 0.65], {
      id: `fan${k}`, r: 0.04,
      decals: { top: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.94, h: 0.45, r: 0.05, fill: 'detail', stroke: 'soft' }, { t: 'bar', x: 0.35, y: 0.28, w: 0.44, h: 0.08, fill: 'ink' }] },
    })),
    // The new GPU, lifted above its socket.
    ...gpuModule('gpu-new', CX + 0.35 + 2 * GPU.pitch, BB + 0.08 + LIFT, GPU.z[1], 'accent', 'gpu'),
  ],
  motion: {
    duration: 3.2,
    label: 'the new GPU lowers into its socket',
    tracks: [{ group: 'gpu', t: [0, -LIFT, 0], from: 0.1, to: 0.85, ease: 'inOut' }],
  },
});

/* ---------------------------------------------------------- neural network */
const NB = { x: 1.8, z: 0.7, w: 6.2, d: 4.6, y: 0.3, h: 0.2 };
const NTOP = NB.y + NB.h;
const LAYERS = [{ x: 2.5, n: 4 }, { x: 4.2, n: 5 }, { x: 5.8, n: 5 }, { x: 7.3, n: 3 }];
const NZ = (n: number, k: number) => NB.z + NB.d / 2 + (k - (n - 1) / 2) * 0.9;
const ACTIVE = [1, 2, 3, 1];
const OUT_X = 8.7;
const OUT_H = [0.55, 1.9, 0.85];

/** Connections between consecutive layers, drawn on the board in its top frame. */
function wiring(): Decal[] {
  const soft: [number, number, number, number][] = [];
  const lit: [number, number][] = [];
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const a = LAYERS[l], b = LAYERS[l + 1];
    for (let i = 0; i < a.n; i++) for (let j = 0; j < b.n; j++) {
      const seg: [number, number, number, number] = [a.x - NB.x, NZ(a.n, i) - NB.z, b.x - NB.x, NZ(b.n, j) - NB.z];
      if (i === ACTIVE[l] && j === ACTIVE[l + 1]) continue;
      soft.push(seg);
    }
  }
  for (let l = 0; l < LAYERS.length; l++) lit.push([LAYERS[l].x - NB.x, NZ(LAYERS[l].n, ACTIVE[l]) - NB.z]);
  // Output leads run off the board edge toward the score bars.
  const last = LAYERS[LAYERS.length - 1];
  for (let k = 0; k < last.n; k++) {
    const seg: [number, number, number, number] = [last.x - NB.x, NZ(last.n, k) - NB.z, NB.w, NZ(last.n, k) - NB.z];
    if (k === ACTIVE[LAYERS.length - 1]) lit.push([seg[2], seg[3]]);
    else soft.push(seg);
  }
  return [
    { t: 'rect', x: 0.15, y: 0.15, w: NB.w - 0.3, h: NB.d - 0.3, r: 0.12, stroke: 'soft' },
    { t: 'segs', segs: soft, stroke: 'soft' },
    { t: 'line', pts: lit, stroke: 'accent', width: 2 },
  ];
}

/** An input image card: a framed picture of a mountain under a sun. */
const imageCard = (k: number, x: number, z: number): Part =>
  box([x, 0.3, z], [0.95, 1.15, 0.06], {
    id: `input${k}`, r: 0.06, axis: 'z', role: 'face',
    decals: {
      front: [
        { t: 'rect', x: 0.1, y: 0.1, w: 0.75, h: 0.62, r: 0.04, fill: 'detail', stroke: 'soft' },
        { t: 'circle', cx: 0.65, cy: 0.25, r: 0.07, fill: k === 1 ? 'accent' : 'face' },
        { t: 'line', pts: [[0.12, 0.7], [0.35, 0.38], [0.5, 0.55], [0.6, 0.45], [0.83, 0.7]], stroke: true, closed: true, fill: 'face' },
        ...textLines(0.12, 0.85, 0.7, [1, 0.6], 0.13, 0.05),
      ],
    },
  });

export const neuralNetwork = defineDrawing({
  id: 'neural-network',
  name: 'Neural network',
  category: 'ai',
  tags: ['ai', 'neural network', 'deep learning', 'machine learning', 'model', 'classifier', 'layers', 'inference', 'training', 'perceptron', 'ml'],
  kind: 'scene',
  prompt: '/isometric create a neural network classifying an image, with layers, connections and output scores, for our ML explainer page',
  description: 'Image cards stand at the input of a circuit board on which four layers of node pucks are wired to each other. One lit path of activations runs from an input node through the hidden layers to the winning output, whose score bar rises highest. A training chart with a falling loss curve floats behind.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [10.0, 0.3, 6.0], { id: 'deck', r: 0.15, role: 'face', decals: { top: [slots(0.3, 5.6, 48, 0.2, 0.2, 'v')] } }),
    imageCard(0, 0.4, 1.3), imageCard(1, 0.55, 2.6), imageCard(2, 0.7, 3.9),
    box([NB.x, NB.y, NB.z], [NB.w, NB.h, NB.d], {
      id: 'board', r: 0.06, role: 'face',
      decals: { top: wiring(), front: [slots(0.3, 0.05, 30, 0.2, 0.1, 'v')], right: [slots(0.3, 0.05, 22, 0.2, 0.1, 'v')] },
    }),
    ...LAYERS.flatMap((L, l) => Array.from({ length: L.n }, (_, k): Part => {
      const lit = k === ACTIVE[l];
      return cyl([L.x, NTOP, NZ(L.n, k)], 0.28, 0.3, {
        id: `n${l}-${k}`, n: 32, role: lit ? 'accent' : l === 0 || l === LAYERS.length - 1 ? 'detail' : 'body', group: lit ? `a${l}` : undefined,
        decals: { top: [{ t: 'circle', cx: 0.28, cy: 0.28, r: 0.15, fill: lit ? 'face' : 'bg', stroke: 'soft' }] },
      });
    })),
    // Output scores: one bar per class, the winner lit.
    box([OUT_X - 0.15, 0.3, 1.9], [0.8, 0.12, 2.5], { id: 'score-base', r: 0.04, role: 'detail' }),
    ...OUT_H.map((h, k) => cbox(OUT_X + 0.25, 0.42, NZ(3, k), [0.5, h, 0.5], {
      id: `score${k}`, r: 0.04, role: k === ACTIVE[3] ? 'accent' : 'face', group: k === ACTIVE[3] ? 'score' : undefined,
      decals: { front: textLines(0.1, 0.12, 0.3, [1], 0.1, 0.05, 'soft') },
    })),
    // Training chart floating behind the board.
    box([2.2, 2.3, 0.1], [5.2, 1.9, 0.08], {
      id: 'chart', r: 0.12, axis: 'z', group: 'float',
      decals: {
        front: [
          ...textLines(0.3, 0.25, 1.6, [0.5, 0.3], 0.17, 0.08),
          { t: 'line', pts: [[0.35, 0.6], [0.35, 1.6], [4.85, 1.6]], stroke: 'soft' },
          { t: 'segs', segs: [[0.35, 0.85, 4.85, 0.85], [0.35, 1.1, 4.85, 1.1], [0.35, 1.35, 4.85, 1.35]], stroke: 'soft' },
          { t: 'line', pts: [[0.4, 0.65], [0.8, 0.95], [1.3, 1.15], [1.9, 1.24], [2.6, 1.36], [3.3, 1.42], [4.0, 1.46], [4.8, 1.48]], stroke: 'accent', width: 2 },
          { t: 'circle', cx: 4.8, cy: 1.48, r: 0.07, fill: 'accent' },
          { t: 'rect', x: 3.6, y: 0.22, w: 1.25, h: 0.25, r: 0.12, fill: 'detail' },
        ],
      },
    }),
  ],
  motion: {
    duration: 3.2,
    label: 'activations fire layer by layer and the winning score rises',
    tracks: [
      ...LAYERS.map((_, l) => ({ group: `a${l}`, t: [0, 0.3, 0] as Vec3, from: l * 0.15, to: l * 0.15 + 0.3, ease: 'inOut' as const })),
      { group: 'score', s: { k: [1, 1.35, 1] as Vec3, pivot: [OUT_X + 0.25, 0.42, NZ(3, 1)] as Vec3 }, from: 0.55, to: 0.95, ease: 'out' },
      { group: 'float', t: [0, 0.15, 0], ease: 'inOut' },
    ],
  },
});

/* --------------------------------------------------------- robot assistant */
const RX = 3.4, RZ = 2.6;
const TORSO = { y: 1.2, w: 1.7, h: 1.7, d: 1.2 };
const SH_Y = TORSO.y + TORSO.h - 0.35, SH_R = 0.22;
const ARM = { len: 1.15, t: 0.3 };
const shoulderR: Vec3 = [RX + TORSO.w / 2 + SH_R, SH_Y, RZ];
const shoulderL: Vec3 = [RX - TORSO.w / 2 - SH_R, SH_Y, RZ];
const HEAD_Y = TORSO.y + TORSO.h + 0.2;

/** An arm hanging from a shoulder pivot, then turned about z by `deg`. */
function arm(side: string, s: Vec3, deg: number, group?: string): Part[] {
  const rot = [{ axis: 'z' as const, deg, pivot: s }];
  return [
    box([s[0] - ARM.t / 2, s[1] - SH_R - ARM.len, s[2] - ARM.t / 2], [ARM.t, ARM.len, ARM.t], { id: `arm-${side}`, r: 0.1, axis: 'y', role: 'face', rot, group }),
    ball([s[0], s[1] - SH_R - ARM.len - 0.24, s[2]], 0.24, { id: `hand-${side}`, role: 'detail', rot, group }),
  ];
}

/** A speech bubble: rounded slab with a tail pointing down toward the robot. */
function bubble(id: string, x: number, y: number, z: number, w: number, h: number, role: Role, tail: 'left' | 'right', decals: Decal[]): Part[] {
  const tx = tail === 'right' ? x + w - 0.55 : x + 0.25;
  const tip = tail === 'right' ? tx + 0.5 : tx - 0.15;
  return [
    box([x, y, z], [w, h, 0.12], { id, r: 0.22, axis: 'z', role, group: 'float', decals: { front: decals } }),
    prism([0, 0, z], [[tx, y], [tx + 0.3, y], [tip, y - 0.32]], 0.12, { id: `${id}-tail`, axis: 'z', role, group: 'float' }),
  ];
}

export const robotAssistant = defineDrawing({
  id: 'robot-assistant',
  name: 'Robot assistant',
  category: 'ai',
  tags: ['ai', 'assistant', 'robot', 'chatbot', 'agent', 'copilot', 'bot', 'support', 'conversational ai', 'chat', 'helper'],
  kind: 'scene',
  prompt: '/isometric create a friendly robot assistant waving next to chat bubbles, for our AI support page',
  description: 'A friendly robot on a charging pad: a rounded head with a visor and lit eyes, an antenna, ear pods and a chest screen showing a voice waveform. It waves with one arm while two chat bubbles float beside it, the nearer one showing a typing indicator.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0.4], [6.2, 0.3, 4.4], { id: 'deck', r: 0.15, role: 'face', decals: { top: [slots(0.3, 4.0, 29, 0.2, 0.2, 'v')] } }),
    cyl([RX, 0.3, RZ], 1.3, 0.1, { id: 'pad', role: 'detail', n: 56, decals: { top: [tickRing(1.3, 1.3, 1.22, 36, 3, 0.14)] } }),
    cyl([RX, 0.4, RZ], 0.95, 0.45, { id: 'base', n: 48 }),
    cyl([RX, 0.85, RZ], 0.62, 0.35, { id: 'waist', role: 'ink', n: 40 }),
    cbox(RX, TORSO.y, RZ, [TORSO.w, TORSO.h, TORSO.d], {
      id: 'torso', r: 0.3, axis: 'z',
      decals: {
        front: [
          { t: 'rect', x: 0.3, y: 0.3, w: 1.1, h: 0.62, r: 0.1, fill: 'ink' },
          ...[0.2, 0.36, 0.5, 0.28, 0.44, 0.24, 0.12].map((h, k): Decal => ({ t: 'bar', x: 0.42 + k * 0.13, y: 0.61 - h / 2, w: 0.07, h, fill: 'accent' })),
          { t: 'circle', cx: 0.5, cy: 1.25, r: 0.1, fill: 'detail', stroke: 'soft' },
          { t: 'circle', cx: 0.85, cy: 1.25, r: 0.1, fill: 'detail', stroke: 'soft' },
          { t: 'bar', x: 1.05, y: 1.21, w: 0.35, h: 0.08, fill: 'soft' },
        ],
        right: [slots(0.35, 0.4, 5, 0.12, 0.8, 'v')],
      },
    }),
    ball(shoulderR, SH_R, { id: 'shoulder-r', role: 'detail' }),
    ball(shoulderL, SH_R, { id: 'shoulder-l', role: 'detail' }),
    ...arm('l', shoulderL, -14),
    ...arm('r', shoulderR, 145, 'wave'),
    cyl([RX, TORSO.y + TORSO.h, RZ], 0.24, 0.2, { id: 'neck', role: 'ink', n: 24 }),
    cbox(RX, HEAD_Y, RZ, [1.6, 1.15, 1.3], {
      id: 'head', r: 0.38, axis: 'z',
      decals: {
        front: [
          { t: 'rect', x: 0.18, y: 0.22, w: 1.24, h: 0.58, r: 0.26, fill: 'ink' },
          { t: 'circle', cx: 0.56, cy: 0.5, r: 0.12, fill: 'accent' },
          { t: 'circle', cx: 1.04, cy: 0.5, r: 0.12, fill: 'accent' },
          { t: 'bar', x: 0.62, y: 0.92, w: 0.36, h: 0.07, fill: 'soft' },
        ],
      },
    }),
    cyl([RX + 0.8, HEAD_Y + 0.55, RZ], 0.26, 0.16, { id: 'ear-r', axis: 'x', role: 'detail', n: 28, decals: { right: [{ t: 'circle', cx: 0.26, cy: 0.26, r: 0.12, fill: 'face', stroke: 'soft' }] } }),
    cyl([RX - 0.8, HEAD_Y + 0.55, RZ], 0.26, -0.16, { id: 'ear-l', axis: 'x', role: 'detail', n: 28 }),
    cyl([RX, HEAD_Y + 1.15, RZ], 0.04, 0.45, { id: 'antenna', role: 'ink', n: 10 }),
    ball([RX, HEAD_Y + 1.6 + 0.13, RZ], 0.13, { id: 'antenna-tip', role: 'accent', group: 'blink' }),
    // Chat bubbles to the robot's right (viewer's left).
    ...bubble('ask', 0.2, 4.6, 1.2, 1.9, 0.75, 'detail', 'right', textLines(0.25, 0.22, 1.4, [1, 0.6], 0.22, 0.09, 'face')),
    ...bubble('reply', 0.0, 3.45, 2.4, 1.75, 0.8, 'face', 'right', [
      { t: 'circle', cx: 0.5, cy: 0.4, r: 0.09, fill: 'accent' },
      { t: 'circle', cx: 0.87, cy: 0.4, r: 0.09, fill: 'accent' },
      { t: 'circle', cx: 1.24, cy: 0.4, r: 0.09, fill: 'soft' },
    ]),
  ],
  motion: {
    duration: 2.4,
    label: 'the robot waves while the chat bubbles bob',
    tracks: [
      { group: 'wave', r: { axis: 'z', deg: -28, pivot: shoulderR }, ease: 'inOut' },
      { group: 'float', t: [0, 0.14, 0], ease: 'inOut' },
      { group: 'blink', t: [0, 0.08, 0], from: 0.4, to: 0.7, ease: 'inOut' },
    ],
  },
});

/* ---------------------------------------------------------- autonomous car */
const ROAD = { z0: 1.1, z1: 4.9 }, CURB = 0.12;
const CAR = { x: 1.6, len: 3.9, z0: 3.25, z1: 4.65, y: 0.62 };
const WHEEL = { r: 0.36, t: 0.18, xs: [CAR.x + 0.85, CAR.x + 3.05] };
const CARZ = (CAR.z0 + CAR.z1) / 2;
const LIDAR: Vec3 = [CAR.x + 1.75, 0, CARZ];
const CROSS = { x: 7.0, w: 1.3 };
const WALK = 2.4;

/** Forward-facing scan arcs on the road, clipped to the road surface. */
function scanArcs(): Decal[] {
  const out: Decal[] = [];
  const cx = CAR.x + CAR.len - 0.3;
  for (const r of [1.4, 2.2, 3.0]) {
    const segs: [number, number, number, number][] = [];
    for (let a = -64; a < 64; a += 8) {
      const p = (d: number): [number, number] => [cx + r * Math.cos((d * Math.PI) / 180), CARZ + r * Math.sin((d * Math.PI) / 180)];
      const [x1, z1] = p(a), [x2, z2] = p(a + 5);
      if (Math.min(z1, z2) < ROAD.z0 + 0.05 || Math.max(z1, z2) > ROAD.z1 - 0.05) continue;
      segs.push([x1, z1, x2, z2]);
    }
    out.push({ t: 'segs', segs, stroke: 'accent' });
  }
  return out;
}

const roadDecals: Decal[] = [
  { t: 'rect', x: 0, y: ROAD.z0, w: 10, h: ROAD.z1 - ROAD.z0, fill: 'detail' },
  { t: 'segs', segs: Array.from({ length: 6 }, (_, k): [number, number, number, number] => [0.3 + k * 1.15, 3.0, 0.9 + k * 1.15, 3.0]), stroke: 'face', width: 3 },
  { t: 'segs', segs: [[CROSS.x - 0.35, 3.05, CROSS.x - 0.35, ROAD.z1 - 0.05]], stroke: 'face', width: 3 },
  ...Array.from({ length: 6 }, (_, k): Decal => ({ t: 'rect', x: CROSS.x, y: ROAD.z0 + 0.15 + k * 0.62, w: CROSS.w, h: 0.34, fill: 'face' })),
  ...scanArcs(),
];

/** A tree on the sidewalk. */
const tree = (k: number, x: number, z: number): Part[] => [
  cyl([x, 0.3 + CURB, z], 0.1, 0.75, { id: `trunk${k}`, role: 'ink', n: 12 }),
  ball([x, 0.3 + CURB + 0.75 + 0.5, z], 0.52, { id: `canopy${k}`, role: 'body' }),
];

export const autonomousCar = defineDrawing({
  id: 'autonomous-car',
  name: 'Autonomous car',
  category: 'ai',
  tags: ['ai', 'self-driving', 'autonomous', 'car', 'vehicle', 'lidar', 'perception', 'computer vision', 'robotaxi', 'adas', 'mobility', 'sensor'],
  kind: 'scene',
  prompt: '/isometric create a self-driving car with lidar scanning a crosswalk and detecting a pedestrian, for our autonomy page',
  description: 'A street corner with sidewalks, trees and a traffic light. A self-driving car waits at the stop line with a spinning lidar on its roof and a sensor on its bumper; scan arcs fan out across the road ahead. A pedestrian crosses the zebra crossing with a detection marker floating above them.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [10.0, 0.3, 6.0], { id: 'ground', role: 'face', decals: { top: roadDecals } }),
    box([0, 0.3, 0], [10.0, CURB, ROAD.z0], { id: 'walk-back', role: 'face', decals: { top: [slots(0.8, 0, 12, 0.8, ROAD.z0, 'v')] } }),
    box([0, 0.3, ROAD.z1], [10.0, CURB, 6.0 - ROAD.z1], { id: 'walk-front', role: 'face', decals: { top: [slots(0.8, 0, 12, 0.8, 6.0 - ROAD.z1, 'v')] } }),
    ...tree(0, 1.2, 0.55), ...tree(1, 4.0, 0.55),
    // Traffic light on the back sidewalk.
    cyl([8.9, 0.3 + CURB, 0.6], 0.07, 2.6, { id: 'signal-pole', role: 'ink', n: 12 }),
    box([8.65, 0.3 + CURB + 2.6, 0.45], [0.5, 1.2, 0.35], {
      id: 'signal', r: 0.08, axis: 'y', role: 'detail',
      decals: { front: [0.2, 0.6, 1.0].map((cy, k): Decal => ({ t: 'circle', cx: 0.25, cy, r: 0.13, fill: k === 0 ? 'ink' : 'face', stroke: 'soft' })) },
    }),
    // The car: wheels, lower body, cabin, roof sensors.
    ...WHEEL.xs.flatMap((x, k): Part[] => [
      cyl([x, 0.3 + WHEEL.r, CAR.z1], WHEEL.r, WHEEL.t, { id: `wheel-n${k}`, axis: 'z', role: 'ink', n: 28, decals: { front: [{ t: 'circle', cx: WHEEL.r, cy: WHEEL.r, r: 0.17, fill: 'detail', stroke: 'soft' }] } }),
      // Far wheels face the ground when the scene lies down; dropping them avoids an AABB sort cycle there.
      cyl([x, 0.3 + WHEEL.r, CAR.z0], WHEEL.r, -WHEEL.t, { id: `wheel-f${k}`, axis: 'z', role: 'ink', n: 28, only: 'standing' }),
    ]),
    box([CAR.x, CAR.y, CAR.z0], [CAR.len, 0.62, CAR.z1 - CAR.z0], {
      id: 'car-body', r: 0.2, axis: 'z',
      decals: {
        front: [
          { t: 'segs', segs: [[1.95, 0.05, 1.95, 0.5]], stroke: 'soft' },
          { t: 'bar', x: 1.6, y: 0.18, w: 0.22, h: 0.05, fill: 'ink' },
          { t: 'bar', x: 2.6, y: 0.18, w: 0.22, h: 0.05, fill: 'ink' },
          { t: 'rect', x: CAR.len - 0.3, y: 0.08, w: 0.22, h: 0.14, r: 0.05, fill: 'face', stroke: 'soft' },
          { t: 'rect', x: 0.06, y: 0.08, w: 0.18, h: 0.14, r: 0.05, fill: 'ink' },
        ],
        right: [
          { t: 'rect', x: 0.1, y: 0.08, w: 0.3, h: 0.14, r: 0.05, fill: 'face', stroke: 'soft' },
          { t: 'rect', x: 1.0, y: 0.08, w: 0.3, h: 0.14, r: 0.05, fill: 'face', stroke: 'soft' },
          slots(0.5, 0.32, 5, 0.1, 0.18, 'v'),
        ],
      },
    }),
    prism([0, 0, CAR.z0 + 0.12], [[CAR.x + 0.35, CAR.y + 0.62], [CAR.x + 2.95, CAR.y + 0.62], [CAR.x + 2.35, CAR.y + 1.22], [CAR.x + 0.85, CAR.y + 1.22]], CAR.z1 - CAR.z0 - 0.24, {
      id: 'cabin', axis: 'z', role: 'face',
      decals: {
        front: [
          { t: 'line', pts: [[0.55, 0.1], [1.2, 0.1], [1.2, 0.5], [0.16, 0.5]], closed: true, fill: 'ink', stroke: true },
          { t: 'line', pts: [[1.32, 0.1], [1.95, 0.1], [2.38, 0.5], [1.32, 0.5]], closed: true, fill: 'ink', stroke: true },
        ],
      },
    }),
    box([CAR.x + 1.3, CAR.y + 1.22, CARZ - 0.45], [0.9, 0.06, 0.9], { id: 'roof-mount', role: 'ink' }),
    cyl([LIDAR[0], CAR.y + 1.28, CARZ], 0.26, 0.1, { id: 'lidar-base', role: 'detail', n: 32 }),
    cyl([LIDAR[0], CAR.y + 1.38, CARZ], 0.22, 0.26, {
      id: 'lidar', role: 'accent', n: 32, group: 'spin',
      decals: { front: [{ t: 'rect', x: 0.1, y: 0.08, w: 0.18, h: 0.1, r: 0.04, fill: 'ink' }], right: [{ t: 'rect', x: 0.1, y: 0.08, w: 0.18, h: 0.1, r: 0.04, fill: 'ink' }] },
    }),
    box([CAR.x + CAR.len, CAR.y + 0.12, CARZ - 0.18], [0.08, 0.2, 0.36], { id: 'bumper-sensor', r: 0.04, axis: 'x', role: 'accent' }),
    // Pedestrian on the crossing with a detection marker.
    cbox(CROSS.x + 0.55, 0.3, ROAD.z0 + 0.5, [0.32, 0.65, 0.22], { id: 'legs', r: 0.08, axis: 'z', role: 'ink', group: 'walk' }),
    cbox(CROSS.x + 0.55, 0.95, ROAD.z0 + 0.5, [0.5, 0.7, 0.3], { id: 'coat', r: 0.14, axis: 'z', role: 'body', group: 'walk' }),
    ball([CROSS.x + 0.55, 1.65 + 0.2, ROAD.z0 + 0.5], 0.2, { id: 'head', role: 'face', group: 'walk' }),
    prism([0, 0, ROAD.z0 + 0.45], [[CROSS.x + 0.37, 2.55], [CROSS.x + 0.73, 2.55], [CROSS.x + 0.55, 2.27]], 0.1, { id: 'marker', axis: 'z', role: 'accent', group: 'walk' }),
    // A cone at the kerb.
    box([5.0, 0.3, 1.25], [0.5, 0.06, 0.5], { id: 'cone-base', role: 'ink' }),
    cone([5.25, 0.36, 1.5], 0.2, 0.62, { id: 'cone', role: 'face', n: 24 }),
  ],
  motion: {
    duration: 4.2,
    label: 'the lidar spins while a pedestrian crosses',
    tracks: [
      { group: 'spin', r: { axis: 'y', deg: 360, pivot: LIDAR }, mode: 'loop' },
      { group: 'walk', t: [0, 0, WALK], ease: 'inOut' },
    ],
  },
});

/* ------------------------------------------------------ vision inspection */
const BELT = { x: 0.4, len: 9.2, z: 2.0, d: 1.4, y: 1.0, h: 0.2 };
const BTOP = BELT.y + BELT.h;
const ITEM = 0.7;
const GANTRY_X = 3.8, PUSH_X = 6.6;
const BIN = { x: PUSH_X - 0.75, z: 3.85, w: 1.5, d: 1.3, h: 0.8 };
const PUSH = 1.85, DROP = 0.8;
const ROD = { z: 1.45, len: BELT.z + 0.1 - 1.45 };

const carton = (id: string, cx: number, role: Role = 'face', group?: string): Part =>
  cbox(cx, BTOP, BELT.z + BELT.d / 2, [ITEM, ITEM, ITEM], {
    id, r: 0.03, role, group,
    decals: { top: [{ t: 'segs', segs: [[0, ITEM / 2, ITEM, ITEM / 2]], stroke: true }], front: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.22, h: 0.14, r: 0.02, fill: role === 'accent' ? 'face' : 'detail' }] },
  });

export const visionInspection = defineDrawing({
  id: 'vision-inspection',
  name: 'Vision inspection line',
  category: 'ai',
  tags: ['ai', 'computer vision', 'inspection', 'quality control', 'defect detection', 'camera', 'manufacturing', 'conveyor', 'industrial ai', 'object detection'],
  kind: 'scene',
  prompt: '/isometric create a computer vision quality inspection line: conveyor, overhead camera, a monitor with detections and a defective box being rejected',
  description: 'Cartons ride a conveyor under an inspection gantry with a downward camera and a ring light. A monitor on a stand shows the camera feed with one carton boxed as a defect. Further along, a pneumatic pusher shoves the lit defective carton off the belt into a reject bin.',
  createdAt: CREATED,
  parts: [
    box([0, 0, 0], [10.0, 0.3, 5.6], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 9.6, h: 5.2, r: 0.12, stroke: 'soft' }, slots(0.4, 5.25, 47, 0.2, 0.15, 'v')] } }),
    // Conveyor: legs, frame, belt.
    ...[1.0, 4.6, 8.8].flatMap((x, k): Part[] => [
      box([x, 0.3, BELT.z + 0.1], [0.2, BELT.y - 0.45, 0.2], { id: `leg-b${k}`, role: 'ink' }),
      box([x, 0.3, BELT.z + BELT.d - 0.3], [0.2, BELT.y - 0.45, 0.2], { id: `leg-f${k}`, role: 'ink' }),
    ]),
    box([BELT.x, BELT.y - 0.15, BELT.z], [BELT.len, 0.15, BELT.d], { id: 'frame', role: 'detail', decals: { front: [slots(0.2, 0.04, 46, 0.2, 0.07, 'v')] } }),
    box([BELT.x, BELT.y, BELT.z], [BELT.len, BELT.h, BELT.d], {
      id: 'belt', r: 0.1, axis: 'x', role: 'ink',
      decals: { top: [slots(0.2, 0.1, 46, 0.2, BELT.d - 0.2, 'v', true)] },
    }),
    // Cartons; the ones before the gantry ride along.
    carton('carton0', 1.3, 'face', 'ride'), carton('carton1', 2.5, 'body', 'ride'),
    carton('carton2', GANTRY_X + 0.3, 'face'),
    carton('reject', PUSH_X, 'accent', 'reject'),
    carton('carton3', 8.6, 'body'),
    // Inspection gantry: two posts, a beam, the camera and ring light.
    box([GANTRY_X - 0.15, 0.3, BELT.z - 0.55], [0.3, 3.0, 0.3], { id: 'post-b', role: 'detail' }),
    box([GANTRY_X - 0.15, 0.3, BELT.z + BELT.d + 0.25], [0.3, 3.0, 0.3], { id: 'post-f', role: 'detail' }),
    box([GANTRY_X - 0.2, 3.3, BELT.z - 0.55], [0.4, 0.35, BELT.d + 1.1], { id: 'beam', r: 0.04, axis: 'z', decals: { right: [slots(0.2, 0.1, 11, 0.2, 0.15, 'v')] } }),
    cbox(GANTRY_X, 2.65, BELT.z + BELT.d / 2, [0.5, 0.65, 0.6], { id: 'camera', r: 0.06, axis: 'y', role: 'body', decals: { front: [{ t: 'circle', cx: 0.4, cy: 0.12, r: 0.04, fill: 'accent' }, { t: 'bar', x: 0.08, y: 0.25, w: 0.25, h: 0.06 }], right: [slots(0.12, 0.15, 4, 0.1, 0.35, 'v')] } }),
    cyl([GANTRY_X, 2.65, BELT.z + BELT.d / 2], 0.16, -0.25, { id: 'lens', role: 'ink', n: 24 }),
    cyl([GANTRY_X, 2.25, BELT.z + BELT.d / 2], 0.5, 0.15, { id: 'ring-light', role: 'face', n: 40, decals: { top: [tickRing(0.5, 0.5, 0.45, 24, 2, 0.1)] } }),
    // Monitor showing the camera feed.
    box([8.2, 0.3, 0.3], [0.9, 0.1, 0.7], { id: 'stand-foot', r: 0.04, role: 'detail' }),
    cbox(8.65, 0.4, 0.65, [0.14, 1.9, 0.14], { id: 'stand-pole', role: 'ink' }),
    box([7.5, 2.3, 0.72], [2.3, 1.5, 0.12], {
      id: 'monitor', r: 0.08, axis: 'z',
      decals: {
        front: [
          { t: 'rect', x: 0.12, y: 0.12, w: 2.06, h: 1.12, r: 0.04, fill: 'ink' },
          ...[0.35, 0.95, 1.55].map((x, k): Decal => ({ t: 'rect', x, y: 0.5, w: 0.42, h: 0.42, r: 0.02, fill: 'face', stroke: false, opacity: k === 1 ? 1 : 0.6 })),
          { t: 'line', pts: [[0.86, 0.4], [1.48, 0.4], [1.48, 1.02], [0.86, 1.02]], closed: true, stroke: 'accent', width: 2 },
          { t: 'rect', x: 0.86, y: 0.24, w: 0.4, h: 0.13, r: 0.03, fill: 'accent' },
          ...textLines(0.2, 1.33, 0.9, [1], 0.1, 0.06, 'soft'),
          { t: 'circle', cx: 2.05, cy: 1.36, r: 0.05, fill: 'accent' },
        ],
      },
    }),
    // Pneumatic pusher behind the belt.
    box([PUSH_X - 0.35, BTOP - 0.1, 0.45], [0.7, 0.5, 1.0], { id: 'pusher-body', r: 0.06, axis: 'z', role: 'detail', decals: { right: [slots(0.15, 0.12, 7, 0.1, 0.26, 'v')], top: [{ t: 'circle', cx: 0.35, cy: 0.25, r: 0.08, fill: 'ink' }] } }),
    box([PUSH_X - 0.25, 0.3, 0.75], [0.5, BTOP - 0.1 - 0.3, 0.4], { id: 'pusher-stand', role: 'ink' }),
    box([PUSH_X - 0.06, BTOP + 0.15, ROD.z], [0.12, 0.12, ROD.len], { id: 'pusher-rod', role: 'ink', group: 'rod' }),
    box([PUSH_X - 0.35, BTOP + 0.05, BELT.z + 0.1], [0.7, 0.32, 0.08], { id: 'paddle', r: 0.04, axis: 'z', role: 'body', group: 'push' }),
    // Reject bin in front of the belt.
    box([BIN.x, 0.3, BIN.z], [BIN.w, 0.08, BIN.d], { id: 'bin-floor', role: 'detail' }),
    box([BIN.x, 0.38, BIN.z], [BIN.w, BIN.h, 0.08], { id: 'bin-back', role: 'detail' }),
    box([BIN.x, 0.38, BIN.z + 0.08], [0.08, BIN.h, BIN.d - 0.16], { id: 'bin-left', role: 'detail' }),
    box([BIN.x + BIN.w - 0.08, 0.38, BIN.z + 0.08], [0.08, BIN.h, BIN.d - 0.16], { id: 'bin-right', role: 'detail', decals: { right: [{ t: 'bar', x: 0.25, y: 0.2, w: 0.6, h: 0.08, fill: 'ink' }] } }),
    box([BIN.x, 0.38, BIN.z + BIN.d - 0.08], [BIN.w, BIN.h, 0.08], { id: 'bin-front', role: 'detail', decals: { front: [{ t: 'rect', x: 0.3, y: 0.2, w: 0.9, h: 0.35, r: 0.05, fill: 'face', stroke: 'soft' }, { t: 'segs', segs: [[0.6, 0.27, 0.9, 0.48], [0.9, 0.27, 0.6, 0.48]], stroke: 'accent', width: 2 }] } }),
  ],
  motion: {
    duration: 3.6,
    label: 'cartons ride the belt and the pusher rejects the defect',
    tracks: [
      { group: 'ride', t: [1.2, 0, 0], mode: 'loop' },
      { group: 'push', t: [0, 0, PUSH], from: 0.15, to: 0.6, ease: 'inOut' },
      { group: 'rod', s: { k: [1, 1, (ROD.len + PUSH) / ROD.len], pivot: [PUSH_X, BTOP + 0.15, ROD.z] }, from: 0.15, to: 0.6, ease: 'inOut' },
      { group: 'reject', t: [0, 0, PUSH], from: 0.15, to: 0.6, ease: 'inOut' },
      { group: 'reject', t: [0, -DROP, 0], from: 0.6, to: 0.8, ease: 'in' },
    ],
  },
});
