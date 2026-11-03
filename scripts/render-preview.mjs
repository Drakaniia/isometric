#!/usr/bin/env node
/**
 * render-preview.mjs: render an SVG (or an HTML page) to a PNG.
 *
 * Usage: node scripts/render-preview.mjs <input.svg|input.html> [--out preview.png]
 *        [--width 1200] [--bg "#ffffff"] [--engine auto|sharp|rsvg|magick|playwright]
 *
 * Engines are tried in order: sharp, rsvg-convert, ImageMagick, Playwright.
 * Nothing is installed for you. sharp / rsvg / ImageMagick draw static SVG only
 * (no CSS animation, no @media). Use the playwright engine for faithful output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { tryRequire, parseArgs } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
if (!pos[0] || flags.help) { console.error('Usage: node scripts/render-preview.mjs <input.svg|html> [--out file.png] [--width 1200] [--bg "#fff"] [--engine auto|sharp|rsvg|magick|playwright]'); process.exit(pos[0] ? 0 : 2); }
const input = path.resolve(pos[0]);
if (!fs.existsSync(input)) { console.error(`Input not found: ${input}`); process.exit(2); }
const out = path.resolve(flags.out || input.replace(/\.(svg|html?)$/i, '') + '.png');
const width = parseInt(flags.width || '1200', 10);
const bg = flags.bg && flags.bg !== true ? flags.bg : null;
const isSvg = /\.svg$/i.test(input);

const engines = {
  async sharp() {
    const sharp = tryRequire('sharp');
    if (!sharp || !isSvg) return false;
    let img = sharp(input, { density: 144 }).resize({ width });
    if (bg) img = img.flatten({ background: bg });
    await img.png().toFile(out);
    return true;
  },
  async rsvg() {
    if (!isSvg) return false;
    const a = ['-w', String(width), '-o', out, ...(bg ? ['-b', bg] : []), input];
    const r = spawnSync('rsvg-convert', a, { stdio: 'ignore' });
    return r.status === 0;
  },
  async magick() {
    if (!isSvg) return false;
    for (const bin of ['magick', 'convert']) {
      const r = spawnSync(bin, ['-background', bg || 'none', '-density', '144', input, '-resize', `${width}x`, out], { stdio: 'ignore' });
      if (r.status === 0) return true;
    }
    return false;
  },
  async playwright() {
    const pw = tryRequire('playwright') || tryRequire('playwright-core');
    if (!pw) return false;
    try {
      const browser = await pw.chromium.launch();
      const page = await browser.newPage({ viewport: { width, height: Math.round(width * 0.75) } });
      await page.goto('file://' + input);
      await page.waitForTimeout(400);
      const el = isSvg ? await page.$('svg') : null;
      await (el || page).screenshot({ path: out, ...(el ? {} : { fullPage: true }), ...(bg ? {} : { omitBackground: isSvg }) });
      await browser.close();
      return true;
    } catch (e) { console.error('playwright failed:', e.message.split('\n')[0]); return false; }
  },
};

const order = flags.engine && flags.engine !== 'auto' ? [flags.engine] : ['sharp', 'rsvg', 'magick', 'playwright'];
for (const name of order) {
  if (!engines[name]) { console.error(`Unknown engine "${name}"`); process.exit(2); }
  if (await engines[name]()) { console.log(`Rendered with ${name}: ${out}`); process.exit(0); }
}
console.error(`No renderer worked. Install one of: sharp (npm i -g sharp), librsvg (rsvg-convert), ImageMagick, or Playwright (npm i -g playwright && npx playwright install chromium).`);
process.exit(1);
