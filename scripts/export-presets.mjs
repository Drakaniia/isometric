/** Generate distributable style presets from the authoritative TS mappings. */
import fs from 'node:fs';
import { STYLES, STYLE_IDS } from '../kit/dist/index.js';
fs.mkdirSync('assets/presets',{recursive:true});
for(const id of STYLE_IDS) fs.writeFileSync(`assets/presets/${id}.json`,JSON.stringify({name:id,...STYLES[id]},null,2)+'\n');
console.log('Six style presets written');
