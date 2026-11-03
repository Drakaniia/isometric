/**
 * geometry.ts: turn parts into solids (polyhedra or balls) with face frames.
 *
 * Every polyhedron is a loft between two planar rings, which covers boxes,
 * rounded boxes, cylinders, frustums, cones and extruded profiles (gears,
 * roofs, L-shapes). Normals are outward by construction and carried through
 * every transform, so visibility never depends on winding.
 */
import type { Vec3, Affine, AABB } from './math.js';
import { cross, sub } from './math.js';
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
/** Loft between two rings with the same vertex count, extruded along `dir`. */
export declare function loft(ring0: Vec3[], ring1: Vec3[], dir: Vec3): Poly;
/** Rounded rectangle ring in 2D, `seg` points per corner. */
export declare function roundRect(u0: number, v0: number, u1: number, v1: number, r?: number, seg?: number): [number, number][];
export declare function circle2(cu: number, cv: number, r: number, n?: number): [number, number][];
/** Build the model-space geometry of one part (static rotations applied). */
export declare function buildSolid(part: Part, key: string): Solid;
export declare function transformSolid(s: Solid, a: Affine): Solid;
export declare function solidBox(s: Solid): AABB;
export declare function faceCentroid(g: Poly, f: PolyFace): Vec3;
/** Angle in degrees between two unit normals. */
export declare const angleBetween: (a: Vec3, b: Vec3) => number;
export { cross, sub };
