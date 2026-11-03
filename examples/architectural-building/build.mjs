/**
 * Architectural building: a living-room cutaway. Two walls (the door opening
 * is three wall pieces), windows as face decals, furniture from touching
 * boxes, a door that swings on its hinge.
 * Model: kit/src/library/scenes-b.ts (building). Build: node examples/architectural-building/build.mjs
 */
import { main } from '../_emit.mjs';
await main(import.meta.url, 'house-cutaway', { notes: 'Teaches: many touching boxes with zero depth cycles, openings built from pieces, a hinge rotation.' });
