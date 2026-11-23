/**
 * people-kit.ts: a small figure builder shared by the People scenes.
 *
 * A person is a handful of boxes and rounded heads in roles (skin is the
 * `face` role, hair is `ink`), so every style, facing and pose still works.
 * Figures are built in a local frame (lateral, forward) and mapped to world
 * x/z from the direction they face, so a seated person always sits with
 * thighs under the desk and arms resting on it.
 */
import { box, cyl, ball } from '../build.js';
import type { Decal, Part, Role } from '../model.js';

/** Floor level: the top of the 0.3 thick floor slab every scene uses. */
export const FL = 0.3;
/** Desk and table top height above the floor, matched to a seated person. */
export const DESK = 1.6;

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

const T = { w: 0.84, d: 0.46, h: 1.15 };
const H = { w: 0.62, h: 0.62, d: 0.58 };

export function person(o: PersonOpts): Figure {
  const dir = o.dir ?? 'z+';
  const zAxis = dir[0] === 'z';
  const s = dir[1] === '+' ? 1 : -1;
  const y0 = o.y ?? FL;
  const shirt = o.shirt ?? 'body';
  const pants = o.pants ?? 'ink';
  const hairRole = o.hairRole ?? 'ink';
  const P = o.id;
  const sit = o.sit;

  const at = (lat: number, fwd: number, y: number): [number, number, number] =>
    zAxis ? [o.x + lat, y, o.z + s * fwd] : [o.x + s * fwd, y, o.z + lat];

  /** A box given by lateral/forward centre and local sizes. */
  const mk = (id: string, role: Role, lat: number, fwd: number, y: number, sl: number, h: number, sf: number, extra: { r?: number; decals?: Partial<Record<'front' | 'right' | 'top', Decal[]>>; g?: string } = {}): Part => {
    const [cx, , cz] = at(lat, fwd, y);
    const sx = zAxis ? sl : sf, sz = zAxis ? sf : sl;
    const group = extra.g ?? o.g;
    return box([cx - sx / 2, y, cz - sz / 2], [sx, h, sz], {
      id: `${P}-${id}`, role, r: extra.r, axis: extra.r ? 'y' : undefined, decals: extra.decals, group,
    });
  };

  const parts: Part[] = [];
  const torsoY = sit !== undefined ? y0 + sit + 0.32 : y0 + 1.15;
  const torsoTop = torsoY + T.h;
  const headY = torsoTop;
  const headTop = headY + H.h;

  // Legs.
  if (sit !== undefined) {
    for (const [k, lat] of [[0, -0.2], [1, 0.2]] as const) {
      parts.push(mk(`thigh${k}`, pants, lat, 0.27, y0 + sit, 0.34, 0.32, 1.0, { r: 0.06 }));
      parts.push(mk(`shin${k}`, pants, lat, 0.6, y0, 0.34, sit, 0.34, { r: 0.06 }));
    }
  } else {
    for (const [k, lat] of [[0, -0.2], [1, 0.2]] as const) parts.push(mk(`leg${k}`, pants, lat, 0, y0, 0.34, 1.15, 0.38, { r: 0.06 }));
  }

  // Torso.
  const chest: Decal[] = [...(o.chest ?? [])];
  if (o.tie) chest.push({ t: 'line', closed: true, fill: 'ink', pts: [[0.38, 0], [0.46, 0], [0.5, 0.18], [0.42, 0.6], [0.34, 0.18]] });
  const torsoDecals = chest.length ? (zAxis ? (s > 0 ? { front: chest } : undefined) : (s > 0 ? { right: chest } : undefined)) : undefined;
  parts.push(mk('torso', shirt, 0, 0, torsoY, T.w, T.h, T.d, { r: 0.12, decals: torsoDecals }));

  // Head, hair, face.
  const eyes: Decal[] = [
    { t: 'circle', cx: 0.21, cy: 0.27, r: 0.045, fill: 'ink' },
    { t: 'circle', cx: 0.41, cy: 0.27, r: 0.045, fill: 'ink' },
    { t: 'line', pts: [[0.24, 0.46], [0.31, 0.5], [0.38, 0.46]], stroke: 'soft' },
  ];
  const faceDecals = s > 0 ? (zAxis ? { front: eyes } : { right: eyes }) : undefined;
  parts.push(mk('head', 'face', 0, 0, headY, H.w, H.h, H.d, { r: 0.2, decals: faceDecals }));
  const hair = o.hair ?? 'short';
  if (hair !== 'bald') {
    parts.push(mk('hair-top', hairRole, 0, -0.01, headTop, 0.66, 0.16, 0.62, { r: 0.08 }));
    const back = hair === 'long' ? 0.88 : hair === 'curly' ? 0.46 : 0.4;
    parts.push(mk('hair-back', hairRole, 0, -(H.d / 2 + 0.06), headTop - back, 0.66, back, 0.12));
    if (hair === 'curly') {
      for (const k of [0, 1]) parts.push(mk(`hair-side${k}`, hairRole, k ? 0.36 : -0.36, 0, headTop - 0.34, 0.1, 0.34, 0.5));
    }
    if (hair === 'bun') {
      const [bx, , bz] = at(0, -0.12, 0);
      parts.push(ball([bx, headTop + 0.16 + 0.17, bz], 0.17, { id: `${P}-bun`, role: hairRole, group: o.g }));
    }
  }

  // Arms.
  const arm = (k: 0 | 1, mode: Arm, g?: string) => {
    if (mode === 'none') return;
    const lat = k ? 0.53 : -0.53;
    const grp = g ?? o.g;
    const L = (id: string, role: Role, f: number, y: number, sl: number, h: number, sf: number) =>
      parts.push(mk(`${id}${k}`, role, lat, f, y, sl, h, sf, { r: 0.05, g: grp }));
    if (mode === 'down') {
      L('sleeve', shirt, 0, torsoTop - 0.85, 0.22, 0.8, 0.22);
      L('hand', 'face', 0, torsoTop - 1.07, 0.22, 0.22, 0.22);
    } else if (mode === 'up') {
      L('sleeve', shirt, 0, torsoTop - 0.15, 0.22, 0.8, 0.22);
      L('hand', 'face', 0, torsoTop + 0.65, 0.22, 0.22, 0.22);
    } else {
      L('sleeve', shirt, 0, torsoTop - 0.65, 0.22, 0.6, 0.22);
      L('forearm', shirt, 0.37, torsoTop - 0.87, 0.22, 0.22, 0.85);
      L('hand', 'face', 0.9, torsoTop - 0.87, 0.22, 0.22, 0.2);
    }
  };
  arm(0, o.armA ?? 'down', o.gA);
  arm(1, o.armB ?? 'down', o.gB);

  return {
    parts,
    shoulderA: at(-0.53, 0, torsoTop - 0.15),
    shoulderB: at(0.53, 0, torsoTop - 0.15),
    headC: at(0, 0, headY + H.h / 2),
    headTop,
    at,
  };
}

