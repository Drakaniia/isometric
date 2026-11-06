/**
 * Code and web scenes: a developer workstation, a CI/CD conveyor, a website
 * builder, a git branch graph and a bug hunt.
 */
import { defineDrawing, box, cbox, cyl, cone, ball, prism, slots, textLines, grid } from '../build.js';
const CREATED = '2026-11-05';
/** The `</>` glyph centred on (cx, cy) with half-height s. */
const codeGlyph = (cx, cy, s, stroke = true, width = 1.2) => [
    { t: 'line', pts: [[cx - s * 0.45, cy - s], [cx - s * 1.0, cy], [cx - s * 0.45, cy + s]], stroke, width },
    { t: 'line', pts: [[cx - s * 0.25, cy + s], [cx + s * 0.25, cy - s]], stroke, width },
    { t: 'line', pts: [[cx + s * 0.45, cy - s], [cx + s * 1.0, cy], [cx + s * 0.45, cy + s]], stroke, width },
];
/** Indented lines of code: [indent, length] pairs as bars. */
const codeBars = (x, y, unit, rows, gap, h, fill = 'detail') => rows.map(([ind, len], k) => ({ t: 'bar', x: x + ind * unit, y: y + k * gap, w: len * unit, h, fill }));
/* ------------------------------------------------------ developer workstation */
const DESK = { w: 8.2, h: 0.3, d: 4.8 };
const MON = { x: 0.5, y: 1.05, z: 0.5, w: 5.2, h: 3.0, d: 0.2 };
const MON_TOP = MON.y + MON.h, MON_FRONT = MON.z + MON.d;
const LINE_Y = 1.32; // decal row of the line being typed
const caretX = 2.62;
const ideScreen = [
    { t: 'rect', x: 0.12, y: 0.12, w: MON.w - 0.24, h: MON.h - 0.36, r: 0.06, fill: 'ink' },
    // Window chrome.
    ...[0.3, 0.46, 0.62].map((cx) => ({ t: 'circle', cx, cy: 0.27, r: 0.045, fill: 'detail' })),
    { t: 'bar', x: 2.1, y: 0.24, w: 1.0, h: 0.07, fill: 'soft' },
    // Activity bar icons.
    ...[0.55, 0.85, 1.15, 1.45].map((y, k) => ({ t: 'rect', x: 0.22, y, w: 0.15, h: 0.15, r: 0.03, fill: k === 0 ? 'face' : 'detail' })),
    // File tree.
    ...[[0, 0.7], [1, 0.55], [1, 0.62], [2, 0.45], [2, 0.5], [1, 0.4], [0, 0.65], [1, 0.5], [1, 0.58]].flatMap(([ind, w], k) => [
        { t: 'rect', x: 0.55 + ind * 0.12, y: 0.53 + k * 0.2, w: 0.08, h: 0.08, r: 0.015, fill: ind < 2 ? 'face' : 'detail' },
        { t: 'bar', x: 0.68 + ind * 0.12, y: 0.54 + k * 0.2, w: w * 0.9, h: 0.06, fill: k === 3 ? 'face' : 'detail' },
    ]),
    { t: 'segs', segs: [[1.62, 0.42, 1.62, 2.62], [0.45, 0.42, 0.45, 2.62]], stroke: 'soft' },
    // Tabs.
    { t: 'rect', x: 1.7, y: 0.42, w: 0.9, h: 0.2, r: 0.03, fill: 'detail' },
    { t: 'bar', x: 1.8, y: 0.49, w: 0.55, h: 0.06, fill: 'face' },
    { t: 'bar', x: 2.75, y: 0.49, w: 0.5, h: 0.06, fill: 'soft' },
    { t: 'bar', x: 3.45, y: 0.49, w: 0.45, h: 0.06, fill: 'soft' },
    // Gutter numbers and code.
    ...Array.from({ length: 8 }, (_, k) => ({ t: 'bar', x: 1.72, y: 0.74 + k * 0.145, w: 0.1, h: 0.05, fill: k === 4 ? 'face' : 'soft' })),
    ...codeBars(1.95, 0.74, 0.11, [[0, 6], [1, 9], [2, 7], [2, 11], [2, 6], [1, 3], [0, 2], [0, 8]], 0.145, 0.055, 'detail'),
    ...codeBars(1.95, 0.74, 0.11, [[6.5, 3], [10.5, 4], [7.5, 5], [11.5, 3]], 0.145, 0.055, 'face'),
    // Minimap.
    { t: 'rect', x: 4.55, y: 0.72, w: 0.42, h: 0.62, r: 0.03, fill: 'detail', opacity: 0.35 },
    ...codeBars(4.6, 0.76, 0.03, [[0, 8], [1, 10], [2, 6], [2, 9], [1, 5], [0, 7], [1, 11], [2, 8], [2, 5], [1, 9], [0, 6], [1, 8], [2, 10], [1, 4]], 0.07, 0.025, 'soft'),
    // Terminal panel.
    { t: 'segs', segs: [[1.62, 2.0, 5.08, 2.0]], stroke: 'soft' },
    { t: 'line', pts: [[1.75, 2.12], [1.83, 2.17], [1.75, 2.22]], stroke: 'detail', width: 1 },
    { t: 'bar', x: 1.92, y: 2.145, w: 1.2, h: 0.05, fill: 'detail' },
    ...textLines(1.75, 2.29, 2.6, [0.7, 0.9], 0.13, 0.05, 'soft'),
    // Status bar.
    { t: 'rect', x: 0.12, y: 2.64, w: MON.w - 0.24, h: 0.12, r: 0.03, fill: 'detail' },
    { t: 'bar', x: 0.25, y: 2.675, w: 0.5, h: 0.05, fill: 'face' },
    { t: 'bar', x: 4.3, y: 2.675, w: 0.6, h: 0.05, fill: 'face' },
    { t: 'circle', cx: MON.w / 2, cy: MON.h - 0.12, r: 0.035, fill: 'detail' },
];
const keyboardTop = [
    ...grid(0.12, 0.12, 15, 4, 0.2, 0.19, 0.035, { fill: 'face', stroke: 'soft', r: 0.03 }),
    ...grid(0.12, 0.12 + 4 * 0.225, 4, 1, 0.2, 0.19, 0.035, { fill: 'face', stroke: 'soft', r: 0.03 }),
    { t: 'rect', x: 0.12 + 4 * 0.235, y: 0.12 + 4 * 0.225, w: 6 * 0.235 - 0.035, h: 0.19, r: 0.03, fill: 'face', stroke: 'soft' },
    ...grid(0.12 + 10 * 0.235, 0.12 + 4 * 0.225, 5, 1, 0.2, 0.19, 0.035, { fill: 'face', stroke: 'soft', r: 0.03 }),
];
const DUCK = { x: 7.25, z: 3.85, r: 0.4, hr: 0.26 };
const DUCK_HY = DESK.h + DUCK.r * 2 + 0.24;
export const codeEditor = defineDrawing({
    id: 'code-editor',
    name: 'Developer workstation',
    category: 'code',
    tags: ['code', 'editor', 'ide', 'vscode', 'developer', 'programming', 'workstation', 'desk', 'keyboard', 'rubber duck', 'debugging', 'software'],
    kind: 'scene',
    prompt: '/isometric create a developer desk with an IDE on the monitor, a keyboard and a rubber duck for our engineering careers page',
    description: 'A developer desk: a wide monitor showing a code editor with a file tree, tabs, a minimap and a terminal panel, a full keyboard, a mouse on a pad, a coffee mug, a potted plant and a rubber duck. The lit caret types along the current line while the duck nods.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [DESK.w, DESK.h, DESK.d], { id: 'desk', r: 0.12, role: 'face', decals: { front: [{ t: 'segs', segs: [[0.2, 0.15, DESK.w - 0.2, 0.15]], stroke: 'soft' }] } }),
        // Monitor and stand.
        cbox(MON.x + MON.w / 2, DESK.h, 0.55, [1.5, 0.08, 0.9], { id: 'stand-foot', r: 0.3, role: 'detail' }),
        box([MON.x + MON.w / 2 - 0.16, DESK.h + 0.08, 0.32], [0.32, MON.y - DESK.h - 0.08 + 0.6, MON.z - 0.32], { id: 'stand-neck', r: 0.06, axis: 'z', role: 'detail' }),
        box([MON.x, MON.y, MON.z], [MON.w, MON.h, MON.d], { id: 'monitor', r: 0.1, axis: 'z', decals: { front: ideScreen, top: [slots(0.4, 0.06, 22, 0.2, 0.08, 'v')] } }),
        box([MON.x + caretX, MON_TOP - LINE_Y - 0.1, MON_FRONT], [0.04, 0.13, 0.02], { id: 'caret', role: 'face', group: 'caret' }),
        // Keyboard and mouse.
        box([1.2, DESK.h, 2.35], [3.62, 0.14, 1.36], { id: 'keyboard', r: 0.08, decals: { top: keyboardTop, front: [{ t: 'segs', segs: [[0.15, 0.07, 3.47, 0.07]], stroke: 'soft' }] } }),
        box([5.05, DESK.h, 2.15], [1.25, 0.03, 1.5], { id: 'mouse-pad', r: 0.1, role: 'detail' }),
        box([5.42, DESK.h + 0.03, 2.5], [0.5, 0.16, 0.78], { id: 'mouse', r: 0.24, decals: { top: [{ t: 'segs', segs: [[0.25, 0.04, 0.25, 0.3]], stroke: 'soft' }, { t: 'rect', x: 0.21, y: 0.1, w: 0.08, h: 0.14, r: 0.04, fill: 'detail' }] } }),
        // Coffee mug.
        cyl([6.45, DESK.h, 1.0], 0.36, 0.72, { id: 'mug', n: 32, decals: { top: [{ t: 'circle', cx: 0.36, cy: 0.36, r: 0.3, fill: 'ink' }] } }),
        box([6.81, DESK.h + 0.14, 0.94], [0.2, 0.44, 0.12], { id: 'mug-handle', r: 0.05, axis: 'z' }),
        // Plant.
        cyl([7.5, DESK.h, 2.05], 0.34, 0.5, { id: 'pot', r2: 0.4, role: 'detail', n: 28 }),
        ball([7.5, DESK.h + 0.5 + 0.42, 2.05], 0.46, { id: 'leaves', role: 'face' }),
        // Rubber duck: the one lit object.
        ball([DUCK.x, DESK.h + DUCK.r, DUCK.z], DUCK.r, { id: 'duck-body', role: 'accent' }),
        cyl([DUCK.x - DUCK.r - 0.02, DESK.h + DUCK.r + 0.05, DUCK.z], 0.14, -0.16, { id: 'duck-tail', r2: 0.02, axis: 'x', role: 'accent', n: 12 }),
        ball([DUCK.x + 0.08, DUCK_HY, DUCK.z + 0.1], DUCK.hr, { id: 'duck-head', role: 'accent', group: 'duck' }),
        cone([DUCK.x + 0.08, DUCK_HY - 0.04, DUCK.z + 0.1 + DUCK.hr], 0.1, 0.2, { id: 'duck-beak', axis: 'z', role: 'detail', group: 'duck', n: 12 }),
    ],
    motion: {
        duration: 2.4,
        label: 'the caret types and the duck nods',
        tracks: [
            { group: 'caret', t: [1.1, 0, 0], ease: 'linear' },
            { group: 'duck', r: { axis: 'x', deg: 14, pivot: [DUCK.x, DESK.h + DUCK.r * 2, DUCK.z] }, from: 0.3, to: 0.7, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ CI/CD pipeline */
const BELT = { x0: 1.6, x1: 9.1, y: 0.3, h: 0.6, z: 1.6, d: 1.2 };
const BELT_TOP = BELT.y + BELT.h;
// Four crates; pitch keeps the last one on the belt at the end of the loop (4 * pitch + 0.9 <= belt length).
const CRATE = { w: 0.8, h: 0.6, d: 0.8, pitch: 1.65 };
const crateZ = BELT.z + (BELT.d - CRATE.d) / 2;
const crate = (k) => box([BELT.x0 + 0.1 + k * CRATE.pitch, BELT_TOP, crateZ], [CRATE.w, CRATE.h, CRATE.d], {
    id: `crate${k}`, r: 0.04, role: k % 2 ? 'detail' : 'face', group: 'crates',
    decals: {
        front: codeGlyph(0.4, 0.3, 0.13, true, 1),
        right: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.6, h: 0.4, r: 0.03, stroke: 'soft' }, ...textLines(0.18, 0.2, 0.44, [1, 0.6, 0.8], 0.09, 0.04, 'soft')],
        top: [{ t: 'rect', x: 0.34, y: 0, w: 0.12, h: CRATE.d, fill: 'soft', opacity: 0.6 }],
    },
});
const PRESS = { x: 3.25, w: 1.7, post: 0.25, top: 2.55 };
/**
 * Test scanner, cantilevered from posts behind the belt like the press. A leg in
 * front of the belt would make the painter's sort cyclic in the lying pose.
 */
const GATE = { x: 5.6, w: 1.2, post: 0.25, top: 2.4, h: 0.7, z: BELT.z - 0.45, d: BELT.d + 0.75 };
export const ciPipeline = defineDrawing({
    id: 'ci-pipeline',
    name: 'CI/CD pipeline',
    category: 'code',
    tags: ['ci', 'cd', 'ci/cd', 'pipeline', 'build', 'test', 'deploy', 'devops', 'continuous integration', 'delivery', 'github actions', 'release', 'automation'],
    kind: 'scene',
    prompt: '/isometric create a CI/CD pipeline as a conveyor: commits come out of the repo, get built, pass tests and ship to production, for our DevOps landing page',
    description: 'A conveyor line on a deck. Code crates leave a repository cabinet, pass under a build press, under a test scanner with a lit status beacon and a checklist of passing suites, and roll into a production server at the far end. The crates move along the belt.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [10.6, 0.3, 4.6], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 10.2, h: 4.2, r: 0.12, stroke: 'soft' }, slots(1.5, 4.0, 36, 0.2, 0.2, 'v')] } }),
        // Repository cabinet: a terminal on the front, a chute where the belt starts.
        box([0.3, 0.3, 1.1], [1.3, 2.6, 2.2], {
            id: 'repo', r: 0.05,
            decals: {
                front: [
                    { t: 'rect', x: 0.15, y: 0.2, w: 1.0, h: 0.8, r: 0.05, fill: 'ink' },
                    { t: 'line', pts: [[0.26, 0.34], [0.34, 0.39], [0.26, 0.44]], stroke: 'detail', width: 1 },
                    ...textLines(0.4, 0.36, 0.6, [1, 0.7], 0.13, 0.05, 'detail'),
                    ...textLines(0.26, 0.62, 0.8, [0.9, 0.6, 0.75], 0.12, 0.05, 'soft'),
                    slots(0.2, 1.3, 10, 0.1, 0.9, 'v'),
                    { t: 'circle', cx: 1.05, cy: 2.35, r: 0.06, fill: 'ink' },
                ],
                right: [{ t: 'rect', x: 0.45, y: 1.3, w: 1.3, h: 0.95, r: 0.06, fill: 'ink' }, slots(0.4, 0.25, 8, 0.2, 0.7, 'v')],
                top: [{ t: 'rect', x: 0.15, y: 0.15, w: 1.0, h: 1.9, r: 0.06, stroke: 'soft' }],
            },
        }),
        // Belt.
        box([BELT.x0, BELT.y, BELT.z], [BELT.x1 - BELT.x0, BELT.h, BELT.d], {
            id: 'belt', role: 'detail',
            decals: {
                top: [slots(0.12, 0.06, 37, 0.2, BELT.d - 0.12, 'v')],
                front: [
                    { t: 'rect', x: 0.05, y: 0.06, w: BELT.x1 - BELT.x0 - 0.1, h: 0.14, r: 0.04, fill: 'face' },
                    ...Array.from({ length: 10 }, (_, k) => ({ t: 'circle', cx: 0.4 + k * 0.75, cy: 0.4, r: 0.11, fill: 'face', stroke: 'soft' })),
                ],
            },
        }),
        ...[0, 1, 2, 3].map(crate),
        // Build press: two posts behind the belt and a cantilevered head with a ram.
        box([PRESS.x, 0.3, BELT.z - 0.45], [PRESS.post, PRESS.top - 0.3, 0.4], { id: 'press-post-a', role: 'detail' }),
        box([PRESS.x + PRESS.w - PRESS.post, 0.3, BELT.z - 0.45], [PRESS.post, PRESS.top - 0.3, 0.4], { id: 'press-post-b', role: 'detail' }),
        box([PRESS.x, PRESS.top, BELT.z - 0.45], [PRESS.w, 0.8, BELT.d + 0.75], {
            id: 'press-head', r: 0.05,
            decals: {
                front: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.75, h: 0.5, r: 0.04, fill: 'ink' }, ...grid(0.24, 0.27, 3, 2, 0.15, 0.08, 0.06, { fill: 'detail', stroke: false }), slots(1.05, 0.15, 5, 0.1, 0.5, 'v')],
                right: [slots(0.2, 0.15, 9, 0.18, 0.5, 'v')],
                top: [{ t: 'circle', cx: PRESS.w / 2, cy: 1.0, r: 0.3, stroke: 'soft' }],
            },
        }),
        cyl([PRESS.x + PRESS.w / 2, PRESS.top - 0.55, BELT.z + BELT.d / 2], 0.22, 0.55, { id: 'press-ram', role: 'ink', n: 20 }),
        cyl([PRESS.x + PRESS.w / 2, PRESS.top - 0.65, BELT.z + BELT.d / 2], 0.38, 0.1, { id: 'press-plate', role: 'detail', n: 28 }),
        // Test scanner: a checklist of passing suites on its face, a scan plate over the belt, a beacon on top.
        box([GATE.x, 0.3, GATE.z], [GATE.post, GATE.top - 0.3, 0.4], { id: 'gate-post-a', role: 'face' }),
        box([GATE.x + GATE.w - GATE.post, 0.3, GATE.z], [GATE.post, GATE.top - 0.3, 0.4], { id: 'gate-post-b', role: 'face' }),
        box([GATE.x, GATE.top, GATE.z], [GATE.w, GATE.h, GATE.d], {
            id: 'gate-head', r: 0.05,
            decals: {
                front: [
                    { t: 'rect', x: 0.08, y: 0.08, w: GATE.w - 0.16, h: GATE.h - 0.16, r: 0.04, fill: 'ink' },
                    ...[0, 1, 2].flatMap((k) => [
                        { t: 'rect', x: 0.18 + k * 0.32, y: 0.16, w: 0.2, h: 0.2, r: 0.03, fill: 'face' },
                        { t: 'line', pts: [[0.22 + k * 0.32, 0.26], [0.27 + k * 0.32, 0.31], [0.35 + k * 0.32, 0.2]], stroke: 'accent', width: 1.3 },
                        { t: 'bar', x: 0.18 + k * 0.32, y: 0.45, w: 0.2, h: 0.05, fill: 'detail' },
                    ]),
                ],
                right: [slots(0.25, 0.15, 12, 0.12, 0.4, 'v')],
                top: [{ t: 'rect', x: 0.15, y: 0.15, w: GATE.w - 0.3, h: GATE.d - 0.3, r: 0.06, stroke: 'soft' }],
            },
        }),
        box([GATE.x + 0.15, GATE.top - 0.08, BELT.z + 0.1], [GATE.w - 0.3, 0.08, BELT.d - 0.2], { id: 'scan-plate', role: 'ink' }),
        cyl([GATE.x + GATE.w / 2, GATE.top + GATE.h, GATE.z + GATE.d / 2], 0.16, 0.1, { id: 'beacon-base', role: 'ink', n: 18 }),
        cyl([GATE.x + GATE.w / 2, GATE.top + GATE.h + 0.1, GATE.z + GATE.d / 2], 0.12, 0.2, { id: 'beacon', role: 'accent', n: 18 }),
        // Production server receiving the crates.
        box([BELT.x1, 0.3, 1.0], [1.3, 3.0, 2.4], {
            id: 'prod', r: 0.05, role: 'body',
            decals: {
                front: [
                    ...[0, 1, 2, 3, 4, 5].flatMap((k) => [
                        { t: 'rect', x: 0.12, y: 0.2 + k * 0.42, w: 1.06, h: 0.34, r: 0.03, fill: 'face', stroke: 'soft' },
                        { t: 'bar', x: 0.22, y: 0.34 + k * 0.42, w: 0.4, h: 0.06, fill: 'detail' },
                        { t: 'circle', cx: 1.0, cy: 0.37 + k * 0.42, r: 0.04, fill: k === 2 ? 'accent' : 'ink' },
                    ]),
                    slots(0.2, 2.8, 10, 0.1, 0.1, 'v'),
                ],
                right: [slots(0.3, 0.3, 10, 0.18, 2.4, 'v')],
                top: [{ t: 'rect', x: 0.15, y: 0.15, w: 1.0, h: 2.1, r: 0.06, stroke: 'soft' }],
            },
        }),
    ],
    motion: {
        duration: 2.2,
        label: 'crates roll down the pipeline',
        tracks: [{ group: 'crates', t: [CRATE.pitch, 0, 0], ease: 'linear', mode: 'loop' }],
    },
});
/* ----------------------------------------------------------- website builder */
const BR = { w: 7.2, h: 0.25, d: 5.6 };
const PAGE = { x: 0.3, z: 0.9, w: 6.6, d: 4.5 };
const BLK = { x: 0.5, w: 6.2 };
const CARD = { z: 3.6, d: 1.45, w: 1.95, gap: 0.175, h: 0.2 };
const cardX = (k) => BLK.x + k * (CARD.w + CARD.gap);
const LIFT = 1.05;
const cardTop = (lit = false) => [
    { t: 'rect', x: 0.15, y: 0.12, w: CARD.w - 0.3, h: 0.62, r: 0.05, fill: lit ? 'face' : 'detail', stroke: 'soft' },
    { t: 'line', pts: [[0.25, 0.66], [0.65, 0.34], [0.9, 0.56], [1.15, 0.4], [1.55, 0.66]], stroke: 'soft', closed: false },
    ...textLines(0.15, 0.88, CARD.w - 0.3, [0.8, 1, 0.55], 0.14, 0.06, lit ? 'face' : 'soft'),
    { t: 'rect', x: 0.15, y: 1.25, w: 0.6, h: 0.12, r: 0.06, fill: lit ? 'face' : 'detail' },
];
/** Mouse pointer outline in the top-face plane, tip at (0, 0). */
const pointer = [[0, 0], [0, 0.62], [0.15, 0.5], [0.26, 0.74], [0.36, 0.7], [0.25, 0.46], [0.44, 0.44]];
export const siteBuilder = defineDrawing({
    id: 'site-builder',
    name: 'Website builder',
    category: 'code',
    tags: ['website', 'web', 'builder', 'page', 'layout', 'drag and drop', 'no-code', 'cms', 'wireframe', 'frontend', 'components', 'landing page', 'browser'],
    kind: 'scene',
    prompt: '/isometric create a website being assembled from blocks inside a browser window, with a card being dragged into place, for our page builder feature',
    description: 'A browser window lies flat with tabs and an address bar. Its page is built from raised blocks: a navigation bar, a hero with heading, button and picture, and a row of cards with one empty slot. The pointer drags the lit card down into the slot; spare components wait on a palette tray beside the window.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [BR.w, BR.h, BR.d], {
            id: 'browser', r: 0.16, role: 'face',
            decals: {
                top: [
                    ...[0.3, 0.5, 0.7].map((cx) => ({ t: 'circle', cx, cy: 0.42, r: 0.07, fill: 'detail', stroke: 'soft' })),
                    { t: 'rect', x: 1.0, y: 0.18, w: 1.6, h: 0.52, r: 0.08, fill: 'bg', stroke: 'soft' },
                    { t: 'bar', x: 1.2, y: 0.4, w: 0.9, h: 0.08, fill: 'detail' },
                    { t: 'bar', x: 2.85, y: 0.4, w: 0.7, h: 0.08, fill: 'soft' },
                    { t: 'rect', x: 3.9, y: 0.24, w: 3.0, h: 0.36, r: 0.18, stroke: 'soft' },
                    { t: 'circle', cx: 4.1, cy: 0.42, r: 0.06, fill: 'accent' },
                    { t: 'bar', x: 4.25, y: 0.39, w: 1.5, h: 0.07, fill: 'soft' },
                    { t: 'rect', x: PAGE.x, y: PAGE.z, w: PAGE.w, h: PAGE.d, r: 0.08, fill: 'bg', stroke: 'soft' },
                    // The empty card slot.
                    { t: 'rect', x: cardX(1) - 0.02, y: CARD.z - 0.02, w: CARD.w + 0.04, h: CARD.d + 0.04, r: 0.06, fill: 'soft', stroke: true, opacity: 0.4 },
                    slots(cardX(1) + 0.2, CARD.z + 0.2, 8, 0.2, CARD.d - 0.4, 'v'),
                    // Footer.
                    ...textLines(BLK.x, 5.18, 1.6, [1], 0.1, 0.07, 'soft'),
                    ...textLines(BLK.x + 4.4, 5.18, 1.8, [1], 0.1, 0.07, 'soft'),
                ],
            },
        }),
        // Navigation block.
        box([BLK.x, BR.h, PAGE.z + 0.15], [BLK.w, 0.12, 0.5], {
            id: 'nav', r: 0.04,
            decals: { top: [{ t: 'circle', cx: 0.25, cy: 0.25, r: 0.13, fill: 'detail' }, ...[0, 1, 2, 3].map((k) => ({ t: 'bar', x: 2.6 + k * 0.62, y: 0.21, w: 0.45, h: 0.08, fill: 'detail' })), { t: 'rect', x: 5.25, y: 0.12, w: 0.8, h: 0.26, r: 0.13, fill: 'ink' }] },
        }),
        // Hero block.
        box([BLK.x, BR.h, 1.75], [BLK.w, 0.28, 1.65], {
            id: 'hero', r: 0.05,
            decals: {
                top: [
                    ...textLines(0.3, 0.3, 2.6, [1, 0.8], 0.26, 0.16, 'detail'),
                    ...textLines(0.3, 0.9, 2.4, [1, 0.85], 0.15, 0.06, 'soft'),
                    { t: 'rect', x: 0.3, y: 1.2, w: 0.9, h: 0.26, r: 0.13, fill: 'ink' },
                    { t: 'rect', x: 1.35, y: 1.2, w: 0.8, h: 0.26, r: 0.13, stroke: true },
                    { t: 'rect', x: 3.4, y: 0.2, w: 2.6, h: 1.25, r: 0.06, fill: 'detail', stroke: 'soft' },
                    { t: 'line', pts: [[3.5, 1.35], [4.3, 0.65], [4.75, 1.05], [5.15, 0.75], [5.9, 1.35]], stroke: true, closed: true, fill: 'face' },
                    { t: 'circle', cx: 5.45, cy: 0.5, r: 0.15, fill: 'face', stroke: 'soft' },
                ],
            },
        }),
        // Placed cards.
        box([cardX(0), BR.h, CARD.z], [CARD.w, CARD.h, CARD.d], { id: 'card-a', r: 0.05, decals: { top: cardTop() } }),
        box([cardX(2), BR.h, CARD.z], [CARD.w, CARD.h, CARD.d], { id: 'card-c', r: 0.05, decals: { top: cardTop() } }),
        // The card being dropped, with the pointer.
        box([cardX(1), BR.h + LIFT, CARD.z], [CARD.w, CARD.h, CARD.d], { id: 'card-new', r: 0.05, role: 'accent', group: 'drag', decals: { top: cardTop(true) } }),
        prism([0, BR.h + LIFT + CARD.h, 0], pointer.map(([u, v]) => [cardX(1) + 1.25 + u, CARD.z + 0.55 + v]), 0.07, { id: 'pointer', axis: 'y', role: 'ink', group: 'drag' }),
        // Component palette.
        box([7.5, 0, 0.6], [1.6, 0.18, 4.4], { id: 'palette', r: 0.1, role: 'detail', decals: { top: [{ t: 'segs', segs: [[0.15, 1.45, 1.45, 1.45], [0.15, 2.9, 1.45, 2.9]], stroke: 'soft' }] } }),
        box([7.7, 0.18, 0.8], [1.2, 0.12, 0.5], { id: 'chip-button', r: 0.05, decals: { top: [{ t: 'rect', x: 0.2, y: 0.12, w: 0.8, h: 0.26, r: 0.13, fill: 'ink' }] } }),
        box([7.7, 0.18, 1.45], [1.2, 0.12, 0.25], { id: 'chip-input', r: 0.04, decals: { top: [{ t: 'bar', x: 0.12, y: 0.09, w: 0.6, h: 0.07, fill: 'soft' }] } }),
        box([7.7, 0.18, 2.2], [1.2, 0.12, 1.0], { id: 'chip-image', r: 0.05, decals: { top: [{ t: 'rect', x: 0.12, y: 0.12, w: 0.96, h: 0.76, r: 0.04, fill: 'detail', stroke: 'soft' }, { t: 'line', pts: [[0.2, 0.8], [0.5, 0.45], [0.7, 0.62], [1.0, 0.8]], stroke: 'soft' }] } }),
        box([7.7, 0.18, 3.65], [1.2, 0.12, 0.45], { id: 'chip-text-a', r: 0.04, decals: { top: textLines(0.12, 0.1, 0.96, [1, 0.6], 0.16, 0.07, 'soft') } }),
        box([7.7, 0.3, 3.7], [1.2, 0.12, 0.45], { id: 'chip-text-b', r: 0.04, decals: { top: textLines(0.12, 0.1, 0.96, [0.8, 1], 0.16, 0.07, 'soft') } }),
    ],
    motion: {
        duration: 3,
        label: 'the card is dragged into its slot',
        tracks: [{ group: 'drag', t: [0, -LIFT, 0], from: 0.15, to: 0.85, ease: 'inOut' }],
    },
});
/* --------------------------------------------------------------- git graph */
const NODE_R = 0.32, NODE_H = 0.32, RAIL = { w: 0.16, h: 0.12 }, GY = 0.3;
const MAIN_Z = 3.4, FEAT_Z = 1.7, EXP_Z = 0.65;
const MAIN_X = [0.9, 2.1, 4.6, 7.7, 8.9], FEAT_X = [3.4, 4.9, 6.4], EXP_X = 5.9;
const SPLIT_X = MAIN_X[1], MERGE_X = MAIN_X[3];
const railX = (id, x0, x1, z, role = 'detail') => box([x0, GY, z - RAIL.w / 2], [x1 - x0, RAIL.h, RAIL.w], { id, role });
const railZ = (id, x, z0, z1, role = 'detail') => box([x - RAIL.w / 2, GY, z0], [RAIL.w, RAIL.h, z1 - z0], { id, role });
const commit = (id, x, z, role = 'body', r = NODE_R) => cyl([x, GY, z], r, NODE_H, { id, role, n: 32, decals: { top: [{ t: 'circle', cx: r, cy: r, r: r * 0.55, stroke: 'soft' }] } });
const FLAG = { x: MERGE_X, y: GY + NODE_H, z: MAIN_Z, pole: 1.9 };
export const gitGraph = defineDrawing({
    id: 'git-graph',
    name: 'Git branches',
    category: 'code',
    tags: ['git', 'branch', 'merge', 'commit', 'version control', 'pull request', 'github', 'gitlab', 'history', 'release', 'tag', 'source control'],
    kind: 'scene',
    prompt: '/isometric create a git history as a physical model: main, a feature branch that merges back and a release tag, for our version control docs',
    description: 'A git history built like a model railway on a board: commits are discs on rails. A feature branch splits off main, adds three commits and merges back into a lit merge commit, while an abandoned experiment branch dead-ends at the back. A release flag is raised on the merge commit.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9.8, GY, 4.4], {
            id: 'board', r: 0.15, role: 'face',
            decals: {
                top: [{ t: 'rect', x: 0.2, y: 0.2, w: 9.4, h: 4.0, r: 0.12, stroke: 'soft' }, { t: 'segs', segs: [[0.5, MAIN_Z, 0.58, MAIN_Z], [9.22, MAIN_Z, 9.4, MAIN_Z]], stroke: 'soft' }],
                front: [{ t: 'text', x: 0.4, y: 0.21, size: 0.16, text: 'main' }],
            },
        }),
        // Main line.
        ...MAIN_X.map((x, k) => commit(`main${k}`, x, MAIN_Z, k === 3 ? 'accent' : 'body', k === 3 ? 0.42 : NODE_R)),
        railX('rail-m0', MAIN_X[0] + NODE_R, MAIN_X[1] - NODE_R, MAIN_Z),
        railX('rail-m1', MAIN_X[1] + NODE_R, MAIN_X[2] - NODE_R, MAIN_Z),
        railX('rail-m2', MAIN_X[2] + NODE_R, MAIN_X[3] - 0.42, MAIN_Z),
        railX('rail-m3', MAIN_X[3] + 0.42, MAIN_X[4] - NODE_R, MAIN_Z),
        railX('rail-m-tail', MAIN_X[4] + NODE_R, 9.5, MAIN_Z, 'ink'),
        // Feature branch: split, three commits, merge.
        railZ('rail-split', SPLIT_X, FEAT_Z - RAIL.w / 2, MAIN_Z - NODE_R),
        railX('rail-f0', SPLIT_X + RAIL.w / 2, FEAT_X[0] - NODE_R, FEAT_Z),
        ...FEAT_X.map((x, k) => commit(`feat${k}`, x, FEAT_Z, 'face')),
        railX('rail-f1', FEAT_X[0] + NODE_R, FEAT_X[1] - NODE_R, FEAT_Z),
        railX('rail-f2', FEAT_X[1] + NODE_R, FEAT_X[2] - NODE_R, FEAT_Z),
        railX('rail-f3', FEAT_X[2] + NODE_R, MERGE_X - RAIL.w / 2, FEAT_Z),
        railZ('rail-merge', MERGE_X, FEAT_Z - RAIL.w / 2, MAIN_Z - 0.42),
        // Abandoned experiment off the first feature commit.
        railZ('rail-exp', FEAT_X[0], EXP_Z - RAIL.w / 2, FEAT_Z - NODE_R, 'ink'),
        railX('rail-e0', FEAT_X[0] + RAIL.w / 2, EXP_X - NODE_R, EXP_Z, 'ink'),
        commit('exp0', EXP_X, EXP_Z, 'detail'),
        box([EXP_X + NODE_R + 0.1, GY, EXP_Z - 0.2], [0.12, 0.45, 0.4], { id: 'buffer', r: 0.04, role: 'ink' }),
        // Release flag on the merge commit.
        cyl([FLAG.x, FLAG.y, FLAG.z], 0.05, FLAG.pole, { id: 'flag-pole', role: 'ink', n: 10 }),
        ball([FLAG.x, FLAG.y + FLAG.pole + 0.07, FLAG.z], 0.07, { id: 'flag-knob', role: 'ink' }),
        prism([FLAG.x + 0.05, FLAG.y + 0.5, FLAG.z - 0.02], [[0, 0], [0.75, 0.18], [0, 0.36]].map(([u, v]) => [u, 0.36 - v]), 0.04, { id: 'flag', axis: 'z', role: 'accent', group: 'flag' }),
        // Pull request card propped beside the merge.
        box([8.25, GY, 1.2], [1.3, 0.1, 1.5], {
            id: 'pr-card', r: 0.06,
            decals: { top: [{ t: 'circle', cx: 0.22, cy: 0.25, r: 0.1, fill: 'detail' }, ...textLines(0.42, 0.2, 0.75, [1, 0.6], 0.14, 0.06, 'detail'), { t: 'segs', segs: [[0.12, 0.55, 1.18, 0.55]], stroke: 'soft' }, ...textLines(0.15, 0.7, 1.0, [1, 0.8, 0.9], 0.15, 0.05, 'soft'), { t: 'rect', x: 0.15, y: 1.17, w: 0.55, h: 0.18, r: 0.09, fill: 'accent' }] },
        }),
    ],
    motion: {
        duration: 2.6,
        label: 'the release flag is raised',
        tracks: [{ group: 'flag', t: [0, FLAG.pole - 0.95, 0], from: 0.1, to: 0.8, ease: 'out' }],
    },
});
/* ---------------------------------------------------------------- bug hunt */
const SHEET = { x: 0.6, y: 0.25, z: 0.6, w: 4.6, h: 0.08, d: 3.7 };
const SY = SHEET.y + SHEET.h;
const BUG = { x: 2.7, z: 2.55, w: 0.72, d: 0.52, legY: SY, bodyY: SY + 0.05 };
const LENS = { x: 3.0, y: 1.55, z: 2.55, r: 0.85 };
const sheetTop = [
    { t: 'rect', x: 0.15, y: 0.15, w: 0.4, h: SHEET.d - 0.3, r: 0.04, fill: 'detail', opacity: 0.4 },
    ...Array.from({ length: 13 }, (_, k) => ({ t: 'bar', x: 0.25, y: 0.3 + k * 0.25, w: 0.18, h: 0.06, fill: 'soft' })),
    { t: 'circle', cx: 0.34, cy: 1.83, r: 0.08, fill: 'ink' },
    { t: 'rect', x: 0.6, y: 1.73, w: SHEET.w - 0.75, h: 0.24, r: 0.04, fill: 'detail', opacity: 0.6 },
    ...codeBars(0.75, 0.3, 0.2, [[0, 8], [1, 12], [1, 6], [2, 10], [2, 7], [3, 9], [2, 14], [1, 5], [1, 11], [2, 8], [2, 12], [1, 4], [0, 3]], 0.25, 0.07, 'soft'),
];
const leg = (k, side) => {
    const x = BUG.x - 0.22 + k * 0.22, z0 = BUG.z + side * (BUG.d / 2);
    return box([x - 0.025, BUG.legY, side > 0 ? z0 : z0 - 0.2], [0.05, 0.04, 0.2], { id: `leg${k}${side > 0 ? 'f' : 'b'}`, role: 'ink', group: 'bug' });
};
const antenna = (side) => {
    const hx = BUG.x + BUG.w / 2 + 0.26;
    return box([hx, SY + 0.22, BUG.z - 0.015], [0.32, 0.03, 0.03], {
        id: `antenna-${side > 0 ? 'f' : 'b'}`, role: 'ink', group: 'bug',
        rot: [{ axis: 'y', deg: side * -30, pivot: [hx, SY + 0.22, BUG.z] }, { axis: 'z', deg: 20, pivot: [hx, SY + 0.22, BUG.z] }],
    });
};
export const bugHunt = defineDrawing({
    id: 'bug-hunt',
    name: 'Bug hunt',
    category: 'code',
    tags: ['bug', 'debug', 'debugging', 'error', 'issue', 'qa', 'testing', 'magnifier', 'breakpoint', 'stack trace', 'troubleshooting', 'code review'],
    kind: 'scene',
    prompt: '/isometric create a debugging scene: a bug crawling across a code listing under a magnifying glass, with a call stack beside it, for our error monitoring product',
    description: 'A code listing lies on a mat with line numbers, a breakpoint dot and the failing line highlighted. A lit beetle crawls along that line while a magnifying glass follows it. A stack of call-stack cards sits to the side.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [7.4, 0.25, 5.0], { id: 'mat', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 7.0, h: 4.6, r: 0.12, stroke: 'soft' }] } }),
        box([SHEET.x, SHEET.y, SHEET.z], [SHEET.w, SHEET.h, SHEET.d], { id: 'listing', r: 0.06, decals: { top: sheetTop } }),
        // The bug.
        ...[0, 1, 2].flatMap((k) => [leg(k, -1), leg(k, 1)]),
        box([BUG.x - BUG.w / 2, BUG.bodyY, BUG.z - BUG.d / 2], [BUG.w, 0.24, BUG.d], {
            id: 'bug-shell', r: 0.24, role: 'accent', group: 'bug',
            decals: { top: [{ t: 'segs', segs: [[0.08, BUG.d / 2, BUG.w - 0.08, BUG.d / 2]], stroke: true }, { t: 'circle', cx: 0.3, cy: 0.15, r: 0.05, fill: 'ink' }, { t: 'circle', cx: 0.3, cy: BUG.d - 0.15, r: 0.05, fill: 'ink' }] },
        }),
        ball([BUG.x + BUG.w / 2 + 0.13, BUG.bodyY + 0.13, BUG.z], 0.13, { id: 'bug-head', role: 'ink', group: 'bug' }),
        antenna(-1), antenna(1),
        // Magnifying glass.
        cyl([LENS.x, LENS.y, LENS.z], LENS.r + 0.08, 0.12, { id: 'lens', role: 'glass', group: 'lens', n: 48, decals: { top: [{ t: 'circle', cx: LENS.r + 0.08, cy: LENS.r + 0.08, r: LENS.r, stroke: true }] } }),
        box([LENS.x + LENS.r + 0.08, LENS.y + 0.02, LENS.z - 0.07], [0.3, 0.08, 0.14], { id: 'lens-collar', role: 'detail', group: 'lens' }),
        box([LENS.x + LENS.r + 0.38, LENS.y - 0.02, LENS.z - 0.11], [1.2, 0.16, 0.22], {
            id: 'lens-handle', r: 0.08, axis: 'x', role: 'ink', group: 'lens',
            rot: [{ axis: 'z', deg: 18, pivot: [LENS.x + LENS.r + 0.38, LENS.y + 0.06, LENS.z] }],
        }),
        // Call stack.
        ...[0, 1, 2].map((k) => box([5.6 - k * 0.08, 0.25 + k * 0.1, 0.7 + k * 0.12], [1.4, 0.1, 1.9], {
            id: `frame${k}`, r: 0.05, role: k === 2 ? 'face' : 'detail',
            decals: k === 2 ? {
                top: [
                    { t: 'rect', x: 0.12, y: 0.15, w: 1.16, h: 0.3, r: 0.04, fill: 'detail' },
                    { t: 'circle', cx: 0.25, cy: 0.3, r: 0.06, fill: 'accent' },
                    { t: 'bar', x: 0.38, y: 0.27, w: 0.7, h: 0.06, fill: 'face' },
                    ...textLines(0.2, 0.65, 1.0, [1, 0.7, 0.85, 0.6, 0.9, 0.5], 0.2, 0.06, 'soft'),
                ],
            } : undefined,
        })),
    ],
    motion: {
        duration: 3.2,
        label: 'the bug crawls and the magnifier follows',
        tracks: [
            { group: 'bug', t: [1.0, 0, 0], ease: 'inOut' },
            { group: 'lens', t: [0.8, 0, 0], from: 0.15, to: 1, ease: 'inOut' },
        ],
    },
});
