import { defineDrawing, box, cbox, cyl, cone, ball, prism, slots, grid } from '../build.js';
/** Printer: paper feeds out of the front slot. */
export const printer = defineDrawing({
    id: 'printer',
    name: 'Printer',
    category: 'files',
    tags: ['printer', 'print', 'office', 'document', 'paper', 'export', 'pdf'],
    kind: 'icon',
    prompt: '/isometric create a printer icon for the export button',
    description: 'A desktop printer with a paper tray at the back, buttons on top and a sheet feeding out of the front.',
    createdAt: '2026-11-02',
    parts: [
        box([0, 0, 0], [3, 1.3, 2.2], {
            id: 'body', r: 0.18,
            decals: {
                top: [
                    { t: 'rect', x: 0.25, y: 1.25, w: 1.0, h: 0.55, r: 0.06, fill: 'face', stroke: 'soft' },
                    { t: 'circle', cx: 2.1, cy: 1.55, r: 0.12, fill: 'detail', stroke: 'soft' },
                    { t: 'circle', cx: 2.5, cy: 1.55, r: 0.12, fill: 'detail', stroke: 'soft' },
                ],
                front: [
                    { t: 'rect', x: 0.4, y: 0.38, w: 2.2, h: 0.14, r: 0.07, fill: 'ink' },
                    slots(0.4, 0.85, 1, 0.1, 2.2, 'h'),
                ],
            },
        }),
        // Paper tray at the back, leaning back.
        box([0.45, 1.3, 0.12], [2.1, 1.05, 0.08], { id: 'tray', role: 'face', rot: [{ axis: 'x', deg: -22, pivot: [0, 1.3, 0.2] }] }),
        // The sheet coming out of the slot: the accent.
        box([0.55, 0.78, 2.2], [1.9, 0.03, 0.5], {
            id: 'sheet', role: 'accent', group: 'sheet',
            decals: { top: [{ t: 'bar', x: 0.25, y: 0.12, w: 1.0, h: 0.06, fill: 'face' }, { t: 'bar', x: 0.25, y: 0.27, w: 1.3, h: 0.06, fill: 'face' }] },
        }),
    ],
    motion: { duration: 2, label: 'paper feeds out', tracks: [{ group: 'sheet', t: [0, -0.02, 0.6], ease: 'out' }] },
});
/** Map pin: a pin bouncing on a round base. */
export const mapPin = defineDrawing({
    id: 'map-pin',
    name: 'Map pin',
    category: 'logistics',
    tags: ['map', 'pin', 'location', 'marker', 'address', 'place', 'gps', 'contact'],
    kind: 'icon',
    prompt: '/isometric create a map pin icon for the contact page',
    description: 'A map pin standing on a round base, with a white dot on its head. The pin bounces.',
    createdAt: '2026-11-02',
    parts: [
        cyl([0, 0, 0], 1.25, 0.12, { id: 'base', role: 'face', n: 44, decals: { top: [{ t: 'circle', cx: 1.25, cy: 1.25, r: 0.55, stroke: 'soft' }] } }),
        cone([0, 0.12 + 1.75, 0], 0.62, -1.75, { id: 'tip', role: 'accent', group: 'pin', n: 36 }),
        ball([0, 0.12 + 1.95, 0], 0.72, { id: 'head', role: 'accent', group: 'pin' }),
        cyl([0, 0.12 + 1.95 + 0.62, 0], 0.26, 0.12, { id: 'dot', role: 'face', group: 'pin', n: 28 }),
    ],
    motion: { duration: 1.4, label: 'the pin bounces', tracks: [{ group: 'pin', t: [0, 0.45, 0], ease: 'out' }] },
});
/** Rocket: lifts off its launch pad. */
const fin = [[0, 0], [0.62, 0], [0, 0.95]];
export const rocket = defineDrawing({
    id: 'rocket',
    name: 'Rocket',
    category: 'shapes',
    tags: ['rocket', 'launch', 'startup', 'deploy', 'release', 'growth', 'ship', 'boost'],
    kind: 'icon',
    prompt: '/isometric create a rocket icon for the launch section',
    description: 'A rocket with fins and a round window standing on a square launch pad. It lifts off.',
    createdAt: '2026-11-01',
    parts: [
        cbox(0, 0, 0, [2.6, 0.22, 2.6], { id: 'pad', r: 0.14, role: 'face', decals: { top: [{ t: 'circle', cx: 1.3, cy: 1.3, r: 0.85, stroke: 'soft' }, slots(0.3, 0.2, 1, 0.1, 2.0, 'h')] } }),
        // Fins: left/right (thin in z) and front/back (thin in x).
        prism([0.5, 0.42, -0.04], fin, 0.08, { id: 'fin-r', axis: 'z', role: 'detail', group: 'rocket' }),
        prism([-0.5, 0.42, -0.04], fin.map(([u, v]) => [-u, v]), 0.08, { id: 'fin-l', axis: 'z', role: 'detail', group: 'rocket' }),
        prism([-0.04, 0.42, 0.5], fin.map(([u, v]) => [u, v]), 0.08, { id: 'fin-f', axis: 'x', role: 'detail', group: 'rocket' }),
        prism([-0.04, 0.42, -0.5], fin.map(([u, v]) => [-u, v]), 0.08, { id: 'fin-b', axis: 'x', role: 'detail', group: 'rocket' }),
        cyl([0, 0.22, 0], 0.3, 0.2, { id: 'nozzle', r2: 0.42, role: 'ink', group: 'rocket' }),
        cyl([0, 0.42, 0], 0.55, 2.0, { id: 'hull', group: 'rocket', n: 40 }),
        cone([0, 2.42, 0], 0.55, 1.0, { id: 'nose', role: 'accent', group: 'rocket', n: 40 }),
        cyl([0.0, 1.7, 0.46], 0.2, 0.1, { id: 'window', axis: 'z', role: 'face', group: 'rocket', n: 28, bias: 1 }),
    ],
    motion: { duration: 2.2, label: 'it lifts off', tracks: [{ group: 'rocket', t: [0, 0.9, 0], ease: 'inOut' }] },
});
export const printerKeys = grid;
export { ball };
