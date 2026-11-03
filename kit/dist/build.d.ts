/**
 * build.ts: small helpers for authoring drawing models by hand.
 * Every helper returns plain data (a Part or Decal list).
 */
import type { Axis, Vec3 } from './math.js';
import type { Decal, Drawing, FaceName, Paint, Part, Role, Rot } from './model.js';
export interface PartOpts {
    id?: string;
    role?: Role;
    r?: number;
    axis?: Axis;
    seg?: number;
    n?: number;
    decals?: Partial<Record<FaceName, Decal[]>>;
    rot?: Rot[];
    group?: string;
    bias?: number;
    fixed?: boolean;
    only?: 'standing' | 'lying';
}
/** Box from its min corner. */
export declare const box: (at: Vec3, size: Vec3, o?: PartOpts) => Part;
/** Box from the centre of its base: (cx, y, cz), size [w, h, d]. */
export declare const cbox: (cx: number, y: number, cz: number, size: Vec3, o?: PartOpts) => Part;
/** Cylinder from the centre of its base. */
export declare const cyl: (at: Vec3, r: number, h: number, o?: PartOpts & {
    r2?: number;
}) => Part;
/** Cone from the centre of its base, pointing along +axis. */
export declare const cone: (at: Vec3, r: number, h: number, o?: PartOpts) => Part;
/** Extrude a 2D profile `len` along an axis. */
export declare const prism: (at: Vec3, profile: [number, number][], len: number, o?: PartOpts) => Part;
export declare const ball: (at: Vec3, r: number, o?: PartOpts) => Part;
/** Rows of bars, like lines of text. `widths` are fractions of `w`. */
export declare function textLines(x: number, y: number, w: number, widths: number[], gap?: number, h?: number, fill?: Paint): Decal[];
/** A grid of rounded keys or cells. */
export declare function grid(x: number, y: number, cols: number, rows: number, cw: number, ch: number, gap: number, o?: {
    fill?: Paint;
    stroke?: boolean | 'soft';
    r?: number;
    skip?: (c: number, r: number) => boolean;
}): Decal[];
/** Evenly spaced parallel slots (vents, grilles). */
export declare function slots(x: number, y: number, n: number, step: number, len: number, dir?: 'h' | 'v', stroke?: true | 'soft'): Decal;
/** Tick ring for dials, in a face frame. */
export declare function tickRing(cx: number, cy: number, r: number, count: number, long?: number, len?: number): Decal;
/** A gear outline in 2D: `teeth` teeth between radius `ri` (root) and `ro` (tip), centred on (cu, cv). */
export declare function gearProfile(teeth: number, ro: number, ri: number, cu?: number, cv?: number): [number, number][];
/** Identity with a light shape check, so library files read as declarations. */
export declare function defineDrawing(d: Drawing): Drawing;
