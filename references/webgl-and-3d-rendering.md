# WebGL and 3D rendering

## When SVG is not enough
Switch only when you need one of: smooth camera orbit or zoom, real lighting with many dynamic lights, hundreds to thousands of moving parts, particle systems or fluids, post-processing (bloom, depth of field), or procedural geometry on the GPU.

## Choosing
| Situation | Use |
|---|---|
| Project already uses three.js / react-three-fiber | reuse it |
| One-off effect in an SVG scene (fire, water, glow) | a small WebGL canvas layered with the SVG, sharing the same isometric transform |
| New standalone 3D scene | three.js (or the framework's wrapper); avoid adding it just for static art |
| Canvas 2D is enough (particles, noise) | Canvas, no WebGL |

## Isometric camera in three.js
```js
const aspect = w / h, d = 10;
const cam = new THREE.OrthographicCamera(-d*aspect, d*aspect, d, -d, 0.1, 100);
cam.position.set(10, 10, 10);           // direction (1,1,1), matching this kit
cam.lookAt(0, 0, 0);
```
`(1,1,1)` is the true isometric direction. Orbit controls should rotate in 90° steps or be locked for strict isometric.

## Matching the kit
- World axes: three.js is also y-up; its +x to the right, +z toward the viewer. Mapping is direct for positions, but the kit's +x appears lower right, so check handedness visually.
- Lighting: directional light from `(-0.45, 0.77, 0.45)` plus a hemisphere ambient of about 0.35.
- Shadows: one directional light with a soft shadow map, or a baked blob under objects.
- Materials: see `material-and-lighting.md` for the mapping.

## Layering WebGL with SVG
Put `<canvas>` between a back SVG and a front SVG; give all three the same `viewBox` ratio and position; keep the canvas transparent. Draw the shader in the same projection (build the quad in world space and use the same orthographic camera).

## Performance
Instance repeated geometry, merge static meshes, cap pixel ratio at 2, stop the render loop when off-screen or under reduced motion (render one frame), dispose geometry, materials and textures on unmount, and keep draw calls under a few hundred.

## Fallback
Provide the SVG still as the no-WebGL and reduced-motion fallback.
