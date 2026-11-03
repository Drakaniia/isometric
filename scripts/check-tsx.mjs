/** Compile every copied TSX component against the site's React types. */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { library, toTsx, componentName } from '../kit/dist/index.js';
const dir = 'site/.export-check';
fs.mkdirSync(dir, { recursive: true });
for (const d of library) fs.writeFileSync(`${dir}/${componentName(d.id)}.tsx`, toTsx(d));
fs.writeFileSync(`${dir}/tsconfig.json`, JSON.stringify({ compilerOptions: { target:'ES2020', module:'ESNext', moduleResolution:'Bundler', jsx:'react-jsx', strict:true, noEmit:true, skipLibCheck:true }, include:['*.tsx'] }));
try {
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', `${dir}/tsconfig.json`], { stdio: 'inherit' });
  console.log(`${library.length} self-contained TSX components compiled`);
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
