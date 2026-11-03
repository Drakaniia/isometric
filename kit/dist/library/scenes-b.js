/**
 * The six original examples, rebuilt as models in the style system:
 * engine, AI workflow, robotic arm, house cutaway and exploded speaker
 * (the server infrastructure example is the server rack).
 */
import { defineDrawing, box, cbox, cyl, cone, ball, prism, slots, textLines, grid, gearProfile, tickRing } from '../build.js';
/* ------------------------------------------------------ mechanical engine */
const pistonX = [0.95, 1.95, 2.95, 3.95];
// Gear centres in the (z, y) plane of the right face; the distance meshes the teeth.
const G1 = { c: [1.55, 1.45], ro: 0.95, ri: 0.8, n: 18 };
const MESH = (0.95 + 0.8) / 2 + (0.58 + 0.45) / 2;
const G2 = { c: [1.55 + MESH * Math.cos((160 * Math.PI) / 180), 1.45 + MESH * Math.sin((160 * Math.PI) / 180)], ro: 0.58, ri: 0.45, n: 11 };
export const engine = defineDrawing({
    id: 'mechanical-engine',
    name: 'Engine',
    category: 'industry',
    tags: ['engine', 'motor', 'mechanical', 'gears', 'pistons', 'machine', 'performance', 'power'],
    kind: 'scene',
    prompt: '/isometric create an inline four engine with turning gears and moving pistons for our performance page',
    description: 'An inline four-cylinder engine on a sump: four pistons rise in turn from the head, intake runners on the front and two meshed timing gears on the side, the large one lit.',
    createdAt: '2026-10-15',
    parts: [
        box([0, 0, 0], [5, 0.45, 2.6], { id: 'sump', r: 0.12, role: 'detail', decals: { front: [slots(0.4, 0.12, 22, 0.2, 0.2, 'v')] } }),
        box([0.3, 0.45, 0.3], [4.4, 1.7, 2.0], {
            id: 'block',
            decals: {
                front: [
                    ...[0.5, 1.5, 2.5, 3.5].map((x) => ({ t: 'rect', x: x - 0.2, y: 0.85, w: 0.8, h: 0.6, r: 0.08, fill: 'face', stroke: 'soft' })),
                    slots(0.25, 0.22, 21, 0.2, 0.36, 'v'),
                ],
                right: [slots(0.2, 1.38, 8, 0.2, 0.22, 'v')],
            },
        }),
        box([0.3, 2.15, 0.3], [4.4, 0.42, 2.0], {
            id: 'head', r: 0.06, role: 'face',
            decals: { top: [...pistonX.map((x) => ({ t: 'circle', cx: x - 0.3, cy: 1.0, r: 0.46, stroke: 'soft' }))] },
        }),
        ...pistonX.map((x, i) => cyl([x, 2.57, 1.3], 0.36, 0.42, {
            id: `piston${i}`, group: `p${i}`, n: 36,
            decals: { top: [{ t: 'circle', cx: 0.36, cy: 0.36, r: 0.2, stroke: 'soft' }, { t: 'circle', cx: 0.36, cy: 0.36, r: 0.06, fill: 'ink' }] },
        })),
        // Intake: a plenum with four runners into the front of the head.
        ...pistonX.map((x) => cyl([x - 0.4, 2.36, 2.3], 0.13, 0.45, { axis: 'z', role: 'detail', n: 20 })),
        box([0.35, 2.12, 2.75], [4.0, 0.48, 0.42], { id: 'plenum', r: 0.16, axis: 'x', role: 'body', decals: { front: [{ t: 'bar', x: 0.3, y: 0.2, w: 1.2, h: 0.08 }] } }),
        // Timing gears on the right face (+x), meshed: 18 and 11 teeth.
        prism([4.7, 0, 0], gearProfile(G1.n, G1.ro, G1.ri, G1.c[0], G1.c[1]), 0.18, { id: 'gear-big', axis: 'x', role: 'accent', group: 'g1' }),
        cyl([4.88, G1.c[1], G1.c[0]], 0.22, 0.1, { id: 'hub-big', axis: 'x', role: 'ink', group: 'g1' }),
        prism([4.7, 0, 0], gearProfile(G2.n, G2.ro, G2.ri, G2.c[0], G2.c[1]), 0.18, { id: 'gear-small', axis: 'x', role: 'detail', group: 'g2' }),
        cyl([4.88, G2.c[1], G2.c[0]], 0.14, 0.1, { id: 'hub-small', axis: 'x', role: 'ink', group: 'g2' }),
    ],
    motion: {
        duration: 3.6,
        label: 'the pistons rise in turn and the gears turn',
        tracks: [
            ...[0, 2, 1, 3].map((p, k) => ({ group: `p${p}`, t: [0, 0.38, 0], from: k * 0.2, to: k * 0.2 + 0.35, ease: 'inOut' })),
            { group: 'g1', r: { axis: 'x', deg: 360, pivot: [0, G1.c[1], G1.c[0]] }, mode: 'loop' },
            { group: 'g2', r: { axis: 'x', deg: -360 * (G1.n / G2.n), pivot: [0, G2.c[1], G2.c[0]] }, mode: 'loop' },
        ],
    },
});
/* ------------------------------------------------------------ AI workflow */
const doc = (x, z, k) => box([x, 0.3, z], [0.9, 1.2, 0.06], { id: `doc${k}`, role: 'face', decals: { front: textLines(0.12, 0.18, 0.66, [1, 0.8, 0.9, 0.6], 0.18, 0.06) } });
export const aiWorkflow = defineDrawing({
    id: 'ai-workflow',
    name: 'AI workflow',
    category: 'ai',
    tags: ['ai', 'llm', 'model', 'workflow', 'pipeline', 'agent', 'chip', 'machine learning', 'rag'],
    kind: 'scene',
    prompt: '/isometric create an isometric of our AI workflow: documents in, a model in the middle, answers out',
    description: 'Documents on the left feed a conveyor into a model chip in the middle; answer cards stand on the right and a panel of settings floats above. Tokens travel along the belt.',
    createdAt: '2026-10-14',
    parts: [
        box([-0.4, 0, -0.4], [8.8, 0.3, 3.8], { id: 'deck', r: 0.2, role: 'face', decals: { top: [slots(0.4, 3.35, 40, 0.2, 0.12, 'v')] } }),
        doc(0.1, 0.4, 0), doc(0.3, 0.7, 1), doc(0.5, 1.0, 2),
        // Conveyor in and out.
        box([1.6, 0.3, 1.1], [1.5, 0.16, 0.8], { id: 'belt-in', role: 'detail', decals: { top: [slots(0.12, 0.05, 8, 0.18, 0.7, 'v')] } }),
        box([5.4, 0.3, 1.1], [1.5, 0.16, 0.8], { id: 'belt-out', role: 'detail', decals: { top: [slots(0.12, 0.05, 8, 0.18, 0.7, 'v')] } }),
        cbox(1.85, 0.46, 1.5, [0.32, 0.32, 0.32], { id: 'token-in', r: 0.05, role: 'body', group: 'tok-in' }),
        cbox(5.65, 0.46, 1.5, [0.32, 0.32, 0.32], { id: 'token-out', r: 0.05, role: 'body', group: 'tok-out' }),
        // The model: a package with pins, a heat spreader and a lit die.
        box([3.1, 0.3, 0.3], [2.3, 0.35, 2.4], {
            id: 'package', r: 0.1, role: 'detail',
            decals: { front: [slots(0.15, 0.08, 10, 0.21, 0.18, 'v')], right: [slots(0.15, 0.08, 11, 0.2, 0.18, 'v')] },
        }),
        box([3.35, 0.65, 0.55], [1.8, 0.3, 1.9], { id: 'spreader', r: 0.12, decals: { front: [{ t: 'bar', x: 0.2, y: 0.11, w: 0.6, h: 0.08 }] } }),
        box([3.75, 0.95, 1.0], [1.0, 0.18, 1.0], { id: 'die', r: 0.06, role: 'accent', decals: { top: [...grid(0.12, 0.12, 3, 3, 0.2, 0.2, 0.09, { fill: 'accent', stroke: 'soft', r: 0.03 })] } }),
        // Answer cards.
        box([7.1, 0.3, 0.3], [1.1, 1.4, 0.08], { id: 'card1', r: 0.08, axis: 'z', role: 'face', decals: { front: [{ t: 'circle', cx: 0.2, cy: 0.22, r: 0.08, fill: 'accent' }, ...textLines(0.15, 0.45, 0.8, [1, 0.8, 0.6, 0.9], 0.18, 0.06)] } }),
        box([7.3, 0.3, 1.0], [1.1, 1.1, 0.08], { id: 'card2', r: 0.08, axis: 'z', role: 'face', decals: { front: [{ t: 'circle', cx: 0.2, cy: 0.22, r: 0.08, fill: 'detail' }, ...textLines(0.15, 0.45, 0.8, [1, 0.7, 0.9], 0.18, 0.06)] } }),
        // Floating settings panel above the model.
        box([2.9, 2.6, -0.2], [2.8, 1.5, 0.08], {
            id: 'panel', r: 0.12, axis: 'z', group: 'float',
            decals: {
                front: [
                    ...textLines(0.25, 0.25, 1.2, [0.6], 0.2, 0.08),
                    { t: 'rect', x: 0.25, y: 0.55, w: 1.4, h: 0.12, r: 0.06, fill: 'detail' },
                    { t: 'circle', cx: 1.1, cy: 0.61, r: 0.1, fill: 'accent', stroke: true },
                    { t: 'rect', x: 0.25, y: 0.9, w: 1.4, h: 0.12, r: 0.06, fill: 'detail' },
                    { t: 'circle', cx: 0.6, cy: 0.96, r: 0.1, fill: 'face', stroke: true },
                    { t: 'rect', x: 1.95, y: 0.5, w: 0.55, h: 0.55, r: 0.06, fill: 'face', stroke: 'soft' },
                ],
            },
        }),
    ],
    motion: {
        duration: 2.4,
        label: 'tokens ride the belts and the panel floats',
        tracks: [
            { group: 'tok-in', t: [1.0, 0, 0], mode: 'loop' },
            { group: 'tok-out', t: [1.0, 0, 0], mode: 'loop' },
            { group: 'float', t: [0, 0.18, 0], ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ robotic arm */
const S = [0, 1.25, 0];
const UP = 2.0, A1 = -32, A2 = -24;
const rad = (d) => (d * Math.PI) / 180;
const E = [-UP * Math.sin(rad(A1)), S[1] + UP * Math.cos(rad(A1)), 0];
export const roboticArm = defineDrawing({
    id: 'robotic-arm',
    name: 'Robotic arm',
    category: 'industry',
    tags: ['robot', 'robotic arm', 'automation', 'manufacturing', 'factory', 'industry', 'pick and place'],
    kind: 'scene',
    prompt: '/isometric create a robotic arm picking a part for the automation section',
    description: 'A six-axis style robotic arm on a turned base beside a work table, its gripper holding a small part. It swings and reaches.',
    createdAt: '2026-10-13',
    parts: [
        box([-1.4, 0, -1.4], [2.8, 0.25, 2.8], { id: 'pad', r: 0.12, role: 'detail', decals: { top: [{ t: 'circle', cx: 1.4, cy: 1.4, r: 1.15, stroke: 'soft' }] } }),
        cyl([0, 0.25, 0], 1.0, 0.45, { id: 'base', n: 44, decals: { top: [tickRing(1, 1, 0.95, 36, 6, 0.12)] } }),
        cyl([0, 0.7, 0], 0.75, 0.3, { id: 'turntable', role: 'face', group: 'turret', n: 40 }),
        box([-0.45, 1.0, -0.45], [0.9, 0.5, 0.9], { id: 'shoulder', r: 0.12, group: 'turret' }),
        cyl([0, S[1], -0.5], 0.32, 1.0, { id: 'shoulder-joint', axis: 'z', role: 'detail', group: 'upper', n: 32, bias: 2 }),
        box([-0.26, S[1], -0.24], [0.52, UP, 0.48], { id: 'upper-arm', r: 0.08, group: 'upper', rot: [{ axis: 'z', deg: A1, pivot: S }], decals: { front: [{ t: 'bar', x: 0.12, y: 0.4, w: 0.25, h: 0.07 }] } }),
        cyl([E[0], E[1], -0.38], 0.27, 0.76, { id: 'elbow', axis: 'z', role: 'detail', group: 'fore', n: 32 }),
        box([E[0], E[1] - 0.2, -0.2], [1.9, 0.4, 0.4], { id: 'forearm', r: 0.08, axis: 'x', group: 'fore', rot: [{ axis: 'z', deg: A2, pivot: E }] }),
        // Wrist and gripper, placed at the end of the forearm.
        ...(() => {
            const L = 1.9;
            const W = [E[0] + L * Math.cos(rad(A2)), E[1] + L * Math.sin(rad(A2)), 0];
            const wr = [
                cyl([W[0], W[1] - 0.05, 0], 0.22, -0.3, { id: 'wrist', role: 'detail', group: 'fore', n: 28 }),
                box([W[0] - 0.3, W[1] - 0.47, -0.2], [0.6, 0.12, 0.4], { id: 'palm', r: 0.04, role: 'ink', group: 'fore' }),
                box([W[0] - 0.3, W[1] - 0.95, -0.1], [0.1, 0.48, 0.2], { id: 'finger-a', role: 'detail', group: 'fore' }),
                box([W[0] + 0.2, W[1] - 0.95, -0.1], [0.1, 0.48, 0.2], { id: 'finger-b', role: 'detail', group: 'fore' }),
                box([W[0] - 0.19, W[1] - 0.85, -0.17], [0.38, 0.34, 0.34], { id: 'part', r: 0.04, role: 'accent', group: 'fore' }),
            ];
            return wr;
        })(),
        // Work table.
        box([2.6, 0, -0.9], [2.2, 0.75, 1.8], { id: 'table', r: 0.06, role: 'face', decals: { top: [...grid(0.25, 0.25, 3, 2, 0.4, 0.4, 0.2, { fill: 'detail', stroke: 'soft', r: 0.04 })] } }),
    ],
    motion: {
        duration: 4,
        label: 'it swings and reaches',
        tracks: [
            { group: 'fore', r: { axis: 'z', deg: -14, pivot: E }, ease: 'inOut' },
            { group: 'fore', r: { axis: 'z', deg: 10, pivot: S }, ease: 'inOut' },
            { group: 'upper', r: { axis: 'z', deg: 10, pivot: S }, ease: 'inOut' },
            { group: 'fore', r: { axis: 'y', deg: -40, pivot: [0, 0, 0] }, ease: 'inOut' },
            { group: 'upper', r: { axis: 'y', deg: -40, pivot: [0, 0, 0] }, ease: 'inOut' },
            { group: 'turret', r: { axis: 'y', deg: -40, pivot: [0, 0, 0] }, ease: 'inOut' },
        ],
    },
});
/* --------------------------------------------------- architectural building */
const book = (x, h, i) => box([x, 2.5, 0.3], [0.16, h, 0.42], { id: `book${i}`, role: i % 3 === 1 ? 'face' : 'detail' });
export const building = defineDrawing({
    id: 'house-cutaway',
    name: 'House cutaway',
    category: 'people',
    tags: ['house', 'home', 'architecture', 'interior', 'living room', 'real estate', 'building', 'cutaway', 'furniture'],
    kind: 'scene',
    prompt: '/isometric create a cutaway of a living room for our real estate landing page',
    description: 'A cutaway room: two walls with windows and a door, a sofa, a coffee table, a floor lamp, a bookshelf, a rug and a tree outside. The door swings open.',
    createdAt: '2026-10-12',
    parts: [
        box([0, 0, 0], [6.2, 0.3, 4.8], { id: 'floor', r: 0.06, role: 'face', decals: { top: [{ t: 'rect', x: 1.6, y: 1.7, w: 2.8, h: 2.0, r: 0.12, fill: 'detail', stroke: 'soft' }, slots(0.2, 0.3, 30, 0.2, 0.2, 'v')] } }),
        // Back wall (along x), with two windows.
        box([0.2, 0.3, 0], [6.0, 3.0, 0.2], {
            id: 'wall-back', role: 'body',
            decals: { front: [
                    { t: 'rect', x: 3.4, y: 0.5, w: 1.0, h: 1.2, r: 0.04, fill: 'face', stroke: true },
                    { t: 'segs', segs: [[3.9, 0.5, 3.9, 1.7], [3.4, 1.1, 4.4, 1.1]], stroke: true },
                    { t: 'rect', x: 4.8, y: 0.5, w: 1.0, h: 1.2, r: 0.04, fill: 'face', stroke: true },
                    { t: 'segs', segs: [[5.3, 0.5, 5.3, 1.7], [4.8, 1.1, 5.8, 1.1]], stroke: true },
                    { t: 'rect', x: 0.3, y: 0.35, w: 0.5, h: 0.65, r: 0.04, fill: 'face', stroke: 'soft' },
                ] },
        }),
        // Left wall (along z), with the door opening.
        box([0, 0.3, 0], [0.2, 3.0, 2.2], { id: 'wall-left-a', role: 'body' }),
        box([0, 2.3, 2.2], [0.2, 1.0, 1.1], { id: 'wall-left-b', role: 'body' }),
        box([0, 0.3, 3.3], [0.2, 3.0, 1.5], { id: 'wall-left-c', role: 'body', decals: { right: [{ t: 'rect', x: 0.3, y: 0.8, w: 0.8, h: 0.9, r: 0.04, fill: 'face', stroke: true }] } }),
        box([0.2, 0.3, 2.2], [0.08, 2.0, 1.1], { id: 'door', role: 'detail', group: 'door', decals: { right: [{ t: 'circle', cx: 0.15, cy: 1.0, r: 0.05, fill: 'ink' }] } }),
        // Bookshelf on the back wall.
        box([0.5, 0.3, 0.2], [2.2, 2.2, 0.6], { id: 'shelf', role: 'face', decals: { front: [slots(0.05, 0.7, 3, 0.7, 2.1, 'h')] } }),
        ...[0.62, 0.8, 0.98, 1.3, 1.48, 1.86, 2.04, 2.22].map((x, i) => book(x, [0.5, 0.45, 0.55, 0.4, 0.5, 0.52, 0.42, 0.5][i], i)),
        // Sofa: the lit piece.
        box([2.0, 0.3, 3.7], [2.6, 0.45, 0.9], { id: 'sofa-seat', r: 0.1, role: 'accent' }),
        box([2.0, 0.75, 4.25], [2.6, 0.55, 0.35], { id: 'sofa-back', r: 0.1, role: 'accent' }),
        box([1.75, 0.3, 3.7], [0.25, 0.75, 0.9], { id: 'arm-l', r: 0.08, role: 'accent' }),
        box([4.6, 0.3, 3.7], [0.25, 0.75, 0.9], { id: 'arm-r', r: 0.08, role: 'accent' }),
        // Coffee table.
        box([2.5, 0.3, 2.2], [0.1, 0.42, 0.1], { role: 'detail' }), box([3.9, 0.3, 2.2], [0.1, 0.42, 0.1], { role: 'detail' }),
        box([2.5, 0.3, 2.9], [0.1, 0.42, 0.1], { role: 'detail' }), box([3.9, 0.3, 2.9], [0.1, 0.42, 0.1], { role: 'detail' }),
        box([2.4, 0.72, 2.1], [1.7, 0.1, 1.0], { id: 'table-top', r: 0.06, role: 'face' }),
        box([2.7, 0.82, 2.35], [0.5, 0.12, 0.38], { id: 'magazine', role: 'detail' }),
        // Floor lamp.
        cyl([5.3, 0.3, 3.4], 0.3, 0.08, { id: 'lamp-foot', role: 'ink' }),
        cyl([5.3, 0.38, 3.4], 0.04, 1.9, { id: 'lamp-pole', role: 'ink', n: 10 }),
        cyl([5.3, 2.28, 3.4], 0.45, 0.45, { id: 'shade', r2: 0.25, role: 'face', group: 'shade', n: 32 }),
        // Tree outside.
        cyl([7.1, 0, 3.7], 0.14, 1.2, { id: 'trunk', role: 'detail', n: 16 }),
        ball([7.1, 1.85, 3.7], 0.75, { id: 'crown', role: 'face' }),
    ],
    motion: {
        duration: 3,
        label: 'the door swings open',
        tracks: [{ group: 'door', r: { axis: 'y', deg: 70, pivot: [0.2, 0, 2.2] }, ease: 'inOut' }],
    },
});
/* ------------------------------------------------------- product assembly */
export const speaker = defineDrawing({
    id: 'speaker-assembly',
    name: 'Speaker assembly',
    category: 'media',
    tags: ['speaker', 'product', 'exploded view', 'hardware', 'assembly', 'device', 'audio', 'smart home', 'launch'],
    kind: 'scene',
    prompt: '/isometric create an exploded view of our smart speaker for the product launch page',
    description: 'A smart speaker shown exploded: base, body, woofer, the lit LED ring and the top cap with its buttons, stacked with gaps. The parts come together and apart.',
    createdAt: '2026-10-11',
    parts: [
        cyl([0, 0, 0], 1.25, 0.35, { id: 'foot', role: 'detail', n: 48, decals: { top: [{ t: 'circle', cx: 1.25, cy: 1.25, r: 0.9, stroke: 'soft' }, { t: 'circle', cx: 1.25, cy: 1.25, r: 0.12, fill: 'ink' }] } }),
        cyl([0, 1.2, 0], 1.1, 1.5, { id: 'body', n: 48, group: 'body', decals: { top: [{ t: 'circle', cx: 1.1, cy: 1.1, r: 0.85, fill: 'face', stroke: 'soft' }] } }),
        cyl([0, 3.55, 0], 0.8, 0.18, { id: 'basket', role: 'detail', n: 44, group: 'woofer' }),
        cone([0, 3.73, 0], 0.72, 0.32, { id: 'cone', role: 'ink', n: 44, group: 'woofer' }),
        cyl([0, 4.85, 0], 1.02, 0.12, { id: 'ring', role: 'accent', n: 48, group: 'ring' }),
        cyl([0, 5.85, 0], 1.08, 0.3, {
            id: 'cap', role: 'face', n: 48, group: 'cap',
            decals: { top: [
                    { t: 'circle', cx: 1.08, cy: 1.08, r: 0.85, stroke: 'soft' },
                    { t: 'circle', cx: 1.08, cy: 0.62, r: 0.12, fill: 'detail', stroke: 'soft' },
                    { t: 'circle', cx: 1.08, cy: 1.54, r: 0.12, fill: 'detail', stroke: 'soft' },
                    { t: 'segs', segs: [[1.0, 0.62, 1.16, 0.62], [1.0, 1.54, 1.16, 1.54], [1.08, 1.46, 1.08, 1.62]], stroke: true },
                    { t: 'circle', cx: 0.62, cy: 1.08, r: 0.05, fill: 'ink' }, { t: 'circle', cx: 1.54, cy: 1.08, r: 0.05, fill: 'ink' },
                ] },
        }),
    ],
    motion: {
        duration: 3.2,
        label: 'the parts come together and apart',
        tracks: [
            { group: 'body', t: [0, -0.85, 0], ease: 'inOut' },
            { group: 'woofer', t: [0, -1.68, 0], ease: 'inOut' },
            { group: 'ring', t: [0, -2.33, 0], ease: 'inOut' },
            { group: 'cap', t: [0, -3.21, 0], ease: 'inOut' },
        ],
    },
});
