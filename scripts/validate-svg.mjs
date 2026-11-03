#!/usr/bin/env node
/**
 * validate-svg.mjs: dependency-free SVG checker.
 *
 * Usage:  node scripts/validate-svg.mjs <file.svg> [more.svg ...] [--json] [--strict]
 *
 * Errors (exit 1): malformed XML, duplicate attributes, duplicate ids, broken
 *   #references, bad path data, missing xmlns, scripts.
 * Warnings (exit 1 only with --strict): missing viewBox, no accessible name,
 *   animation without prefers-reduced-motion, embedded rasters, heavy filters,
 *   very large files, external URLs.
 */
import fs from 'node:fs';
import { parseArgs } from './_resolve.mjs';

const ARGC = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

function checkPath(d) {
  const issues = [];
  if (!/^[\sMmZzLlHhVvCcSsQqTtAa0-9eE+\-.,]*$/.test(d)) { issues.push('contains characters that are not valid in path data'); return issues; }
  const t = d.trim();
  if (!t) return issues;
  if (!/^[Mm]/.test(t)) issues.push('must start with a moveto (M or m)');
  const re = /([MmZzLlHhVvCcSsQqTtAa])([^MmZzLlHhVvCcSsQqTtAa]*)/g;
  let m;
  while ((m = re.exec(t))) {
    const cmd = m[1].toUpperCase();
    const nums = (m[2].match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || []).length;
    const need = ARGC[cmd];
    if (need === 0 && nums > 0) issues.push(`${m[1]} takes no arguments`);
    else if (need > 0 && (nums === 0 || nums % need !== 0)) issues.push(`${m[1]} needs a multiple of ${need} numbers, found ${nums}`);
  }
  return issues;
}

