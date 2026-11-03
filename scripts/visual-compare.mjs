#!/usr/bin/env node
/**
 * visual-compare.mjs: compare a reference image with a rendered preview.
 *
 * Usage: node scripts/visual-compare.mjs <reference.png> <preview.png> [--out compare] [--threshold 24] [--grid 8]
 *
 * Writes <out>/side-by-side.png, overlay.png, diff.png and prints metrics plus the
 * worst grid cells. Needs `sharp` (npm i -g sharp). The preview is resized to the
 * reference with letterboxing so the aspect ratio is kept.
 *
 * Numbers are a guide for where to look. Low error does not prove the two look alike,
 * and a high error can come from palette, grain or anti-aliasing. Always look at the images.
 */
import fs from 'node:fs';
import path from 'node:path';
import { tryRequire, parseArgs } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
if (pos.length < 2 || flags.help) { console.error('Usage: node scripts/visual-compare.mjs <reference.png> <preview.png> [--out dir] [--threshold 24] [--grid 8]'); process.exit(pos.length < 2 && !flags.help ? 2 : 0); }
const sharp = tryRequire('sharp');
if (!sharp) { console.error('This script needs sharp. Install it: npm i -g sharp (or npm i -D sharp)'); process.exit(1); }
for (const f of pos.slice(0, 2)) if (!fs.existsSync(f)) { console.error(`Not found: ${f}`); process.exit(2); }

const outDir = path.resolve(flags.out && flags.out !== true ? flags.out : 'compare');
fs.mkdirSync(outDir, { recursive: true });
const thr = parseInt(flags.threshold || '24', 10);
const grid = parseInt(flags.grid || '8', 10);

const ref = sharp(pos[0]).ensureAlpha();
const meta = await ref.metadata();
const W = meta.width, H = meta.height;
const bg = { r: 255, g: 255, b: 255, alpha: 1 };
const refRaw = await sharp(pos[0]).flatten({ background: bg }).raw().toBuffer({ resolveWithObject: true });
const genBuf = await sharp(pos[1]).resize(W, H, { fit: 'contain', background: bg }).flatten({ background: bg }).raw().toBuffer({ resolveWithObject: true });
const ch = refRaw.info.channels;

let sum = 0, sq = 0, over = 0;
const diff = Buffer.alloc(W * H * 3);
const cells = Array.from({ length: grid * grid }, () => 0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * ch;
    let d = 0;
    for (let c = 0; c < 3; c++) { const v = Math.abs(refRaw.data[i + c] - genBuf.data[i + c]); d += v; sq += v * v; }
    d /= 3; sum += d;
    if (d > thr) over++;
    const o = (y * W + x) * 3;
    const a = Math.min(255, d * 3);
    diff[o] = a; diff[o + 1] = Math.max(0, 255 - a * 1.4); diff[o + 2] = Math.max(0, 255 - a * 2);
    cells[Math.floor((y / H) * grid) * grid + Math.floor((x / W) * grid)] += d;
  }
}
const N = W * H;
const mae = sum / N, rmse = Math.sqrt(sq / (N * 3)), psnr = rmse === 0 ? Infinity : 20 * Math.log10(255 / rmse);

const refPng = await sharp(pos[0]).flatten({ background: bg }).png().toBuffer();
const genPng = await sharp(genBuf.data, { raw: genBuf.info }).png().toBuffer();
await sharp({ create: { width: W * 2, height: H, channels: 3, background: bg } }).composite([{ input: refPng, left: 0, top: 0 }, { input: genPng, left: W, top: 0 }]).png().toFile(path.join(outDir, 'side-by-side.png'));
await sharp(refPng).composite([{ input: await sharp(genPng).ensureAlpha(0.5).toBuffer(), blend: 'over' }]).png().toFile(path.join(outDir, 'overlay.png'));
await sharp(diff, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(outDir, 'diff.png'));

const worst = cells.map((v, i) => ({ row: Math.floor(i / grid), col: i % grid, mean: v / (N / (grid * grid)) })).sort((a, b) => b.mean - a.mean).slice(0, 4);
console.log(`Compared ${W}x${H}`);
console.log(`  mean abs difference : ${mae.toFixed(2)} / 255`);
console.log(`  RMSE                : ${rmse.toFixed(2)}`);
console.log(`  PSNR                : ${Number.isFinite(psnr) ? psnr.toFixed(1) + ' dB' : 'identical'}`);
console.log(`  pixels > ${thr}        : ${((over / N) * 100).toFixed(2)}%`);
console.log('  most different regions (row, col of a ' + grid + 'x' + grid + ' grid, 0 = top-left):');
worst.forEach((w) => console.log(`    row ${w.row}, col ${w.col}: mean diff ${w.mean.toFixed(1)}`));
console.log(`Images written to ${outDir}. These numbers do not prove visual equivalence. Look at the images.`);
