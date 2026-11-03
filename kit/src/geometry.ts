/**
 * geometry.ts: turn parts into solids (polyhedra or balls) with face frames.
 *
 * Every polyhedron is a loft between two planar rings, which covers boxes,
 * rounded boxes, cylinders, frustums, cones and extruded profiles (gears,
 * roofs, L-shapes). Normals are outward by construction and carried through
 * every transform, so visibility never depends on winding.
 */
import type { Axis, Vec3, Affine, AABB } from './math.js';
import { apply, applyDir, cross, dot, norm, sub, emptyBox, growBox, compose, rotation, IDENTITY } from './math.js';
import type { Part, FaceName, Role } from './model.js';

export interface Frame {
  o: Vec3;
  u: Vec3;
  v: Vec3;
  n: Vec3;
  w: number;
  h: number;
}

export interface PolyFace {
  idx: number[];
  n: Vec3;
  name?: FaceName;
}

export interface Poly {
  kind: 'poly';
  verts: Vec3[];
  faces: PolyFace[];
  /** adj[f][k]: face across edge k of face f (edge from idx[k] to idx[k+1]), or -1. */
  adj: number[][];
}

export interface Ball {
  kind: 'ball';
  c: Vec3;
  r: number;
}

export interface Solid {
  key: string;
  part: Part;
  role: Role;
  geo: Poly | Ball;
  frames: Partial<Record<FaceName, Frame>>;
  group?: string;
  bias: number;
  fixed: boolean;
  /** Set for renderer-generated solids (the plinth). */
  generated?: boolean;
}

const AXIS_DIR: Record<Axis, Vec3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** Map a 2D profile point onto the plane perpendicular to `axis` at height `h`. */
function lift2(axis: Axis, u: number, v: number, h: number): Vec3 {
  if (axis === 'y') return [u, h, v];
  if (axis === 'x') return [h, v, u];
  return [u, v, h];
}

function newell(pts: Vec3[]): Vec3 {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return [x, y, z];
}

function nameOf(n: Vec3): FaceName | undefined {
  const E = 0.999;
  if (n[1] > E) return 'top';
  if (n[1] < -E) return 'bottom';
  if (n[2] > E) return 'front';
  if (n[2] < -E) return 'back';
  if (n[0] > E) return 'right';
  if (n[0] < -E) return 'left';
  return undefined;
}

/** Build the face adjacency table from shared vertex pairs. */
function adjacency(faces: PolyFace[]): number[][] {
  const map = new Map<string, number[]>();
  faces.forEach((f, fi) => {
    for (let k = 0; k < f.idx.length; k++) {
      const a = f.idx[k], b = f.idx[(k + 1) % f.idx.length];
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      const list = map.get(key);
      if (list) list.push(fi);
      else map.set(key, [fi]);
    }
  });
  return faces.map((f, fi) =>
    f.idx.map((a, k) => {
      const b = f.idx[(k + 1) % f.idx.length];
      const list = map.get(a < b ? `${a},${b}` : `${b},${a}`) || [];
      const other = list.find((x) => x !== fi);
      return other === undefined ? -1 : other;
    }),
  );
}

/** Loft between two rings with the same vertex count, extruded along `dir`. */
export function loft(ring0: Vec3[], ring1: Vec3[], dir: Vec3): Poly {
  let r0 = ring0, r1 = ring1;
  if (dot(newell(r0), dir) < 0) {
    r0 = [...r0].reverse();
    r1 = [...r1].reverse();
  }
  const n = r0.length;
  const verts = [...r0, ...r1];
  const faces: PolyFace[] = [];
  const down = norm([-dir[0], -dir[1], -dir[2]]);
  const up = norm(dir);
  faces.push({ idx: Array.from({ length: n }, (_, i) => n - 1 - i), n: down, name: nameOf(down) });
  faces.push({ idx: Array.from({ length: n }, (_, i) => n + i), n: up, name: nameOf(up) });
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const idx = [i, j, n + j, n + i];
    const nn = norm(newell(idx.map((k) => verts[k])));
    faces.push({ idx, n: nn, name: nameOf(nn) });
  }
  return { kind: 'poly', verts, faces, adj: adjacency(faces) };
}

/** Rounded rectangle ring in 2D, `seg` points per corner. */
export function roundRect(u0: number, v0: number, u1: number, v1: number, r = 0, seg = 5): [number, number][] {
  const rr = Math.max(0, Math.min(r, (u1 - u0) / 2 - 1e-4, (v1 - v0) / 2 - 1e-4));
  if (rr <= 1e-4) return [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [u1 - rr, v0 + rr, -90],
    [u1 - rr, v1 - rr, 0],
    [u0 + rr, v1 - rr, 90],
    [u0 + rr, v0 + rr, 180],
  ];
  for (const [cu, cv, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
      pts.push([cu + Math.cos(a) * rr, cv + Math.sin(a) * rr]);
    }
  }
  return pts;
}

export function circle2(cu: number, cv: number, r: number, n = 32): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as [number, number];
  });
}

function frameSet(b: AABB): Record<FaceName, Frame> {
  const [x0, y0, z0] = b.min, [x1, y1, z1] = b.max;
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
  return {
    top: { o: [x0, y1, z0], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0], w: dx, h: dz },
    bottom: { o: [x0, y0, z1], u: [1, 0, 0], v: [0, 0, -1], n: [0, -1, 0], w: dx, h: dz },
    front: { o: [x0, y1, z1], u: [1, 0, 0], v: [0, -1, 0], n: [0, 0, 1], w: dx, h: dy },
    back: { o: [x1, y1, z0], u: [-1, 0, 0], v: [0, -1, 0], n: [0, 0, -1], w: dx, h: dy },
    right: { o: [x1, y1, z1], u: [0, 0, -1], v: [0, -1, 0], n: [1, 0, 0], w: dz, h: dy },
    left: { o: [x0, y1, z0], u: [0, 0, 1], v: [0, -1, 0], n: [-1, 0, 0], w: dz, h: dy },
  };
}

