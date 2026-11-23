import type { Decal, Part, Track } from '../model.js';
type V3 = [number, number, number];
/** A clock dial in the face frame of a disc of radius r: rim and 60 minute ticks. */
export declare const dialDecals: (r: number) => Decal[];
/**
 * Hour and minute hands as real boxes lying on a dial, set to 10:10. `c` is the dial
 * centre, `plane` the coordinate of the dial's visible face (z for 'front', x for 'right').
 * Groups are `h-<tag>` and `m-<tag>` so a track can sweep them.
 */
export declare function clockHands(side: 'front' | 'right', c: V3, plane: number, tag: string, hl?: number, ml?: number): Part[];
export declare function clockTracks(side: 'front' | 'right', c: V3, plane: number, tag: string): Track[];
export declare const clockTower: import("../model.js").Drawing;
export declare const clockwork: import("../model.js").Drawing;
export declare const orrery: import("../model.js").Drawing;
export {};
