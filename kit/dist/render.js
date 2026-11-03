import { VIEW, dot, project, compose, rotation, translation, mirrorXZ, IDENTITY, emptyBox, unionBox, boxCentre, clamp, apply, applyDir, add, scale as vscale, } from './math.js';
import { buildSolid, transformSolid, solidBox, faceCentroid, angleBetween, roundRect, circle2 } from './geometry.js';
import { STYLES, baseTokens, solidSlot, decalSlot, lineSlot, softSlot, decalLineSlot } from './styles.js';
import { evalSlot } from './color.js';
/** World unit to screen units. Strokes do not scale, so this only sets precision. */
export const UNIT = 24;
const EPS = 1e-6;
/* -------------------------------------------------------------- solids */
const cache = new WeakMap();
export function modelSolids(d) {
    let s = cache.get(d);
    if (!s) {
        s = d.parts.map((p, i) => buildSolid(p, p.id ? `${p.id}` : `p${i}`));
        cache.set(d, s);
    }
    return s;
}
/* -------------------------------------------------------------- motion */
export function ease(kind, k) {
    switch (kind) {
        case 'linear': return k;
        case 'in': return k * k * k;
        case 'out': return 1 - Math.pow(1 - k, 3);
        case 'back': {
            const c1 = 1.70158, c3 = c1 + 1;
            return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
        }
        default: return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    }
}
function trackAffine(tr, phase) {
    const mode = tr.mode || 'yoyo';
    const s = mode === 'loop' ? phase : phase < 0.5 ? phase * 2 : 2 - phase * 2;
    const from = tr.from ?? 0, to = tr.to ?? 1;
    const k = clamp((s - from) / Math.max(1e-6, to - from));
    const e = mode === 'loop' && !tr.ease ? k : ease(tr.ease, k);
    let a = IDENTITY;
    if (tr.s) {
        const k = tr.s.k.map((v) => 1 + (v - 1) * e);
        const p = tr.s.pivot;
        a = compose(a, { m: [k[0], 0, 0, 0, k[1], 0, 0, 0, k[2]], t: [p[0] * (1 - k[0]), p[1] * (1 - k[1]), p[2] * (1 - k[2])] });
    }
    if (tr.r)
        a = compose(a, rotation(tr.r.axis, tr.r.deg * e, tr.r.pivot));
    if (tr.t)
        a = compose(a, translation(vscale(tr.t, e)));
    return a;
}
function applyMotion(d, solids, phase) {
    if (!d.motion || phase === undefined)
        return solids;
    const groups = new Map();
    for (const tr of d.motion.tracks)
        groups.set(tr.group, compose(groups.get(tr.group) || IDENTITY, trackAffine(tr, phase)));
    return solids.map((s) => (s.group && groups.has(s.group) ? transformSolid(s, groups.get(s.group)) : s));
}
/* ---------------------------------------------------------- pose/facing */
function boxOf(solids, filter) {
    let b = emptyBox();
    for (const s of solids)
        if (!filter || filter(s))
            b = unionBox(b, solidBox(s));
    return b;
}
/** The affine that applies pose and facing, computed once from the rest pose. */
export function placement(d, pose = 'as-drawn', facing = 'right') {
    const authored = d.pose || 'standing';
    const effective = pose === 'as-drawn' ? authored : pose;
    const rest = modelSolids(d).filter((s) => !s.part.only || s.part.only === effective);
    let mover = IDENTITY;
    if (pose !== 'as-drawn' && pose !== authored) {
        const movable = boxOf(rest, (s) => !s.fixed);
        const c = boxCentre(movable);
        const pivot = [c[0], movable.min[1], c[2]];
        // standing -> lying: the front (+z) face turns up. lying -> standing: the top turns to the front.
        const rot = rotation('x', pose === 'lying' ? -90 : 90, pivot);
        const turned = boxOf(rest.filter((s) => !s.fixed).map((s) => transformSolid(s, rot)));
        const tc = boxCentre(turned);
        mover = compose(rot, translation([c[0] - tc[0], movable.min[1] - turned.min[1], c[2] - tc[2]]));
    }
    let fixed = IDENTITY;
    if (facing === 'left') {
        const all = boxOf(rest.map((s) => (s.fixed ? s : transformSolid(s, mover))));
        const c = boxCentre(all);
        const m = mirrorXZ([c[0], 0, c[2]]);
        mover = compose(mover, m);
        fixed = m;
    }
    return { mover, fixed };
}
/* -------------------------------------------------------------- plinth */
function plinthSolids(d, foot) {
    const scene = d.kind === 'scene';
    const m = d.plinth?.margin ?? (scene ? 1.1 : 0.5);
    const w = Math.max(d.plinth?.w ?? foot.max[0] - foot.min[0] + 2 * m, scene ? 4 : 2.4);
    const dd = Math.max(d.plinth?.d ?? foot.max[2] - foot.min[2] + 2 * m, scene ? 4 : 2.4);
    const cx = (foot.min[0] + foot.max[0]) / 2, cz = (foot.min[2] + foot.max[2]) / 2;
    const th = clamp(Math.max(w, dd) * 0.05, 0.26, 0.55);
    const r = clamp(Math.min(w, dd) * 0.06, 0.14, 0.5);
    const y0 = foot.min[1];
    const decals = {};
    const top = [];
    // Ruler along the front edge (top face: y runs toward the front).
    const inset = Math.max(r, 0.2);
    const unit = scene ? 0.25 : 0.2;
    const ticks = [];
    const along = (len, place) => {
        const n = Math.floor((len - 2 * inset) / unit);
        for (let i = 0; i <= n; i++)
            ticks.push(place(inset + i * unit, i % 4 === 0 ? 0.2 : 0.1));
    };
    along(w * (scene ? 0.62 : 0.7), (s, l) => [s, dd - 0.12, s, dd - 0.12 - l]);
    if (scene)
        along(dd * 0.55, (s, l) => [w - 0.12, dd - s, w - 0.12 - l, dd - s]);
    top.push({ t: 'segs', segs: ticks, stroke: 'ruler', width: 0.8 });
    // Label plate at the front right corner.
    const pw = scene ? 1.15 : 0.7, ph = scene ? 0.42 : 0.28;
    top.push({ t: 'rect', x: w - inset - pw, y: dd - 0.14 - ph, w: pw, h: ph, r: 0.05, fill: 'face', stroke: 'soft' });
    top.push({ t: 'bar', x: w - inset - pw + 0.1, y: dd - 0.14 - ph / 2 - 0.035, w: pw * 0.55, h: 0.07, fill: 'soft' });
    decals.top = top;
    decals.front = [{ t: 'segs', segs: [[r + 0.05, th * 0.52, w - r - 0.05, th * 0.52]], stroke: 'soft', width: 0.7 }];
    decals.right = [{ t: 'segs', segs: [[r + 0.05, th * 0.52, dd - r - 0.05, th * 0.52]], stroke: 'soft', width: 0.7 }];
    const s = buildSolid({ shape: { kind: 'box', at: [cx - w / 2, y0 - th, cz - dd / 2], size: [w, th, dd], r, seg: 4 }, role: 'plinth', decals }, 'plinth');
    s.generated = true;
    s.fixed = true;
    return [s];
}
function screenBox(s) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const pts = s.geo.kind === 'poly' ? s.geo.verts : null;
    if (pts)
        for (const p of pts) {
            const [x, y] = project(p, UNIT);
            if (x < x0)
                x0 = x;
            if (x > x1)
                x1 = x;
            if (y < y0)
                y0 = y;
            if (y > y1)
                y1 = y;
        }
    else if (s.geo.kind === 'ball') {
        const [x, y] = project(s.geo.c, UNIT), r = s.geo.r * UNIT * Math.sqrt(1.5);
        x0 = x - r;
        x1 = x + r;
        y0 = y - r;
        y1 = y + r;
    }
    return [x0, y0, x1, y1];
}
/** Painter's order for solids: exact for non-intersecting boxes; cycles counted. */
export function depthSort(solids) {
    const items = solids.map((s) => {
        const b = solidBox(s);
        return { s, b, sb: screenBox(s), c: b.min[0] + b.max[0] + b.min[1] + b.max[1] + b.min[2] + b.max[2] + s.bias };
    });
    const n = items.length;
    const out = Array.from({ length: n }, () => []);
    const indeg = new Array(n).fill(0);
    let overlaps = 0;
    const E = 1e-4;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const A = items[i], B = items[j];
            if (A.sb[2] <= B.sb[0] + 0.01 || B.sb[2] <= A.sb[0] + 0.01 || A.sb[3] <= B.sb[1] + 0.01 || B.sb[3] <= A.sb[1] + 0.01)
                continue;
            const a = A.b, b = B.b;
            let rel = 0;
            if (a.max[0] <= b.min[0] + E)
                rel = -1;
            else if (b.max[0] <= a.min[0] + E)
                rel = 1;
            else if (a.max[2] <= b.min[2] + E)
                rel = -1;
            else if (b.max[2] <= a.min[2] + E)
                rel = 1;
            else if (a.max[1] <= b.min[1] + E)
                rel = -1;
            else if (b.max[1] <= a.min[1] + E)
                rel = 1;
            else {
                overlaps++;
                rel = A.c <= B.c ? -1 : 1;
            }
            if (rel < 0) {
                out[i].push(j);
                indeg[j]++;
            }
            else {
                out[j].push(i);
                indeg[i]++;
            }
        }
    }
    const done = new Array(n).fill(false);
    const order = [];
    let cycles = 0;
    for (let k = 0; k < n; k++) {
        let pick = -1;
        for (let i = 0; i < n; i++)
            if (!done[i] && indeg[i] === 0 && (pick < 0 || items[i].c < items[pick].c))
                pick = i;
        if (pick < 0) {
            cycles++;
            for (let i = 0; i < n; i++)
                if (!done[i] && (pick < 0 || items[i].c < items[pick].c))
                    pick = i;
        }
        done[pick] = true;
        order.push(items[pick].s);
        for (const j of out[pick])
            indeg[j]--;
    }
    return { order, cycles, overlaps };
}
/* --------------------------------------------------------------- paint */
const f2 = (v) => {
    const r = Math.round(v * 100) / 100;
    return Object.is(r, -0) ? '0' : String(r);
};
export function orientOf(n) {
    if (n[1] > 0.55)
        return 't';
    return n[2] >= n[0] ? 'l' : 'r';
}
class Painter {
    constructor(st, base, mode) {
        this.st = st;
        this.base = base;
        this.mode = mode;
        this.vars = {};
        this.exprs = {};
    }
    use(slot) {
        if (!(slot.name in this.vars)) {
            this.vars[slot.name] = evalSlot(slot.expr, this.base);
            this.exprs[slot.name] = slot.expr;
        }
        return this.mode === 'vars' ? `var(--iso-${slot.name})` : this.vars[slot.name];
    }
    solid(role, o) { return this.use(solidSlot(this.st, role, o)); }
    decal(p, o) { return this.use(decalSlot(this.st, p, o)); }
    line() { return this.use(lineSlot(this.st)); }
    soft() { return this.use(softSlot(this.st)); }
    dline(soft) { return this.use(decalLineSlot(this.st, soft)); }
}
const ptsPath = (pts, close = true) => pts.map((p, i) => `${i ? 'L' : 'M'}${f2(p[0])} ${f2(p[1])}`).join('') + (close ? 'Z' : '');
function isConvex(g) {
    for (const f of g.faces) {
        const p0 = g.verts[f.idx[0]];
        for (const v of g.verts)
            if (dot(f.n, [v[0] - p0[0], v[1] - p0[1], v[2] - p0[2]]) > 1e-6)
                return false;
    }
    return true;
}
const convexCache = new WeakMap();
function decalMarkup(P, fr, list, o, wLine) {
    const lift = vscale(fr.n, 0.002);
    const map = (x, y) => project(add(add(add(fr.o, vscale(fr.u, x)), vscale(fr.v, y)), lift), UNIT);
    const poly = (pts) => pts.map(([x, y]) => map(x, y));
    const strokeOf = (s) => {
        if (!s)
            return null;
        if (s === true)
            return P.dline(false);
        if (s === 'soft')
            return P.dline(true);
        return P.decal(s, o);
    };
    let out = '';
    for (const d of list) {
        if (d.t === 'rect' || d.t === 'circle') {
            const pts = d.t === 'rect' ? roundRect(d.x, d.y, d.x + d.w, d.y + d.h, d.r || 0, 4) : circle2(d.cx, d.cy, d.r, 36);
            const fill = d.fill ? P.decal(d.fill, o) : 'none';
            const st = strokeOf(d.stroke);
            out += `<path d="${ptsPath(poly(pts))}" fill="${fill}"${d.opacity !== undefined ? ` fill-opacity="${d.opacity}"` : ''}${st ? ` stroke="${st}" class="d"` : ''}/>`;
        }
        else if (d.t === 'bar') {
            const h = d.h ?? 0.1;
            const pts = roundRect(d.x, d.y, d.x + d.w, d.y + h, h / 2, 3);
            out += `<path d="${ptsPath(poly(pts))}" fill="${P.decal(d.fill || 'soft', o)}"/>`;
        }
        else if (d.t === 'line') {
            const st = strokeOf(d.stroke ?? true) || P.dline(false);
            const fill = d.fill ? P.decal(d.fill, o) : 'none';
            out += `<path d="${ptsPath(poly(d.pts), !!d.closed)}" fill="${fill}" stroke="${st}" class="d"${d.width ? ` style="stroke-width:${f2(wLine * d.width)}px"` : ''}/>`;
        }
        else if (d.t === 'segs') {
            if (!d.segs.length)
                continue;
            const st = strokeOf(d.stroke ?? true) || P.dline(false);
            const dd = d.segs.map(([a, b, c, e]) => { const p = map(a, b), q = map(c, e); return `M${f2(p[0])} ${f2(p[1])}L${f2(q[0])} ${f2(q[1])}`; }).join('');
            out += `<path d="${dd}" fill="none" stroke="${st}" class="d"${d.width ? ` style="stroke-width:${f2(wLine * d.width)}px"` : ''}/>`;
        }
        else if (d.t === 'text') {
            const o0 = map(0, 0), ou = map(1, 0), ov = map(0, 1);
            let U = [ou[0] - o0[0], ou[1] - o0[1]];
            const V = [ov[0] - o0[0], ov[1] - o0[1]];
            let anchor = d.anchor || 'start';
            if (U[0] * V[1] - U[1] * V[0] < 0) {
                U = [-U[0], -U[1]];
                anchor = anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : 'middle';
            }
            const p = map(d.x, d.y);
            out += `<text transform="matrix(${f2(U[0])} ${f2(U[1])} ${f2(V[0])} ${f2(V[1])} ${f2(p[0])} ${f2(p[1])})" font-size="${d.size}" text-anchor="${anchor}" fill="${P.decal(d.fill || 'ink', o)}" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-weight="600" letter-spacing="${f2(d.size * 0.06)}">${esc(d.text)}</text>`;
        }
    }
    return out;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function solidMarkup(P, s, wLine) {
    const role = s.role;
    const glass = role === 'glass';
    const opacity = glass ? ` fill-opacity="${P.st.glassOpacity}"` : '';
    const decals = s.part.decals || {};
    const visibleFrames = Object.keys(decals).filter((k) => {
        const fr = s.frames[k];
        return fr && dot(fr.n, VIEW) > EPS && decals[k].length;
    });
    const decalOut = () => visibleFrames.map((k) => decalMarkup(P, s.frames[k], decals[k], orientOf(s.frames[k].n), wLine)).join('');
    if (s.geo.kind === 'ball') {
        const [x, y] = project(s.geo.c, UNIT);
        const r = s.geo.r * UNIT * Math.sqrt(1.5);
        const top = P.solid(role, 't'), side = P.solid(role, 'r');
        // A ball reads as a disc with its shaded lower-right crescent.
        const cr = `M${f2(x + r * 0.94)} ${f2(y - r * 0.34)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x - r * 0.34)} ${f2(y + r * 0.94)}A${f2(r * 1.08)} ${f2(r * 1.08)} 0 0 0 ${f2(x + r * 0.94)} ${f2(y - r * 0.34)}Z`;
        return `<g><circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${top}"${opacity}/>` +
            (top !== side ? `<path d="${cr}" fill="${side}"${opacity}/>` : '') +
            decalOut() + `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="none" stroke="${P.line()}" class="o"/></g>`;
    }
    const g = s.geo;
    let convex = convexCache.get(g.adj);
    if (convex === undefined) {
        convex = isConvex(g);
        convexCache.set(g.adj, convex);
    }
    const vis = g.faces.map((f) => dot(f.n, VIEW) > EPS);
    const order = g.faces
        .map((f, i) => ({ i, d: dot(faceCentroid(g, f), VIEW) }))
        .filter((x) => vis[x.i])
        .sort((a, b) => a.d - b.d)
        .map((x) => x.i);
    const rank = new Map();
    order.forEach((fi, k) => rank.set(fi, k));
    const P2 = g.verts.map((v) => project(v, UNIT));
    const line = P.line();
    let fills = '', edges = '', mixed = '';
    for (const fi of order) {
        const f = g.faces[fi];
        const c = P.solid(role, orientOf(f.n));
        const d = ptsPath(f.idx.map((k) => P2[k]));
        const fillEl = `<path d="${d}" fill="${c}"${opacity}${glass ? '' : ` stroke="${c}" class="s"`}/>`;
        let e = '';
        for (let k = 0; k < f.idx.length; k++) {
            const other = g.adj[fi][k];
            let draw = false;
            if (other < 0 || !vis[other])
                draw = true;
            else if (angleBetween(f.n, g.faces[other].n) > 24 && (rank.get(other) ?? -1) < (rank.get(fi) ?? 0))
                draw = true;
            if (!draw)
                continue;
            const a = P2[f.idx[k]], b = P2[f.idx[(k + 1) % f.idx.length]];
            e += `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`;
        }
        if (convex) {
            fills += fillEl;
            edges += e;
        }
        else
            mixed += fillEl + (e ? `<path d="${e}" fill="none" stroke="${line}" class="o"/>` : '');
    }
    const outline = P.st.outline;
    if (convex) {
        return `<g>${fills}${decalOut()}${edges && outline ? `<path d="${edges}" fill="none" stroke="${line}" class="o"/>` : ''}</g>`;
    }
    return `<g>${mixed}${decalOut()}</g>`;
}
/** Solids in world space for one frame, after motion, pose, facing and plinth. */
export function placeSolids(d, opts = {}) {
    const style = opts.style || 'two-tone';
    const st = STYLES[style];
    const { mover, fixed } = placement(d, opts.pose, opts.facing);
    const effective = !opts.pose || opts.pose === 'as-drawn' ? d.pose || 'standing' : opts.pose;
    const keep = (s) => !s.part.only || s.part.only === effective;
    const moved = applyMotion(d, modelSolids(d).filter(keep), opts.phase);
    const solids = moved.map((s) => transformSolid(s, s.fixed ? fixed : mover));
    const wantPlinth = opts.plinth ?? (st.plinth === 'always' || (st.plinth === 'scene' && d.kind === 'scene'));
    if (wantPlinth) {
        const rest = modelSolids(d).filter(keep).map((s) => transformSolid(s, s.fixed ? fixed : mover));
        const foot = boxOf(rest);
        // Keep the base below the whole motion envelope, not merely the rest pose.
        // A lid can swing downward after the object is turned onto its side.
        if (d.motion) {
            for (let i = 0; i < 16; i++) {
                const frame = applyMotion(d, modelSolids(d).filter(keep), i / 16)
                    .map((s) => transformSolid(s, s.fixed ? fixed : mover));
                foot.min[1] = Math.min(foot.min[1], boxOf(frame).min[1]);
            }
        }
        solids.push(...plinthSolids(d, foot));
    }
    return { solids, plinth: wantPlinth };
}
function boundsOf(solids) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of solids) {
        const b = screenBox(s);
        x0 = Math.min(x0, b[0]);
        y0 = Math.min(y0, b[1]);
        x1 = Math.max(x1, b[2]);
        y1 = Math.max(y1, b[3]);
    }
    if (![x0, y0, x1, y1].every(Number.isFinite))
        throw new Error('Drawing bounds are not finite');
    return [x0, y0, x1, y1];
}
const boundsCache = new WeakMap();
/** Screen bounds covering every motion frame, so the viewBox never jumps. */
export function stableBounds(d, opts) {
    const key = `${opts.style}|${opts.pose}|${opts.facing}|${opts.plinth}`;
    let m = boundsCache.get(d);
    if (!m) {
        m = new Map();
        boundsCache.set(d, m);
    }
    const hit = m.get(key);
    if (hit)
        return hit;
    const phases = d.motion ? [undefined, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875] : [undefined];
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    for (const ph of phases) {
        const q = boundsOf(placeSolids(d, { ...opts, phase: ph }).solids);
        b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])];
    }
    m.set(key, b);
    return b;
}
let autoId = 0;
export function render(d, opts = {}) {
    const style = opts.style || 'two-tone';
    const theme = opts.theme || 'light';
    const st = STYLES[style];
    const base = baseTokens(style, theme, opts.tokens);
    const mode = opts.colors || 'baked';
    const P = new Painter(st, base, mode);
    const weight = opts.weight ?? 1;
    const id = opts.id || `iso-${d.id}-${++autoId}`;
    const placed = placeSolids(d, opts);
    const { order, cycles, overlaps } = depthSort(placed.solids);
    const pad = opts.pad ?? 10;
    const [bx0, by0, bx1, by1] = stableBounds(d, opts);
    const vb = [bx0 - pad, by0 - pad, bx1 - bx0 + 2 * pad, by1 - by0 + 2 * pad];
    const chunks = order.map((s) => ({ key: s.key, group: s.group, markup: solidMarkup(P, s, weight) }));
    const body = chunks.map((c) => c.markup).join('');
    // Make sure the line colours exist even for drawings without decals.
    P.line();
    P.soft();
    if (style === 'stroke' || st.solid.body[0] === 'bg')
        P.use({ name: 'bg', expr: 'bg' });
    const title = opts.title ?? d.name;
    const styleRules = `#${id} path,#${id} circle{vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}` +
        `#${id} .s{stroke-width:0.9px}#${id} .o{stroke-width:${weight}px}#${id} .d{stroke-width:${f2(weight * 0.75)}px}` +
        (mode === 'vars' ? `#${id}{${Object.entries(P.vars).map(([k, v]) => `--iso-${k}:${v}`).join(';')}}` : '');
    const w = opts.size, h = opts.size ? Math.round((opts.size * vb[3]) / vb[2]) : undefined;
    const a11y = opts.decorative
        ? ' aria-hidden="true" focusable="false"'
        : ` role="img" aria-labelledby="${id}-t ${id}-d"`;
    const head = `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" class="iso" data-style="${style}" viewBox="${vb.map(f2).join(' ')}"` +
        (w ? ` width="${w}" height="${h}"` : '') + a11y + `>`;
    const meta = opts.decorative ? '' : `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(d.description)}</desc>`;
    const svg = `${head}${meta}<style>${styleRules}</style>${body}</svg>`;
    return {
        svg, body, chunks, viewBox: vb, width: w, height: h, vars: P.vars, exprs: P.exprs,
        audit: { solids: order.length, cycles, overlaps }, id, style, plinth: placed.plinth,
    };
}
export { apply, applyDir };