/** Build the model-space geometry of one part (static rotations applied). */
export function buildSolid(part: Part, key: string): Solid {
  const s = part.shape;
  let geo: Poly | Ball;
  const bb = emptyBox();
  if (s.kind === 'sphere') {
    geo = { kind: 'ball', c: [...s.at] as Vec3, r: s.r };
    growBox(bb, [s.at[0] - s.r, s.at[1] - s.r, s.at[2] - s.r]);
    growBox(bb, [s.at[0] + s.r, s.at[1] + s.r, s.at[2] + s.r]);
  } else {
    const axis: Axis = s.axis || 'y';
    const dir = AXIS_DIR[axis];
    let ring2: [number, number][];
    let ring2b: [number, number][] | null = null;
    let h0: number, h1: number;
    if (s.kind === 'box') {
      const [x, y, z] = s.at, [w, h, d] = s.size;
      if (axis === 'y') { ring2 = roundRect(x, z, x + w, z + d, s.r, s.seg); h0 = y; h1 = y + h; }
      else if (axis === 'x') { ring2 = roundRect(z, y, z + d, y + h, s.r, s.seg); h0 = x; h1 = x + w; }
      else { ring2 = roundRect(x, y, x + w, y + h, s.r, s.seg); h0 = z; h1 = z + d; }
    } else if (s.kind === 'cyl') {
      const [x, y, z] = s.at;
      const n = s.n || 32;
      const cu = axis === 'y' ? x : axis === 'x' ? z : x;
      const cv = axis === 'y' ? z : y;
      const base = axis === 'y' ? y : axis === 'x' ? x : z;
      let ra = s.r, rb = s.r2 === undefined ? s.r : s.r2, hh = s.h, b0 = base;
      // A negative height grows the other way (a cone pointing down).
      if (hh < 0) { b0 = base + hh; hh = -hh; [ra, rb] = [rb, ra]; }
      const tiny = Math.max(ra, rb) * 0.002;
      ring2 = circle2(cu, cv, Math.max(ra, tiny), n);
      ring2b = circle2(cu, cv, Math.max(rb, tiny), n);
      h0 = b0; h1 = b0 + hh;
    } else {
      const base = axis === 'y' ? s.at[1] : axis === 'x' ? s.at[0] : s.at[2];
      const [ou, ov] = axis === 'y' ? [s.at[0], s.at[2]] : axis === 'x' ? [s.at[2], s.at[1]] : [s.at[0], s.at[1]];
      ring2 = s.profile.map(([u, v]) => [u + ou, v + ov] as [number, number]);
      h0 = base; h1 = base + s.len;
    }
    const r0 = ring2.map(([u, v]) => lift2(axis, u, v, h0));
    const r1 = (ring2b || ring2).map(([u, v]) => lift2(axis, u, v, h1));
    geo = loft(r0, r1, dir);
    for (const p of geo.verts) growBox(bb, p);
  }
  const solid: Solid = {
    key,
    part,
    role: part.role || 'body',
    geo,
    frames: s.kind === 'sphere' ? {} : frameSet(bb),
    group: part.group,
    bias: part.bias || 0,
    fixed: !!part.fixed,
  };
  if (part.rot && part.rot.length) {
    let a: Affine = IDENTITY;
    for (const r of part.rot) a = compose(a, rotation(r.axis, r.deg, r.pivot));
    return transformSolid(solid, a);
  }
  return solid;
}

export function transformSolid(s: Solid, a: Affine): Solid {
  let geo: Poly | Ball;
  if (s.geo.kind === 'ball') geo = { kind: 'ball', c: apply(a, s.geo.c), r: s.geo.r };
  else {
    const g = s.geo;
    geo = {
      kind: 'poly',
      verts: g.verts.map((p) => apply(a, p)),
      faces: g.faces.map((f) => ({ idx: f.idx, n: norm(applyDir(a, f.n)), name: f.name })),
      adj: g.adj,
    };
  }
  const frames: Partial<Record<FaceName, Frame>> = {};
  for (const [k, f] of Object.entries(s.frames) as [FaceName, Frame][]) {
    frames[k] = { o: apply(a, f.o), u: applyDir(a, f.u), v: applyDir(a, f.v), n: norm(applyDir(a, f.n)), w: f.w, h: f.h };
  }
  return { ...s, geo, frames };
}

export function solidBox(s: Solid): AABB {
  const b = emptyBox();
  if (s.geo.kind === 'ball') {
    const { c, r } = s.geo;
    growBox(b, [c[0] - r, c[1] - r, c[2] - r]);
    growBox(b, [c[0] + r, c[1] + r, c[2] + r]);
  } else for (const p of s.geo.verts) growBox(b, p);
  return b;
}

export function faceCentroid(g: Poly, f: PolyFace): Vec3 {
  let x = 0, y = 0, z = 0;
  for (const i of f.idx) { x += g.verts[i][0]; y += g.verts[i][1]; z += g.verts[i][2]; }
  const k = f.idx.length;
  return [x / k, y / k, z / k];
}

/** Angle in degrees between two unit normals. */
export const angleBetween = (a: Vec3, b: Vec3): number => (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI;

export { cross, sub };
