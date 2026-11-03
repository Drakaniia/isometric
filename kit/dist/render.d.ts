/**
 * render.ts: drawing model -> SVG string, in any style, facing, pose, weight.
 *
 * Pipeline: build solids -> motion (phase) -> pose -> facing -> plinth ->
 * depth sort -> paint by role and orientation -> SVG. Pure and synchronous, so
 * it runs at build time in Node and per frame in the browser.
 */
import type { Vec3, Affine } from './math.js';
import { apply, applyDir } from './math.js';
import type { Drawing, Ease } from './model.js';
import type { Solid } from './geometry.js';
import type { StyleId, Theme, BaseTokens, Orient } from './styles.js';
export type Facing = 'right' | 'left';
export type Pose = 'as-drawn' | 'standing' | 'lying';
export interface RenderOptions {
    style?: StyleId;
    theme?: Theme;
    /** Overrides for the base tokens (the four swatches, or bg). */
    tokens?: Partial<BaseTokens>;
    facing?: Facing;
    pose?: Pose;
    /** Line weight in CSS px at the displayed size (0.5, 1, 1.5). */
    weight?: number;
    /** Width attribute in px. Omit for a fully responsive SVG. */
    size?: number;
    /** Motion phase 0..1. Undefined draws the rest pose. */
    phase?: number;
    /** 'baked' writes hex colours; 'vars' writes var(--iso-*) references. */
    colors?: 'baked' | 'vars';
    /** Force the plinth on or off (default: the style decides). */
    plinth?: boolean;
    /** Padding around the drawing in screen units. */
    pad?: number;
    /** Unique id for the root element; scopes the inline style rules. */
    id?: string;
    /** Override the accessible title. */
    title?: string;
    /** Mark decorative (aria-hidden). */
    decorative?: boolean;
}
export interface Chunk {
    key: string;
    group?: string;
    markup: string;
}
export interface RenderResult {
    svg: string;
    /** The inner markup without the root <svg> (for components). */
    body: string;
    chunks: Chunk[];
    viewBox: [number, number, number, number];
    width?: number;
    height?: number;
    /** CSS variable name (without --iso-) to hex, for every colour used. */
    vars: Record<string, string>;
    /** CSS variable name to slot expression. */
    exprs: Record<string, string>;
    audit: {
        solids: number;
        cycles: number;
        overlaps: number;
    };
    id: string;
    style: StyleId;
    plinth: boolean;
}
/** World unit to screen units. Strokes do not scale, so this only sets precision. */
export declare const UNIT = 24;
export declare function modelSolids(d: Drawing): Solid[];
export declare function ease(kind: Ease | undefined, k: number): number;
/** The affine that applies pose and facing, computed once from the rest pose. */
export declare function placement(d: Drawing, pose?: Pose, facing?: Facing): {
    mover: Affine;
    fixed: Affine;
};
/** Painter's order for solids: exact for non-intersecting boxes; cycles counted. */
export declare function depthSort(solids: Solid[]): {
    order: Solid[];
    cycles: number;
    overlaps: number;
};
export declare function orientOf(n: Vec3): Orient;
export interface Placed {
    solids: Solid[];
    plinth: boolean;
}
/** Solids in world space for one frame, after motion, pose, facing and plinth. */
export declare function placeSolids(d: Drawing, opts?: RenderOptions): Placed;
/** Screen bounds covering every motion frame, so the viewBox never jumps. */
export declare function stableBounds(d: Drawing, opts: RenderOptions): [number, number, number, number];
export declare function render(d: Drawing, opts?: RenderOptions): RenderResult;
export { apply, applyDir };
