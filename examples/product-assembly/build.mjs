/**
 * Product assembly: an exploded smart speaker. The rest pose is exploded so the
 * still is complete; the motion brings the parts together and apart.
 * Model: kit/src/library/scenes-b.ts (speaker). Build: node examples/product-assembly/build.mjs
 */
import { main } from '../_emit.mjs';
await main(import.meta.url, 'speaker-assembly', { notes: 'Teaches: exploded views as a rest pose, per-part translation tracks with different distances.' });
