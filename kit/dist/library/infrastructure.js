/**
 * Data and infrastructure scenes: a data center aisle, a container cluster,
 * a tape library, an ETL pipeline into a warehouse and a storage array.
 */
import { defineDrawing, box, cbox, cyl, cone, prism, slots, textLines, grid, tickRing, gearProfile } from '../build.js';
const CREATED = '2026-11-05';
/* ----------------------------------------------------- data center aisle */
const RW = 1.2, RH = 3.6, RD = 1.2, FY = 0.3;
/** Rack-unit faces: nine units with a status LED each. */
function rackFront(w, h, lit = false) {
    const out = [];
    const rows = 9, uh = (h - 0.4) / rows;
    for (let k = 0; k < rows; k++) {
        const y = 0.2 + k * uh;
        out.push({ t: 'rect', x: 0.12, y: y + 0.03, w: w - 0.24, h: uh - 0.06, r: 0.03, fill: k % 4 === 1 ? 'detail' : 'face', stroke: 'soft' });
        out.push({ t: 'circle', cx: w - 0.26, cy: y + uh / 2, r: 0.04, fill: lit && (k === 3 || k === 6) ? 'accent' : 'ink' });
        if (k % 4 !== 1)
            out.push({ t: 'bar', x: 0.22, y: y + uh / 2 - 0.03, w: 0.4, h: 0.06 });
    }
    return out;
}
/** A perforated rack door, hinged on the left as seen from the aisle. */
const doorFace = (w, h) => [
    slots(0.14, 0.25, 12, 0.065, h - 0.5, 'v'),
    { t: 'rect', x: w - 0.16, y: h / 2 - 0.3, w: 0.06, h: 0.6, r: 0.03, fill: 'ink' },
];
const rackTop = [{ t: 'rect', x: 0.15, y: 0.15, w: RW - 0.3, h: RD - 0.3, r: 0.06, stroke: 'soft' }, slots(0.3, 0.3, 7, 0.1, RD - 0.6, 'v')];
/** Back row: fronts face +z. */
function backRack(i, x, open = false) {
    return [
        box([x, FY, 0.4], [RW, RH, RD], { id: `rack-b${i}`, decals: { front: rackFront(RW, RH, open), top: rackTop } }),
        box([x + 0.05, FY + 0.1, 0.4 + RD], [RW - 0.1, RH - 0.2, 0.05], {
            id: `door-b${i}`, role: open ? 'accent' : 'face', group: open ? 'door' : undefined,
            decals: { front: doorFace(RW - 0.1, RH - 0.2) },
        }),
    ];
}
/** Left row: fronts face +x. */
function leftRack(i, z) {
    return [
        box([0.4, FY, z], [RD, RH, RW], { id: `rack-l${i}`, decals: { right: rackFront(RW, RH), top: rackTop } }),
        box([0.4 + RD, FY + 0.1, z + 0.05], [0.05, RH - 0.2, RW - 0.1], { id: `door-l${i}`, role: 'face', decals: { right: doorFace(RW - 0.1, RH - 0.2) } }),
    ];
}
/** A top-of-rack cable tray resting on a row of racks, with three cable runs. */
function tray(id, along, start, len) {
    const ty = FY + RH, out = [];
    const at = (a, c, y) => (along === 'x' ? [a, y, c] : [c, y, a]);
    const size = (l, h, w) => (along === 'x' ? [l, h, w] : [w, h, l]);
    out.push(box(at(start, 0.6, ty), size(len, 0.08, 0.8), { id: `${id}-floor`, role: 'detail' }));
    out.push(box(at(start, 0.6, ty + 0.08), size(len, 0.2, 0.06), { id: `${id}-lip-a`, role: 'detail' }));
    out.push(box(at(start, 1.34, ty + 0.08), size(len, 0.2, 0.06), { id: `${id}-lip-b`, role: 'detail' }));
    for (const [k, c] of [0.8, 1.0, 1.2].entries()) {
        out.push(cyl(at(start, c, ty + 0.17), 0.09, len, { id: `${id}-cable${k}`, axis: along, role: k === 1 ? 'face' : 'ink', n: 14 }));
    }
    return out;
}
const DW = 8.4, DD = 6.6;
const tiles = [
    {
        t: 'segs', stroke: 'soft',
        segs: [
            ...Array.from({ length: 13 }, (_, k) => [0.6 * (k + 1), 0, 0.6 * (k + 1), DD]),
            ...Array.from({ length: 10 }, (_, k) => [0, 0.6 * (k + 1), DW, 0.6 * (k + 1)]),
        ],
    },
    // Perforated cold-aisle tiles in front of both rows.
    ...[[2.4, 1.8], [3.6, 1.8], [4.8, 1.8], [1.8, 2.4], [1.8, 3.6], [1.8, 4.8]].flatMap(([x, y]) => [
        { t: 'rect', x, y, w: 0.6, h: 0.6, fill: 'detail', stroke: 'soft' },
        ...grid(x + 0.1, y + 0.1, 4, 4, 0.06, 0.06, 0.07, { fill: 'face', stroke: false, r: 0.02 }),
    ]),
];
export const dataCenter = defineDrawing({
    id: 'data-center',
    name: 'Data center aisle',
    category: 'data',
    tags: ['data center', 'datacenter', 'server room', 'racks', 'cooling', 'colocation', 'infrastructure', 'cloud', 'hosting', 'cable tray'],
    kind: 'scene',
    prompt: '/isometric create a data center aisle with rows of racks, cooling and cable trays for our infrastructure page',
    description: 'A corner of a data center on a raised tiled floor: two rows of server racks with perforated doors, a power cabinet in the corner, a cooling unit with roof fans, cable trays on standoffs above the racks, a fire suppression cylinder and a crash cart with a laptop. One rack door swings open to show the servers inside.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [DW, FY, DD], { id: 'floor', role: 'face', decals: { top: tiles } }),
        // Power distribution cabinet in the corner.
        box([0.4, FY, 0.4], [1.2, 3.0, 1.2], {
            id: 'pdu', role: 'detail',
            decals: {
                front: [...grid(0.15, 0.3, 4, 5, 0.18, 0.28, 0.06, { fill: 'face' }), { t: 'rect', x: 0.15, y: 2.1, w: 0.9, h: 0.5, r: 0.04, fill: 'ink' }],
                right: [...grid(0.15, 0.3, 4, 5, 0.18, 0.28, 0.06, { fill: 'face' }), slots(0.2, 2.1, 9, 0.1, 0.6, 'v')],
            },
        }),
        ...backRack(0, 2.0), ...backRack(1, 3.3, true), ...backRack(2, 4.6),
        ...leftRack(0, 2.0), ...leftRack(1, 3.3), ...leftRack(2, 4.6),
        // Cooling unit (CRAC) at the end of the back row.
        box([6.0, FY, 0.4], [1.6, 3.2, 1.4], {
            id: 'crac', r: 0.04,
            decals: {
                front: [
                    { t: 'rect', x: 0.2, y: 0.25, w: 0.7, h: 0.4, r: 0.04, fill: 'ink' },
                    ...textLines(0.28, 0.35, 0.5, [1, 0.6], 0.14, 0.05, 'face'),
                    { t: 'circle', cx: 1.25, cy: 0.45, r: 0.12, fill: 'detail', stroke: 'soft' },
                    { t: 'rect', x: 0.2, y: 0.95, w: 1.2, h: 2.0, r: 0.04, stroke: 'soft' },
                    slots(0.3, 1.1, 13, 0.135, 1.0, 'h'),
                ],
                right: [slots(0.25, 0.4, 8, 0.12, 2.4, 'v')],
                top: [
                    { t: 'circle', cx: 0.45, cy: 0.7, r: 0.32, fill: 'detail', stroke: true }, tickRing(0.45, 0.7, 0.3, 12, 3, 0.12),
                    { t: 'circle', cx: 1.15, cy: 0.7, r: 0.32, fill: 'detail', stroke: true }, tickRing(1.15, 0.7, 0.3, 12, 3, 0.12),
                ],
            },
        }),
        // Fire suppression cylinder.
        cyl([8.0, FY, 0.8], 0.25, 1.7, { id: 'suppression', role: 'detail', n: 24, decals: { top: [{ t: 'circle', cx: 0.25, cy: 0.25, r: 0.1, fill: 'ink' }] } }),
        cyl([8.0, FY + 1.7, 0.8], 0.08, 0.18, { id: 'suppression-valve', role: 'ink', n: 12 }),
        // Overhead cable trays.
        ...tray('tray-b', 'x', 2.0, 3.8),
        ...tray('tray-l', 'z', 2.0, 3.8),
        // Crash cart with a laptop.
        ...[[5.0, 3.5], [5.8, 3.5], [5.0, 3.95], [5.8, 3.95]].map(([x, z], k) => cyl([x, FY + 0.08, z], 0.08, 0.1, { id: `wheel${k}`, axis: 'x', role: 'ink', n: 12 })),
        box([4.95, FY + 0.16, 3.35], [1.0, 0.85, 0.7], {
            id: 'cart', r: 0.05, role: 'detail',
            decals: { front: [{ t: 'rect', x: 0.1, y: 0.1, w: 0.8, h: 0.28, r: 0.04, fill: 'face', stroke: 'soft' }, { t: 'rect', x: 0.1, y: 0.47, w: 0.8, h: 0.28, r: 0.04, fill: 'face', stroke: 'soft' }, { t: 'bar', x: 0.35, y: 0.2, w: 0.3, h: 0.06, fill: 'ink' }, { t: 'bar', x: 0.35, y: 0.57, w: 0.3, h: 0.06, fill: 'ink' }] },
        }),
        box([5.15, FY + 1.01, 3.6], [0.6, 0.04, 0.4], { id: 'laptop-base', role: 'face', decals: { top: grid(0.06, 0.06, 6, 3, 0.07, 0.06, 0.02, { fill: 'detail', stroke: false, r: 0.01 }) } }),
        box([5.15, FY + 1.05, 3.57], [0.6, 0.4, 0.03], { id: 'laptop-screen', role: 'face', decals: { front: [{ t: 'rect', x: 0.04, y: 0.04, w: 0.52, h: 0.32, r: 0.02, fill: 'ink' }, ...textLines(0.1, 0.1, 0.36, [1, 0.6, 0.8], 0.08, 0.035, 'face')] } }),
    ],
    motion: {
        duration: 3.2,
        label: 'a rack door swings open',
        tracks: [{ group: 'door', r: { axis: 'y', deg: -95, pivot: [3.35, 0, 0.4 + RD] }, from: 0.1, to: 0.8, ease: 'inOut' }],
    },
});
/* ------------------------------------------------------ container cluster */
const CW = 0.95, CH = 0.6, CL = 1.5;
const NODE_X = [0.6, 3.0, 5.4], NODE_TOP = 0.8;
const SLOT = { x: [0.1, 1.15], z: [1.0, 2.7] };
const containerDecals = {
    front: [
        { t: 'rect', x: 0.06, y: 0.06, w: 0.405, h: 0.48, r: 0.02, stroke: 'soft' },
        { t: 'rect', x: 0.485, y: 0.06, w: 0.405, h: 0.48, r: 0.02, stroke: 'soft' },
        { t: 'segs', segs: [[0.2, 0.1, 0.2, 0.5], [0.33, 0.1, 0.33, 0.5], [0.62, 0.1, 0.62, 0.5], [0.75, 0.1, 0.75, 0.5]], stroke: true },
    ],
    right: [slots(0.08, 0.08, 14, 0.1, 0.44, 'v')],
};
const container = (id, x, y, z, role, group) => box([x, y, z], [CW, CH, CL], { id, role, group, decals: containerDecals });
const slot = (n, c, r, level = 0, role = 'body') => container(`pod-${n}-${c}${r}${level}`, NODE_X[n] + SLOT.x[c], NODE_TOP + level * CH, SLOT.z[r], role);
/** Zig-zag bracing on a lattice tower face. */
const bracing = (w, h) => [{
        t: 'segs', stroke: 'soft',
        segs: Array.from({ length: Math.floor(h / 0.4) }, (_, k) => (k % 2 ? [w - 0.06, 0.1 + k * 0.4, 0.06, 0.5 + k * 0.4] : [0.06, 0.1 + k * 0.4, w - 0.06, 0.5 + k * 0.4])),
    }];
