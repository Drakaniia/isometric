/**
 * flatten-rsc.mjs: make the static export work on any plain file host.
 *
 * Next writes segment payloads as `__next.gallery/__PAGE__.txt`, while the
 * client prefetches `__next.gallery.__PAGE__.txt`. Hosts with Next-aware
 * rewrites map one to the other; a plain static host does not. This copies
 * every nested payload to its flat name next to the folder.
 */
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2] || 'out');
let copied = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('__next.')) flatten(p, dir, e.name);
    else walk(p);
  }
}

function flatten(segDir, parent, prefix) {
  for (const e of fs.readdirSync(segDir, { withFileTypes: true })) {
    const p = path.join(segDir, e.name);
    if (e.isDirectory()) flatten(p, parent, `${prefix}.${e.name}`);
    else {
      fs.copyFileSync(p, path.join(parent, `${prefix}.${e.name}`));
      copied++;
    }
  }
}

if (!fs.existsSync(out)) {
  console.error(`No export at ${out}`);
  process.exit(1);
}
walk(out);
console.log(`flatten-rsc: ${copied} segment payloads copied to flat names`);
