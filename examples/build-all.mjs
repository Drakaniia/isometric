/** Build every example: node examples/build-all.mjs (after npm run build). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
let failed = 0;
for (const name of fs.readdirSync(here)) {
  const file = path.join(here, name, 'build.mjs');
  if (!fs.existsSync(file)) continue;
  process.exitCode = 0;
  await import(pathToFileURL(file).href);
  if (process.exitCode) failed++;
}
process.exitCode = failed ? 1 : 0;
console.log(failed ? `${failed} example(s) failed` : 'all examples built');
