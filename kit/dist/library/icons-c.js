import { defineDrawing, box, cbox, cyl, cone, prism, textLines, grid, slots } from '../build.js';
/** Database: three platters; the top one lifts like a lid being read. */
export const database = defineDrawing({
    id: 'database',
    name: 'Database',
    category: 'data',
    tags: ['database', 'storage', 'sql', 'data', 'backend', 'postgres', 'records', 'cylinder'],
    kind: 'icon',
    prompt: '/isometric create a database icon for the data section of my docs',
    description: 'A database drawn as three stacked platters on a base. The top platter lifts.',
    createdAt: '2026-10-24',
    parts: [
        cyl([0, 0, 0], 1.0, 0.55, { id: 'p1', n: 48 }),
        cyl([0, 0.55, 0], 0.86, 0.08, { id: 'g1', role: 'detail', n: 44 }),
        cyl([0, 0.63, 0], 1.0, 0.55, { id: 'p2', n: 48 }),
        cyl([0, 1.18, 0], 0.86, 0.08, { id: 'g2', role: 'detail', n: 44 }),
        cyl([0, 1.26, 0], 1.0, 0.55, {
            id: 'p3', role: 'accent', group: 'top', n: 48,
            decals: { top: [{ t: 'circle', cx: 1, cy: 1, r: 0.62, stroke: 'soft' }, { t: 'circle', cx: 1, cy: 1, r: 0.3, stroke: 'soft' }] },
        }),
    ],
    motion: { duration: 1.8, label: 'the top platter lifts', tracks: [{ group: 'top', t: [0, 0.4, 0], ease: 'inOut' }] },
});
/** Folder: the front cover swings open and a document rises. */
export const folder = defineDrawing({
    id: 'folder',
    name: 'Folder',
    category: 'files',
    tags: ['folder', 'files', 'documents', 'directory', 'archive', 'project', 'organize'],
    kind: 'icon',
    prompt: '/isometric create a folder icon for the projects list',
    description: 'An open folder standing upright with papers inside. The front cover swings and a page rises.',
    createdAt: '2026-10-23',
    parts: [
        box([0, 0, 0], [2.6, 1.8, 0.1], { id: 'back', r: 0.06, axis: 'z' }),
        box([0.15, 1.8, 0], [1.0, 0.22, 0.1], { id: 'tab', r: 0.06, axis: 'z' }),
        box([0.22, 0.15, 0.12], [2.16, 1.6, 0.04], { id: 'sheet1', role: 'face', group: 'sheet', decals: { front: textLines(0.2, 0.2, 1.5, [1, 0.7], 0.2, 0.07) } }),
        box([0.32, 0.1, 0.18], [2.0, 1.4, 0.04], { id: 'sheet2', role: 'face' }),
        box([0, 0, 0.26], [2.6, 1.5, 0.1], { id: 'cover', r: 0.06, axis: 'z', role: 'accent', group: 'cover', rot: [{ axis: 'x', deg: 12, pivot: [0, 0, 0.26] }] }),
    ],
    motion: {
        duration: 2.2,
        label: 'the cover opens and a page rises',
        tracks: [
            { group: 'cover', r: { axis: 'x', deg: 16, pivot: [0, 0, 0.26] }, ease: 'inOut' },
            { group: 'sheet', t: [0, 0.45, 0], from: 0.3, ease: 'out' },
        ],
    },
});
/** Envelope: the flap opens and a letter slides up. */
const EW = 2.6, EH = 1.7;
export const envelope = defineDrawing({
    id: 'envelope',
    name: 'Envelope',
    category: 'communication',
    tags: ['mail', 'email', 'envelope', 'message', 'newsletter', 'inbox', 'contact', 'letter'],
    kind: 'icon',
    prompt: '/isometric create an envelope icon for the newsletter signup',
    description: 'An upright envelope with its flap open and a letter sliding out of it.',
    createdAt: '2026-10-22',
    parts: [
        box([0, 0, 0], [EW, EH, 0.08], { id: 'back', axis: 'z', role: 'body' }),
        box([0.18, 0.5, 0.09], [EW - 0.36, 1.45, 0.03], { id: 'letter', role: 'face', group: 'letter', decals: { front: textLines(0.22, 0.25, 1.6, [0.5, 1, 0.85, 0.7], 0.2, 0.07) } }),
        box([0, 0, 0.13], [EW, EH * 0.62, 0.08], {
            id: 'pocket', axis: 'z', role: 'body',
            decals: { front: [{ t: 'line', pts: [[0.05, 0.05], [EW / 2, EH * 0.42], [EW - 0.05, 0.05]], stroke: 'soft' }] },
        }),
        prism([0, EH, -0.0], [[0, 0], [EW, 0], [EW / 2, 0.9]], 0.08, {
            id: 'flap', axis: 'z', role: 'accent',
            rot: [{ axis: 'x', deg: -25, pivot: [0, EH, 0] }],
        }),
    ],
    motion: { duration: 2.2, label: 'a letter slides up', tracks: [{ group: 'letter', t: [0, 0.6, 0], ease: 'out' }] },
});
/** Shield: security badge with a check. */
const shieldOuter = [[-1.0, 1.9], [1.0, 1.9], [1.05, 1.0], [0.85, 0.5], [0.45, 0.15], [0, 0], [-0.45, 0.15], [-0.85, 0.5], [-1.05, 1.0]];
const inset = (pts, k, cy) => pts.map(([u, v]) => [u * k, cy + (v - cy) * k]);
export const shield = defineDrawing({
    id: 'shield',
    name: 'Shield',
    category: 'status',
    tags: ['security', 'shield', 'protection', 'safe', 'privacy', 'verified', 'trust', 'compliance'],
    kind: 'icon',
    prompt: '/isometric create a shield icon for the security features section',
    description: 'A shield with a raised inner plate marked with a check, standing on a small stand.',
    createdAt: '2026-10-21',
    parts: [
        cbox(0, 0, 0.1, [1.4, 0.16, 0.9], { id: 'stand', r: 0.08, role: 'detail' }),
        prism([0, 0.3, -0.1], shieldOuter.map(([u, v]) => [u, v]), 0.26, { id: 'shield', axis: 'z', group: 'shield' }),
        prism([0, 0.3, 0.16], inset(shieldOuter, 0.78, 1.05), 0.1, {
            id: 'plate', axis: 'z', role: 'accent', group: 'shield',
            decals: { front: [{ t: 'line', pts: [[0.62, 0.95], [0.92, 1.25], [1.48, 0.62]], stroke: 'face', width: 2.2 }] },
        }),
    ],
    motion: { duration: 2, label: 'it rises from its stand', tracks: [{ group: 'shield', t: [0, 0.25, 0], ease: 'inOut' }] },
});
/** Shopping cart: a parcel drops into the basket. */
function wheel(x, z) {
    return cyl([x, 0.22, z], 0.2, 0.12, { axis: 'x', role: 'ink', n: 24 });
}
export const cart = defineDrawing({
    id: 'cart',
    name: 'Cart',
    category: 'commerce',
    tags: ['cart', 'shopping', 'checkout', 'store', 'ecommerce', 'basket', 'buy', 'order'],
    kind: 'icon',
    prompt: '/isometric create a shopping cart icon for the checkout page',
    description: 'A shopping cart on four wheels with a mesh basket, a handle and a parcel dropping in.',
    createdAt: '2026-10-20',
    parts: [
        wheel(-0.06, -0.55), wheel(-0.06, 0.55), wheel(1.94, -0.55), wheel(1.94, 0.55),
        box([0, 0.42, -0.75], [2.0, 0.08, 1.5], { id: 'chassis', role: 'detail' }),
        box([0, 0.5, -0.75], [2.0, 1.1, 1.5], {
            id: 'basket',
            decals: {
                front: [...grid(0.1, 0.12, 6, 3, 0.22, 0.24, 0.1, { fill: 'face', stroke: 'soft', r: 0.03 })],
                right: [...grid(0.1, 0.12, 4, 3, 0.26, 0.24, 0.1, { fill: 'face', stroke: 'soft', r: 0.03 })],
            },
        }),
        box([-0.42, 0.5, -0.07], [0.12, 1.5, 0.14], { id: 'post', role: 'detail' }),
        box([-0.6, 1.9, -0.6], [0.16, 0.16, 1.2], { id: 'handle', r: 0.07, axis: 'z', role: 'ink' }),
        box([0.55, 1.6, -0.35], [0.9, 0.62, 0.7], { id: 'parcel', r: 0.05, role: 'accent', group: 'parcel', decals: { top: [{ t: 'segs', segs: [[0.45, 0, 0.45, 0.7]], stroke: 'face', width: 2 }] } }),
    ],
    motion: { duration: 1.8, label: 'a parcel drops in', tracks: [{ group: 'parcel', t: [0, 0.7, 0], ease: 'in' }] },
});
/** Bar chart: the highlighted bar grows. */
const bars = [0.9, 1.5, 1.15, 2.1];
export const barChart = defineDrawing({
    id: 'bar-chart',
    name: 'Bar chart',
    category: 'charts',
    tags: ['chart', 'bar chart', 'analytics', 'statistics', 'growth', 'report', 'metrics', 'dashboard'],
    kind: 'icon',
    prompt: '/isometric create a bar chart icon for the analytics feature',
    description: 'Four bars on a ruled base. The tallest, highlighted bar grows.',
    createdAt: '2026-10-19',
    parts: [
        box([0, 0, 0], [3.0, 0.2, 1.4], { id: 'base', r: 0.08, role: 'face', decals: { top: [slots(0.25, 1.2, 12, 0.21, 0.1, 'v')] } }),
        ...bars.map((h, i) => box([0.25 + i * 0.68, 0.2, 0.3], [0.48, h, 0.6], {
            id: `bar${i}`, r: 0.04, role: i === 3 ? 'accent' : 'body', group: i === 3 ? 'grow' : undefined,
        })),
    ],
    motion: { duration: 2, label: 'the last bar grows', tracks: [{ group: 'grow', s: { k: [1, 1.3, 1], pivot: [0, 0.2, 0] }, ease: 'inOut' }] },
});
/** Hourglass: turns over. */
export const hourglass = defineDrawing({
    id: 'hourglass',
    name: 'Hourglass',
    category: 'time',
    tags: ['hourglass', 'time', 'waiting', 'loading', 'deadline', 'timer', 'sand', 'pending'],
    kind: 'icon',
    prompt: '/isometric create an hourglass icon for the loading state',
    description: 'An hourglass in a wooden frame with three posts, sand in its lower bulb. It turns over.',
    createdAt: '2026-10-18',
    parts: [
        cbox(0, 0, 0, [1.6, 0.2, 1.6], { id: 'foot', r: 0.12, role: 'detail', group: 'glass' }),
        cbox(0, 2.6, 0, [1.6, 0.2, 1.6], { id: 'cap', r: 0.12, role: 'detail', group: 'glass' }),
        cyl([-0.62, 0.2, -0.62], 0.07, 2.4, { id: 'post1', role: 'detail', group: 'glass', n: 12 }),
        cyl([0.62, 0.2, -0.62], 0.07, 2.4, { id: 'post2', role: 'detail', group: 'glass', n: 12 }),
        cone([0, 0.2, 0], 0.48, 0.5, { id: 'sand', role: 'accent', group: 'glass', n: 32 }),
        cyl([0, 0.2, 0], 0.55, 1.2, { id: 'bulb-lo', r2: 0.06, role: 'glass', group: 'glass', n: 36, bias: 1 }),
        cyl([0, 1.4, 0], 0.06, 1.2, { id: 'bulb-hi', r2: 0.55, role: 'glass', group: 'glass', n: 36 }),
        cyl([-0.62, 0.2, 0.62], 0.07, 2.4, { id: 'post3', role: 'detail', group: 'glass', n: 12 }),
    ],
    motion: { duration: 2.6, label: 'it turns over', tracks: [{ group: 'glass', r: { axis: 'z', deg: 180, pivot: [0, 1.4, 0] }, from: 0.1, to: 0.9, ease: 'inOut' }] },
});
/** Terminal: a code window with a blinking cursor that types along the line. */
const TW = 3.2, TH = 2.2;
export const terminal = defineDrawing({
    id: 'terminal',
    name: 'Terminal',
    category: 'code',
    tags: ['terminal', 'code', 'cli', 'console', 'developer', 'command line', 'shell', 'api'],
    kind: 'icon',
    prompt: '/isometric create a terminal window icon for the CLI docs',
    description: 'A terminal window on a small stand with lines of code on a dark screen and a cursor typing.',
    createdAt: '2026-10-17',
    parts: [
        cbox(TW / 2, 0, 0.3, [1.2, 0.14, 0.8], { id: 'foot', r: 0.08, role: 'detail', only: 'standing' }),
        box([0, 0.14, 0], [TW, TH, 0.16], {
            id: 'window', r: 0.12, axis: 'z',
            decals: {
                front: [
                    { t: 'circle', cx: 0.2, cy: 0.18, r: 0.05, fill: 'detail', stroke: 'soft' },
                    { t: 'circle', cx: 0.38, cy: 0.18, r: 0.05, fill: 'detail', stroke: 'soft' },
                    { t: 'circle', cx: 0.56, cy: 0.18, r: 0.05, fill: 'detail', stroke: 'soft' },
                    { t: 'rect', x: 0.12, y: 0.34, w: TW - 0.24, h: TH - 0.46, r: 0.06, fill: 'ink' },
                    { t: 'line', pts: [[0.3, 0.55], [0.42, 0.62], [0.3, 0.69]], stroke: 'accent', width: 1.2 },
                    { t: 'bar', x: 0.52, y: 0.58, w: 1.3, h: 0.08, fill: 'detail' },
                    { t: 'bar', x: 0.3, y: 0.85, w: 1.9, h: 0.08, fill: 'detail' },
                    { t: 'bar', x: 0.3, y: 1.06, w: 1.2, h: 0.08, fill: 'detail' },
                    { t: 'line', pts: [[0.3, 1.3], [0.42, 1.37], [0.3, 1.44]], stroke: 'accent', width: 1.2 },
                    { t: 'bar', x: 0.52, y: 1.33, w: 0.5, h: 0.08, fill: 'detail' },
                ],
            },
        }),
        box([1.1, 0.14 + TH - 1.46, 0.16], [0.1, 0.16, 0.03], { id: 'cursor', role: 'accent', group: 'cursor' }),
    ],
    motion: { duration: 1.6, label: 'the cursor types', tracks: [{ group: 'cursor', t: [0.9, 0, 0], ease: 'linear' }] },
});
