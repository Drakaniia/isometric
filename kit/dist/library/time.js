/**
 * Time scenes: a town clock tower with a swinging bell, an open clockwork
 * movement with a meshed gear train and escapement, and an orrery with planets
 * on arms around an armillary sun. Project timeline and station live in time-b.
 */
import { defineDrawing, box, cyl, cone, ball, prism, slots, grid, tickRing, gearProfile } from '../build.js';
const CREATED = '2026-11-14';
/* ---------------------------------------------------------- shared parts */
/** A clock dial in the face frame of a disc of radius r: rim and 60 minute ticks. */
export const dialDecals = (r) => [
    { t: 'circle', cx: r, cy: r, r: r - 0.04, stroke: true },
    tickRing(r, r, r - 0.08, 60, 5, 0.13),
];
/**
 * Hour and minute hands as real boxes lying on a dial, set to 10:10. `c` is the dial
 * centre, `plane` the coordinate of the dial's visible face (z for 'front', x for 'right').
 * Groups are `h-<tag>` and `m-<tag>` so a track can sweep them.
 */
export function clockHands(side, c, plane, tag, hl = 0.42, ml = 0.62) {
    const hDeg = -305, mDeg = -60;
    if (side === 'front') {
        const pivot = [c[0], c[1], plane];
        return [
            box([c[0] - 0.05, c[1], plane], [0.1, hl, 0.04], { id: `hour-${tag}`, role: 'accent', group: `h-${tag}`, rot: [{ axis: 'z', deg: hDeg, pivot }] }),
            box([c[0] - 0.035, c[1], plane + 0.04], [0.07, ml, 0.04], { id: `minute-${tag}`, role: 'accent', group: `m-${tag}`, rot: [{ axis: 'z', deg: mDeg, pivot }] }),
            cyl([c[0], c[1], plane + 0.08], 0.07, 0.04, { id: `pin-${tag}`, axis: 'z', role: 'ink', n: 14 }),
        ];
    }
    const pivot = [plane, c[1], c[2]];
    return [
        box([plane, c[1], c[2] - 0.05], [0.04, hl, 0.1], { id: `hour-${tag}`, role: 'accent', group: `h-${tag}`, rot: [{ axis: 'x', deg: hDeg, pivot }] }),
        box([plane + 0.04, c[1], c[2] - 0.035], [0.04, ml, 0.07], { id: `minute-${tag}`, role: 'accent', group: `m-${tag}`, rot: [{ axis: 'x', deg: mDeg, pivot }] }),
        cyl([plane + 0.08, c[1], c[2]], 0.07, 0.04, { id: `pin-${tag}`, axis: 'x', role: 'ink', n: 14 }),
    ];
}
export function clockTracks(side, c, plane, tag) {
    const axis = side === 'front' ? 'z' : 'x';
    const pivot = side === 'front' ? [c[0], c[1], plane] : [plane, c[1], c[2]];
    return [
        { group: `m-${tag}`, r: { axis, deg: -360, pivot }, mode: 'loop' },
        { group: `h-${tag}`, r: { axis, deg: -30, pivot }, mode: 'loop' },
    ];
}
/** A spiral line in a face frame (hairspring, mainspring). */
const spiral = (cx, cy, r0, r1, turns) => {
    const pts = [];
    const n = Math.round(turns * 14);
    for (let i = 0; i <= n; i++) {
        const t = i / n, a = t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return { t: 'line', pts, stroke: 'soft' };
};
/** A C-shaped hoop (a ring with a small gap at the bottom) as a closed outline. */
const hoop = (cx, cy, ro, ri, n = 40) => {
    const a0 = -Math.PI / 2 + 0.07, a1 = a0 + Math.PI * 2 - 0.14;
    const out = [];
    for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        out.push([cx + Math.cos(a) * ro, cy + Math.sin(a) * ro]);
    }
    for (let i = n; i >= 0; i--) {
        const a = a0 + ((a1 - a0) * i) / n;
        out.push([cx + Math.cos(a) * ri, cy + Math.sin(a) * ri]);
    }
    return out;
};
/* ---------------------------------------------------------- clock tower */
const PY = 0.2;
const TX = 3.6, TZ = 2.4, TW = 2.0; // shaft footprint
const CX = TX + TW / 2, CZ = TZ + TW / 2; // tower axis (4.6, 3.4)
const Y0 = PY + 0.24, SHAFT = 2.6, Y1 = Y0 + SHAFT; // shaft top 3.04
const Y2 = Y1 + 0.16; // clock stage base
const STAGE = 1.9, Y3 = Y2 + STAGE + 0.16; // belfry floor
const DIAL = { r: 0.75, y: Y2 + STAGE / 2 };
const FRONT_Z = TZ - 0.05 + 2.1; // z of the clock stage front face
const RIGHT_X = TX - 0.05 + 2.1; // x of the clock stage right face
const DC_F = [CX, DIAL.y, FRONT_Z], DC_R = [RIGHT_X, DIAL.y, CZ];
const bench = (id, x, z) => [
    box([x, PY + 0.45, z], [1.4, 0.4, 0.08], { id: `${id}-back`, role: 'detail', decals: { front: [slots(0.1, 0.08, 7, 0.19, 0.24, 'v')] } }),
    box([x, PY + 0.35, z + 0.08], [1.4, 0.08, 0.4], { id: `${id}-seat`, role: 'face' }),
    box([x + 0.12, PY, z + 0.12], [0.1, 0.35, 0.3], { id: `${id}-leg1`, role: 'ink' }),
    box([x + 1.18, PY, z + 0.12], [0.1, 0.35, 0.3], { id: `${id}-leg2`, role: 'ink' }),
];
const lamp = (id, x, z) => [
    cyl([x, PY, z], 0.09, 0.1, { id: `${id}-foot`, role: 'detail', n: 12 }),
    cyl([x, PY + 0.1, z], 0.04, 1.6, { id: `${id}-post`, role: 'ink', n: 10 }),
    cyl([x, PY + 1.7, z], 0.14, 0.26, { id: `${id}-head`, role: 'face', n: 16, r2: 0.18 }),
    cone([x, PY + 1.96, z], 0.2, 0.14, { id: `${id}-cap`, role: 'ink', n: 16 }),
];
const tree = (id, x, z, k = 1) => [
    cyl([x, PY, z], 0.12 * k, 0.9 * k, { id: `${id}-trunk`, role: 'ink', n: 10 }),
    ball([x, PY + 1.45 * k, z], 0.72 * k, { id: `${id}-crown`, role: 'face' }),
    ball([x + 0.38 * k, PY + 1.95 * k, z - 0.15 * k], 0.46 * k, { id: `${id}-crown2`, role: 'detail' }),
];
const SD = { x: 7.3, z: 5.7 }; // sundial
const SD_TOP = PY + 0.84;
const SPIRE = Y3 + 1.1 + 0.14 + 1.3; // base of the finial
export const clockTower = defineDrawing({
    id: 'clock-tower',
    name: 'Clock tower',
    category: 'time',
    tags: ['clock tower', 'town hall', 'clock', 'bell', 'time', 'hours', 'schedule', 'punctual', 'landmark', 'sundial', 'plaza', 'heritage', 'timekeeping'],
    kind: 'scene',
    prompt: '/isometric create a town square with a clock tower, bell and sundial, for the "on time, every time" section of our scheduling page',
    description: 'A town square with a stone clock tower beside a town hall. The tower has an arched door, a clock stage with a dial on each visible side, an open belfry with a hanging bell and a stepped spire. A sundial, benches, lamp posts and trees stand on the paving. Both clock faces show ten past ten; the hands sweep round and the bell swings.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9, PY, 7.5], {
            id: 'plaza', role: 'face',
            decals: { top: [slots(0, 0, 13, 0.75, 7.5, 'v'), slots(0, 0, 11, 0.75, 9, 'h'), { t: 'circle', cx: SD.x, cy: SD.z, r: 1.05, stroke: true, fill: 'bg' }, { t: 'circle', cx: SD.x, cy: SD.z, r: 0.9, stroke: 'soft' }] },
        }),
        // Town hall to the left of the tower.
        box([0.4, PY, 0.8], [3.2, 2.2, 3.2], {
            id: 'hall', role: 'face',
            decals: {
                front: [
                    ...grid(0.1, 0.28, 5, 1, 0.4, 0.62, 0.3, { fill: 'ink', stroke: true, r: 0.12 }),
                    ...grid(0.1, 1.2, 5, 1, 0.4, 0.62, 0.3, { fill: 'ink', stroke: true, r: 0.12, skip: (c) => c === 2 }),
                    { t: 'rect', x: 1.3, y: 1.3, w: 0.6, h: 0.9, r: 0.28, fill: 'ink' },
                    { t: 'rect', x: 0, y: 0.98, w: 3.2, h: 0.06, fill: 'detail', stroke: 'soft' },
                ],
            },
        }),
        prism([0.3, 0, 0], [[0.6, PY + 2.2], [4.2, PY + 2.2], [2.4, PY + 3.2]], 3.3, { id: 'hall-roof', axis: 'x', role: 'detail', decals: undefined }),
        box([1.25, PY, 4.0], [0.9, 0.1, 0.35], { id: 'hall-step', role: 'detail' }),
        // Tower plinth, shaft and cornice.
        box([3.3, PY, 2.1], [2.6, 0.12, 2.6], { id: 'plinth-1', role: 'detail' }),
        box([3.45, PY + 0.12, 2.25], [2.3, 0.12, 2.3], { id: 'plinth-2', role: 'face' }),
        box([TX, Y0, TZ], [TW, SHAFT, TW], {
            id: 'shaft', role: 'body',
            decals: {
                front: [
                    slots(0, 0.45, 6, 0.4, TW, 'h'),
                    { t: 'rect', x: 0.7, y: 1.5, w: 0.6, h: 1.1, r: 0.28, fill: 'ink' },
                    { t: 'rect', x: 0.75, y: 0.5, w: 0.5, h: 0.32, r: 0.04, fill: 'face', stroke: 'soft' },
                ],
                right: [slots(0, 0.45, 6, 0.4, TW, 'h'), { t: 'rect', x: 0.85, y: 0.6, w: 0.3, h: 1.3, r: 0.12, fill: 'ink' }],
            },
        }),
        box([3.45, Y1, 2.25], [2.3, 0.16, 2.3], { id: 'cornice-1', role: 'detail' }),
        // Clock stage with a dial on each visible face.
        box([TX - 0.05, Y2, TZ - 0.05], [2.1, STAGE, 2.1], {
            id: 'clock-stage', role: 'body',
            decals: {
                front: [{ t: 'rect', x: 0.08, y: 0.08, w: 1.94, h: STAGE - 0.16, r: 0.05, stroke: 'soft' }],
                right: [{ t: 'rect', x: 0.08, y: 0.08, w: 1.94, h: STAGE - 0.16, r: 0.05, stroke: 'soft' }],
            },
        }),
        cyl(DC_F, DIAL.r, 0.08, { id: 'dial-front', axis: 'z', role: 'face', n: 48, decals: { front: dialDecals(DIAL.r) } }),
        cyl(DC_R, DIAL.r, 0.08, { id: 'dial-right', axis: 'x', role: 'face', n: 48, decals: { right: dialDecals(DIAL.r) } }),
        ...clockHands('front', DC_F, FRONT_Z + 0.08, 'f'),
        ...clockHands('right', DC_R, RIGHT_X + 0.08, 'r'),
        box([3.45, Y2 + STAGE, 2.25], [2.3, 0.16, 2.3], { id: 'cornice-2', role: 'detail' }),
        // Open belfry: corner posts, parapets, beams and the hanging bell.
        ...[[TX - 0.05, TZ - 0.05], [TX + 1.75, TZ - 0.05], [TX - 0.05, TZ + 1.75], [TX + 1.75, TZ + 1.75]].map(([x, z], k) => box([x, Y3, z], [0.3, 1.1, 0.3], { id: `belfry-post${k}`, role: 'face', decals: { front: [slots(0.07, 0.1, 3, 0.07, 0.9)], right: [slots(0.07, 0.1, 3, 0.07, 0.9)] } })),
        box([TX + 0.25, Y3, TZ + 1.8], [1.5, 0.3, 0.1], { id: 'parapet-f', role: 'detail', decals: { front: [slots(0.1, 0.06, 8, 0.18, 0.18, 'v')] } }),
        box([TX + 1.8, Y3, TZ + 0.25], [0.1, 0.3, 1.5], { id: 'parapet-r', role: 'detail', decals: { right: [slots(0.1, 0.06, 8, 0.18, 0.18, 'v')] } }),
        box([TX + 0.25, Y3, TZ - 0.05], [1.5, 0.3, 0.1], { id: 'parapet-b', role: 'detail' }),
        box([TX - 0.05, Y3, TZ + 0.25], [0.1, 0.3, 1.5], { id: 'parapet-l', role: 'detail' }),
        box([TX + 0.25, Y3 + 0.86, TZ + 1.75], [1.5, 0.24, 0.3], { id: 'beam-f', role: 'face' }),
        box([TX + 0.25, Y3 + 0.86, TZ - 0.05], [1.5, 0.24, 0.3], { id: 'beam-b', role: 'face' }),
        box([TX - 0.05, Y3 + 0.86, TZ + 0.25], [0.3, 0.24, 1.5], { id: 'beam-l', role: 'face' }),
        box([TX + 1.75, Y3 + 0.86, TZ + 0.25], [0.3, 0.24, 1.5], { id: 'beam-r', role: 'face' }),
        box([TX + 0.25, Y3 + 0.86, CZ - 0.1], [1.5, 0.24, 0.2], { id: 'yoke', role: 'ink' }),
        box([CX - 0.05, Y3 + 0.78, CZ - 0.05], [0.1, 0.08, 0.1], { id: 'hanger', role: 'ink', group: 'bell' }),
        cyl([CX, Y3 + 0.12, CZ], 0.34, 0.66, { id: 'bell', r2: 0.12, n: 28, role: 'detail', group: 'bell', decals: undefined }),
        ball([CX, Y3 + 0.16, CZ], 0.07, { id: 'clapper', role: 'ink', group: 'bell' }),
        // Roof: a stepped spire with a finial.
        box([3.4, Y3 + 1.1, 2.2], [2.4, 0.14, 2.4], { id: 'roof-slab', role: 'detail' }),
        ...[2.0, 1.6, 1.2, 0.8, 0.4].map((w, k) => box([CX - w / 2, Y3 + 1.24 + k * 0.26, CZ - w / 2], [w, 0.26, w], { id: `spire-${k}`, role: k % 2 ? 'face' : 'body', decals: k < 3 ? { front: [slots(0.1, 0.07, 1, 0.1, 0.12, 'h')] } : undefined })),
        cone([CX, SPIRE, CZ], 0.14, 0.8, { id: 'finial', n: 14, role: 'ink' }),
        ball([CX, SPIRE + 0.88, CZ], 0.1, { id: 'finial-ball', role: 'detail' }),
        // Sundial on the paving.
        cyl([SD.x, PY, SD.z], 0.32, 0.64, { id: 'sundial-stem', r2: 0.22, n: 20, role: 'detail' }),
        cyl([SD.x, PY + 0.64, SD.z], 0.7, 0.2, { id: 'sundial-plate', n: 40, role: 'face', decals: { top: [{ t: 'circle', cx: 0.7, cy: 0.7, r: 0.66, stroke: true }, tickRing(0.7, 0.7, 0.62, 24, 2, 0.13), { t: 'segs', stroke: true, segs: [[0.7, 0.7, 0.2, 0.95]] }] } }),
        prism([SD.x - 0.02, 0, 0], [[SD.z - 0.35, SD_TOP], [SD.z - 0.35, SD_TOP + 0.42], [SD.z + 0.1, SD_TOP]], 0.04, { id: 'gnomon', axis: 'x', role: 'ink' }),
        // Street furniture.
        ...bench('bench-a', 0.9, 5.2),
        ...bench('bench-b', 3.2, 6.2),
        ...bench('bench-c', 5.9, 1.6),
        ...lamp('lamp-a', 5.2, 5.2),
        ...lamp('lamp-b', 2.5, 4.6),
        ...lamp('lamp-c', 8.3, 4.3),
        ...tree('tree-a', 8.0, 1.5),
        ...tree('tree-b', 1.0, 6.5, 0.9),
        cyl([6.5, PY, 4.3], 0.16, 0.45, { id: 'bin', role: 'detail', n: 14, decals: { top: [{ t: 'circle', cx: 0.16, cy: 0.16, r: 0.11, stroke: 'soft' }] } }),
    ],
    motion: {
        duration: 8,
        label: 'the clock hands sweep round and the bell swings',
        tracks: [
            ...clockTracks('front', DC_F, FRONT_Z + 0.08, 'f'),
            ...clockTracks('right', DC_R, RIGHT_X + 0.08, 'r'),
            { group: 'bell', r: { axis: 'z', deg: 13, pivot: [CX, Y3 + 0.86, CZ] }, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------- clockwork movement */
const TC = 0.34; // a tooth's centre as a fraction of the pitch angle (see gearProfile)
const GP = 0.05; // pitch radius per tooth
/** A gear with its pitch circle fixed by tooth count; `tooth`/`gap` is the world angle (deg) at which it presents a tooth tip/gap, so meshed pairs interleave. */
function cog(n, c, z, t, o) {
    const p = n * GP, step = 360 / n;
    const deg = o.tooth !== undefined ? o.tooth - TC * step : (o.gap ?? 0) - (TC + 0.5) * step;
    return prism([0, 0, z], gearProfile(n, p + 0.08, p - 0.08, c[0], c[1]), t, { id: o.id, axis: 'z', role: o.role, group: o.group, rot: [{ axis: 'z', deg, pivot: [c[0], c[1], z] }] });
}
const hub = (id, c, z, r = 0.14, role = 'ink', h = 0.06) => cyl([c[0], c[1], z], r, h, { id, axis: 'z', role, n: 20 });
const polar = (c, d, deg) => [c[0] + d * Math.cos((deg * Math.PI) / 180), c[1] + d * Math.sin((deg * Math.PI) / 180)];
const GA = [2.2, 3.1]; // barrel (24)
const GB = polar(GA, (24 + 16) * GP, 12); // second wheel (16) with its pinion (8)
const GC = polar(GB, (8 + 20) * GP, -32); // third wheel (20) with its pinion (10)
const GE = polar(GC, (10 + 15) * GP, 75); // escape wheel (15)
const AP = [GE[0], 5.1]; // anchor pivot
const BAL = [7.3, 4.4]; // balance wheel
const Z1 = 1.15, Z2 = 1.45, Z3 = 1.75, Z4 = 1.95;
const ANCHOR = [
    [-0.52, -0.38], [-0.29, -0.42], [0, -0.08], [0.29, -0.42], [0.52, -0.38], [0.21, 0.2], [0.11, 0.5], [-0.11, 0.5], [-0.21, 0.2],
].map(([u, v]) => [AP[0] + u, AP[1] + v]);
const stripes = slots(0.3, 0.3, 38, 0.2, 4.8, 'v');
const screwDecals = (px, py) => [{ t: 'circle', cx: px, cy: py, r: 0.11, stroke: true, fill: 'detail' }, { t: 'segs', stroke: true, segs: [[px - 0.07, py - 0.03, px + 0.07, py + 0.03]] }];
const toPlate = (c) => [c[0] - 0.5, 5.7 - c[1]];
export const clockwork = defineDrawing({
    id: 'clockwork-movement',
    name: 'Clockwork movement',
    category: 'time',
    tags: ['clockwork', 'movement', 'gears', 'watch', 'mechanism', 'escapement', 'balance wheel', 'time', 'precision', 'engineering', 'horology', 'cogs', 'how it works', 'automation'],
    kind: 'scene',
    prompt: '/isometric create an open watch movement on a bench: a gear train from the mainspring barrel to the escapement and balance wheel, for the "precision under the hood" section',
    description: 'An open mechanical movement standing on a watchmaker\'s bench. A striped plate carries a mainspring barrel with a ratchet wheel, a second and third wheel with pinions, an escape wheel, a rocking anchor and a hairspring balance wheel. The gears are layered and their teeth interleave where they mesh. Spare gears, a coil spring, a screwdriver, tweezers, a loupe and an oil bottle lie on the bench. The wheels turn at their true tooth ratios while the anchor and balance rock.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9, 0.3, 4.4], { id: 'bench', role: 'detail', r: 0.06, decals: { top: [{ t: 'rect', x: 0.2, y: 1.7, w: 8.6, h: 2.5, r: 0.06, stroke: 'soft' }] } }),
        box([0.5, 0.3, 0.9], [8, 5.4, 0.25], {
            id: 'plate', role: 'face', r: 0.2, axis: 'z',
            decals: {
                front: [
                    stripes,
                    { t: 'rect', x: 0.12, y: 0.12, w: 7.76, h: 5.16, r: 0.14, stroke: true },
                    ...screwDecals(0.4, 0.4), ...screwDecals(7.6, 0.4), ...screwDecals(0.4, 5.0), ...screwDecals(7.6, 5.0),
                    ...[GA, GB, GC, GE].map((c) => ({ t: 'circle', cx: toPlate(c)[0], cy: toPlate(c)[1], r: 0.2, fill: 'detail', stroke: true })),
                ],
            },
        }),
        // Mainspring barrel, its cover and the ratchet wheel (one group).
        cog(24, GA, Z1, 0.2, { id: 'barrel-gear', role: 'detail', group: 'a', tooth: 12 }),
        cyl([GA[0], GA[1], Z1 + 0.2], 0.95, 0.06, { id: 'barrel-cover', axis: 'z', role: 'face', n: 40, group: 'a', decals: { front: [{ t: 'circle', cx: 0.95, cy: 0.95, r: 0.9, stroke: true }, spiral(0.95, 0.95, 0.15, 0.8, 3.2)] } }),
        cog(12, GA, Z1 + 0.26, 0.14, { id: 'ratchet', role: 'body', group: 'a', tooth: 90 }),
        hub('barrel-hub', GA, Z1 + 0.4, 0.16),
        box([GA[0] - 0.12, GA[1] + 0.62, Z1 + 0.26], [0.45, 0.1, 0.14], { id: 'click', role: 'ink', rot: [{ axis: 'z', deg: 8, pivot: [GA[0], GA[1] + 0.62, Z1 + 0.3] }] }),
        // Second wheel and pinion.
        cog(16, GB, Z1, 0.2, { id: 'wheel-b', role: 'face', group: 'b', gap: 12 + 180 }),
        cyl([GB[0], GB[1], Z1 + 0.2], 0.12, 0.1, { id: 'arbor-b', axis: 'z', role: 'ink', n: 12 }),
        cog(8, GB, Z2, 0.2, { id: 'pinion-b', role: 'detail', group: 'b', tooth: -32 }),
        hub('cap-b', GB, Z2 + 0.2, 0.26, 'face', 0.08),
        // Third wheel and pinion.
        cog(20, GC, Z2, 0.2, { id: 'wheel-c', role: 'body', group: 'c', gap: -32 + 180 }),
        cyl([GC[0], GC[1], Z2 + 0.2], 0.12, 0.1, { id: 'arbor-c', axis: 'z', role: 'ink', n: 12 }),
        cog(10, GC, Z3, 0.2, { id: 'pinion-c', role: 'detail', group: 'c', tooth: 75 }),
        hub('cap-c', GC, Z3 + 0.2, 0.24, 'face', 0.08),
        // Escape wheel and the rocking anchor.
        cog(15, GE, Z3, 0.2, { id: 'escape-wheel', role: 'face', group: 'e', gap: 75 + 180 }),
        hub('cap-e', GE, Z3 + 0.2, 0.12, 'ink', 0.05),
        prism([0, 0, Z4], ANCHOR, 0.12, { id: 'anchor', axis: 'z', role: 'ink', group: 'anchor' }),
        cyl([AP[0], AP[1], Z4 + 0.12], 0.12, 0.08, { id: 'anchor-pivot', axis: 'z', role: 'face', n: 16 }),
        // Hairspring balance wheel: the accent.
        cyl([BAL[0], BAL[1], Z3], 0.8, 0.1, {
            id: 'balance', axis: 'z', role: 'accent', n: 48, group: 'balance',
            decals: {
                front: [
                    { t: 'circle', cx: 0.8, cy: 0.8, r: 0.62, fill: 'bg', stroke: true },
                    { t: 'segs', stroke: true, segs: [[0.2, 0.8, 1.4, 0.8], [0.8, 0.2, 0.8, 1.4]] },
                    ...[0, 1, 2, 3].map((k) => ({ t: 'circle', cx: 0.8 + Math.cos((k * Math.PI) / 2 + 0.6) * 0.71, cy: 0.8 + Math.sin((k * Math.PI) / 2 + 0.6) * 0.71, r: 0.055, fill: 'ink' })),
                    spiral(0.8, 0.8, 0.1, 0.5, 3),
                ],
            },
        }),
        hub('balance-stud', BAL, Z3 + 0.1, 0.12, 'ink', 0.05),
        // Winding crown on the plate edge.
        cyl([8.5, 2.6, 1.025], 0.4, 0.5, { id: 'crown', axis: 'x', role: 'detail', n: 28, decals: { right: [{ t: 'circle', cx: 0.4, cy: 0.4, r: 0.3, stroke: 'soft' }, tickRing(0.4, 0.4, 0.36, 18, 3, 0.1)] } }),
        // Bench tools and spares.
        prism([0, 0.3, 0], gearProfile(14, 0.78, 0.62, 2.0, 3.0), 0.08, { id: 'spare-gear', axis: 'y', role: 'detail' }),
        prism([0, 0.3, 0], gearProfile(9, 0.48, 0.36, 3.7, 3.4), 0.08, { id: 'spare-pinion', axis: 'y', role: 'face' }),
        cyl([5.2, 0.3, 3.1], 0.5, 0.12, { id: 'coil', n: 36, role: 'face', decals: { top: [spiral(0.5, 0.5, 0.06, 0.42, 3.2)] } }),
        cyl([6.5, 0.4, 2.5], 0.1, 0.75, { id: 'driver-handle', axis: 'z', role: 'body', n: 14 }),
        cyl([6.5, 0.4, 3.25], 0.03, 0.9, { id: 'driver-shaft', axis: 'z', role: 'ink', n: 8 }),
        box([7.55, 0.3, 2.2], [0.05, 0.04, 1.3], { id: 'tweezer-a', role: 'ink', rot: [{ axis: 'y', deg: 3, pivot: [7.55, 0.3, 2.2] }] }),
        box([7.62, 0.3, 2.2], [0.05, 0.04, 1.3], { id: 'tweezer-b', role: 'ink', rot: [{ axis: 'y', deg: -3, pivot: [7.62, 0.3, 2.2] }] }),
        cyl([7.7, 0.3, 3.5], 0.42, 0.05, { id: 'loupe', n: 32, role: 'glass' }),
        box([7.45, 0.3, 3.88], [0.1, 0.05, 0.55], { id: 'loupe-handle', role: 'ink' }),
        cyl([1.1, 0.3, 3.5], 0.2, 0.34, { id: 'oil-bottle', role: 'glass', n: 18 }),
        cone([1.1, 0.64, 3.5], 0.1, 0.16, { id: 'oil-cap', role: 'ink', n: 14 }),
    ],
    motion: {
        duration: 8,
        label: 'the wheels turn and the balance wheel rocks',
        tracks: [
            { group: 'a', r: { axis: 'z', deg: 360, pivot: [GA[0], GA[1], Z1] }, mode: 'loop' },
            { group: 'b', r: { axis: 'z', deg: -360 * (24 / 16), pivot: [GB[0], GB[1], Z1] }, mode: 'loop' },
            { group: 'c', r: { axis: 'z', deg: 360 * (24 / 16) * (8 / 20), pivot: [GC[0], GC[1], Z1] }, mode: 'loop' },
            { group: 'e', r: { axis: 'z', deg: -360 * (24 / 16) * (8 / 20) * (10 / 15), pivot: [GE[0], GE[1], Z1] }, mode: 'loop' },
            { group: 'anchor', r: { axis: 'z', deg: 11, pivot: [AP[0], AP[1], Z4] }, ease: 'inOut' },
            { group: 'balance', r: { axis: 'z', deg: 75, pivot: [BAL[0], BAL[1], Z3] }, ease: 'inOut' },
        ],
    },
});
/* ---------------------------------------------------------------- orrery */
const TOP = 1.28, OX = 3.5, OZ = 3.7, OR = 2.6;
const BT = TOP + 0.45, GT = BT + 0.9; // base top, gearbox top
const COLUMN_TOP = 5.0, SUN_Y = COLUMN_TOP + 1.15;
const PLANETS = [
    { id: 'mercury', L: 0.85, r: 0.18, y: 3.0, ang: 20, turns: 4, role: 'ink' },
    { id: 'venus', L: 1.25, r: 0.26, y: 3.45, ang: 110, turns: 3, role: 'face' },
    { id: 'earth', L: 1.7, r: 0.3, y: 3.9, ang: 200, turns: 2, role: 'body' },
    { id: 'jupiter', L: 2.15, r: 0.42, y: 4.35, ang: 290, turns: 1, role: 'detail' },
];
const book = (id, at, size, role) => box(at, size, { id, role, r: 0.03, decals: { front: [{ t: 'rect', x: 0.12, y: 0.04, w: 0.08, h: size[1] - 0.08, fill: 'ink' }, { t: 'rect', x: size[0] - 0.25, y: 0.04, w: 0.08, h: size[1] - 0.08, fill: 'ink' }], right: [slots(0.1, 0.04, 5, 0.22, size[1] - 0.08, 'v')] } });
export const orrery = defineDrawing({
    id: 'orrery',
    name: 'Orrery',
    category: 'time',
    tags: ['orrery', 'planets', 'solar system', 'astronomy', 'orbit', 'calendar', 'seasons', 'year', 'time', 'cycle', 'recurring', 'subscription', 'astrolabe', 'telescope'],
    kind: 'scene',
    prompt: '/isometric create a brass orrery on a study table with a telescope and astrolabe, for the "everything runs on a cycle" section of our recurring-billing page',
    description: 'A study table carrying a round orrery. A dial base marked with a date ring and orbit lines holds a gear case and a column; four planets on arms at different heights circle a sun that hangs inside a spinning armillary hoop, and a hand crank on the base front drives them. Beside it stand a telescope on two cradles, a stack of books with an astrolabe on top, and a candle. The planets circle at different speeds as the hoop and crank turn.',
    createdAt: CREATED,
    parts: [
        // Table.
        box([0, TOP - 0.18, 0], [9.4, 0.18, 7.4], { id: 'table-top', role: 'face', r: 0.04, decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 9.0, h: 7.0, r: 0.06, stroke: 'soft' }], front: [{ t: 'rect', x: 0.4, y: 0.05, w: 8.6, h: 0.08, fill: 'detail' }] } }),
        ...[[0.4, 0.4], [8.6, 0.4], [0.4, 6.5], [8.6, 6.5]].map(([x, z], k) => box([x, 0, z], [0.4, TOP - 0.18, 0.4], { id: `table-leg${k}`, role: 'detail', decals: { front: [slots(0.1, 0.1, 3, 0.1, 0.9, 'v')] } })),
        box([0.8, 0.9, 6.6], [7.8, 0.2, 0.2], { id: 'apron-f', role: 'detail' }),
        box([8.7, 0.9, 0.8], [0.2, 0.2, 5.7], { id: 'apron-r', role: 'detail' }),
        // The orrery base, gear case and column.
        cyl([OX, TOP, OZ], OR, 0.45, {
            id: 'orrery-base', n: 72, role: 'face',
            decals: {
                top: [
                    { t: 'circle', cx: OR, cy: OR, r: OR - 0.1, stroke: true },
                    tickRing(OR, OR, OR - 0.12, 120, 10, 0.2),
                    { t: 'circle', cx: OR, cy: OR, r: OR - 0.4, stroke: 'soft' },
                    ...PLANETS.map((p) => ({ t: 'circle', cx: OR, cy: OR, r: p.L, stroke: 'soft' })),
                ],
            },
        }),
        cyl([OX, BT, OZ], 0.85, 0.9, { id: 'gear-case', n: 40, role: 'detail', decals: { top: [{ t: 'circle', cx: 0.85, cy: 0.85, r: 0.78, stroke: true }, tickRing(0.85, 0.85, 0.74, 36, 3, 0.12)] } }),
        cyl([OX, GT, OZ], 0.13, COLUMN_TOP - GT, { id: 'column', n: 14, role: 'ink' }),
        // The sun inside a spinning armillary hoop.
        ball([OX, SUN_Y, OZ], 0.6, { id: 'sun', role: 'accent' }),
        prism([0, 0, OZ - 0.04], hoop(OX, SUN_Y, 1.15, 1.06), 0.08, { id: 'hoop', axis: 'z', role: 'detail', group: 'hoop' }),
        box([OX - 1.06, SUN_Y - 0.03, OZ - 0.03], [0.46, 0.06, 0.06], { id: 'pin-l', role: 'ink', group: 'hoop' }),
        box([OX + 0.6, SUN_Y - 0.03, OZ - 0.03], [0.46, 0.06, 0.06], { id: 'pin-r', role: 'ink', group: 'hoop' }),
        // Planets on arms of increasing height.
        ...PLANETS.flatMap((p) => {
            const rot = [{ axis: 'y', deg: p.ang, pivot: [OX, p.y, OZ] }];
            const out = [
                box([OX + 0.13, p.y - 0.045, OZ - 0.05], [p.L - 0.13 - p.r, 0.09, 0.1], { id: `${p.id}-arm`, role: 'ink', group: p.id, rot }),
                ball([OX + p.L, p.y, OZ], p.r, { id: p.id, role: p.role, group: p.id, rot }),
            ];
            if (p.id === 'earth') {
                out.push(box([OX + p.L + p.r - 0.02, p.y - 0.012, OZ - 0.012], [0.3, 0.024, 0.024], { id: 'moon-rod', role: 'ink', group: p.id, rot }), ball([OX + p.L + p.r + 0.37, p.y, OZ], 0.09, { id: 'moon', role: 'face', group: p.id, rot }));
            }
            return out;
        }),
        // Crank on the base front.
        cyl([OX, TOP + 0.28, OZ + OR], 0.07, 0.35, { id: 'crank-stem', axis: 'z', role: 'ink', n: 12 }),
        box([OX - 0.04, TOP + 0.28, OZ + OR + 0.35], [0.08, 0.28, 0.06], { id: 'crank-arm', role: 'detail', group: 'crank' }),
        cyl([OX, TOP + 0.56, OZ + OR + 0.35], 0.08, 0.2, { id: 'crank-knob', axis: 'z', role: 'face', n: 12, group: 'crank' }),
        // Telescope on two cradles.
        box([8.0, TOP, 1.3], [0.8, 0.5, 0.12], { id: 'cradle-1', role: 'detail', r: 0.04 }),
        box([8.0, TOP, 3.0], [0.8, 0.55, 0.12], { id: 'cradle-2', role: 'detail', r: 0.04 }),
        cyl([8.4, TOP + 0.74, 0.7], 0.24, 1.6, { id: 'tube-1', axis: 'z', role: 'body', n: 24 }),
        cyl([8.4, TOP + 0.74, 2.3], 0.19, 1.3, { id: 'tube-2', axis: 'z', role: 'face', n: 24 }),
        cyl([8.4, TOP + 0.74, 3.6], 0.14, 1.0, { id: 'tube-3', axis: 'z', role: 'detail', n: 24 }),
        cyl([8.4, TOP + 0.74, 0.62], 0.28, 0.08, { id: 'tube-rim', axis: 'z', role: 'ink', n: 24 }),
        // Books with an astrolabe, and a candle.
        book('book-1', [6.7, TOP, 5.0], [1.9, 0.22, 1.3], 'detail'),
        book('book-2', [6.8, TOP + 0.22, 5.05], [1.75, 0.2, 1.2], 'face'),
        book('book-3', [6.75, TOP + 0.42, 5.0], [1.8, 0.18, 1.25], 'body'),
        cyl([7.65, TOP + 0.6, 5.65], 0.55, 0.07, { id: 'astrolabe', n: 40, role: 'face', decals: { top: [{ t: 'circle', cx: 0.55, cy: 0.55, r: 0.5, stroke: true }, tickRing(0.55, 0.55, 0.47, 36, 3, 0.08), { t: 'circle', cx: 0.55, cy: 0.55, r: 0.28, stroke: 'soft' }, { t: 'segs', stroke: 'soft', segs: [[0.1, 0.55, 1.0, 0.55], [0.55, 0.1, 0.55, 1.0], [0.2, 0.2, 0.9, 0.9]] }] } }),
        cyl([1.0, TOP, 5.7], 0.3, 0.08, { id: 'candle-dish', n: 20, role: 'detail' }),
        cyl([1.0, TOP + 0.08, 5.7], 0.12, 0.6, { id: 'candle', n: 14, role: 'face' }),
        cone([1.0, TOP + 0.68, 5.7], 0.07, 0.2, { id: 'flame', n: 10, role: 'detail' }),
    ],
    motion: {
        duration: 14,
        label: 'the planets circle the sun at different speeds',
        tracks: [
            ...PLANETS.map((p) => ({ group: p.id, r: { axis: 'y', deg: 360 * p.turns, pivot: [OX, p.y, OZ] }, mode: 'loop' })),
            { group: 'hoop', r: { axis: 'y', deg: 360, pivot: [OX, SUN_Y, OZ] }, mode: 'loop' },
            { group: 'crank', r: { axis: 'z', deg: 360 * 4, pivot: [OX, TOP + 0.28, OZ + OR + 0.35] }, mode: 'loop' },
        ],
    },
});
