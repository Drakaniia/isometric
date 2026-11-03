import { defineDrawing, box, cyl, grid, textLines } from '../build.js';
/**
 * Devices: an open laptop with a lit screen, a phone on a charging pad and a
 * pair of earbuds. The lid opens a little further on hover.
 */
const BW = 4.6, BD = 3.1, BH = 0.2;
const hinge = { y: BH, z: 0 };
const keyboard = [
    { t: 'rect', x: 0.3, y: 0.28, w: BW - 0.6, h: 1.62, r: 0.08, fill: 'face', stroke: 'soft' },
    ...grid(0.42, 0.38, 13, 4, 0.22, 0.24, 0.07, { fill: 'body', stroke: 'soft', r: 0.03 }),
    { t: 'rect', x: 1.2, y: 1.5, w: 2.2, h: 0.26, r: 0.04, fill: 'body', stroke: 'soft' },
    { t: 'rect', x: BW / 2 - 0.85, y: 2.1, w: 1.7, h: 0.8, r: 0.08, fill: 'face', stroke: 'soft' },
];
const SW = BW, SH = 3.05, SD = 0.14;
const screen = [
    { t: 'rect', x: 0.16, y: 0.16, w: SW - 0.32, h: SH - 0.36, r: 0.06, fill: 'accent', stroke: 'soft' },
    { t: 'circle', cx: SW / 2, cy: 0.09, r: 0.03, fill: 'ink' },
    { t: 'rect', x: 0.36, y: 0.34, w: SW - 0.72, h: 0.28, r: 0.05, fill: 'face', opacity: 0.9 },
    ...textLines(0.4, 0.9, 1.6, [1, 0.8, 0.9, 0.55, 0.85, 0.7], 0.26, 0.09, 'face'),
    { t: 'rect', x: SW - 2.0, y: 0.9, w: 1.6, h: 1.05, r: 0.06, fill: 'face', opacity: 0.85 },
    { t: 'bar', x: SW - 2.0, y: 2.15, w: 1.1, h: 0.09, fill: 'face' },
    { t: 'bar', x: SW - 2.0, y: 2.36, w: 0.8, h: 0.09, fill: 'face' },
];
const phone = [
    { t: 'rect', x: 0.08, y: 0.08, w: 1.04, h: 2.04, r: 0.12, fill: 'ink' },
    { t: 'rect', x: 0.42, y: 0.16, w: 0.36, h: 0.08, r: 0.04, fill: 'body' },
    ...textLines(0.24, 0.6, 0.7, [1, 0.6], 0.2, 0.07, 'soft'),
    ...grid(0.24, 1.05, 3, 2, 0.18, 0.18, 0.08, { fill: 'detail', stroke: false, r: 0.05 }),
];
export default defineDrawing({
    id: 'devices',
    name: 'Devices',
    category: 'interface',
    tags: ['laptop', 'phone', 'devices', 'responsive', 'website', 'hero', 'desktop', 'mobile', 'app'],
    kind: 'scene',
    prompt: '/isometric create an isometric hero for my website showing it on a laptop and a phone',
    description: 'An open laptop with a page on its lit screen, a phone lying on a round charging pad beside it, and an earbud case.',
    createdAt: '2026-11-03',
    parts: [
        box([0, 0, 0], [BW, BH, BD], { id: 'base', r: 0.16, decals: { top: keyboard } }),
        box([0, hinge.y, -SD], [SW, SH, SD], {
            id: 'lid', r: 0.14, axis: 'z', group: 'lid',
            rot: [{ axis: 'x', deg: -14, pivot: [0, hinge.y, 0] }],
            decals: { front: screen },
        }),
        // Charging pad and phone.
        cyl([5.75, 0, 2.0], 0.95, 0.12, { id: 'pad', role: 'detail', n: 40 }),
        box([5.15, 0.12, 0.95], [1.2, 0.12, 2.2], { id: 'phone', r: 0.2, group: 'phone', decals: { top: phone } }),
        // Earbud case.
        box([5.2, 0, -0.7], [0.95, 0.45, 0.7], { id: 'case', r: 0.3, role: 'body' }),
        box([5.2, 0.45, -0.7], [0.95, 0.16, 0.7], {
            id: 'case-lid', r: 0.3, role: 'face',
            decals: { front: [{ t: 'circle', cx: 0.475, cy: 0.09, r: 0.035, fill: 'detail' }] },
        }),
    ],
    motion: {
        duration: 2.8,
        label: 'the lid opens and the phone lifts',
        tracks: [
            { group: 'lid', r: { axis: 'x', deg: -10, pivot: [0, hinge.y, 0] }, ease: 'inOut' },
            { group: 'phone', t: [0, 0.35, 0], from: 0.2, to: 0.8, ease: 'inOut' },
        ],
    },
});
