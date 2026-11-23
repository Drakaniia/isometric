/**
 * Media scenes, part two: a video editing suite with a moving timeline
 * playhead and a cinema screening room with a projector beam.
 */
import { defineDrawing, box, cbox, cyl, ball, grid, slots, textLines, tickRing } from '../build.js';
const CREATED = '2026-11-14';
const rad = (deg) => (deg * Math.PI) / 180;
/** Spokes from a centre, as one segs decal. */
const spokes = (cx, cy, r0, r1, n, off = 0) => ({
    t: 'segs', stroke: 'soft',
    segs: Array.from({ length: n }, (_, i) => {
        const a = rad(off + (i * 360) / n);
        return [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1];
    }),
});
/* --------------------------------------------------------------- editing suite */
const ES = { w: 9.4, h: 0.3, d: 7.2 };
const DESK_TOP = 1.56;
const MON = { x: 1.9, y: 2.4, z: 3.0, w: 5.6, h: 3.0, d: 0.2 };
const SCREEN_Z = MON.z + MON.d; // 3.2
const mx = (u) => MON.x + u;
const my = (v) => MON.y + MON.h - v;
/** Timeline rows: [row index, clips as [start u, length]]. */
const ROWS = [
    { v: 1.85, kind: 'video', clips: [[1.0, 1.3], [2.6, 1.1], [4.0, 1.0]] },
    { v: 2.1, kind: 'video', clips: [[0.6, 1.9], [2.5, 1.3], [3.9, 1.4]] },
    { v: 2.35, kind: 'audio', clips: [[0.6, 2.6], [3.3, 2.0]] },
    { v: 2.6, kind: 'audio', clips: [[0.6, 1.2], [1.9, 2.4], [4.4, 0.9]] },
];
const wave = (len, seed) => ({
    t: 'segs', stroke: 'soft',
    segs: Array.from({ length: Math.floor(len / 0.06) }, (_, i) => {
        const a = 0.02 + 0.07 * Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.31));
        return [0.05 + i * 0.06, 0.1 - a, 0.05 + i * 0.06, 0.1 + a];
    }),
});
const timelineClips = () => {
    const out = [];
    ROWS.forEach((row, r) => row.clips.forEach(([u, len], c) => {
        out.push(box([mx(u), my(row.v + 0.2), SCREEN_Z], [len, 0.2, 0.05], {
            id: `clip${r}${c}`, r: 0.03, axis: 'z',
            role: r === 1 && c === 0 ? 'accent' : row.kind === 'video' ? 'face' : 'detail',
            decals: row.kind === 'audio' ? { front: [wave(len, r * 3 + c)] } : { front: [{ t: 'bar', x: 0.08, y: 0.08, w: Math.min(0.5, len - 0.2), h: 0.05, fill: 'soft' }] },
        }));
    }));
    return out;
};
const monitorFront = () => {
    const out = [{ t: 'rect', x: 0.1, y: 0.1, w: MON.w - 0.2, h: MON.h - 0.2, r: 0.08, fill: 'bg', stroke: 'soft' }];
    // Menu bar.
    out.push(...[0, 1, 2, 3].map((k) => ({ t: 'bar', x: 0.25 + k * 0.5, y: 0.2, w: 0.36, h: 0.06, fill: 'detail' })));
    out.push({ t: 'circle', cx: MON.w - 0.3, cy: 0.23, r: 0.06, fill: 'ink' });
    // Bin panel with thumbnails.
    out.push({ t: 'rect', x: 3.65, y: 0.38, w: 1.75, h: 1.05, r: 0.05, stroke: 'soft' });
    for (let i = 0; i < 6; i++) {
        out.push({ t: 'rect', x: 3.75 + (i % 3) * 0.55, y: 0.5 + Math.floor(i / 3) * 0.45, w: 0.5, h: 0.36, r: 0.03, fill: i === 4 ? 'accent' : 'detail', stroke: 'soft' });
    }
    // Transport controls under the preview.
    out.push({ t: 'circle', cx: 1.6, cy: 1.58, r: 0.07, stroke: 'soft' });
    out.push({ t: 'line', closed: true, fill: 'ink', pts: [[1.55, 1.52], [1.55, 1.64], [1.66, 1.58]] });
    out.push({ t: 'circle', cx: 1.95, cy: 1.58, r: 0.07, stroke: 'soft' });
    out.push({ t: 'circle', cx: 1.25, cy: 1.58, r: 0.07, stroke: 'soft' });
    out.push({ t: 'bar', x: 2.4, y: 1.55, w: 0.8, h: 0.06, fill: 'soft' });
    // Timeline ruler and track labels.
    out.push({ t: 'segs', segs: Array.from({ length: 48 }, (_, i) => [0.6 + i * 0.1, i % 5 === 0 ? 1.7 : 1.74, 0.6 + i * 0.1, 1.78]), stroke: 'soft' });
    ROWS.forEach((row) => {
        out.push({ t: 'bar', x: 0.2, y: row.v + 0.07, w: 0.3, h: 0.06, fill: 'detail' });
        out.push({ t: 'rect', x: 0.6, y: row.v, w: 4.7, h: 0.2, r: 0.03, stroke: 'soft', opacity: 0.6 });
    });
    return out;
};
const previewDecals = [
    { t: 'circle', cx: 2.4, cy: 0.38, r: 0.18, fill: 'accent' },
    { t: 'line', closed: true, fill: 'detail', stroke: 'soft', pts: [[0, 1.05], [0, 0.75], [0.7, 0.5], [1.3, 0.75], [1.9, 0.4], [2.6, 0.7], [3.2, 0.55], [3.2, 1.05]] },
    { t: 'bar', x: 0.12, y: 0.9, w: 0.5, h: 0.06, fill: 'ink' },
];
const editSpeaker = (x, id) => box([x, DESK_TOP, 2.7], [0.7, 1.2, 0.7], {
    id, r: 0.06, role: 'body',
    decals: { front: [{ t: 'circle', cx: 0.35, cy: 0.82, r: 0.22, stroke: true }, { t: 'circle', cx: 0.35, cy: 0.82, r: 0.08, fill: 'ink' }, { t: 'circle', cx: 0.35, cy: 0.3, r: 0.1, stroke: true }] },
});
export const editingSuite = defineDrawing({
    id: 'editing-suite',
    name: 'Video editing suite',
    category: 'media',
    tags: ['video editing', 'editor', 'timeline', 'post production', 'film', 'nle', 'color grading', 'jog wheel', 'footage', 'clips', 'workstation', 'premiere', 'creator'],
    kind: 'scene',
    prompt: '/isometric create a video editing suite with a wide monitor showing a timeline, a jog wheel and a color grading panel, for our video editor landing page',
    description: 'A video editing desk with a wide monitor showing an editor: a preview window with a landscape frame, a media bin of thumbnails, transport controls and a ruled timeline whose video and audio clips are raised off the screen under a lit playhead. A keyboard, mouse, jog and shuttle console and a three-ball color grading panel share the desk with two speakers and a drawing tablet; a PC tower and drawer unit sit below, and a bookcase of film reels, cans and a slate stands behind. The playhead sweeps along the timeline while the jog wheel turns.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [ES.w, ES.h, ES.d], { id: 'floor', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: ES.w - 0.4, h: ES.d - 0.4, r: 0.12, stroke: 'soft' }] } }),
        // Desk.
        box([0.5, 1.4, 2.4], [8.4, 0.16, 3.8], { id: 'desk', r: 0.05, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 8.0, h: 3.4, r: 0.06, stroke: 'soft' }] } }),
        box([0.7, 0.3, 2.6], [0.18, 1.1, 3.4], { id: 'desk-leg0', role: 'detail' }),
        box([8.52, 0.3, 2.6], [0.18, 1.1, 3.4], { id: 'desk-leg1', role: 'detail' }),
        box([1.2, 0.3, 3.0], [1.0, 1.1, 1.8], { id: 'tower', r: 0.05, role: 'body', decals: { front: [slots(0.2, 0.2, 7, 0.1, 0.5, 'v'), { t: 'circle', cx: 0.7, cy: 0.85, r: 0.07, fill: 'accent' }, { t: 'rect', x: 0.2, y: 0.78, w: 0.35, h: 0.14, r: 0.04, stroke: 'soft' }] } }),
        box([7.2, 0.3, 2.8], [1.2, 1.1, 3.2], { id: 'drawers', r: 0.05, role: 'detail', decals: { front: [0, 1, 2].flatMap((k) => [{ t: 'rect', x: 0.1, y: 0.1 + k * 0.33, w: 1.0, h: 0.28, r: 0.04, stroke: 'soft' }, { t: 'bar', x: 0.4, y: 0.22 + k * 0.33, w: 0.4, h: 0.05, fill: 'ink' }]) } }),
        // Monitor.
        cbox(4.7, DESK_TOP, 3.1, [1.4, 0.06, 0.8], { id: 'mon-base', r: 0.06, role: 'detail' }),
        cbox(4.7, DESK_TOP + 0.06, 3.1, [0.4, 0.78, 0.15], { id: 'mon-neck', role: 'detail' }),
        box([MON.x, MON.y, MON.z], [MON.w, MON.h, MON.d], { id: 'monitor', r: 0.12, axis: 'z', role: 'body', decals: { front: monitorFront() } }),
        box([mx(0.25), my(0.38 + 1.05), SCREEN_Z], [3.2, 1.05, 0.06], { id: 'preview', r: 0.04, axis: 'z', role: 'face', decals: { front: previewDecals } }),
        ...timelineClips(),
        box([mx(0.9), my(2.85), SCREEN_Z + 0.05], [0.04, 1.2, 0.04], { id: 'playhead', role: 'accent', group: 'play' }),
        box([mx(0.9) - 0.09, my(1.65), SCREEN_Z + 0.05], [0.22, 0.1, 0.04], { id: 'playhead-cap', r: 0.02, role: 'accent', group: 'play' }),
        // Speakers, keyboard, mouse, tablet.
        editSpeaker(0.7, 'spk-l'),
        editSpeaker(7.9, 'spk-r'),
        box([1.9, DESK_TOP, 5.0], [3.0, 0.1, 1.0], { id: 'keyboard', r: 0.05, role: 'body', decals: { top: [...grid(0.12, 0.14, 12, 3, 0.2, 0.2, 0.04, { fill: 'face' }), { t: 'rect', x: 0.7, y: 0.78, w: 1.6, h: 0.14, r: 0.04, fill: 'face', stroke: 'soft' }] } }),
        cbox(5.15, DESK_TOP, 5.5, [0.3, 0.12, 0.5], { id: 'mouse', r: 0.12, role: 'body', decals: { top: [{ t: 'segs', segs: [[0.15, 0.04, 0.15, 0.22]], stroke: 'soft' }] } }),
        box([0.95, DESK_TOP, 4.7], [0.85, 0.05, 1.2], { id: 'tablet', r: 0.05, role: 'ink', decals: { top: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.65, h: 1.0, r: 0.04, stroke: 'soft' }] } }),
        cyl([1.4, DESK_TOP + 0.08, 5.0], 0.03, 0.55, { id: 'pen', axis: 'z', n: 8, role: 'accent' }),
        // Jog and shuttle console.
        box([5.5, DESK_TOP, 4.3], [1.7, 0.16, 1.7], { id: 'jog-base', r: 0.05, role: 'body', decals: { top: grid(0.15, 0.1, 5, 1, 0.22, 0.18, 0.06, { fill: 'detail' }) } }),
        cyl([6.35, DESK_TOP + 0.16, 5.3], 0.68, 0.05, { id: 'shuttle', n: 40, role: 'detail', decals: { top: [tickRing(0.68, 0.68, 0.64, 32, 4, 0.1)] } }),
        cyl([6.35, DESK_TOP + 0.21, 5.3], 0.5, 0.1, { id: 'jog', n: 36, role: 'face', group: 'jog', decals: { top: [tickRing(0.5, 0.5, 0.46, 24, 4, 0.08), { t: 'circle', cx: 0.5, cy: 0.5, r: 0.12, stroke: true }, { t: 'segs', segs: [[0.5, 0.5, 0.5, 0.1]], stroke: true }] } }),
        // Color grading panel.
        box([7.4, DESK_TOP, 4.2], [1.4, 0.18, 1.8], { id: 'color-base', r: 0.05, role: 'body' }),
        ...[4.5, 5.1, 5.7].flatMap((z, k) => [
            cyl([8.1, DESK_TOP + 0.18, z], 0.26, 0.05, { id: `ring${k}`, n: 28, role: 'detail' }),
            ball([8.1, DESK_TOP + 0.23 + 0.2, z], 0.2, { id: `ball${k}`, role: k === 1 ? 'accent' : 'face' }),
            cyl([7.58, DESK_TOP + 0.18, z], 0.06, 0.08, { id: `knob-l${k}`, n: 12, role: 'ink' }),
            cyl([8.62, DESK_TOP + 0.18, z], 0.06, 0.08, { id: `knob-r${k}`, n: 12, role: 'ink' }),
        ]),
        // Bookcase of film reels, cans and a slate.
        box([0.4, 0.3, 0.6], [0.12, 4.4, 0.8], { id: 'case-l', role: 'detail' }),
        box([2.28, 0.3, 0.6], [0.12, 4.4, 0.8], { id: 'case-r', role: 'detail', decals: { right: [slots(0.15, 0.3, 4, 0.15, 3.6, 'v')] } }),
        box([0.52, 0.3, 0.6], [1.76, 4.4, 0.1], { id: 'case-back', role: 'face' }),
        ...[0.3, 1.7, 3.1, 4.6].map((y, k) => box([0.52, y, 0.7], [1.76, 0.08, 0.7], { id: `shelf${k}`, role: 'detail' })),
        ...[1.0, 1.8].map((x, k) => cyl([x, 0.38 + 0.38, 0.8], 0.38, 0.12, { id: `reel${k}`, axis: 'z', n: 28, role: 'ink', decals: { front: [{ t: 'circle', cx: 0.38, cy: 0.38, r: 0.28, stroke: 'soft' }, { t: 'circle', cx: 0.38, cy: 0.38, r: 0.06, fill: 'face' }, spokes(0.38, 0.38, 0.12, 0.26, 5)] } })),
        ...[0, 1, 2].map((k) => cyl([1.0, 1.78 + k * 0.16, 1.05], 0.35, 0.16, { id: `can${k}`, n: 24, role: k === 2 ? 'face' : 'detail', decals: { top: [{ t: 'circle', cx: 0.35, cy: 0.35, r: 0.2, stroke: 'soft' }] } })),
        box([1.45, 1.78, 0.85], [0.7, 0.45, 0.5], { id: 'tape-case', r: 0.04, role: 'face', decals: { front: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.54, h: 0.1, r: 0.03, stroke: 'soft' }] } }),
        box([0.8, 3.18, 0.8], [1.0, 0.7, 0.06], { id: 'slate', r: 0.03, role: 'ink', decals: { front: [{ t: 'segs', stroke: 'face', segs: [[0.05, 0.28, 0.95, 0.28], [0.05, 0.5, 0.95, 0.5]] }, ...textLines(0.1, 0.1, 0.5, [1, 0.6], 0.1, 0.05, 'face')] } }),
        box([0.8, 3.88, 0.8], [1.0, 0.12, 0.1], { id: 'slate-stick', role: 'accent' }),
    ],
    motion: {
        duration: 3.4,
        label: 'the playhead sweeps the timeline and the jog wheel turns',
        tracks: [
            { group: 'play', t: [3.0, 0, 0], ease: 'inOut' },
            { group: 'jog', r: { axis: 'y', deg: 100, pivot: [6.35, 0, 5.3] }, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ cinema screening */
const CT = { w: 10.4, h: 0.3, d: 9.0 };
const TIERS = [
    { z: 3.3, top: 0.6 },
    { z: 4.8, top: 0.9 },
    { z: 6.3, top: 1.2 },
];
const TIER_D = 1.5;
const SCREEN = { x: 1.5, y: 1.2, z: 0.3, w: 7.4, h: 3.9, d: 0.12 };
const PROJ = { x: 5.2, y: 3.35, z: 6.7 };
const RAYS = [
    { id: 'c', to: [5.2, 3.15, 0.42] },
    { id: 'tl', to: [2.6, 4.8, 0.42] },
    { id: 'tr', to: [7.8, 4.8, 0.42] },
    { id: 'bl', to: [2.6, 1.6, 0.42] },
    { id: 'br', to: [7.8, 1.6, 0.42] },
];
const RAY_N = 5, RAY_F0 = 0.12, RAY_DF = 0.15;
const rayVec = (to) => [to[0] - PROJ.x, to[1] - PROJ.y, to[2] - PROJ.z];
const seatBlock = (x0, tier, p) => {
    const { z, top } = TIERS[tier];
    const zb = z + TIER_D - 0.25;
    const parts = [];
    parts.push(box([x0, top, zb - 0.5], [3.6, 0.28, 0.5], {
        id: `${p}-cushions`, r: 0.06, role: 'face',
        decals: { top: [{ t: 'segs', stroke: 'soft', segs: [1, 2, 3, 4].map((i) => [i * 0.72, 0.05, i * 0.72, 0.45]) }] },
    }));
    for (let i = 0; i < 5; i++) {
        const x = x0 + i * 0.72;
        parts.push(box([x + 0.04, top, zb], [0.64, 0.95, 0.2], {
            id: `${p}-back${i}`, r: 0.1, axis: 'z', role: 'body',
            decals: { front: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.44, h: 0.28, r: 0.06, stroke: 'soft' }, { t: 'segs', segs: [[0.32, 0.45, 0.32, 0.85]], stroke: 'soft' }] },
        }));
    }
    for (const i of [0, 5])
        parts.push(box([i ? x0 + 3.6 : x0 - 0.08, top, zb - 0.5], [0.08, 0.5, 0.5], { id: `${p}-arm${i}`, role: 'detail' }));
    return parts;
};
const screenDecals = [
    { t: 'rect', x: 0, y: 0, w: SCREEN.w, h: SCREEN.h, fill: 'ink' },
    { t: 'rect', x: 0.15, y: 0.15, w: SCREEN.w - 0.3, h: SCREEN.h - 0.3, r: 0.06, fill: 'bg', stroke: 'soft' },
    { t: 'circle', cx: 5.3, cy: 1.2, r: 0.55, fill: 'accent' },
    { t: 'line', closed: true, fill: 'detail', stroke: 'soft', pts: [[0.15, 3.0], [0.15, 2.4], [1.2, 1.6], [2.2, 2.3], [3.3, 1.2], [4.6, 2.4], [5.6, 1.9], [6.6, 2.5], [7.25, 2.2], [7.25, 3.0]] },
    { t: 'line', closed: true, fill: 'face', stroke: 'soft', pts: [[0.15, 3.75], [0.15, 3.0], [7.25, 3.0], [7.25, 3.75]] },
    { t: 'segs', segs: [[1.0, 0.9, 1.3, 0.8], [1.3, 0.8, 1.6, 0.9], [1.8, 0.6, 2.1, 0.5], [2.1, 0.5, 2.4, 0.6]], stroke: true },
    ...textLines(2.6, 3.3, 2.2, [1, 0.55], 0.2, 0.08, 'ink'),
];
export const cinemaTheater = defineDrawing({
    id: 'cinema-theater',
    name: 'Cinema screening room',
    category: 'media',
    tags: ['cinema', 'movie theater', 'movie', 'screen', 'projector', 'film', 'seats', 'screening', 'popcorn', 'streaming', 'theatre', 'curtain', 'entertainment', 'premiere'],
    kind: 'scene',
    prompt: '/isometric create a cinema screening room with a big screen, curtains, tiered seats and a projector throwing light at the screen, for our movie streaming page',
    description: 'A cinema auditorium cutaway. A large screen showing a sunset landscape hangs on a stage behind red curtains and a valance. Three rising tiers of padded seats with armrests and aisle lights face it, with a popcorn bucket in the aisle, wall sconces, posters and an exit door on the side wall. A film projector with two reels stands on the rear landing and throws a beam of light packets to the screen while the reels turn and the curtains part.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [CT.w, CT.h, CT.d], { id: 'floor', r: 0.1, role: 'face', decals: { top: [{ t: 'rect', x: 0.4, y: 2.2, w: CT.w - 0.8, h: 1.0, r: 0.05, stroke: 'soft' }] } }),
        // Walls.
        box([0, 0.3, 0], [CT.w, 5.8, 0.3], { id: 'wall-back', role: 'body' }),
        box([0, 0.3, 0.3], [0.3, 5.8, 8.7], {
            id: 'wall-left', role: 'face',
            decals: {
                right: [
                    ...[1.0, 3.1, 5.2].flatMap((u) => [{ t: 'rect', x: u, y: 0.4, w: 1.5, h: 1.2, r: 0.05, stroke: 'soft' }]),
                    { t: 'rect', x: 0.5, y: 2.0, w: 1.3, h: 3.8, r: 0.05, stroke: true },
                    { t: 'rect', x: 0.7, y: 2.2, w: 0.9, h: 1.5, r: 0.04, stroke: 'soft' },
                    { t: 'circle', cx: 1.55, cy: 4.0, r: 0.06, fill: 'ink' },
                    { t: 'rect', x: 3.0, y: 2.0, w: 1.2, h: 1.7, r: 0.04, fill: 'bg', stroke: true },
                    { t: 'circle', cx: 3.6, cy: 2.6, r: 0.25, stroke: 'soft' },
                    ...textLines(3.2, 3.2, 0.8, [1, 0.6], 0.12, 0.05),
                    { t: 'rect', x: 5.2, y: 2.0, w: 1.2, h: 1.7, r: 0.04, fill: 'bg', stroke: true },
                    { t: 'line', pts: [[5.3, 3.5], [5.6, 2.7], [5.8, 3.1], [6.0, 2.4], [6.3, 3.5]], stroke: 'soft' },
                    ...textLines(5.4, 3.3, 0.8, [1], 0.12, 0.05),
                ],
            },
        }),
        ...[2.4, 4.4, 6.4].map((z, k) => box([0.3, 3.4, z], [0.14, 0.5, 0.3], { id: `sconce${k}`, r: 0.04, role: 'detail' })),
        box([0.3, 4.5, 7.6], [0.1, 0.35, 0.8], { id: 'exit-sign', r: 0.04, role: 'face', decals: { right: [{ t: 'rect', x: 0.08, y: 0.07, w: 0.64, h: 0.2, r: 0.04, fill: 'ink' }, { t: 'bar', x: 0.16, y: 0.15, w: 0.48, h: 0.05, fill: 'face' }] } }),
        // Stage, screen, curtains and valance.
        box([0.3, 0.3, 0.3], [10.0, 0.3, 1.7], { id: 'stage', r: 0.04, role: 'detail', decals: { top: [{ t: 'segs', segs: Array.from({ length: 9 }, (_, i) => [0.5 + i * 1.05, 0.15, 0.5 + i * 1.05, 1.55]), stroke: 'soft' }] } }),
        box([4.2, 0.3, 2.0], [2.0, 0.15, 0.4], { id: 'stage-step', role: 'detail' }),
        box([SCREEN.x, SCREEN.y, SCREEN.z], [SCREEN.w, SCREEN.h, SCREEN.d], { id: 'screen', r: 0.05, role: 'ink', decals: { front: screenDecals } }),
        box([0.5, 0.6, 0.45], [1.8, 4.9, 0.45], { id: 'curtain-l', role: 'accent', group: 'curtL', decals: { front: [slots(0.15, 0.2, 10, 0.17, 4.5, 'v')] } }),
        box([8.1, 0.6, 0.45], [1.8, 4.9, 0.45], { id: 'curtain-r', role: 'accent', group: 'curtR', decals: { front: [slots(0.15, 0.2, 10, 0.17, 4.5, 'v')] } }),
        box([0.5, 5.5, 0.3], [9.4, 0.6, 0.6], { id: 'valance', r: 0.05, role: 'accent', decals: { front: [{ t: 'segs', segs: Array.from({ length: 36 }, (_, i) => [0.15 + i * 0.25, 0.1, 0.15 + i * 0.25, 0.5]), stroke: 'soft' }] } }),
        // Tiers with seats.
        ...TIERS.map(({ z, top }, k) => box([0.3, 0.3, z], [10.0, top - 0.3, TIER_D], {
            id: `tier${k}`, role: 'detail',
            decals: { top: [{ t: 'rect', x: 4.15, y: 0.1, w: 1.4, h: TIER_D - 0.2, r: 0.04, stroke: 'soft' }] },
        })),
        box([0.3, 0.3, 7.8], [10.0, 0.9, 1.2], { id: 'landing', role: 'detail', decals: { top: [{ t: 'rect', x: 0.3, y: 0.15, w: 9.4, h: 0.9, r: 0.04, stroke: 'soft' }] } }),
        ...[0, 1, 2].flatMap((tier) => [...seatBlock(0.9, tier, `L${tier}`), ...seatBlock(5.9, tier, `R${tier}`)]),
        ...[0, 1, 2].flatMap((tier) => [4.6, 5.72].map((x, k) => box([x, TIERS[tier].top, TIERS[tier].z + 0.55], [0.08, 0.04, 0.2], { id: `aisle${tier}${k}`, role: 'accent' }))),
        // Popcorn bucket in the aisle.
        cyl([5.2, 0.6, 3.9], 0.2, 0.5, { id: 'bucket', r2: 0.32, n: 24, role: 'face' }),
        ...[[5.12, 4.0], [5.3, 3.85], [5.2, 3.95], [5.05, 3.85], [5.35, 4.0]].map(([x, z], k) => ball([x, 1.15 + (k % 2) * 0.06, z], 0.1, { id: `corn${k}`, role: 'detail' })),
        // Projector on the rear landing.
        cyl([PROJ.x, 1.5, 8.2], 0.28, 1.5, { id: 'proj-post', n: 20, role: 'detail' }),
        box([4.2, 3.0, 7.4], [2.0, 0.75, 1.6], {
            id: 'proj-body', r: 0.06, role: 'body',
            decals: {
                front: [slots(0.2, 0.15, 10, 0.1, 0.4, 'v'), { t: 'circle', cx: 1.5, cy: 0.3, r: 0.1, fill: 'accent' }, { t: 'circle', cx: 1.75, cy: 0.3, r: 0.06, stroke: 'soft' }],
                right: [{ t: 'rect', x: 0.2, y: 0.15, w: 1.2, h: 0.45, r: 0.04, stroke: 'soft' }, slots(0.35, 0.25, 8, 0.12, 0.25, 'v')],
            },
        }),
        ...[4.7, 5.7].map((x, k) => cyl([x, 3.75, 8.2], 0.42, 0.08, {
            id: `reel${k}`, n: 32, role: 'face', group: `reel${k}`,
            decals: { top: [{ t: 'circle', cx: 0.42, cy: 0.42, r: 0.36, stroke: 'soft' }, spokes(0.42, 0.42, 0.1, 0.34, 3, k * 60), { t: 'circle', cx: 0.42, cy: 0.42, r: 0.08, fill: 'ink' }] },
        })),
        cyl([PROJ.x, PROJ.y, 7.4], 0.25, -0.5, { id: 'lens-barrel', axis: 'z', n: 24, role: 'detail' }),
        cyl([PROJ.x, PROJ.y, 6.9], 0.3, -0.2, { id: 'lens-hood', axis: 'z', n: 24, role: 'ink' }),
        // The light beam: packets streaming from the lens to the corners of the screen.
        ...RAYS.flatMap(({ id, to }) => {
            const v = rayVec(to);
            return Array.from({ length: RAY_N }, (_, i) => {
                const f = RAY_F0 + i * RAY_DF;
                return ball([PROJ.x + v[0] * f, PROJ.y + v[1] * f, PROJ.z + v[2] * f], 0.065, { id: `beam-${id}${i}`, role: 'accent', group: `beam-${id}` });
            });
        }),
    ],
    motion: {
        duration: 2.4,
        label: 'the projector throws light, the reels turn and the curtains part',
        tracks: [
            ...RAYS.map(({ id, to }) => {
                const v = rayVec(to);
                return { group: `beam-${id}`, t: [v[0] * RAY_DF, v[1] * RAY_DF, v[2] * RAY_DF], mode: 'loop', ease: 'linear' };
            }),
            { group: 'reel0', r: { axis: 'y', deg: 360, pivot: [4.7, 0, 8.2] }, mode: 'loop', ease: 'linear' },
            { group: 'reel1', r: { axis: 'y', deg: 360, pivot: [5.7, 0, 8.2] }, mode: 'loop', ease: 'linear' },
            { group: 'curtL', s: { k: [0.45, 1, 1], pivot: [0.5, 0, 0] }, from: 0.1, to: 0.9, ease: 'inOut' },
            { group: 'curtR', s: { k: [0.45, 1, 1], pivot: [9.9, 0, 0] }, from: 0.1, to: 0.9, ease: 'inOut' },
        ],
    },
});
