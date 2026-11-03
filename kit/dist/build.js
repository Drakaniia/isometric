const common = (o) => {
    const p = {};
    if (o.id)
        p.id = o.id;
    if (o.role)
        p.role = o.role;
    if (o.decals)
        p.decals = o.decals;
    if (o.rot)
        p.rot = o.rot;
    if (o.group)
        p.group = o.group;
    if (o.bias)
        p.bias = o.bias;
    if (o.fixed)
        p.fixed = o.fixed;
    if (o.only)
        p.only = o.only;
    return p;
};
/** Box from its min corner. */
export const box = (at, size, o = {}) => ({
    shape: { kind: 'box', at, size, r: o.r, axis: o.axis, seg: o.seg },
    ...common(o),
});
/** Box from the centre of its base: (cx, y, cz), size [w, h, d]. */
export const cbox = (cx, y, cz, size, o = {}) => box([cx - size[0] / 2, y, cz - size[2] / 2], size, o);
/** Cylinder from the centre of its base. */
export const cyl = (at, r, h, o = {}) => ({
    shape: { kind: 'cyl', at, r, h, r2: o.r2, axis: o.axis, n: o.n },
    ...common(o),
});
/** Cone from the centre of its base, pointing along +axis. */
export const cone = (at, r, h, o = {}) => cyl(at, r, h, { ...o, r2: 0 });
/** Extrude a 2D profile `len` along an axis. */
export const prism = (at, profile, len, o = {}) => ({
    shape: { kind: 'prism', at, profile, len, axis: o.axis },
    ...common(o),
});
export const ball = (at, r, o = {}) => ({ shape: { kind: 'sphere', at, r }, ...common(o) });
/* --------------------------------------------------------------- decals */
/** Rows of bars, like lines of text. `widths` are fractions of `w`. */
export function textLines(x, y, w, widths, gap = 0.22, h = 0.09, fill = 'soft') {
    return widths.map((k, i) => ({ t: 'bar', x, y: y + i * gap, w: w * k, h, fill }));
}
/** A grid of rounded keys or cells. */
export function grid(x, y, cols, rows, cw, ch, gap, o = {}) {
    const out = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            if (o.skip && o.skip(c, r))
                continue;
            out.push({ t: 'rect', x: x + c * (cw + gap), y: y + r * (ch + gap), w: cw, h: ch, r: o.r ?? 0.03, fill: o.fill ?? 'detail', stroke: o.stroke ?? 'soft' });
        }
    return out;
}
/** Evenly spaced parallel slots (vents, grilles). */
export function slots(x, y, n, step, len, dir = 'v', stroke = 'soft') {
    const segs = [];
    for (let i = 0; i < n; i++) {
        if (dir === 'v')
            segs.push([x + i * step, y, x + i * step, y + len]);
        else
            segs.push([x, y + i * step, x + len, y + i * step]);
    }
    return { t: 'segs', segs, stroke };
}
/** Tick ring for dials, in a face frame. */
export function tickRing(cx, cy, r, count, long = 4, len = 0.12) {
    const segs = [];
    for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const l = i % long === 0 ? len : len * 0.55;
        segs.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * (r - l), cy + Math.sin(a) * (r - l)]);
    }
    return { t: 'segs', segs, stroke: 'soft' };
}
/** A gear outline in 2D: `teeth` teeth between radius `ri` (root) and `ro` (tip), centred on (cu, cv). */
export function gearProfile(teeth, ro, ri, cu = 0, cv = 0) {
    const pts = [];
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
        const a = i * step;
        for (const [f, r] of [[0, ri], [0.18, ro], [0.5, ro], [0.68, ri]]) {
            pts.push([cu + Math.cos(a + f * step) * r, cv + Math.sin(a + f * step) * r]);
        }
    }
    return pts;
}
/** Identity with a light shape check, so library files read as declarations. */
export function defineDrawing(d) {
    if (!d.parts.length)
        throw new Error(`Drawing ${d.id} has no parts`);
    const accents = d.parts.filter((p) => p.role === 'accent' || Object.values(p.decals || {}).some((l) => l.some((x) => 'fill' in x && x.fill === 'accent'))).length;
    if (!accents)
        throw new Error(`Drawing ${d.id} has no accent: give one part (or one assembly) the accent role`);
    const ids = new Set();
    for (const p of d.parts) {
        if (!p.id)
            continue;
        if (ids.has(p.id))
            throw new Error(`Drawing ${d.id} repeats part id ${p.id}`);
        ids.add(p.id);
    }
    return d;
}
