# Reference reconstruction

Goal: a clean, maintainable illustration that is visually close to a supplied image. Do not copy proprietary source code, do not claim pixel-perfect output, and say what you could not infer.

## Procedure
1. **Look first.** Open the image. Note canvas ratio, background, what is the focal object.
2. **Classify the projection.** Measure the angle of receding edges. About 30° from horizontal: isometric (this kit). About 26.57° (slope 1:2): dimetric, rebuild as a different projection or accept the 3.4° difference. 45° or perspective convergence: not isometric.
3. **Estimate scale.** Pick a unit (one floor tile or one box edge) and measure everything in it.
4. **Inventory** objects as primitives: box, cylinder, sphere, mesh, gear, panel. List them with positions `(x, y, z)` in units. Work from the floor up and from back to front.
5. **Light and shadow.** Which face is lightest and which side the shadows fall to? If it is the kit default (upper left, shadows right), keep it. If not, set `light` and `shadowK`/direction.
6. **Palette.** Sample 5 to 8 colours (base per material, shadow tint, accent). Put them in a palette JSON. Derive tones with the kit; do not copy every face colour.
7. **Materials.** For each object choose a kind (metal, plastic, glass...) from how highlights behave.
8. **Motion and interaction.** If the source is a recording, note what moves and how fast; use `iso-*` classes or live meshes.
9. **Build** the scene, floor first, detail last.
10. **Compare.** Render with `scripts/render-preview.mjs`, then `scripts/visual-compare.mjs reference.png preview.png`. Inspect side-by-side, overlay and diff; fix the biggest structural error first (proportions, then depth order, then colour, then detail). Repeat 2 to 4 times.

## Tips
- Resize the reference to the same width as your preview before comparing.
- Fix silhouette and proportion before shading.
- Ambiguous geometry (hidden sides) is yours to decide; keep it plausible and consistent.
- If the reference uses a gradient mesh or photographic texture, approximate it with 2 to 3 flat tones.

## Report honestly
State: projection match (exact/approximate), what was inferred, what was simplified, and the final comparison numbers with a note that they are only a guide.

## Licence caution
Recreating a layout and general style is fine. Do not reproduce logos, brand marks or distinctive artwork from a third party without permission.
