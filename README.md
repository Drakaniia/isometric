# Isometric

A portable `/isometric` Agent Skill and a real Next.js showcase. Ask for an isometric for your login page, dashboard or website hero: the agent builds a recognisable part model and integrates a self-contained React component or SVG into your existing project.

## Six styles, one model

Stroke, Two-tone, Duotone, Fill, Anatomy and Yours. Every model can face left/right, stand/lie down, and use 0.5/1/1.5 px rounded ink lines. Two-tone is the default; the project's brand colour becomes the accent. Anatomy adds a sage plinth, ruler ticks and a label plate. Yours exposes Ink, Faces, Plinth and Accent.

The renderer is flat line art, not the old gradient-shaded material engine. Thirty drawings ship as editable models, including login, kanban, devices, settings, server rack, printer, map pin, rocket, house badges and six rebuilt worked examples.

## Install the skill

The repository is [Drakaniia/isometric](https://github.com/Drakaniia/isometric). The commands below require this implementation to be pushed there; adding the remote alone does not publish local files.

```sh
npx skills add Drakaniia/isometric
npx skills add Drakaniia/isometric -g
```

Or copy this repository into your agent's skills directory so `SKILL.md` sits at `isometric/SKILL.md`. For Claude Code, a project-local installation is `.claude/skills/isometric/`. Include `kit/dist/`, the guides, assets and examples. The installed skill runs on Node.js 20+ without compiling TypeScript or installing runtime dependencies.

```text
/isometric create an isometric for my login page
/isometric a kanban board for the dashboard hero, anatomy style
/isometric a database, shield and rocket for our three feature cards
/isometric our product on a laptop and phone, brand blue, facing left
```

## Develop

```sh
npm install
npm run build
node --test tests/validation/renderer.test.mjs
node scripts/check-tsx.mjs
npm run examples
npm --prefix site install
npm --prefix site run dev
npm --prefix site run build
```

The site is Next.js App Router + TypeScript, statically exported to `site/out/`. Its build flattens Next.js segment-payload filenames for ordinary static hosts. The gallery offers search, categories, sorting, pagination, style/theme/facing/pose/weight/size controls, custom colours, shareable URLs, remembered preferences, SVG/PNG downloads, copied TSX and prompts. Everything is free; there is no authentication or paywall.

## Repository

- `SKILL.md`: the agent workflow
- `kit/src/`: zero-dependency TypeScript renderer, geometry, model helpers, styles and library
- `kit/dist/`: compiled ESM plus declarations, shipped with the skill
- `site/`: Next.js gallery and editorial landing page
- `examples/`: six worked builds, each exporting all styles in light/dark, motion frames and TSX
- `references/`: focused authoring guides
- `assets/`: presets and model starter
- `scripts/`: SVG/project validation, screenshots, comparisons and export checks
- `tests/`: regression and renderer matrix tests

## Kit usage

```js
import { byId, render, toSvg, toTsx } from './kit/dist/index.js';
const model = byId('devices');
const options = { style: 'anatomy', theme: 'light', facing: 'left', weight: 1 };
const result = render(model, options);
console.log(result.audit); // cycles must be zero
const svg = toSvg(model, options);
const componentSource = toTsx(model, options);
```

Custom models are plain `Drawing` objects. Helpers include `box`, `cbox`, `cyl`, `cone`, `ball`, `prism`, `grid`, `textLines`, `slots`, `tickRing` and `gearProfile`. Each part has a role: body, face, detail, ink, accent, plinth, ruler or glass. The style maps roles and face orientations to colours. Read `references/styles.md` and the closest library source before authoring.

Copied React components depend only on React, use inline SVG, and accept tokens, size, weight, animate and title. The selected style/facing/pose is baked at export time; retain the model to regenerate other variants. Motion uses sampled complete depth-sorted frames. The future npm component library is not published or required.

## Verification and limitations

The new renderer has been exercised over 4,320 style/facing/pose/motion combinations, with valid SVG and zero depth cycles. All 30 copied TSX components compile against React types. These results do not imply the remaining browser acceptance checks are complete; the implementation goal remains active until those checks and publication finish.

The camera is orthographic only. Curved/organic geometry is approximated by solids. Models are illustrative, not physical simulations. A first generated drawing should be visually reviewed. PNG exports are transparent outside the drawing; Stroke faces retain the selected background colour to hide hidden edges. Complex animation exports can be large because complete frames preserve occlusion.

## Licence

MIT for the skill, renderer and original drawings. Third-party reference sites are inspiration, not bundled source or artwork.
