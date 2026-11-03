# Geometry construction

Import helpers from kit/dist/index.js. Drawing is plain data; kit/src/model.ts defines types and kit/src/library/ contains recipes.

- Box uses a minimum corner and size [w,h,d]; cbox uses base centre.
- Cyl uses base centre and an axis (default y); r2 makes a frustum. Negative height grows backward. Cone sets the far radius to zero.
- Ball is a sphere represented by a flat shaded projected disc.
- Prism extrudes a 2D outline: for y the profile axes are x/z, for x z/y, for z x/y.
- Box r rounds its profile around the selected axis. Rot entries are ordered static rotations in degrees about world pivots.
- Decals carry planar details. Their frame starts at face top-left, u right and v down; top-face v runs toward the front. Use grid, textLines, slots, tickRing and gearProfile.

Shapes touch rather than intersect. Open cabinets need separate sides, roof, back and shelves. Split walls around openings. Give every part a role, not a hard-coded colour.

Facing swaps x/z geometry before projection and shading. Pose turns the object around its base. Feet may use only: 'standing'. Plinths stay horizontal. Evaluate render(model, options).audit at rest and intermediate phases; cycles must be zero. Overlapping bounds still need visual inspection.
