# SVG rendering

The renderer returns svg, body, chunks, viewBox, vars, exprs and audit. Its pipeline is model solids → motion → pose → facing → generated plinth → depth sort → visible flat faces and decals. No gradients, lighting shaders or filters are required.

A static root has title/description and role=img; decorative:true hides it from assistive technology. Omit size for responsive viewBox output. Explicit size is useful for downloads. Inline geometry uses non-scaling strokes with rounded caps/joins; face-colour seam strokes prevent anti-alias cracks.

Baked output uses resolved hex colours. colors:'vars' uses derived --iso-* properties and emits scoped rules. Always give repeated instances unique ids. toTsx uses React.useId and complete depth-sorted animation frames; it depends only on React.

Depth sorting operates on solids with projected overlap checks. Intersections and enclosing shells can still be visually wrong even with zero cycles. Split wrapping geometry and inspect actual renders.

Browser PNG export rasterises the same SVG and scales line weight with 1x/2x/4x resolution. Transparent pixels outside the drawing remain transparent. Stroke faces retain their background colour to hide back edges. Validate SVG and inspect browser output rather than assuming a string is a finished drawing.
