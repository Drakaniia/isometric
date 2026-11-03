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
export declare const COS30: number;
export declare const SIN30 = 0.5;
export declare const VIEW: Vec3;
export declare const add: (a: Vec3, b: Vec3) => Vec3;
export declare const sub: (a: Vec3, b: Vec3) => Vec3;
export declare const scale: (a: Vec3, k: number) => Vec3;
export declare const dot: (a: Vec3, b: Vec3) => number;
export declare const cross: (a: Vec3, b: Vec3) => Vec3;
export declare const len: (a: Vec3) => number;
export declare const norm: (a: Vec3) => Vec3;
export declare const clamp: (v: number, lo?: number, hi?: number) => number;
export declare const lerp: (a: number, b: number, t: number) => number;
/** Project a world point to screen units (1 world unit = `s` screen units). */
export declare function project(p: Vec3, s?: number): Vec2;
/** Inverse of project() for a point known to lie on the horizontal plane y. */
export declare function unprojectToPlane(sx: number, sy: number, y?: number, s?: number): Vec3;
/** Depth along the view ray: larger is nearer the viewer. */
export declare const depthOf: (p: Vec3) => number;
/** Affine transform: p' = M p + t, with M a row-major 3x3 matrix. */
export interface Affine {
    m: number[];
    t: Vec3;
}
export declare const IDENTITY: Affine;
export declare function apply(a: Affine, p: Vec3): Vec3;
/** Apply only the linear part (for normals and directions; M is orthogonal here). */
export declare function applyDir(a: Affine, v: Vec3): Vec3;
/** Compose: result applies `first`, then `second`. */
export declare function compose(first: Affine, second: Affine): Affine;
export declare function det(a: Affine): number;
export declare function translation(t: Vec3): Affine;
/** Rotation by `deg` degrees about an axis-parallel line through `pivot` (right-handed). */
export declare function rotation(axis: Axis, deg: number, pivot?: Vec3): Affine;
/** Mirror across the vertical plane x = z through `pivot`: swaps x and z. */
export declare function mirrorXZ(pivot?: Vec3): Affine;
export interface AABB {
    min: Vec3;
    max: Vec3;
}
export declare function emptyBox(): AABB;
export declare function growBox(b: AABB, p: Vec3): void;
export declare function unionBox(a: AABB, b: AABB): AABB;
export declare const boxCentre: (b: AABB) => Vec3;