const HANG = 2.4, DROP = HANG - NODE_TOP, TROLLEY_Y = 4.0, BEAM_Y = 4.3;
const PX = NODE_X[1] + SLOT.x[0], PZ = SLOT.z[1];
const cableLen = TROLLEY_Y - (HANG + CH + 0.1);
export const containerCluster = defineDrawing({
    id: 'container-cluster',
    name: 'Container cluster',
    category: 'data',
    tags: ['kubernetes', 'k8s', 'containers', 'docker', 'cluster', 'orchestration', 'scheduler', 'pods', 'nodes', 'devops', 'cloud', 'infrastructure'],
    kind: 'scene',
    prompt: '/isometric create a container cluster: nodes packed with containers and a scheduler placing a new one, for our platform page',
    description: 'Three worker nodes on a deck, each loaded with shipping containers, some stacked two high. A gantry crane spans the cluster and lowers the lit container into the one free slot on the middle node.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [8.2, 0.3, 5.0], { id: 'deck', r: 0.15, role: 'face', decals: { top: [slots(0.3, 4.6, 39, 0.2, 0.2, 'v')] } }),
        ...NODE_X.map((x, n) => box([x, 0.3, 0.9], [2.2, 0.5, 3.4], {
            id: `node${n}`, r: 0.06, role: 'detail',
            decals: {
                front: [slots(0.2, 0.12, 10, 0.12, 0.26, 'v'), { t: 'circle', cx: 1.65, cy: 0.25, r: 0.05, fill: n === 1 ? 'accent' : 'ink' }, { t: 'circle', cx: 1.85, cy: 0.25, r: 0.05, fill: 'ink' }],
                right: [slots(0.3, 0.12, 14, 0.2, 0.26, 'v')],
                top: n === 1 ? [{ t: 'rect', x: SLOT.x[0], y: SLOT.z[1] - 0.9, w: CW, h: CL, r: 0.04, fill: 'face', stroke: true }] : [],
            },
        })),
        // Node A: full, one stacked.
        slot(0, 0, 0, 0, 'body'), slot(0, 1, 0, 0, 'face'), slot(0, 0, 1, 0, 'face'), slot(0, 1, 1, 0, 'body'), slot(0, 0, 0, 1, 'detail'),
        // Node B: one free slot, front left.
        slot(1, 0, 0, 0, 'face'), slot(1, 1, 0, 0, 'body'), slot(1, 1, 1, 0, 'detail'), slot(1, 1, 0, 1, 'face'),
        // Node C: full, two stacked.
        slot(2, 0, 0, 0, 'detail'), slot(2, 1, 0, 0, 'face'), slot(2, 0, 1, 0, 'body'), slot(2, 1, 1, 0, 'face'), slot(2, 0, 0, 1, 'body'), slot(2, 1, 0, 1, 'detail'),
        // Gantry crane over the free slot's row.
        box([0.05, 0.3, PZ + 0.5], [0.4, BEAM_Y - 0.3, 0.5], { id: 'tower-l', decals: { front: bracing(0.4, BEAM_Y - 0.3), right: bracing(0.5, BEAM_Y - 0.3) } }),
        box([7.75, 0.3, PZ + 0.5], [0.4, BEAM_Y - 0.3, 0.5], { id: 'tower-r', decals: { front: bracing(0.4, BEAM_Y - 0.3), right: bracing(0.5, BEAM_Y - 0.3) } }),
        box([0.05, BEAM_Y, PZ + 0.5], [8.1, 0.35, 0.5], { id: 'beam', r: 0.04, axis: 'x', decals: { front: [slots(0.3, 0.08, 38, 0.2, 0.19, 'v')] } }),
        box([PX + 0.1, TROLLEY_Y, PZ + 0.5], [0.75, BEAM_Y - TROLLEY_Y, 0.5], { id: 'trolley', r: 0.04, role: 'detail', decals: { front: [{ t: 'circle', cx: 0.2, cy: 0.15, r: 0.07, fill: 'ink' }, { t: 'circle', cx: 0.55, cy: 0.15, r: 0.07, fill: 'ink' }] } }),
        box([PX + 0.3, HANG + CH + 0.1, PZ + 0.73], [0.04, cableLen, 0.04], { id: 'cable-a', role: 'ink', group: 'cable' }),
        box([PX + 0.62, HANG + CH + 0.1, PZ + 0.73], [0.04, cableLen, 0.04], { id: 'cable-b', role: 'ink', group: 'cable' }),
        box([PX + 0.05, HANG + CH, PZ + 0.1], [CW - 0.1, 0.1, CL - 0.2], { id: 'spreader', role: 'ink', group: 'pod' }),
        container('pod-new', PX, HANG, PZ, 'accent', 'pod'),
    ],
    motion: {
        duration: 3.4,
        label: 'the crane lowers a container into the free slot',
        tracks: [
            { group: 'pod', t: [0, -DROP, 0], from: 0.1, to: 0.85, ease: 'inOut' },
            { group: 'cable', s: { k: [1, (cableLen + DROP) / cableLen, 1], pivot: [PX, TROLLEY_Y, PZ] }, from: 0.1, to: 0.85, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ tape library */
const LW = 6.4, LH = 4.2, LD = 2.4, LT = 0.14, SD = 0.85;
const MX = 1.0, CY = 1.6;
/** A wall of tape cartridges standing on shelves. `gap` leaves one slot empty. */
function cartridges(w, h, gap) {
    const cols = Math.floor((w - 0.1) / 0.185), rows = 6, ch = 0.5, rg = 0.12;
    const x0 = (w - (cols * 0.13 + (cols - 1) * 0.055)) / 2, y0 = (h - (rows * ch + (rows - 1) * rg)) / 2;
    const out = [];
    for (let r = 0; r < rows; r++) {
        const y = y0 + r * (ch + rg);
        out.push({ t: 'segs', segs: [[0.04, y + ch + 0.04, w - 0.04, y + ch + 0.04]], stroke: true });
        for (let c = 0; c < cols; c++) {
            const x = x0 + c * 0.185;
            if (gap && gap[0] === c && gap[1] === r) {
                out.push({ t: 'rect', x, y, w: 0.13, h: ch, r: 0.02, fill: 'ink' });
                continue;
            }
            const k = (c * 7 + r * 3) % 5;
            out.push({ t: 'rect', x, y, w: 0.13, h: ch, r: 0.02, fill: k === 0 ? 'face' : 'detail', stroke: 'soft' });
            out.push({ t: 'rect', x: x + 0.02, y: y + ch - 0.14, w: 0.09, h: 0.1, r: 0.01, fill: k === 0 ? 'detail' : 'face' });
        }
    }
    return out;
}
export const tapeLibrary = defineDrawing({
    id: 'tape-library',
    name: 'Tape library',
    category: 'data',
    tags: ['backup', 'tape', 'archive', 'lto', 'storage', 'robot', 'cold storage', 'disaster recovery', 'infrastructure', 'data'],
    kind: 'scene',
    prompt: '/isometric create a robotic tape library for the backup and archive section of our docs',
    description: 'An open-fronted tape library: walls of tape cartridges on shelves either side of a stack of tape drives, a robot picker riding rails along the front carrying the lit cartridge, and a control module with a touchscreen and mail slots beside it. The picker travels and lifts.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [LW, LT, LD], { id: 'floor', role: 'face' }),
        box([0, LT, 0], [LW, LH - 2 * LT, LT], { id: 'back', role: 'face' }),
        box([0, LT, LT], [LT, LH - 2 * LT, LD - LT], { id: 'side-l' }),
        box([LW - LT, LT, LT], [LT, LH - 2 * LT, LD - LT], { id: 'side-r', decals: { right: [slots(0.4, 0.5, 8, 0.18, 1.0, 'v'), slots(0.4, 2.5, 8, 0.18, 1.0, 'v')] } }),
        box([0, LH - LT, 0], [LW, LT, LD], { id: 'roof', r: 0.05, decals: { top: [{ t: 'rect', x: 0.3, y: 0.3, w: LW - 0.6, h: LD - 0.6, r: 0.1, fill: 'face', stroke: 'soft' }, slots(0.6, 0.6, 26, 0.2, LD - 1.2, 'v')] } }),
        // Storage walls and the drive stack.
        box([LT, LT, LT], [2.5, LH - 2 * LT, SD], { id: 'store-l', role: 'face', decals: { front: cartridges(2.5, LH - 2 * LT, [4, 3]) } }),
        box([LT + 2.6, LT, LT], [0.9, LH - 2 * LT, SD], {
            id: 'drives', role: 'detail',
            decals: {
                front: [
                    ...[0, 1, 2, 3].flatMap((k) => [
                        { t: 'rect', x: 0.1, y: 0.3 + k * 0.55, w: 0.7, h: 0.42, r: 0.04, fill: 'face', stroke: 'soft' },
                        { t: 'bar', x: 0.18, y: 0.48 + k * 0.55, w: 0.36, h: 0.07, fill: 'ink' },
                        { t: 'circle', cx: 0.68, cy: 0.42 + k * 0.55, r: 0.04, fill: k === 1 ? 'accent' : 'ink' },
                    ]),
                    slots(0.15, 2.7, 7, 0.1, 0.9, 'v'),
                ],
            },
        }),
        box([LT + 3.6, LT, LT], [LW - 2 * LT - 3.6, LH - 2 * LT, SD], { id: 'store-r', role: 'face', decals: { front: cartridges(LW - 2 * LT - 3.6, LH - 2 * LT) } }),
        // Rails along the open front.
        box([LT, LT, 1.56], [LW - 2 * LT, 0.12, 0.3], { id: 'rail-low', role: 'ink' }),
        // Picker: a stacker mast on the floor rail, gripper with the cartridge, front collar.
        box([MX, LT + 0.12, 1.56], [0.3, LH - 2 * LT - 0.36, 0.3], { id: 'mast', role: 'detail', group: 'mast', decals: { front: [slots(0.08, 0.2, 22, 0.15, 0.14, 'h')] } }),
        box([MX - 0.08, LH - LT - 0.24, 1.6], [0.46, 0.12, 0.22], { id: 'mast-head', r: 0.03, role: 'ink', group: 'mast' }),
        box([MX - 0.2, CY, 1.06], [0.7, 0.42, 0.5], { id: 'gripper', r: 0.04, role: 'body', group: 'car', decals: { front: [{ t: 'rect', x: 0.08, y: 0.1, w: 0.54, h: 0.22, r: 0.04, fill: 'ink' }] } }),
        box([MX + 0.08, CY + 0.42, 1.12], [0.14, 0.5, 0.38], { id: 'cartridge', r: 0.02, role: 'accent', group: 'car', decals: { front: [{ t: 'rect', x: 0.02, y: 0.36, w: 0.1, h: 0.1, r: 0.01, fill: 'face' }] } }),
        box([MX - 0.06, CY, 1.86], [0.42, 0.42, 0.1], { id: 'collar', r: 0.03, role: 'body', group: 'car', decals: { front: [{ t: 'circle', cx: 0.21, cy: 0.21, r: 0.06, fill: 'accent' }] } }),
        // Control module.
        box([LW + 0.08, 0, 0], [1.5, LH, LD], {
            id: 'control', r: 0.05,
            decals: {
                front: [
                    { t: 'rect', x: 0.25, y: 0.4, w: 1.0, h: 0.7, r: 0.05, fill: 'ink' },
                    ...textLines(0.38, 0.55, 0.6, [1, 0.7, 0.85], 0.16, 0.06, 'face'),
                    { t: 'rect', x: 0.25, y: 1.5, w: 1.0, h: 1.2, r: 0.05, fill: 'face', stroke: true },
                    ...grid(0.33, 1.62, 5, 2, 0.12, 0.45, 0.07, { fill: 'detail' }),
                    { t: 'circle', cx: 1.1, cy: 2.9, r: 0.08, fill: 'accent', stroke: 'soft' },
                    slots(0.25, 3.15, 9, 0.12, 0.8, 'v'),
                ],
                right: [slots(0.4, 0.5, 9, 0.18, 1.2, 'v')],
            },
        }),
    ],
    motion: {
        duration: 4,
        label: 'the picker travels along its rails and lifts the cartridge',
        tracks: [
            { group: 'mast', t: [3.6, 0, 0], ease: 'inOut' },
            { group: 'car', t: [3.6, 1.2, 0], ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ data pipeline */
const PY = 1.1, PR = 0.1, SRC_X = 1.1, SRC_Z = [1.0, 2.6, 4.2];
const XF = { x: 3.4, w: 2.0 }, SILO = { x: 7.9, z: 2.6 }, VALVE_X = 6.1;
const pipeX = (id, x0, x1, z, role = 'detail') => cyl([x0, PY, z], PR, x1 - x0, { id, axis: 'x', role, n: 16 });
const support = (id, x, z, top = PY - PR) => cbox(x, 0.3, z, [0.14, top - 0.3, 0.22], { id, role: 'ink' });
const siloParts = () => {
    const out = [cyl([SILO.x, 0.3, SILO.z], 1.1, 0.2, { id: 'silo-base', role: 'detail', n: 48 })];
    let y = 0.5;
    for (let k = 0; k < 3; k++) {
        out.push(cyl([SILO.x, y, SILO.z], 1.0, 0.95, { id: `silo-${k}`, n: 48 }));
        y += 0.95;
        if (k < 2) {
            out.push(cyl([SILO.x, y, SILO.z], 1.05, 0.08, { id: `silo-band${k}`, role: 'detail', n: 48 }));
            y += 0.08;
        }
    }
    out.push(cone([SILO.x, y, SILO.z], 1.06, 0.6, { id: 'silo-roof', role: 'face', n: 48 }));
    return out;
};
export const dataPipeline = defineDrawing({
    id: 'data-pipeline',
    name: 'Data pipeline',
    category: 'data',
    tags: ['etl', 'elt', 'pipeline', 'data warehouse', 'data lake', 'ingestion', 'analytics', 'streaming', 'integration', 'data engineering'],
    kind: 'scene',
    prompt: '/isometric create an ETL pipeline: sources on the left, a transform unit, and a warehouse silo filling up, for our data platform landing page',
    description: 'Three sources, a database, an API server and an event stream tank, pipe into a transform unit with filter housings and a control panel. A lit pipe carries the result through a valve into a tall warehouse silo whose level gauge rises as the valve wheel turns.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [9.4, 0.3, 5.2], { id: 'deck', r: 0.15, role: 'face', decals: { top: [{ t: 'rect', x: 0.2, y: 0.2, w: 9.0, h: 4.8, r: 0.12, stroke: 'soft' }, slots(2.3, 4.7, 30, 0.2, 0.18, 'v')] } }),
        // Source A: database platters.
        cyl([SRC_X, 0.3, SRC_Z[0]], 0.65, 0.1, { id: 'pad-a', role: 'detail', n: 40 }),
        cyl([SRC_X, 0.4, SRC_Z[0]], 0.55, 0.45, { id: 'db-1', n: 40 }),
        cyl([SRC_X, 0.85, SRC_Z[0]], 0.48, 0.06, { id: 'db-g1', role: 'detail', n: 36 }),
        cyl([SRC_X, 0.91, SRC_Z[0]], 0.55, 0.45, { id: 'db-2', n: 40 }),
        cyl([SRC_X, 1.36, SRC_Z[0]], 0.48, 0.06, { id: 'db-g2', role: 'detail', n: 36 }),
        cyl([SRC_X, 1.42, SRC_Z[0]], 0.55, 0.45, { id: 'db-3', n: 40, decals: { top: [{ t: 'circle', cx: 0.55, cy: 0.55, r: 0.32, stroke: 'soft' }] } }),
        // Source B: API server.
        cbox(SRC_X, 0.3, SRC_Z[1], [1.0, 1.6, 1.0], {
            id: 'api', r: 0.05, role: 'face',
            decals: {
                front: [...[0, 1, 2].flatMap((k) => [{ t: 'rect', x: 0.1, y: 0.15 + k * 0.42, w: 0.8, h: 0.32, r: 0.04, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 0.76, cy: 0.31 + k * 0.42, r: 0.04, fill: 'ink' }]), slots(0.15, 1.42, 8, 0.1, 0.1, 'v')],
                right: [slots(0.15, 0.2, 8, 0.1, 1.2, 'v')],
            },
        }),
        // Source C: event stream tank.
        cyl([SRC_X, 0.3, SRC_Z[2]], 0.6, 0.1, { id: 'pad-c', role: 'detail', n: 40 }),
        cyl([SRC_X, 0.4, SRC_Z[2]], 0.5, 1.3, { id: 'stream', role: 'detail', n: 40 }),
        cone([SRC_X, 1.7, SRC_Z[2]], 0.5, 0.35, { id: 'stream-cap', role: 'face', n: 40 }),
        // Ingest pipes with supports.
        pipeX('pipe-a', SRC_X + 0.55, XF.x, SRC_Z[0]), pipeX('pipe-b', SRC_X + 0.5, XF.x, SRC_Z[1]), pipeX('pipe-c', SRC_X + 0.5, XF.x, SRC_Z[2]),
        ...SRC_Z.map((z, k) => support(`support-${k}`, 2.5, z)),
        // Transform unit.
        box([XF.x, 0.3, 0.6], [XF.w, 1.9, 4.0], {
            id: 'transform', r: 0.04,
            decals: {
                front: [
                    { t: 'rect', x: 0.2, y: 0.2, w: 0.9, h: 0.5, r: 0.04, fill: 'ink' },
                    ...textLines(0.3, 0.32, 0.6, [1, 0.7], 0.15, 0.06, 'face'),
                    { t: 'circle', cx: 1.5, cy: 0.5, r: 0.28, fill: 'face', stroke: true }, tickRing(1.5, 0.5, 0.26, 16, 4, 0.08),
                    { t: 'line', pts: [[1.5, 0.5], [1.66, 0.36]], stroke: true },
                    ...grid(0.2, 1.0, 4, 1, 0.3, 0.2, 0.1, { fill: 'detail' }),
                    slots(0.2, 1.4, 16, 0.1, 0.3, 'v'),
                ],
                right: [...[0, 1, 2].map((k) => ({ t: 'rect', x: 0.25 + k * 1.25, y: 0.25, w: 1.0, h: 1.4, r: 0.05, stroke: 'soft' })), ...[0, 1, 2].map((k) => slots(0.45 + k * 1.25, 0.5, 6, 0.1, 0.9, 'v'))],
                top: [{ t: 'rect', x: 0.15, y: 0.15, w: XF.w - 0.3, h: 3.7, r: 0.08, stroke: 'soft' }],
            },
        }),
        ...[1.6, 3.6].flatMap((z, k) => [
            cyl([XF.x + 0.6, 2.2, z], 0.35, 0.7, { id: `filter${k}`, role: 'face', n: 32, decals: { top: [{ t: 'circle', cx: 0.35, cy: 0.35, r: 0.2, fill: 'detail', stroke: 'soft' }] } }),
            cyl([XF.x + 1.4, 2.2, z], 0.2, 0.45, { id: `vent${k}`, role: 'detail', n: 24, decals: { top: [{ t: 'circle', cx: 0.2, cy: 0.2, r: 0.1, fill: 'ink' }] } }),
        ]),
        // Output: lit pipe, valve, lit pipe into the silo.
        pipeX('pipe-out-a', XF.x + XF.w, VALVE_X - 0.2, SILO.z, 'accent'),
        cbox(VALVE_X, PY - 0.2, SILO.z, [0.4, 0.4, 0.4], { id: 'valve', r: 0.06, role: 'detail' }),
        support('support-valve', VALVE_X, SILO.z, PY - 0.2),
        cyl([VALVE_X, PY + 0.2, SILO.z], 0.04, 0.22, { id: 'valve-stem', role: 'ink', n: 10 }),
        prism([0, PY + 0.42, 0], gearProfile(8, 0.28, 0.21, VALVE_X, SILO.z), 0.06, { id: 'valve-wheel', axis: 'y', role: 'ink', group: 'wheel' }),
        pipeX('pipe-out-b', VALVE_X + 0.2, SILO.x - 1.0, SILO.z, 'accent'),
        ...siloParts(),
        // Level gauge on the silo's right.
        box([SILO.x + 1.12, 0.3, SILO.z - 0.15], [0.06, 3.0, 0.3], { id: 'gauge', role: 'face', decals: { right: [slots(0.02, 0.2, 14, 0.2, 0.06, 'h', true)] } }),
        box([SILO.x + 1.18, 0.4, SILO.z - 0.08], [0.06, 0.9, 0.16], { id: 'level', role: 'accent', group: 'level' }),
    ],
    motion: {
        duration: 3.6,
        label: 'the valve turns and the warehouse fills',
        tracks: [
            { group: 'wheel', r: { axis: 'y', deg: 360, pivot: [VALVE_X, 0, SILO.z] }, mode: 'loop' },
            { group: 'level', s: { k: [1, 2.8, 1], pivot: [SILO.x + 1.21, 0.4, SILO.z] }, ease: 'inOut' },
        ],
    },
});
/* ------------------------------------------------------------ storage array */
const AX = 0.6, AW = 4.4, AZ = 0.5, AD = 2.6;
const SH = { y: 1.75, h: 1.0, plate: 0.08, ear: 0.3 };
const BAYS = 24, LIT = 10;
const pitch = (AW - 2 * SH.ear) / BAYS;
export const storageArray = defineDrawing({
    id: 'storage-array',
    name: 'Storage array',
    category: 'data',
    tags: ['storage', 'san', 'nas', 'raid', 'ssd', 'disk', 'drives', 'array', 'hardware', 'backup', 'infrastructure', 'jbod'],
    kind: 'scene',
    prompt: '/isometric create an all-flash storage array with a drive being hot-swapped for our storage product page',
    description: 'A storage array on a plinth: a disk shelf of twelve large drives at the bottom, a controller shelf with twenty-four slim drive sleds above it, and a top-of-rack switch. The lit sled slides out to be hot-swapped; a spare drive lies on the plinth.',
    createdAt: CREATED,
    parts: [
        box([0, 0, 0], [5.6, 0.25, 3.8], { id: 'plinth', r: 0.12, role: 'face', decals: { top: [slots(0.3, 3.45, 26, 0.2, 0.18, 'v')] } }),
        // Disk shelf: 4 x 3 large drives.
        box([AX, 0.25, AZ], [AW, 1.5, AD], {
            id: 'disk-shelf',
            decals: {
                front: [
                    { t: 'rect', x: 0.05, y: 0.08, w: 0.25, h: 1.34, r: 0.04, stroke: 'soft' },
                    { t: 'rect', x: AW - 0.3, y: 0.08, w: 0.25, h: 1.34, r: 0.04, stroke: 'soft' },
                    { t: 'circle', cx: 0.175, cy: 0.3, r: 0.05, fill: 'ink' },
                    ...[0, 1, 2].flatMap((r) => [0, 1, 2, 3].flatMap((c) => {
                        const x = 0.42 + c * 0.9, y = 0.08 + r * 0.46;
                        return [
                            { t: 'rect', x, y, w: 0.85, h: 0.42, r: 0.04, fill: 'face', stroke: 'soft' },
                            slots(x + 0.08, y + 0.08, 8, 0.07, 0.26, 'v'),
                            { t: 'rect', x: x + 0.66, y: y + 0.1, w: 0.12, h: 0.22, r: 0.03, fill: 'detail' },
                            { t: 'circle', cx: x + 0.72, cy: y + 0.06 + 0.32, r: 0.025, fill: 'ink' },
                        ];
                    })),
                ],
                right: [slots(0.3, 0.25, 10, 0.2, 1.0, 'v')],
            },
        }),
        // Controller shelf: an open frame holding 24 sleds.
        box([AX, SH.y, AZ], [AW, SH.plate, AD], { id: 'shelf-floor', role: 'detail' }),
        box([AX, SH.y + SH.h - SH.plate, AZ], [AW, SH.plate, AD], { id: 'shelf-roof', role: 'detail' }),
        box([AX, SH.y + SH.plate, AZ], [SH.ear, SH.h - 2 * SH.plate, AD], {
            id: 'ear-l', role: 'body',
            decals: { front: [{ t: 'circle', cx: 0.15, cy: 0.18, r: 0.05, fill: 'accent' }, { t: 'circle', cx: 0.15, cy: 0.36, r: 0.05, fill: 'ink' }, { t: 'rect', x: 0.08, y: 0.52, w: 0.14, h: 0.22, r: 0.03, fill: 'ink' }] },
        }),
        box([AX + AW - SH.ear, SH.y + SH.plate, AZ], [SH.ear, SH.h - 2 * SH.plate, AD], {
            id: 'ear-r', role: 'body',
            decals: { front: [{ t: 'circle', cx: 0.15, cy: 0.18, r: 0.05, fill: 'ink' }, slots(0.1, 0.34, 3, 0.05, 0.38, 'v')], right: [slots(0.3, 0.2, 11, 0.2, 0.44, 'v')] },
        }),
        box([AX + SH.ear, SH.y + SH.plate, AZ], [AW - 2 * SH.ear, SH.h - 2 * SH.plate, 0.1], { id: 'backplane', role: 'ink' }),
        ...Array.from({ length: BAYS }, (_, k) => box([AX + SH.ear + k * pitch + 0.01, SH.y + SH.plate, AZ + 0.6], [pitch - 0.02, SH.h - 2 * SH.plate, AD - 0.6], {
            id: `sled${k}`, role: k === LIT ? 'accent' : k % 6 === 5 ? 'detail' : 'face', group: k === LIT ? 'sled' : undefined,
            decals: { front: [{ t: 'circle', cx: (pitch - 0.02) / 2, cy: 0.1, r: 0.03, fill: k === LIT ? 'face' : 'ink' }, { t: 'rect', x: 0.03, y: 0.5, w: pitch - 0.08, h: 0.22, r: 0.02, fill: 'detail', stroke: 'soft' }] },
        })),
        // Top-of-rack switch.
        box([AX, SH.y + SH.h, AZ], [AW, 0.35, AD], {
            id: 'switch', r: 0.03, role: 'detail',
            decals: {
                front: [...grid(0.45, 0.1, 16, 1, 0.14, 0.12, 0.06, { fill: 'ink', stroke: false, r: 0.01 }), ...grid(3.75, 0.1, 2, 1, 0.22, 0.12, 0.06, { fill: 'face' }), { t: 'circle', cx: 4.25, cy: 0.16, r: 0.04, fill: 'accent' }],
                top: [slots(0.4, 0.4, 18, 0.2, 1.8, 'v')],
            },
        }),
        // Spare drive on the plinth.
        box([4.15, 0.25, 3.2], [1.05, 0.18, 0.5], {
            id: 'spare', r: 0.03, role: 'face',
            decals: { top: [{ t: 'rect', x: 0.08, y: 0.08, w: 0.55, h: 0.34, r: 0.03, fill: 'detail', stroke: 'soft' }, { t: 'circle', cx: 0.85, cy: 0.25, r: 0.1, stroke: 'soft' }] },
        }),
    ],
    motion: {
        duration: 3,
        label: 'a drive sled slides out to be swapped',
        tracks: [{ group: 'sled', t: [0, 0, 1.1], from: 0.1, to: 0.8, ease: 'inOut' }],
    },
});
