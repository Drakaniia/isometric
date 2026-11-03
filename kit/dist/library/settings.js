import { defineDrawing, box, cyl, cbox, tickRing, slots, textLines } from '../build.js';
/**
 * Settings: a control slab with a big dial, a toggle switch, a slider,
 * three buttons and a small display. The toggle (the accent) flips on hover
 * and the dial turns.
 */
const W = 6, D = 4, H = 0.62;
const top = [
    // Display window.
    { t: 'rect', x: 0.4, y: 0.4, w: 2.4, h: 1.15, r: 0.1, fill: 'face', stroke: true },
    ...textLines(0.6, 0.62, 1.8, [1, 0.6, 0.8], 0.26, 0.1),
    // Toggle track (the knob slides in it).
    { t: 'rect', x: 0.4, y: 2.0, w: 2.0, h: 0.62, r: 0.31, fill: 'detail', stroke: true },
    // Slider track and its scale.
    { t: 'rect', x: 0.4, y: 3.05, w: 3.4, h: 0.16, r: 0.08, fill: 'detail', stroke: 'soft' },
    slots(0.5, 3.36, 12, 0.29, 0.12, 'v'),
    // Dial scale.
    tickRing(4.55, 1.25, 1.05, 36, 6, 0.16),
    // Button labels.
    ...[0, 1, 2].map((i) => ({ t: 'bar', x: 2.9 + i * 0.62, y: 2.82, w: 0.3, h: 0.06 })),
];
const front = [
    slots(W - 2.3, 0.18, 10, 0.18, 0.26, 'v'),
    { t: 'circle', cx: 0.42, cy: 0.31, r: 0.07, fill: 'accent' },
    { t: 'bar', x: 0.62, y: 0.27, w: 0.7, h: 0.08 },
];
export default defineDrawing({
    id: 'settings-panel',
    name: 'Settings',
    category: 'interface',
    tags: ['settings', 'preferences', 'control panel', 'toggle', 'switch', 'dial', 'slider', 'configuration'],
    kind: 'scene',
    prompt: '/isometric create an isometric for the settings page of my app',
    description: 'A control slab with a display, a large dial with a scale, a toggle switch, three push buttons and a slider. The toggle flips and the dial turns.',
    createdAt: '2026-11-03',
    parts: [
        box([0, 0, 0], [W, H, D], { id: 'slab', r: 0.3, decals: { top, front } }),
        // Dial: a stepped knob with a pointer.
        cyl([4.55, H, 1.25], 0.8, 0.22, { id: 'dial-base', role: 'face', n: 40 }),
        cyl([4.55, H + 0.22, 1.25], 0.62, 0.36, { id: 'dial', role: 'body', group: 'dial', n: 40 }),
        cbox(4.55, H + 0.58, 1.25 + 0.33, [0.08, 0.05, 0.36], { id: 'pointer', role: 'ink', group: 'dial' }),
        // Toggle knob: the accent.
        cyl([0.71, H, 2.31], 0.27, 0.32, { id: 'toggle', role: 'accent', group: 'toggle', n: 32 }),
        // Push buttons.
        ...[0, 1, 2].map((i) => cbox(3.05 + i * 0.62, H, 2.45, [0.44, 0.18, 0.44], { id: `btn${i}`, r: 0.1, role: 'detail' })),
        // Slider handle.
        cbox(2.3, H, 3.13, [0.3, 0.3, 0.5], { id: 'slider', r: 0.08, role: 'face' }),
        // Status light.
        cyl([5.45, H, 3.45], 0.14, 0.08, { id: 'led', role: 'ink' }),
    ],
    motion: {
        duration: 2.6,
        label: 'the toggle flips and the dial turns',
        tracks: [
            { group: 'toggle', t: [1.38, 0, 0], from: 0, to: 0.6, ease: 'back' },
            { group: 'dial', r: { axis: 'y', deg: -120, pivot: [4.55, 0, 1.25] }, from: 0.2, to: 1, ease: 'inOut' },
        ],
    },
});
