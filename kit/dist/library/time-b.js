/**
 * More Time scenes: a project timeline board (Gantt) with a "today" marker and
 * a desk of time tools, and a railway platform with a clock, a departures
 * board and a train pulling out.
 */
import { defineDrawing, box, cyl, cone, ball, prism, slots, textLines, grid, tickRing } from '../build.js';
import { clockHands, clockTracks, dialDecals } from './time.js';
const CREATED = '2026-11-14';
/* ------------------------------------------------------ project timeline */
const BX = 0.6, BW = 7.8, BY = 0.9, BH = 4.6, BZ = 0.8, BD = 0.25, BF = BZ + BD; // board
const BTOP = BY + BH;
const LEFT = 2.2, WK = 0.5; // timeline starts 2.2 into the board; one week is 0.5 wide
const ROW0 = 1.0, ROWH = 0.52, BARH = 0.26;
const rowY = (r) => BTOP - (ROW0 + r * ROWH) - BARH / 2; // world y of a bar's bottom
const weekX = (w) => BX + LEFT + w * WK;
const TASKS = [
    { id: 'research', row: 0, from: 0, len: 2.2, role: 'detail', done: 1 },
    { id: 'design', row: 1, from: 1.5, len: 3, role: 'face', done: 0.85 },
    { id: 'prototype', row: 2, from: 3, len: 2.5, role: 'accent', done: 0.55 },
    { id: 'build', row: 3, from: 4.5, len: 3.5, role: 'accent', done: 0.2 },
    { id: 'test', row: 4, from: 7, len: 2.2, role: 'accent', done: 0 },
    { id: 'docs', row: 6, from: 3, len: 4, role: 'detail', done: 0.35 },
];
const NAME_W = [0.9, 0.7, 1.1, 0.6, 0.5, 0.8, 0.65];
const TODAY = weekX(4.2);
const diamond = (id, cx, y, role) => prism([0, 0, BF], [[cx, y + 0.24], [cx + 0.24, y], [cx, y - 0.24], [cx - 0.24, y]], 0.12, { id, axis: 'z', role });
const boardDecals = [
    { t: 'rect', x: 0.1, y: 0.1, w: BW - 0.2, h: 0.5, r: 0.05, fill: 'detail', stroke: 'soft' },
    slots(LEFT, 0.42, 11, WK, 0.18, 'v', true),
    { t: 'bar', x: LEFT + 0.1, y: 0.2, w: 1.5, h: 0.08, fill: 'ink' },
    { t: 'bar', x: LEFT + 2.3, y: 0.2, w: 1.3, h: 0.08, fill: 'ink' },
    { t: 'bar', x: LEFT + 4.4, y: 0.2, w: 1.1, h: 0.08, fill: 'ink' },
    { t: 'bar', x: 0.3, y: 0.2, w: 1.1, h: 0.08, fill: 'face' },
    slots(LEFT, 0.7, 11, WK, 3.75, 'v'),
    { t: 'segs', stroke: 'soft', segs: Array.from({ length: 8 }, (_, i) => [0.15, 0.74 + i * ROWH, BW - 0.15, 0.74 + i * ROWH]) },
    ...NAME_W.flatMap((w, r) => [
        { t: 'bar', x: 0.45, y: ROW0 + r * ROWH - 0.04, w, h: 0.08, fill: 'ink' },
        { t: 'circle', cx: 0.25, cy: ROW0 + r * ROWH, r: 0.07, fill: r >= 2 && r <= 4 ? 'accent' : 'detail', stroke: true },
    ]),
];
const planner = () => {
    const out = [
        box([0, 0, 0], [9, 0.2, 6.6], { id: 'floor', role: 'face', decals: { top: [{ t: 'rect', x: 0.3, y: 1.5, w: 8.4, h: 4.8, r: 0.06, stroke: 'soft' }, slots(0.3, 1.8, 17, 0.5, 4.2, 'v')] } }),
        box([BX, BY, BZ], [BW, BH, BD], { id: 'board', role: 'face', r: 0.05, decals: { front: boardDecals } }),
        ...[1.0, 7.65].flatMap((x, k) => [
            box([x - 0.2, 0.2, 0.55], [0.75, 0.1, 0.75], { id: `foot${k}`, role: 'detail' }),
            box([x, 0.3, BZ], [0.35, BY - 0.3, BD], { id: `post${k}`, role: 'detail' }),
        ]),
        // Marker tray.
        box([1.2, 0.82, BF], [3.0, 0.08, 0.3], { id: 'tray', role: 'detail' }),
        cyl([1.5, BY + 0.06, BF + 0.15], 0.05, 0.6, { id: 'marker-1', axis: 'x', role: 'ink', n: 10 }),
        cyl([2.3, BY + 0.06, BF + 0.15], 0.05, 0.6, { id: 'marker-2', axis: 'x', role: 'face', n: 10 }),
        box([3.4, BY, BF + 0.05], [0.5, 0.18, 0.2], { id: 'eraser', r: 0.03, role: 'ink' }),
    ];
    // Bars (they grow), milestones and the "today" marker.
    TASKS.forEach((t, i) => {
        const x0 = weekX(t.from), w = t.len * WK;
        out.push(box([x0, rowY(t.row), BF], [w, BARH, 0.12], {
            id: `bar-${t.id}`, role: t.role, r: 0.08, axis: 'z', group: `bar${i}`,
            decals: { front: t.done ? [{ t: 'rect', x: 0.06, y: 0.1, w: Math.max(0.1, w * t.done - 0.12), h: 0.06, r: 0.03, fill: 'ink' }] : [] },
        }));
    });
    out.push(diamond('milestone-1', weekX(2.6), rowY(0) + BARH / 2, 'ink'), diamond('milestone-launch', weekX(9.7), rowY(5) + BARH / 2, 'accent'));
    out.push(box([TODAY - 0.025, BY + 0.1, BF + 0.12], [0.05, BH - 0.35, 0.06], { id: 'today-line', role: 'ink', group: 'today' }), box([TODAY - 0.025, BTOP - 0.5, BF + 0.12], [0.5, 0.26, 0.06], { id: 'today-flag', role: 'accent', r: 0.04, axis: 'z', group: 'today', decals: { front: [{ t: 'bar', x: 0.08, y: 0.09, w: 0.3, h: 0.08, fill: 'face' }] } }));
    // Desk with a drawer pedestal.
    out.push(box([1.0, 1.4, 2.7], [7.0, 0.2, 2.6], { id: 'desk-top', role: 'face', r: 0.04 }), box([1.1, 0.2, 2.8], [0.25, 1.2, 0.25], { id: 'desk-leg-a', role: 'detail' }), box([1.1, 0.2, 5.0], [0.25, 1.2, 0.25], { id: 'desk-leg-b', role: 'detail' }), box([6.1, 0.2, 2.8], [1.8, 1.2, 2.3], {
        id: 'pedestal', role: 'detail', r: 0.03,
        decals: {
            front: [
                ...[0, 1, 2].flatMap((k) => [{ t: 'rect', x: 0.1, y: 0.1 + k * 0.37, w: 1.6, h: 0.31, r: 0.03, fill: 'face', stroke: 'soft' }, { t: 'bar', x: 0.7, y: 0.22 + k * 0.37, w: 0.4, h: 0.06, fill: 'ink' }]),
            ],
        },
    }));
    // Stopwatch with a sweeping hand.
    out.push(cyl([2.2, 1.6, 4.3], 0.6, 0.18, { id: 'stopwatch', n: 40, role: 'face', decals: { top: [{ t: 'circle', cx: 0.6, cy: 0.6, r: 0.55, stroke: true }, tickRing(0.6, 0.6, 0.52, 60, 5, 0.1), { t: 'circle', cx: 0.6, cy: 0.9, r: 0.14, stroke: 'soft' }] } }), cyl([2.2, 1.69, 3.72], 0.1, -0.2, { id: 'sw-crown', axis: 'z', role: 'detail', n: 14 }), cyl([2.2, 1.69, 3.52], 0.15, -0.06, { id: 'sw-button', axis: 'z', role: 'ink', n: 14 }), box([2.185, 1.78, 3.85], [0.03, 0.03, 0.45], { id: 'sw-hand', role: 'accent', group: 'sw', rot: [{ axis: 'y', deg: 40, pivot: [2.2, 1.78, 4.3] }] }), cyl([2.2, 1.78, 4.3], 0.06, 0.04, { id: 'sw-hub', role: 'ink', n: 12 }));
    // Flip calendar.
    out.push(box([3.55, 1.6, 3.15], [1.3, 0.12, 0.75], { id: 'cal-base', role: 'detail', r: 0.03 }), box([3.6, 1.72, 3.3], [1.2, 0.9, 0.1], {
        id: 'cal-pages', role: 'face', r: 0.03,
        decals: { front: [{ t: 'rect', x: 0.08, y: 0.08, w: 1.04, h: 0.2, r: 0.03, fill: 'detail', stroke: 'soft' }, ...grid(0.1, 0.38, 5, 3, 0.16, 0.12, 0.06, { fill: 'bg', stroke: 'soft', r: 0.02 }), { t: 'rect', x: 0.1 + 2 * 0.22, y: 0.38 + 0.18, w: 0.16, h: 0.12, r: 0.02, fill: 'accent' }], top: [slots(0.1, 0.02, 6, 0.2, 0.06, 'v', true)] },
    }), 
    // Alarm clock.
    cyl([5.2, 2.1, 4.1], 0.5, 0.3, { id: 'alarm-clock', axis: 'z', role: 'face', n: 36, decals: { front: dialDecals(0.5) } }), ...clockHands('front', [5.2, 2.1, 4.1], 4.4, 'a', 0.2, 0.3), ball([4.95, 2.68, 4.2], 0.17, { id: 'bell-l', role: 'detail' }), ball([5.45, 2.68, 4.2], 0.17, { id: 'bell-r', role: 'detail' }), cyl([4.85, 1.6, 4.2], 0.06, 0.12, { id: 'alarm-foot-l', role: 'ink', n: 8 }), cyl([5.55, 1.6, 4.2], 0.06, 0.12, { id: 'alarm-foot-r', role: 'ink', n: 8 }), 
    // Hourglass, mug, papers and pencil cup.
    cyl([6.8, 1.6, 3.6], 0.3, 0.06, { id: 'hg-foot', role: 'detail', n: 20 }), cone([6.8, 1.66, 3.6], 0.2, 0.28, { id: 'hg-sand', role: 'accent', n: 20 }), cyl([6.8, 1.66, 3.6], 0.26, 0.4, { id: 'hg-lo', r2: 0.04, role: 'glass', n: 24, bias: 1 }), cyl([6.8, 2.06, 3.6], 0.04, 0.4, { id: 'hg-hi', r2: 0.26, role: 'glass', n: 24 }), cyl([6.8, 2.46, 3.6], 0.3, 0.06, { id: 'hg-cap', role: 'detail', n: 20 }), cyl([7.2, 1.6, 4.6], 0.22, 0.35, { id: 'mug', role: 'face', n: 20, decals: { top: [{ t: 'circle', cx: 0.22, cy: 0.22, r: 0.17, fill: 'ink' }] } }), box([7.42, 1.7, 4.55], [0.14, 0.18, 0.1], { id: 'mug-handle', r: 0.04, role: 'face' }), box([3.0, 1.6, 4.3], [1.0, 0.12, 0.75], { id: 'papers', role: 'face', decals: { top: [...textLines(0.12, 0.14, 0.7, [0.9, 0.7, 0.8, 0.5], 0.14, 0.06, 'ink')] } }), cyl([4.4, 1.6, 4.8], 0.18, 0.4, { id: 'pencil-cup', role: 'detail', n: 16 }), ...[0, 1, 2].map((k) => box([4.3 + k * 0.1, 2.0, 4.72 + (k % 2) * 0.08], [0.04, 0.35, 0.04], { id: `pencil${k}`, role: k === 1 ? 'accent' : 'ink' })));
    return out;
};
export const projectTimeline = defineDrawing({
    id: 'project-timeline',
    name: 'Project timeline',
    category: 'time',
    tags: ['gantt', 'timeline', 'schedule', 'roadmap', 'project management', 'planning', 'deadline', 'milestone', 'sprint', 'calendar', 'time', 'tracking', 'stopwatch', 'critical path', 'workback'],
    kind: 'scene',
    prompt: '/isometric create a Gantt board with task bars, milestones and a today marker above a desk with a stopwatch, flip calendar and alarm clock, for our project-planning landing page',
    description: 'A planning board on trestle feet showing a Gantt chart: a header of weeks, a column of task names and six task bars with progress lines, the critical-path bars lit, two milestone diamonds and a "today" marker line with a flag. A marker tray holds pens. In front a desk with a drawer pedestal carries a stopwatch with a sweeping hand, a flip calendar, an alarm clock with two bells, an hourglass, a mug, papers and a pencil cup. The bars lengthen as the schedule extends, the today marker advances and the stopwatch hand sweeps.',
    createdAt: CREATED,
    parts: planner(),
    motion: {
        duration: 7,
        label: 'the bars lengthen, the today marker advances and the stopwatch sweeps',
        tracks: [
            ...TASKS.map((t, i) => ({ group: `bar${i}`, s: { k: [1.28, 1, 1], pivot: [weekX(t.from), rowY(t.row), BF] }, from: i * 0.08, to: 0.6 + i * 0.08, ease: 'inOut' })),
            { group: 'today', t: [1.3, 0, 0], from: 0.1, to: 0.9, ease: 'inOut' },
            { group: 'sw', r: { axis: 'y', deg: 360, pivot: [2.2, 1.78, 4.3] }, mode: 'loop' },
            ...clockTracks('front', [5.2, 2.1, 4.1], 4.4, 'a'),
        ],
    },
});
/* -------------------------------------------------------- station platform */
const PLAT_X = 3.2, PLAT_W = 6.2, PLAT_TOP = 0.8, PLAT_Z = 0.3, PLAT_D = 7.4;
const TRACK_CX = 1.55;
const CLOCK = { x: 8.2, z: 3.8, y: 4.7, r: 0.5 };
const CUBE = 1.2;
const C_FRONT = CLOCK.z + CUBE / 2, C_RIGHT = CLOCK.x + CUBE / 2;
const stBench = (id, x, z) => [
    box([x, PLAT_TOP + 0.45, z], [1.4, 0.4, 0.08], { id: `${id}-back`, role: 'detail', decals: { front: [slots(0.1, 0.08, 7, 0.19, 0.24, 'v')] } }),
    box([x, PLAT_TOP + 0.35, z + 0.08], [1.4, 0.08, 0.4], { id: `${id}-seat`, role: 'face' }),
    box([x + 0.12, PLAT_TOP, z + 0.12], [0.1, 0.35, 0.3], { id: `${id}-leg1`, role: 'ink' }),
    box([x + 1.18, PLAT_TOP, z + 0.12], [0.1, 0.35, 0.3], { id: `${id}-leg2`, role: 'ink' }),
];
const stLamp = (id, x, z) => [
    cyl([x, PLAT_TOP, z], 0.09, 0.1, { id: `${id}-foot`, role: 'detail', n: 12 }),
    cyl([x, PLAT_TOP + 0.1, z], 0.04, 1.9, { id: `${id}-post`, role: 'ink', n: 10 }),
    cyl([x, PLAT_TOP + 2.0, z], 0.14, 0.26, { id: `${id}-head`, role: 'face', n: 16, r2: 0.18 }),
    cone([x, PLAT_TOP + 2.26, z], 0.2, 0.14, { id: `${id}-cap`, role: 'ink', n: 16 }),
];
const trainParts = () => {
    const g = 'train';
    const out = [
        box([0.95, 0.5, 1.0], [1.2, 0.25, 5.8], { id: 'underframe', role: 'ink', group: g }),
        // Locomotive (nose toward the viewer).
        box([0.8, 0.75, 4.3], [1.5, 1.5, 2.5], {
            id: 'loco-body', role: 'accent', r: 0.12, axis: 'x', group: g,
            decals: {
                front: [
                    { t: 'rect', x: 0.15, y: 0.22, w: 1.2, h: 0.5, r: 0.06, fill: 'ink' },
                    { t: 'circle', cx: 0.3, cy: 1.12, r: 0.1, fill: 'face', stroke: true },
                    { t: 'circle', cx: 1.2, cy: 1.12, r: 0.1, fill: 'face', stroke: true },
                    { t: 'rect', x: 0.55, y: 1.05, w: 0.4, h: 0.16, r: 0.02, fill: 'face', stroke: 'soft' },
                    { t: 'rect', x: 0, y: 1.32, w: 1.5, h: 0.08, fill: 'ink' },
                ],
                right: [
                    { t: 'rect', x: 0.15, y: 0.22, w: 0.5, h: 0.5, r: 0.05, fill: 'ink' },
                    { t: 'rect', x: 0.8, y: 0.2, w: 0.45, h: 1.0, r: 0.04, fill: 'face', stroke: true },
                    { t: 'rect', x: 0.9, y: 0.3, w: 0.25, h: 0.3, r: 0.03, fill: 'ink' },
                    slots(1.5, 0.3, 8, 0.1, 0.5, 'v'),
                    { t: 'rect', x: 0, y: 1.2, w: 2.5, h: 0.08, fill: 'face' },
                ],
            },
        }),
        box([0.9, 2.25, 4.4], [1.3, 0.1, 2.3], { id: 'loco-roof', role: 'detail', group: g, decals: { top: [slots(0.15, 0.4, 9, 0.12, 1.5, 'h')] } }),
        cyl([1.55, 2.35, 4.9], 0.1, 0.18, { id: 'horn', role: 'ink', n: 12, group: g }),
        // Passenger car.
        box([0.8, 0.75, 1.0], [1.5, 1.45, 3.1], {
            id: 'car-body', role: 'face', r: 0.1, axis: 'x', group: g,
            decals: {
                right: [
                    ...Array.from({ length: 5 }, (_, k) => ({ t: 'rect', x: 0.2 + k * 0.52, y: 0.28, w: 0.4, h: 0.48, r: 0.06, fill: 'ink' })),
                    { t: 'rect', x: 0, y: 0.95, w: 3.1, h: 0.18, fill: 'accent' },
                ],
                front: [{ t: 'rect', x: 0, y: 0.95, w: 1.5, h: 0.18, fill: 'accent' }],
            },
        }),
        box([0.9, 2.2, 1.1], [1.3, 0.08, 2.9], { id: 'car-roof', role: 'detail', group: g, decals: { top: [slots(0.15, 0.3, 11, 0.12, 0.9, 'h')] } }),
        box([1.2, 0.8, 4.1], [0.5, 0.1, 0.2], { id: 'coupler', role: 'ink', group: g }),
    ];
    for (const [k, z] of [1.7, 2.9, 4.8, 6.1].entries())
        out.push(cyl([2.15, 0.58, z], 0.17, 0.1, { id: `wheel${k}`, axis: 'x', role: 'ink', n: 16, group: g }));
    return out;
};
export const stationPlatform = defineDrawing({
    id: 'station-platform',
    name: 'Station platform',
    category: 'time',
    tags: ['station', 'train', 'railway', 'platform', 'departures', 'timetable', 'schedule', 'clock', 'on time', 'commute', 'arrival', 'time', 'transit', 'punctuality', 'rail'],
    kind: 'scene',
    prompt: '/isometric create a railway platform with a clock, a departures board and a train pulling out, for our timetable and punctuality page',
    description: 'A railway station platform beside a track with ballast, sleepers and rails. A locomotive and passenger car with lit livery stand at the platform edge. On the platform a pole carries a box clock with a dial on each visible side, a departures board on two posts shows four rows with the first row lit, and there are two benches, a ticket machine, a luggage trolley with two suitcases, lamp posts and a bin, behind a tactile warning strip. The train pulls out while the clock hands advance.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [10, 0.2, 8], { id: 'ground', role: 'face' }),
        box([0.3, 0.2, 0.3], [2.5, 0.08, 7.4], { id: 'ballast', role: 'detail', decals: { top: [slots(0.15, 0.1, 6, 0.4, 7.2, 'v')] } }),
        ...Array.from({ length: 14 }, (_, i) => box([0.5, 0.28, 0.5 + i * 0.5], [2.1, 0.08, 0.18], { id: `sleeper${i}`, role: 'face' })),
        box([TRACK_CX - 0.5, 0.36, 0.3], [0.1, 0.12, 7.4], { id: 'rail-a', role: 'ink' }),
        box([TRACK_CX + 0.4, 0.36, 0.3], [0.1, 0.12, 7.4], { id: 'rail-b', role: 'ink' }),
        box([PLAT_X, 0.2, PLAT_Z], [PLAT_W, PLAT_TOP - 0.2, PLAT_D], {
            id: 'platform', role: 'face',
            decals: {
                top: [
                    { t: 'rect', x: 0, y: 0, w: 0.35, h: PLAT_D, fill: 'detail', stroke: 'soft' },
                    slots(0.05, 0.1, 3, 0.12, PLAT_D - 0.2, 'v'),
                    slots(0.9, 0, 6, 1.0, PLAT_D, 'v'),
                    slots(0.4, 0.5, 8, 1.0, PLAT_W - 0.8, 'h'),
                ],
                right: [slots(0.3, 0.1, 16, 0.4, 0.4, 'v')],
            },
        }),
        ...trainParts(),
        // Departures board on two posts.
        box([4.1, PLAT_TOP, 1.05], [0.2, 1.9, 0.15], { id: 'board-post-a', role: 'ink' }),
        box([7.0, PLAT_TOP, 1.05], [0.2, 1.9, 0.15], { id: 'board-post-b', role: 'ink' }),
        box([3.9, PLAT_TOP + 1.9, 1.0], [3.6, 1.5, 0.25], {
            id: 'board', role: 'detail', r: 0.05,
            decals: {
                front: [
                    { t: 'rect', x: 0.1, y: 0.1, w: 3.4, h: 1.3, r: 0.06, fill: 'ink' },
                    ...[0, 1, 2, 3].flatMap((r) => {
                        const lit = r === 0;
                        const f = lit ? 'accent' : 'face';
                        return [
                            { t: 'bar', x: 0.25, y: 0.25 + r * 0.3, w: 0.45, h: 0.09, fill: f },
                            { t: 'bar', x: 0.9, y: 0.25 + r * 0.3, w: 1.2 + (r % 2) * 0.5, h: 0.09, fill: f },
                            { t: 'rect', x: 3.0, y: 0.22 + r * 0.3, w: 0.3, h: 0.15, r: 0.03, fill: f },
                        ];
                    }),
                ],
            },
        }),
        // Box clock on a pole.
        cyl([CLOCK.x, PLAT_TOP, CLOCK.z], 0.18, 0.1, { id: 'clock-foot', role: 'detail', n: 16 }),
        cyl([CLOCK.x, PLAT_TOP + 0.1, CLOCK.z], 0.1, 3.2, { id: 'clock-pole', role: 'ink', n: 12 }),
        box([CLOCK.x - CUBE / 2, 4.1, CLOCK.z - CUBE / 2], [CUBE, CUBE, CUBE], { id: 'clock-box', role: 'body', r: 0.06 }),
        box([CLOCK.x - CUBE / 2 - 0.08, 4.1 + CUBE, CLOCK.z - CUBE / 2 - 0.08], [CUBE + 0.16, 0.12, CUBE + 0.16], { id: 'clock-cap', role: 'detail' }),
        cyl([CLOCK.x, CLOCK.y, C_FRONT], CLOCK.r, 0.06, { id: 'station-dial-front', axis: 'z', role: 'face', n: 36, decals: { front: dialDecals(CLOCK.r) } }),
        cyl([C_RIGHT, CLOCK.y, CLOCK.z], CLOCK.r, 0.06, { id: 'station-dial-right', axis: 'x', role: 'face', n: 36, decals: { right: dialDecals(CLOCK.r) } }),
        ...clockHands('front', [CLOCK.x, CLOCK.y, CLOCK.z], C_FRONT + 0.06, 'sf', 0.24, 0.36),
        ...clockHands('right', [CLOCK.x, CLOCK.y, CLOCK.z], C_RIGHT + 0.06, 'sr', 0.24, 0.36),
        // Benches, ticket machine, luggage trolley, lamps and a bin.
        ...stBench('bench-a', 4.3, 6.2),
        ...stBench('bench-b', 6.3, 6.3),
        box([5.4, PLAT_TOP, 2.4], [0.7, 1.5, 0.5], {
            id: 'ticket-machine', role: 'detail', r: 0.04,
            decals: {
                front: [
                    { t: 'rect', x: 0.08, y: 0.12, w: 0.54, h: 0.4, r: 0.04, fill: 'ink' },
                    ...grid(0.1, 0.65, 3, 3, 0.14, 0.1, 0.06, { fill: 'face', stroke: 'soft' }),
                    { t: 'rect', x: 0.12, y: 1.2, w: 0.46, h: 0.1, r: 0.02, fill: 'ink' },
                ],
                right: [{ t: 'rect', x: 0.1, y: 0.15, w: 0.3, h: 0.6, r: 0.04, stroke: 'soft' }],
            },
        }),
        box([5.38, PLAT_TOP + 1.5, 2.38], [0.74, 0.1, 0.54], { id: 'ticket-roof', role: 'face' }),
        box([4.2, PLAT_TOP + 0.12, 3.9], [0.9, 0.06, 0.6], { id: 'trolley-deck', role: 'ink' }),
        ...[[4.28, 3.98], [4.9, 3.98], [4.28, 4.42], [4.9, 4.42]].map(([x, z], k) => cyl([x, PLAT_TOP, z], 0.06, 0.12, { id: `trolley-wheel${k}`, role: 'ink', n: 8 })),
        box([4.2, PLAT_TOP + 0.18, 3.9], [0.06, 1.0, 0.06], { id: 'trolley-handle', role: 'ink' }),
        box([4.25, PLAT_TOP + 0.18, 3.93], [0.8, 0.5, 0.4], { id: 'suitcase-a', role: 'body', r: 0.05, decals: { front: [{ t: 'rect', x: 0.35, y: 0.0, w: 0.1, h: 0.06, fill: 'ink' }, slots(0.1, 0.1, 6, 0.12, 0.3, 'v')] } }),
        box([4.3, PLAT_TOP + 0.68, 3.97], [0.6, 0.38, 0.3], { id: 'suitcase-b', role: 'face', r: 0.05, decals: { front: [{ t: 'rect', x: 0.2, y: 0.0, w: 0.2, h: 0.05, fill: 'ink' }] } }),
        ...stLamp('lamp-a', 3.6, 2.2),
        ...stLamp('lamp-b', 3.6, 5.6),
        cyl([9.0, PLAT_TOP, 6.2], 0.17, 0.5, { id: 'bin', role: 'detail', n: 14, decals: { top: [{ t: 'circle', cx: 0.17, cy: 0.17, r: 0.12, stroke: 'soft' }] } }),
    ],
    motion: {
        duration: 9,
        label: 'the train pulls out while the platform clock advances',
        tracks: [
            { group: 'train', t: [0, 0, -0.9], from: 0.05, to: 0.95, ease: 'inOut' },
            ...clockTracks('front', [CLOCK.x, CLOCK.y, CLOCK.z], C_FRONT + 0.06, 'sf'),
            ...clockTracks('right', [CLOCK.x, CLOCK.y, CLOCK.z], C_RIGHT + 0.06, 'sr'),
        ],
    },
});
