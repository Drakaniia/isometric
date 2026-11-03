# isometric: spec (v2, style-based skill + real website)

Status: draft from the interview on 2026-11-03. Nothing in this document is built yet.

## 1. Summary

Rebuild the `/isometric` skill and its website so it works like **Overflow Design's isometric library** (https://www.overflow.design/isometric/), shown the way **Anatomy** is shown (https://skills.wheresryan.sh/anatomy):

- **The skill.** Someone types `/isometric create an isometric for my login page` (or website hero, dashboard, pricing section…). The agent writes a new **drawing model** (3D parts) and a **self-contained React/SVG component** in the user's project, drawn in one of the **appearance styles** (Stroke, Two-tone, Duotone, Fill, Anatomy, Yours).
- **The renderer.** It replaces the current painterly, gradient-shaded renderer with a flat **ink line-art** renderer. One model renders live in any style, facing, pose, weight and size.
- **The website.** A real **Next.js (App Router) + TypeScript** app in `site/`. It has an Anatomy-style editorial landing page and an Overflow-style gallery with a category sidebar, an appearance panel and a mixed-size tile grid.
- **The samples.** About 24 polished drawings: Overflow-style icons, plus Anatomy-style scenes on plinths for things like login pages, dashboards and devices.

## 2. Why the current implementation is wrong (all of these, per the user)

1. **Wrong visual style.** The renders are dark, gradient-shaded and "painterly" (see `site/out/shots/routing.png`: graphite machines, lime glow, soft shadows). The target is clean ink outlines with flat fills, as in Overflow.
2. **No style switching.** Each scene is one fixed look. One drawing needs to render in Stroke, Two-tone, Duotone, Fill, Anatomy or Yours on demand.
3. **The scenes are too abstract.** A "routing manifold" and "provision" don't read as anything. Drawings should be recognisable objects: a laptop, a printer, a login card, a kanban board.
4. **It's static HTML.** `site/build.mjs` writes `site/out/index.html` plus per-figure pages. That's not a real app.
5. **The skill output doesn't fit real requests.** "Make one for my login page" doesn't produce a drop-in, themeable component in the user's style.

## 3. Goals and non-goals

**Goals**
- One part-model format that renders in 6 styles, 2 facings, 3 poses, 3 weights and any size, live in the browser.
- A skill workflow that produces a model plus a self-contained TSX component in the user's project. It infers colours from project tokens and defaults to the Two-tone style.
- A Next.js site with a landing page and a gallery. It's free and MIT-licensed, with no paywall.
- About 24 high-quality samples covering icons and scenes.
- The six existing examples rebuilt in the new style system.

**Non-goals (v1)**
- A Free/Pro split, auth or payments. Show no lock icons.
- Publishing the npm package. Spec it here (§12) but build it later.
- The old gradient/painterly look. It is **removed**, not kept as a style.
- Perspective 3D, WebGL shaders and photoreal rendering.

## 4. Appearance styles (all six, all switchable)

Every part in a model has a **role**. A style is a function from `(role, face orientation, tokens)` to `{fill, stroke, strokeWidth}`.

**Roles:** `body` (the main mass), `face` (detail panels and screens), `detail` (small parts: screws, keys, text lines), `accent` (the one lit part, like the "one accent" rule in Anatomy), `plinth` (the scene base), `ruler` (plinth tick marks and label plate), `glass`, `shadow`.

