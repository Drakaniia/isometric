# Examples

Six worked examples, each a model in the drawing library rendered by the style system. Open the closest one before writing a new drawing and copy its structure.

| Example | Drawing id | Model source | Teaches |
|---|---|---|---|
| `mechanical-engine` | `mechanical-engine` | `kit/src/library/scenes-b.ts` | gear profiles extruded in a face plane with a true tooth ratio, loop rotation, staggered piston tracks |
| `ai-workflow` | `ai-workflow` | `kit/src/library/scenes-b.ts` | an idea drawn as objects (documents, belt, chip, answers), loop translation, one accent |
| `server-infrastructure` | `server-rack` | `kit/src/library/server-rack.ts` | repeated parts from one function, an open cabinet from separate panels, a sliding drawer |
| `robotic-arm` | `robotic-arm` | `kit/src/library/scenes-b.ts` | authored pose with static `rot`, chained joint rotations |
| `architectural-building` | `house-cutaway` | `kit/src/library/scenes-b.ts` | many touching boxes with zero depth cycles, an opening built from wall pieces, a hinge |
| `product-assembly` | `speaker-assembly` | `kit/src/library/scenes-b.ts` | an exploded rest pose, per-part translations that bring it together |

Build one with `node examples/<name>/build.mjs`, or all with `npm run examples` (run `npm run build` first so `kit/dist` exists).

Each build writes to `examples/<name>/out/`:
- `<id>-<style>.svg` and `<id>-<style>-dark.svg` for all six styles in both themes
- `<id>-two-tone-<facing>-<pose>.svg` for the facing and pose variants
- `<id>-motion-<n>.svg`, eight frames of the hover motion
- `<Component>.tsx`, a self-contained React component (Two-tone)
- `index.html`, a contact page of all of the above

Every SVG is validated with `scripts/validate-svg.mjs`, and the depth audit must report zero cycles, or the build exits with an error.

The smaller library drawings (login page, kanban, devices, settings and the icons) live in `kit/src/library/` and are good starting points for page heroes and icons.