/** An office chair for a seated figure: seat, back rest, column and base. */
export function chair(id: string, x: number, z: number, dir: Dir, sit = 1.0, role: Role = 'detail', y0 = FL): Part[] {
  const zAxis = dir[0] === 'z';
  const s = dir[1] === '+' ? 1 : -1;
  const c = (lat: number, fwd: number): [number, number] => (zAxis ? [x + lat, z + s * fwd] : [x + s * fwd, z + lat]);
  const bx = (idn: string, lat: number, fwd: number, y: number, sl: number, h: number, sf: number, r: Role, rr?: number): Part => {
    const [cx, cz] = c(lat, fwd);
    const sx = zAxis ? sl : sf, sz = zAxis ? sf : sl;
    return box([cx - sx / 2, y, cz - sz / 2], [sx, h, sz], { id: `${id}-${idn}`, role: r, r: rr, axis: rr ? 'y' : undefined });
  };
  const [px, pz] = c(0, 0.05);
  return [
    bx('seat', 0, 0.1, y0 + sit - 0.14, 0.9, 0.14, 0.9, role, 0.08),
    bx('back', 0, -0.42, y0 + sit, 0.8, 0.95, 0.14, role, 0.06),
    cyl([px, y0 + 0.1, pz], 0.09, sit - 0.24, { id: `${id}-col`, role: 'ink', n: 10 }),
    cyl([px, y0, pz], 0.38, 0.1, { id: `${id}-base`, role: 'ink', n: 16 }),
  ];
}
