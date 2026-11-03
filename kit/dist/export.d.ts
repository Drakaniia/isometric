/**
 * export.ts: what a visitor (or the skill) takes away.
 *   toSvg  standalone SVG with the current style and colours baked in
 *   toTsx  a self-contained React component: inline SVG, CSS variables for
 *          colours, props for style tokens, size, weight and hover motion
 */
import type { Drawing } from './model.js';
import type { RenderOptions } from './render.js';
export declare function toSvg(d: Drawing, opts?: RenderOptions): string;
export declare const componentName: (id: string) => string;
/** SVG markup to JSX markup (the renderer only emits a small attribute set). */
export declare function svgToJsx(markup: string): string;
export interface TsxOptions extends RenderOptions {
    /** Frames sampled for the hover/loop motion (default 12). */
    frames?: number;
}
/** A self-contained TSX component. No package needed: paste and use. */
export declare function toTsx(d: Drawing, opts?: TsxOptions): string;
