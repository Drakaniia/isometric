/**
 * motion.ts: frame cache for hover and autoplay motion. Frames are rendered by
 * the same renderer (so moving parts stay depth-correct), once per drawing and
 * settings, then swapped in while the drawing plays.
 */
import type { Drawing, RenderOptions } from '@kit';
import { render } from '@kit';

const FPS = 24;
const cache = new Map<string, string[]>();

export function framesFor(d: Drawing, opts: RenderOptions, id: string): string[] {
  if (!d.motion) return [];
  const key = `${id}|${d.id}|${JSON.stringify(opts)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const n = Math.min(96, Math.max(16, Math.round(d.motion.duration * FPS)));
  const frames = Array.from({ length: n }, (_, i) => render(d, { ...opts, id, phase: i / n }).svg);
  if (cache.size > 400) cache.clear();
  cache.set(key, frames);
  return frames;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
