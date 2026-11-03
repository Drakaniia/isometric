/**
 * Robotic arm: chained joints. Each motion group lists its own joint first and
 * its parents after (elbow, then shoulder, then base yaw), so the forearm
 * follows the upper arm. Every frame is re-projected and re-sorted.
 * Model: kit/src/library/scenes-b.ts (roboticArm). Build: node examples/robotic-arm/build.mjs
 */
import { main } from '../_emit.mjs';
await main(import.meta.url, 'robotic-arm', { notes: 'Teaches: static rotations (rot) for the authored pose, chained rotation tracks for articulation.' });