export function validateSvg(text, { file = 'input' } = {}) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  const src = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '');
  const cdata = [];
  const clean = src.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, c) => { cdata.push(c); return ''; });

  const stack = [];
  const ids = new Map();
  const refs = [];
  let root = null, count = 0, filters = 0, animated = false, hasReduced = false;
  let styleText = cdata.join('\n');
  let rootAttrs = {};
  let hasTitle = false;
  const tagRe = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[^<>]*?)?)(\/?)>/g;
  let last = 0, m;
  const bareAmp = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;
  const lineOf = (i) => clean.slice(0, i).split('\n').length;
  while ((m = tagRe.exec(clean))) {
    const between = clean.slice(last, m.index);
    if (/</.test(between)) { E(`line ${lineOf(last)}: stray "<" or malformed tag`); }
    if (bareAmp.test(between)) E(`line ${lineOf(last)}: unescaped "&" in text`);
    last = m.index + m[0].length;
    const [, close, name, attrStr, selfClose] = m;
    if (close) {
      const top = stack.pop();
      if (top !== name) E(`line ${lineOf(m.index)}: </${name}> does not match <${top ?? 'nothing'}>`);
      continue;
    }
    count++;
    if (!root) { root = name; }
    if (name === 'style') {
      const end = clean.indexOf('</style>', last);
      if (end > -1) { styleText += '\n' + clean.slice(last, end); }
    }
    if (name === 'script') E(`line ${lineOf(m.index)}: <script> found. Inline scripts do not belong in a static SVG`);
    if (name === 'title') hasTitle = true;
    if (name === 'filter') filters++;
    if (/^animate/.test(name) || name === 'set') animated = true;
    const attrs = {};
    const seen = new Set();
    const aRe = /([^\s=\/>"']+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let a, consumed = '';
    while ((a = aRe.exec(attrStr))) {
      const k = a[1], v = a[3] ?? a[4] ?? '';
      consumed += a[0];
      if (seen.has(k)) E(`line ${lineOf(m.index)}: <${name}> repeats attribute "${k}"`);
      seen.add(k);
      attrs[k] = v;
      if (bareAmp.test(v)) E(`line ${lineOf(m.index)}: unescaped "&" in attribute ${k}`);
      for (const u of v.matchAll(/url\(\s*['"]?#([^)'"\s]+)/g)) refs.push([u[1], name, k]);
      if ((k === 'href' || k === 'xlink:href') && v.startsWith('#')) refs.push([v.slice(1), name, k]);
      if ((k === 'href' || k === 'xlink:href') && /^https?:/.test(v)) W(`<${name}> references an external URL (${v.slice(0, 50)}). It will not load offline`);
      if (name === 'path' && k === 'd') for (const i of checkPath(v)) E(`line ${lineOf(m.index)}: path data ${i}`);
      if (k === 'points') { const n = (v.match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || []).length; if (n % 2) E(`line ${lineOf(m.index)}: points has an odd number of coordinates`); if (/NaN|undefined|Infinity/.test(v)) E(`line ${lineOf(m.index)}: points contains NaN or undefined`); }
      if (/NaN|undefined/.test(v) && k !== 'points' && k !== 'd') E(`line ${lineOf(m.index)}: attribute ${k} contains "${/NaN/.test(v) ? 'NaN' : 'undefined'}"`);
      if (k === 'd' && /NaN|undefined/.test(v)) E(`line ${lineOf(m.index)}: path data contains NaN or undefined`);
      if (k === 'id') { if (ids.has(v)) E(`duplicate id "${v}"`); ids.set(v, name); }
    }
    const leftover = attrStr.replace(aRe, '').trim();
    if (leftover) E(`line ${lineOf(m.index)}: <${name}> has malformed attributes near "${leftover.slice(0, 30)}"`);
    if (name === 'image' && /^data:image\/(png|jpe?g|gif|webp)/.test(attrs.href || attrs['xlink:href'] || '')) W('embedded raster image found. Prefer vector shapes');
    if (stack.length === 0 && root === name) rootAttrs = attrs;
    if (!selfClose) stack.push(name);
  }
  if (stack.length) E(`unclosed element <${stack[stack.length - 1]}>`);
  if (root !== 'svg') E(`root element is <${root}>, expected <svg>`);
  if (!rootAttrs.xmlns) E('root <svg> is missing xmlns="http://www.w3.org/2000/svg"');
  if (!rootAttrs.viewBox) W('root <svg> has no viewBox, so it will not scale');
  const hidden = rootAttrs['aria-hidden'] === 'true';
  if (!hidden && !hasTitle && !rootAttrs['aria-label'] && !rootAttrs['aria-labelledby']) W('no accessible name: add <title>, aria-label, or mark decorative with aria-hidden="true"');
  if (rootAttrs.role === 'img' && !hidden && !hasTitle && !rootAttrs['aria-label']) W('role="img" without a <title> or aria-label');
  if (/@keyframes|animation\s*:/.test(styleText)) animated = true;
  hasReduced = /prefers-reduced-motion/.test(styleText);
  if (animated && !hasReduced) W('animation found but no @media (prefers-reduced-motion: reduce) rule');
  if (filters > 6) W(`${filters} filters. Filters are expensive; reuse or remove some`);
  if (count > 6000) W(`${count} elements. Consider simplifying or instancing with <use>`);
  if (Buffer.byteLength(text) > 500 * 1024) W(`file is ${(Buffer.byteLength(text) / 1024).toFixed(0)} KB`);
  for (const [id, el, attr] of refs) if (!ids.has(id)) E(`<${el} ${attr}> points to missing id "${id}"`);
  return { file, errors, warnings, stats: { elements: count, ids: ids.size, bytes: Buffer.byteLength(text) } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { pos, flags } = parseArgs(process.argv.slice(2));
  if (!pos.length || flags.help) {
    console.error('Usage: node scripts/validate-svg.mjs <file.svg> [more.svg ...] [--json] [--strict]');
    process.exit(pos.length ? 0 : 2);
  }
  const results = [];
  for (const f of pos) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch (e) { results.push({ file: f, errors: [`cannot read file: ${e.message}`], warnings: [], stats: {} }); continue; }
    results.push(validateSvg(text, { file: f }));
  }
  if (flags.json) console.log(JSON.stringify(results, null, 2));
  else for (const r of results) {
    const ok = !r.errors.length;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${r.file}  (${r.stats.elements ?? 0} elements, ${((r.stats.bytes ?? 0) / 1024).toFixed(1)} KB)`);
    r.errors.forEach((e) => console.log(`  error:   ${e}`));
    r.warnings.forEach((w) => console.log(`  warning: ${w}`));
  }
  const bad = results.some((r) => r.errors.length || (flags.strict && r.warnings.length));
  process.exit(bad ? 1 : 0);
}
