import { defineDrawing, box, cbox, cyl, ball, prism } from '../build.js';
/** Mug: steam rises from the coffee. */
const handle = [
    [0, 0.3], [0.3, 0.3], [0.48, 0.42], [0.55, 0.65], [0.55, 0.95], [0.48, 1.12], [0.3, 1.22], [0, 1.22],
    [0, 1.06], [0.26, 1.06], [0.36, 0.98], [0.39, 0.85], [0.39, 0.72], [0.36, 0.56], [0.26, 0.46], [0, 0.46],
];
export const mug = defineDrawing({
    id: 'mug',
    name: 'Mug',
    category: 'commerce',
    tags: ['mug', 'coffee', 'cup', 'cafe', 'break', 'drink', 'tea', 'shop'],
    kind: 'icon',
    prompt: '/isometric create a coffee mug icon for the cafe menu',
    description: 'A coffee mug with a handle, full of coffee, with steam rising.',
    createdAt: '2026-10-28',
    parts: [
        cyl([0, 0, 0], 0.82, 1.55, {
            id: 'cup', role: 'accent', n: 44,
            decals: { top: [{ t: 'circle', cx: 0.82, cy: 0.82, r: 0.68, fill: 'ink' }, { t: 'circle', cx: 0.82, cy: 0.82, r: 0.68, stroke: 'soft' }] },
        }),
        prism([0.78, 0, -0.1], handle, 0.2, { id: 'handle', axis: 'z', role: 'accent' }),
        ball([-0.1, 2.0, 0.1], 0.13, { id: 's1', role: 'face', group: 'steam1' }),
        ball([0.15, 2.3, -0.1], 0.1, { id: 's2', role: 'face', group: 'steam2' }),
        ball([-0.05, 2.55, 0.05], 0.08, { id: 's3', role: 'face', group: 'steam1' }),
    ],
    motion: {
        duration: 2.2,
        label: 'steam rises',
        tracks: [
            { group: 'steam1', t: [0.05, 0.45, 0], ease: 'out' },
            { group: 'steam2', t: [-0.08, 0.35, 0], from: 0.2, ease: 'out' },
        ],
    },
});
/** Trash can: the lid tips open. */
export const trash = defineDrawing({
    id: 'trash',
    name: 'Trash',
    category: 'files',
    tags: ['trash', 'delete', 'bin', 'remove', 'garbage', 'recycle', 'empty'],
    kind: 'icon',
    prompt: '/isometric create a trash can icon for the delete action',
    description: 'A round trash can with a lid and a handle. The lid tips open.',
    createdAt: '2026-10-28',
    parts: [
        cyl([0, 0, 0], 0.72, 1.7, { id: 'can', r2: 0.86, n: 44 }),
        cyl([0, 1.7, 0], 0.98, 0.18, { id: 'lid', role: 'accent', group: 'lid', n: 44 }),
        cyl([0, 1.88, 0], 0.62, 0.12, { id: 'lid-top', role: 'accent', group: 'lid', n: 40 }),
        cbox(0, 2.0, 0, [0.7, 0.12, 0.2], { id: 'grip', r: 0.06, axis: 'z', role: 'face', group: 'lid' }),
    ],
    motion: {
        duration: 2.0,
        label: 'the lid tips open',
        tracks: [{ group: 'lid', r: { axis: 'x', deg: -32, pivot: [0, 1.7, -0.98] }, ease: 'back' }],
    },
});
function badgeMarks(kind) {
    const c = 0.5;
    switch (kind) {
        case 'plus': return [{ t: 'segs', segs: [[c - 0.22, c, c + 0.22, c], [c, c - 0.22, c, c + 0.22]], stroke: true, width: 1.5 }];
        case 'minus': return [{ t: 'segs', segs: [[c - 0.22, c, c + 0.22, c]], stroke: true, width: 1.5 }];
        case 'check': return [{ t: 'line', pts: [[c - 0.22, c + 0.01], [c - 0.06, c + 0.17], [c + 0.23, c - 0.15]], stroke: true, width: 1.5 }];
        case 'x': return [{ t: 'segs', segs: [[c - 0.17, c - 0.17, c + 0.17, c + 0.17], [c - 0.17, c + 0.17, c + 0.17, c - 0.17]], stroke: true, width: 1.5 }];
        default: return [{ t: 'segs', segs: [[c, c - 0.24, c, c + 0.06]], stroke: true, width: 1.5 }, { t: 'circle', cx: c, cy: c + 0.2, r: 0.04, fill: 'ink' }];
    }
}
const homeNames = { plus: 'Home plus', minus: 'Home minus', check: 'Home check', x: 'Home x', exclamation: 'Home exclamation' };
const homeMeaning = { plus: 'add a property', minus: 'remove a property', check: 'a verified address', x: 'an unavailable listing', exclamation: 'an alert about a home' };
function home(kind, day) {
    return defineDrawing({
        id: `home-${kind}`,
        name: homeNames[kind],
        category: 'status',
        tags: ['home', 'house', kind, 'status', 'property', 'real estate', 'address', 'badge'],
        kind: 'icon',
        prompt: `/isometric create a house icon with a ${kind} badge for ${homeMeaning[kind]}`,
        description: `A small house with a pitched roof and a door, with a round ${kind} badge floating above it.`,
        createdAt: `2026-10-${String(day).padStart(2, '0')}`,
        parts: [
            cbox(0, 0, 0, [1.8, 1.25, 1.7], {
                id: 'walls',
                decals: { front: [{ t: 'rect', x: 0.62, y: 0.42, w: 0.56, h: 0.83, r: 0.06, fill: 'detail', stroke: true }, { t: 'circle', cx: 1.06, cy: 0.86, r: 0.03, fill: 'ink' }], right: [{ t: 'rect', x: 0.55, y: 0.35, w: 0.6, h: 0.45, r: 0.05, fill: 'face', stroke: true }] },
            }),
            prism([0, 1.25, -0.95], [[-1.05, 0], [1.05, 0], [0, 0.95]], 1.9, { id: 'roof', axis: 'z', role: 'accent' }),
            cbox(0.45, 1.6, -0.35, [0.26, 0.6, 0.26], { id: 'chimney', role: 'detail' }),
            cyl([0, 2.75, -0.08], 0.5, 0.16, { id: 'badge', axis: 'z', role: 'face', group: 'badge', n: 40, decals: { front: badgeMarks(kind) } }),
        ],
        motion: { duration: 1.6, label: 'the badge bobs', tracks: [{ group: 'badge', t: [0, 0.22, 0], ease: 'inOut' }] },
    });
}
export const homes = ['plus', 'minus', 'check', 'x', 'exclamation'].map((k, i) => home(k, 20 + i));
/** Trophy: lifts and turns. */
const ear = [[0, 0], [0.12, 0], [0.34, 0.1], [0.42, 0.32], [0.34, 0.54], [0.12, 0.62], [0, 0.62], [0, 0.5], [0.1, 0.5], [0.26, 0.44], [0.3, 0.32], [0.26, 0.18], [0.1, 0.12], [0, 0.12]];
export const trophy = defineDrawing({
    id: 'trophy',
    name: 'Trophy',
    category: 'people',
    tags: ['trophy', 'award', 'winner', 'achievement', 'prize', 'cup', 'success', 'leaderboard'],
    kind: 'icon',
    prompt: '/isometric create a trophy icon for the achievements page',
    description: 'A trophy cup with two handles on a stem and a stepped base with a name plate.',
    createdAt: '2026-10-27',
    parts: [
        cbox(0, 0, 0, [1.6, 0.4, 1.6], { id: 'base', r: 0.08, role: 'detail', decals: { front: [{ t: 'rect', x: 0.4, y: 0.12, w: 0.8, h: 0.18, r: 0.03, fill: 'face', stroke: 'soft' }] } }),
        cbox(0, 0.4, 0, [1.1, 0.2, 1.1], { id: 'step', r: 0.06, role: 'face' }),
        cyl([0, 0.6, 0], 0.14, 0.55, { id: 'stem', role: 'accent', group: 'cup' }),
        cyl([0, 1.15, 0], 0.18, 0.12, { id: 'neck', r2: 0.5, role: 'accent', group: 'cup' }),
        cyl([0, 1.27, 0], 0.5, 0.95, { id: 'bowl', r2: 0.82, role: 'accent', group: 'cup', n: 44, decals: { top: [{ t: 'circle', cx: 0.82, cy: 0.82, r: 0.66, fill: 'accent', stroke: 'soft' }] } }),
        prism([0.66, 1.42, -0.05], ear, 0.1, { id: 'ear-r', axis: 'z', role: 'accent', group: 'cup' }),
        prism([-0.05, 1.42, 0.66], ear, 0.1, { id: 'ear-f', axis: 'x', role: 'accent', group: 'cup' }),
    ],
    motion: { duration: 2, label: 'it lifts off its base', tracks: [{ group: 'cup', t: [0, 0.32, 0], ease: 'inOut' }] },
});
/** Target: an arrow lands in the bullseye. */
export const target = defineDrawing({
    id: 'target',
    name: 'Target',
    category: 'shapes',
    tags: ['target', 'goal', 'aim', 'bullseye', 'focus', 'objective', 'marketing', 'okr'],
    kind: 'icon',
    prompt: '/isometric create a target with an arrow for the goals section',
    description: 'A round target on an easel with three rings and an arrow in the bullseye.',
    createdAt: '2026-10-26',
    parts: [
        // Easel legs.
        box([-0.95, 0, -0.35], [0.14, 1.1, 0.14], { id: 'leg-l', role: 'detail' }),
        box([0.81, 0, -0.35], [0.14, 1.1, 0.14], { id: 'leg-r', role: 'detail' }),
        cyl([0, 1.9, -0.2], 1.25, 0.2, { id: 'ring1', axis: 'z', n: 48 }),
        cyl([0, 1.9, 0.0], 0.86, 0.06, { id: 'ring2', axis: 'z', role: 'accent', n: 44 }),
        cyl([0, 1.9, 0.06], 0.52, 0.05, { id: 'ring3', axis: 'z', n: 40 }),
        cyl([0, 1.9, 0.11], 0.2, 0.04, { id: 'eye', axis: 'z', role: 'accent', n: 32 }),
        // The arrow: shaft, tip buried, fletching.
        box([-0.035, 1.865, 0.15], [0.07, 0.07, 1.25], { id: 'shaft', role: 'ink', group: 'arrow' }),
        prism([0, 1.9, 1.05], [[-0.22, 0], [0.22, 0], [0.22, 0.02], [-0.22, 0.02]].map(([u, v]) => [u, v - 0.01]), 0.32, { id: 'fletch-h', axis: 'z', role: 'detail', group: 'arrow' }),
        prism([0, 1.9, 1.05], [[-0.01, -0.22], [0.01, -0.22], [0.01, 0.22], [-0.01, 0.22]], 0.32, { id: 'fletch-v', axis: 'z', role: 'detail', group: 'arrow' }),
    ],
    motion: { duration: 1.8, label: 'the arrow flies in', tracks: [{ group: 'arrow', t: [0, 0, 1.4], from: 0, to: 1, ease: 'in' }] },
});
