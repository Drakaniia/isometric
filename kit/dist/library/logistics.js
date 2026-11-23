/**
 * Logistics scenes: a pallet-rack warehouse with a forklift, a container port
 * with a ship-to-shore crane, a parcel sorting hub, a truck loading dock and a
 * last-mile delivery corner with parcel lockers and a drone.
 */
import { defineDrawing, box, cyl, cone, prism, slots, textLines, grid } from '../build.js';
const CREATED = '2026-11-13';
/* ---------------------------------------------------------- shared parts */
/** Packing tape across a carton top and a shipping label on its front. */
const cartonDecals = (w, h, d) => {
    const lw = Math.min(0.26, w * 0.42), lh = Math.min(0.16, h * 0.42);
    return {
        top: [{ t: 'rect', x: w / 2 - 0.05, y: 0, w: 0.1, h: d, fill: 'detail', stroke: 'soft' }],
        front: [
            { t: 'rect', x: w * 0.12, y: h * 0.22, w: lw, h: lh, r: 0.015, fill: 'face', stroke: 'soft' },
            { t: 'bar', x: w * 0.12 + 0.03, y: h * 0.22 + lh / 2 - 0.015, w: lw * 0.6, h: 0.03, fill: 'ink' },
        ],
    };
};
const carton = (id, at, size, role = 'face', group) => box(at, size, { id, role, group, r: 0.02, decals: cartonDecals(size[0], size[1], size[2]) });
/** Fork openings on the two visible sides of a pallet, deck boards on top. */
const forkHoles = (w) => [
    { t: 'rect', x: w * 0.12, y: 0.045, w: w * 0.28, h: 0.07, r: 0.01, fill: 'ink' },
    { t: 'rect', x: w * 0.6, y: 0.045, w: w * 0.28, h: 0.07, r: 0.01, fill: 'ink' },
];
const pallet = (id, at, w, d, group) => box(at, [w, 0.15, d], {
    id, role: 'detail', group,
    decals: { front: forkHoles(w), right: forkHoles(d), top: [slots(0.08, 0.03, Math.floor((w - 0.16) / 0.16) + 1, 0.16, d - 0.06, 'v')] },
});
/** Stretch-wrap lines across a wrapped pallet load. */
const wrapLines = (w, h) => [{
        t: 'segs', stroke: 'soft',
        segs: [0.25, 0.5, 0.75, 0.95].map((k) => [0.05, h * k, w - 0.05, h * k - 0.16]),
    }];
/** Zig-zag bracing between two posts on a frame face. */
const bracing = (w, h, step = 0.5) => [
    { t: 'segs', stroke: 'soft', segs: [[0.06, 0.05, 0.06, h - 0.05], [w - 0.06, 0.05, w - 0.06, h - 0.05]] },
    {
        t: 'segs', stroke: 'soft',
        segs: Array.from({ length: Math.max(1, Math.floor((h - 0.2) / step)) }, (_, k) => (k % 2 ? [w - 0.06, 0.1 + k * step, 0.06, 0.1 + (k + 1) * step] : [0.06, 0.1 + k * step, w - 0.06, 0.1 + (k + 1) * step])),
    },
];
/** A wire mesh panel. */
const mesh = (w, h, step = 0.12) => [{
        t: 'segs', stroke: 'soft',
        segs: [
            ...Array.from({ length: Math.floor(w / step) }, (_, k) => [step * (k + 0.5), 0.03, step * (k + 0.5), h - 0.03]),
            ...Array.from({ length: Math.floor(h / step) }, (_, k) => [0.03, step * (k + 0.5), w - 0.03, step * (k + 0.5)]),
        ],
    }];
