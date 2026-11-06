/**
 * Interface scenes: an analytics dashboard, a chat app on a phone, a pricing
 * page, a calendar scheduler and an app screen exploded into its layers.
 */
import { defineDrawing, box, cbox, cyl, ball, prism, slots, textLines, tickRing } from '../build.js';
const CREATED = '2026-11-05';
/** A tick mark whose short stroke starts at (x, y). */
const check = (x, y, s = 0.1, stroke = true) => ({ t: 'line', pts: [[x, y], [x + s * 0.4, y + s * 0.4], [x + s, y - s * 0.45]], stroke, width: 1.2 });
/** Mouse pointer outline, tip at (0, 0), v running away from the tip. */
const POINTER = [[0, 0], [0, 0.62], [0.15, 0.5], [0.26, 0.74], [0.36, 0.7], [0.25, 0.46], [0.44, 0.44]];
/* --------------------------------------------------------- analytics dashboard */
const AD = { w: 9.4, h: 0.3, d: 6.4 };
const TILE = 0.14;
const TOP = AD.h + TILE; // charts stand on the tiles
const KPI = { z: 1.05, d: 1.1, w: 2.3, x: (k) => 1.9 + k * 2.45 };
const BARS = { x: (k) => 2.5 + k * 0.45, z: 3.9, w: 0.3, d: 0.5, h: [0.7, 1.05, 0.85, 1.3, 1.1, 1.75, 1.4], lit: 5 };
const DONUT = { x: 6.95, z: 5.3, r: 0.7, ri: 0.32, h: 0.22 };
const AREA = { x: 6.1, z: 3.05, len: 0.4, step: 0.26, ys: [0.3, 0.38, 0.34, 0.46, 0.53, 0.49, 0.6, 0.7, 0.65, 0.78, 0.88] };
const dashboardTop = [
    // Sidebar.
    { t: 'rect', x: 0.2, y: 0.2, w: 1.5, h: AD.d - 0.4, r: 0.1, fill: 'detail', stroke: 'soft' },
    { t: 'circle', cx: 0.52, cy: 0.55, r: 0.17, fill: 'ink' },
    { t: 'bar', x: 0.8, y: 0.51, w: 0.65, h: 0.08, fill: 'face' },
    ...[0, 1, 2, 3, 4, 5].flatMap((k) => [
        ...(k === 1 ? [{ t: 'rect', x: 0.32, y: 1.12 + k * 0.45, w: 1.26, h: 0.34, r: 0.07, fill: 'face' }] : []),
        { t: 'rect', x: 0.42, y: 1.21 + k * 0.45, w: 0.16, h: 0.16, r: 0.03, fill: k === 1 ? 'ink' : 'face', stroke: 'soft' },
        { t: 'bar', x: 0.7, y: 1.25 + k * 0.45, w: [0.6, 0.7, 0.5, 0.65, 0.45, 0.55][k], h: 0.07, fill: k === 1 ? 'ink' : 'face' },
    ]),
    { t: 'segs', segs: [[0.35, 5.45, 1.55, 5.45]], stroke: 'soft' },
    { t: 'circle', cx: 0.55, cy: 5.8, r: 0.17, fill: 'face', stroke: 'soft' },
    ...textLines(0.8, 5.72, 0.7, [1, 0.6], 0.14, 0.06, 'face'),
    // Header: page title, date range, search, bell and avatar.
    { t: 'bar', x: 1.95, y: 0.36, w: 1.6, h: 0.18, fill: 'detail' },
    { t: 'bar', x: 1.95, y: 0.64, w: 1.0, h: 0.07, fill: 'soft' },
    { t: 'rect', x: 4.3, y: 0.3, w: 1.4, h: 0.4, r: 0.08, stroke: 'soft' },
    { t: 'bar', x: 4.45, y: 0.47, w: 0.9, h: 0.07, fill: 'soft' },
    { t: 'rect', x: 5.9, y: 0.3, w: 2.0, h: 0.4, r: 0.2, stroke: 'soft' },
    { t: 'circle', cx: 6.12, cy: 0.5, r: 0.08, stroke: 'soft' },
    { t: 'bar', x: 6.3, y: 0.47, w: 0.9, h: 0.07, fill: 'soft' },
    { t: 'circle', cx: 8.3, cy: 0.5, r: 0.14, stroke: 'soft' },
    { t: 'circle', cx: 8.88, cy: 0.5, r: 0.2, fill: 'detail', stroke: 'soft' },
];
const kpiTop = (k) => [
    { t: 'bar', x: 0.2, y: 0.2, w: [0.8, 0.6, 0.7][k], h: 0.07, fill: 'soft' },
    { t: 'circle', cx: KPI.w - 0.3, cy: 0.27, r: 0.12, fill: 'detail', stroke: 'soft' },
    { t: 'bar', x: 0.2, y: 0.42, w: [1.0, 0.8, 0.9][k], h: 0.2, fill: 'detail' },
    { t: 'rect', x: 0.2, y: 0.76, w: 0.55, h: 0.17, r: 0.085, stroke: true },
    { t: 'bar', x: 0.3, y: 0.82, w: 0.35, h: 0.05, fill: 'ink' },
    {
        t: 'line', stroke: true, width: 1.2,
        pts: [[[1.3, 0.9], [1.45, 0.78], [1.6, 0.84], [1.78, 0.6], [1.92, 0.68], [2.08, 0.46]], [[1.3, 0.6], [1.45, 0.74], [1.6, 0.62], [1.78, 0.82], [1.92, 0.7], [2.08, 0.88]], [[1.3, 0.85], [1.45, 0.66], [1.6, 0.72], [1.78, 0.5], [1.92, 0.62], [2.08, 0.55]]][k],
    },
];
const bar = (k) => cbox(BARS.x(k), TOP, BARS.z, [BARS.w, BARS.h[k], BARS.d], {
    id: `bar${k}`, role: k === BARS.lit ? 'accent' : k % 2 ? 'detail' : 'body', group: `bar${k}`,
    decals: { top: [{ t: 'segs', segs: [[0.05, 0.08, BARS.w - 0.05, 0.08]], stroke: 'soft' }] },
});
/** An annular sector in the x/z plane, centred on the origin, angles in degrees from +x toward +z. */
function sector(r0, r1, a0, a1, n = 10) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
        pts.push([Math.cos(a) * r1, Math.sin(a) * r1]);
    }
    for (let i = n; i >= 0; i--) {
        const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
        pts.push([Math.cos(a) * r0, Math.sin(a) * r0]);
    }
    return pts;
}
const TIP = { x: BARS.x(BARS.lit), y: TOP + BARS.h[BARS.lit] + 0.3, w: 1.1, h: 0.55 };
export const analyticsDashboard = defineDrawing({
    id: 'analytics-dashboard',
    name: 'Analytics dashboard',
    category: 'interface',
    tags: ['dashboard', 'analytics', 'admin', 'metrics', 'kpi', 'charts', 'reporting', 'saas', 'insights', 'bar chart', 'donut', 'stats'],
    kind: 'scene',
    prompt: '/isometric create an analytics dashboard with KPI cards and charts popping out of the screen, for our SaaS product page',
    description: 'An admin dashboard lying flat with a sidebar, a header with search and avatar, and three KPI tiles with sparklines. Its charts stand up off the page: a bar chart with one lit bar and a tooltip, an area chart, and a donut chart with a lifted slice. The bars dip and recover as the data refreshes.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [AD.w, AD.h, AD.d], { id: 'screen', r: 0.18, role: 'face', decals: { top: dashboardTop, front: [slots(AD.w / 2 - 1, 0.1, 11, 0.2, 0.1, 'v')] } }),
        // KPI tiles.
        ...[0, 1, 2].map((k) => box([KPI.x(k), AD.h, KPI.z], [KPI.w, TILE, KPI.d], { id: `kpi${k}`, r: 0.08, decals: { top: kpiTop(k) } })),
        // Bar chart tile, gridded back wall, bars and tooltip.
        box([1.9, AD.h, 2.4], [3.7, TILE, 3.8], {
            id: 'bar-tile', r: 0.08,
            decals: {
                top: [
                    { t: 'bar', x: 0.2, y: 0.18, w: 1.0, h: 0.09, fill: 'detail' },
                    { t: 'circle', cx: 2.6, cy: 0.22, r: 0.05, fill: 'accent' },
                    { t: 'bar', x: 2.7, y: 0.2, w: 0.35, h: 0.05, fill: 'soft' },
                    ...BARS.h.map((_, k) => ({ t: 'bar', x: BARS.x(k) - 1.9 - 0.12, y: 2.4, w: 0.24, h: 0.06, fill: 'soft' })),
                    // Baseline grid behind the bars.
                    { t: 'segs', segs: [0.55, 0.8, 1.05].map((y) => [0.55, y, 3.5, y]), stroke: 'soft' },
                    { t: 'segs', segs: [[0.2, 2.75, 3.5, 2.75]], stroke: 'soft' },
                    // Summary row under the chart.
                    ...[0, 1, 2].flatMap((k) => [
                        { t: 'bar', x: 0.2 + k * 1.15, y: 3.0, w: 0.5, h: 0.06, fill: 'soft' },
                        { t: 'bar', x: 0.2 + k * 1.15, y: 3.2, w: 0.8, h: 0.14, fill: k === 0 ? 'ink' : 'detail' },
                    ]),
                ],
            },
        }),
        ...BARS.h.map((_, k) => bar(k)),
        cyl([TIP.x, TOP + BARS.h[BARS.lit], BARS.z], 0.025, 0.3, { id: 'tip-stem', role: 'ink', n: 8, group: 'tip' }),
        cbox(TIP.x, TIP.y, BARS.z, [TIP.w, TIP.h, 0.08], {
            id: 'tooltip', r: 0.1, axis: 'z', role: 'ink', group: 'tip',
            decals: { front: [{ t: 'circle', cx: 0.2, cy: 0.2, r: 0.06, fill: 'accent' }, { t: 'bar', x: 0.33, y: 0.17, w: 0.55, h: 0.06, fill: 'face' }, { t: 'bar', x: 0.14, y: 0.34, w: 0.7, h: 0.09, fill: 'face' }] },
        }),
        // Area chart tile.
        box([5.85, AD.h, 2.4], [3.25, TILE, 1.75], {
            id: 'area-tile', r: 0.08,
            decals: { top: [{ t: 'bar', x: 0.2, y: 0.18, w: 0.9, h: 0.09, fill: 'detail' }, { t: 'bar', x: 2.4, y: 0.19, w: 0.6, h: 0.07, fill: 'soft' }, { t: 'segs', segs: [[0.25, 1.3, 3.0, 1.3]], stroke: 'soft' }] },
        }),
        prism([AREA.x, TOP, AREA.z], [[0, 0], ...AREA.ys.map((y, k) => [k * AREA.step, y]), [(AREA.ys.length - 1) * AREA.step, 0]], AREA.len, {
            id: 'area', axis: 'z', role: 'detail',
        }),
        ball([AREA.x + (AREA.ys.length - 1) * AREA.step, TOP + AREA.ys[AREA.ys.length - 1] + 0.09, AREA.z + AREA.len / 2], 0.09, { id: 'area-dot', role: 'ink' }),
        // Donut tile.
        box([5.85, AD.h, 4.4], [3.25, TILE, 1.8], {
            id: 'donut-tile', r: 0.08,
            decals: {
                top: [
                    { t: 'bar', x: 0.2, y: 0.18, w: 0.8, h: 0.09, fill: 'detail' },
                    ...[0, 1, 2].flatMap((k) => [
                        { t: 'circle', cx: 2.15, cy: 0.62 + k * 0.36, r: 0.07, fill: ['ink', 'detail', 'face'][k], stroke: 'soft' },
                        { t: 'bar', x: 2.32, y: 0.59 + k * 0.36, w: [0.6, 0.45, 0.55][k], h: 0.06, fill: 'soft' },
                    ]),
                ],
            },
        }),
        cyl([DONUT.x, TOP, DONUT.z], DONUT.r, DONUT.h, {
            id: 'donut', n: 48,
            decals: {
                top: [
                    { t: 'circle', cx: DONUT.r, cy: DONUT.r, r: DONUT.ri, fill: 'bg', stroke: true },
                    {
                        t: 'segs', stroke: 'soft',
                        segs: [100, 215, 300].map((deg) => {
                            const a = (deg * Math.PI) / 180;
                            return [DONUT.r + Math.cos(a) * DONUT.ri, DONUT.r + Math.sin(a) * DONUT.ri, DONUT.r + Math.cos(a) * DONUT.r, DONUT.r + Math.sin(a) * DONUT.r];
                        }),
                    },
                    { t: 'rect', x: DONUT.r - 0.12, y: DONUT.r - 0.05, w: 0.24, h: 0.1, r: 0.05, fill: 'detail' },
                ],
            },
        }),
        prism([DONUT.x, TOP + DONUT.h, DONUT.z], sector(DONUT.ri, DONUT.r, 0, 100), 0.12, { id: 'slice', axis: 'y', role: 'ink', group: 'slice' }),
    ],
    motion: {
        duration: 3,
        label: 'the bars refresh and the donut slice lifts',
        tracks: [
            ...BARS.h.map((h, k) => ({
                group: `bar${k}`, s: { k: [1, k === BARS.lit ? 0.62 : 0.45 + (k % 3) * 0.12, 1], pivot: [BARS.x(k), TOP, BARS.z] },
                from: k * 0.06, to: 0.55 + k * 0.06, ease: 'inOut',
            })),
            { group: 'tip', t: [0, -BARS.h[BARS.lit] * 0.38, 0], from: BARS.lit * 0.06, to: 0.55 + BARS.lit * 0.06, ease: 'inOut' },
            { group: 'slice', t: [0, 0.32, 0], from: 0.2, to: 0.8, ease: 'back' },
        ],
    },
});
/* ------------------------------------------------------------------- chat app */
const PH = { x: 1.1, y: 0.3, z: 1.3, w: 3.0, h: 6.0, d: 0.28 };
const PH_FRONT = PH.z + PH.d;
/** World y of a point `v` down from the top of the phone screen. */
const pv = (v) => PH.y + PH.h - v;
const phoneScreen = [
    { t: 'rect', x: 0.12, y: 0.12, w: PH.w - 0.24, h: PH.h - 0.24, r: 0.32, fill: 'bg', stroke: 'soft' },
    { t: 'rect', x: 1.12, y: 0.24, w: 0.76, h: 0.2, r: 0.1, fill: 'ink' },
    { t: 'bar', x: 0.38, y: 0.3, w: 0.32, h: 0.07, fill: 'ink' },
    { t: 'rect', x: 2.3, y: 0.29, w: 0.3, h: 0.1, r: 0.03, stroke: true },
    { t: 'bar', x: 2.02, y: 0.3, w: 0.18, h: 0.07, fill: 'ink' },
    // Conversation header.
    { t: 'line', pts: [[0.46, 0.74], [0.34, 0.86], [0.46, 0.98]], stroke: true, width: 1.3 },
    { t: 'circle', cx: 0.86, cy: 0.86, r: 0.21, fill: 'detail', stroke: 'soft' },
    { t: 'circle', cx: 1.01, cy: 1.01, r: 0.06, fill: 'ink' },
    { t: 'bar', x: 1.18, y: 0.77, w: 0.82, h: 0.09, fill: 'detail' },
    { t: 'bar', x: 1.18, y: 0.93, w: 0.5, h: 0.06, fill: 'soft' },
    { t: 'circle', cx: 2.2, cy: 0.86, r: 0.12, stroke: 'soft' },
    { t: 'circle', cx: 2.56, cy: 0.86, r: 0.12, stroke: 'soft' },
    { t: 'segs', segs: [[0.12, 1.2, PH.w - 0.12, 1.2]], stroke: 'soft' },
    { t: 'bar', x: 1.2, y: 1.33, w: 0.6, h: 0.06, fill: 'soft' },
    // Composer.
    { t: 'segs', segs: [[0.12, 5.0, PH.w - 0.12, 5.0], [0.34, 5.32, 0.5, 5.32], [0.42, 5.24, 0.42, 5.4]], stroke: 'soft' },
    { t: 'circle', cx: 0.42, cy: 5.32, r: 0.14, stroke: 'soft' },
    { t: 'rect', x: 0.68, y: 5.12, w: 1.7, h: 0.4, r: 0.2, stroke: 'soft' },
    { t: 'bar', x: 0.86, y: 5.29, w: 0.8, h: 0.06, fill: 'soft' },
    { t: 'bar', x: 1.1, y: 5.72, w: 0.8, h: 0.06, fill: 'ink' },
];
/** A message bubble standing proud of the screen; (u, v) is its top-left in the screen frame. */
const bubble = (id, u, v, w, h, role, decals, group, z = PH_FRONT) => box([PH.x + u, pv(v + h), z], [w, h, 0.1], { id, r: Math.min(0.18, h / 2 - 0.02), axis: 'z', role, group, decals: { front: decals } });
const heart = [[0, -0.05], [0.06, -0.11], [0.12, -0.05], [0, 0.08], [-0.12, -0.05], [-0.06, -0.11]];
const SEND = { u: 2.62, v: 5.32, r: 0.22 };
export const chatApp = defineDrawing({
    id: 'chat-app',
    name: 'Chat app',
    category: 'interface',
    tags: ['chat', 'messaging', 'messages', 'mobile', 'app', 'phone', 'conversation', 'inbox', 'social', 'notification', 'smartwatch', 'typing'],
    kind: 'scene',
    prompt: '/isometric create a messaging app on a phone with message bubbles popping off the screen and a smartwatch beside it, for our chat app landing page',
    description: 'A phone standing in a cradle shows a conversation: a header with avatar and call buttons, incoming and outgoing message bubbles raised off the screen, a photo message with a heart reaction, a typing indicator and a composer with a lit send button. The newest lit message pops forward while the typing dots bob; a smartwatch with the same notification lies beside the phone.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [6.4, 0.3, 4.0], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 6.0, h: 3.6, r: 0.12, stroke: 'soft' }] } }),
        // Cradle: a brace behind the phone and a lip in front of it.
        prism([PH.x + 1.2, 0.3, PH.z - 1.0], [[0, 0], [1.0, 0], [1.0, 2.4]], 0.6, { id: 'brace', axis: 'x', role: 'detail', only: 'standing' }),
        box([PH.x + 0.35, 0.3, PH_FRONT], [PH.w - 0.7, 0.14, 0.22], { id: 'lip', r: 0.05, role: 'detail', only: 'standing' }),
        // The phone.
        box([PH.x, PH.y, PH.z], [PH.w, PH.h, PH.d], {
            id: 'phone', r: 0.38, axis: 'z', role: 'body',
            decals: { front: phoneScreen, top: [{ t: 'bar', x: 0.6, y: 0.1, w: 0.5, h: 0.08, fill: 'detail' }] },
        }),
        // Messages.
        bubble('in-1', 0.3, 1.55, 1.85, 0.62, 'face', textLines(0.18, 0.17, 1.45, [1, 0.7], 0.2, 0.07, 'soft')),
        bubble('react', 1.86, 1.4, 0.44, 0.28, 'ink', [{ t: 'line', pts: heart.map(([a, b]) => [0.22 + a, 0.15 + b]), closed: true, fill: 'face', stroke: 'face' }], undefined, PH_FRONT + 0.1),
        bubble('out-1', 1.05, 2.33, 1.6, 0.42, 'detail', [...textLines(0.18, 0.17, 1.1, [1], 0.2, 0.07, 'face'), check(1.3, 0.22, 0.12, 'face')]),
        bubble('in-photo', 0.3, 2.9, 1.55, 1.05, 'face', [
            { t: 'rect', x: 0.1, y: 0.1, w: 1.35, h: 0.66, r: 0.08, fill: 'detail', stroke: 'soft' },
            { t: 'line', pts: [[0.18, 0.7], [0.55, 0.36], [0.8, 0.56], [1.0, 0.42], [1.38, 0.7]], stroke: 'soft', closed: true, fill: 'face' },
            { t: 'circle', cx: 1.15, cy: 0.28, r: 0.08, fill: 'face' },
            { t: 'bar', x: 0.14, y: 0.86, w: 0.8, h: 0.06, fill: 'soft' },
        ]),
        bubble('out-new', 1.2, 4.08, 1.45, 0.42, 'accent', [...textLines(0.18, 0.17, 0.95, [1], 0.2, 0.07, 'face'), check(1.12, 0.22, 0.12, 'face')], 'sent'),
        bubble('typing', 0.3, 4.58, 0.82, 0.34, 'face', []),
        ...[0, 1, 2].map((k) => ball([PH.x + 0.5 + k * 0.21, pv(4.75), PH_FRONT + 0.1 + 0.06], 0.06, { id: `dot${k}`, role: k === 0 ? 'ink' : 'detail', group: `dot${k}` })),
        // Send button.
        cyl([PH.x + SEND.u, pv(SEND.v), PH_FRONT], SEND.r, 0.1, {
            id: 'send', axis: 'z', role: 'accent', n: 28,
            decals: { front: [{ t: 'line', pts: [[0.1, 0.24], [0.34, 0.12], [0.24, 0.34]], stroke: 'face', closed: true, fill: 'face' }] },
        }),
        // Smartwatch beside the phone.
        box([5.0, 0.3, 1.0], [0.62, 0.06, 2.7], { id: 'band', r: 0.22, role: 'detail', decals: { top: [slots(0.2, 0.2, 3, 0.11, 0.3, 'v'), ...[0, 1, 2, 3].map((k) => ({ t: 'circle', cx: 0.31, cy: 2.0 + k * 0.15, r: 0.03, fill: 'soft' }))] } }),
        cbox(5.31, 0.36, 2.35, [1.1, 0.28, 1.3], {
            id: 'watch', r: 0.3, role: 'body',
            decals: {
                top: [
                    { t: 'rect', x: 0.1, y: 0.1, w: 0.9, h: 1.1, r: 0.24, fill: 'ink' },
                    { t: 'circle', cx: 0.32, cy: 0.38, r: 0.1, fill: 'detail' },
                    { t: 'bar', x: 0.48, y: 0.33, w: 0.36, h: 0.06, fill: 'face' },
                    { t: 'rect', x: 0.2, y: 0.6, w: 0.7, h: 0.22, r: 0.11, fill: 'accent' },
                    { t: 'bar', x: 0.3, y: 0.95, w: 0.5, h: 0.05, fill: 'soft' },
                ],
            },
        }),
        cyl([5.86, 0.5, 2.25], 0.09, 0.12, { id: 'crown', axis: 'x', role: 'detail', n: 16 }),
    ],
    motion: {
        duration: 2.4,
        label: 'the new message pops forward and the typing dots bob',
        tracks: [
            { group: 'sent', t: [0, 0.12, 0.32], from: 0.1, to: 0.7, ease: 'back' },
            ...[0, 1, 2].map((k) => ({ group: `dot${k}`, t: [0, 0.09, 0], from: k * 0.2, to: 0.5 + k * 0.2, ease: 'inOut' })),
        ],
    },
});
/* ---------------------------------------------------------------- pricing page */
const PW = { x: 0, y: 0.16, z: 0, w: 8.8, h: 5.9, d: 0.28 };
const PW_FRONT = PW.z + PW.d;
const PLAN = { w: 2.45, gap: 0.3, x: (k) => 0.6 + k * 2.8, bottom: 0.38, d: 0.14 };
const PLAN_H = [2.9, 3.35, 2.9];
const POP = 0.28; // how far the popular plan stands proud of the others
const TOGGLE = { x: 4.06, v: 1.36, w: 0.68, h: 0.3 };
const ppy = (v) => PW.y + PW.h - v;
const pricingWindow = [
    { t: 'rect', x: 0.12, y: 0.12, w: PW.w - 0.24, h: 0.44, r: 0.08, fill: 'face', stroke: 'soft' },
    ...[0.36, 0.6, 0.84].map((cx) => ({ t: 'circle', cx, cy: 0.34, r: 0.07, fill: 'detail', stroke: 'soft' })),
    { t: 'rect', x: 2.2, y: 0.23, w: 4.4, h: 0.22, r: 0.11, fill: 'body', stroke: 'soft' },
    { t: 'circle', cx: 2.38, cy: 0.34, r: 0.05, fill: 'ink' },
    { t: 'bar', x: 2.52, y: 0.31, w: 1.4, h: 0.07 },
    // Nav.
    { t: 'circle', cx: 0.5, cy: 0.86, r: 0.13, fill: 'detail' },
    ...[0, 1, 2, 3].map((k) => ({ t: 'bar', x: 5.2 + k * 0.62, y: 0.83, w: 0.42, h: 0.07, fill: k === 2 ? 'ink' : 'soft' })),
    // Heading, subtitle and the billing toggle.
    { t: 'bar', x: PW.w / 2 - 1.4, y: 0.82, w: 2.8, h: 0.2, fill: 'detail' },
    { t: 'bar', x: PW.w / 2 - 1.05, y: 1.12, w: 2.1, h: 0.07, fill: 'soft' },
    { t: 'bar', x: TOGGLE.x - 0.75, y: TOGGLE.v + 0.12, w: 0.6, h: 0.07, fill: 'soft' },
    { t: 'rect', x: TOGGLE.x, y: TOGGLE.v, w: TOGGLE.w, h: TOGGLE.h, r: TOGGLE.h / 2, fill: 'detail', stroke: true },
    { t: 'bar', x: TOGGLE.x + TOGGLE.w + 0.15, y: TOGGLE.v + 0.12, w: 0.55, h: 0.07, fill: 'ink' },
    { t: 'rect', x: TOGGLE.x + TOGGLE.w + 0.82, y: TOGGLE.v + 0.03, w: 0.6, h: 0.24, r: 0.12, stroke: true },
    { t: 'bar', x: TOGGLE.x + TOGGLE.w + 0.94, y: TOGGLE.v + 0.12, w: 0.36, h: 0.06, fill: 'ink' },
    // Footer line under the plans.
    { t: 'segs', segs: [[0.6, PW.h - 0.2, PW.w - 0.6, PW.h - 0.2]], stroke: 'soft' },
];
const planFront = (k) => {
    const lit = k === 1;
    const rows = [4, 5, 3][k];
    return [
        { t: 'circle', cx: 0.4, cy: 0.42, r: 0.17, fill: lit ? 'ink' : 'detail' },
        { t: 'bar', x: 0.68, y: 0.38, w: [0.7, 0.9, 1.0][k], h: 0.09, fill: 'detail' },
        { t: 'bar', x: 0.25, y: 0.78, w: [0.65, 0.85, 1.0][k], h: 0.28, fill: lit ? 'ink' : 'detail' },
        { t: 'bar', x: 0.25 + [0.65, 0.85, 1.0][k] + 0.1, y: 0.95, w: 0.38, h: 0.07, fill: 'soft' },
        ...textLines(0.25, 1.22, PLAN.w - 0.5, [1, 0.7], 0.16, 0.06, 'soft'),
        { t: 'segs', segs: [[0.25, 1.62, PLAN.w - 0.25, 1.62]], stroke: 'soft' },
        ...Array.from({ length: rows }, (_, r) => [
            check(0.28, 1.86 + r * 0.24, 0.11, lit ? 'accent' : true),
            { t: 'bar', x: 0.5, y: 1.81 + r * 0.24, w: [1.2, 0.9, 1.4, 1.05, 1.25][r], h: 0.06, fill: 'soft' },
        ]).flat(),
    ];
};
const plan = (k) => {
    const lit = k === 1;
    const h = PLAN_H[k];
    const z = PW_FRONT + (lit ? POP : 0);
    const y = PW.y + PLAN.bottom;
    const group = lit ? 'popular' : undefined;
    const parts = [
        box([PLAN.x(k), y, z], [PLAN.w, h, PLAN.d], { id: `plan${k}`, r: 0.12, axis: 'z', role: lit ? 'face' : 'body', group, decals: { front: planFront(k) } }),
        box([PLAN.x(k) + 0.25, y + 0.2, z + PLAN.d], [PLAN.w - 0.5, 0.36, 0.09], {
            id: `cta${k}`, r: 0.08, axis: 'z', role: lit ? 'accent' : 'detail', group,
            decals: { front: [{ t: 'bar', x: (PLAN.w - 0.5) / 2 - 0.4, y: 0.15, w: 0.8, h: 0.07, fill: 'face' }] },
        }),
    ];
    if (lit) {
        parts.push(cbox(PLAN.x(k) + PLAN.w / 2, y + h - 0.2, z + PLAN.d, [1.1, 0.38, 0.09], {
            id: 'badge', r: 0.19, axis: 'z', role: 'accent', group,
            decals: { front: [{ t: 'circle', cx: 0.22, cy: 0.19, r: 0.06, fill: 'face' }, { t: 'bar', x: 0.36, y: 0.16, w: 0.55, h: 0.07, fill: 'face' }] },
        }));
        parts.push(prism([PLAN.x(k) + PLAN.w / 2 + 0.45, y + 0.42, z + PLAN.d + 0.09], POINTER.map(([u, v]) => [u, -v]), 0.07, { id: 'pointer', axis: 'z', role: 'ink', group }));
    }
    return parts;
};
export const pricingPage = defineDrawing({
    id: 'pricing-page',
    name: 'Pricing page',
    category: 'interface',
    tags: ['pricing', 'plans', 'subscription', 'saas', 'billing', 'tiers', 'checkout', 'upgrade', 'monthly', 'yearly', 'landing page', 'payment'],
    kind: 'scene',
    prompt: '/isometric create a pricing page with three plans, the popular one standing out, for our SaaS pricing hero',
    description: 'A browser window on a stand shows a pricing page: a heading, a monthly/yearly toggle with a savings pill, and three plan cards with icons, prices and feature checklists. The popular plan stands proud of the others with a lit badge and button and the pointer on it. A stack of coins and a payment card sit in front. The toggle flips to yearly and the popular plan lifts.',
    createdAt: CREATED,
    parts: [
        cbox(PW.x + 1.3, 0, PW.z + PW.d / 2, [0.9, 0.16, 1.5], { r: 0.12, role: 'detail', only: 'standing' }),
        cbox(PW.x + PW.w - 1.3, 0, PW.z + PW.d / 2, [0.9, 0.16, 1.5], { r: 0.12, role: 'detail', only: 'standing' }),
        box([PW.x, PW.y, PW.z], [PW.w, PW.h, PW.d], { id: 'window', r: 0.16, axis: 'z', decals: { front: pricingWindow } }),
        cyl([TOGGLE.x + TOGGLE.h / 2, ppy(TOGGLE.v + TOGGLE.h / 2), PW_FRONT], 0.12, 0.08, { id: 'toggle', axis: 'z', role: 'face', n: 24, group: 'toggle' }),
        ...plan(0), ...plan(1), ...plan(2),
        // Coins and a payment card in front.
        ...[0, 1, 2, 3].map((k) => cyl([1.4, k * 0.13, 2.3], 0.45, 0.13, { id: `coin${k}`, role: k === 3 ? 'face' : 'detail', n: 36, decals: k === 3 ? { top: [{ t: 'circle', cx: 0.45, cy: 0.45, r: 0.3, stroke: 'soft' }, { t: 'bar', x: 0.33, y: 0.42, w: 0.24, h: 0.06, fill: 'soft' }] } : undefined })),
        cyl([2.3, 0, 2.75], 0.45, 0.13, { id: 'coin-loose', role: 'detail', n: 36, decals: { top: [{ t: 'circle', cx: 0.45, cy: 0.45, r: 0.3, stroke: 'soft' }] } }),
        box([6.2, 0, 1.9], [1.9, 0.07, 1.2], {
            id: 'card', r: 0.1, role: 'ink',
            decals: { top: [{ t: 'rect', x: 0.2, y: 0.3, w: 0.32, h: 0.24, r: 0.04, fill: 'detail' }, { t: 'bar', x: 0.2, y: 0.75, w: 1.2, h: 0.08, fill: 'soft' }, { t: 'bar', x: 0.2, y: 0.95, w: 0.5, h: 0.06, fill: 'soft' }, { t: 'circle', cx: 1.55, cy: 0.95, r: 0.1, fill: 'detail' }, { t: 'circle', cx: 1.68, cy: 0.95, r: 0.1, stroke: 'soft' }] },
        }),
    ],
    motion: {
        duration: 2.8,
        label: 'billing flips to yearly and the popular plan lifts',
        tracks: [
            { group: 'toggle', t: [TOGGLE.w - TOGGLE.h, 0, 0], from: 0, to: 0.4, ease: 'back' },
            { group: 'popular', t: [0, 0.2, 0.18], from: 0.3, to: 0.9, ease: 'inOut' },
        ],
    },
});
/* ---------------------------------------------------------- calendar scheduler */
const CAL = { w: 8.0, h: 0.28, d: 5.9 };
const CELL = { x0: 0.5, y0: 1.45, w: 1.0, h: 0.8 };
const cellX = (c) => CELL.x0 + c * CELL.w;
const cellZ = (r) => CELL.y0 + r * CELL.h;
const EV = { h: 0.08, d: 0.2, lane: 0.25 };
const LIFT = 0.85;
const DRAG = { from: 3, to: 2, row: 1 };
const calendarTop = [
    { t: 'rect', x: 0.2, y: 0.2, w: CAL.w - 0.4, h: CAL.d - 0.4, r: 0.16, fill: 'bg', stroke: 'soft' },
    // Header: month, arrows, view switch, add button.
    { t: 'bar', x: 0.5, y: 0.5, w: 1.5, h: 0.2, fill: 'detail' },
    { t: 'line', pts: [[2.38, 0.48], [2.28, 0.6], [2.38, 0.72]], stroke: true, width: 1.2 },
    { t: 'line', pts: [[2.6, 0.48], [2.7, 0.6], [2.6, 0.72]], stroke: true, width: 1.2 },
    { t: 'rect', x: 4.45, y: 0.42, w: 2.1, h: 0.36, r: 0.08, stroke: 'soft' },
    { t: 'rect', x: 5.15, y: 0.46, w: 0.7, h: 0.28, r: 0.06, fill: 'detail' },
    ...[4.6, 5.3, 6.0].map((x) => ({ t: 'bar', x, y: 0.57, w: 0.4, h: 0.06, fill: x === 5.3 ? 'ink' : 'soft' })),
    { t: 'circle', cx: 7.15, cy: 0.6, r: 0.2, fill: 'ink' },
    { t: 'segs', segs: [[7.05, 0.6, 7.25, 0.6], [7.15, 0.5, 7.15, 0.7]], stroke: 'face', width: 1.3 },
    // Weekday header and the month grid.
    ...Array.from({ length: 7 }, (_, c) => ({ t: 'bar', x: cellX(c) + 0.08, y: 1.18, w: 0.36, h: 0.07, fill: 'soft' })),
    { t: 'rect', x: cellX(5), y: CELL.y0, w: 2 * CELL.w, h: 5 * CELL.h, fill: 'detail', opacity: 0.3 },
    {
        t: 'segs', stroke: 'soft',
        segs: [
            ...Array.from({ length: 8 }, (_, c) => [cellX(c), CELL.y0, cellX(c), cellZ(5)]),
            ...Array.from({ length: 6 }, (_, r) => [CELL.x0, cellZ(r), cellX(7), cellZ(r)]),
        ],
    },
    ...Array.from({ length: 35 }, (_, i) => ({ t: 'bar', x: cellX(i % 7) + 0.08, y: cellZ(Math.floor(i / 7)) + 0.08, w: i % 7 === 0 ? 0.1 : 0.16, h: 0.06, fill: 'soft' })),
    // Today.
    { t: 'circle', cx: cellX(4) + 0.18, cy: cellZ(2) + 0.12, r: 0.11, fill: 'ink' },
    { t: 'bar', x: cellX(4) + 0.12, y: cellZ(2) + 0.09, w: 0.12, h: 0.06, fill: 'face' },
    // The drop target.
    { t: 'rect', x: cellX(DRAG.to) + 0.06, y: cellZ(DRAG.row) + 0.28, w: CELL.w - 0.12, h: EV.d, r: 0.05, stroke: true, fill: 'soft', opacity: 0.5 },
];
const event = (id, c, r, span, role, lane = 0) => box([cellX(c) + 0.06, CAL.h, cellZ(r) + 0.28 + lane * EV.lane], [span * CELL.w - 0.12, EV.h, EV.d], {
    id, r: 0.05, role,
    decals: { top: [{ t: 'bar', x: 0.08, y: 0.07, w: Math.min(0.7, span * CELL.w - 0.35), h: 0.06, fill: role === 'detail' ? 'face' : 'soft' }] },
});
const CLOCK = { x: 9.35, y: 1.1, z: 0.9, r: 0.95, d: 0.4 };
const CLOCK_FACE = CLOCK.z + CLOCK.d;
export const calendarScheduler = defineDrawing({
    id: 'calendar-scheduler',
    name: 'Calendar',
    category: 'interface',
    tags: ['calendar', 'schedule', 'scheduling', 'booking', 'events', 'planner', 'appointments', 'month', 'meeting', 'agenda', 'clock', 'drag and drop'],
    kind: 'scene',
    prompt: '/isometric create a calendar app with events and one meeting being dragged to a new day, plus a desk clock, for our scheduling feature page',
    description: 'A tablet lies flat showing a month calendar: a header with arrows, a view switch and an add button, weekday labels, shaded weekends, today circled and raised event chips, some spanning several days. The pointer drags a lit meeting across to its new day, while a desk clock with alarm bells keeps time beside a pad of sticky notes and a pen.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [CAL.w, CAL.h, CAL.d], { id: 'tablet', r: 0.3, role: 'body', decals: { top: calendarTop } }),
        // Events.
        event('ev-a', 0, 0, 2, 'face'), event('ev-b', 0, 0, 1, 'detail', 1), event('ev-c', 4, 0, 1, 'detail'),
        event('ev-d', 0, 1, 1, 'face'), event('ev-e', 5, 1, 2, 'detail'), event('ev-f', 4, 1, 1, 'face', 1),
        event('ev-g', 1, 2, 3, 'detail'), event('ev-h', 4, 2, 1, 'face', 1), event('ev-i', 6, 2, 1, 'face'),
        event('ev-j', 2, 3, 1, 'face'), event('ev-k', 3, 3, 3, 'detail', 1), event('ev-l', 0, 3, 1, 'detail', 1),
        event('ev-m', 1, 4, 2, 'face'), event('ev-n', 4, 4, 1, 'detail'), event('ev-o', 6, 4, 1, 'detail', 1),
        // The dragged meeting and the pointer.
        box([cellX(DRAG.from) + 0.06, CAL.h + LIFT, cellZ(DRAG.row) + 0.28], [CELL.w - 0.12, 0.12, EV.d + 0.2], {
            id: 'meeting', r: 0.05, role: 'accent', group: 'drag',
            decals: { top: [{ t: 'bar', x: 0.08, y: 0.08, w: 0.55, h: 0.07, fill: 'face' }, { t: 'bar', x: 0.08, y: 0.23, w: 0.35, h: 0.05, fill: 'face' }] },
        }),
        prism([0, CAL.h + LIFT + 0.12, 0], POINTER.map(([u, v]) => [cellX(DRAG.from) + 0.62 + u, cellZ(DRAG.row) + 0.45 + v]), 0.07, { id: 'pointer', axis: 'y', role: 'ink', group: 'drag' }),
        // Desk clock with alarm bells.
        cbox(CLOCK.x, 0, CLOCK.z + CLOCK.d / 2, [0.9, CLOCK.y - CLOCK.r, 0.7], { id: 'clock-foot', r: 0.08, role: 'detail' }),
        cyl([CLOCK.x, CLOCK.y, CLOCK.z], CLOCK.r, CLOCK.d, {
            id: 'clock', axis: 'z', role: 'body', n: 48,
            decals: { front: [{ t: 'circle', cx: CLOCK.r, cy: CLOCK.r, r: CLOCK.r - 0.1, fill: 'bg', stroke: 'soft' }, tickRing(CLOCK.r, CLOCK.r, CLOCK.r - 0.14, 60, 5, 0.12)] },
        }),
        ...[-1, 1].map((s) => ball([CLOCK.x + s * 0.7, CLOCK.y + 0.99, CLOCK.z + CLOCK.d / 2], 0.25, { id: `bell${s < 0 ? 'l' : 'r'}`, role: 'detail' })),
        cbox(CLOCK.x, CLOCK.y + CLOCK.r, CLOCK.z + CLOCK.d / 2, [0.12, 0.22, 0.12], { id: 'clock-stem', role: 'ink' }),
        box([CLOCK.x - 0.05, CLOCK.y, CLOCK_FACE], [0.1, 0.48, 0.04], { id: 'hour', role: 'ink', rot: [{ axis: 'z', deg: -120, pivot: [CLOCK.x, CLOCK.y, CLOCK_FACE] }] }),
        box([CLOCK.x - 0.035, CLOCK.y, CLOCK_FACE + 0.04], [0.07, 0.7, 0.04], { id: 'minute', role: 'ink', group: 'minute' }),
        cyl([CLOCK.x, CLOCK.y, CLOCK_FACE + 0.08], 0.07, 0.04, { id: 'pin', axis: 'z', role: 'detail', n: 16 }),
        // Sticky notes and a pen.
        box([8.55, 0, 2.7], [1.2, 0.12, 1.2], { id: 'notes', r: 0.04, role: 'detail' }),
        box([8.55, 0.12, 2.7], [1.2, 0.04, 1.2], { id: 'note-top', r: 0.04, role: 'face', decals: { top: textLines(0.18, 0.25, 0.85, [1, 0.7, 0.85], 0.22, 0.06, 'soft') } }),
        cyl([8.6, 0.09, 4.25], 0.09, 1.3, { id: 'pen', axis: 'x', role: 'ink', n: 14 }),
        cyl([9.9, 0.09, 4.25], 0.09, 0.2, { id: 'pen-tip', axis: 'x', r2: 0.02, role: 'detail', n: 14 }),
    ],
    motion: {
        duration: 3.2,
        label: 'a meeting is dragged to a new day while the clock ticks',
        tracks: [
            { group: 'drag', t: [(DRAG.to - DRAG.from) * CELL.w, -LIFT, 0], from: 0.1, to: 0.85, ease: 'inOut' },
            { group: 'minute', r: { axis: 'z', deg: -360, pivot: [CLOCK.x, CLOCK.y, CLOCK_FACE] }, ease: 'linear', mode: 'loop' },
        ],
    },
});
/* ------------------------------------------------------------- UI layers */
const LB = { w: 7.2, h: 0.16, d: 5.0 };
const GAP = 1.7;
const LY = (k) => LB.h + 1.2 + (k - 1) * GAP; // layer k base height
const LT = 0.1;
export const uiLayers = defineDrawing({
    id: 'ui-layers',
    name: 'UI layers',
    category: 'interface',
    tags: ['ui', 'ux', 'design system', 'layers', 'components', 'figma', 'app', 'layout', 'modal', 'dialog', 'wireframe', 'exploded', 'product design'],
    kind: 'scene',
    prompt: '/isometric create an app screen exploded into its layers: window, navigation, content cards and a modal on top, for our design system docs',
    description: 'An app screen pulled apart into floating layers above its window: a sidebar and top bar, then a chart card, a stats card and a table, and on top a modal dialog with a lit confirm button, the pointer and a toast. The layers collapse back into one screen.',
    createdAt: CREATED,
    parts: [
        // Window.
        box([0, 0, 0], [LB.w, LB.h, LB.d], {
            id: 'window', r: 0.16, role: 'body',
            decals: {
                top: [
                    ...[0.3, 0.5, 0.7].map((cx) => ({ t: 'circle', cx, cy: 0.35, r: 0.07, fill: 'detail', stroke: 'soft' })),
                    { t: 'rect', x: 2.0, y: 0.22, w: 3.2, h: 0.26, r: 0.13, stroke: 'soft' },
                    { t: 'rect', x: 0.2, y: 0.6, w: LB.w - 0.4, h: LB.d - 0.8, r: 0.1, fill: 'bg', stroke: 'soft' },
                    slots(0.6, 0.65, 16, 0.4, LB.d - 0.9, 'v'),
                    slots(0.25, 1.0, 10, 0.4, LB.w - 0.5, 'h'),
                ],
            },
        }),
        // Layer 1: navigation.
        box([0.25, LY(1), 0.75], [1.5, LT, 4.0], {
            id: 'sidebar', r: 0.08, role: 'face', group: 'l1',
            decals: {
                top: [
                    { t: 'circle', cx: 0.32, cy: 0.32, r: 0.14, fill: 'ink' },
                    ...[0, 1, 2, 3, 4].flatMap((k) => [
                        ...(k === 0 ? [{ t: 'rect', x: 0.12, y: 0.75, w: 1.26, h: 0.32, r: 0.06, fill: 'detail' }] : []),
                        { t: 'rect', x: 0.22, y: 0.84 + k * 0.42, w: 0.14, h: 0.14, r: 0.03, stroke: 'soft' },
                        { t: 'bar', x: 0.46, y: 0.88 + k * 0.42, w: [0.7, 0.55, 0.65, 0.5, 0.6][k], h: 0.06, fill: k === 0 ? 'ink' : 'soft' },
                    ]),
                    { t: 'circle', cx: 0.32, cy: 3.65, r: 0.14, fill: 'detail' },
                    { t: 'bar', x: 0.55, y: 3.62, w: 0.6, h: 0.06, fill: 'soft' },
                ],
            },
        }),
        box([1.95, LY(1), 0.75], [5.0, LT, 0.6], {
            id: 'topbar', r: 0.08, role: 'face', group: 'l1',
            decals: { top: [{ t: 'bar', x: 0.2, y: 0.24, w: 1.1, h: 0.12, fill: 'detail' }, { t: 'rect', x: 2.4, y: 0.15, w: 1.6, h: 0.3, r: 0.15, stroke: 'soft' }, { t: 'circle', cx: 2.56, cy: 0.3, r: 0.06, stroke: 'soft' }, { t: 'circle', cx: 4.7, cy: 0.3, r: 0.15, fill: 'detail' }] },
        }),
        // Layer 2: content.
        box([1.95, LY(2), 1.55], [3.1, LT, 1.75], {
            id: 'chart-card', r: 0.08, role: 'face', group: 'l2',
            decals: {
                top: [
                    { t: 'bar', x: 0.2, y: 0.2, w: 0.9, h: 0.09, fill: 'detail' },
                    ...[0.45, 0.7, 0.55, 0.9, 0.75, 1.05, 0.85].map((h, k) => ({ t: 'rect', x: 0.3 + k * 0.38, y: 1.5 - h, w: 0.22, h, r: 0.03, fill: k === 5 ? 'ink' : 'detail' })),
                    { t: 'segs', segs: [[0.2, 1.52, 2.9, 1.52]], stroke: 'soft' },
                ],
            },
        }),
        box([5.25, LY(2), 1.55], [1.7, LT, 1.75], {
            id: 'stat-card', r: 0.08, role: 'face', group: 'l2',
            decals: { top: [{ t: 'circle', cx: 0.85, cy: 0.8, r: 0.48, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 0.85, cy: 0.8, r: 0.26, fill: 'face', stroke: 'soft' }, { t: 'bar', x: 0.45, y: 1.46, w: 0.8, h: 0.07, fill: 'soft' }] },
        }),
        box([1.95, LY(2), 3.5], [5.0, LT, 1.25], {
            id: 'table-card', r: 0.08, role: 'face', group: 'l2',
            decals: {
                top: [
                    ...[0, 1, 2, 3].flatMap((r) => [
                        { t: 'circle', cx: 0.3, cy: 0.2 + r * 0.27, r: 0.07, fill: r === 0 ? 'soft' : 'detail' },
                        { t: 'bar', x: 0.5, y: 0.17 + r * 0.27, w: 1.2, h: 0.06, fill: r === 0 ? 'soft' : 'detail' },
                        { t: 'bar', x: 2.2, y: 0.17 + r * 0.27, w: 0.8, h: 0.06, fill: 'soft' },
                        { t: 'rect', x: 3.8, y: 0.13 + r * 0.27, w: 0.6, h: 0.14, r: 0.07, stroke: r === 0 ? false : 'soft' },
                    ]),
                    { t: 'segs', segs: [0.34, 0.61, 0.88].map((y) => [0.15, y, 4.85, y]), stroke: 'soft' },
                ],
            },
        }),
        // Layer 3: modal, its buttons, the pointer and a toast.
        box([2.6, LY(3), 1.7], [3.0, LT + 0.02, 2.2], {
            id: 'modal', r: 0.1, role: 'face', group: 'l3',
            decals: {
                top: [
                    { t: 'circle', cx: 0.4, cy: 0.4, r: 0.18, fill: 'detail' },
                    check(0.31, 0.41, 0.17, 'face'),
                    { t: 'bar', x: 0.7, y: 0.32, w: 1.2, h: 0.12, fill: 'detail' },
                    { t: 'segs', segs: [[2.62, 0.25, 2.78, 0.41], [2.78, 0.25, 2.62, 0.41]], stroke: true },
                    ...textLines(0.25, 0.8, 2.5, [1, 0.85, 0.6], 0.18, 0.06, 'soft'),
                    { t: 'rect', x: 0.25, y: 1.38, w: 2.5, h: 0.3, r: 0.06, stroke: true },
                    { t: 'bar', x: 0.38, y: 1.5, w: 0.9, h: 0.06, fill: 'soft' },
                ],
            },
        }),
        box([3.5, LY(3) + LT + 0.02, 3.5], [0.9, 0.08, 0.3], { id: 'btn-cancel', r: 0.06, role: 'detail', group: 'l3', decals: { top: [{ t: 'bar', x: 0.25, y: 0.12, w: 0.4, h: 0.06, fill: 'face' }] } }),
        box([4.5, LY(3) + LT + 0.02, 3.5], [0.95, 0.08, 0.3], { id: 'btn-confirm', r: 0.06, role: 'accent', group: 'l3', decals: { top: [{ t: 'bar', x: 0.25, y: 0.12, w: 0.45, h: 0.06, fill: 'face' }] } }),
        prism([0, LY(3) + LT + 0.1 + 0.25, 0], POINTER.map(([u, v]) => [5.1 + u, 3.62 + v]), 0.07, { id: 'pointer', axis: 'y', role: 'ink', group: 'l3' }),
        box([5.75, LY(3), 4.15], [1.3, LT, 0.5], {
            id: 'toast', r: 0.2, role: 'ink', group: 'l3',
            decals: { top: [{ t: 'circle', cx: 0.27, cy: 0.25, r: 0.1, fill: 'face' }, { t: 'bar', x: 0.47, y: 0.22, w: 0.6, h: 0.06, fill: 'face' }] },
        }),
    ],
    motion: {
        duration: 3,
        label: 'the layers collapse into one screen',
        tracks: [
            { group: 'l1', t: [0, -(LY(1) - LB.h - 0.2), 0], from: 0.1, to: 0.8, ease: 'inOut' },
            { group: 'l2', t: [0, -(LY(2) - LB.h - 0.45), 0], from: 0.05, to: 0.85, ease: 'inOut' },
            { group: 'l3', t: [0, -(LY(3) - LB.h - 0.7), 0], from: 0, to: 0.9, ease: 'inOut' },
        ],
    },
});
