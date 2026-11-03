# Styles and tokens

The authoritative mappings live in `kit/src/styles.ts` and compiled `kit/dist/styles.js`. Never add colours to individual shapes: assign roles and let the style resolve them.

## Roles

Body is the main mass; face is a secondary panel; detail is keys, screws and knobs; ink is dark glass, tyres and cables; accent is the one focal assembly; plinth and ruler belong to the generated Anatomy base; glass is a translucent enclosure. Decals can use these roles plus bg and soft.

## Six mappings

- Stroke uses bg-filled solids and ink outlines. Accent parts are outlines, not tinted. Dark glass decals may remain ink.
- Two-tone uses face-based flat orientation shades and one accent. This is the default.
- Duotone mixes accent toward bg for secondary parts and toward ink for lines.
- Fill uses ink-family solids, face-coloured detail cutouts and the accent.
- Anatomy adds a horizontal rounded sage base, ruler ticks and label plate under every drawing.
- Yours uses the same shading rules as Two-tone, custom Ink/Faces/Plinth/Accent and a plinth beneath scenes only.

Top faces are lightest. Faces toward screen left receive light; screen-right faces are darker. Lighting is recomputed after facing and pose transforms. Do not use photographic material shading, gradients or emissive glows.

## Base colours

`tokens: { bg, ink, face, plinth, accent }` accepts hexadecimal colours. Default light values are white background, #1f1f22 ink, #fdfcf9 faces, #c7d7c3 plinth and #ef6c4d accent. Default dark values are #161616 background, #e8e6e0 ink, #2b2b2b faces, #3d4c3e plinth and the same accent. Duotone uses blue by default.

Find the project's existing colours first. Map its text to ink, surface to face, brand to accent, and a subdued related surface to plinth. Custom combinations are user-controlled; check contrast rather than silently replacing their palette.

## Export contract

`render` defaults to baked hex fills. `colors: 'vars'` emits derived `--iso-body-t`, `--iso-body-l`, `--iso-body-r`, `--iso-accent-t/l/r`, `--iso-plinth-t/l/r`, `--iso-line`, `--iso-soft` and other role slots. `t/l/r` means top/lit/shaded. The result includes `vars` (resolved colours) and `exprs` (derivation recipes).

`toTsx` exports a dependency-free React component for the selected rendering style and placement. Its `tokens` prop recomputes derived variables. To switch style/facing/pose, regenerate from the retained model. CSS `style` remains the normal React style prop, not a style-family selector. Weight is a component prop; outlines use non-scaling strokes.

PNG exports are transparent outside the object; Stroke faces use the selected bg colour so hidden edges remain occluded. SVG keeps title/description and a responsive viewBox.
