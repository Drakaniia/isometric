/**
 * styles.ts: the six appearance styles.
 *
 * A style maps (role, face orientation) to a colour expression over five base
 * tokens: bg, ink, face, plinth, accent. Orientation: t = top (lightest),
 * l = faces turned toward the viewer's left (lit), r = faces turned right
 * (shaded). The light never moves: it comes from the upper left.
 */
import type { Paint, Role } from './model.js';
export type StyleId = 'stroke' | 'two-tone' | 'duotone' | 'fill' | 'anatomy' | 'yours';
export type Theme = 'light' | 'dark';
export type Orient = 't' | 'l' | 'r';
export interface BaseTokens {
    bg: string;
    ink: string;
    face: string;
    plinth: string;
    accent: string;
}
/** The four swatches a user can edit (bg follows the theme). */
export declare const SWATCHES: readonly ["ink", "face", "plinth", "accent"];
export type SwatchKey = (typeof SWATCHES)[number];
type Tones = [string, string, string];
export interface StyleDef {
    id: StyleId;
    label: string;
    blurb: string;
    /** When the renderer draws the Anatomy plinth. */
    plinth: 'never' | 'always' | 'scene';
    presets: Record<Theme, BaseTokens>;
    solid: Record<Role, Tones>;
    /** Overrides for decal fills, by paint. */
    decal?: Partial<Record<Paint, Tones>>;
    line: string;
    soft: string;
    /** Colour of strokes drawn on decals (defaults to line / soft). */
    decalLine?: string;
    glassOpacity: number;
    /** Whether the outline is drawn at all on solid faces (Fill keeps it). */
    outline: boolean;
}
export declare const STYLES: Record<StyleId, StyleDef>;
export declare const STYLE_IDS: StyleId[];
/** A resolved colour: its CSS variable name, its expression and its hex value. */
export interface Slot {
    name: string;
    expr: string;
}
export declare function solidSlot(st: StyleDef, role: Role, o: Orient): Slot;
export declare function decalSlot(st: StyleDef, paint: Paint, o: Orient): Slot;
export declare const lineSlot: (st: StyleDef) => Slot;
export declare const softSlot: (st: StyleDef) => Slot;
export declare const decalLineSlot: (st: StyleDef, soft: boolean) => Slot;
/** Base tokens for a style, theme and user overrides. */
export declare function baseTokens(style: StyleId, theme?: Theme, over?: Partial<BaseTokens>): BaseTokens;
/** Every derived token of a style, as hex. Used by the token table and exports. */
export declare function deriveAll(style: StyleId, base: BaseTokens): Record<string, string>;
export {};