**Face orientations:** `top`, `left` (toward the viewer's left, lit), `right` (shaded). The light comes from the upper left and doesn't change in any style.

| Style | Look | Rules |
|---|---|---|
| **Stroke** | Ink outlines only (Overflow's line icons) | Faces are filled with the **background colour** so hidden lines are hidden. No tonal shading. The accent is outlined only, or gets a very light tint (decide in the build). |
| **Two-tone** | Ink outline, white/cream faces, one accent colour | Faces use `--iso-face`. Accent-role parts use `--iso-accent` (top lighter, right side darker). Body side faces get a 1-step tone. **This is the skill's default style.** |
| **Duotone** | Two fill tones, softer lines | Body uses a light tint, accent uses the full colour. Outlines are a darker tint of each fill rather than pure ink. |
| **Fill** | Solid shaded silhouettes, like the black house in the screenshot | Body is filled with ink-family tones (top, left and right differ in lightness). Details are cut out in the face colour. Thin or no outline. |
| **Anatomy** | Scenes on a sage plinth with ruler ticks, white faces, orange accent | Like Two-tone, plus the `plinth` role is drawn: a rounded slab in `--iso-plinth`, ruler ticks along the front edges and a small label plate. Icons get a small plinth too (Overflow's "Kanban, Anatomy" look). |
| **Yours** | The user's colours | Four swatches: **Ink, Faces, Plinth, Accent**, plus a reset button. Uses the Two-tone role mapping, plus the plinth when the drawing is a scene. |

**Swatch behaviour (assumption, confirm):** The swatch row is always visible. Each style shows its own preset colours. Editing a swatch switches the style to Yours. The reset button restores the preset for the active style.

**Default palette (Light theme, from the screenshot):** Ink `#1d1d1f`, Faces `#faf6ef`, Plinth `#c9d8c5`, Accent `#ee6a4c`. The dark theme inverts ink and background and keeps the accent.

**Line weight:** 0.5, 1 or 1.5 px (default 1), measured at the **displayed** size. Strokes scale with the Size control so a 96 px icon and a 400 px scene both read at the chosen weight. Joins and caps are round, and boxes have softly rounded corners where the model asks for them.

**Detail rule:** Text never appears inside the drawing. UI "text" is drawn as rounded bars, as Overflow does, except for one tiny engraved label on a plinth plate at most.

## 5. Renderer and model (the kit, rewritten)

**Language:** TypeScript source (`kit/src/*.ts`), compiled to plain ESM JS that ships with the skill (`kit/dist/*.js`), so skill users need no build step. The kit stays **zero-dependency**.

**Model format (sketch):**
```ts
type Drawing = {
  id: string; name: string; category: CategoryId; tags: string[];
  kind: 'icon' | 'scene';            // icon = 1x1 tile, scene = 2x2 tile + plinth in Anatomy
  prompt: string;                    // the /isometric prompt that "made" it (shown and copyable)
  createdAt: string;                 // for Newest sorting
  plinth?: { w: number; d: number }; // scenes
  parts: Part[];                     // primitives in world units
  motion?: Motion;                   // authored hover micro-motion (§7)
  pose?: 'standing' | 'lying';       // the authored ("As drawn") pose
};
type Part = { id: string; prim: 'box'|'roundBox'|'cylinder'|'cone'|'sphere'|'prism'|'panel'|'path3d';
              role: Role; dims: …; at: [x,y,z]; rot?: …; radius?: number; parent?: string };
```

**Pipeline:** model → pose transform → facing transform → project (one isometric camera, 30°) → depth sort (painter's order with audit, cycles = 0) → style mapping → SVG string. This must run on the server for build-time SVG and in the browser for the live gallery.

**Facing (Right/Left):** A real re-projection that swaps or negates the x/z axes. It is **not** a CSS mirror, so lighting stays consistent and any engraved label isn't mirrored.

**Pose (As drawn / Standing / Lying):** Rotates the model 90° about its base axis. Lying puts it flat on the ground and Standing stands it upright. "As drawn" uses the authored pose. Plinths aren't rotated; only the object on top is.

**Output requirements:** `viewBox` only (no fixed width or height). `role="img"` plus `<title>` and `<desc>` for static drawings. Colours are emitted as CSS variables (`var(--iso-ink)` and so on) so a copied component can be re-themed. The SVG must pass `scripts/validate-svg.mjs`.

**Carry over** from the current kit: projection and inverse maths, depth sort plus `audit()`, mesh helpers (`boxMesh`, `cylMesh`, `xform`…), gear paths, and the validation scripts. **Drop:** material kinds (`plastic`, `metal`, `glass`… lighting), gradient defs, soft drop shadows and the emissive glow.

## 6. Website (Next.js App Router + TS, in `site/`)

The skill stays at the repo root (`SKILL.md`, `kit/`, `references/`, `scripts/`, `assets/`, `examples/`). `site/` becomes the Next.js app and imports the kit from `../kit/src`. The old `site/build.mjs`, `site/ui.mjs`, `site/theme.mjs` and `site/scenes/*` are removed or migrated (their scenes become rebuilt samples where they're worth keeping).

**Deployment:** Remy published site. Use Next **static export** (`output: 'export'`) so the build output directory holds `index.html`. No server is needed: settings live in URL params and localStorage. Because of the static export, gallery detail routes are generated at build time (`generateStaticParams`).

**Look:** Light theme like Overflow (white, thin grey borders, Inter, small grey labels) with a **dark mode toggle**. Drawings re-render with the dark theme's tokens.

### 6.1 Routes
- `/`: editorial landing page (§6.2).
- `/gallery`: the gallery (§6.3).
- `/gallery/[id]`: the same gallery with that drawing open in the panel. The URL is shareable.
- Optional: `/styles`, `/docs/install`. These can be anchors on the landing page instead.

### 6.2 Landing page (Anatomy-style editorial)
Sections, in order:
1. **Hero:** a live interactive drawing (e.g. the login scene) with an inline style switcher (the 6 styles), plus the headline "Name a page in one line, and Claude draws it in isometric", `/isometric`, and an Install button.
2. **Styles explained:** the same drawing shown in all 6 styles side by side, each with a one-line description.
3. **Writing a prompt:** prompt → result pairs, e.g. `/isometric create an isometric for my login page`, `… for my pricing section, Anatomy style`, `… a dashboard hero using our brand colour`. It also explains which words change the output (the style name, "icon" vs "scene", colours, "animated on hover").
4. **What Claude does:** the numbered workflow steps (§8).
5. **In your code:** a TSX snippet, an SVG snippet and the **token table** (`--iso-ink`, `--iso-face`, `--iso-face-shade-1/2`, `--iso-plinth`, `--iso-plinth-shade`, `--iso-ruler`, `--iso-accent`, `--iso-accent-top`, `--iso-accent-shade`, `--iso-bg`, `--iso-weight`), each with its light and dark value, like Anatomy's token table.
6. **Install:** `npx skills add <user>/isometric`, the git-clone alternative, and how to verify the install.
7. **Limits:** honest limits, e.g. it's orthographic only, the first output is a draft, and complex scenes take longer.
8. **FAQ.**

### 6.3 Gallery (Overflow layout)
**Header:** logo, a top tab "Isometric" (other tabs aren't needed), a search box and a theme toggle.

**Left sidebar: Categories.** Each category shows a count, and the sidebar can be collapsed. Only categories that have drawings appear. The full taxonomy is ready for later: Shapes, Data & infrastructure, Code & web, AI, Files, Interface, Charts, Commerce, Logistics, Industry, Communication, Media, Time, Status & security, Arrows, People, Health.

**Middle panel: the open drawing and its appearance settings.**
- **Preview:** an empty state ("No drawing open. Click one in the grid…") on a dotted background, or the open drawing shown large.
- **Actions:** Copy SVG, Download SVG, Download PNG (1x/2x/4x), Copy React (TSX), and Copy prompt.
- **Appearance:** the 6 style buttons (each with a mini preview icon), the 4 swatches plus reset, Theme (Light/Dark), Size (a slider with ticks, default 96 px), Weight (0.5/1/1.5), Facing (Right/Left), Pose (As drawn/Standing/Lying) and a reset button for the whole section.
- **Grid:** Columns (a slider, default 6), Names (on/off) and Autoplay (on/off, plays every drawing's motion in a loop).

**Right: the grid.** Icons take 1x1 tiles and scenes take 2x2 tiles in a dense grid. Each tile shows the name (when Names is on). A scene's name reads like "Kanban, Anatomy". Hovering plays the drawing's micro-motion, and clicking opens the drawing in the panel and updates the URL.

**Toolbar:** a result count, an All/Icons/Scenes filter, sort by Newest or Name, and **pagination**.

**Search:** matches names and tags, and filters within the active category.

**State:** All panel settings go in the URL query, e.g. `/gallery/printer?style=two-tone&accent=ee6a4c&facing=left&pose=lying&weight=1&size=96&theme=dark`, so links are shareable. They're also saved to localStorage (custom "Yours" colours persist). When both exist, the URL wins over localStorage.

**Accessibility:** Tiles are buttons with accessible names. The whole panel works by keyboard. Motion respects `prefers-reduced-motion`: there's no hover motion and Autoplay is disabled. Contrast is checked for both themes.

## 7. Motion ("point at one to move it")

Each drawing **authors its own micro-motion** in the model: a printer feeds paper, a trash lid lifts, a laptop screen changes, a kanban card slides to the next column, a login button presses, a rocket lifts off its pad, a map pin bounces.
- Motion is expressed as part transforms over time (`{part, from, to, ease, duration}` keyframes), re-rendered by the same renderer, or as CSS transforms on part groups where that's equivalent. Moving parts must stay depth-correct.
- It triggers on hover or focus in the gallery and on the landing hero, and loops when Autoplay is on.
- It stops under reduced motion, and the still image must be a complete picture.
- An exported TSX component accepts `animate?: 'hover' | 'loop' | false`.

## 8. Skill behaviour (`SKILL.md` rewrite)

**Trigger:** `/isometric` plus a request, or any request for an isometric or 3D-style illustration for a page or section ("create an isometric for my website / login page / dashboard / pricing / 404").

**Workflow:**
1. **Understand:** work out the target (which page or section), the subject, icon vs scene, and the style. If no style is named, infer colours from the project's tokens, map the brand colour to the accent, and **default to Two-tone**. Don't ask unless a missing fact would change the build.
2. **Inspect the project:** `scripts/validate-project.mjs`, the framework, the tokens and where assets live.
3. **Pick the closest sample** in `examples/` or the gallery library as a structural reference.
4. **Write a new drawing model.** The object must be recognisable: a login card with fields, a button and an avatar on a plinth, rather than abstract slabs. Give it a parts list grouped as base, body, details and accent, with exactly one accent.
5. **Render** in the chosen style. Write a **self-contained TSX component** (inline SVG, CSS variables for colours, props: `style?`, `tokens?`, `size?`, `animate?`, `title?`) or plain SVG for non-React projects. Place it where the project keeps similar components.
6. **Author the hover micro-motion**, but only if it was asked for or it clearly helps. Respect reduced motion.
7. **Integrate** into the requested page. Keep it responsive and preserve existing behaviour.
8. **Validate:** `validate-svg`, `audit()` with cycles = 0, the project's lint and typecheck, and a preview render that's actually looked at.
9. **Report:** what was made, the files, the style and why, and the checks that were run.

**References to update:** `visual-design-system.md` and `color-and-palette-system.md` need rewriting for the role-and-style system. `material-and-lighting.md` and `shadows-and-depth.md` are cut down or removed because the painterly material model is gone. A new `references/styles.md` defines each style's mapping. The palettes in `assets/palettes/*.json` become style presets.

## 9. Samples

**Milestone 1 (8 drawings):**
- Scenes (2x2, in Anatomy by default): **Login page** (card, email and password bars, button as the accent, avatar), **Kanban/Dashboard** (board with columns and one accent card), **Devices** (laptop plus phone with UI bars, the screen as the accent), **Settings / control panel** (slab with toggles, knob and slider), **Server rack** (rebuilt from `examples/server-infrastructure`).
- Icons (1x1): **Printer**, **Map pin**, **Rocket** (assumption: the 3 icons picked from the user's list; the rest follow in v1).

**v1 (about 24 total):** add Mug, Trash, Home plus status badges (+, −, ✓, ×, !), Trophy, Target, plus the rebuilt existing examples: mechanical engine, AI workflow, robotic arm, architectural building, product assembly. Also rebuild the site scenes only if they become recognisable objects. Fill out further categories (Files, Communication, Commerce, Charts…) with one or two drawings each as time allows. A category appears in the sidebar only once it has a drawing.

**Quality bar for every sample:** recognisable at 48 px, detailed at 400 px, correct in all 6 styles, both facings and all 3 poses (or a documented reason a pose is disabled), zero depth cycles, a valid SVG and an authored motion.

## 10. Existing repo changes (planned, not done)

- `kit/iso.mjs`, `kit/runtime.mjs` and `kit/page.mjs` → `kit/src/*.ts` (new renderer) plus `kit/dist/`. `page.mjs` (the static HTML shell) is retired.
- `examples/*`: each one is rebuilt as a model in the new system, and `build.mjs` outputs SVG in each style.
- `site/*`: replaced by the Next.js app. `site/out/` is regenerated by `next build`.
- `tests/`: keep the validator tests, and add renderer tests (style mapping, facing and pose transforms, deterministic SVG snapshots, cycles = 0 for every sample).
- `README.md` and `SKILL.md` are rewritten.

## 11. Milestones

1. **M1:** new TS renderer with all 6 styles, facing, pose, weight and size, the 8 samples above, and the gallery (sidebar, panel, grid, copy/download, URL and localStorage state, search, sort, filter, pagination, dark mode). Published as a Remy site.
2. **M2:** the editorial landing page (§6.2), the rest of the ~24 samples, the 6 rebuilt examples, and the rewritten `SKILL.md` and references.
3. **M3 (later):** the npm package (§12).

## 12. Later: npm package (spec only)

`isometric-drawings` (name to be decided): one entry per drawing (`isometric-drawings/printer`), a `<Drawing style facing pose size weight tokens animate />` React API, an `IsometricTheme` provider, custom elements (`<iso-printer style="two-tone">`), and the same `--iso-*` tokens. MIT.

## 13. Acceptance criteria (M1)

- Switching the style, theme, facing, pose, weight or size re-renders the open drawing and every grid tile within about 100 ms, with no page reload.
- Every M1 sample passes `validate-svg` with 0 errors and has `audit().cycles === 0` in every style, facing and pose combination.
- Copy SVG gives standalone SVG that renders correctly when pasted into a blank HTML file.
- Copy TSX gives a component that compiles in a fresh Next.js app with no extra dependencies.
- PNG downloads at 1x, 2x and 4x match the on-screen render.
- A shared URL reproduces the open drawing and all its settings.
- Reduced motion disables hover and autoplay motion.
- The panel and grid work by keyboard alone.
- The `next build` static export succeeds and is published with the Remy publish tool.

## 14. Open questions

- Is the swatch behaviour right (editing any swatch switches to Yours)? Or should Yours be its own independent preset?
- Should Stroke show the accent as a tint, or outline only?
- Should Fill use ink-family tones only, or let the accent show through?
- Should exported PNGs have a transparent or theme-coloured background?
- Should a 3rd Anatomy-style figure size (larger "Hero" scenes, like Anatomy's Figure/Hero/Epic) come later?
- What is the GitHub owner name for the install command?
- Fonts: Inter only, or Inter plus a serif for the editorial landing headings?
