# Isometric mathematics

## Contents
1. Coordinate system  2. The projection  3. Why these numbers  4. Inverse projection  5. Ellipses  6. Drawing a box  7. Alternatives  8. Mistakes

## 1. Coordinate system
The kit uses a right-handed world with **y up**. `x` runs to the lower right of the screen, `z` runs to the lower left. The camera sits at (+x, +y, +z) looking toward the origin, so the view ray is `(1, 1, 1)` and **a point with a larger x + y + z is nearer the viewer**.

## 2. The projection
```
screenX = (x - z) * cos(30°) * S
screenY = (x + z) * sin(30°) * S - y * S        (SVG: y grows downward, so height subtracts)
```
`S` is pixels per world unit. `cos 30° = 0.8660`, `sin 30° = 0.5`. `project([x, y, z], S)` from `kit/dist/index.js` implements this.

To flip a convention (for example x to the lower left), swap the roles of x and z. Do not change the 30° unless you are deliberately choosing a different projection (section 7).

## 3. Why these numbers
- Moving along x by 1 gives a screen vector (0.866, 0.5): a line at 30° below horizontal.
- Moving along z gives (-0.866, 0.5): 30° the other way.
- Moving along y gives (0, -1): straight up.
- A point and `P + t(1,1,1)` project to the same pixel (x-z unchanged; (x+z)/2 - y changes by t - t = 0). That is the view ray, and it is what makes depth sorting well defined.
- Edges have screen length 1 per unit on every axis. True isometric would shrink all three axes to 0.8165; this convention scales the whole picture by 1.2247 instead. Spheres therefore have screen radius `r * 1.2247 * S`.

## 4. Inverse projection
For a point known to lie on a horizontal plane at height `y`:
```
x - z = sx / (cos30 * S)
x + z = 2 * (sy + y * S) / S
x = ((x - z) + (x + z)) / 2     z = ((x + z) - (x - z)) / 2
```
`unprojectToPlane(sx, sy, y, S)` implements this. Use it for picking: pointer position to floor tile.

## 5. Circles become ellipses
- A circle of radius r in a **horizontal** plane projects to an axis-aligned ellipse with `rx = r * 1.2247 * S` and `ry = r * 0.7071 * S`. Cylinders and cones use this.
- A circle in a vertical plane (a gear) is a sheared ellipse. Model the outline with gearProfile and extrude it with prism along x or z; the renderer projects its geometry in the correct plane.
- Never draw gears with a plain rotated ellipse: the tooth spacing will not follow the plane.

## 6. Drawing a box
Visible faces are top (+y), left (+z) and right (+x). With corners `x0..x1`, `y0..y1`, `z0..z1`:
- top: (x0,y1,z0) (x1,y1,z0) (x1,y1,z1) (x0,y1,z1)
- left (+z): (x0,y1,z1) (x1,y1,z1) (x1,y0,z1) (x0,y0,z1)
- right (+x): (x1,y1,z1) (x1,y1,z0) (x1,y0,z0) (x1,y0,z1)

A general mesh face is visible when its outward normal `n` satisfies `dot(n, (1,1,1)) > 0` (back-face culling).

## 7. Alternatives
- **Dimetric / 2:1 "pixel" isometric**: x and z at ±26.565° (slope 1:2). Cleaner pixel edges. Use it for pixel art, not for this kit.
- **Oblique / cabinet**: front face undistorted. Not isometric.
- **True isometric scale**: multiply all screen lengths by 0.8165 if exact unit-length fidelity matters.
Pick one projection per illustration and never mix.

## 8. Mistakes
Mixed angles (some objects at 30°, others at 26.57°), un-skewed text on faces, circles drawn as circles, shadows cast in a direction that does not match the light, and unequal scale between objects.
