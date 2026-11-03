# Responsive illustrations

## Defaults
- `viewBox` only, `width:100%; height:auto; display:block; max-width:100%`.
- Container uses `aspect-ratio` or natural SVG ratio, never a fixed pixel height.
- Test at 1440, 1024, 820, 390 px widths (`scripts/capture.mjs` does this and reports horizontal overflow).

## Composition per breakpoint
| Width | Strategy |
|---|---|
| ≥ 1024 | full scene |
| 600 to 1023 | full scene, labels move below the figure |
| < 600 | simplified scene: fewer secondary objects, bigger focal object, no tiny text |
For a mobile variant, build the scene twice with a `compact` option (`if (!compact) addTrees()`) and swap with `<picture>`-style CSS (`display:none` on one, or two `<svg>`s with media queries). Do not scale a complex scene down until it is unreadable: details under about 3 px disappear.

## Text and labels
Prefer HTML labels outside the SVG for anything that must stay readable. Text inside SVG scales with the picture.

## Overflow and clipping
- Compute `viewBox` from bounds (the kit does), add padding for shadows and glow.
- Put `overflow: visible` on the SVG only if you deliberately let glow bleed.
- Check that floating elements at the maximum `--amp` still fit.

## Touch and performance
- No hover-only information.
- Keep the animated element count low on mobile; pause off-screen animation with `IntersectionObserver` (toggle a class that sets `animation-play-state: paused`).
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.

## Safe areas
The page shell uses `env(safe-area-inset-*)` padding and `viewport-fit=cover`.
