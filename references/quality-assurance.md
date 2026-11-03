# Quality assurance

Never report a check not performed.

1. Validate SVG: node scripts/validate-svg.mjs drawing.svg. Zero errors; warnings understood.
2. Require render(model, options).audit.cycles === 0 across offered styles/facings/poses and intermediate motion phases. Then inspect visual occlusion; zero cycles alone is not proof.
3. Compile exported TSX in the host framework. It depends only on React and is a client component in Next.js.
4. Run relevant host lint, typecheck and tests. Preserve unrelated behaviour.
5. Inspect screenshots at intended size and 4×: silhouette, contact points, hidden edges, rounded objects, UI cards and line weight. No gradients/glow.
6. Check light/dark, custom colours, left/right, standing/lying. Objects must not intersect the plinth during motion.
7. Verify responsive viewBox, title/description, keyboard controls and reduced-motion stillness. The still must be complete.
8. Test copy SVG, PNG dimensions at 1x/2x/4x and copied TSX in a page. Shared URL settings override storage.

Repository commands: npm run build; node --test tests/validation/renderer.test.mjs; node scripts/check-tsx.mjs; npm run examples; npm --prefix site run build; node scripts/browser-check.mjs.
