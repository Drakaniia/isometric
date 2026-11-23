/**
 * Security scenes: a bank vault with a spinning wheel door, a firewall gateway
 * that admits one packet and bounces the rest, an access checkpoint with a
 * metal-detector portal and flap turnstiles, and an encryption line that turns
 * a plain data crate into a locked one.
 */
import { defineDrawing, box, cyl, ball, prism, slots, textLines, grid, tickRing } from '../build.js';
const CREATED = '2026-11-14';
/** Floor slab thickness shared by every scene. */
const F = 0.2;
const ROLES = ['face', 'detail', 'body'];
const pick = (k) => ROLES[((k % ROLES.length) + ROLES.length) % ROLES.length];
/* ---------------------------------------------------------- shared parts */
/** Floor tile joints across a top face. */
const tiles = (w, d, step) => ({
    t: 'segs', stroke: 'soft',
    segs: [
        ...Array.from({ length: Math.ceil(w / step) - 1 }, (_, k) => [step * (k + 1), 0.02, step * (k + 1), d - 0.02]),
        ...Array.from({ length: Math.ceil(d / step) - 1 }, (_, k) => [0.02, step * (k + 1), w - 0.02, step * (k + 1)]),
    ],
});
/** Brick joints across a wall face of width w and height h. */
const bricks = (w, h, course = 0.22, brick = 0.5) => {
    const segs = [];
    const rows = Math.floor(h / course);
    for (let r = 1; r <= rows; r++)
        segs.push([0.02, r * course, w - 0.02, r * course]);
    for (let r = 0; r <= rows; r++) {
        for (let x = (r % 2 ? brick / 2 : brick); x < w - 0.05; x += brick)
            segs.push([x, r * course, x, Math.min(h, (r + 1) * course)]);
    }
    return { t: 'segs', stroke: 'soft', segs };
};
/** A ring of small circles about (cx, cy). */
const dotRing = (cx, cy, rad, n, r, fill = 'detail') => Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    return { t: 'circle', cx: cx + Math.cos(a) * rad, cy: cy + Math.sin(a) * rad, r, fill, stroke: 'soft' };
});
/** Queue stanchion with a base, pole and cap. */
const stanchion = (id, x, z) => [
    cyl([x, F, z], 0.16, 0.05, { id: `${id}-base`, role: 'ink', n: 18 }),
    cyl([x, F + 0.05, z], 0.04, 0.85, { id: `${id}-pole`, role: 'ink', n: 10 }),
    ball([x, F + 0.9 + 0.06, z], 0.06, { id: `${id}-cap`, role: 'detail' }),
];
/** A 19-inch cabinet face with a lit unit per row. */
const rackFace = (w, h, rows) => {
    const pitch = (h - 0.3) / rows;
    return Array.from({ length: rows }, (_, k) => [
        { t: 'rect', x: 0.1, y: 0.15 + k * pitch, w: w - 0.2, h: pitch - 0.06, r: 0.02, fill: 'face', stroke: 'soft' },
        { t: 'circle', cx: 0.22, cy: 0.15 + k * pitch + (pitch - 0.06) / 2, r: 0.04, fill: k % 4 === 1 ? 'accent' : 'ink' },
        { t: 'bar', x: 0.36, y: 0.15 + k * pitch + (pitch - 0.06) / 2 - 0.02, w: w - 0.7, h: 0.04, fill: 'soft' },
    ]).flat();
};
/* ------------------------------------------------------------ bank vault */
const DX = 3.4, DY = F + 2.2, WZ = 0.5;
const goldPallet = () => {
    const out = [box([0.2, F, 1.4], [1.3, 0.2, 1.0], { id: 'pallet', role: 'detail', decals: { front: [slots(0.1, 0.05, 6, 0.2, 0.1, 'v', true)] } })];
    const layers = [[3, 4, 0], [2, 3, 1], [1, 2, 2]];
    for (const [cols, rows, l] of layers) {
        const x0 = 0.2 + (1.3 - cols * 0.4 - (cols - 1) * 0.02) / 2, z0 = 1.4 + (1.0 - rows * 0.22 - (rows - 1) * 0.02) / 2;
        for (let c = 0; c < cols; c++)
            for (let r = 0; r < rows; r++) {
                out.push(box([x0 + c * 0.42, F + 0.2 + l * 0.12, z0 + r * 0.24], [0.4, 0.12, 0.22], {
                    id: `gold${l}-${c}-${r}`, role: 'face', r: 0.02,
                    decals: { top: [{ t: 'rect', x: 0.06, y: 0.05, w: 0.28, h: 0.12, r: 0.03, stroke: 'soft' }] },
                }));
            }
    }
    return out;
};
export const bankVault = defineDrawing({
    id: 'bank-vault',
    name: 'Bank vault',
    category: 'status',
    tags: ['vault', 'bank', 'safe', 'security', 'lock', 'secure storage', 'safe deposit', 'gold', 'access control', 'burglar', 'laser', 'protection', 'status'],
    kind: 'scene',
    prompt: '/isometric create a bank vault with a big round door and safe deposit boxes for our secure storage page',
    description: 'A concrete vault wall with a round door set in a riveted frame. The door has a ring of locking bolts, a hinge pair and a four-spoke wheel with a hub handle. Beside it are a keypad and display panel, a pallet of gold bars, a cabinet of safe deposit drawers and a security camera. Three laser tripwires cross the floor between two emitter posts. The wheel turns and a deposit drawer slides out.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [7.2, F, 4.4], { id: 'floor', role: 'face', decals: { top: [tiles(7.2, 4.4, 0.8)] } }),
        box([0, F, 0], [7.2, 4.4, WZ], {
            id: 'wall', role: 'face',
            decals: { front: [slots(0.05, 0.55, 7, 0.55, 7.1, 'h'), slots(0.9, 0.0, 7, 1.0, 0.55, 'v')] },
        }),
        box([-0.05, F + 4.4, 0], [7.3, 0.15, WZ + 0.15], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.03, 36, 0.2, 0.09, 'v')] } }),
        // Frame and door.
        cyl([DX, DY, WZ], 1.55, 0.2, { id: 'frame', axis: 'z', role: 'detail', n: 36, decals: { front: [{ t: 'circle', cx: 1.55, cy: 1.55, r: 1.4, stroke: 'soft' }, ...dotRing(1.55, 1.55, 1.47, 20, 0.04, 'ink')] } }),
        cyl([DX, DY, WZ + 0.2], 1.3, 0.4, {
            id: 'door', axis: 'z', role: 'body', n: 36,
            decals: { front: [
                    { t: 'circle', cx: 1.3, cy: 1.3, r: 1.18, stroke: true },
                    { t: 'circle', cx: 1.3, cy: 1.3, r: 0.92, stroke: 'soft' },
                    tickRing(1.3, 1.3, 0.88, 36, 3, 0.1),
                    ...dotRing(1.3, 1.3, 1.06, 12, 0.07, 'face'),
                ] },
        }),
        cyl([DX, DY, WZ + 0.6], 0.5, 0.08, { id: 'hub-plate', axis: 'z', role: 'face', n: 28, decals: { front: [{ t: 'circle', cx: 0.5, cy: 0.5, r: 0.38, stroke: 'soft' }] } }),
        // Wheel: two crossed bars (the vertical bar in two halves so nothing intersects), four pegs and a hub.
        box([DX - 0.6, DY - 0.07, WZ + 0.68], [1.2, 0.14, 0.1], { id: 'spoke-h', role: 'ink', group: 'wheel' }),
        box([DX - 0.07, DY + 0.07, WZ + 0.68], [0.14, 0.55, 0.1], { id: 'spoke-u', role: 'ink', group: 'wheel' }),
        box([DX - 0.07, DY - 0.62, WZ + 0.68], [0.14, 0.55, 0.1], { id: 'spoke-d', role: 'ink', group: 'wheel' }),
        cyl([DX - 0.7, DY, WZ + 0.68], 0.1, 0.3, { id: 'peg-l', axis: 'z', role: 'detail', n: 14, group: 'wheel' }),
        cyl([DX + 0.7, DY, WZ + 0.68], 0.1, 0.3, { id: 'peg-r', axis: 'z', role: 'detail', n: 14, group: 'wheel' }),
        cyl([DX, DY + 0.72, WZ + 0.68], 0.1, 0.3, { id: 'peg-u', axis: 'z', role: 'detail', n: 14, group: 'wheel' }),
        cyl([DX, DY - 0.72, WZ + 0.68], 0.1, 0.3, { id: 'peg-d', axis: 'z', role: 'detail', n: 14, group: 'wheel' }),
        cyl([DX, DY, WZ + 0.78], 0.25, 0.22, { id: 'hub', axis: 'z', role: 'accent', n: 22, group: 'wheel', decals: { front: [{ t: 'circle', cx: 0.25, cy: 0.25, r: 0.12, fill: 'face', stroke: true }] } }),
        // Hinges.
        cyl([DX - 1.42, DY - 0.75, WZ + 0.4], 0.12, 0.45, { id: 'hinge-a', role: 'ink', n: 14 }),
        cyl([DX - 1.42, DY + 0.35, WZ + 0.4], 0.12, 0.45, { id: 'hinge-b', role: 'ink', n: 14 }),
        // Keypad panel.
        box([0.35, F + 1.9, WZ], [0.9, 1.3, 0.2], {
            id: 'keypad', role: 'detail', r: 0.04, axis: 'z',
            decals: { front: [
                    { t: 'rect', x: 0.1, y: 0.12, w: 0.7, h: 0.28, r: 0.03, fill: 'ink' },
                    ...textLines(0.16, 0.2, 0.5, [1, 0.6], 0.1, 0.04, 'face'),
                    ...grid(0.15, 0.52, 3, 4, 0.18, 0.14, 0.06, { fill: 'face' }),
                ] },
        }),
        // Gold, drawers and laser line.
        ...goldPallet(),
        box([5.5, F, 1.0], [1.5, 3.0, 0.8], {
            id: 'deposit-cabinet', role: 'body',
            decals: { front: [...grid(0.12, 0.12, 3, 6, 0.4, 0.38, 0.06, { fill: 'face', stroke: true }), ...Array.from({ length: 18 }, (_, k) => ({ t: 'circle', cx: 0.32 + (k % 3) * 0.46, cy: 0.31 + Math.floor(k / 3) * 0.44, r: 0.03, fill: 'ink' }))] },
        }),
        box([5.96, F + 1.0, 1.8], [0.4, 0.38, 0.45], { id: 'drawer', role: 'face', group: 'drawer', r: 0.02, axis: 'z', decals: { front: [{ t: 'bar', x: 0.1, y: 0.15, w: 0.2, h: 0.05, fill: 'ink' }], top: [{ t: 'rect', x: 0.05, y: 0.05, w: 0.3, h: 0.35, r: 0.02, stroke: 'soft' }] } }),
        box([6.4, F + 3.5, WZ], [0.1, 0.1, 0.4], { id: 'cam-mount', role: 'ink' }),
        box([6.2, F + 3.35, WZ + 0.4], [0.5, 0.3, 0.3], { id: 'camera', role: 'face', r: 0.05, axis: 'z', decals: { front: [{ t: 'circle', cx: 0.25, cy: 0.15, r: 0.08, fill: 'ink' }] } }),
        box([0.3, F, 3.6], [0.22, 1.6, 0.22], { id: 'laser-post-a', role: 'body', decals: { front: [{ t: 'circle', cx: 0.11, cy: 0.5, r: 0.05, fill: 'accent' }] } }),
        box([6.7, F, 3.6], [0.22, 1.6, 0.22], { id: 'laser-post-b', role: 'body', decals: { front: [{ t: 'circle', cx: 0.11, cy: 0.5, r: 0.05, fill: 'accent' }] } }),
        ...[0.45, 0.85, 1.25].map((y, k) => box([0.52, F + y, 3.68], [6.18, 0.04, 0.06], { id: `laser${k}`, role: 'ink' })),
    ],
    motion: {
        duration: 4,
        label: 'the wheel turns and a drawer slides out',
        tracks: [
            { group: 'wheel', r: { axis: 'z', deg: -90, pivot: [DX, DY, WZ + 0.9] }, from: 0, to: 0.6, ease: 'inOut' },
            { group: 'drawer', t: [0, 0, 0.45], from: 0.4, to: 0.9, ease: 'out' },
        ],
    },
});
/* ------------------------------------------------------ firewall gateway */
const GX0 = 3.0, GX1 = 3.5, GZ0 = 2.0, GZ1 = 2.8, WALL_H = 1.1;
const packet = (id, at, role, group, top) => box(at, [0.6, 0.5, 0.6], { id, role, group, r: 0.04, axis: 'y', decals: { top } });
const cross = { t: 'segs', stroke: 'face', width: 1.6, segs: [[0.15, 0.15, 0.45, 0.45], [0.45, 0.15, 0.15, 0.45]] };
const envelope = [{ t: 'rect', x: 0.08, y: 0.14, w: 0.44, h: 0.32, r: 0.03, stroke: true }, { t: 'line', stroke: 'soft', pts: [[0.08, 0.14], [0.3, 0.32], [0.52, 0.14]] }];
export const firewallGateway = defineDrawing({
    id: 'firewall-gateway',
    name: 'Firewall gateway',
    category: 'status',
    tags: ['firewall', 'network security', 'gateway', 'packets', 'traffic filter', 'intrusion prevention', 'cybersecurity', 'blocked', 'allowed', 'perimeter', 'waf', 'status'],
    kind: 'scene',
    prompt: '/isometric create a firewall wall that lets one data packet through a scanner gate and blocks the others, for our network security page',
    description: 'A brick firewall wall stands across three traffic lanes. The middle lane runs through a scanner gate under a lit lintel with a barrier arm; a lit packet passes through. The two outer lanes hit solid brick and their dark crossed packets bounce back. An internet cloud on a pedestal feeds the lanes, a warning sign stands between them and, behind the wall, two server racks and a database stack are protected.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.6, F, 4.6], { id: 'floor', role: 'face', decals: { top: [tiles(8.6, 4.6, 0.8)] } }),
        box([0, F, GZ0], [8.6, 0.03, GZ1 - GZ0], { id: 'lane-mid', role: 'detail', decals: { top: [slots(0.5, 0.1, 16, 0.5, 0.6, 'v')] } }),
        box([GX1, F, 0.5], [5.1, 0.03, 0.9], { id: 'lane-a', role: 'detail', decals: { top: [slots(0.5, 0.1, 9, 0.5, 0.7, 'v')] } }),
        box([GX1, F, 3.4], [5.1, 0.03, 0.9], { id: 'lane-b', role: 'detail', decals: { top: [slots(0.5, 0.1, 9, 0.5, 0.7, 'v')] } }),
        // The wall, with a gate in it.
        box([GX0, F, 0], [GX1 - GX0, WALL_H, GZ0], { id: 'wall-a', role: 'body', decals: { right: [bricks(GZ0, WALL_H)], top: [slots(0.05, 0.1, 6, 0.08, 0.3, 'h')] } }),
        box([GX0, F, GZ1], [GX1 - GX0, WALL_H, 4.6 - GZ1], {
            id: 'wall-b', role: 'body',
            decals: {
                right: [bricks(4.6 - GZ1, WALL_H), { t: 'line', closed: true, fill: 'ink', stroke: true, pts: [[0.7, 0.12], [1.1, 0.12], [1.1, 0.5], [0.9, 0.9], [0.7, 0.5]] }, { t: 'line', stroke: 'face', width: 1.5, pts: [[0.8, 0.45], [0.9, 0.55], [1.05, 0.3]] }],
            },
        }),
        box([GX0, F + WALL_H, GZ0 - 0.2], [GX1 - GX0, 0.6, 0.2], { id: 'post-a', role: 'face' }),
        box([GX0, F + WALL_H, GZ1], [GX1 - GX0, 0.6, 0.2], { id: 'post-b', role: 'face' }),
        box([GX0, F + WALL_H + 0.6, GZ0 - 0.2], [GX1 - GX0, 0.45, GZ1 - GZ0 + 0.4], {
            id: 'lintel', role: 'detail',
            decals: { right: [{ t: 'rect', x: 0.1, y: 0.1, w: 1.0, h: 0.25, r: 0.03, fill: 'ink' }, { t: 'bar', x: 0.2, y: 0.2, w: 0.5, h: 0.05, fill: 'accent' }, { t: 'circle', cx: 1.2, cy: 0.225, r: 0.06, fill: 'accent' }], front: [slots(0.05, 0.05, 3, 0.1, 0.35, 'h')] },
        }),
        box([GX1, F + 0.6, GZ0], [0.08, 0.1, GZ1 - GZ0], { id: 'arm', role: 'ink', group: 'arm', decals: { right: [slots(0.05, 0.02, 6, 0.12, 0.06, 'v', true)] } }),
        // Packets.
        packet('packet-pass', [6.0, F + 0.03, 2.1], 'accent', 'pass', envelope),
        packet('packet-a', [5.8, F + 0.03, 0.65], 'ink', 'block', [cross]),
        packet('packet-b', [6.4, F + 0.03, 3.55], 'ink', 'block', [cross]),
        // Internet side.
        cyl([8.0, F, 2.4], 0.3, 0.7, { id: 'cloud-column', role: 'detail', n: 20 }),
        ball([7.65, F + 1.15, 2.4], 0.35, { id: 'cloud-a', role: 'face' }),
        ball([8.35, F + 1.15, 2.4], 0.35, { id: 'cloud-b', role: 'face' }),
        ball([8.0, F + 1.76, 2.4], 0.35, { id: 'cloud-c', role: 'face' }),
        cyl([4.7, F, 1.7], 0.05, 1.0, { id: 'sign-post', role: 'ink', n: 10 }),
        box([4.45, F + 1.0, 1.67], [0.5, 0.5, 0.06], { id: 'sign', role: 'ink', r: 0.04, axis: 'z', decals: { front: [{ t: 'segs', stroke: 'face', width: 1.6, segs: [[0.12, 0.12, 0.38, 0.38], [0.38, 0.12, 0.12, 0.38]] }] } }),
        // Protected zone.
        box([0.4, F, 0.3], [1.2, 2.6, 0.9], { id: 'rack-a', role: 'body', decals: { right: [...rackFace(0.9, 2.6, 8)] } }),
        box([0.4, F, 3.3], [1.2, 2.6, 0.9], { id: 'rack-b', role: 'body', decals: { right: [...rackFace(0.9, 2.6, 8)] } }),
        ...[0, 1, 2].map((k) => cyl([1.1, F + k * 0.36, 2.4], 0.4, 0.36, {
            id: `db${k}`, role: pick(k), n: 24,
            decals: { top: [{ t: 'circle', cx: 0.4, cy: 0.4, r: 0.3, stroke: 'soft' }, { t: 'circle', cx: 0.65, cy: 0.4, r: 0.04, fill: k === 2 ? 'accent' : 'ink' }] },
        })),
    ],
    motion: {
        duration: 4.2,
        label: 'one packet is scanned through, the rest bounce',
        tracks: [
            { group: 'arm', r: { axis: 'x', deg: -62, pivot: [GX1, F + 0.65, GZ0] }, from: 0.05, to: 0.3, ease: 'inOut' },
            { group: 'pass', t: [-3.0, 0, 0], from: 0.3, to: 0.95, ease: 'inOut' },
            { group: 'block', t: [-2.3, 0, 0], from: 0.1, to: 0.55, ease: 'in' },
        ],
    },
});
/* ------------------------------------------------------ access checkpoint */
const lampStack = () => [
    { t: 'circle', cx: 0.4, cy: 0.45, r: 0.09, fill: 'ink' },
    { t: 'circle', cx: 0.4, cy: 0.75, r: 0.09, fill: 'face', stroke: true },
    { t: 'circle', cx: 0.4, cy: 1.05, r: 0.09, fill: 'accent' },
];
const ledStrip = (len) => [
    { t: 'rect', x: 0.2, y: 0.2, w: len - 0.4, h: 0.18, r: 0.04, fill: 'ink' },
    { t: 'bar', x: 0.3, y: 0.26, w: len - 0.8, h: 0.06, fill: 'accent' },
    { t: 'rect', x: 0.2, y: 0.5, w: 0.35, h: 0.3, r: 0.04, fill: 'face', stroke: true },
];
export const accessCheckpoint = defineDrawing({
    id: 'access-checkpoint',
    name: 'Access checkpoint',
    category: 'status',
    tags: ['access control', 'turnstile', 'metal detector', 'security gate', 'biometric', 'fingerprint', 'lobby', 'badge reader', 'entry', 'authentication', 'physical security', 'status'],
    kind: 'scene',
    prompt: '/isometric create a building security checkpoint with a metal detector, flap turnstiles and a fingerprint reader for our access control page',
    description: 'A secure lobby against a plain wall with a lock sign. A metal-detector portal with a traffic light on its post stands on a floor mat. Two flap turnstile pedestals with card readers and LED strips face a lane marked with chevrons; the glass flaps swing open. A fingerprint pillar with a small screen, a guard desk with a camera monitor and chair, a ceiling-mounted camera and a line of stanchions complete the lobby.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.2, F, 5.0], { id: 'floor', role: 'face', decals: { top: [tiles(8.2, 5.0, 0.8)] } }),
        box([0, F, 0], [8.2, 3.8, 0.4], {
            id: 'wall', role: 'face',
            decals: { front: [
                    { t: 'rect', x: 3.3, y: 0.6, w: 1.6, h: 1.1, r: 0.06, fill: 'ink' },
                    { t: 'rect', x: 3.9, y: 0.95, w: 0.4, h: 0.3, r: 0.04, fill: 'face' },
                    { t: 'line', stroke: 'face', width: 2, pts: [[3.95, 0.95], [3.95, 0.8], [4.25, 0.8], [4.25, 0.95]] },
                    { t: 'bar', x: 3.75, y: 1.4, w: 0.8, h: 0.06, fill: 'face' },
                    slots(0.05, 2.4, 6, 0.2, 8.1, 'h'), slots(1.0, 0, 8, 1.0, 2.4, 'v'),
                ] },
        }),
        box([-0.05, F + 3.8, 0], [8.3, 0.15, 0.55], { id: 'cornice', role: 'detail', decals: { front: [slots(0.15, 0.03, 40, 0.2, 0.09, 'v')] } }),
        // Metal detector portal.
        box([0.85, F, 1.6], [1.4, 0.03, 0.8], { id: 'portal-mat', role: 'ink', decals: { top: [slots(0.1, 0.1, 10, 0.12, 0.6, 'v', 'soft')] } }),
        box([0.6, F, 1.6], [0.25, 2.2, 0.8], { id: 'portal-a', role: 'body', decals: { front: [slots(0.05, 0.3, 5, 0.3, 0.15, 'h')] } }),
        box([2.25, F, 1.6], [0.25, 2.2, 0.8], { id: 'portal-b', role: 'body', decals: { right: [{ t: 'rect', x: 0.2, y: 0.25, w: 0.4, h: 1.0, r: 0.05, fill: 'ink' }, ...lampStack().map((d) => d)] } }),
        box([0.6, F + 2.2, 1.6], [1.9, 0.3, 0.8], { id: 'portal-head', role: 'face', decals: { front: [{ t: 'rect', x: 0.4, y: 0.08, w: 1.1, h: 0.14, r: 0.04, fill: 'ink' }, slots(0.5, 0.11, 8, 0.12, 0.06, 'v', true)] } }),
        // Flap turnstiles.
        box([3.7, F, 1.6], [0.6, 1.0, 1.6], { id: 'turnstile-l', role: 'body', decals: { right: ledStrip(1.6), top: [{ t: 'line', stroke: true, pts: [[0.1, 0.5], [0.3, 0.3], [0.5, 0.5]] }, { t: 'line', stroke: true, pts: [[0.1, 0.9], [0.3, 0.7], [0.5, 0.9]] }] } }),
        box([5.5, F, 1.6], [0.6, 1.0, 1.6], { id: 'turnstile-r', role: 'body', decals: { front: [{ t: 'rect', x: 0.1, y: 0.15, w: 0.4, h: 0.3, r: 0.04, fill: 'ink' }], top: [{ t: 'line', stroke: true, pts: [[0.1, 0.5], [0.3, 0.3], [0.5, 0.5]] }, { t: 'line', stroke: true, pts: [[0.1, 0.9], [0.3, 0.7], [0.5, 0.9]] }] } }),
        box([3.8, F + 1.0, 1.7], [0.4, 0.12, 0.4], { id: 'reader-l', role: 'ink', r: 0.04, axis: 'y', decals: { top: [{ t: 'circle', cx: 0.2, cy: 0.2, r: 0.12, stroke: 'soft' }, { t: 'circle', cx: 0.2, cy: 0.2, r: 0.05, fill: 'face' }] } }),
        box([5.6, F + 1.0, 1.7], [0.4, 0.12, 0.4], { id: 'reader-r', role: 'ink', r: 0.04, axis: 'y', decals: { top: [{ t: 'circle', cx: 0.2, cy: 0.2, r: 0.12, stroke: 'soft' }, { t: 'circle', cx: 0.2, cy: 0.2, r: 0.05, fill: 'face' }] } }),
        box([4.3, F + 0.55, 2.37], [0.6, 0.4, 0.06], { id: 'flap-l', role: 'accent', group: 'flap-l', decals: { front: [{ t: 'bar', x: 0.08, y: 0.17, w: 0.44, h: 0.05, fill: 'face' }] } }),
        box([4.9, F + 0.55, 2.37], [0.6, 0.4, 0.06], { id: 'flap-r', role: 'accent', group: 'flap-r', decals: { front: [{ t: 'bar', x: 0.08, y: 0.17, w: 0.44, h: 0.05, fill: 'face' }] } }),
        // Floor guidance between the pedestals.
        box([4.3, F, 1.6], [1.2, 0.02, 1.6], { id: 'lane-mat', role: 'detail', decals: { top: [{ t: 'line', stroke: 'soft', pts: [[0.2, 0.3], [0.6, 0.1], [1.0, 0.3]] }, { t: 'line', stroke: 'soft', pts: [[0.2, 0.8], [0.6, 0.6], [1.0, 0.8]] }, { t: 'line', stroke: 'soft', pts: [[0.2, 1.3], [0.6, 1.1], [1.0, 1.3]] }] } }),
        // Fingerprint pillar.
        cyl([7.0, F, 1.6], 0.22, 1.0, { id: 'pillar', role: 'body', n: 22 }),
        box([6.7, F + 1.0, 1.3], [0.6, 0.5, 0.6], {
            id: 'pillar-head', role: 'face', r: 0.06, axis: 'y',
            decals: {
                top: [{ t: 'circle', cx: 0.3, cy: 0.3, r: 0.22, stroke: true }, { t: 'circle', cx: 0.3, cy: 0.3, r: 0.15, stroke: 'soft' }, { t: 'circle', cx: 0.3, cy: 0.3, r: 0.08, stroke: 'soft' }, { t: 'segs', stroke: 'soft', segs: [[0.3, 0.1, 0.3, 0.5]] }],
                front: [{ t: 'rect', x: 0.12, y: 0.1, w: 0.36, h: 0.25, r: 0.03, fill: 'ink' }, { t: 'bar', x: 0.18, y: 0.2, w: 0.2, h: 0.04, fill: 'accent' }],
            },
        }),
        // Guard desk.
        box([0.4, F, 3.6], [2.4, 0.95, 0.9], { id: 'desk', role: 'body', decals: { front: [{ t: 'rect', x: 0.15, y: 0.15, w: 2.1, h: 0.6, r: 0.05, stroke: 'soft' }, ...grid(0.35, 0.25, 4, 1, 0.4, 0.4, 0.1, { fill: 'face' })] } }),
        box([1.4, F + 0.95, 3.88], [0.2, 0.25, 0.1], { id: 'monitor-stand', role: 'ink' }),
        box([0.85, F + 1.2, 3.85], [1.3, 0.75, 0.06], { id: 'monitor', role: 'ink', r: 0.03, axis: 'z', decals: { front: [...grid(0.1, 0.1, 3, 2, 0.34, 0.26, 0.08, { fill: 'face', stroke: false }), { t: 'rect', x: 0.1, y: 0.1, w: 0.34, h: 0.26, r: 0.02, fill: 'accent' }] } }),
        box([0.7, F + 0.95, 4.2], [0.8, 0.04, 0.22], { id: 'keyboard', role: 'detail' }),
        cyl([1.9, F, 4.45], 0.05, 0.5, { id: 'chair-post', role: 'ink', n: 10 }),
        cyl([1.9, F + 0.5, 4.45], 0.3, 0.08, { id: 'chair-seat', role: 'detail', n: 22 }),
        box([1.6, F + 0.58, 4.75], [0.6, 0.7, 0.08], { id: 'chair-back', role: 'face', r: 0.04, axis: 'z' }),
        // Camera and queue line.
        box([7.4, F + 3.3, 0.4], [0.1, 0.1, 0.5], { id: 'cam-arm', role: 'ink' }),
        ball([7.45, F + 3.25, 1.1], 0.22, { id: 'cam-dome', role: 'face' }),
        ...[3.9, 5.0, 6.1].flatMap((x, k) => stanchion(`post${k}`, x, 4.3)),
        box([3.94, F + 0.82, 4.28], [1.02, 0.08, 0.04], { id: 'belt0', role: 'detail' }),
        box([5.04, F + 0.82, 4.28], [1.02, 0.08, 0.04], { id: 'belt1', role: 'detail' }),
    ],
    motion: {
        duration: 3.8,
        label: 'the turnstile flaps swing open',
        tracks: [
            { group: 'flap-l', r: { axis: 'y', deg: 85, pivot: [4.3, F + 0.75, 2.4] }, from: 0.1, to: 0.6, ease: 'inOut' },
            { group: 'flap-r', r: { axis: 'y', deg: -85, pivot: [5.5, F + 0.75, 2.4] }, from: 0.1, to: 0.6, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------- encryption line */
const keyProfile = [
    [0, 0.2], [0.06, 0.06], [0.2, 0], [0.34, 0.06], [0.4, 0.15], [1.0, 0.15], [1.0, 0.32], [0.9, 0.32], [0.9, 0.25], [0.8, 0.25], [0.8, 0.32], [0.7, 0.32], [0.7, 0.25],
    [0.4, 0.25], [0.34, 0.34], [0.2, 0.4], [0.06, 0.34],
];
const shackle = [
    [0, 0], [0.18, 0], [0.18, 0.42], [0.26, 0.55], [0.5, 0.62], [0.74, 0.55], [0.82, 0.42], [0.82, 0], [1, 0], [1, 0.5], [0.9, 0.72], [0.7, 0.86], [0.5, 0.9], [0.3, 0.86], [0.1, 0.72], [0, 0.5],
];
const scrambled = [
    ...grid(0.08, 0.08, 4, 4, 0.1, 0.1, 0.025, { fill: 'face', stroke: false }),
    { t: 'rect', x: 0.2, y: 0.2, w: 0.1, h: 0.1, fill: 'accent' },
];
const ROTORS = [2.9, 3.7, 4.5];
export const encryptionLine = defineDrawing({
    id: 'encryption-line',
    name: 'Encryption line',
    category: 'status',
    tags: ['encryption', 'cipher', 'padlock', 'key', 'cryptography', 'data protection', 'secure data', 'end-to-end', 'key management', 'hsm', 'privacy', 'status'],
    kind: 'scene',
    prompt: '/isometric create a cipher machine that turns a plain data crate into a scrambled one and sends it to a locked cabinet, with a padlock and key, for our encryption features page',
    description: 'A conveyor feeds a plain data crate marked with text lines into a cipher machine with three ringed rotors, a display deck and keypad. A scrambled crate of checker cells leaves on the output belt towards a locked server cabinet with a keyhole and handle. A giant padlock on a plinth stands behind the input belt and a single key lies on a small table. The rotors turn and the crates slide through.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.4, F, 4.6], { id: 'floor', role: 'face', decals: { top: [tiles(8.4, 4.6, 0.8)] } }),
        // Padlock.
        box([0.3, F, 0.2], [1.7, 0.3, 1.0], { id: 'plinth', role: 'detail', decals: { front: [slots(0.1, 0.05, 15, 0.1, 0.2, 'v')] } }),
        box([0.5, F + 0.3, 0.35], [1.3, 1.0, 0.7], {
            id: 'padlock', role: 'accent', r: 0.15, axis: 'z',
            decals: { front: [{ t: 'circle', cx: 0.65, cy: 0.38, r: 0.12, fill: 'face', stroke: true }, { t: 'line', closed: true, fill: 'face', stroke: true, pts: [[0.6, 0.45], [0.7, 0.45], [0.75, 0.75], [0.55, 0.75]] }] },
        }),
        prism([0.65, F + 1.3, 0.5], shackle.map(([u, v]) => [u, v * 0.95]), 0.4, { id: 'shackle', axis: 'z', role: 'ink' }),
        // Input belt and crate.
        box([0.3, F, 2.1], [2.1, 0.45, 1.0], { id: 'belt-in', role: 'detail', decals: { top: [slots(0.15, 0.05, 11, 0.18, 0.9, 'v')], front: [slots(0.1, 0.1, 10, 0.2, 0.25, 'v')] } }),
        box([0.6, F + 0.45, 2.35], [0.7, 0.5, 0.5], { id: 'crate-plain', role: 'face', group: 'plain', r: 0.04, axis: 'y', decals: { top: textLines(0.1, 0.1, 0.5, [1, 0.7, 0.9], 0.13, 0.05, 'ink'), front: [{ t: 'rect', x: 0.15, y: 0.1, w: 0.4, h: 0.3, r: 0.03, stroke: 'soft' }] } }),
        // Cipher machine.
        box([2.4, F, 1.8], [2.8, 1.3, 1.6], {
            id: 'machine', role: 'body',
            decals: {
                front: [
                    { t: 'rect', x: 0.2, y: 0.2, w: 1.0, h: 0.5, r: 0.04, fill: 'ink' },
                    ...textLines(0.3, 0.32, 0.7, [1, 0.6], 0.14, 0.05, 'face'),
                    ...grid(1.5, 0.22, 4, 2, 0.28, 0.2, 0.07, { fill: 'face' }),
                    slots(0.2, 0.85, 12, 0.2, 0.25, 'v'),
                ],
                right: [slots(0.15, 0.2, 5, 0.25, 0.8, 'h')],
                top: [...grid(0.3, 0.2, 5, 2, 0.2, 0.2, 0.1, { fill: 'detail' })],
            },
        }),
        box([2.4, F + 1.3, 1.8], [2.8, 1.1, 0.5], { id: 'machine-back', role: 'face', decals: { front: [slots(0.15, 0.2, 9, 0.28, 0.7, 'v')] } }),
        ...ROTORS.map((x, k) => cyl([x, F + 1.7, 2.3], 0.4, 0.4, {
            id: `rotor${k}`, axis: 'z', role: k === 1 ? 'accent' : 'face', n: 28, group: `rotor${k}`,
            decals: { front: [{ t: 'circle', cx: 0.4, cy: 0.4, r: 0.32, stroke: true }, tickRing(0.4, 0.4, 0.3, 24, 4, 0.1), { t: 'circle', cx: 0.4, cy: 0.4, r: 0.07, fill: 'ink' }] },
        })),
        // Output belt, cabinet and crate.
        box([5.2, F, 2.1], [1.4, 0.45, 1.0], { id: 'belt-out', role: 'detail', decals: { top: [slots(0.15, 0.05, 7, 0.18, 0.9, 'v')], front: [slots(0.1, 0.1, 7, 0.2, 0.25, 'v')] } }),
        box([5.4, F + 0.45, 2.35], [0.7, 0.5, 0.5], { id: 'crate-cipher', role: 'ink', group: 'cipher', r: 0.04, axis: 'y', decals: { top: scrambled, front: [slots(0.1, 0.1, 4, 0.14, 0.3, 'h', true)] } }),
        box([6.6, F, 1.6], [1.4, 2.6, 1.8], {
            id: 'cabinet', role: 'body',
            decals: {
                front: [
                    { t: 'rect', x: 0.15, y: 0.2, w: 1.1, h: 2.2, r: 0.05, fill: 'face', stroke: true },
                    { t: 'circle', cx: 0.7, cy: 1.1, r: 0.2, fill: 'ink' },
                    { t: 'line', closed: true, fill: 'face', pts: [[0.67, 1.12], [0.73, 1.12], [0.76, 1.4], [0.64, 1.4]] },
                    { t: 'rect', x: 0.2, y: 1.7, w: 0.9, h: 0.1, r: 0.02, fill: 'ink' },
                    ...textLines(0.3, 0.45, 0.7, [1, 0.6], 0.14, 0.05),
                ],
                right: [slots(0.2, 0.3, 9, 0.18, 1.8, 'v')],
            },
        }),
        // Key table.
        box([0.3, F, 3.5], [1.4, 0.6, 0.8], { id: 'key-table', role: 'detail', decals: { front: [slots(0.1, 0.1, 12, 0.1, 0.25, 'v')] } }),
        prism([0.45, F + 0.6, 3.7], keyProfile, 0.08, { id: 'key', axis: 'y', role: 'face' }),
        ...[5.0, 5.6].map((x, k) => cyl([x, F, 4.2], 0.13, 0.7, { id: `bollard${k}`, role: 'detail', n: 18 })),
    ],
    motion: {
        duration: 4.4,
        label: 'the crate is ciphered and leaves locked',
        tracks: [
            { group: 'plain', t: [1.1, 0, 0], from: 0.05, to: 0.4, ease: 'inOut' },
            { group: 'rotor0', r: { axis: 'z', deg: 120, pivot: [ROTORS[0], F + 2.1, 2.5] }, from: 0.3, to: 0.7, ease: 'inOut' },
            { group: 'rotor1', r: { axis: 'z', deg: -180, pivot: [ROTORS[1], F + 2.1, 2.5] }, from: 0.3, to: 0.7, ease: 'inOut' },
            { group: 'rotor2', r: { axis: 'z', deg: 240, pivot: [ROTORS[2], F + 2.1, 2.5] }, from: 0.3, to: 0.7, ease: 'inOut' },
            { group: 'cipher', t: [0.5, 0, 0], from: 0.65, to: 0.95, ease: 'out' },
        ],
    },
});
