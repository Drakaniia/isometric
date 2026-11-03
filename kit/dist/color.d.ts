/**
 * color.ts: the tiny colour toolkit every style is built from.
 *
 * A style slot is written as a short expression so the same rules can be
 * evaluated here and embedded verbatim in exported components:
 *   'face'          the base token itself
 *   'face>0.13'     mixed 13% toward black
 *   'face<0.2'      mixed 20% toward white
 *   'accent~ink:.6' mixed 60% toward another base token
 */
export type RGB = [number, number, number];
export declare function hexToRgb(hex: string): RGB;
export declare function rgbToHex([r, g, b]: RGB): string;
export declare function mix(a: string, b: string, t: number): string;
export declare const darken: (c: string, k: number) => string;
export declare const lighten: (c: string, k: number) => string;
/** Relative luminance (0..1), used for contrast checks and theme decisions. */
export declare function luminance(hex: string): number;
export declare function contrast(a: string, b: string): number;
export declare const isHex: (s: unknown) => s is string;
export declare const normHex: (s: string) => string;
/** Evaluate a slot expression against base tokens (see the header comment). */
export declare function evalSlot(expr: string, base: Record<string, string>): string;
/** Source of evalSlot + mix as a dependency-free snippet for exported components. */
export declare const EVAL_SLOT_SOURCE = "function mix(a: string, b: string, t: number): string {\n  const p = (h: string) => { h = h.replace(\"#\", \"\"); if (h.length === 3) h = h.split(\"\").map((c) => c + c).join(\"\"); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };\n  const A = p(a), B = p(b);\n  return \"#\" + A.map((v, i) => Math.round(Math.min(255, Math.max(0, v + (B[i] - v) * t))).toString(16).padStart(2, \"0\")).join(\"\");\n}\nfunction slot(expr: string, base: Record<string, string>): string {\n  const m = /^([a-z]+)(?:([<>])([\\d.]+)|~([a-z]+):([\\d.]+))?$/.exec(expr)!;\n  const c = base[m[1]];\n  if (m[2] === \">\") return mix(c, \"#000000\", +m[3]);\n  if (m[2] === \"<\") return mix(c, \"#ffffff\", +m[3]);\n  if (m[4]) return mix(c, base[m[4]], +m[5]);\n  return mix(c, c, 0);\n}";
