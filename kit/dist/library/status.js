/**
 * Status scenes: a security operations centre with video walls, console desks
 * and an alert beacon, and an uptime status room with a service-status wall,
 * traffic-light tower, gauge, uptime bars and a heartbeat monitor.
 */
import { defineDrawing, box, cyl, slots, textLines, tickRing } from '../build.js';
const CREATED = '2026-11-14';
/** Floor slab thickness shared by every scene. */
const F = 0.2;
const tiles = (w, d, step) => ({
    t: 'segs', stroke: 'soft',
    segs: [
        ...Array.from({ length: Math.ceil(w / step) - 1 }, (_, k) => [step * (k + 1), 0.02, step * (k + 1), d - 0.02]),
        ...Array.from({ length: Math.ceil(d / step) - 1 }, (_, k) => [0.02, step * (k + 1), w - 0.02, step * (k + 1)]),
    ],
});
const rackFace = (w, h, rows, lit) => {
    const pitch = (h - 0.3) / rows;
    return Array.from({ length: rows }, (_, k) => [
        { t: 'rect', x: 0.1, y: 0.15 + k * pitch, w: w - 0.2, h: pitch - 0.06, r: 0.02, fill: 'face', stroke: 'soft' },
        { t: 'circle', cx: 0.22, cy: 0.15 + k * pitch + (pitch - 0.06) / 2, r: 0.04, fill: lit(k) },
        { t: 'bar', x: 0.36, y: 0.15 + k * pitch + (pitch - 0.06) / 2 - 0.02, w: w - 0.7, h: 0.04, fill: 'soft' },
    ]).flat();
};
/* ------------------------------------------------------------------- SOC */
const chair = (id, x, z) => [
    cyl([x, F, z], 0.05, 0.5, { id: `${id}-post`, role: 'ink', n: 10 }),
    cyl([x, F + 0.5, z], 0.3, 0.08, { id: `${id}-seat`, role: 'detail', n: 22 }),
    box([x - 0.3, F + 0.58, z + 0.3], [0.6, 0.7, 0.08], { id: `${id}-back`, role: 'face', r: 0.04, axis: 'z' }),
];
const monitor = (id, x, z, screen) => [
    box([x + 0.4, F + 0.7, z + 0.02], [0.2, 0.3, 0.04], { id: `${id}-stand`, role: 'ink' }),
    box([x, F + 1.0, z], [1.0, 0.7, 0.08], { id: `${id}-panel`, role: 'ink', r: 0.03, axis: 'z', decals: { front: screen } }),
    box([x + 0.1, F + 0.7, z + 0.4], [0.8, 0.04, 0.25], { id: `${id}-keys`, role: 'detail' }),
];
const alertChart = [
    ...[0.18, 0.4, 0.28, 0.55, 0.35].map((h, k) => ({ t: 'rect', x: 0.1 + k * 0.17, y: 0.6 - h, w: 0.11, h, fill: k === 3 ? 'accent' : 'face' })),
];
const tickets = [...textLines(0.12, 0.14, 0.76, [1, 0.7, 0.9], 0.15, 0.05, 'face'), { t: 'circle', cx: 0.85, cy: 0.5, r: 0.05, fill: 'accent' }];
export const securityOperations = defineDrawing({
    id: 'security-operations',
    name: 'Security operations centre',
    category: 'status',
    tags: ['soc', 'security operations', 'monitoring', 'threat detection', 'siem', 'incident response', 'alerts', 'analyst', 'cybersecurity', 'dashboard', 'beacon', 'status'],
    kind: 'scene',
    prompt: '/isometric create a security operations centre with video walls, analyst desks and an alert beacon for our threat monitoring page',
    description: 'A control room in a corner of two video walls. The back wall carries a threat map with attack arcs, an alert bar chart and a ticket list above a scrolling ticker with a lit alert chunk; the side wall carries a network graph and a log wall. Two long analyst desks each hold two monitors and keyboards with chairs drawn up behind. A SIEM rack stands by the side wall and an alert beacon on a post turns by the door while the ticker alert slides along.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.4, F, 5.4], { id: 'floor', role: 'face', decals: { top: [tiles(8.4, 5.4, 0.8)] } }),
        box([0, F, 0], [8.4, 3.8, 0.35], {
            id: 'wall-back', role: 'body',
            decals: { front: [
                    { t: 'rect', x: 0.5, y: 0.35, w: 3.9, h: 2.0, r: 0.04, fill: 'ink' },
                    { t: 'line', closed: true, stroke: 'face', pts: [[0.8, 0.9], [1.3, 0.7], [1.9, 0.8], [2.0, 1.2], [1.6, 1.7], [1.2, 1.6]] },
                    { t: 'line', closed: true, stroke: 'face', pts: [[2.4, 0.8], [3.2, 0.7], [3.6, 1.1], [3.2, 1.6], [2.6, 1.4]] },
                    { t: 'line', stroke: 'accent', width: 1.6, pts: [[1.4, 1.0], [2.0, 0.55], [2.8, 1.0]] },
                    { t: 'line', stroke: 'accent', width: 1.6, pts: [[3.2, 1.2], [2.6, 1.9], [1.6, 1.4]] },
                    { t: 'circle', cx: 1.4, cy: 1.0, r: 0.07, fill: 'accent' }, { t: 'circle', cx: 2.8, cy: 1.0, r: 0.07, fill: 'accent' }, { t: 'circle', cx: 1.6, cy: 1.4, r: 0.07, fill: 'face' },
                    { t: 'rect', x: 4.6, y: 0.35, w: 1.7, h: 2.0, r: 0.04, fill: 'ink' },
                    ...alertChart.map((d) => (d.t === 'rect' ? { ...d, x: d.x + 4.6, y: d.y + 1.35 } : d)),
                    { t: 'segs', stroke: 'face', segs: [[4.75, 0.6, 6.15, 0.6], [4.75, 0.85, 6.15, 0.85]] },
                    { t: 'rect', x: 6.5, y: 0.35, w: 1.4, h: 2.0, r: 0.04, fill: 'ink' },
                    ...tickets.map((d) => (d.t === 'bar' ? { ...d, x: d.x + 6.5 - 0.1, y: d.y + 0.2 } : d.t === 'circle' ? { ...d, cx: d.cx + 6.5 - 0.1, cy: d.cy + 1.4 } : d)),
                    ...textLines(6.62, 1.2, 1.1, [1, 0.6, 0.8], 0.15, 0.05, 'face'),
                    slots(0.5, 2.8, 5, 0.18, 7.4, 'h'),
                ] },
        }),
        box([0, F, 0.35], [0.35, 3.8, 5.05], {
            id: 'wall-side', role: 'body',
            decals: { right: [
                    { t: 'rect', x: 0.4, y: 0.35, w: 2.2, h: 2.0, r: 0.04, fill: 'ink' },
                    { t: 'circle', cx: 1.5, cy: 1.35, r: 0.14, fill: 'accent' },
                    ...[[0.9, 0.85], [2.1, 0.85], [0.9, 1.85], [2.1, 1.85], [1.5, 0.6]].flatMap(([x, y]) => [{ t: 'segs', stroke: 'face', segs: [[x, y, 1.5, 1.35]] }, { t: 'circle', cx: x, cy: y, r: 0.08, fill: 'face' }]),
                    { t: 'rect', x: 2.9, y: 0.35, w: 2.0, h: 2.0, r: 0.04, fill: 'ink' },
                    ...textLines(3.05, 0.55, 1.7, [1, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.3], 0.19, 0.05, 'face'),
                    slots(0.4, 2.8, 5, 0.18, 4.5, 'h'),
                ] },
        }),
        box([0, F + 3.8, 0], [8.5, 0.15, 0.5], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.03, 40, 0.2, 0.09, 'v')] } }),
        // Ticker with an alert chunk.
        box([0.7, F + 0.55, 0.35], [7.0, 0.35, 0.06], { id: 'ticker', role: 'ink', decals: { front: textLines(0.4, 0.14, 6.0, [0.2, 0.15, 0.25, 0.1, 0.18], 0, 0.06, 'face').map((d, k) => (d.t === 'bar' ? { ...d, x: 0.3 + k * 1.3 } : d)) } }),
        box([0.8, F + 0.6, 0.41], [0.9, 0.25, 0.04], { id: 'alert-chunk', role: 'accent', group: 'alert', decals: { front: [{ t: 'bar', x: 0.1, y: 0.1, w: 0.5, h: 0.05, fill: 'ink' }] } }),
        // Desks and chairs.
        ...[1.4, 4.8].flatMap((x, d) => [
            box([x, F, 2.1], [2.8, 0.7, 0.9], { id: `desk${d}`, role: 'body', decals: { front: [{ t: 'rect', x: 0.15, y: 0.1, w: 2.5, h: 0.45, r: 0.04, stroke: 'soft' }, slots(0.4, 0.15, 10, 0.2, 0.35, 'v')], top: [{ t: 'segs', stroke: 'soft', segs: [[1.4, 0.05, 1.4, 0.85]] }] } }),
            ...monitor(`mon${d}a`, x + 0.2, 2.3, d === 0 ? [{ t: 'rect', x: 0.08, y: 0.1, w: 0.84, h: 0.5, r: 0.02, fill: 'face' }, ...alertChart.map((c) => (c.t === 'rect' ? { ...c, x: c.x * 0.8 + 0.1, y: c.y * 0.8 + 0.1 } : c))] : tickets),
            ...monitor(`mon${d}b`, x + 1.55, 2.3, d === 0 ? tickets : [{ t: 'rect', x: 0.08, y: 0.1, w: 0.84, h: 0.5, r: 0.02, fill: 'face' }, ...textLines(0.15, 0.2, 0.7, [1, 0.5, 0.8], 0.14, 0.04, 'ink')]),
            ...chair(`chair${d}a`, x + 0.7, 3.4),
            ...chair(`chair${d}b`, x + 2.1, 3.4),
        ]),
        // SIEM rack and beacon.
        box([0.7, F, 1.0], [0.9, 2.4, 1.0], { id: 'rack', role: 'body', decals: { right: rackFace(1.0, 2.4, 8, (k) => (k === 2 ? 'accent' : 'ink')) } }),
        cyl([8.0, F, 1.2], 0.2, 0.15, { id: 'beacon-base', role: 'detail', n: 20 }),
        cyl([8.0, F + 0.15, 1.2], 0.05, 1.3, { id: 'beacon-post', role: 'ink', n: 10 }),
        cyl([8.0, F + 1.45, 1.2], 0.3, 0.5, { id: 'beacon-lamp', role: 'accent', n: 24, decals: { top: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.2, stroke: 'soft' }] } }),
        box([7.8, F + 1.95, 1.15], [0.4, 0.14, 0.1], { id: 'beacon-fin', role: 'ink', group: 'beacon' }),
        box([7.55, F, 4.4], [0.5, 0.6, 0.5], { id: 'bin', role: 'detail', decals: { front: [slots(0.08, 0.1, 6, 0.07, 0.4, 'h')] } }),
    ],
    motion: {
        duration: 4.2,
        label: 'the alert slides across the ticker and the beacon turns',
        tracks: [
            { group: 'alert', t: [5.9, 0, 0], from: 0, to: 1, ease: 'inOut' },
            { group: 'beacon', r: { axis: 'y', deg: 360, pivot: [8.0, F + 2.0, 1.2] }, mode: 'loop' },
        ],
    },
});
/* ---------------------------------------------------------------- uptime */
const BAR_H = [0.5, 0.7, 0.6, 0.9, 0.8, 1.0, 1.1, 1.3];
const GAUGE = { x: 2.7, y: F + 1.65, z: 1.8 };
const tileDecals = () => {
    const out = [];
    const state = ['accent', 'accent', 'detail', 'accent', 'accent', 'accent', 'accent', 'ink', 'accent', 'accent', 'accent', 'accent'];
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 4; c++) {
            const x = 0.7 + c * 1.6, y = 0.65 + r * 0.7, k = r * 4 + c;
            out.push({ t: 'rect', x, y, w: 1.45, h: 0.55, r: 0.05, fill: 'face', stroke: true });
            out.push({ t: 'circle', cx: x + 0.2, cy: y + 0.275, r: 0.1, fill: state[k] });
            out.push({ t: 'bar', x: x + 0.42, y: y + 0.12, w: 0.7, h: 0.05, fill: 'soft' });
            out.push({ t: 'line', stroke: 'soft', pts: [[x + 0.42, y + 0.45], [x + 0.62, y + 0.35], [x + 0.82, y + 0.42], [x + 1.02, y + 0.3], [x + 1.3, y + 0.38]] });
        }
    return out;
};
export const uptimeStatus = defineDrawing({
    id: 'uptime-status',
    name: 'Uptime status room',
    category: 'status',
    tags: ['uptime', 'status page', 'monitoring', 'health check', 'incident', 'sla', 'observability', 'gauge', 'heartbeat', 'traffic light', 'availability', 'status'],
    kind: 'scene',
    prompt: '/isometric create a system status room with a service status wall, a traffic light, a gauge, uptime bars and a heartbeat monitor for our uptime monitoring page',
    description: 'A monitoring room whose back wall is a status board of twelve service tiles, each with a lamp, a label bar and a sparkline; most lamps are lit, one is degraded and one is down. A traffic-light tower with the green lamp lit stands at the left. A dial gauge on a pedestal has a swinging needle, a row of eight uptime bars rises from a slab, a tall monitoring rack shows a column of lit units and a cart carries a heartbeat monitor.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.0, F, 4.6], { id: 'floor', role: 'face', decals: { top: [tiles(8.0, 4.6, 0.8)] } }),
        box([0, F, 0], [8.0, 3.6, 0.35], {
            id: 'wall', role: 'body',
            decals: { front: [
                    { t: 'rect', x: 0.5, y: 0.35, w: 7.0, h: 2.6, r: 0.06, fill: 'ink' },
                    { t: 'rect', x: 0.7, y: 0.4, w: 2.0, h: 0.14, r: 0.04, fill: 'face' },
                    ...tileDecals(),
                    slots(0.5, 3.2, 3, 0.1, 7.0, 'h'),
                ] },
        }),
        box([-0.05, F + 3.6, 0], [8.1, 0.15, 0.5], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.03, 38, 0.2, 0.09, 'v')] } }),
        // Traffic-light tower.
        cyl([0.9, F, 1.6], 0.35, 0.15, { id: 'light-base', role: 'detail', n: 24 }),
        cyl([0.9, F + 0.15, 1.6], 0.08, 0.8, { id: 'light-pole', role: 'ink', n: 12 }),
        box([0.6, F + 0.95, 1.45], [0.6, 1.6, 0.3], {
            id: 'light-box', role: 'ink', r: 0.05, axis: 'z',
            decals: { front: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.17, fill: 'face', stroke: 'soft' }, { t: 'circle', cx: 0.3, cy: 0.8, r: 0.17, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 0.3, cy: 1.3, r: 0.17, fill: 'accent', stroke: true }] },
        }),
        // Gauge.
        box([2.2, F, 1.5], [1.0, 0.9, 0.8], { id: 'gauge-stand', role: 'body', decals: { front: [{ t: 'rect', x: 0.1, y: 0.15, w: 0.8, h: 0.5, r: 0.04, stroke: 'soft' }, slots(0.2, 0.25, 6, 0.12, 0.3, 'v')] } }),
        cyl([GAUGE.x, GAUGE.y, GAUGE.z], 0.75, 0.15, {
            id: 'gauge', axis: 'z', role: 'face', n: 36,
            decals: { front: [
                    { t: 'circle', cx: 0.75, cy: 0.75, r: 0.66, stroke: true },
                    tickRing(0.75, 0.75, 0.62, 28, 4, 0.14),
                    { t: 'line', stroke: 'accent', width: 2.4, pts: [[0.3, 1.1], [0.2, 0.75], [0.3, 0.4], [0.5, 0.22]] },
                    { t: 'rect', x: 0.55, y: 1.05, w: 0.4, h: 0.15, r: 0.03, fill: 'ink' },
                ] },
        }),
        box([GAUGE.x - 0.04, GAUGE.y, GAUGE.z + 0.15], [0.08, 0.55, 0.06], { id: 'needle', role: 'ink', group: 'needle' }),
        cyl([GAUGE.x, GAUGE.y, GAUGE.z + 0.21], 0.1, 0.06, { id: 'needle-hub', axis: 'z', role: 'accent', n: 14, group: 'needle' }),
        // Uptime bars.
        box([3.9, F, 1.4], [2.4, 0.12, 1.0], { id: 'bar-slab', role: 'detail', decals: { top: [slots(0.1, 0.1, 9, 0.25, 0.8, 'v')] } }),
        ...BAR_H.map((h, k) => box([4.05 + k * 0.28, F + 0.12, 1.65], [0.22, h, 0.5], {
            id: `uptime${k}`, role: k === BAR_H.length - 1 ? 'accent' : k % 2 ? 'face' : 'body', group: 'bars',
            decals: { top: [{ t: 'bar', x: 0.04, y: 0.2, w: 0.14, h: 0.05, fill: 'ink' }] },
        })),
        // Monitoring rack.
        box([6.6, F, 0.9], [1.2, 2.5, 1.1], { id: 'rack', role: 'body', decals: { right: rackFace(1.1, 2.5, 10, (k) => (k === 6 ? 'detail' : k === 3 ? 'ink' : 'accent')), front: [slots(0.1, 0.2, 10, 0.1, 2.0, 'v')] } }),
        // Heartbeat cart.
        box([6.2, F, 3.2], [1.6, 0.8, 0.9], { id: 'cart', role: 'detail', decals: { front: [{ t: 'rect', x: 0.1, y: 0.1, w: 1.4, h: 0.25, r: 0.03, stroke: 'soft' }, { t: 'circle', cx: 1.3, cy: 0.22, r: 0.06, fill: 'ink' }] } }),
        box([6.9, F + 0.8, 3.38], [0.2, 0.15, 0.04], { id: 'ecg-stand', role: 'ink' }),
        box([6.4, F + 0.95, 3.35], [1.2, 0.8, 0.08], {
            id: 'ecg', role: 'ink', r: 0.03, axis: 'z',
            decals: { front: [{ t: 'line', stroke: 'accent', width: 1.8, pts: [[0.08, 0.45], [0.35, 0.45], [0.45, 0.2], [0.55, 0.65], [0.65, 0.45], [1.12, 0.45]] }, slots(0.08, 0.12, 5, 0.22, 0.04, 'v')] },
        }),
    ],
    motion: {
        duration: 3.8,
        label: 'the needle swings and the uptime bars rise',
        tracks: [
            { group: 'needle', r: { axis: 'z', deg: -75, pivot: [GAUGE.x, GAUGE.y, GAUGE.z + 0.2] }, from: 0, to: 0.7, ease: 'inOut' },
            { group: 'bars', s: { k: [1, 1.35, 1], pivot: [4.05, F + 0.12, 1.9] }, from: 0.1, to: 0.8, ease: 'out' },
        ],
    },
});
