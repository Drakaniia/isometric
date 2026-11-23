/**
 * Communication scenes: a satellite ground station, a cell tower, a video
 * call on a desk monitor, a curbside mailbox and an office desk phone.
 */
import { defineDrawing, box, cbox, cyl, cone, ball, prism, grid, slots, textLines, tickRing } from '../build.js';
const CREATED = '2026-11-13';
const rad = (deg) => (deg * Math.PI) / 180;
/** An annular arc in a 2D profile plane, centred on (cu, cv), angles in degrees. */
function arc(cu, cv, r0, r1, a0, a1, n = 12) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const a = rad(a0 + ((a1 - a0) * i) / n);
        pts.push([cu + Math.cos(a) * r1, cv + Math.sin(a) * r1]);
    }
    for (let i = n; i >= 0; i--) {
        const a = rad(a0 + ((a1 - a0) * i) / n);
        pts.push([cu + Math.cos(a) * r0, cv + Math.sin(a) * r0]);
    }
    return pts;
}
/** Spokes from a centre, as one segs decal. */
const spokes = (cx, cy, r0, r1, n, off = 0) => ({
    t: 'segs', stroke: 'soft',
    segs: Array.from({ length: n }, (_, i) => {
        const a = rad(off + (i * 360) / n);
        return [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1];
    }),
});
/* ----------------------------------------------------------- satellite uplink */
const SU = { w: 9.0, h: 0.3, d: 6.6 };
const PED = { x: 3.0, z: 2.4 };
const PIV = [PED.x, 3.2, PED.z];
const TILT = 38;
const TILT_ROT = [{ axis: 'x', deg: TILT, pivot: PIV }];
const DIR = [0, Math.cos(rad(TILT)), Math.sin(rad(TILT))];
/** A point `t` along the dish axis from the pivot. */
const along = (t) => [PIV[0], PIV[1] + DIR[1] * t, PIV[2] + DIR[2] * t];
const DISH = { y: 3.5, r0: 0.55, r1: 2.3, h: 0.75 };
const RIM_Y = DISH.y + DISH.h;
const FEED_Y = 5.4;
const STRUT = { r: 1.95, len: Math.hypot(1.95, FEED_Y - RIM_Y) - 0.06, deg: (Math.atan2(1.95, FEED_Y - RIM_Y) * 180) / Math.PI };
const PACKET = { t0: 3.3, step: 1.0, n: 5, r: 0.11 };
const SAT = along(9.2);
/** A strut from a rim point to the feed: tilt toward the axis, then tilt with the dish. */
const strut = (k) => {
    const [dx, dz, axis, sign] = [[1, 0, 'z', 1], [-1, 0, 'z', -1], [0, 1, 'x', -1], [0, -1, 'x', 1]][k];
    const at = [PED.x + dx * STRUT.r, RIM_Y, PED.z + dz * STRUT.r];
    return cyl(at, 0.045, STRUT.len, { id: `strut${k}`, role: 'ink', n: 8, bias: 2, rot: [{ axis, deg: sign * STRUT.deg, pivot: at }, ...TILT_ROT] });
};
const dishFace = [
    ...[1.95, 1.5, 1.05].map((r) => ({ t: 'circle', cx: DISH.r1, cy: DISH.r1, r, stroke: 'soft' })),
    spokes(DISH.r1, DISH.r1, 0.42, 2.18, 12, 15),
    { t: 'circle', cx: DISH.r1, cy: DISH.r1, r: 0.4, fill: 'detail', stroke: true },
];
const solarPanel = (x, id) => box([x, SAT[1] - 0.04, SAT[2] - 0.55], [2.0, 0.08, 1.1], {
    id, role: 'ink',
    decals: { top: [{ t: 'segs', stroke: 'face', width: 0.7, segs: [...[0.4, 0.8, 1.2, 1.6].map((u) => [u, 0.06, u, 1.04]), [0.06, 0.55, 1.94, 0.55]] }] },
});
export const satelliteUplink = defineDrawing({
    id: 'satellite-uplink',
    name: 'Satellite ground station',
    category: 'communication',
    tags: ['satellite', 'dish', 'antenna', 'uplink', 'ground station', 'broadcast', 'telecom', 'space', 'signal', 'radome', 'network', 'orbit'],
    kind: 'scene',
    prompt: '/isometric create a satellite ground station with a big dish beaming data up to a satellite, for our connectivity page',
    description: 'A ground station pad with a large tilted parabolic dish on a pedestal, four struts holding its feed horn, a radome on a drum, a fuel tank, cable trays and an equipment hut with a rooftop dish and air conditioner. Data packets stream from the feed up the dish axis to a satellite with two solar wings overhead.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [SU.w, SU.h, SU.d], {
            id: 'pad', r: 0.15, role: 'face',
            decals: {
                top: [
                    { t: 'rect', x: 0.2, y: 0.2, w: SU.w - 0.4, h: SU.d - 0.4, r: 0.12, stroke: 'soft' },
                    { t: 'circle', cx: PED.x, cy: PED.z, r: 1.35, stroke: 'soft' },
                    tickRing(PED.x, PED.z, 1.35, 24, 3, 0.14),
                    { t: 'segs', segs: [[5.6, 6.15, 8.5, 6.15], [6.45, 2.7, 6.45, 3.55]], stroke: 'soft' },
                    ...[0, 1, 2, 3, 4].map((k) => ({ t: 'line', pts: [[5.75 + k * 0.5, 6.4], [5.95 + k * 0.5, 6.2]], stroke: 'soft' })),
                ],
            },
        }),
        // Pedestal, yoke head and ball joint.
        cbox(PED.x, SU.h, PED.z, [1.7, 0.3, 1.7], {
            id: 'ped-base', r: 0.08, role: 'detail',
            decals: { top: [0.2, 1.5].flatMap((u) => [0.2, 1.5].map((v) => ({ t: 'circle', cx: u, cy: v, r: 0.07, fill: 'ink' }))) },
        }),
        cyl([PED.x, 0.6, PED.z], 0.42, 1.75, { id: 'column', n: 28 }),
        cbox(PED.x, 2.35, PED.z, [1.15, 0.55, 1.15], {
            id: 'head', r: 0.1,
            decals: { front: [slots(0.25, 0.15, 5, 0.12, 0.25, 'v'), { t: 'rect', x: 0.8, y: 0.14, w: 0.22, h: 0.28, r: 0.03, stroke: 'soft' }] },
        }),
        cyl([PED.x + 0.575, 2.62, PED.z], 0.2, 0.16, { id: 'motor', axis: 'x', role: 'detail', n: 20 }),
        ball(PIV, 0.3, { id: 'joint', role: 'detail' }),
        // The dish, its struts, feed horn and LNB.
        cyl([PED.x, DISH.y, PED.z], DISH.r0, DISH.h, { id: 'dish', r2: DISH.r1, n: 48, role: 'face', rot: TILT_ROT, decals: { top: dishFace } }),
        ...[0, 1, 2, 3].map(strut),
        cyl([PED.x, FEED_Y, PED.z], 0.3, 0.35, { id: 'horn', r2: 0.15, n: 20, role: 'detail', bias: 3, rot: TILT_ROT }),
        cbox(PED.x, FEED_Y + 0.35, PED.z, [0.32, 0.3, 0.32], { id: 'lnb', r: 0.06, role: 'accent', bias: 3, rot: TILT_ROT }),
        // Packets on the beam.
        ...Array.from({ length: PACKET.n }, (_, k) => ball(along(PACKET.t0 + k * PACKET.step), PACKET.r, { id: `packet${k}`, role: 'accent', group: 'packets' })),
        // Satellite.
        cbox(SAT[0], SAT[1] - 0.5, SAT[2], [0.9, 1.0, 0.9], {
            id: 'sat-body', r: 0.06, role: 'body',
            decals: {
                front: [{ t: 'rect', x: 0.12, y: 0.12, w: 0.66, h: 0.76, r: 0.04, stroke: 'soft' }, ...textLines(0.22, 0.3, 0.46, [1, 0.7, 0.85], 0.16, 0.05, 'soft')],
                right: [slots(0.2, 0.25, 4, 0.15, 0.5, 'v')],
                top: [{ t: 'circle', cx: 0.45, cy: 0.45, r: 0.2, stroke: 'soft' }],
            },
        }),
        cyl([SAT[0], SAT[1] + 0.5, SAT[2]], 0.03, 0.45, { id: 'sat-mast', role: 'ink', n: 8 }),
        ball([SAT[0], SAT[1] + 1.0, SAT[2]], 0.07, { id: 'sat-tip', role: 'accent' }),
        cyl([SAT[0], SAT[1] - 0.85, SAT[2]], 0.36, 0.35, { id: 'sat-dish', r2: 0.12, role: 'detail', n: 24 }),
        cyl([SAT[0] - 0.85, SAT[1], SAT[2]], 0.05, 0.4, { id: 'arm-l', axis: 'x', role: 'ink', n: 8 }),
        cyl([SAT[0] + 0.45, SAT[1], SAT[2]], 0.05, 0.4, { id: 'arm-r', axis: 'x', role: 'ink', n: 8 }),
        solarPanel(SAT[0] - 2.85, 'panel-l'),
        solarPanel(SAT[0] + 0.85, 'panel-r'),
        // Radome on its drum, with a whip antenna.
        cyl([7.4, SU.h, 1.6], 0.75, 0.18, { id: 'drum', n: 40, role: 'detail' }),
        cyl([7.4, SU.h + 0.18, 1.6], 0.45, 0.3, { id: 'collar', n: 28, role: 'detail' }),
        ball([7.4, SU.h + 0.48 + 0.95, 1.6], 0.95, { id: 'radome', role: 'face' }),
        cyl([6.15, SU.h, 0.55], 0.05, 1.9, { id: 'whip', role: 'ink', n: 8 }),
        ball([6.15, SU.h + 1.97, 0.55], 0.07, { id: 'whip-tip', role: 'detail' }),
        // Fuel tank on saddles.
        ...[0.75, 1.75].map((x, k) => box([x, SU.h, 0.65], [0.2, 0.25, 0.7], { id: `saddle${k}`, role: 'detail' })),
        cyl([0.5, SU.h + 0.25 + 0.35, 1.0], 0.35, 1.7, { id: 'tank', axis: 'x', n: 28, decals: { right: [{ t: 'circle', cx: 0.35, cy: 0.35, r: 0.18, stroke: 'soft' }] } }),
        // Cable trays from the pedestal to the hut.
        box([PED.x + 0.85, SU.h, 2.25], [0.95, 0.1, 0.3], { id: 'tray0', role: 'detail', decals: { top: [slots(0.12, 0.05, 7, 0.12, 0.2, 'v')] } }),
        box([4.8, SU.h, 2.25], [0.3, 0.1, 1.75], { id: 'tray1', role: 'detail', decals: { top: [slots(0.05, 0.15, 12, 0.12, 0.2, 'h')] } }),
        box([5.1, SU.h, 3.7], [0.5, 0.1, 0.3], { id: 'tray2', role: 'detail' }),
        // Equipment hut.
        box([5.6, SU.h, 3.7], [2.9, 2.0, 2.3], {
            id: 'hut', r: 0.04,
            decals: {
                front: [
                    { t: 'rect', x: 0.3, y: 0.5, w: 0.78, h: 1.45, r: 0.04, fill: 'face', stroke: true },
                    { t: 'circle', cx: 0.95, cy: 1.25, r: 0.05, fill: 'ink' },
                    { t: 'rect', x: 0.42, y: 0.65, w: 0.54, h: 0.22, r: 0.03, stroke: 'soft' },
                    { t: 'rect', x: 1.4, y: 0.5, w: 1.15, h: 0.62, r: 0.05, fill: 'ink' },
                    { t: 'segs', segs: [[1.975, 0.5, 1.975, 1.12]], stroke: 'face' },
                    slots(1.45, 1.45, 7, 0.15, 0.32, 'v'),
                    { t: 'rect', x: 0.4, y: 0.18, w: 0.6, h: 0.16, r: 0.03, fill: 'detail' },
                ],
                right: [slots(0.3, 0.45, 9, 0.18, 1.1, 'v'), { t: 'rect', x: 0.2, y: 0.3, w: 1.9, h: 1.4, r: 0.06, stroke: 'soft' }],
            },
        }),
        box([5.5, SU.h + 2.0, 3.6], [3.1, 0.12, 2.5], { id: 'roof', r: 0.04, role: 'detail' }),
        box([7.3, SU.h + 2.12, 3.85], [0.9, 0.45, 0.8], {
            id: 'ac', r: 0.05, role: 'face',
            decals: { top: [{ t: 'circle', cx: 0.45, cy: 0.4, r: 0.3, stroke: true }, spokes(0.45, 0.4, 0.06, 0.28, 5)], front: [slots(0.12, 0.1, 6, 0.12, 0.25, 'h')] },
        }),
        cyl([6.2, SU.h + 2.12, 4.6], 0.05, 0.45, { id: 'mini-pole', role: 'ink', n: 8 }),
        cyl([6.2, SU.h + 2.57, 4.6], 0.1, 0.18, { id: 'mini-dish', r2: 0.55, n: 32, role: 'face', rot: [{ axis: 'x', deg: 32, pivot: [6.2, SU.h + 2.57, 4.6] }], decals: { top: [{ t: 'circle', cx: 0.55, cy: 0.55, r: 0.32, stroke: 'soft' }, { t: 'circle', cx: 0.55, cy: 0.55, r: 0.08, fill: 'ink' }] } }),
    ],
    motion: {
        duration: 1.6,
        label: 'data packets stream up to the satellite',
        tracks: [{ group: 'packets', t: [0, DIR[1] * PACKET.step, DIR[2] * PACKET.step], mode: 'loop', ease: 'linear' }],
    },
});
/* ------------------------------------------------------------------ cell tower */
const CT = { w: 7.2, h: 0.3, d: 6.6 };
const TW = { x: 2.6, z: 2.6, w: 1.2, lt: 0.12, y0: 0.55, bay: 1.15, bays: 6 };
const TOPY = TW.y0 + TW.bay * TW.bays; // 7.45
const TX0 = TW.x - TW.w / 2, TX1 = TW.x + TW.w / 2 - TW.lt;
const TZ0 = TW.z - TW.w / 2, TZ1 = TW.z + TW.w / 2 - TW.lt;
const BR = 0.08; // brace thickness
const PLAT = { y: TOPY - 1.1, half: 1.3, bar: 0.1 };
const PANEL = { h: 1.5, w: 0.42, t: 0.16 };
const WAVE = { y: PLAT.y + 0.15, radii: [2.1, 2.6, 3.1], th: 0.1 };
const towerFrame = () => {
    const parts = [];
    const H = TOPY - TW.y0;
    for (const [x, z, k] of [[TX0, TZ0, 0], [TX1, TZ0, 1], [TX0, TZ1, 2], [TX1, TZ1, 3]]) {
        parts.push(box([x, TW.y0, z], [TW.lt, H, TW.lt], { id: `leg${k}`, role: 'detail' }));
    }
    const span = TW.w - 2 * TW.lt;
    for (let b = 1; b <= TW.bays; b++) {
        const y = TW.y0 + b * TW.bay - (b === TW.bays ? BR : BR / 2);
        parts.push(box([TX0 + TW.lt, y, TZ1], [span, BR, TW.lt], { id: `bf${b}`, role: 'detail' }));
        parts.push(box([TX0 + TW.lt, y, TZ0], [span, BR, TW.lt], { id: `bb${b}`, role: 'detail' }));
        parts.push(box([TX0, y, TZ0 + TW.lt], [TW.lt, BR, span], { id: `bl${b}`, role: 'detail' }));
        parts.push(box([TX1, y, TZ0 + TW.lt], [TW.lt, BR, span], { id: `br${b}`, role: 'detail' }));
    }
    // Zigzag diagonals in every bay on all four faces.
    for (let b = 0; b < TW.bays; b++) {
        const ya = TW.y0 + b * TW.bay + (b === 0 ? 0 : BR / 2);
        const yb = TW.y0 + (b + 1) * TW.bay - (b + 1 === TW.bays ? BR : BR / 2);
        const flip = b % 2 === 1;
        const u0 = flip ? span : 0, u1 = flip ? 0 : span, dw = flip ? -0.14 : 0.14;
        const prof = (o) => [[o + u0, ya], [o + u0 + dw, ya], [o + u1, yb], [o + u1 - dw, yb]];
        const t = TW.lt * 0.5;
        parts.push(prism([0, 0, TZ1 + TW.lt * 0.25], flip ? prof(TX0 + TW.lt).reverse() : prof(TX0 + TW.lt), t, { id: `df${b}`, axis: 'z', role: 'detail' }));
        parts.push(prism([0, 0, TZ0 + TW.lt * 0.25], flip ? prof(TX0 + TW.lt) : prof(TX0 + TW.lt).reverse(), t, { id: `db${b}`, axis: 'z', role: 'detail' }));
        parts.push(prism([TX1 + TW.lt * 0.25, 0, 0], flip ? prof(TZ0 + TW.lt).reverse() : prof(TZ0 + TW.lt), t, { id: `dr${b}`, axis: 'x', role: 'detail' }));
        parts.push(prism([TX0 + TW.lt * 0.25, 0, 0], flip ? prof(TZ0 + TW.lt) : prof(TZ0 + TW.lt).reverse(), t, { id: `dl${b}`, axis: 'x', role: 'detail' }));
    }
    return parts;
};
const platform = () => {
    const { y, half, bar } = PLAT;
    const x0 = TW.x - half, x1 = TW.x + half, z0 = TW.z - half, z1 = TW.z + half;
    const stub = half - TW.w / 2;
    return [
        box([x0, y, z1 - bar], [2 * half, bar, bar], { id: 'ring-f', role: 'ink' }),
        box([x0, y, z0], [2 * half, bar, bar], { id: 'ring-b', role: 'ink' }),
        box([x0, y, z0 + bar], [bar, bar, 2 * half - 2 * bar], { id: 'ring-l', role: 'ink' }),
        box([x1 - bar, y, z0 + bar], [bar, bar, 2 * half - 2 * bar], { id: 'ring-r', role: 'ink' }),
        // Stubs from the legs out to the ring.
        ...[TX0, TX1].map((x, k) => box([x + 0.01, y, TW.z + TW.w / 2], [TW.lt - 0.02, bar, stub - bar], { id: `stub-f${k}`, role: 'ink' })),
        ...[TZ0, TZ1].map((z, k) => box([TW.x + TW.w / 2, y, z + 0.01], [stub - bar, bar, TW.lt - 0.02], { id: `stub-r${k}`, role: 'ink' })),
        ...[TZ0, TZ1].map((z, k) => box([x0 + bar, y, z + 0.01], [stub - bar, bar, TW.lt - 0.02], { id: `stub-l${k}`, role: 'ink' })),
    ];
};
const panelFront = [
    { t: 'segs', segs: [[0.1, 0.2, PANEL.w - 0.1, 0.2], [0.1, PANEL.h - 0.25, PANEL.w - 0.1, PANEL.h - 0.25]], stroke: 'soft' },
    { t: 'circle', cx: PANEL.w / 2, cy: PANEL.h - 0.12, r: 0.045, fill: 'ink' },
];
const sectorPanels = () => {
    const { y, half, bar } = PLAT;
    const y0 = y - 0.55;
    const parts = [];
    [-0.85, 0, 0.85].forEach((o, k) => {
        parts.push(box([TW.x + o - PANEL.w / 2, y0, TW.z + half], [PANEL.w, PANEL.h, PANEL.t], { id: `pf${k}`, r: 0.1, axis: 'z', role: 'face', decals: { front: panelFront } }));
        parts.push(box([TW.x + half, y0, TW.z + o - PANEL.w / 2], [PANEL.t, PANEL.h, PANEL.w], { id: `pr${k}`, r: 0.1, axis: 'x', role: 'face', decals: { right: panelFront } }));
        parts.push(box([TW.x - half - PANEL.t, y0, TW.z + o - PANEL.w / 2], [PANEL.t, PANEL.h, PANEL.w], { id: `pl${k}`, r: 0.1, axis: 'x', role: 'face' }));
    });
    void bar;
    return parts;
};
const waves = () => WAVE.radii.flatMap((r, k) => [
    prism([0, 0, TW.z - 0.04], arc(TW.x, WAVE.y, r, r + WAVE.th, -38, 38), 0.08, { id: `wave-r${k}`, axis: 'z', role: 'accent', group: `wave${k}` }),
    prism([0, 0, TW.z - 0.04], arc(TW.x, WAVE.y, r, r + WAVE.th, 142, 218), 0.08, { id: `wave-l${k}`, axis: 'z', role: 'accent', group: `wave${k}` }),
]);
const cabinet = (x, k) => box([x, 0.42, 1.95], [1.0, 1.7, 0.9], {
    id: `cabinet${k}`, r: 0.04,
    decals: {
        front: [
            { t: 'rect', x: 0.08, y: 0.08, w: 0.84, h: 1.54, r: 0.04, stroke: 'soft' },
            { t: 'rect', x: 0.78, y: 0.65, w: 0.06, h: 0.3, r: 0.03, fill: 'ink' },
            slots(0.2, 1.2, 4, 0.1, 0.4, 'h'),
            { t: 'circle', cx: 0.25, cy: 0.3, r: 0.05, fill: k === 0 ? 'accent' : 'detail' },
            { t: 'bar', x: 0.36, y: 0.27, w: 0.3, h: 0.06, fill: 'soft' },
        ],
        right: [slots(0.2, 0.3, 5, 0.12, 0.5, 'v')],
    },
});
const fence = () => {
    const parts = [];
    const mesh = (w) => ({
        t: 'segs', stroke: 'soft', width: 0.6,
        segs: Array.from({ length: Math.round(w / 0.2) + 6 }, (_, i) => {
            const s = -1.2 + i * 0.2;
            return [[s, 1.25, s + 1.25, 0], [s, 0, s + 1.25, 1.25]];
        }).flat().map(([a, b, c, d]) => {
            // Clip each diagonal to the panel.
            const clip = (u, v, u2, v2) => {
                const t0 = Math.max(0, (0 - u) / (u2 - u)), t1 = Math.min(1, (w - u) / (u2 - u));
                return [u + (u2 - u) * t0, v + (v2 - v) * t0, u + (u2 - u) * t1, v + (v2 - v) * t1];
            };
            return clip(a, b, c, d);
        }).filter(([a, , c]) => c - a > 0.01),
    });
    const P = 1.4, H = 1.25;
    for (let k = 0; k < 5; k++) {
        const x = 0.3 + k * P;
        parts.push(cyl([x, CT.h, 0.3], 0.05, H + 0.15, { id: `post-b${k}`, role: 'ink', n: 8 }));
        if (k < 4)
            parts.push(box([x + 0.05, CT.h, 0.28], [P - 0.1, H, 0.03], { id: `mesh-b${k}`, role: 'face', decals: { front: [mesh(P - 0.1)] } }));
    }
    for (let k = 1; k < 5; k++) {
        const z = 0.3 + k * P;
        parts.push(cyl([0.3, CT.h, z], 0.05, H + 0.15, { id: `post-l${k}`, role: 'ink', n: 8 }));
        parts.push(box([0.28, CT.h, z - P + 0.05], [0.03, H, P - 0.1], { id: `mesh-l${k}`, role: 'face', decals: { right: [mesh(P - 0.1)] } }));
    }
    return parts;
};
export const cellTower = defineDrawing({
    id: 'cell-tower',
    name: 'Cell tower',
    category: 'communication',
    tags: ['cell tower', '5g', '4g', 'lte', 'mobile network', 'antenna', 'telecom', 'signal', 'mast', 'carrier', 'wireless', 'coverage'],
    kind: 'scene',
    prompt: '/isometric create a 5G cell tower site with signal waves, for our mobile network coverage page',
    description: 'A fenced gravel compound with a lattice steel mast braced in a zigzag on every face. A ring platform near the top carries three sector antenna panels per side, two microwave link dishes hang lower on the mast, and a lightning rod and lit beacon cap the tower. A cable bridge runs to two equipment cabinets on a slab. Signal waves ripple outward on both sides.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [CT.w, CT.h, CT.d], {
            id: 'ground', r: 0.15, role: 'face',
            decals: {
                top: [
                    ...Array.from({ length: 46 }, (_, i) => ({ t: 'circle', cx: 0.6 + ((i * 1.37) % 6.2), cy: 0.6 + ((i * 2.11) % 5.6), r: 0.035, fill: 'soft' })),
                    { t: 'rect', x: 4.0, y: 4.1, w: 1.0, h: 2.3, r: 0.06, stroke: 'soft' },
                ],
            },
        }),
        ...fence(),
        // Footing, tower and cap.
        cbox(TW.x, CT.h, TW.z, [1.9, 0.25, 1.9], { id: 'footing', r: 0.06, role: 'detail', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 1.5, h: 1.5, r: 0.04, stroke: 'soft' }] } }),
        ...towerFrame(),
        box([TX0, TOPY, TZ0], [TW.w, 0.1, TW.w], { id: 'cap', role: 'ink' }),
        cyl([TW.x, TOPY + 0.1, TW.z], 0.04, 1.0, { id: 'rod', role: 'ink', n: 8 }),
        ball([TW.x, TOPY + 1.25, TW.z], 0.15, { id: 'beacon', role: 'accent' }),
        ...platform(),
        ...sectorPanels(),
        // Microwave link dishes.
        box([TW.x + TW.w / 2, 4.15, TW.z - 0.1], [0.12, 0.2, 0.2], { id: 'mw-mount-r', role: 'ink' }),
        cyl([TW.x + TW.w / 2 + 0.12, 4.25, TW.z], 0.5, 0.3, {
            id: 'mw-r', axis: 'x', n: 32, role: 'face',
            decals: { right: [{ t: 'circle', cx: 0.5, cy: 0.5, r: 0.36, stroke: 'soft' }, { t: 'circle', cx: 0.5, cy: 0.5, r: 0.1, fill: 'detail' }] },
        }),
        box([TW.x - 0.1, 2.95, TW.z + TW.w / 2], [0.2, 0.2, 0.12], { id: 'mw-mount-f', role: 'ink' }),
        cyl([TW.x, 3.05, TW.z + TW.w / 2 + 0.12], 0.42, 0.28, {
            id: 'mw-f', axis: 'z', n: 32, role: 'face',
            decals: { front: [{ t: 'circle', cx: 0.42, cy: 0.42, r: 0.3, stroke: 'soft' }, { t: 'circle', cx: 0.42, cy: 0.42, r: 0.09, fill: 'detail' }] },
        }),
        // Equipment slab, cabinets and the cable bridge.
        box([4.0, CT.h, 1.75], [2.7, 0.12, 1.3], { id: 'slab', r: 0.04, role: 'detail' }),
        cabinet(4.25, 0),
        cabinet(5.4, 1),
        box([TW.x + TW.w / 2, 2.12, 2.05], [3.4, 0.08, 0.36], {
            id: 'bridge', role: 'detail',
            decals: { top: [slots(0.15, 0.03, 22, 0.15, 0.3, 'v'), { t: 'segs', segs: [[0, 0.12, 3.4, 0.12], [0, 0.24, 3.4, 0.24]], stroke: true }] },
        }),
        ...waves(),
    ],
    motion: {
        duration: 2,
        label: 'signal waves ripple out from the antennas',
        tracks: WAVE.radii.map((_, k) => ({
            group: `wave${k}`, s: { k: [1.12, 1.12, 1], pivot: [TW.x, WAVE.y, TW.z] },
            from: k * 0.18, to: 0.5 + k * 0.18, ease: 'inOut',
        })),
    },
});
/* ------------------------------------------------------------------ video call */
const VC = { w: 8.6, h: 0.3, d: 5.6 };
const MON = { x: 0.9, y: 1.3, z: 1.45, w: 5.4, h: 3.4, d: 0.22 };
const MON_FRONT = MON.z + MON.d;
/** World y of a point `v` down from the top of the monitor. */
const my = (v) => MON.y + MON.h - v;
const TILE = { w: 1.7, h: 0.9, gap: 0.14, u: 0.32, v: 0.6, d: 0.08 };
const ACTIVE = 1; // the speaking tile
const POP = 0.18;
const person = (w, h, k) => [
    { t: 'circle', cx: w / 2, cy: h * 0.38, r: 0.17, fill: k % 2 ? 'detail' : 'body', stroke: 'soft' },
    { t: 'line', closed: true, fill: k % 2 ? 'detail' : 'body', stroke: 'soft', pts: [[w / 2 - 0.36, h - 0.04], [w / 2 - 0.3, h * 0.7], [w / 2 - 0.14, h * 0.6], [w / 2 + 0.14, h * 0.6], [w / 2 + 0.3, h * 0.7], [w / 2 + 0.36, h - 0.04]] },
    { t: 'rect', x: 0.08, y: h - 0.2, w: 0.5, h: 0.13, r: 0.04, fill: 'ink' },
    { t: 'bar', x: 0.13, y: h - 0.16, w: 0.36, h: 0.05, fill: 'face' },
];
const tile = (k) => {
    const c = k % 2, r = Math.floor(k / 2);
    const u = TILE.u + c * (TILE.w + TILE.gap), v = TILE.v + r * (TILE.h + TILE.gap);
    const lit = k === ACTIVE;
    const z = MON_FRONT + (lit ? POP : 0);
    const parts = [];
    if (lit)
        parts.push(box([MON.x + u - 0.06, my(v + TILE.h + 0.06), z - 0.06], [TILE.w + 0.12, TILE.h + 0.12, 0.06], { id: 'speaker-ring', r: 0.1, axis: 'z', role: 'accent', group: 'speaker' }));
    parts.push(box([MON.x + u, my(v + TILE.h), z], [TILE.w, TILE.h, TILE.d], {
        id: `tile${k}`, r: 0.08, axis: 'z', role: 'face', group: lit ? 'speaker' : undefined,
        decals: { front: [...person(TILE.w, TILE.h, k), ...(k === 3 ? [{ t: 'circle', cx: TILE.w - 0.18, cy: 0.18, r: 0.08, fill: 'ink' }] : [])] },
    }));
    return parts;
};
const LEVELS = [0.18, 0.3, 0.22];
/** A smooth heart outline (x, y up), about 0.4 wide, centred on the origin. */
const heart = Array.from({ length: 28 }, (_, i) => {
    const t = (i / 28) * Math.PI * 2;
    const k = 0.0125;
    return [16 * Math.sin(t) ** 3 * k, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k];
});
export const videoCall = defineDrawing({
    id: 'video-call',
    name: 'Video call',
    category: 'communication',
    tags: ['video call', 'video conference', 'meeting', 'zoom', 'remote work', 'webcam', 'call', 'team', 'headset', 'collaboration', 'participants', 'online meeting'],
    kind: 'scene',
    prompt: '/isometric create a video conference on a desk monitor with participant tiles popping out, for our remote meetings feature page',
    description: 'A desk with a monitor on a stand showing a video meeting: four participant tiles raised off the screen, the active speaker lifted further inside a lit ring with live audio bars, a participant list, chat messages and a floating call toolbar. A webcam sits on the monitor; a keyboard, mouse, phone, headset and coffee mug share the desk. A heart reaction floats up while the speaker talks.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [VC.w, VC.h, VC.d], { id: 'desk', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 1.1, y: 2.9, w: 5.2, h: 2.2, r: 0.16, stroke: 'soft' }] } }),
        // Monitor and stand.
        cbox(3.6, VC.h, 1.6, [1.6, 0.1, 1.0], { id: 'stand-base', r: 0.12, role: 'detail' }),
        box([3.45, 0.4, 1.22], [0.3, 1.2, 0.2], { id: 'neck', r: 0.05, role: 'detail' }),
        box([MON.x, MON.y, MON.z], [MON.w, MON.h, MON.d], {
            id: 'monitor', r: 0.14, axis: 'z', role: 'body',
            decals: {
                front: [
                    { t: 'rect', x: 0.12, y: 0.12, w: MON.w - 0.24, h: MON.h - 0.24, r: 0.08, fill: 'bg', stroke: 'soft' },
                    // Title bar: recording dot, meeting name, timer.
                    { t: 'circle', cx: 0.38, cy: 0.36, r: 0.07, fill: 'ink' },
                    { t: 'bar', x: 0.55, y: 0.32, w: 1.2, h: 0.08, fill: 'detail' },
                    { t: 'bar', x: 3.3, y: 0.33, w: 0.45, h: 0.06, fill: 'soft' },
                    // Participant list.
                    { t: 'rect', x: 4.08, y: 0.55, w: 1.08, h: 2.55, r: 0.08, stroke: 'soft' },
                    { t: 'bar', x: 4.2, y: 0.68, w: 0.6, h: 0.07, fill: 'detail' },
                    ...[0, 1, 2, 3].flatMap((k) => [
                        { t: 'circle', cx: 4.3, cy: 0.98 + k * 0.28, r: 0.08, fill: k === ACTIVE ? 'accent' : 'detail' },
                        { t: 'bar', x: 4.45, y: 0.95 + k * 0.28, w: [0.5, 0.6, 0.42, 0.55][k], h: 0.06, fill: 'soft' },
                    ]),
                    { t: 'segs', segs: [[4.15, 2.15, 5.1, 2.15]], stroke: 'soft' },
                    { t: 'rect', x: 4.18, y: 2.82, w: 0.88, h: 0.2, r: 0.1, stroke: 'soft' },
                ],
                top: [{ t: 'bar', x: 0.4, y: 0.08, w: 0.6, h: 0.06, fill: 'soft' }],
            },
        }),
        cbox(3.6, MON.y + MON.h, MON.z + MON.d / 2, [0.7, 0.2, 0.2], {
            id: 'webcam', r: 0.09, axis: 'z', role: 'ink',
            decals: { front: [{ t: 'circle', cx: 0.35, cy: 0.1, r: 0.06, fill: 'detail' }, { t: 'circle', cx: 0.55, cy: 0.1, r: 0.025, fill: 'face' }] },
        }),
        ...[0, 1, 2, 3].flatMap(tile),
        // Audio bars on the speaking tile.
        ...LEVELS.map((h, k) => box([MON.x + TILE.u + TILE.w + TILE.gap + TILE.w - 0.42 + k * 0.1, my(TILE.v + TILE.h) + 0.1, MON_FRONT + POP + TILE.d], [0.06, h, 0.05], { id: `level${k}`, role: 'accent', group: `level${k}` })),
        // Chat messages beside the participant list.
        box([MON.x + 4.18, my(2.55), MON_FRONT], [0.8, 0.28, 0.07], { id: 'msg-in', r: 0.1, axis: 'z', role: 'face', decals: { front: textLines(0.1, 0.08, 0.6, [1, 0.6], 0.1, 0.04) } }),
        box([MON.x + 4.3, my(2.78), MON_FRONT], [0.78, 0.18, 0.07], { id: 'msg-out', r: 0.08, axis: 'z', role: 'detail', decals: { front: textLines(0.1, 0.07, 0.55, [1], 0.1, 0.04, 'face') } }),
        // Call toolbar.
        box([MON.x + 0.9, my(3.1), MON_FRONT], [2.35, 0.34, 0.1], {
            id: 'toolbar', r: 0.18, axis: 'z', role: 'ink',
            decals: {
                front: [
                    ...[0, 1, 2, 3].map((k) => ({ t: 'circle', cx: 0.3 + k * 0.42, cy: 0.18, r: 0.11, fill: 'face' })),
                    { t: 'rect', x: 1.86, y: 0.08, w: 0.38, h: 0.2, r: 0.1, fill: 'detail' },
                    { t: 'bar', x: 1.95, y: 0.15, w: 0.2, h: 0.05, fill: 'face' },
                ],
            },
        }),
        cyl([MON.x + TILE.u + TILE.w + TILE.gap + TILE.w - 0.3, my(TILE.v + 0.32), MON_FRONT + POP + TILE.d], 0.22, 0.08, {
            id: 'heart', axis: 'z', role: 'accent', group: 'heart', n: 24,
            decals: { front: [{ t: 'line', closed: true, fill: 'face', stroke: 'face', pts: heart.map(([a, b]) => [0.22 + a * 0.7, 0.23 - b * 0.7]) }] },
        }),
        // Desk things.
        box([1.4, VC.h, 3.3], [3.6, 0.14, 1.2], { id: 'keyboard', r: 0.08, decals: { top: [...grid(0.15, 0.15, 12, 3, 0.22, 0.2, 0.06, { fill: 'face' }), { t: 'rect', x: 0.9, y: 0.93, w: 1.8, h: 0.18, r: 0.04, fill: 'face', stroke: 'soft' }] } }),
        cbox(5.75, VC.h, 3.9, [0.5, 0.18, 0.75], { id: 'mouse', r: 0.22, decals: { top: [{ t: 'segs', segs: [[0.25, 0.05, 0.25, 0.3]], stroke: 'soft' }] } }),
        box([0.25, VC.h, 3.4], [0.75, 0.07, 1.5], {
            id: 'phone', r: 0.12, role: 'body',
            decals: { top: [{ t: 'rect', x: 0.06, y: 0.06, w: 0.63, h: 1.38, r: 0.1, fill: 'ink' }, { t: 'circle', cx: 0.375, cy: 0.5, r: 0.13, fill: 'detail' }, { t: 'bar', x: 0.2, y: 0.75, w: 0.35, h: 0.05, fill: 'face' }, { t: 'circle', cx: 0.2, cy: 1.15, r: 0.08, fill: 'face' }, { t: 'circle', cx: 0.55, cy: 1.15, r: 0.08, fill: 'face' }] },
        }),
        // Headset lying on the desk.
        prism([0, VC.h + 0.1, 0], arc(7.4, 2.5, 0.72, 0.84, 200, 340), 0.1, { id: 'band', axis: 'y', role: 'ink' }),
        ...[-1, 1].map((s, k) => cyl([7.4 + s * 0.98, VC.h, 2.5 + 0.05], 0.3, 0.3, { id: `cup${k}`, n: 24, role: 'body', decals: { top: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.18, stroke: 'soft' }] } })),
        cyl([7.4 - 0.98 + 0.12, VC.h + 0.12, 2.82], 0.04, 0.55, { id: 'boom', axis: 'z', role: 'ink', n: 8 }),
        ball([7.4 - 0.98 + 0.12, VC.h + 0.12, 3.43], 0.07, { id: 'boom-mic', role: 'detail' }),
        // Mug.
        cyl([7.3, VC.h, 4.4], 0.35, 0.75, { id: 'mug', n: 28, decals: { top: [{ t: 'circle', cx: 0.35, cy: 0.35, r: 0.27, fill: 'ink' }] } }),
        box([7.65, VC.h + 0.18, 4.35], [0.22, 0.4, 0.1], { id: 'handle', r: 0.08, axis: 'z', role: 'body' }),
    ],
    motion: {
        duration: 2.2,
        label: 'the speaker talks and a reaction floats up',
        tracks: [
            ...LEVELS.map((h, k) => ({
                group: `level${k}`,
                s: { k: [1, [0.4, 1.35, 0.6][k] / 1, 1], pivot: [0, my(TILE.v + TILE.h) + 0.1, 0] },
                from: k * 0.12, to: 0.4 + k * 0.12, ease: 'inOut',
            })),
            { group: 'heart', t: [0, 0.7, 0.15], from: 0.1, to: 0.9, ease: 'out' },
        ],
    },
});
/* --------------------------------------------------------------------- mailbox */
const MB = { x: 1.55, y: 2.9, z: 1.2, w: 1.26, side: 0.55, len: 2.3 };
const MB_FRONT = MB.z + MB.len;
const MB_R = MB.w / 2;
const mailboxProfile = [
    [0, 0], [MB.w, 0], [MB.w, MB.side],
    ...Array.from({ length: 15 }, (_, i) => {
        const a = rad((i * 180) / 16 + 180 / 16);
        return [MB_R + Math.cos(a) * MB_R, MB.side + Math.sin(a) * MB_R];
    }),
    [0, MB.side],
];
const HINGE = [MB.x, MB.y, MB_FRONT];
const HUB = [MB.x + MB.w, 3.2, MB_FRONT - 0.55];
export const mailbox = defineDrawing({
    id: 'mailbox',
    name: 'Mailbox',
    category: 'communication',
    tags: ['mailbox', 'mail', 'post', 'letters', 'postal', 'delivery', 'inbox', 'newsletter', 'parcel', 'flag', 'you have mail', 'letterbox'],
    kind: 'scene',
    prompt: '/isometric create a curbside mailbox with the flag up and letters inside, for our newsletter signup section',
    description: 'A curbside mailbox on a wooden post with its round-topped door folded open, letters resting on the door and the red flag raised on its side. A taped parcel waits by the post, a rolled newspaper lies in the grass, and stepping stones lead past shrubs and grass tufts. The flag dips and rises again.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [6.4, 0.3, 5.6], {
            id: 'lawn', r: 0.15, role: 'face',
            decals: {
                top: [
                    { t: 'rect', x: 4.5, y: 0.2, w: 1.7, h: 5.2, r: 0.1, fill: 'detail', stroke: 'soft' },
                    { t: 'segs', segs: Array.from({ length: 12 }, (_, i) => [4.6, 0.6 + i * 0.4, 6.1, 0.6 + i * 0.4]), stroke: 'soft' },
                    ...Array.from({ length: 18 }, (_, i) => {
                        const x = 0.4 + ((i * 1.53) % 3.8), y = 0.5 + ((i * 2.37) % 4.7);
                        return { t: 'line', pts: [[x, y], [x + 0.06, y - 0.12], [x + 0.12, y]], stroke: 'soft' };
                    }),
                ],
            },
        }),
        // Post and collar.
        box([1.92, 0.3, 2.12], [0.52, 0.18, 0.52], { id: 'collar', r: 0.04, role: 'detail' }),
        box([2.0, 0.48, 2.2], [0.36, MB.y - 0.48 - 0.12, 0.36], { id: 'post', role: 'detail', decals: { front: [slots(0.12, 0.3, 2, 0.12, 1.6, 'v')] } }),
        box([1.85, MB.y - 0.12, 1.5], [0.66, 0.12, 1.7], { id: 'bracket', r: 0.03, role: 'detail' }),
        // The mailbox.
        prism([MB.x, MB.y, MB.z], mailboxProfile, MB.len, {
            id: 'mailbox', axis: 'z',
            decals: {
                front: [{ t: 'line', closed: true, fill: 'ink', stroke: 'soft', pts: mailboxProfile.map(([u, v]) => [MB_R + (u - MB_R) * 0.88, MB.side + MB_R - (0.05 + v * 0.9)]) }],
                right: [
                    { t: 'rect', x: 1.0, y: MB_R + 0.12, w: 0.9, h: 0.3, r: 0.04, stroke: 'soft' },
                    ...[0, 1, 2].map((k) => ({ t: 'bar', x: 1.12 + k * 0.26, y: MB_R + 0.23, w: 0.16, h: 0.08, fill: 'soft' })),
                    { t: 'segs', segs: [[0.15, MB_R + 0.5, MB.len - 0.15, MB_R + 0.5]], stroke: 'soft' },
                ],
            },
        }),
        prism([MB.x, MB.y, MB_FRONT], mailboxProfile, 0.08, {
            id: 'door', axis: 'z', role: 'face',
            rot: [{ axis: 'x', deg: 90, pivot: HINGE }],
            decals: { back: [{ t: 'rect', x: MB.w / 2 - 0.12, y: MB.side + MB_R - 0.25, w: 0.24, h: 0.14, r: 0.05, fill: 'detail' }] },
        }),
        // Letters on the open door.
        box([MB.x + 0.18, MB.y, MB_FRONT], [0.9, 0.03, 0.62], { id: 'letter0', role: 'body', decals: { top: [{ t: 'rect', x: 0.66, y: 0.08, w: 0.16, h: 0.2, r: 0.02, fill: 'detail' }, ...textLines(0.12, 0.3, 0.45, [1, 0.7], 0.12, 0.04)] } }),
        box([MB.x + 0.24, MB.y + 0.03, MB_FRONT + 0.05], [0.82, 0.03, 0.55], {
            id: 'letter1', role: 'face', rot: [{ axis: 'y', deg: -8, pivot: [MB.x + 0.65, MB.y, MB_FRONT + 0.3] }],
            decals: { top: [{ t: 'line', pts: [[0.02, 0.02], [0.41, 0.3], [0.8, 0.02]], stroke: 'soft' }] },
        }),
        // Flag on the side.
        cyl([HUB[0], HUB[1], HUB[2]], 0.08, 0.06, { id: 'hub', axis: 'x', role: 'accent', n: 16, group: 'flag' }),
        box([HUB[0] + 0.06, HUB[1] - 0.04, HUB[2] - 0.05], [0.05, 1.1, 0.1], { id: 'flag-arm', role: 'accent', group: 'flag' }),
        box([HUB[0] + 0.06, HUB[1] + 0.7, HUB[2] - 0.5], [0.05, 0.36, 0.45], { id: 'flag', r: 0.03, axis: 'x', role: 'accent', group: 'flag' }),
        // Parcel by the post.
        cbox(3.3, 0.3, 3.7, [1.1, 0.8, 0.9], {
            id: 'parcel', r: 0.03,
            decals: {
                top: [{ t: 'rect', x: 0.47, y: 0, w: 0.16, h: 0.9, fill: 'detail' }],
                front: [{ t: 'rect', x: 0.47, y: 0, w: 0.16, h: 0.8, fill: 'detail' }, { t: 'rect', x: 0.12, y: 0.3, w: 0.28, h: 0.32, r: 0.02, stroke: 'soft' }, ...textLines(0.15, 0.38, 0.22, [1, 0.7], 0.1, 0.04)],
            },
        }),
        cbox(3.2, 1.1, 3.65, [0.62, 0.36, 0.55], { id: 'small-parcel', r: 0.03, role: 'face', decals: { top: [{ t: 'segs', segs: [[0, 0.27, 0.62, 0.27]], stroke: true }] } }),
        // Newspaper.
        cyl([0.55, 0.3 + 0.17, 4.5], 0.17, 0.95, { id: 'paper', axis: 'x', n: 20, role: 'face', decals: { right: [{ t: 'circle', cx: 0.17, cy: 0.17, r: 0.08, stroke: 'soft' }] } }),
        box([0.85, 0.3 + 0.17 - 0.19, 4.5 - 0.19], [0.08, 0.38, 0.38], { id: 'band', r: 0.15, axis: 'x', role: 'ink' }),
        // Stepping stones, shrubs and grass.
        ...[[5.0, 1.0], [5.6, 2.3], [5.0, 3.6], [5.55, 4.9]].map(([x, z], k) => cyl([x, 0.3, z], 0.36, 0.06, { id: `stone${k}`, role: 'body', n: 20 })),
        ball([0.75, 0.3 + 0.55, 0.8], 0.55, { id: 'shrub0', role: 'detail' }),
        ball([1.55, 0.3 + 0.4, 0.55], 0.4, { id: 'shrub1', role: 'detail' }),
        ...[[1.7, 3.0], [2.7, 2.4], [1.5, 1.9], [3.6, 1.5], [0.6, 3.2]].flatMap(([x, z], k) => [
            cone([x, 0.3, z], 0.1, 0.38, { id: `tuft${k}a`, role: 'detail', n: 8 }),
            cone([x + 0.17, 0.3, z + 0.1], 0.08, 0.28, { id: `tuft${k}b`, role: 'detail', n: 8 }),
        ]),
    ],
    motion: {
        duration: 2.6,
        label: 'the flag dips and rises again',
        tracks: [{ group: 'flag', r: { axis: 'x', deg: -80, pivot: HUB }, from: 0.15, to: 0.85, ease: 'inOut' }],
    },
});
/* ------------------------------------------------------------------ desk phone */
const DP = { x: 1.0, y: 0.3, z: 1.0, w: 4.2, d: 3.0, base: 0.35, slab: 0.2, tilt: 18 };
const DP_TOP = DP.y + DP.base;
const SLAB_PIV = [DP.x, DP_TOP, DP.z + DP.d];
const SLAB_ROT = [{ axis: 'x', deg: DP.tilt, pivot: SLAB_PIV }];
/** Rotate a slab-local point (as authored before the tilt) into the world. */
const tilted = ([x, y, z]) => {
    const c = Math.cos(rad(DP.tilt)), s = Math.sin(rad(DP.tilt));
    const dy = y - SLAB_PIV[1], dz = z - SLAB_PIV[2];
    return [x, SLAB_PIV[1] + c * dy - s * dz, SLAB_PIV[2] + s * dy + c * dz];
};
const backY = tilted([0, DP_TOP, DP.z])[1];
const backZ = tilted([0, DP_TOP, DP.z])[2];
const S_TOP = DP_TOP + DP.slab;
const HS = { x: 1.15, cupW: 0.9, grip: 0.5 };
const HS_CENTRE = tilted([HS.x + HS.cupW / 2, S_TOP + 0.15, 2.5]);
const consoleTop = [
    { t: 'rect', x: 0.1, y: 0.1, w: 1.25, h: DP.d - 0.2, r: 0.12, stroke: 'soft' },
    // Display.
    { t: 'rect', x: 1.55, y: 0.3, w: 1.75, h: 1.05, r: 0.08, fill: 'ink' },
    { t: 'bar', x: 1.7, y: 0.45, w: 0.8, h: 0.07, fill: 'face' },
    { t: 'bar', x: 1.7, y: 0.62, w: 1.2, h: 0.12, fill: 'detail' },
    { t: 'bar', x: 1.7, y: 0.85, w: 0.6, h: 0.05, fill: 'face' },
    { t: 'rect', x: 2.85, y: 1.08, w: 0.32, h: 0.14, r: 0.07, fill: 'accent' },
    // Soft keys under the display.
    ...[0, 1, 2, 3].map((k) => ({ t: 'rect', x: 1.55 + k * 0.45, y: 1.45, w: 0.38, h: 0.12, r: 0.05, fill: 'detail', stroke: 'soft' })),
    // Line keys with LEDs.
    ...[0, 1, 2, 3].flatMap((k) => [
        { t: 'rect', x: 3.45, y: 0.3 + k * 0.27, w: 0.5, h: 0.18, r: 0.04, stroke: 'soft' },
        { t: 'circle', cx: 3.55, cy: 0.39 + k * 0.27, r: 0.04, fill: k === 0 ? 'accent' : 'detail' },
        { t: 'bar', x: 3.64, y: 0.37 + k * 0.27, w: 0.24, h: 0.04, fill: 'soft' },
    ]),
    // Navigation ring.
    { t: 'circle', cx: 1.95, cy: 2.2, r: 0.32, stroke: true },
    { t: 'circle', cx: 1.95, cy: 2.2, r: 0.13, fill: 'detail', stroke: 'soft' },
    spokes(1.95, 2.2, 0.17, 0.28, 4, 45),
    // Keypad.
    ...grid(2.6, 1.72, 3, 4, 0.36, 0.22, 0.07, { fill: 'face', stroke: true, r: 0.05 }),
    // Speaker grille and function keys.
    slots(3.85, 1.75, 5, 0.1, 0.25, 'h'),
    ...[0, 1].map((k) => ({ t: 'rect', x: 1.55 + k * 0.42, y: 2.65, w: 0.34, h: 0.18, r: 0.05, fill: 'detail', stroke: 'soft' })),
];
/** The coiled cord: a dense chain of beads along a curve, wiggled to read as a coil. */
const cord = () => {
    // From the handset's mouthpiece down onto the desk, a loop in front of the phone, back into the base.
    const P0 = [1.25, 0.78, 4.08], P1 = [0.6, 0.36, 5.6], P2 = [3.0, 0.36, 5.2], P3 = [2.4, 0.42, 4.07];
    const N = 40;
    return Array.from({ length: N }, (_, i) => {
        const t = i / (N - 1), u = 1 - t;
        const p = [0, 1, 2].map((j) => u * u * u * P0[j] + 3 * u * u * t * P1[j] + 3 * u * t * t * P2[j] + t * t * t * P3[j]);
        const w = (i % 2 ? 1 : -1) * 0.04;
        return ball([p[0] + w, Math.max(0.36, p[1]), p[2] + w], 0.06, { id: `coil${i}`, role: 'ink' });
    });
};
export const deskPhone = defineDrawing({
    id: 'desk-phone',
    name: 'Desk phone',
    category: 'communication',
    tags: ['phone', 'telephone', 'voip', 'desk phone', 'call', 'ringing', 'office', 'support', 'contact', 'call center', 'handset', 'hotline'],
    kind: 'scene',
    prompt: '/isometric create an office desk phone that is ringing, for our contact sales page',
    description: 'An office VoIP phone with a sloped console: a display showing an incoming call, soft keys, line keys with status lights, a navigation ring, a twelve-key keypad and a speaker grille. The handset rests in its cradle on a coiled cord, beside a notepad and pen. The handset hops as the phone rings and ring waves pulse above it.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [6.8, 0.3, 5.2], { id: 'desk', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 6.4, h: 4.8, r: 0.12, stroke: 'soft' }] } }),
        // Phone body: base, wedge and the tilted console.
        box([DP.x, DP.y, DP.z], [DP.w, DP.base, DP.d], { id: 'base', r: 0.12, role: 'body', decals: { front: [slots(0.4, 0.17, 2, 3.4, 0.01, 'v')] } }),
        prism([DP.x, 0, 0], [[backZ, DP_TOP], [DP.z + DP.d, DP_TOP], [backZ, backY]], DP.w, { id: 'wedge', axis: 'x', role: 'body' }),
        box([DP.x, DP_TOP, DP.z], [DP.w, DP.slab, DP.d], { id: 'console', r: 0.1, role: 'face', rot: SLAB_ROT, decals: { top: consoleTop } }),
        // Handset in its cradle.
        box([HS.x, S_TOP, DP.z + 0.1], [HS.cupW, 0.3, 0.7], { id: 'ear', r: 0.3, role: 'body', group: 'handset', bias: 6, rot: SLAB_ROT, decals: { top: [{ t: 'circle', cx: 0.45, cy: 0.35, r: 0.2, stroke: 'soft' }, { t: 'circle', cx: 0.45, cy: 0.35, r: 0.06, fill: 'soft' }] } }),
        box([HS.x + (HS.cupW - HS.grip) / 2, S_TOP + 0.05, DP.z + 0.8], [HS.grip, 0.2, 1.4], { id: 'grip', r: 0.2, role: 'body', group: 'handset', bias: 6, rot: SLAB_ROT }),
        box([HS.x, S_TOP, DP.z + 2.2], [HS.cupW, 0.3, 0.7], { id: 'mouth', r: 0.3, role: 'body', group: 'handset', bias: 6, rot: SLAB_ROT, decals: { top: [slots(0.3, 0.25, 4, 0.1, 0.2, 'v')] } }),
        ...cord(),
        // Ring waves above the handset.
        ...[0.75, 1.05, 1.35].map((r, k) => prism([0, 0, HS_CENTRE[2] - 0.04], arc(HS_CENTRE[0], HS_CENTRE[1], r, r + 0.09, 55, 125), 0.08, { id: `ring${k}`, axis: 'z', role: 'accent', group: `ring${k}` })),
        // Notepad and pen.
        box([5.5, 0.3, 1.5], [1.05, 0.08, 1.45], {
            id: 'notepad', r: 0.04, role: 'body',
            decals: { top: [{ t: 'segs', segs: [[0.1, 0.12, 0.95, 0.12]], stroke: true }, ...textLines(0.14, 0.35, 0.75, [1, 0.8, 0.95, 0.6, 0.85], 0.2, 0.05)] },
        }),
        cyl([5.4, 0.3 + 0.06, 3.3], 0.06, 1.2, { id: 'pen', axis: 'z', role: 'ink', n: 10 }),
        cone([5.4, 0.36, 4.5], 0.06, 0.15, { id: 'nib', axis: 'z', role: 'detail', n: 10 }),
        box([5.9, 0.3, 3.4], [0.75, 0.05, 0.75], { id: 'sticky', r: 0.03, role: 'detail', decals: { top: textLines(0.12, 0.2, 0.5, [1, 0.7, 0.85], 0.15, 0.05, 'face') } }),
    ],
    motion: {
        duration: 1.2,
        label: 'the handset hops as the phone rings',
        tracks: [
            { group: 'handset', t: [0, 0.14, 0], from: 0, to: 0.5, ease: 'out' },
            ...[0, 1, 2].map((k) => ({ group: `ring${k}`, s: { k: [1.12, 1.12, 1], pivot: HS_CENTRE }, from: k * 0.2, to: 0.6 + k * 0.2, ease: 'inOut' })),
        ],
    },
});
