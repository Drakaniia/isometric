# Colour and palette system

Presets live in kit/src/styles.ts and compiled kit/dist/styles.js. Use STYLES[id].presets[theme], baseTokens(style, theme, overrides) and deriveAll(style, base). See styles.md for exact roles.

Five base tokens: bg, ink, face, plinth, accent. Map project text to ink, surface to face, brand to accent and a subdued related surface to plinth. Default to Two-tone. Editing a gallery swatch enters Yours.

Derived shades are flat mixes, never gradients or photographic materials. Exported TSX accepts tokens={{ accent: '#ef6c4d' }}; it recomputes all shades. The normal React style prop overrides individual --iso-* variables.

Dark mode changes ink and surfaces, not geometry. Check contrast at intended size. Preserve custom colour choices but explain low contrast. Keep exactly one focal accent assembly.
