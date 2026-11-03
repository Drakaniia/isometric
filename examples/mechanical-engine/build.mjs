/**
 * Mechanical engine: gears in the plane of a face (true 18:11 ratio, spinning
 * in their own plane), pistons rising in firing order 1-3-2-4, intake runners.
 * Model: kit/src/library/scenes-b.ts (engine). Build: node examples/mechanical-engine/build.mjs
 */
import { main } from '../_emit.mjs';
await main(import.meta.url, 'mechanical-engine', { notes: 'Teaches: extruded gear profiles (prism + gearProfile), loop rotation tracks, staggered track windows.' });