/** Corrugation ribs on a shipping container side. */
const ribs = (w, h, step = 0.08) => [slots(0.07, 0.05, Math.floor((w - 0.14) / step) + 1, step, h - 0.1, 'v')];
/** Container end doors with locking bars. */
const containerDoors = (w, h) => [
    { t: 'rect', x: 0.03, y: 0.03, w: w / 2 - 0.045, h: h - 0.06, r: 0.01, stroke: 'soft' },
    { t: 'rect', x: w / 2 + 0.015, y: 0.03, w: w / 2 - 0.045, h: h - 0.06, r: 0.01, stroke: 'soft' },
    { t: 'segs', stroke: true, segs: [[w * 0.18, 0.06, w * 0.18, h - 0.06], [w * 0.36, 0.06, w * 0.36, h - 0.06], [w * 0.64, 0.06, w * 0.64, h - 0.06], [w * 0.82, 0.06, w * 0.82, h - 0.06]] },
];
const CONT = [1.2, 0.45, 0.48];
const shippingContainer = (id, at, role, group) => box(at, CONT, { id, role, group, decals: { front: ribs(CONT[0], CONT[1]), right: containerDoors(CONT[2], CONT[1]), top: [slots(0.1, 0.05, 11, 0.1, CONT[2] - 0.1, 'v')] } });
const ROLES = ['body', 'face', 'detail'];
/* --------------------------------------------------- pallet-rack warehouse */
const WF = 0.25, RZ0 = 0.5, RZ1 = 1.7, UPW = 0.12, BAY = 1.2;
const ux = (i) => 0.6 + i * (BAY + UPW);
const bayX = (b) => ux(b) + UPW;
const BEAMS = [1.55, 3.0, 4.4];
const DECK = [WF, 1.7, 3.15];
const LOADS = [
    ['cartons', 'wrap', 'drums', 'cartons', 'wrap'],
    ['drums', 'cartons', null, 'wrap', 'cartons1'],
    ['wrap', null, 'cartons', 'drums', 'cartons'],
];
/** One pallet position in the rack, loaded with cartons, a wrapped load or drums. */
function rackLoad(b, l, kind) {
    if (!kind)
        return [];
    const x = bayX(b) + 0.1, y = DECK[l], id = `b${b}l${l}`, pz = RZ0 + 0.04, pd = RZ1 - RZ0 - 0.08;
    const out = [pallet(`pallet-${id}`, [x, y, pz], 1.0, pd)];
    const py = y + 0.15;
    if (kind === 'wrap') {
        const h = l === 2 ? 0.9 : 1.0;
        out.push(box([x + 0.03, py, pz + 0.03], [0.94, h, pd - 0.06], { id: `wrap-${id}`, r: 0.06, role: 'face', decals: { front: wrapLines(0.94, h), right: wrapLines(pd - 0.06, h), top: [{ t: 'rect', x: 0.12, y: 0.12, w: 0.7, h: pd - 0.3, r: 0.05, stroke: 'soft' }] } }));
    }
    else if (kind === 'drums') {
        for (const [i, dx] of [0.26, 0.74].entries())
            for (const [j, dz] of [0.29, 0.83].entries()) {
                out.push(cyl([x + dx, py, pz + dz], 0.23, 0.85, {
                    id: `drum-${id}-${i}${j}`, role: (i + j) % 2 ? 'body' : 'detail', n: 24,
                    decals: { top: [{ t: 'circle', cx: 0.23, cy: 0.23, r: 0.17, stroke: 'soft' }, { t: 'circle', cx: 0.12, cy: 0.14, r: 0.035, fill: 'ink' }] },
                }));
            }
    }
    else {
        const layers = kind === 'cartons1' ? 1 : 2;
        for (let k = 0; k < layers; k++)
            for (const [i, dx] of [0.01, 0.51].entries())
                for (const [j, dz] of [0.02, 0.56].entries()) {
                    out.push(carton(`carton-${id}-${k}${i}${j}`, [x + dx, py + k * 0.42, pz + dz], [0.48, 0.42, 0.52], (i + j + k) % 2 ? 'face' : 'detail'));
                }
    }
    return out;
}
/** Forklift parked in the aisle in front of bay 2, forks pointing at the rack. */
function forklift(cx) {
    const x0 = cx - 0.55, lift = 'lift';
    return [
        box([x0, 0.45, 3.25], [1.1, 0.6, 1.5], { id: 'fl-chassis', r: 0.05, role: 'body', decals: { right: [{ t: 'rect', x: 0.1, y: 0.1, w: 1.3, h: 0.4, r: 0.04, stroke: 'soft' }, { t: 'bar', x: 0.25, y: 0.27, w: 0.5, h: 0.06, fill: 'ink' }] } }),
        box([x0, 0.42, 4.75], [1.1, 0.85, 0.35], { id: 'fl-counterweight', r: 0.12, axis: 'x', role: 'detail', decals: { front: [slots(0.25, 0.25, 7, 0.1, 0.3, 'v'), { t: 'circle', cx: 0.12, cy: 0.2, r: 0.05, fill: 'ink' }, { t: 'circle', cx: 0.98, cy: 0.2, r: 0.05, fill: 'ink' }] } }),
        cyl([x0 - 0.22, 0.5, 3.6], 0.25, 0.22, { id: 'fl-wheel-fl', axis: 'x', role: 'ink', n: 20 }),
        cyl([x0 + 1.1, 0.5, 3.6], 0.25, 0.22, { id: 'fl-wheel-fr', axis: 'x', role: 'ink', n: 20 }),
        cyl([x0 - 0.18, 0.45, 4.45], 0.2, 0.18, { id: 'fl-wheel-rl', axis: 'x', role: 'ink', n: 18 }),
        cyl([x0 + 1.1, 0.45, 4.45], 0.2, 0.18, { id: 'fl-wheel-rr', axis: 'x', role: 'ink', n: 18 }),
        cyl([x0 + 1.32, 0.5, 3.6], 0.1, 0.03, { id: 'fl-hub-f', axis: 'x', role: 'face', n: 12 }),
        cyl([x0 + 1.28, 0.45, 4.45], 0.08, 0.03, { id: 'fl-hub-r', axis: 'x', role: 'face', n: 12 }),
        box([x0, 1.05, 3.25], [1.1, 0.25, 0.2], { id: 'fl-cowl', r: 0.04, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.05, w: 0.3, h: 0.1, r: 0.02, fill: 'ink' }] } }),
        box([cx - 0.1, 1.05, 3.5], [0.2, 0.5, 0.15], { id: 'fl-column', role: 'detail' }),
        cyl([cx, 1.55, 3.57], 0.18, 0.04, { id: 'fl-steering', role: 'ink', n: 20 }),
        box([cx - 0.25, 1.05, 4.0], [0.5, 0.2, 0.45], { id: 'fl-seat', r: 0.06, role: 'ink' }),
        box([cx - 0.25, 1.25, 4.45], [0.5, 0.5, 0.1], { id: 'fl-backrest', r: 0.05, role: 'ink' }),
        box([x0, 1.3, 3.3], [0.08, 1.15, 0.08], { id: 'fl-post-fl', role: 'ink' }),
        box([x0 + 1.02, 1.3, 3.3], [0.08, 1.15, 0.08], { id: 'fl-post-fr', role: 'ink' }),
        box([x0, 1.05, 4.6], [0.08, 1.4, 0.08], { id: 'fl-post-rl', role: 'ink' }),
        box([x0 + 1.02, 1.05, 4.6], [0.08, 1.4, 0.08], { id: 'fl-post-rr', role: 'ink' }),
        box([x0, 2.45, 3.3], [1.1, 0.08, 1.38], { id: 'fl-guard', role: 'detail', decals: { top: [slots(0.15, 0.12, 9, 0.1, 1.14, 'v')] } }),
        cyl([x0 + 0.92, 2.53, 4.5], 0.07, 0.12, { id: 'fl-beacon', role: 'face', n: 14 }),
        // Mast, lift cylinder and crossbar.
        box([cx - 0.46, 0.3, 3.05], [0.12, 2.9, 0.2], { id: 'fl-mast-l', role: 'body', decals: { front: [slots(0.06, 0.15, 13, 0.2, 0.06, 'h')] } }),
        box([cx + 0.34, 0.3, 3.05], [0.12, 2.9, 0.2], { id: 'fl-mast-r', role: 'body', decals: { front: [slots(0.06, 0.15, 13, 0.2, 0.06, 'h')] } }),
        cyl([cx, 0.45, 3.15], 0.06, 2.2, { id: 'fl-ram', role: 'ink', n: 12 }),
        box([cx - 0.46, 3.2, 3.05], [0.92, 0.12, 0.2], { id: 'fl-mast-top', role: 'body' }),
        // Carriage, forks, pallet and the lit load move together.
        box([cx - 0.51, 0.32, 2.95], [1.02, 0.7, 0.1], { id: 'fl-carriage', role: 'detail', group: lift, decals: { front: [slots(0.06, 0.12, 4, 0.15, 0.9, 'h')] } }),
        box([cx - 0.51, 1.02, 2.97], [1.02, 0.55, 0.06], { id: 'fl-load-guard', role: 'face', group: lift, decals: { front: [slots(0.1, 0.04, 9, 0.1, 0.47, 'v', true)] } }),
        box([cx - 0.34, 0.32, 1.85], [0.14, 0.06, 1.1], { id: 'fl-fork-l', role: 'ink', group: lift }),
        box([cx + 0.2, 0.32, 1.85], [0.14, 0.06, 1.1], { id: 'fl-fork-r', role: 'ink', group: lift }),
        pallet('fl-pallet', [cx - 0.5, 0.38, 1.88], 1.0, 1.04, lift),
        box([cx - 0.46, 0.53, 1.92], [0.92, 0.8, 0.96], {
            id: 'fl-load', r: 0.04, role: 'accent', group: lift,
            decals: {
                front: [{ t: 'rect', x: 0.12, y: 0.15, w: 0.3, h: 0.2, r: 0.02, fill: 'face', stroke: 'soft' }, ...textLines(0.15, 0.2, 0.22, [1, 0.6], 0.06, 0.03, 'ink')],
                top: [{ t: 'rect', x: 0.41, y: 0, w: 0.1, h: 0.96, fill: 'face', stroke: 'soft' }],
            },
        }),
    ];
}
const FL_X = bayX(2) + BAY / 2;
export const warehouse = defineDrawing({
    id: 'warehouse-racking',
    name: 'Warehouse racking',
    category: 'logistics',
    tags: ['warehouse', 'forklift', 'pallet', 'racking', 'storage', 'inventory', 'fulfillment', '3pl', 'distribution center', 'wms', 'supply chain', 'logistics'],
    kind: 'scene',
    prompt: '/isometric create a warehouse aisle with pallet racking and a forklift putting a pallet away, for our WMS landing page',
    description: 'A warehouse aisle in front of a back wall with a roll-up door: five bays of three-level pallet racking loaded with carton stacks, stretch-wrapped loads and drums, one slot left empty. A forklift with an overhead guard waits in the aisle and raises the lit pallet up to the empty slot. A hand pallet jack with cartons and a stack of empty pallets stand on the marked floor.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9.2, WF, 7.0], {
            id: 'floor', role: 'face',
            decals: {
                top: [
                    { t: 'segs', stroke: true, segs: [[0.3, 2.0, 8.9, 2.0], [0.3, 5.5, 8.9, 5.5]] },
                    ...grid(0.4, 5.8, 14, 1, 0.3, 0.7, 0.3, { fill: 'detail' }),
                    { t: 'rect', x: 6.3, y: 3.5, w: 1.2, h: 1.3, r: 0.04, stroke: 'soft' },
                ],
            },
        }),
        box([0, WF, 0], [9.2, 4.8, 0.3], {
            id: 'back-wall', role: 'face',
            decals: {
                front: [
                    slots(0.6, 0.1, 12, 0.6, 4.6),
                    ...[0, 1, 2, 3, 4].map((k) => ({ t: 'rect', x: 0.9 + k * 1.3, y: 0.25, w: 0.9, h: 0.35, r: 0.04, fill: 'detail', stroke: 'soft' })),
                    { t: 'rect', x: 7.65, y: 1.9, w: 1.3, h: 2.9, r: 0.03, fill: 'detail', stroke: true },
                    slots(7.7, 2.05, 15, 0.18, 1.2, 'h'),
                    { t: 'rect', x: 7.65, y: 1.65, w: 1.3, h: 0.2, r: 0.03, fill: 'ink' },
                ],
            },
        }),
        // Rack uprights, beams and loads.
        ...Array.from({ length: 6 }, (_, i) => box([ux(i), WF, RZ0], [UPW, 4.3, RZ1 - RZ0], {
            id: `upright${i}`, role: 'body',
            decals: { right: bracing(RZ1 - RZ0, 4.3), front: [slots(0.06, 0.12, 21, 0.2, 0.05, 'h')] },
        })),
        ...[0, 1, 2, 3, 4].flatMap((b) => BEAMS.flatMap((by, l) => [
            box([bayX(b), by, RZ0], [BAY, 0.15, 0.1], { id: `beam-b${b}-${l}`, role: 'detail' }),
            box([bayX(b), by, RZ1 - 0.1], [BAY, 0.15, 0.1], {
                id: `beam-f${b}-${l}`, role: 'detail',
                decals: { front: l < 2 ? [{ t: 'rect', x: 0.45, y: 0.03, w: 0.3, h: 0.09, r: 0.01, fill: 'face', stroke: 'soft' }] : [] },
            }),
        ])),
        ...LOADS.flatMap((row, l) => row.flatMap((k, b) => rackLoad(b, l, k))),
        // Hand pallet jack with a pallet of cartons.
        box([1.15, WF, 3.4], [0.2, 0.08, 1.1], { id: 'jack-tine-l', role: 'ink' }),
        box([1.65, WF, 3.4], [0.2, 0.08, 1.1], { id: 'jack-tine-r', role: 'ink' }),
        box([1.25, WF, 4.5], [0.5, 0.35, 0.25], { id: 'jack-pump', r: 0.05, role: 'ink' }),
        box([1.46, WF + 0.35, 4.6], [0.08, 1.0, 0.08], { id: 'jack-handle', role: 'ink' }),
        box([1.3, WF + 1.35, 4.6], [0.4, 0.08, 0.08], { id: 'jack-grip', r: 0.03, role: 'ink' }),
        pallet('jack-pallet', [1.0, WF + 0.08, 3.4], 1.0, 1.1),
        ...[0, 1].flatMap((k) => [0, 1].flatMap((i) => [0, 1].map((j) => carton(`jack-carton-${k}${i}${j}`, [1.01 + i * 0.5, WF + 0.23 + k * 0.4, 3.42 + j * 0.54], [0.48, 0.4, 0.52], (i + j + k) % 2 ? 'face' : 'detail')))),
        // Empty pallets and loose cartons.
        ...[0, 1, 2, 3].map((k) => pallet(`spare-pallet${k}`, [6.4, WF + k * 0.15, 3.6], 1.0, 1.1)),
        carton('loose-0', [7.9, WF, 2.6], [0.6, 0.45, 0.55], 'detail'),
        carton('loose-1', [7.95, WF + 0.45, 2.65], [0.5, 0.35, 0.45], 'face'),
        carton('loose-2', [8.55, WF, 2.7], [0.45, 0.4, 0.45], 'face'),
        ...forklift(FL_X),
    ],
    motion: {
        duration: 3.6,
        label: 'the forklift raises a pallet to the empty rack slot',
        tracks: [{ group: 'lift', t: [0, 1.37, 0], from: 0.1, to: 0.85, ease: 'inOut' }],
    },
});
/* ---------------------------------------------------------- container port */
const QZ = 2.7, QY = 0.6, WY = 0.15, DECK_Y = 1.25;
const SHIP_BAYS = [2.2, 3.46, 4.72, 5.98];
const SHIP_ROWS = [0.55, 1.06, 1.57];
const SHIP_TIERS = [[2, 3, 2], [1, 2, 2], [3, 1, 1], [2, 2, 3]];
const LEG_X = [3.7, 6.7], LEG_Z = [2.9, 4.9], LEG_TOP = 4.6, BOOM_Y = 4.9;
// The lit container rests mid-hoist, clear of the stacks, so the still shows it.
const BOOM_X = 4.945, HOIST = 1.0;
const HZ = SHIP_ROWS[1], HY = DECK_Y + CONT[1] + 1.0;
const SPREAD_TOP = HY + CONT[1] + 0.08, CABLE_LEN = LEG_TOP - SPREAD_TOP;
const yardStacks = (x0s, tiers, tag) => x0s.flatMap((x, b) => [5.5, 6.0].flatMap((z, r) => Array.from({ length: tiers[b][r] }, (_, t) => shippingContainer(`yard-${tag}${b}${r}${t}`, [x, QY + t * CONT[1], z], ROLES[(b + r * 2 + t) % 3]))));
export const containerPort = defineDrawing({
    id: 'container-port',
    name: 'Container port',
    category: 'logistics',
    tags: ['port', 'harbor', 'harbour', 'shipping', 'container ship', 'crane', 'sts crane', 'terminal', 'freight', 'ocean freight', 'import', 'export', 'supply chain', 'logistics'],
    kind: 'scene',
    prompt: '/isometric create a container terminal: a ship at the quay, a ship-to-shore crane unloading it and a truck waiting below, for our freight forwarding page',
    description: 'A container ship moored at a quay, its deck stacked with containers behind a bridge and funnel. A ship-to-shore crane stands on rails along the quay edge with its boom out over the ship, a trolley and operator cab under the boom and a machinery house behind. The crane hoists the lit container off the ship while a terminal truck with a container waits between the crane legs and more containers stand stacked in the yard.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [10, WY, QZ], {
            id: 'water', role: 'face',
            decals: { top: [{ t: 'segs', stroke: 'soft', segs: [0.3, 0.9, 1.5, 2.1].flatMap((v, r) => Array.from({ length: 12 }, (_, k) => [0.3 + k * 0.82 + (r % 2) * 0.4, v, 0.6 + k * 0.82 + (r % 2) * 0.4, v])) }] },
        }),
        box([0, 0, QZ], [10, QY, 4.0], {
            id: 'quay', role: 'face',
            decals: {
                top: [
                    { t: 'segs', stroke: true, segs: [[0.1, 0.325, 9.9, 0.325], [0.1, 2.325, 9.9, 2.325]] },
                    { t: 'segs', stroke: 'soft', segs: [[0.1, 0.7, 9.9, 0.7], [0.1, 1.6, 9.9, 1.6], [0.1, 2.6, 9.9, 2.6]] },
                    { t: 'rect', x: 0.3, y: 2.7, w: 2.7, h: 1.1, r: 0.04, stroke: 'soft' },
                    { t: 'rect', x: 7.3, y: 2.7, w: 2.6, h: 1.1, r: 0.04, stroke: 'soft' },
                ],
                front: [slots(0.5, 0.08, 10, 1.0, 0.44)],
            },
        }),
        ...[1.0, 2.6, 8.4, 9.5].map((x, k) => cyl([x, QY, 2.85], 0.09, 0.18, { id: `bollard${k}`, role: 'ink', n: 14 })),
        // The ship.
        box([0.5, WY, 0.35], [7.2, DECK_Y - WY, 2.0], {
            id: 'hull', role: 'body',
            decals: { front: [{ t: 'rect', x: 0, y: 0.72, w: 7.2, h: 0.38, fill: 'detail' }, { t: 'segs', stroke: 'soft', segs: [[0.1, 0.12, 7.1, 0.12]] }, slots(6.7, 0.35, 4, 0.08, 0.04, 'h', true)] },
        }),
        prism([0, WY, 0], [[7.7, 0.35], [8.3, 0.75], [8.6, 1.35], [8.3, 1.95], [7.7, 2.35]], DECK_Y - WY, { id: 'bow', role: 'body' }),
        box([0.75, DECK_Y, 0.6], [1.2, 2.0, 1.5], {
            id: 'bridge', role: 'face',
            decals: {
                front: [{ t: 'rect', x: 0.08, y: 0.12, w: 1.04, h: 0.22, r: 0.03, fill: 'ink' }, ...grid(0.12, 0.6, 4, 4, 0.18, 0.12, 0.08, { fill: 'detail' })],
                right: [{ t: 'rect', x: 0.08, y: 0.12, w: 1.34, h: 0.22, r: 0.03, fill: 'ink' }, ...grid(0.15, 0.6, 5, 4, 0.18, 0.12, 0.08, { fill: 'detail' })],
            },
        }),
        box([0.85, 2.2, 2.1], [0.7, 0.25, 0.22], { id: 'lifeboat', r: 0.1, axis: 'x', role: 'detail' }),
        box([1.0, DECK_Y + 2.0, 1.0], [0.55, 0.7, 0.6], { id: 'funnel', r: 0.12, role: 'detail', decals: { front: [{ t: 'rect', x: 0, y: 0.12, w: 0.55, h: 0.12, fill: 'ink' }], right: [{ t: 'rect', x: 0, y: 0.12, w: 0.6, h: 0.12, fill: 'ink' }] } }),
        cyl([1.75, DECK_Y + 2.0, 1.35], 0.04, 0.8, { id: 'ship-mast', role: 'ink', n: 10 }),
        box([1.55, DECK_Y + 2.8, 1.3], [0.4, 0.05, 0.1], { id: 'radar', role: 'ink' }),
        ...SHIP_BAYS.flatMap((x, b) => SHIP_ROWS.flatMap((z, r) => Array.from({ length: SHIP_TIERS[b][r] }, (_, t) => shippingContainer(`ship-${b}${r}${t}`, [x, DECK_Y + t * CONT[1], z], ROLES[(b * 2 + r + t) % 3])))),
        // The ship-to-shore crane.
        ...LEG_X.flatMap((x, i) => LEG_Z.flatMap((z, j) => [
            box([x - 0.1, QY, z - 0.05], [0.45, 0.25, 0.35], { id: `bogie${i}${j}`, role: 'ink', decals: { front: [{ t: 'circle', cx: 0.12, cy: 0.15, r: 0.07, fill: 'face' }, { t: 'circle', cx: 0.33, cy: 0.15, r: 0.07, fill: 'face' }] } }),
            box([x, QY + 0.25, z], [0.25, LEG_TOP - QY - 0.25, 0.25], { id: `leg${i}${j}`, role: 'body', decals: { front: bracing(0.25, LEG_TOP - QY - 0.25, 0.4), right: bracing(0.25, LEG_TOP - QY - 0.25, 0.4) } }),
        ])),
        ...LEG_Z.map((z, j) => box([LEG_X[0], LEG_TOP, z], [LEG_X[1] + 0.25 - LEG_X[0], BOOM_Y - LEG_TOP, 0.25], { id: `portal${j}`, role: 'body', decals: { front: [slots(0.2, 0.06, 15, 0.2, 0.18, 'v')] } })),
        ...LEG_X.flatMap((x, i) => [
            box([x, LEG_TOP, LEG_Z[0] + 0.25], [0.25, BOOM_Y - LEG_TOP, LEG_Z[1] - LEG_Z[0] - 0.25], { id: `sill${i}`, role: 'body', decals: { right: [slots(0.15, 0.06, 9, 0.2, 0.18, 'v')] } }),
            box([x, 2.2, LEG_Z[0] + 0.25], [0.25, 0.22, LEG_Z[1] - LEG_Z[0] - 0.25], { id: `tie${i}`, role: 'body' }),
        ]),
        box([BOOM_X, BOOM_Y, -0.25], [0.75, 0.32, 5.9], {
            id: 'boom', role: 'body',
            decals: { right: [{ t: 'segs', stroke: 'soft', segs: Array.from({ length: 29 }, (_, k) => (k % 2 ? [0.1 + k * 0.2, 0.27, 0.3 + k * 0.2, 0.05] : [0.1 + k * 0.2, 0.05, 0.3 + k * 0.2, 0.27])) }], top: [slots(0.1, 0.2, 6, 0.11, 5.5, 'v')], front: [{ t: 'circle', cx: 0.375, cy: 0.16, r: 0.06, fill: 'ink' }] },
        }),
        box([BOOM_X, BOOM_Y + 0.32, 3.9], [0.14, 1.3, 0.22], { id: 'apex-l', role: 'body' }),
        box([BOOM_X + 0.61, BOOM_Y + 0.32, 3.9], [0.14, 1.3, 0.22], { id: 'apex-r', role: 'body' }),
        box([BOOM_X, BOOM_Y + 1.62, 3.9], [0.75, 0.14, 0.22], { id: 'apex-top', role: 'body' }),
        box([BOOM_X, BOOM_Y + 0.32, 4.35], [0.75, 0.6, 1.2], {
            id: 'machinery', r: 0.03, role: 'face',
            decals: { right: [slots(0.15, 0.12, 9, 0.1, 0.3, 'v'), { t: 'rect', x: 1.0, y: 0.15, w: 0.12, h: 0.4, r: 0.02, stroke: 'soft' }], front: [slots(0.12, 0.12, 6, 0.1, 0.3, 'v')] },
        }),
        box([BOOM_X + 0.045, LEG_TOP, 1.0], [0.66, BOOM_Y - LEG_TOP, 0.6], { id: 'trolley', r: 0.03, role: 'detail', decals: { front: [{ t: 'circle', cx: 0.16, cy: 0.15, r: 0.07, fill: 'ink' }, { t: 'circle', cx: 0.5, cy: 0.15, r: 0.07, fill: 'ink' }] } }),
        box([BOOM_X + 0.775, 4.2, 1.05], [0.42, 0.55, 0.5], {
            id: 'operator-cab', r: 0.04, role: 'face',
            decals: { front: [{ t: 'rect', x: 0.06, y: 0.08, w: 0.3, h: 0.25, r: 0.03, fill: 'ink' }], right: [{ t: 'rect', x: 0.06, y: 0.08, w: 0.38, h: 0.25, r: 0.03, fill: 'ink' }] },
        }),
        box([5.14, SPREAD_TOP, HZ + 0.225], [0.03, CABLE_LEN, 0.03], { id: 'cable-a', role: 'ink', group: 'cable' }),
        box([5.47, SPREAD_TOP, HZ + 0.225], [0.03, CABLE_LEN, 0.03], { id: 'cable-b', role: 'ink', group: 'cable' }),
        box([SHIP_BAYS[2] + 0.04, HY + CONT[1], HZ + 0.02], [1.12, 0.08, 0.44], { id: 'spreader', role: 'ink', group: 'hoist' }),
        shippingContainer('hoisted', [SHIP_BAYS[2], HY, HZ], 'accent', 'hoist'),
        // Terminal truck between the crane legs.
        box([4.15, 0.75, 3.6], [1.55, 0.12, 0.4], { id: 'truck-chassis', role: 'ink' }),
        shippingContainer('truck-box', [4.3, 0.87, 3.56], 'face'),
        box([5.75, 0.74, 3.55], [0.7, 0.8, 0.5], {
            id: 'truck-cab', r: 0.06, role: 'detail',
            decals: { front: [{ t: 'rect', x: 0.35, y: 0.08, w: 0.28, h: 0.28, r: 0.03, fill: 'ink' }], right: [{ t: 'rect', x: 0.05, y: 0.08, w: 0.4, h: 0.28, r: 0.03, fill: 'ink' }, { t: 'rect', x: 0.08, y: 0.55, w: 0.12, h: 0.06, fill: 'face' }, { t: 'rect', x: 0.3, y: 0.55, w: 0.12, h: 0.06, fill: 'face' }] },
        }),
        ...[4.4, 4.75, 6.15].flatMap((x, k) => [
            cyl([x, QY + 0.14, 4.05], 0.14, 0.1, { id: `truck-wheel-f${k}`, axis: 'z', role: 'ink', n: 14 }),
            cyl([x, QY + 0.14, 3.45], 0.14, 0.1, { id: `truck-wheel-b${k}`, axis: 'z', role: 'ink', n: 14 }),
        ]),
        // Yard stacks and a light mast.
        ...yardStacks([0.4, 1.66], [[3, 2], [1, 2]], 'l'),
        ...yardStacks([7.4, 8.66], [[2, 1], [2, 3]], 'r'),
        cyl([9.4, QY, 4.0], 0.07, 3.6, { id: 'light-mast', role: 'ink', n: 12 }),
        box([9.2, QY + 3.6, 3.85], [0.4, 0.15, 0.3], { id: 'light-head', r: 0.03, role: 'face' }),
    ],
    motion: {
        duration: 3.8,
        label: 'the crane hoists a container off the ship',
        tracks: [
            { group: 'hoist', t: [0, HOIST, 0], from: 0.1, to: 0.85, ease: 'inOut' },
            { group: 'cable', s: { k: [1, (CABLE_LEN - HOIST) / CABLE_LEN, 1], pivot: [5.3, LEG_TOP, HZ + 0.24] }, from: 0.1, to: 0.85, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------- parcel sorting hub */
const BED_Y = 0.95, BELT = 1.1, MZ0 = 2.0, MZ1 = 2.9;
const TAKE_X = [5.0, 7.2], TAKE_END = 5.9;
function rollCage(id, x, z) {
    const y0 = 0.3, w = 1.0, d = 0.9, h = 1.0, yw = y0 + 0.06;
    return [
        ...[[0.1, 0.1], [0.9, 0.1], [0.1, 0.8], [0.9, 0.8]].map(([dx, dz], k) => cyl([x + dx, 0.2, z + dz], 0.06, 0.1, { id: `${id}-caster${k}`, role: 'ink', n: 10 })),
        box([x, y0, z], [w, 0.06, d], { id: `${id}-base`, role: 'ink' }),
        box([x, yw, z], [w, h, 0.04], { id: `${id}-back`, role: 'face', decals: { front: mesh(w, h) } }),
        box([x, yw, z + 0.04], [0.04, h, d - 0.08], { id: `${id}-left`, role: 'face' }),
        box([x + w - 0.04, yw, z + 0.04], [0.04, h, d - 0.08], { id: `${id}-right`, role: 'face', decals: { right: mesh(d - 0.08, h) } }),
        box([x, yw, z + d - 0.04], [w, h * 0.45, 0.04], { id: `${id}-front`, role: 'face', decals: { front: mesh(w, h * 0.45) } }),
        carton(`${id}-p0`, [x + 0.08, yw, z + 0.08], [0.4, 0.35, 0.36], 'detail'),
        carton(`${id}-p1`, [x + 0.52, yw, z + 0.1], [0.4, 0.5, 0.4], 'face'),
        carton(`${id}-p2`, [x + 0.1, yw + 0.35, z + 0.1], [0.35, 0.25, 0.3], 'face'),
        box([x + 0.1, yw, z + 0.5], [0.36, 0.12, 0.3], { id: `${id}-bag`, r: 0.05, role: 'body' }),
    ];
}
function beltLegs(id, x, z0, z1) {
    return [
        box([x, 0.2, z0], [0.1, BED_Y - 0.2, 0.1], { id: `${id}-a`, role: 'ink' }),
        box([x, 0.2, z1 - 0.1], [0.1, BED_Y - 0.2, 0.1], { id: `${id}-b`, role: 'ink' }),
        box([x, 0.45, z0 + 0.1], [0.1, 0.08, z1 - z0 - 0.2], { id: `${id}-brace`, role: 'ink' }),
    ];
}
function beltLegsZ(id, z, x0, x1) {
    return [
        box([x0, 0.2, z], [0.1, BED_Y - 0.2, 0.1], { id: `${id}-a`, role: 'ink' }),
        box([x1 - 0.1, 0.2, z], [0.1, BED_Y - 0.2, 0.1], { id: `${id}-b`, role: 'ink' }),
        box([x0 + 0.1, 0.45, z], [x1 - x0 - 0.2, 0.08, 0.1], { id: `${id}-brace`, role: 'ink' }),
    ];
}
export const sortingHub = defineDrawing({
    id: 'sorting-hub',
    name: 'Parcel sorting hub',
    category: 'logistics',
    tags: ['sortation', 'sorting', 'parcel', 'conveyor', 'courier', 'hub', 'scanner', 'barcode', 'post', 'shipping', 'e-commerce', 'fulfillment', 'logistics'],
    kind: 'scene',
    prompt: '/isometric create a parcel sorting hub: a conveyor with a barcode scanner arch and a pusher diverting parcels to take-away belts, for our shipping API page',
    description: 'A parcel sorting line: a long roller conveyor carries cartons, a mailing tube and a poly bag through a barcode scanner arch past an induction desk with a monitor. A pneumatic pusher shoves the lit parcel sideways onto the first of two take-away belts, which run to roll cages filling with parcels. An operator console stands beside the line.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9.6, 0.2, 7.2], {
            id: 'floor', role: 'face',
            decals: {
                top: [
                    { t: 'rect', x: 0.2, y: 0.7, w: 9.2, h: 3.0, r: 0.08, stroke: 'soft' },
                    { t: 'rect', x: 4.85, y: 5.95, w: 1.3, h: 1.1, r: 0.04, stroke: 'soft' },
                    { t: 'rect', x: 7.05, y: 5.95, w: 1.3, h: 1.1, r: 0.04, stroke: 'soft' },
                    ...grid(0.4, 6.3, 7, 1, 0.3, 0.6, 0.25, { fill: 'detail' }),
                ],
            },
        }),
        // Main conveyor.
        box([0.4, BED_Y, MZ0], [8.6, BELT - BED_Y, MZ1 - MZ0], {
            id: 'main-bed', role: 'detail',
            decals: { top: [slots(0.1, 0.08, 43, 0.2, 0.74, 'v')], front: [{ t: 'bar', x: 0.2, y: 0.05, w: 8.2, h: 0.04, fill: 'soft' }] },
        }),
        box([0.4, BELT, MZ0], [TAKE_X[0] - 0.4, 0.12, 0.06], { id: 'rail-back-a', role: 'body' }),
        box([TAKE_X[0] + 0.9, BELT, MZ0], [9.0 - TAKE_X[0] - 0.9, 0.12, 0.06], { id: 'rail-back-b', role: 'body' }),
        box([0.4, BELT, MZ1 - 0.06], [TAKE_X[0] - 0.4, 0.12, 0.06], { id: 'rail-front-a', role: 'body' }),
        box([TAKE_X[0] + 0.9, BELT, MZ1 - 0.06], [TAKE_X[1] - TAKE_X[0] - 0.9, 0.12, 0.06], { id: 'rail-front-b', role: 'body' }),
        box([TAKE_X[1] + 0.9, BELT, MZ1 - 0.06], [9.0 - TAKE_X[1] - 0.9, 0.12, 0.06], { id: 'rail-front-c', role: 'body' }),
        ...[0.5, 2.2, 3.9, 6.4, 8.8].flatMap((x, k) => beltLegs(`leg${k}`, x, MZ0 + 0.05, MZ1 - 0.05)),
        box([7.6, 0.5, 2.25], [0.6, 0.38, 0.4], { id: 'drive', r: 0.05, role: 'ink' }),
        // Take-away belts and roll cages.
        ...TAKE_X.flatMap((x, t) => [
            box([x, BED_Y, MZ1], [0.9, BELT - BED_Y, TAKE_END - MZ1], { id: `take${t}-bed`, role: 'detail', decals: { top: [slots(0.08, 0.1, 15, 0.2, 0.74, 'h')] } }),
            box([x, BELT, MZ1], [0.06, 0.12, TAKE_END - MZ1], { id: `take${t}-rail-l`, role: 'body' }),
            box([x + 0.84, BELT, MZ1], [0.06, 0.12, TAKE_END - MZ1], { id: `take${t}-rail-r`, role: 'body' }),
            ...beltLegsZ(`take${t}-leg0`, 4.0, x + 0.05, x + 0.85),
            ...beltLegsZ(`take${t}-leg1`, 5.7, x + 0.05, x + 0.85),
            ...rollCage(`cage${t}`, x - 0.05, 6.05),
        ]),
        // Scanner arch.
        box([2.75, 0.2, 1.65], [0.5, 2.0, 0.3], { id: 'arch-post-b', role: 'body' }),
        box([2.75, 0.2, 2.95], [0.5, 2.0, 0.3], { id: 'arch-post-f', role: 'body', decals: { front: [slots(0.08, 0.2, 9, 0.12, 0.34, 'h'), { t: 'circle', cx: 0.25, cy: 1.75, r: 0.06, fill: 'ink' }] } }),
        box([2.65, 2.2, 1.65], [0.7, 0.4, 1.6], {
            id: 'arch-head', r: 0.04, role: 'face',
            decals: {
                right: [{ t: 'rect', x: 0.2, y: 0.1, w: 1.2, h: 0.2, r: 0.04, fill: 'ink' }, { t: 'circle', cx: 1.48, cy: 0.2, r: 0.04, fill: 'detail' }],
                front: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.5, h: 0.2, r: 0.04, fill: 'detail' }],
                top: [slots(0.15, 0.2, 5, 0.1, 1.2, 'v')],
            },
        }),
        // Parcels on the main belt.
        carton('parcel-a', [0.6, BELT, 2.15], [0.6, 0.45, 0.55], 'face'),
        box([1.5, BELT, 2.2], [0.75, 0.14, 0.5], { id: 'parcel-bag', r: 0.06, role: 'body', decals: { top: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2, r: 0.02, fill: 'face', stroke: 'soft' }] } }),
        carton('parcel-b', [2.75, BELT, 2.2], [0.5, 0.5, 0.5], 'detail'),
        cyl([3.7, BELT + 0.15, 2.45], 0.15, 0.9, { id: 'parcel-tube', axis: 'x', role: 'face', n: 18 }),
        carton('parcel-c', [6.1, BELT, 2.15], [0.6, 0.35, 0.6], 'detail'),
        carton('parcel-d', [8.25, BELT, 2.2], [0.6, 0.5, 0.5], 'face'),
        carton('parcel-e', [TAKE_X[0] + 0.2, BELT, 5.3], [0.5, 0.35, 0.45], 'detail'),
        carton('parcel-f', [TAKE_X[1] + 0.15, BELT, 3.4], [0.6, 0.4, 0.55], 'face'),
        box([TAKE_X[1] + 0.1, BELT, 4.5], [0.7, 0.14, 0.5], { id: 'parcel-bag2', r: 0.06, role: 'body' }),
        carton('parcel-g', [TAKE_X[1] + 0.2, BELT, 5.3], [0.5, 0.35, 0.45], 'detail'),
        // Pusher and the diverted parcel.
        box([5.25, 0.2, 1.25], [0.4, 0.9, 0.5], { id: 'pusher-stand', role: 'ink' }),
        box([5.05, BELT, 1.0], [0.8, 0.4, 0.9], { id: 'pusher-housing', r: 0.04, role: 'face', decals: { right: [slots(0.15, 0.1, 6, 0.1, 0.2, 'v')], top: [{ t: 'circle', cx: 0.15, cy: 0.15, r: 0.05, fill: 'ink' }] } }),
        cyl([5.45, 1.28, 1.9], 0.05, 0.1, { id: 'pusher-rod', axis: 'z', role: 'ink', group: 'rod', n: 12 }),
        box([5.08, 1.12, 2.0], [0.74, 0.36, 0.08], { id: 'pusher-paddle', r: 0.03, role: 'detail', group: 'paddle' }),
        box([5.12, BELT, 2.1], [0.66, 0.4, 0.62], {
            id: 'diverted', r: 0.03, role: 'accent', group: 'parcel',
            decals: { top: [{ t: 'rect', x: 0.28, y: 0, w: 0.1, h: 0.62, fill: 'face', stroke: 'soft' }], front: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.26, h: 0.16, r: 0.02, fill: 'face', stroke: 'soft' }, { t: 'segs', stroke: 'ink', segs: [[0.12, 0.11, 0.12, 0.21], [0.16, 0.11, 0.16, 0.21], [0.19, 0.11, 0.19, 0.21], [0.24, 0.11, 0.24, 0.21], [0.28, 0.11, 0.28, 0.21]] }] },
        }),
        // Induction desk behind the line.
        ...[[0.65, 0.95], [1.9, 0.95], [0.65, 1.55], [1.9, 1.55]].map(([x, z], k) => box([x, 0.2, z], [0.06, 0.65, 0.06], { id: `desk-leg${k}`, role: 'ink' })),
        box([0.6, 0.85, 0.9], [1.4, 0.08, 0.75], { id: 'desk-top', role: 'detail' }),
        box([0.75, 0.93, 1.0], [0.5, 0.35, 0.05], { id: 'monitor', r: 0.02, role: 'face', decals: { front: [{ t: 'rect', x: 0.03, y: 0.03, w: 0.44, h: 0.26, r: 0.02, fill: 'ink' }, ...textLines(0.08, 0.08, 0.3, [1, 0.6, 0.8], 0.06, 0.03, 'face')] } }),
        carton('desk-parcel', [1.45, 0.93, 1.05], [0.4, 0.3, 0.4], 'face'),
        // Operator console.
        box([1.0, 0.2, 4.1], [0.3, 1.1, 0.3], { id: 'console-post', role: 'ink' }),
        box([0.8, 1.3, 4.0], [0.7, 0.5, 0.5], {
            id: 'console', r: 0.05, role: 'face',
            decals: { front: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.4, h: 0.3, r: 0.03, fill: 'ink' }, ...textLines(0.12, 0.13, 0.3, [1, 0.6, 0.8], 0.07, 0.035, 'face'), ...grid(0.53, 0.1, 1, 3, 0.1, 0.07, 0.04, { fill: 'detail' })], right: [slots(0.1, 0.12, 4, 0.1, 0.26, 'v')] },
        }),
        cyl([1.35, 1.8, 4.15], 0.07, 0.06, { id: 'e-stop', role: 'ink', n: 14 }),
    ],
    motion: {
        duration: 3.8,
        label: 'the pusher diverts a parcel onto the take-away belt',
        tracks: [
            { group: 'paddle', t: [0, 0, 0.8], from: 0.1, to: 0.35, ease: 'inOut' },
            { group: 'rod', s: { k: [1, 1, 9], pivot: [5.45, 1.28, 1.9] }, from: 0.1, to: 0.35, ease: 'inOut' },
            { group: 'parcel', t: [0, 0, 0.8], from: 0.1, to: 0.35, ease: 'inOut' },
            { group: 'parcel', t: [0, 0, 1.7], from: 0.35, to: 0.85, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ loading dock */
const YD = 0.2, PLAT = 1.2, ROOF = 4.6, FZ0 = 1.7, FZ1 = 2.0, APRON = 2.6, DOCK_W = 9.4;
const DOORS = [1.0, 3.6, 6.2], DOOR_W = 1.8, DOOR_TOP = 3.65, TOFF = 1.4;
const doorDecals = (w, h) => [
    slots(0.04, 0.18, Math.floor((h - 0.2) / 0.18), 0.18, w - 0.08, 'h'),
    ...[0, 1, 2, 3].map((k) => ({ t: 'rect', x: 0.2 + k * ((w - 0.4) / 4), y: 0.85, w: (w - 0.4) / 4 - 0.08, h: 0.12, r: 0.02, fill: 'ink' })),
    { t: 'rect', x: 0, y: h - 0.1, w, h: 0.1, fill: 'ink' },
    { t: 'bar', x: w / 2 - 0.15, y: h - 0.3, w: 0.3, h: 0.05, fill: 'ink' },
];
function truck() {
    const z = (v) => v + TOFF, g = 'truck';
    const wheels = [3.55, 4.25, 6.75].flatMap((wz, k) => [
        cyl([3.78, 0.52, z(wz)], 0.32, 0.22, { id: `tw-l${k}`, axis: 'x', role: 'ink', group: g, n: 22 }),
        cyl([5.0, 0.52, z(wz)], 0.32, 0.22, { id: `tw-r${k}`, axis: 'x', role: 'ink', group: g, n: 22 }),
        cyl([5.22, 0.52, z(wz)], 0.13, 0.03, { id: `tw-hub${k}`, axis: 'x', role: 'face', group: g, n: 14 }),
    ]);
    return [
        box([3.75, 0.85, z(2.75)], [1.5, 2.25, 3.2], {
            id: 'cargo-box', r: 0.05, role: 'face', group: g,
            decals: {
                right: [slots(0.4, 0.08, 7, 0.4, 2.09, 'v'), { t: 'rect', x: 0.9, y: 0.7, w: 1.4, h: 0.5, r: 0.06, fill: 'detail', stroke: 'soft' }, ...textLines(1.05, 0.85, 1.1, [1, 0.6], 0.14, 0.07, 'face')],
                top: [slots(0.1, 0.2, 8, 0.4, 1.1, 'h')],
                front: [slots(0.3, 0.12, 3, 0.45, 0.06, 'v', true)],
            },
        }),
        box([4.05, 0.62, z(3.0)], [0.9, 0.23, 4.55], { id: 'truck-frame', role: 'ink', group: g }),
        box([3.8, 0.85, z(6.0)], [1.4, 1.7, 1.1], {
            id: 'truck-cab', r: 0.12, axis: 'x', role: 'body', group: g,
            decals: {
                front: [{ t: 'rect', x: 0.1, y: 0.12, w: 1.2, h: 0.6, r: 0.06, fill: 'ink' }],
                right: [{ t: 'rect', x: 0.1, y: 0.15, w: 0.65, h: 0.55, r: 0.05, fill: 'ink' }, { t: 'rect', x: 0.05, y: 0.1, w: 0.75, h: 1.45, r: 0.05, stroke: 'soft' }, { t: 'bar', x: 0.55, y: 0.85, w: 0.18, h: 0.05, fill: 'ink' }],
            },
        }),
        box([3.85, 0.85, z(7.1)], [1.3, 0.75, 0.45], {
            id: 'truck-hood', r: 0.08, axis: 'x', role: 'body', group: g,
            decals: { front: [slots(0.4, 0.12, 6, 0.1, 0.4, 'v'), { t: 'circle', cx: 0.18, cy: 0.3, r: 0.09, fill: 'face', stroke: 'soft' }, { t: 'circle', cx: 1.12, cy: 0.3, r: 0.09, fill: 'face', stroke: 'soft' }] },
        }),
        box([3.8, 0.6, z(7.55)], [1.4, 0.25, 0.12], { id: 'truck-bumper', r: 0.04, role: 'ink', group: g }),
        box([5.2, 1.7, z(6.95)], [0.12, 0.35, 0.06], { id: 'truck-mirror', role: 'ink', group: g }),
        ...wheels,
    ];
}
export const loadingDock = defineDrawing({
    id: 'loading-dock',
    name: 'Loading dock',
    category: 'logistics',
    tags: ['loading dock', 'truck', 'trailer', 'freight', 'shipping', 'receiving', 'dock door', 'yard', 'distribution center', 'trucking', 'ltl', 'logistics'],
    kind: 'scene',
    prompt: '/isometric create a distribution center loading dock with a box truck backing in and the dock door rolling up, for our yard management page',
    description: 'The front of a distribution center: a raised dock platform with three roll-up doors, dock seals, bumpers, signal lights and a dock light, a rooftop HVAC unit and steps up from the yard. A trailer is parked at the first door. A box truck reverses up to the middle dock, then the lit door rolls up to show pallets of cartons inside. A wrapped pallet waits by the third door.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [DOCK_W, YD, 9.4], {
            id: 'yard', role: 'face',
            decals: { top: [{ t: 'segs', stroke: 'soft', segs: [[3.15, 2.8, 3.15, 9.1], [5.85, 2.8, 5.85, 9.1], [0.4, 9.0, 9.0, 9.0]] }, ...grid(6.5, 6.0, 1, 5, 2.4, 0.18, 0.22, { fill: 'detail' })] },
        }),
        box([0, YD, 0], [DOCK_W, PLAT - YD, APRON], {
            id: 'platform', role: 'detail',
            decals: {
                front: [slots(1.0, 0.06, 9, 1.0, 0.88)],
                top: DOORS.flatMap((x) => [
                    { t: 'rect', x: x + 0.1, y: FZ1 + 0.04, w: DOOR_W - 0.2, h: APRON - FZ1 - 0.1, r: 0.03, fill: 'face', stroke: 'soft' },
                    ...grid(x + 0.2, FZ1 + 0.12, 8, 2, 0.12, 0.12, 0.08, { fill: 'detail', stroke: false, r: 0.02 }),
                ]),
            },
        }),
        // Building shell.
        box([0, PLAT, 0], [DOCK_W, ROOF - PLAT, 0.2], { id: 'interior', role: 'ink' }),
        box([0, PLAT, 0.2], [0.2, ROOF - PLAT, FZ0 - 0.2], { id: 'side-l', role: 'body' }),
        box([DOCK_W - 0.2, PLAT, 0.2], [0.2, ROOF - PLAT, FZ0 - 0.2], { id: 'side-r', role: 'body', decals: { right: [slots(0.15, 0.2, 7, 0.2, 3.0, 'v')] } }),
        ...[[0, DOORS[0]], [DOORS[0] + DOOR_W, DOORS[1]], [DOORS[1] + DOOR_W, DOORS[2]], [DOORS[2] + DOOR_W, DOCK_W]].map(([a, b], k) => box([a, PLAT, FZ0], [b - a, 3.6 - PLAT, FZ1 - FZ0], { id: `pier${k}`, role: 'body', decals: { front: [slots(0.1, 0.1, Math.floor((b - a - 0.1) / 0.2), 0.2, 2.2, 'v')], right: k === 3 ? [slots(0.05, 0.1, 2, 0.1, 2.2, 'v')] : [] } })),
        box([0, 3.6, FZ0], [DOCK_W, ROOF - 3.6, FZ1 - FZ0], {
            id: 'lintel', role: 'body',
            decals: { front: [slots(0.1, 0.1, 47, 0.2, 0.8, 'v'), { t: 'rect', x: 0.3, y: 0.25, w: 2.0, h: 0.5, r: 0.05, fill: 'face', stroke: 'soft' }, ...textLines(0.45, 0.38, 1.6, [1, 0.6], 0.14, 0.08, 'detail')] },
        }),
        box([0, ROOF, 0], [DOCK_W, 0.15, FZ1], { id: 'roof', role: 'detail', decals: { top: [{ t: 'rect', x: 0.15, y: 0.15, w: DOCK_W - 0.3, h: FZ1 - 0.3, r: 0.05, stroke: 'soft' }] } }),
        box([6.6, ROOF + 0.15, 0.4], [1.4, 0.55, 1.1], {
            id: 'hvac', r: 0.04, role: 'face',
            decals: { top: [{ t: 'circle', cx: 0.4, cy: 0.55, r: 0.28, fill: 'detail', stroke: true }, { t: 'circle', cx: 1.0, cy: 0.55, r: 0.28, fill: 'detail', stroke: true }], right: [slots(0.15, 0.1, 9, 0.1, 0.35, 'v')], front: [slots(0.15, 0.1, 12, 0.1, 0.35, 'v')] },
        }),
        cyl([2.0, ROOF + 0.15, 1.0], 0.2, 0.35, { id: 'roof-vent', role: 'detail', n: 20, decals: { top: [{ t: 'circle', cx: 0.2, cy: 0.2, r: 0.1, fill: 'ink' }] } }),
        // Goods inside the open door.
        pallet('inside-pallet', [DOORS[1] + 0.35, PLAT, 0.45], 1.0, 1.1),
        ...[0, 1].flatMap((k) => [0, 1].flatMap((i) => [0, 1].map((j) => carton(`inside-${k}${i}${j}`, [DOORS[1] + 0.36 + i * 0.5, PLAT + 0.15 + k * 0.4, 0.47 + j * 0.54], [0.48, 0.4, 0.52], (i + j + k) % 2 ? 'face' : 'detail')))),
        // Doors, seals, bumpers, lights.
        ...DOORS.map((x, k) => box([x - 0.05, PLAT, FZ1], [DOOR_W + 0.1, DOOR_TOP - PLAT, 0.06], {
            id: `door${k}`, role: k === 1 ? 'accent' : 'face', group: k === 1 ? 'door' : undefined,
            decals: { front: doorDecals(DOOR_W + 0.1, DOOR_TOP - PLAT) },
        })),
        box([DOORS[1] - 0.3, PLAT + 0.1, FZ1], [0.25, DOOR_TOP - PLAT - 0.1, 0.35], { id: 'seal-l', r: 0.05, role: 'ink' }),
        box([DOORS[1] + DOOR_W + 0.05, PLAT + 0.1, FZ1], [0.25, DOOR_TOP - PLAT - 0.1, 0.35], { id: 'seal-r', r: 0.05, role: 'ink' }),
        box([DOORS[1] - 0.3, DOOR_TOP, FZ1], [DOOR_W + 0.6, 0.35, 0.35], { id: 'seal-top', r: 0.05, role: 'ink' }),
        ...DOORS.flatMap((x, k) => [
            box([x + DOOR_W / 2 - 0.75, 0.7, APRON], [0.2, 0.4, 0.15], { id: `bumper${k}a`, r: 0.03, role: 'ink' }),
            box([x + DOOR_W / 2 + 0.55, 0.7, APRON], [0.2, 0.4, 0.15], { id: `bumper${k}b`, r: 0.03, role: 'ink' }),
            box([x + DOOR_W + 0.45, 1.6, FZ1], [0.22, 0.5, 0.08], {
                id: `signal${k}`, r: 0.03, role: 'ink',
                decals: { front: [{ t: 'circle', cx: 0.11, cy: 0.13, r: 0.06, fill: 'face' }, { t: 'circle', cx: 0.11, cy: 0.35, r: 0.06, fill: k === 1 ? 'accent' : 'detail' }] },
            }),
        ]),
        box([DOORS[1] + DOOR_W + 0.4, 3.0, FZ1], [0.3, 0.1, 0.35], { id: 'dock-light', r: 0.03, role: 'detail' }),
        ...[DOORS[1] - 0.25, DOORS[1] + DOOR_W + 0.25].map((x, k) => cyl([x, YD, 2.95], 0.1, 0.9, { id: `bollard${k}`, role: 'detail', n: 16, decals: { top: [{ t: 'circle', cx: 0.1, cy: 0.1, r: 0.05, fill: 'ink' }] } })),
        // Steps from the yard.
        ...[0, 1, 2, 3].map((k) => box([8.5, YD, APRON + k * 0.3], [0.8, PLAT - YD - k * 0.25, 0.3], { id: `step${k}`, role: 'face', decals: { top: [{ t: 'segs', stroke: 'soft', segs: [[0.05, 0.06, 0.75, 0.06]] }] } })),
        // Trailer at the first door.
        box([DOORS[0] + 0.15, 0.85, 2.75], [1.5, 2.25, 3.45], {
            id: 'trailer', r: 0.05, role: 'face',
            decals: { right: [slots(0.4, 0.08, 8, 0.4, 2.09, 'v')], top: [slots(0.1, 0.2, 9, 0.4, 1.3, 'h')], front: [{ t: 'rect', x: 0.1, y: 1.9, w: 1.3, h: 0.25, r: 0.03, fill: 'detail' }] },
        }),
        ...[3.4, 4.1].flatMap((wz, k) => [
            cyl([DOORS[0] + 0.18, 0.52, wz], 0.32, 0.22, { id: `trw-l${k}`, axis: 'x', role: 'ink', n: 22 }),
            cyl([DOORS[0] + 1.4, 0.52, wz], 0.32, 0.22, { id: `trw-r${k}`, axis: 'x', role: 'ink', n: 22 }),
        ]),
        box([DOORS[0] + 0.3, YD, 5.6], [0.08, 0.65, 0.12], { id: 'landing-leg-l', role: 'ink' }),
        box([DOORS[0] + 1.42, YD, 5.6], [0.08, 0.65, 0.12], { id: 'landing-leg-r', role: 'ink' }),
        // Wrapped pallet by the third door.
        pallet('yard-pallet', [6.5, YD, 3.4], 1.0, 1.1),
        box([6.53, YD + 0.15, 3.43], [0.94, 1.0, 1.04], { id: 'yard-wrap', r: 0.06, role: 'face', decals: { front: wrapLines(0.94, 1.0), right: wrapLines(1.04, 1.0) } }),
        ...truck(),
    ],
    motion: {
        duration: 4.4,
        label: 'the truck backs onto the dock and the door rolls up',
        tracks: [
            { group: 'truck', t: [0, 0, -TOFF], from: 0.05, to: 0.5, ease: 'inOut' },
            { group: 'door', s: { k: [1, 0.08, 1], pivot: [DOORS[1] + DOOR_W / 2, DOOR_TOP, FZ1] }, from: 0.55, to: 0.9, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------- last-mile delivery */
const SW = 0.35, LOCK = { x: 0.5, y: SW, z: 0.3, w: 4.2, h: 2.6, d: 0.9 };
const LOCKER_COLS = [[0.4, 0.4, 0.8, 0.8], [0.6, 0.6, 0.6, 0.6], [0.4, 0.4, 0.4, 0.6, 0.6], 'kiosk', [0.5, 0.5, 0.7, 0.7], [0.8, 0.8, 0.8], [0.4, 0.6, 0.6, 0.8]];
const OPEN = { col: 4, row: 1 };
function lockerFront() {
    const out = [];
    LOCKER_COLS.forEach((col, c) => {
        const x = c * 0.6;
        if (col === 'kiosk') {
            out.push({ t: 'rect', x: x + 0.03, y: 0.1, w: 0.54, h: 2.4, r: 0.03, fill: 'detail', stroke: true });
            out.push({ t: 'rect', x: x + 0.08, y: 0.35, w: 0.44, h: 0.55, r: 0.03, fill: 'ink' });
            out.push(...textLines(x + 0.14, 0.45, 0.3, [1, 0.6, 0.8], 0.1, 0.04, 'face'));
            out.push(...grid(x + 0.13, 1.05, 3, 3, 0.1, 0.08, 0.04, { fill: 'face' }));
            out.push({ t: 'rect', x: x + 0.13, y: 1.5, w: 0.34, h: 0.06, r: 0.02, fill: 'ink' });
            out.push({ t: 'rect', x: x + 0.1, y: 1.75, w: 0.4, h: 0.15, r: 0.02, fill: 'ink' });
            return;
        }
        let y = 0.1;
        col.forEach((h, r) => {
            if (c === OPEN.col && r === OPEN.row) {
                out.push({ t: 'rect', x: x + 0.03, y: y + 0.02, w: 0.54, h: h - 0.04, r: 0.02, fill: 'ink' });
                out.push({ t: 'rect', x: x + 0.12, y: y + h - 0.32, w: 0.32, h: 0.26, r: 0.02, fill: 'accent', stroke: 'soft' });
            }
            else {
                out.push({ t: 'rect', x: x + 0.03, y: y + 0.02, w: 0.54, h: h - 0.04, r: 0.02, fill: 'face', stroke: true });
                out.push({ t: 'bar', x: x + 0.4, y: y + h / 2 - 0.02, w: 0.1, h: 0.04, fill: 'ink' });
                out.push({ t: 'circle', cx: x + 0.12, cy: y + 0.1, r: 0.025, fill: 'detail' });
            }
            y += h;
        });
    });
    return out;
}
const OPEN_X = LOCK.x + OPEN.col * 0.6 + 0.03, OPEN_TOP = LOCK.y + LOCK.h - 0.6;
const PAD = { x: 6.6, z: 1.4 }, DRONE_Y = 4.0, DROP_Y = 2.6;
function drone() {
    const g = 'drone', { x, z } = PAD;
    const tips = [[x - 0.9, z], [x + 0.9, z], [x, z - 0.9], [x, z + 0.9]];
    return [
        box([x - 0.35, DRONE_Y, z - 0.35], [0.7, 0.25, 0.7], { id: 'drone-body', r: 0.1, role: 'body', group: g, decals: { front: [{ t: 'circle', cx: 0.35, cy: 0.14, r: 0.06, fill: 'ink' }], top: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.4, h: 0.4, r: 0.06, stroke: 'soft' }] } }),
        box([x - 0.95, DRONE_Y + 0.1, z - 0.05], [0.6, 0.06, 0.1], { id: 'arm-l', role: 'ink', group: g }),
        box([x + 0.35, DRONE_Y + 0.1, z - 0.05], [0.6, 0.06, 0.1], { id: 'arm-r', role: 'ink', group: g }),
        box([x - 0.05, DRONE_Y + 0.1, z - 0.95], [0.1, 0.06, 0.6], { id: 'arm-b', role: 'ink', group: g }),
        box([x - 0.05, DRONE_Y + 0.1, z + 0.35], [0.1, 0.06, 0.6], { id: 'arm-f', role: 'ink', group: g }),
        ...tips.flatMap(([tx, tz], k) => [
            cyl([tx, DRONE_Y + 0.16, tz], 0.07, 0.1, { id: `motor${k}`, role: 'ink', group: g, n: 12 }),
            cyl([tx, DRONE_Y + 0.26, tz], 0.32, 0.02, { id: `rotor${k}`, role: 'face', group: g, n: 28, decals: { top: [{ t: 'segs', stroke: 'soft', segs: [[0.04, 0.32, 0.6, 0.32]] }] } }),
        ]),
        box([x - 0.3, DRONE_Y - 0.25, z - 0.3], [0.06, 0.25, 0.6], { id: 'skid-l', role: 'ink', group: g }),
        box([x + 0.24, DRONE_Y - 0.25, z - 0.3], [0.06, 0.25, 0.6], { id: 'skid-r', role: 'ink', group: g }),
        box([x - 0.015, DRONE_Y - 0.45, z - 0.015], [0.03, 0.45, 0.03], { id: 'tether', role: 'ink', group: g }),
        carton('drone-parcel', [x - 0.25, DRONE_Y - 0.85, z - 0.25], [0.5, 0.4, 0.5], 'detail', g),
    ];
}
export const lastMile = defineDrawing({
    id: 'last-mile-delivery',
    name: 'Last-mile delivery',
    category: 'logistics',
    tags: ['last mile', 'delivery', 'parcel locker', 'pickup point', 'drone', 'drone delivery', 'van', 'courier', 'e-commerce', 'shipping', 'tracking', 'logistics'],
    kind: 'scene',
    prompt: '/isometric create a last-mile delivery scene: a parcel locker bank on the sidewalk, a delivery van and a drone landing a parcel, for our delivery tracking page',
    description: 'A street corner for last-mile delivery: a bank of parcel lockers with a touchscreen kiosk under a canopy on the sidewalk, a courier hand truck stacked with parcels, a landing pad where a quadcopter drone lowers its parcel, a delivery van parked on the street with a crosswalk, a street lamp, bollards and a planter. The lit locker door swings open to reveal the parcel waiting inside.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9.0, 0.2, 7.4], {
            id: 'street', role: 'detail',
            decals: { top: [...grid(1.0, 3.1, 1, 7, 1.6, 0.3, 0.25, { fill: 'face' }), { t: 'segs', stroke: 'face', width: 2, segs: Array.from({ length: 8 }, (_, k) => [3.0 + k * 0.75, 6.4, 3.4 + k * 0.75, 6.4]) }] },
        }),
        box([0, 0.2, 0], [9.0, SW - 0.2, 2.8], {
            id: 'sidewalk', role: 'face',
            decals: { top: [{ t: 'segs', stroke: 'soft', segs: [...Array.from({ length: 14 }, (_, k) => [0.6 * (k + 1), 0, 0.6 * (k + 1), 2.8]), [0, 1.4, 9.0, 1.4]] }] },
        }),
        // Parcel lockers.
        box([LOCK.x, LOCK.y, LOCK.z], [LOCK.w, LOCK.h, LOCK.d], { id: 'lockers', r: 0.03, role: 'body', decals: { front: lockerFront(), right: [slots(0.15, 0.3, 6, 0.1, 2.0, 'v')] } }),
        box([LOCK.x - 0.1, LOCK.y + LOCK.h, 0.2], [LOCK.w + 0.2, 0.12, 1.2], { id: 'canopy', r: 0.04, role: 'detail', decals: { front: [{ t: 'rect', x: 1.6, y: 0.03, w: 1.2, h: 0.06, r: 0.02, fill: 'face' }] } }),
        box([OPEN_X, OPEN_TOP - 0.48, LOCK.z + LOCK.d], [0.54, 0.46, 0.04], {
            id: 'locker-door', r: 0.02, role: 'accent', group: 'door',
            decals: { front: [{ t: 'bar', x: 0.37, y: 0.21, w: 0.1, h: 0.04, fill: 'ink' }, { t: 'circle', cx: 0.09, cy: 0.08, r: 0.025, fill: 'face' }] },
        }),
        // Courier hand truck.
        cyl([0.9, SW + 0.12, 1.62], 0.12, 0.1, { id: 'ht-wheel-l', axis: 'x', role: 'ink', n: 14 }),
        cyl([1.6, SW + 0.12, 1.62], 0.12, 0.1, { id: 'ht-wheel-r', axis: 'x', role: 'ink', n: 14 }),
        box([1.0, SW, 1.6], [0.6, 1.45, 0.05], { id: 'ht-frame', role: 'detail', decals: { front: [slots(0.1, 0.05, 5, 0.1, 1.35, 'v')] } }),
        box([1.0, SW + 1.45, 1.6], [0.6, 0.06, 0.05], { id: 'ht-handle', r: 0.02, role: 'ink' }),
        box([1.0, SW, 1.65], [0.6, 0.04, 0.35], { id: 'ht-toe', role: 'ink' }),
        carton('ht-parcel0', [1.04, SW + 0.04, 1.67], [0.52, 0.4, 0.32], 'face'),
        carton('ht-parcel1', [1.08, SW + 0.44, 1.68], [0.44, 0.35, 0.3], 'detail'),
        carton('ht-parcel2', [1.1, SW + 0.79, 1.7], [0.4, 0.25, 0.26], 'face'),
        // Landing pad and drone.
        cyl([PAD.x, SW, PAD.z], 0.75, 0.05, {
            id: 'pad', role: 'detail', n: 40,
            decals: { top: [{ t: 'circle', cx: 0.75, cy: 0.75, r: 0.62, stroke: true }, { t: 'rect', x: 0.52, y: 0.5, w: 0.08, h: 0.5, fill: 'face' }, { t: 'rect', x: 0.9, y: 0.5, w: 0.08, h: 0.5, fill: 'face' }, { t: 'rect', x: 0.6, y: 0.71, w: 0.3, h: 0.08, fill: 'face' }] },
        }),
        ...drone(),
        // Street furniture.
        ...[5.4, 7.8].map((x, k) => cyl([x, SW, 2.5], 0.09, 0.6, { id: `bollard${k}`, role: 'ink', n: 14 })),
        cyl([8.5, SW, 2.3], 0.06, 3.4, { id: 'lamp-post', role: 'ink', n: 12 }),
        box([7.9, SW + 3.4, 2.25], [0.66, 0.08, 0.1], { id: 'lamp-arm', role: 'ink' }),
        box([7.7, SW + 3.25, 2.15], [0.45, 0.15, 0.3], { id: 'lamp-head', r: 0.04, role: 'face' }),
        box([8.0, SW, 0.2], [0.8, 0.4, 0.8], { id: 'planter', r: 0.04, role: 'detail' }),
        cyl([8.4, SW + 0.4, 0.6], 0.06, 0.4, { id: 'tree-trunk', role: 'ink', n: 10 }),
        cone([8.4, SW + 0.8, 0.6], 0.4, 1.0, { id: 'tree', role: 'face', n: 28 }),
        // Delivery van.
        box([4.4, 0.5, 3.6], [3.2, 1.8, 1.4], {
            id: 'van-body', r: 0.15, axis: 'x', role: 'face',
            decals: {
                front: [
                    { t: 'rect', x: 0, y: 0.8, w: 3.2, h: 0.2, fill: 'detail' },
                    { t: 'rect', x: 1.9, y: 0.12, w: 0.95, h: 1.55, r: 0.04, stroke: 'soft' },
                    { t: 'rect', x: 2.0, y: 0.2, w: 0.75, h: 0.45, r: 0.04, fill: 'ink' },
                    { t: 'rect', x: 0.3, y: 0.2, w: 1.4, h: 0.45, r: 0.04, fill: 'ink' },
                    { t: 'bar', x: 2.55, y: 1.15, w: 0.2, h: 0.05, fill: 'ink' },
                    ...textLines(0.3, 1.12, 1.2, [1, 0.6], 0.16, 0.08, 'soft'),
                ],
                top: [slots(0.3, 0.15, 7, 0.4, 1.1, 'v')],
            },
        }),
        box([7.6, 0.5, 3.65], [0.75, 0.95, 1.3], {
            id: 'van-hood', r: 0.12, axis: 'z', role: 'face',
            decals: { right: [slots(0.4, 0.4, 6, 0.1, 0.25, 'v'), { t: 'circle', cx: 0.18, cy: 0.3, r: 0.09, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 1.12, cy: 0.3, r: 0.09, fill: 'detail', stroke: 'soft' }, { t: 'rect', x: 0.05, y: 0.72, w: 1.2, h: 0.15, r: 0.03, fill: 'ink' }] },
        }),
        prism([0, 0, 3.65], [[7.6, 1.45], [8.2, 1.45], [7.6, 2.15]], 1.3, { id: 'van-windshield', axis: 'z', role: 'ink' }),
        box([7.55, 1.5, 5.0], [0.08, 0.25, 0.12], { id: 'van-mirror', role: 'ink' }),
        ...[5.1, 7.75].flatMap((x, k) => [
            cyl([x, 0.5, 5.0], 0.3, 0.12, { id: `van-wheel-f${k}`, axis: 'z', role: 'ink', n: 22 }),
            cyl([x, 0.5, 5.12], 0.13, 0.02, { id: `van-hub${k}`, axis: 'z', role: 'face', n: 14 }),
            cyl([x, 0.5, 3.48], 0.3, 0.12, { id: `van-wheel-b${k}`, axis: 'z', role: 'ink', n: 22 }),
        ]),
    ],
    motion: {
        duration: 4.2,
        label: 'a drone lowers a parcel to the pad and a locker door swings open',
        tracks: [
            { group: 'drone', t: [0, -DROP_Y, 0], from: 0.05, to: 0.6, ease: 'inOut' },
            { group: 'door', r: { axis: 'y', deg: -100, pivot: [OPEN_X, 0, LOCK.z + LOCK.d] }, from: 0.45, to: 0.9, ease: 'inOut' },
        ],
    },
});
