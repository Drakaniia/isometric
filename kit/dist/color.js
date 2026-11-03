export function hexToRgb(hex) {
    let h = hex.trim().replace('#', '');
    if (h.length === 3)
        h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h))
        throw new Error(`Not a hex colour: ${hex}`);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgbToHex([r, g, b]) {
    const c = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
}
export function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}
export const darken = (c, k) => mix(c, '#000000', k);
export const lighten = (c, k) => mix(c, '#ffffff', k);
/** Relative luminance (0..1), used for contrast checks and theme decisions. */
export function luminance(hex) {
    const ch = hexToRgb(hex).map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
export const isHex = (s) => typeof s === 'string' && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim());
export const normHex = (s) => rgbToHex(hexToRgb(s));
/** Evaluate a slot expression against base tokens (see the header comment). */
export function evalSlot(expr, base) {
    const m = /^([a-z]+)(?:([<>])([\d.]+)|~([a-z]+):([\d.]+))?$/.exec(expr);
    if (!m)
        throw new Error(`Bad slot expression: ${expr}`);
    const c = base[m[1]];
    if (!c)
        throw new Error(`Unknown token in slot: ${m[1]}`);
    if (m[2] === '>')
        return darken(c, +m[3]);
    if (m[2] === '<')
        return lighten(c, +m[3]);
    if (m[4])
        return mix(c, base[m[4]], +m[5]);
    return normHex(c);
}
/** Source of evalSlot + mix as a dependency-free snippet for exported components. */
export const EVAL_SLOT_SOURCE = `function mix(a: string, b: string, t: number): string {
  const p = (h: string) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(Math.min(255, Math.max(0, v + (B[i] - v) * t))).toString(16).padStart(2, "0")).join("");
}
function slot(expr: string, base: Record<string, string>): string {
  const m = /^([a-z]+)(?:([<>])([\\d.]+)|~([a-z]+):([\\d.]+))?$/.exec(expr)!;
  const c = base[m[1]];
  if (m[2] === ">") return mix(c, "#000000", +m[3]);
  if (m[2] === "<") return mix(c, "#ffffff", +m[3]);
  if (m[4]) return mix(c, base[m[4]], +m[5]);
  return mix(c, c, 0);
}`;
