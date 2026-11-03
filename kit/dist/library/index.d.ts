/**
 * The drawing library. Every drawing is a model; the gallery, the examples
 * and the tests all read this list.
 */
import type { Drawing } from '../model.js';
export declare const library: Drawing[];
export declare const byId: (id: string) => Drawing | undefined;
