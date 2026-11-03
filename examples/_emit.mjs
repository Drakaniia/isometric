/**
 * _emit.mjs: shared output for every example. Renders one library drawing in
 * all six styles (light and dark), writes a TSX component, a motion frame
 * strip and a contact page, and validates every SVG.
 *
 * Needs the kit built: npm run build (from the repository root).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kitPath = path.join(root, 'kit', 'dist', 'index.js');
if (!fs.existsSync(kitPath)) {
  console.error('kit/dist is missing. Run `npm run build` in the repository root first.');
  process.exit(2);
}
const kit = await import(pathToFileURL(kitPath).href);
const { validateSvg } = await import(pathToFileURL(path.join(root, 'scripts', 'validate-svg.mjs')).href);

export async function emit(exampleDir, drawingId, { notes = '' } = {}) {
  const d = kit.byId(drawingId);
  if (!d) throw new Error(`No drawing ${drawingId} in the library`);
  const out = path.join(exampleDir, 'out');
  fs.mkdirSync(out, { recursive: true });
  let bad = 0;
  const cells = [];
  for (const theme of ['light', 'dark']) {
    for (const style of kit.STYLE_IDS) {
      const svg = kit.toSvg(d, { style, theme, id: `${d.id}-${style}-${theme}` });
      const name = `${d.id}-${style}${theme === 'dark' ? '-dark' : ''}.svg`;
      fs.writeFileSync(path.join(out, name), svg);
      const v = validateSvg(svg, { file: name });
      const a = kit.render(d, { style, theme }).audit;
      if (v.errors.length || a.cycles) bad++;
      console.log(`  ${name.padEnd(44)} ${v.errors.length ? `${v.errors.length} ERRORS` : 'valid'}  cycles ${a.cycles}`);
      for (const e of v.errors) console.log(`    error: ${e}`);
      cells.push(`<figure class="${theme}"><img src="${name}" alt="${d.name}, ${style}, ${theme}"><figcaption>${kit.STYLES[style].label} · ${theme}</figcaption></figure>`);
    }
  }
  // Facing and pose variants in Two-tone.
  for (const [facing, pose] of [['left', 'as-drawn'], ['right', 'lying'], ['right', 'standing']]) {
    const name = `${d.id}-two-tone-${facing}-${pose}.svg`;
    fs.writeFileSync(path.join(out, name), kit.toSvg(d, { style: 'two-tone', facing, pose, id: `${d.id}-${facing}-${pose}` }));
    cells.push(`<figure class="light"><img src="${name}" alt="${d.name}, facing ${facing}, ${pose}"><figcaption>${facing} · ${pose}</figcaption></figure>`);
  }
  // Motion strip: eight frames of the hover motion.
  if (d.motion) {
    for (let i = 0; i < 8; i++) {
      const name = `${d.id}-motion-${i}.svg`;
      fs.writeFileSync(path.join(out, name), kit.toSvg(d, { style: 'two-tone', phase: i / 8, id: `${d.id}-m${i}` }));
      cells.push(`<figure class="light"><img src="${name}" alt="Motion frame ${i + 1}"><figcaption>frame ${i + 1}/8</figcaption></figure>`);
    }
  }
  fs.writeFileSync(path.join(out, `${kit.componentName(d.id)}.tsx`), kit.toTsx(d, { style: 'two-tone' }));
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${d.name}</title>
<style>body{margin:0;padding:24px;font:13px system-ui;background:#fafaf9;color:#333}h1{font-size:18px;margin:0 0 4px}p{margin:0 0 18px;color:#666;max-width:70ch}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}figure{margin:0;border:1px solid #e5e5e5;border-radius:10px;padding:10px;background:#fff}
figure.dark{background:#161616;border-color:#333;color:#aaa}img{width:100%;height:auto;display:block}figcaption{text-align:center;margin-top:6px;font-size:12px}</style>
<h1>${d.name}</h1><p>${d.description}${notes ? ` ${notes}` : ''}<br><code>${d.prompt}</code></p><main>${cells.join('')}</main></html>`;
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`  → ${path.relative(root, path.join(out, 'index.html'))}`);
  return bad;
}

/** Run an example's build when invoked directly. */
export async function main(metaUrl, drawingId, opts) {
  const dir = path.dirname(fileURLToPath(metaUrl));
  console.log(`${path.basename(dir)} (${drawingId})`);
  const bad = await emit(dir, drawingId, opts);
  if (bad) process.exitCode = 1;
}
