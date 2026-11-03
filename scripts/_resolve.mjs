/** Resolve optional dependencies from the project, the current dir, or global npm, without installing anything. */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';

let globalRoot;
function globalNodeModules() {
  if (globalRoot === undefined) {
    try { globalRoot = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { globalRoot = ''; }
  }
  return globalRoot;
}

export function tryRequire(name) {
  const bases = [path.join(process.cwd(), 'noop.js')];
  for (const b of bases) {
    try { return createRequire(b)(name); } catch { /* next */ }
  }
  const g = globalNodeModules();
  if (g) {
    try { return createRequire(path.join(g, 'noop.js'))(name); } catch { /* next */ }
  }
  return null;
}

export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const eq = k.indexOf('=');
      if (eq > 0) { flags[k.slice(0, eq)] = k.slice(eq + 1); continue; }
      const nxt = argv[i + 1];
      if (nxt === undefined || nxt.startsWith('--')) flags[k] = true; else { flags[k] = nxt; i++; }
    } else pos.push(a);
  }
  return { pos, flags };
}
