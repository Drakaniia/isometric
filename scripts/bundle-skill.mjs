/** Build the portable installation archive without node_modules, site or secrets. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(),'isometric-bundle-'));
const target = path.join(temp,'isometric');
fs.mkdirSync(target);
for(const item of ['SKILL.md','README.md','LICENSE','kit/dist','kit/src','kit/tsconfig.json','references','assets','examples','scripts']) {
  const dest=path.join(target,item);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.cpSync(path.join(root,item),dest,{recursive:true,filter:src=>!src.split(path.sep).includes('out')});
}
fs.mkdirSync('site/public',{recursive:true});
try {
  execFileSync('tar',['-a','-cf',path.join(root,'site/public/isometric.zip'),'-C',temp,'isometric'],{stdio:'inherit'});
  console.log('Portable skill: site/public/isometric.zip');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
