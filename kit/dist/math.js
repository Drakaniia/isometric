export const COS30 = Math.cos(Math.PI / 6);
export const SIN30 = 0.5;
export const VIEW = [1, 1, 1];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => {
    const l = len(a) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
};
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** Project a world point to screen units (1 world unit = `s` screen units). */
export function project(p, s = 1) {
    return [(p[0] - p[2]) * COS30 * s, (p[0] + p[2]) * SIN30 * s - p[1] * s];
}
/** Inverse of project() for a point known to lie on the horizontal plane y. */
export function unprojectToPlane(sx, sy, y = 0, s = 1) {
    const a = sx / (COS30 * s);
    const b = (2 * (sy + y * s)) / s;
    return [(a + b) / 2, y, (b - a) / 2];
}
/** Depth along the view ray: larger is nearer the viewer. */
export const depthOf = (p) => p[0] + p[1] + p[2];
export const IDENTITY = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };
export function apply(a, p) {
    const m = a.m;
    return [
        m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + a.t[0],
        m[3] * p[0] + m[4] * p[1] + m[5] * p[2] + a.t[1],
        m[6] * p[0] + m[7] * p[1] + m[8] * p[2] + a.t[2],
    ];
}
/** Apply only the linear part (for normals and directions; M is orthogonal here). */
export function applyDir(a, v) {
    const m = a.m;
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
    ];
}
/** Compose: result applies `first`, then `second`. */
export function compose(first, second) {
    const a = second.m, b = first.m;
    const m = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
            m[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
        }
    return { m, t: apply(second, first.t) };
}
export function det(a) {
    const m = a.m;
    return m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
}
export function translation(t) {
    return { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [...t] };
}
/** Rotation by `deg` degrees about an axis-parallel line through `pivot` (right-handed). */
export function rotation(axis, deg, pivot = [0, 0, 0]) {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    let m;
    if (axis === 'x')
        m = [1, 0, 0, 0, c, -s, 0, s, c];
    else if (axis === 'y')
        m = [c, 0, s, 0, 1, 0, -s, 0, c];
    else
        m = [c, -s, 0, s, c, 0, 0, 0, 1];
    const r = { m, t: [0, 0, 0] };
    return compose(compose(translation(scale(pivot, -1)), r), translation(pivot));
}
/** Mirror across the vertical plane x = z through `pivot`: swaps x and z. */
export function mirrorXZ(pivot = [0, 0, 0]) {
    const r = { m: [0, 0, 1, 0, 1, 0, 1, 0, 0], t: [0, 0, 0] };
    return compose(compose(translation(scale(pivot, -1)), r), translation(pivot));
}
export function emptyBox() {
    return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}
export function growBox(b, p) {
    for (let i = 0; i < 3; i++) {
        if (p[i] < b.min[i])
            b.min[i] = p[i];
        if (p[i] > b.max[i])
            b.max[i] = p[i];
    }
}
export function unionBox(a, b) {
    return {
        min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
        max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])],
    };
}
export const boxCentre = (b) => [
    (b.min[0] + b.max[0]) / 2,
    (b.min[1] + b.max[1]) / 2,
    (b.min[2] + b.max[2]) / 2,
];
