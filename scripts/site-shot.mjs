#!/usr/bin/env node
/**
 * site-shot.mjs: serve site/out statically and screenshot pages with Playwright.
 *
 *   node scripts/site-shot.mjs /gallery/ /gallery/devices/?style=anatomy [--width=1440] [--height=1000]
 *        [--dark] [--mobile] [--full] [--hover=.tile-btn] [--click=selector] [--out=captures/site]
 *   node scripts/site-shot.mjs --serve [--port=4321]      just serve the export
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, tryRequire } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
const root = path.resolve(flags.root || 'site/out');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.join(root, url);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
  if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
const port = +(flags.port || 4321);
await new Promise((r) => server.listen(port, r));
const base = `http://localhost:${port}`;
if (flags.serve) { console.log(`serving ${root} at ${base}`); }
else {
  const pw = tryRequire('playwright');
  if (!pw) { console.error('Playwright is not installed: npm i -D playwright && npx playwright install chromium'); process.exit(2); }
  const browser = await pw.chromium.launch();
  const mobile = !!flags.mobile;
  const ctx = await browser.newContext({
    viewport: { width: +(flags.width || (mobile ? 390 : 1440)), height: +(flags.height || (mobile ? 844 : 1000)) },
    deviceScaleFactor: +(flags.dpr || 1),
    colorScheme: flags.dark ? 'dark' : 'light',
    reducedMotion: flags['reduced-motion'] ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url().replace(base, '')}`); });
  const out = flags.out || 'captures/site';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let i = 0;
  for (const p of pos.length ? pos : ['/']) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    if (flags.click) { await page.click(flags.click); await page.waitForTimeout(300); }
    if (flags.hover) { await page.hover(flags.hover); await page.waitForTimeout(+(flags.wait || 600)); }
    await page.waitForTimeout(200);
    const file = `${out}-${i++}.png`;
    await page.screenshot({ path: file, fullPage: !!flags.full });
    console.log(`${p} → ${file}  (url now ${page.url().replace(base, '')})`);
  }
  if (errors.length) { console.log('console errors:'); errors.forEach((e) => console.log('  ' + e)); }
  await browser.close();
  server.close();
}
