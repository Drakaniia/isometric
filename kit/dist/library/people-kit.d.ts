import type { Decal, Part, Role } from '../model.js';
/** Floor level: the top of the 0.3 thick floor slab every scene uses. */
export declare const FL = 0.3;
/** Desk and table top height above the floor, matched to a seated person. */
export declare const DESK = 1.6;
export type Dir = 'z+' | 'z-' | 'x+' | 'x-';
export type Arm = 'down' | 'forward' | 'up' | 'none';
export type Hair = 'short' | 'long' | 'bun' | 'bald' | 'curly';
export interface PersonOpts {
    id: string;
    /** Centre of the figure on the floor. */
    x: number;
    z: number;
    /** Floor height under the feet. */
    y?: number;
    /** Direction faced. 'z+' looks at the viewer, 'z-' away from them. */
    dir?: Dir;
    /** Seat height; when set the person sits (thighs flat, shins down). */
    sit?: number;
    shirt?: Role;
    pants?: Role;
    hair?: Hair;
    hairRole?: Role;
    armA?: Arm;
    armB?: Arm;
    /** Motion groups: each arm separately, and everything else. */
    gA?: string;
    gB?: string;
    g?: string;
    /** A necktie on the chest. */
    tie?: boolean;
    /** Extra decals on the chest (badge, lanyard...). */
    chest?: Decal[];
}
export interface Figure {
    parts: Part[];
    /** World point at the shoulder of each arm, for motion pivots. */
    shoulderA: [number, number, number];
    shoulderB: [number, number, number];
    /** Head centre and top, for hats and headsets. */
    headC: [number, number, number];
    headTop: number;
    /** Maps local (lateral, forward) at a height to world [x, y, z]. */
    at: (lat: number, fwd: number, y: number) => [number, number, number];
}
export declare function person(o: PersonOpts): Figure;
/** An office chair for a seated figure: seat, back rest, column and base. */
export declare function chair(id: string, x: number, z: number, dir: Dir, sit?: number, role?: Role, y0?: number): Part[];
