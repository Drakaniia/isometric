#!/usr/bin/env node
/**
 * capture.mjs: screenshot a page or SVG at several viewports, and report console errors.
 *
 * Usage: node scripts/capture.mjs <url|file.html|file.svg> [--out shots] [--viewports desktop,tablet,mobile]
 *        [--selector "svg"] [--wait 600] [--reduced-motion] [--dark] [--click "[data-part=core]"]
 *
 * Needs Playwright, which is NOT installed for you:
 *   npm i -D playwright && npx playwright install chromium     (or install it globally)
 * Exit code 1 if the page logged console errors or failed requests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { tryRequire, parseArgs } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
if (!pos[0] || flags.help) { console.error('Usage: node scripts/capture.mjs <url|file> [--out dir] [--viewports desktop,tablet,mobile] [--selector svg] [--wait ms] [--reduced-motion] [--dark] [--click selector]'); process.exit(pos[0] ? 0 : 2); }
const pw = tryRequire('playwright') || tryRequire('playwright-core');
if (!pw) { console.error('Playwright not found. Install it: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const VIEW = { desktop: [1440, 900], laptop: [1280, 720], tablet: [820, 1180], mobile: [390, 844] };
const target = /^https?:|^file:/.test(pos[0]) ? pos[0] : 'file://' + path.resolve(pos[0]);
const outDir = path.resolve(flags.out && flags.out !== true ? flags.out : 'captures');
fs.mkdirSync(outDir, { recursive: true });
const names = (flags.viewports && flags.viewports !== true ? flags.viewports : 'desktop,tablet,mobile').split(',');
const base = path.basename(pos[0]).replace(/\W+/g, '-').replace(/-+$/, '');
const problems = [];

let browser;
try { browser = await pw.chromium.launch(); } catch (e) { console.error('Could not launch Chromium:', e.message.split('\n')[0], '\nRun: npx playwright install chromium'); process.exit(1); }
for (const n of names) {
  const vp = VIEW[n];
  if (!vp) { console.error(`Unknown viewport "${n}". Use: ${Object.keys(VIEW).join(', ')}`); process.exit(2); }
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, reducedMotion: flags['reduced-motion'] ? 'reduce' : 'no-preference', colorScheme: flags.dark ? 'dark' : 'light', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${n}] console error: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${n}] page error: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[${n}] request failed: ${r.url().slice(0, 80)}`));
  await page.goto(target, { waitUntil: 'load' });
  await page.waitForTimeout(parseInt(flags.wait || '600', 10));
  if (flags.click && flags.click !== true) { await page.click(flags.click).catch((e) => problems.push(`[${n}] click failed: ${e.message.split('\n')[0]}`)); await page.waitForTimeout(250); }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) problems.push(`[${n}] horizontal overflow of ${overflow}px`);
  const file = path.join(outDir, `${base}-${n}${flags['reduced-motion'] ? '-reduced' : ''}${flags.dark ? '-dark' : ''}.png`);
  const sel = flags.selector && flags.selector !== true ? await page.$(flags.selector) : null;
  await (sel || page).screenshot({ path: file, ...(sel ? {} : { fullPage: true }) });
  console.log(`${n} (${vp[0]}x${vp[1]}) → ${file}`);
  await ctx.close();
}
await browser.close();
if (problems.length) { console.error('\nProblems:\n' + problems.map((p) => '  ' + p).join('\n')); process.exit(1); }
console.log('No console errors, failed requests or horizontal overflow.');
