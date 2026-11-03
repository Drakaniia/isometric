/**
 * math.ts: vectors, affine transforms and the one isometric camera.
 *
 * World axes: x runs to the lower right of the screen, z to the lower left,
 * y straight up. The viewer looks along -(1, 1, 1), so a face is visible when
 * its outward normal n satisfies n . (1, 1, 1) > 0.
 */
export type Vec3 = [number, number, number];
export type Vec2 = [number, number];
export type Axis = 'x' | 'y' | 'z';

export const COS30 = Math.cos(Math.PI / 6);
export const SIN30 = 0.5;
export const VIEW: Vec3 = [1, 1, 1];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const clamp = (v: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Project a world point to screen units (1 world unit = `s` screen units). */
export function project(p: Vec3, s = 1): Vec2 {
  return [(p[0] - p[2]) * COS30 * s, (p[0] + p[2]) * SIN30 * s - p[1] * s];
}

/** Inverse of project() for a point known to lie on the horizontal plane y. */
export function unprojectToPlane(sx: number, sy: number, y = 0, s = 1): Vec3 {
  const a = sx / (COS30 * s);
  const b = (2 * (sy + y * s)) / s;
  return [(a + b) / 2, y, (b - a) / 2];
}

/** Depth along the view ray: larger is nearer the viewer. */
export const depthOf = (p: Vec3): number => p[0] + p[1] + p[2];

/* ----------------------------------------------------------- transforms */

/** Affine transform: p' = M p + t, with M a row-major 3x3 matrix. */
export interface Affine {
  m: number[];
  t: Vec3;
}

export const IDENTITY: Affine = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };

export function apply(a: Affine, p: Vec3): Vec3 {
  const m = a.m;
  return [
    m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + a.t[0],
    m[3] * p[0] + m[4] * p[1] + m[5] * p[2] + a.t[1],
    m[6] * p[0] + m[7] * p[1] + m[8] * p[2] + a.t[2],
  ];
}

/** Apply only the linear part (for normals and directions; M is orthogonal here). */
export function applyDir(a: Affine, v: Vec3): Vec3 {
  const m = a.m;
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** Compose: result applies `first`, then `second`. */
export function compose(first: Affine, second: Affine): Affine {
  const a = second.m, b = first.m;
  const m = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    m[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  }
  return { m, t: apply(second, first.t) };
}

export function det(a: Affine): number {
  const m = a.m;
  return m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
}

export function translation(t: Vec3): Affine {
  return { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [...t] as Vec3 };
}

/** Rotation by `deg` degrees about an axis-parallel line through `pivot` (right-handed). */
export function rotation(axis: Axis, deg: number, pivot: Vec3 = [0, 0, 0]): Affine {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  let m: number[];
  if (axis === 'x') m = [1, 0, 0, 0, c, -s, 0, s, c];
  else if (axis === 'y') m = [c, 0, s, 0, 1, 0, -s, 0, c];
  else m = [c, -s, 0, s, c, 0, 0, 0, 1];
  const r: Affine = { m, t: [0, 0, 0] };
  return compose(compose(translation(scale(pivot, -1)), r), translation(pivot));
}

/** Mirror across the vertical plane x = z through `pivot`: swaps x and z. */
export function mirrorXZ(pivot: Vec3 = [0, 0, 0]): Affine {
  const r: Affine = { m: [0, 0, 1, 0, 1, 0, 1, 0, 0], t: [0, 0, 0] };
  return compose(compose(translation(scale(pivot, -1)), r), translation(pivot));
}

/* ------------------------------------------------------------- bounds */

export interface AABB {
  min: Vec3;
  max: Vec3;
}

export function emptyBox(): AABB {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}

export function growBox(b: AABB, p: Vec3): void {
  for (let i = 0; i < 3; i++) {
    if (p[i] < b.min[i]) b.min[i] = p[i];
    if (p[i] > b.max[i]) b.max[i] = p[i];
  }
}

export function unionBox(a: AABB, b: AABB): AABB {
  return {
    min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
    max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])],
  };
}

export const boxCentre = (b: AABB): Vec3 => [
  (b.min[0] + b.max[0]) / 2,
  (b.min[1] + b.max[1]) / 2,
  (b.min[2] + b.max[2]) / 2,
];
