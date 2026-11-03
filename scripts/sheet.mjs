#!/usr/bin/env node
/**
 * sheet.mjs: render library drawings into a contact sheet (HTML, plus PNG
 * when Playwright is installed) so they can actually be looked at.
 *
 *   node scripts/sheet.mjs [id ...] [--styles=stroke,two-tone,...] [--facing=left] [--pose=lying]
 *        [--theme=dark] [--phase=0.5] [--size=320] [--out=captures/sheet]
 *
 * Needs the kit built (npm run build).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, tryRequire } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
const kit = await import(pathToFileURL(path.resolve('kit/dist/index.js')).href);
const styles = (flags.styles || 'stroke,two-tone,duotone,fill,anatomy,yours').split(',');
const ids = pos.length ? pos : kit.library.map((d) => d.id);
const size = +(flags.size || 300);
const out = flags.out || 'captures/sheet';
fs.mkdirSync(path.dirname(out), { recursive: true });

let cells = '';
let bad = 0;
for (const id of ids) {
  const d = kit.byId(id);
  if (!d) { console.error(`unknown drawing ${id}`); bad++; continue; }
  for (const style of styles) {
    const r = kit.render(d, {
      style, theme: flags.theme || 'light', facing: flags.facing || 'right', pose: flags.pose || 'as-drawn',
      phase: flags.phase !== undefined ? +flags.phase : undefined, weight: +(flags.weight || 1),
    });
    if (r.audit.cycles) bad++;
    console.log(`${id.padEnd(18)} ${style.padEnd(9)} solids ${String(r.audit.solids).padStart(3)}  cycles ${r.audit.cycles}  overlaps ${r.audit.overlaps}  ${(r.svg.length / 1024).toFixed(1)} KB`);
    cells += `<figure><div class="art">${r.svg}</div><figcaption>${d.name} · ${style}</figcaption></figure>`;
  }
}
const bg = flags.theme === 'dark' ? '#161616' : '#ffffff';
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:${bg};font:12px system-ui;color:#888;display:grid;grid-template-columns:repeat(${Math.min(styles.length, 6)},${size}px);gap:12px}figure{margin:0;border:1px solid #8883;border-radius:10px;padding:10px}.art svg{width:100%;height:auto;display:block}figcaption{text-align:center;margin-top:6px}</style>${cells}`;
fs.writeFileSync(`${out}.html`, html);
console.log(`→ ${out}.html`);
const pw = tryRequire('playwright');
if (pw) {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: Math.min(styles.length, 6) * (size + 12) + 32, height: 400 }, deviceScaleFactor: +(flags.dpr || 1) });
  await page.goto(pathToFileURL(path.resolve(`${out}.html`)).href);
  await page.screenshot({ path: `${out}.png`, fullPage: true });
  await browser.close();
  console.log(`→ ${out}.png`);
}
process.exit(bad ? 1 : 0);
