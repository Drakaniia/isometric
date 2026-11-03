---
name: isometric
description: Create isometric illustrations for websites, login pages, dashboards, pricing, onboarding and feature cards. Generate recognisable objects as editable part models in Stroke, Two-tone, Duotone, Fill, Anatomy or custom colours, then integrate self-contained React components or SVG into the existing project. Use for /isometric, isometric icons, illustrated heroes, clean 3D-looking line art, or improving an existing isometric drawing.
license: MIT
compatibility: Node.js 20+. The compiled zero-dependency kit ships in kit/dist. React is required only for exported TSX. Optional browser checks use Playwright; do not install dependencies without permission.
---

# /isometric

Draw the page the user names, not abstract boxes and arrows. A login illustration is a recognisable browser, sign-in card and padlock. A dashboard is a kanban board or control console. Build a new editable model, export a component, and integrate it into the user's existing page.

Resolve all skill paths from the folder containing this file, never from the user's project. Use `kit/dist/index.js` at runtime; `kit/src/` is the typed source. Installed users do not need to compile the kit.

## Workflow

1. **Understand.** Identify the target page/section, subject, icon versus scene, requested style and motion. Infer sensible defaults. Ask only if a missing fact materially changes the build. Default to **Two-tone**, using the project's brand colour as accent. Do not default to the old dark, gradient-shaded look.
2. **Inspect.** Run `node <skill>/scripts/validate-project.mjs <project>`, then read the target component and token definitions. Preserve the framework, conventions and existing behaviour. Do not scaffold a new app for an illustration.
3. **Choose a reference model.** Open the closest source in `kit/src/library/`. Login, kanban, devices and settings are page examples; server rack shows repeated parts; `scenes-b.ts` contains engine, robotic arm, cutaway room and exploded speaker. `examples/README.md` explains the six worked builds. References set mood and finish, not permission to copy third-party artwork.
4. **Plan.** State one sentence of intent, a grouped parts list (base, body, detail, accent), style, palette, integration point and optional motion. Use recognisable objects and purposeful details, not decorative stacks. Icons are compact; scenes have enough parts to remain interesting at 4× zoom. Announce unusually complex scenes before spending substantial time.
5. **Model.** Write a new `Drawing` in the user's assets/components area. Use plain data or the helpers from `kit/dist/index.js`: `box`, `cbox`, `cyl`, `cone`, `ball`, `prism`, `textLines`, `grid`, `slots`, `tickRing`, `gearProfile`. Assign roles, never hard-coded fill colours, to parts. Shapes touch rather than intersect. Keep the model with the exported component so later prompts can edit it.
6. **Render.** Use `render(model, options)` or `toSvg(model, options)`. Options include `style`, `theme`, `tokens`, `facing`, `pose`, `weight`, `size`, and `phase`. Use `toTsx(model, options)` for a self-contained React component: no kit imports in the generated file. Style/facing/pose are chosen at generation; tokens, size, line weight and motion are component props. Re-export from the model to change geometry or rendering style.
7. **Motion.** Only add it when requested or useful. Author per-group `motion.tracks`: translation `t`, rotation `r`, or scale `s`, with timing windows and easing. The still must be complete. Respect reduced motion. Never promise a physical simulation when the model is illustrative.
8. **Integrate.** Place the exported TSX next to similar components, import it into the requested page and supply an accessible title. Plain SVG uses a responsive `viewBox`; its background-coloured faces hide back edges. Use project tokens for ink/face/plinth/accent. Preserve responsiveness and unrelated behaviour.
9. **Validate and look.** Run SVG validation, inspect `render(...).audit.cycles` (must be zero), run relevant project lint/typecheck/tests, then render and inspect a screenshot at intended size and 4×. Test both themes, facings and poses when offered. Test motion and reduced motion. Fix perspective, occlusion and recognisability before cosmetic detail.
10. **Report.** State what was built, integration, style/default choices and checks actually run. Never claim a browser inspection, install, publication or test you did not perform.

## Style system

- **Stroke:** Background-coloured solids with ink outlines; no accent tint. Marks may be ink.
- **Two-tone:** Warm white faces, consistent flat orientation shading, one accent assembly. Default.
- **Duotone:** Light and dark tints of the accent, with tinted outlines.
- **Fill:** Solid ink-family tones, details cut out in face colour; the accent remains visible.
- **Anatomy:** Two-tone on a sage plinth with ruler ticks and label plate. Automatic for every model in this style.
- **Yours:** Custom Ink, Faces, Plinth and Accent. Two-tone mapping, plinth under scenes.

Light comes from upper left. Face orientation decides flat shade; no gradients, glow or photographic materials. Lines use rounded joins/caps and weight 0.5/1/1.5 CSS px. UI text is represented by rounded bars, never random words inside the illustration. At most one tiny engraved label is acceptable. See `references/styles.md`.

## Minimal model and export

```js
import { defineDrawing, box, toSvg, toTsx, render } from '<skill>/kit/dist/index.js';
const model = defineDrawing({
  id: 'login-card', name: 'Login card', category: 'interface', kind: 'icon',
  tags: ['login'], createdAt: '2026-11-03',
  prompt: '/isometric a login card', description: 'A sign-in card with a highlighted button.',
  parts: [box([0, 0, 0], [2.4, 3, 0.15], {
    r: 0.12, axis: 'z', decals: { front: [
      { t: 'rect', x: 0.3, y: 0.8, w: 1.8, h: 0.4, r: 0.06, stroke: true },
      { t: 'rect', x: 0.3, y: 1.5, w: 1.8, h: 0.4, r: 0.06, stroke: true },
      { t: 'rect', x: 0.3, y: 2.2, w: 1.8, h: 0.4, r: 0.06, fill: 'accent' }
    ] }
  })]
});
const options = { style: 'two-tone', theme: 'light', tokens: { accent: '#ef6c4d' } };
const svg = toSvg(model, options);
const tsx = toTsx(model, options);
if (render(model, options).audit.cycles) throw new Error('Fix depth order before delivery');
```

## Coordinate and motion rules

World x projects lower right, z lower left, y up. `box(at, size)` uses a minimum corner; `cbox(cx,y,cz,size)` uses base centre. Cylinder `at` is base centre; `axis` defaults to y, and negative height grows backward. `prism` extrudes a 2D outline. Static `rot` entries apply in order. Facing swaps x/z geometry and recomputes lighting, rather than mirroring the final image. Pose rotates the object around its base; mark feet `only: 'standing'` if they should disappear lying down. Plinths remain horizontal.

Motion parts share a `group`; tracks name that group. Rotations use degrees plus an explicit world pivot. Default motion is out-and-back; `mode: 'loop'` wraps. Audit at rest and intermediate phases. Exported motion uses complete depth-sorted SVG frames, not arbitrary screen-space rotations.

## Checks and guides

- `node <skill>/scripts/validate-svg.mjs drawing.svg`
- `node <skill>/scripts/render-preview.mjs drawing.svg --engine playwright`
- `node <skill>/scripts/capture.mjs <integrated-page>`
- `references/styles.md`: exact role/style and token contract
- `references/geometry-construction.md`: authoring shapes and details
- `references/quality-assurance.md`: visual and accessibility gate
- `examples/README.md`: worked scenes and rebuild commands

Never install packages, replace a framework, delete unrelated files or modify project-wide configuration just to draw a scene. The npm drawing package is a future phase, not a dependency to suggest today.
