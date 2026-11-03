# Projection and camera

## Fixed camera, movable scene
The kit's camera is fixed at the isometric direction. "Moving the camera" means one of:
1. **Rotate the model** about the vertical axis before projecting (meshes: `xform(mesh, [{ ry: angle }])`). This is what the robotic-arm example does for yaw.
2. **Pan / zoom** by changing the SVG `viewBox` (cheap, crisp, no re-render).
3. **Change scale** `S` and re-render.

Rotating an SVG group with CSS is wrong: it rotates in screen space and breaks the isometric angles.

## Quarter-turn views
Isometric has four orientations (0, 90, 180, 270 degrees about y). To offer a rotate button, rebuild the scene with coordinates rotated about the scene centre: `(x, z) -> (cx + (z - cz), cz - (x - cx))`, and re-sort. Do not animate between them with CSS.

## Framing
- The kit computes the `viewBox` from everything drawn (`ctx.p` grows bounds) and adds `pad`. Anything you draw in an overlay must call `ctx.grow(x, y)` for its extents, as the exploded-product labels do.
- Leave 5 to 8 percent padding so shadows and glows are not clipped.
- For hero use, crop tight and let the figure bleed off one side through the page layout, not through a clipped viewBox.

## Scale
Choose `scale` so the **smallest important detail is at least 3 px** at the largest display size. Typical: 28 to 36 for a scene 15 to 20 units wide.

## Picking
Hit-test with `unprojectToPlane` for floor interactions. For parts, use SVG pointer events on the `data-part` groups; the browser does the hit-testing for you.

## Orthographic only
There is no perspective foreshortening. If a design needs it, use a real 3D engine (see `webgl-and-3d-rendering.md`).
