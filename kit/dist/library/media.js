/**
 * Media scenes: a film set with a dolly camera, a recording studio with a
 * mixing console and vocal booth, and a DJ booth with spinning decks.
 */
import { defineDrawing, box, cbox, cyl, prism, grid, slots, textLines, tickRing } from '../build.js';
const CREATED = '2026-11-14';
const rad = (deg) => (deg * Math.PI) / 180;
/** A thin quad strip from (x0, z0) to (x1, z1), `w` wide, as a 2D profile. */
function quad(x0, z0, x1, z1, w) {
    const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz);
    const nx = (-dz / l) * (w / 2), nz = (dx / l) * (w / 2);
    return [[x0 + nx, z0 + nz], [x1 + nx, z1 + nz], [x1 - nx, z1 - nz], [x0 - nx, z0 - nz]];
}
/** Crosshatch lines inside a w x h rectangle, as one segs decal (acoustic foam). */
function foam(w, h, s) {
    const segs = [];
    for (let c = -h; c < w; c += s) {
        const x0 = Math.max(c, 0), x1 = Math.min(w, c + h);
        if (x1 > x0)
            segs.push([x0, x0 - c, x1, x1 - c]);
    }
    for (let c = 0; c < w + h; c += s) {
        const x0 = Math.max(c - h, 0), x1 = Math.min(w, c);
        if (x1 > x0)
            segs.push([x0, c - x0, x1, c - x1]);
    }
    return { t: 'segs', segs, stroke: 'soft' };
}
/** Spokes from a centre, as one segs decal. */
const spokes = (cx, cy, r0, r1, n, off = 0) => ({
    t: 'segs', stroke: 'soft',
    segs: Array.from({ length: n }, (_, i) => {
        const a = rad(off + (i * 360) / n);
        return [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1];
    }),
});
/** A simple sofa along the x axis, back at z0 and seat facing +z. */
function sofa(x0, y0, z0, w, p, role = 'body') {
    return [
        box([x0, y0, z0], [w, 0.45, 1.0], { id: `${p}-base`, r: 0.06, role }),
        box([x0, y0 + 0.45, z0], [w, 0.7, 0.28], { id: `${p}-back`, r: 0.1, axis: 'z', role }),
        box([x0, y0 + 0.45, z0 + 0.28], [0.3, 0.4, 0.72], { id: `${p}-arm0`, r: 0.06, role: 'detail' }),
        box([x0 + w - 0.3, y0 + 0.45, z0 + 0.28], [0.3, 0.4, 0.72], { id: `${p}-arm1`, r: 0.06, role: 'detail' }),
        box([x0 + 0.3, y0 + 0.45, z0 + 0.28], [(w - 0.6) / 2, 0.18, 0.72], { id: `${p}-cush0`, r: 0.05, role: 'face' }),
        box([x0 + 0.3 + (w - 0.6) / 2, y0 + 0.45, z0 + 0.28], [(w - 0.6) / 2, 0.18, 0.72], { id: `${p}-cush1`, r: 0.05, role: 'face' }),
    ];
}
/* ------------------------------------------------------------------- film set */
const FS = { w: 9.8, h: 0.3, d: 7.2 };
const DOLLY = 'dolly';
const RAIL_Z = [2.5, 3.5];
const WHEEL_X = [1.35, 3.25];
const WY = 0.58;
const CZ = 3.05; // camera centre line
const CLAP = { x: 4.5, y: 1.72, z: 4.35, w: 1.3 };
const CLAP_PIVOT = [CLAP.x, CLAP.y, CLAP.z + 0.09];
/** Clapper stripes across a front face of width w and height h. */
const clapStripes = (w, h, n, a, b) => {
    const sw = w / n, sk = 0.1;
    return Array.from({ length: n }, (_, i) => {
        const cl = (x) => Math.max(0, Math.min(w, x));
        return {
            t: 'line', closed: true, stroke: 'soft', fill: i % 2 ? b : a,
            pts: [[cl(i * sw), h], [cl(i * sw + sk), 0], [cl((i + 1) * sw + sk), 0], [cl((i + 1) * sw), h]],
        };
    });
};
const filmDolly = () => {
    const g = { group: DOLLY };
    const parts = [];
    for (const [ix, x] of WHEEL_X.entries())
        for (const [iz, z] of RAIL_Z.entries()) {
            parts.push(cyl([x, WY, z], 0.15, 0.1, { id: `wheel${ix}${iz}`, axis: 'z', n: 20, role: 'ink', ...g }));
        }
    parts.push(box([1.0, 0.73, 2.35], [2.6, 0.14, 1.4], { id: 'dolly-deck', r: 0.05, role: 'detail', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 2.2, h: 1.0, r: 0.06, stroke: 'soft' }, slots(0.5, 0.35, 8, 0.2, 0.7, 'v')] }, ...g }), cyl([2.3, 0.87, CZ], 0.22, 0.9, { id: 'column', n: 24, ...g }), cbox(2.3, 1.77, CZ, [0.8, 0.3, 0.7], { id: 'fluid-head', r: 0.06, role: 'detail', ...g }), 
    // Camera body, lens and matte box.
    cbox(2.4, 2.07, CZ, [1.7, 0.85, 0.9], {
        id: 'cam-body', r: 0.08, role: 'body', ...g,
        decals: {
            front: [{ t: 'rect', x: 0.2, y: 0.15, w: 0.5, h: 0.2, r: 0.04, stroke: 'soft' }, slots(1.0, 0.18, 6, 0.08, 0.3, 'v'), { t: 'circle', cx: 1.5, cy: 0.62, r: 0.07, stroke: true }],
            top: [{ t: 'bar', x: 0.2, y: 0.12, w: 0.5, h: 0.06, fill: 'soft' }],
        },
    }), cyl([3.25, 2.5, CZ], 0.3, 0.5, { id: 'lens', axis: 'x', n: 28, role: 'detail', ...g, decals: { right: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.18, stroke: 'soft' }] } }), box([3.75, 2.14, 2.7], [0.7, 0.72, 0.7], {
        id: 'matte-box', r: 0.05, role: 'face', ...g,
        decals: { right: [{ t: 'circle', cx: 0.35, cy: 0.36, r: 0.27, fill: 'ink', stroke: true }, { t: 'circle', cx: 0.35, cy: 0.36, r: 0.14, fill: 'detail' }] },
    }), box([1.65, 2.92, 2.75], [1.2, 0.62, 0.5], {
        id: 'magazine', r: 0.1, axis: 'z', role: 'face', ...g,
        decals: { front: [{ t: 'circle', cx: 0.32, cy: 0.33, r: 0.2, stroke: true }, { t: 'circle', cx: 0.86, cy: 0.33, r: 0.2, stroke: true }, spokes(0.32, 0.33, 0.04, 0.17, 3), spokes(0.86, 0.33, 0.04, 0.17, 3, 60)] },
    }), cyl([1.55, 2.6, CZ], 0.2, -0.45, { id: 'eyepiece', axis: 'x', n: 20, role: 'detail', ...g }), cyl([1.1, 2.6, CZ], 0.26, -0.12, { id: 'eyecup', axis: 'x', n: 20, role: 'ink', ...g }), box([1.15, 2.07, 2.7], [0.4, 0.3, 0.7], { id: 'battery', r: 0.04, role: 'ink', ...g }), box([2.95, 2.92, 2.9], [0.2, 0.08, 0.2], { id: 'tally', r: 0.03, role: 'accent', ...g }));
    return parts;
};
export const filmSet = defineDrawing({
    id: 'film-set',
    name: 'Film set',
    category: 'media',
    tags: ['film', 'movie', 'cinema', 'camera', 'clapperboard', 'set', 'production', 'director', 'dolly', 'boom mic', 'video', 'studio', 'shoot', 'filmmaking'],
    kind: 'scene',
    prompt: '/isometric create a film set with a cinema camera on a dolly track, a clapperboard, a boom mic and studio light, for our video production page',
    description: 'A film set on a studio floor. A cinema camera with magazine, lens and matte box rides a dolly along rails toward a living-room set with painted flats, a sofa, coffee table and lamp. A clapperboard on an apple box snaps shut, a boom microphone in a fuzzy windshield swings over the set, a softbox on a stand lights the scene, and a video village monitor, director chair and flight cases wait in the foreground.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [FS.w, FS.h, FS.d], {
            id: 'floor', r: 0.15, role: 'face',
            decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: FS.w - 0.4, h: FS.d - 0.4, r: 0.12, stroke: 'soft' }, { t: 'segs', segs: [[3.9, 4.2, 3.9, 4.45], [3.78, 4.32, 4.02, 4.32], [3.2, 5.9, 3.2, 6.15], [3.08, 6.02, 3.32, 6.02]], stroke: 'soft' }] },
        }),
        // Dolly track.
        box([0.5, 0.3, 2.3], [4.8, 0.05, 1.5], { id: 'track-bed', role: 'detail', decals: { top: Array.from({ length: 10 }, (_, i) => ({ t: 'segs', segs: [[0.2 + i * 0.45, 0.1, 0.2 + i * 0.45, 1.4]], stroke: 'soft' })) } }),
        ...RAIL_Z.map((z, k) => box([0.5, 0.35, z], [4.8, 0.08, 0.1], { id: `rail${k}`, role: 'ink' })),
        ...filmDolly(),
        // Set: painted flats, rug, sofa, coffee table and lamp.
        box([5.4, 0.3, 0.3], [4.2, 3.6, 0.2], {
            id: 'back-flat', role: 'face',
            decals: {
                front: [
                    ...Array.from({ length: 10 }, (_, i) => ({ t: 'segs', segs: [[0.3 + i * 0.4, 0.2, 0.3 + i * 0.4, 2.3]], stroke: 'soft' })),
                    { t: 'segs', segs: [[0, 2.5, 4.2, 2.5], [0, 2.6, 4.2, 2.6]], stroke: 'soft' },
                    { t: 'rect', x: 0.5, y: 0.7, w: 1.6, h: 1.5, r: 0.04, fill: 'bg', stroke: true },
                    { t: 'segs', segs: [[1.3, 0.7, 1.3, 2.2], [0.5, 1.45, 2.1, 1.45]], stroke: true },
                    { t: 'rect', x: 2.9, y: 0.8, w: 0.8, h: 1.0, r: 0.03, fill: 'bg', stroke: true },
                    { t: 'circle', cx: 3.3, cy: 1.2, r: 0.2, stroke: 'soft' },
                ],
            },
        }),
        box([5.4, 0.3, 0.5], [0.2, 3.6, 3.0], { id: 'side-flat', role: 'detail', decals: { right: Array.from({ length: 6 }, (_, i) => ({ t: 'segs', segs: [[0.3 + i * 0.5, 0.2, 0.3 + i * 0.5, 3.3]], stroke: 'soft' })) } }),
        box([5.6, 0.3, 0.5], [3.9, 0.05, 3.6], { id: 'rug', r: 0.04, role: 'detail', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 3.5, h: 3.2, r: 0.05, stroke: 'soft' }, { t: 'rect', x: 0.4, y: 0.4, w: 3.1, h: 2.8, r: 0.05, stroke: 'soft' }] } }),
        ...sofa(5.8, 0.35, 0.6, 2.6, 'sofa'),
        box([6.4, 0.8, 2.3], [1.5, 0.1, 0.9], { id: 'table-top', r: 0.04, role: 'face' }),
        ...[[6.45, 2.35], [7.75, 2.35], [6.45, 3.05], [7.75, 3.05]].map(([x, z], k) => box([x, 0.35, z], [0.1, 0.45, 0.1], { id: `table-leg${k}`, role: 'detail' })),
        box([6.7, 0.9, 2.5], [0.55, 0.06, 0.4], { id: 'book', role: 'accent' }),
        cbox(9.0, 0.35, 1.0, [0.7, 0.7, 0.7], { id: 'side-table', r: 0.05, role: 'detail' }),
        cyl([9.0, 1.05, 1.0], 0.1, 0.35, { id: 'lamp-pole', n: 12, role: 'ink' }),
        cyl([9.0, 1.4, 1.0], 0.28, 0.4, { id: 'lamp-shade', r2: 0.18, n: 24, role: 'face' }),
        // Clapperboard on an apple box.
        box([4.4, 0.3, 4.2], [1.5, 0.5, 0.7], { id: 'apple-box', r: 0.04, role: 'detail', decals: { front: [{ t: 'rect', x: 0.4, y: 0.12, w: 0.7, h: 0.18, r: 0.08, stroke: 'soft' }] } }),
        box([CLAP.x, 0.8, CLAP.z], [CLAP.w, 0.8, 0.08], {
            id: 'clap-board', r: 0.03, role: 'ink',
            decals: { front: [{ t: 'segs', stroke: 'face', segs: [[0.05, 0.28, 1.25, 0.28], [0.05, 0.52, 1.25, 0.52], [0.65, 0.05, 0.65, 0.75]] }, ...textLines(0.1, 0.1, 0.45, [1, 0.6], 0.1, 0.05, 'face'), ...textLines(0.75, 0.1, 0.45, [0.7], 0.1, 0.05, 'face')] },
        }),
        box([CLAP.x, 1.6, CLAP.z], [CLAP.w, 0.12, 0.18], { id: 'clap-stick', role: 'face', decals: { front: clapStripes(CLAP.w, 0.12, 6, 'ink', 'face') } }),
        box([CLAP.x, CLAP.y, CLAP.z], [CLAP.w, 0.18, 0.18], {
            id: 'clap-arm', role: 'accent', group: 'clap', rot: [{ axis: 'z', deg: 24, pivot: CLAP_PIVOT }],
            decals: { front: clapStripes(CLAP.w, 0.18, 6, 'face', 'ink') },
        }),
        // Boom microphone.
        box([8.3, 0.3, 6.25], [1.2, 0.06, 0.1], { id: 'boom-foot0', role: 'detail' }),
        box([8.85, 0.3, 5.7], [0.1, 0.06, 1.2], { id: 'boom-foot1', role: 'detail' }),
        cyl([8.9, 0.36, 6.3], 0.05, 3.94, { id: 'boom-pole', n: 10, role: 'ink' }),
        cbox(8.9, 4.3, 6.3, [0.2, 0.2, 0.2], { id: 'boom-hub', role: 'detail' }),
        cyl([8.9, 4.4, 6.2], 0.05, -2.6, { id: 'boom-arm', axis: 'z', n: 10, role: 'ink', group: 'boom' }),
        cyl([8.9, 4.4, 6.4], 0.1, 0.5, { id: 'boom-weight', axis: 'z', n: 14, role: 'detail', group: 'boom' }),
        cyl([8.9, 4.4, 3.6], 0.22, -0.9, { id: 'windshield', axis: 'z', n: 20, r2: 0.16, role: 'face', group: 'boom', decals: { front: [{ t: 'circle', cx: 0.22, cy: 0.22, r: 0.12, stroke: 'soft' }] } }),
        // Softbox on a tripod.
        box([0.3, 0.3, 1.35], [1.2, 0.06, 0.1], { id: 'light-foot0', role: 'detail' }),
        box([0.85, 0.3, 0.8], [0.1, 0.06, 1.2], { id: 'light-foot1', role: 'detail' }),
        cyl([0.9, 0.36, 1.4], 0.06, 3.19, { id: 'light-pole', n: 10, role: 'ink' }),
        box([0.6, 3.55, 0.85], [0.55, 1.1, 1.1], {
            id: 'softbox', r: 0.06, role: 'face',
            decals: { right: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.9, h: 0.9, r: 0.05, stroke: true }, { t: 'segs', segs: [[0.55, 0.1, 0.55, 1.0], [0.1, 0.55, 1.0, 0.55]], stroke: 'soft' }] },
        }),
        // Video village monitor.
        box([2.2, 0.3, 5.5], [1.2, 0.06, 0.1], { id: 'vv-foot0', role: 'detail' }),
        box([2.75, 0.3, 5.0], [0.1, 0.06, 1.1], { id: 'vv-foot1', role: 'detail' }),
        cyl([2.8, 0.36, 5.55], 0.05, 1.55, { id: 'vv-pole', n: 10, role: 'ink' }),
        box([2.0, 1.91, 5.5], [1.6, 1.0, 0.12], {
            id: 'vv-screen', r: 0.06, axis: 'z', role: 'body',
            decals: { front: [{ t: 'rect', x: 0.1, y: 0.1, w: 1.4, h: 0.8, r: 0.04, fill: 'bg', stroke: 'soft' }, { t: 'segs', segs: [[0.2, 0.8, 1.4, 0.8], [0.3, 0.5, 0.3, 0.8], [1.3, 0.5, 1.3, 0.8], [0.3, 0.5, 1.3, 0.5]], stroke: 'soft' }, { t: 'circle', cx: 1.32, cy: 0.22, r: 0.06, fill: 'accent' }] },
        }),
        // Director's chair.
        ...[[7.8, 4.3, 1.05], [8.5, 4.3, 1.05], [7.8, 4.84, 1.5], [8.5, 4.84, 1.5]].map(([x, z, h], k) => box([x, 0.35, z], [0.08, h, 0.08], { id: `chair-leg${k}`, role: 'detail' })),
        box([7.88, 0.95, 4.38], [0.62, 0.05, 0.46], { id: 'chair-seat', role: 'face' }),
        box([7.8, 1.4, 4.38], [0.08, 0.06, 0.46], { id: 'chair-arm0', role: 'detail' }),
        box([8.5, 1.4, 4.38], [0.08, 0.06, 0.46], { id: 'chair-arm1', role: 'detail' }),
        box([7.88, 1.4, 4.84], [0.62, 0.4, 0.06], { id: 'chair-back', role: 'ink', decals: { front: [...textLines(0.1, 0.12, 0.42, [1, 0.6], 0.12, 0.05, 'face')] } }),
        // Flight cases.
        box([0.4, 0.3, 5.4], [1.6, 0.7, 1.0], { id: 'case-big', r: 0.04, role: 'ink', decals: { front: [{ t: 'rect', x: 0.2, y: 0.2, w: 0.3, h: 0.14, r: 0.03, fill: 'detail' }, { t: 'rect', x: 1.1, y: 0.2, w: 0.3, h: 0.14, r: 0.03, fill: 'detail' }, { t: 'segs', segs: [[0, 0.5, 1.6, 0.5]], stroke: 'soft' }] } }),
        box([0.5, 1.0, 5.5], [1.2, 0.5, 0.8], { id: 'case-small', r: 0.04, role: 'detail', decals: { front: [{ t: 'rect', x: 0.4, y: 0.18, w: 0.4, h: 0.14, r: 0.03, stroke: 'soft' }] } }),
    ],
    motion: {
        duration: 3.6,
        label: 'the camera dollies in, the boom swings, the slate claps',
        tracks: [
            { group: DOLLY, t: [0.9, 0, 0], ease: 'inOut' },
            { group: 'boom', t: [-0.8, 0, 0], from: 0.1, to: 0.9, ease: 'inOut' },
            { group: 'clap', r: { axis: 'z', deg: -24, pivot: CLAP_PIVOT }, from: 0.55, to: 0.75, ease: 'in' },
        ],
    },
});
/* ----------------------------------------------------------- recording studio */
const RS = { w: 10.2, h: 0.3, d: 7.6 };
const CON = { x: 0.9, y: 0.3, z: 4.1, w: 5.6, d: 2.5, hgt: 1.05 };
const CON_TOP = CON.y + CON.hgt; // 1.35
const BRIDGE = { h: 0.55, d: 0.4 };
const CH = 10;
const strip = (k) => 0.2 + k * 0.46;
const FADER_V = [1.9, 1.7, 2.0, 1.6, 1.85, 1.75, 2.05, 1.65, 1.8, 1.95];
const METER_H = [0.2, 0.32, 0.26, 0.14, 0.34, 0.22, 0.3, 0.18, 0.28, 0.24];
const METER_BASE = CON_TOP + 0.1;
const consoleTop = () => {
    const out = [];
    for (let k = 0; k < CH; k++) {
        const u = strip(k);
        out.push({ t: 'rect', x: u, y: 0.12, w: 0.4, h: 2.26, r: 0.04, stroke: 'soft' });
        for (const v of [0.3, 0.65, 1.0])
            out.push({ t: 'circle', cx: u + 0.2, cy: v, r: 0.09, stroke: 'soft' });
        out.push({ t: 'rect', x: u + 0.09, y: 1.17, w: 0.22, h: 0.1, r: 0.03, fill: k % 3 === 0 ? 'ink' : 'detail' });
        out.push({ t: 'segs', segs: [[u + 0.2, 1.5, u + 0.2, 2.2]], stroke: true });
    }
    out.push({ t: 'rect', x: 4.9, y: 0.12, w: 0.6, h: 2.26, r: 0.04, stroke: 'soft' });
    out.push({ t: 'circle', cx: 5.2, cy: 0.55, r: 0.22, stroke: true });
    out.push(tickRing(5.2, 0.55, 0.22, 12, 3, 0.07));
    out.push({ t: 'rect', x: 5.0, y: 1.0, w: 0.4, h: 0.5, r: 0.03, fill: 'ink' });
    out.push(...textLines(5.05, 1.1, 0.3, [1, 0.6, 0.8], 0.12, 0.05, 'face'));
    out.push({ t: 'segs', segs: [[5.05, 1.7, 5.05, 2.2], [5.35, 1.7, 5.35, 2.2]], stroke: true });
    return out;
};
const rackUnits = () => {
    const out = [];
    for (let k = 0; k < 7; k++) {
        const v = 0.2 + k * 0.45;
        out.push({ t: 'rect', x: 0.1, y: v, w: 1.2, h: 0.38, r: 0.03, fill: k % 2 ? 'face' : 'detail', stroke: true });
        out.push({ t: 'circle', cx: 0.28, cy: v + 0.19, r: 0.07, fill: 'ink' });
        out.push({ t: 'circle', cx: 0.52, cy: v + 0.19, r: 0.07, fill: 'ink' });
        out.push(slots(0.78, v + 0.08, 5, 0.09, 0.22, 'v'));
        out.push({ t: 'circle', cx: 1.2, cy: v + 0.07, r: 0.03, fill: k === 2 ? 'accent' : 'face' });
    }
    return out;
};
const studioSpeaker = (x, id) => box([x, 1.9, 4.05], [1.0, 1.4, 0.9], {
    id, r: 0.08, role: 'body',
    decals: { front: [{ t: 'circle', cx: 0.5, cy: 0.85, r: 0.34, stroke: true }, { t: 'circle', cx: 0.5, cy: 0.85, r: 0.12, fill: 'ink' }, { t: 'circle', cx: 0.5, cy: 0.3, r: 0.13, stroke: true }, { t: 'circle', cx: 0.5, cy: 0.3, r: 0.05, fill: 'ink' }] },
});
const dawScreen = [
    { t: 'rect', x: 0.1, y: 0.1, w: 2.8, h: 1.5, r: 0.06, fill: 'bg', stroke: 'soft' },
    ...[0, 1, 2, 3].flatMap((k) => [
        { t: 'bar', x: 0.2, y: 0.25 + k * 0.28, w: 0.4, h: 0.1, fill: 'detail' },
        { t: 'rect', x: 0.75 + k * 0.3, y: 0.2 + k * 0.28, w: 0.8 + (k % 2) * 0.5, h: 0.2, r: 0.03, fill: k === 1 ? 'accent' : 'face', stroke: 'soft' },
        { t: 'segs', stroke: 'soft', segs: Array.from({ length: 8 }, (_, i) => [1.7 + i * 0.12, 0.3 + k * 0.28 - 0.06 * ((i + k) % 3), 1.7 + i * 0.12, 0.3 + k * 0.28 + 0.06 * ((i + k) % 3)]) },
    ]),
    { t: 'segs', segs: [[1.55, 0.15, 1.55, 1.5]], stroke: true },
    { t: 'rect', x: 0.2, y: 1.35, w: 0.5, h: 0.12, r: 0.06, stroke: 'soft' },
    { t: 'circle', cx: 0.95, cy: 1.41, r: 0.05, fill: 'ink' },
];
export const recordingStudio = defineDrawing({
    id: 'recording-studio',
    name: 'Recording studio',
    category: 'media',
    tags: ['recording', 'studio', 'music', 'mixing console', 'audio', 'mixer', 'microphone', 'booth', 'sound', 'production', 'speakers', 'daw', 'podcast', 'faders'],
    kind: 'scene',
    prompt: '/isometric create a recording studio with a mixing console, studio monitors and a vocal booth with a microphone, for our music production page',
    description: 'A recording studio with a long mixing console of ten channel strips with knobs and faders, a meter bridge of level bars, a DAW monitor and two studio monitors on top. Behind it an outboard rack of processors stands against a diffuser wall beside a client sofa. A vocal booth with acoustic foam walls, a glass window, a microphone with a pop filter, a stool, a music stand and a guitar sits beside the console under a glowing on-air sign. The faders slide and the meters bounce.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [RS.w, RS.h, RS.d], { id: 'floor', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: RS.w - 0.4, h: RS.d - 0.4, r: 0.12, stroke: 'soft' }] } }),
        // Console block and meter bridge.
        box([CON.x, CON.y, CON.z], [CON.w, CON.hgt, CON.d], {
            id: 'console', r: 0.05, role: 'body',
            decals: {
                top: consoleTop(),
                front: [{ t: 'rect', x: 0.2, y: 0.15, w: CON.w - 0.4, h: 0.75, r: 0.05, stroke: 'soft' }, slots(0.4, 0.3, 24, 0.2, 0.45, 'v')],
                right: [{ t: 'rect', x: 0.2, y: 0.15, w: CON.d - 0.4, h: 0.75, r: 0.05, stroke: 'soft' }],
            },
        }),
        box([CON.x, CON_TOP, CON.z], [CON.w, BRIDGE.h, BRIDGE.d], {
            id: 'bridge', r: 0.04, role: 'face',
            decals: { front: Array.from({ length: CH }, (_, k) => ({ t: 'rect', x: 0.3 + k * 0.46, y: 0.05, w: 0.2, h: 0.4, r: 0.04, stroke: 'soft' })) },
        }),
        ...Array.from({ length: CH }, (_, k) => box([CON.x + 0.34 + k * 0.46, METER_BASE, CON.z + BRIDGE.d], [0.12, METER_H[k], 0.06], { id: `meter${k}`, role: 'accent', group: `m${k}` })),
        ...Array.from({ length: CH }, (_, k) => box([CON.x + 0.3 + k * 0.46, CON_TOP, CON.z + FADER_V[k] - 0.13], [0.2, 0.12, 0.26], { id: `fader${k}`, r: 0.03, role: 'face', group: `f${k}` })),
        // Monitors on the bridge.
        box([2.2, 1.9, 4.2], [3.0, 0.2, 0.15], { id: 'daw-stand', role: 'detail' }),
        box([2.2, 2.1, 4.2], [3.0, 1.7, 0.14], { id: 'daw', r: 0.08, axis: 'z', role: 'body', decals: { front: dawScreen } }),
        studioSpeaker(0.95, 'spk-l'),
        studioSpeaker(5.45, 'spk-r'),
        // Back wall of the control room and the booth.
        box([0.3, 0.3, 0.3], [6.6, 3.6, 0.2], {
            id: 'wall-control', role: 'face',
            decals: { front: [...Array.from({ length: 11 }, (_, i) => ({ t: 'rect', x: 0.3 + i * 0.55, y: 0.3, w: 0.45, h: 2.9, r: 0.03, stroke: 'soft' })), ...Array.from({ length: 11 }, (_, i) => ({ t: 'segs', segs: Array.from({ length: 5 }, (_, j) => [0.32 + i * 0.55, 0.5 + j * 0.5, 0.72 + i * 0.55, 0.5 + j * 0.5 + 0.12 * ((i + j) % 2)]), stroke: 'soft' }))] },
        }),
        box([6.9, 0.3, 0.3], [3.2, 3.6, 0.2], { id: 'wall-booth', role: 'detail', decals: { front: [foam(3.0, 3.4, 0.3)] } }),
        // Booth side wall around a window.
        box([6.9, 0.3, 0.5], [0.2, 1.1, 3.5], { id: 'bw-low', role: 'face' }),
        box([6.9, 2.7, 0.5], [0.2, 1.2, 3.5], { id: 'bw-high', role: 'face' }),
        box([6.9, 1.4, 0.5], [0.2, 1.3, 1.0], { id: 'bw-post0', role: 'face', decals: { right: [foam(1.0, 1.3, 0.25)] } }),
        box([6.9, 1.4, 3.0], [0.2, 1.3, 1.0], { id: 'bw-post1', role: 'face', decals: { right: [foam(1.0, 1.3, 0.25)] } }),
        box([6.95, 1.4, 1.5], [0.1, 1.3, 1.5], { id: 'bw-glass', role: 'glass' }),
        box([7.1, 0.3, 0.5], [2.9, 0.06, 3.4], { id: 'rug', r: 0.04, role: 'detail', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 2.5, h: 3.0, r: 0.06, stroke: 'soft' }, { t: 'rect', x: 0.4, y: 0.4, w: 2.1, h: 2.6, r: 0.06, stroke: 'soft' }] } }),
        // ON AIR sign.
        box([7.9, 3.9, 0.3], [1.4, 0.45, 0.2], {
            id: 'on-air', r: 0.06, role: 'accent',
            decals: { front: [{ t: 'rect', x: 0.1, y: 0.08, w: 1.2, h: 0.29, r: 0.06, fill: 'face' }, { t: 'bar', x: 0.25, y: 0.19, w: 0.9, h: 0.07, fill: 'ink' }] },
        }),
        // Outboard rack and client sofa.
        box([0.6, 0.3, 0.5], [1.4, 3.2, 1.2], { id: 'rack', r: 0.04, role: 'body', decals: { front: rackUnits(), right: [slots(0.2, 0.3, 12, 0.08, 2.6, 'v')] } }),
        ...sofa(2.6, 0.3, 0.5, 3.0, 'sofa'),
        box([2.8, 0.3, 2.3], [2.6, 0.05, 1.6], { id: 'sofa-rug', r: 0.04, role: 'detail', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 2.2, h: 1.2, r: 0.05, stroke: 'soft' }] } }),
        // Vocal booth: mic, pop filter, stool, music stand, guitar.
        cyl([8.6, 0.36, 2.2], 0.45, 0.05, { id: 'mic-base', n: 28, role: 'detail' }),
        cyl([8.6, 0.41, 2.2], 0.04, 2.14, { id: 'mic-pole', n: 10, role: 'ink' }),
        cyl([8.6, 2.7, 1.9], 0.15, 0.55, { id: 'mic', axis: 'z', n: 20, role: 'ink', decals: { front: [{ t: 'circle', cx: 0.15, cy: 0.15, r: 0.09, fill: 'detail' }] } }),
        cyl([8.6, 2.7, 2.45], 0.03, 0.2, { id: 'mic-neck', axis: 'z', n: 8, role: 'ink' }),
        cyl([8.6, 2.7, 2.65], 0.42, 0.05, { id: 'pop-filter', axis: 'z', n: 28, role: 'glass', decals: { front: [{ t: 'circle', cx: 0.42, cy: 0.42, r: 0.36, stroke: true }, { t: 'circle', cx: 0.42, cy: 0.42, r: 0.2, stroke: 'soft' }] } }),
        cyl([8.6, 0.36, 3.5], 0.4, 0.05, { id: 'stool-base', n: 24, role: 'detail' }),
        cyl([8.6, 0.41, 3.5], 0.05, 0.79, { id: 'stool-pole', n: 10, role: 'ink' }),
        cyl([8.6, 1.2, 3.5], 0.38, 0.12, { id: 'stool-seat', n: 28, role: 'face', decals: { top: [{ t: 'circle', cx: 0.38, cy: 0.38, r: 0.28, stroke: 'soft' }] } }),
        cyl([9.5, 0.36, 1.5], 0.3, 0.05, { id: 'stand-base', n: 20, role: 'detail' }),
        cyl([9.5, 0.41, 1.5], 0.035, 1.3, { id: 'stand-pole', n: 8, role: 'ink' }),
        box([9.15, 1.71, 1.46], [0.7, 0.5, 0.04], { id: 'music-sheet', role: 'face', rot: [{ axis: 'x', deg: -15, pivot: [9.5, 1.71, 1.48] }], decals: { front: [...textLines(0.08, 0.1, 0.54, [1, 0.8, 0.9, 0.6], 0.1, 0.04)] } }),
    ],
    motion: {
        duration: 2.6,
        label: 'faders slide and the level meters bounce',
        tracks: [
            ...Array.from({ length: CH }, (_, k) => ({ group: `f${k}`, t: [0, 0, (k % 2 ? -1 : 1) * (0.25 + 0.03 * k)], from: k * 0.06, to: 0.5 + k * 0.05, ease: 'inOut' })),
            ...Array.from({ length: CH }, (_, k) => ({ group: `m${k}`, s: { k: [1, k % 2 ? 0.45 : 1.8, 1], pivot: [0, METER_BASE, 0] }, from: k * 0.05, to: 0.4 + k * 0.06, ease: 'inOut' })),
        ],
    },
});
/* --------------------------------------------------------------------- DJ booth */
const DJ = { w: 11, h: 0.3, d: 7.0 };
const DECK_TOP = 1.65;
const DECK_Y = DECK_TOP + 0.22;
const decks = [{ x: 1.4, k: 1 }, { x: 5.6, k: 2 }];
const platterCx = (x) => x + 1.25;
const PLAT_Z = 4.3;
const record = (x, k) => {
    const cx = platterCx(x);
    const g = { group: `spin${k}` };
    return [
        cyl([cx, DECK_Y, PLAT_Z], 0.95, 0.08, { id: `platter${k}`, n: 48, role: 'detail', ...g, decals: { top: [tickRing(cx - cx + 0.95, 0.95, 0.9, 36, 6, 0.08)] } }),
        cyl([cx, DECK_Y + 0.08, PLAT_Z], 0.88, 0.05, {
            id: `record${k}`, n: 48, role: 'ink', ...g,
            decals: { top: [{ t: 'circle', cx: 0.88, cy: 0.88, r: 0.76, stroke: 'soft' }, { t: 'circle', cx: 0.88, cy: 0.88, r: 0.6, stroke: 'soft' }, { t: 'circle', cx: 0.88, cy: 0.88, r: 0.46, stroke: 'soft' }, { t: 'segs', segs: [[0.3, 0.55, 0.55, 0.3], [1.3, 1.45, 1.55, 1.2]], stroke: 'face' }] },
        }),
        cyl([cx, DECK_Y + 0.13, PLAT_Z], 0.3, 0.02, { id: `label${k}`, n: 28, role: 'accent', ...g, decals: { top: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.05, fill: 'ink' }] } }),
    ];
};
const deckBase = (x, k) => {
    const pitchU = 2.25;
    return box([x, DECK_TOP, 3.2], [2.5, 0.22, 2.2], {
        id: `deck${k}`, r: 0.06, role: 'body',
        decals: { top: [{ t: 'segs', segs: [[pitchU, 1.0, pitchU, 1.95]], stroke: true }, { t: 'circle', cx: 0.3, cy: 1.95, r: 0.12, stroke: true }, { t: 'circle', cx: 0.6, cy: 1.95, r: 0.12, stroke: 'soft' }, { t: 'rect', x: 1.7, y: 1.9, w: 0.35, h: 0.15, r: 0.05, stroke: 'soft' }] },
    });
};
const tonearm = (x, k) => {
    const px = x + 2.2, pz = 3.5;
    const ex = px - 0.55, ez = 4.85;
    const g = { group: `arm${k}` };
    return [
        cyl([px, DECK_Y, pz], 0.18, 0.18, { id: `arm-base${k}`, n: 20, role: 'detail' }),
        prism([0, DECK_Y + 0.2, 0], quad(px, pz, ex, ez, 0.07), 0.05, { id: `arm${k}`, axis: 'y', role: 'ink', ...g }),
        prism([0, DECK_Y + 0.2, 0], quad(ex, ez, ex - 0.12, ez + 0.25, 0.16), 0.06, { id: `head${k}`, axis: 'y', role: 'detail', ...g }),
    ];
};
const paStack = (x0, k) => [
    box([x0, 0.3, 0.8], [1.7, 1.4, 1.4], {
        id: `sub${k}`, r: 0.06, role: 'body',
        decals: { front: [{ t: 'circle', cx: 0.85, cy: 0.7, r: 0.52, stroke: true }, { t: 'circle', cx: 0.85, cy: 0.7, r: 0.22, fill: 'ink' }, { t: 'circle', cx: 0.85, cy: 0.7, r: 0.36, stroke: 'soft' }, { t: 'rect', x: 0.1, y: 0.1, w: 0.2, h: 0.08, r: 0.03, fill: 'ink' }, { t: 'rect', x: 1.4, y: 0.1, w: 0.2, h: 0.08, r: 0.03, fill: 'ink' }] },
    }),
    box([x0 + 0.1, 1.7, 0.9], [1.5, 1.5, 1.2], {
        id: `top${k}`, r: 0.06, role: 'face',
        decals: { front: [{ t: 'rect', x: 0.15, y: 0.15, w: 1.2, h: 0.26, r: 0.06, fill: 'ink' }, slots(0.25, 0.2, 9, 0.12, 0.16, 'v'), { t: 'circle', cx: 0.75, cy: 0.95, r: 0.42, stroke: true }, { t: 'circle', cx: 0.75, cy: 0.95, r: 0.26, stroke: 'soft' }, { t: 'circle', cx: 0.75, cy: 0.95, r: 0.1, fill: 'ink' }] },
    }),
];
export const djBooth = defineDrawing({
    id: 'dj-booth',
    name: 'DJ booth',
    category: 'media',
    tags: ['dj', 'turntable', 'vinyl', 'music', 'mixer', 'club', 'party', 'speakers', 'record', 'decks', 'nightlife', 'audio', 'festival', 'sound system'],
    kind: 'scene',
    prompt: '/isometric create a DJ booth with two spinning turntables, a mixer, speaker stacks and a light rig, for our music streaming landing page',
    description: 'A DJ booth with an LED-fronted cabinet carrying two turntables with spinning vinyl and swinging tonearms, a mixer with knobs, channel faders and a crossfader, and a sampler pad grid. Two stacks of subwoofer and top speakers flank it under a lighting truss with four spotlight cans, with a crate of record sleeves at the side. The records spin and the crossfader slides.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [DJ.w, DJ.h, DJ.d], {
            id: 'floor', r: 0.15, role: 'face',
            decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: DJ.w - 0.4, h: DJ.d - 0.4, r: 0.12, stroke: 'soft' }, ...grid(3.0, 5.9, 5, 1, 0.8, 0.8, 0.1, { fill: 'detail', stroke: 'soft', r: 0.06 })] },
        }),
        // Cabinet and slab.
        box([1.2, 0.3, 3.1], [8.2, 1.2, 2.4], {
            id: 'cabinet', r: 0.05, role: 'ink',
            decals: {
                front: [
                    { t: 'rect', x: 0.3, y: 0.2, w: 7.6, h: 0.8, r: 0.08, stroke: 'soft' },
                    ...Array.from({ length: 30 }, (_, i) => {
                        const h = 0.12 + 0.5 * Math.abs(Math.sin(i * 0.7));
                        return { t: 'bar', x: 0.5 + i * 0.24, y: 0.9 - h, w: 0.12, h, fill: i % 7 === 3 ? 'accent' : 'face' };
                    }),
                ],
                right: [{ t: 'rect', x: 0.3, y: 0.2, w: 1.8, h: 0.8, r: 0.08, stroke: 'soft' }, slots(0.6, 0.4, 9, 0.15, 0.4, 'v')],
            },
        }),
        box([1.0, 1.5, 2.9], [8.6, 0.15, 2.8], { id: 'slab', r: 0.05, role: 'face' }),
        // Decks.
        ...decks.flatMap(({ x, k }) => [deckBase(x, k), ...record(x, k), ...tonearm(x, k)]),
        // Mixer.
        box([4.0, DECK_TOP, 3.2], [1.5, 0.32, 2.2], {
            id: 'mixer', r: 0.06, role: 'body',
            decals: {
                top: [
                    ...[0.35, 1.15].map((u) => ({ t: 'segs', segs: [[u, 1.45, u, 1.9]], stroke: true })),
                    { t: 'segs', segs: [[0.4, 2.05, 1.1, 2.05]], stroke: true },
                    ...Array.from({ length: 8 }, (_, i) => ({ t: 'rect', x: 0.69, y: 0.7 + i * 0.1, w: 0.12, h: 0.06, r: 0.02, fill: i > 4 ? 'accent' : 'ink' })),
                    { t: 'rect', x: 0.2, y: 0.12, w: 1.1, h: 0.25, r: 0.04, stroke: 'soft' },
                ],
            },
        }),
        ...[0.35, 1.15].flatMap((u, c) => [0.4, 0.8, 1.2].map((v, r) => cyl([4.0 + u, DECK_TOP + 0.32, 3.2 + v], 0.09, 0.1, { id: `knob${c}${r}`, n: 14, role: 'detail', decals: { top: [{ t: 'segs', segs: [[0.09, 0.09, 0.09 + 0.07 * (r - 1), 0.02]], stroke: true }] } }))),
        cyl([4.75, DECK_TOP + 0.32, 3.35], 0.13, 0.1, { id: 'master', n: 18, role: 'accent' }),
        ...[0.35, 1.15].map((u, c) => box([4.0 + u - 0.1, DECK_TOP + 0.32, 3.2 + 1.55], [0.2, 0.1, 0.14], { id: `chfader${c}`, r: 0.03, role: 'face', group: `ch${c}` })),
        box([4.0 + 0.4, DECK_TOP + 0.32, 3.2 + 2.05 - 0.07], [0.22, 0.1, 0.14], { id: 'xfader', r: 0.03, role: 'face', group: 'xf' }),
        // Sampler.
        box([8.2, DECK_TOP, 3.2], [1.0, 0.14, 2.2], {
            id: 'sampler', r: 0.05, role: 'body',
            decals: { top: Array.from({ length: 18 }, (_, i) => ({ t: 'rect', x: 0.1 + (i % 3) * 0.29, y: 0.15 + Math.floor(i / 3) * 0.33, w: 0.24, h: 0.28, r: 0.04, fill: i % 7 === 2 ? 'accent' : 'detail', stroke: 'soft' })) },
        }),
        // PA stacks and lighting truss.
        ...paStack(0.5, 0),
        ...paStack(8.9, 1),
        box([0.25, 0.3, 0.6], [0.35, 4.4, 0.35], { id: 'truss-l', role: 'detail', decals: { front: [{ t: 'line', pts: [[0, 0], [0.35, 0.6], [0, 1.2], [0.35, 1.8], [0, 2.4], [0.35, 3.0], [0, 3.6], [0.35, 4.2]], stroke: 'soft' }] } }),
        box([10.4, 0.3, 0.6], [0.35, 4.4, 0.35], { id: 'truss-r', role: 'detail', decals: { front: [{ t: 'line', pts: [[0, 0], [0.35, 0.6], [0, 1.2], [0.35, 1.8], [0, 2.4], [0.35, 3.0], [0, 3.6], [0.35, 4.2]], stroke: 'soft' }] } }),
        box([0.6, 4.7, 0.6], [9.8, 0.35, 0.35], { id: 'truss-beam', role: 'detail', decals: { front: [{ t: 'line', pts: Array.from({ length: 41 }, (_, i) => [i * 0.245, i % 2 ? 0 : 0.35]), stroke: 'soft' }] } }),
        ...[2.2, 4.4, 6.6, 8.8].flatMap((x, k) => [
            cyl([x, 4.2, 0.775], 0.24, 0.5, { id: `can${k}`, n: 20, role: 'ink' }),
            cyl([x, 4.16, 0.775], 0.2, 0.04, { id: `lens${k}`, n: 20, role: 'accent' }),
        ]),
        // Record crate.
        box([9.9, 0.3, 3.6], [0.9, 0.7, 1.6], { id: 'crate', r: 0.04, role: 'detail', decals: { right: [{ t: 'rect', x: 0.2, y: 0.15, w: 1.2, h: 0.4, r: 0.05, stroke: 'soft' }], front: [{ t: 'rect', x: 0.15, y: 0.15, w: 0.6, h: 0.1, r: 0.04, stroke: 'soft' }] } }),
        ...Array.from({ length: 7 }, (_, k) => box([9.95, 1.0, 3.7 + 0.12 * k], [0.7, 0.55, 0.05], {
            id: `sleeve${k}`, role: k % 3 === 0 ? 'ink' : k % 3 === 1 ? 'face' : 'detail',
            decals: k === 6 ? { front: [{ t: 'circle', cx: 0.35, cy: 0.27, r: 0.2, stroke: 'soft', fill: 'accent' }] } : undefined,
        })),
    ],
    motion: {
        duration: 3.0,
        label: 'the records spin and the crossfader slides',
        tracks: [
            { group: 'spin1', r: { axis: 'y', deg: 360, pivot: [platterCx(1.4), 0, PLAT_Z] }, mode: 'loop', ease: 'linear' },
            { group: 'spin2', r: { axis: 'y', deg: -360, pivot: [platterCx(5.6), 0, PLAT_Z] }, mode: 'loop', ease: 'linear' },
            { group: 'arm1', r: { axis: 'y', deg: 5, pivot: [3.6, 0, 3.5] }, ease: 'inOut' },
            { group: 'arm2', r: { axis: 'y', deg: -5, pivot: [7.8, 0, 3.5] }, ease: 'inOut' },
            { group: 'xf', t: [0.6, 0, 0], ease: 'inOut' },
            { group: 'ch0', t: [0, 0, -0.3], ease: 'inOut', from: 0.1, to: 0.8 },
            { group: 'ch1', t: [0, 0, 0.3], ease: 'inOut', from: 0.2, to: 0.9 },
        ],
    },
});
