/** Copy and adapt; resolve the kit import from the installed skill folder. */
import fs from 'node:fs';
import { defineDrawing, box, toSvg, toTsx, render } from '../../kit/dist/index.js';
export const model = defineDrawing({
  id: 'login-card', name: 'Login card', category: 'interface', kind: 'scene',
  tags: ['login'], createdAt: '2026-11-03',
  prompt: '/isometric a login card for my website',
  description: 'A sign-in card with two fields and a highlighted button.',
  parts: [box([0,0,0], [2.4,3,0.15], {r:0.12, axis:'z', decals:{front:[
    {t:'circle',cx:1.2,cy:0.4,r:0.2,fill:'detail'},
    {t:'rect',x:0.3,y:0.9,w:1.8,h:0.4,r:0.06,stroke:true},
    {t:'rect',x:0.3,y:1.6,w:1.8,h:0.4,r:0.06,stroke:true},
    {t:'rect',x:0.3,y:2.3,w:1.8,h:0.4,r:0.06,fill:'accent'}
  ]}})]
});
const options = {style:'two-tone', tokens:{accent:'#ef6c4d'}};
if (render(model,options).audit.cycles) throw new Error('Fix depth cycles');
fs.mkdirSync('out',{recursive:true});
fs.writeFileSync('out/login-card.svg',toSvg(model,options));
fs.writeFileSync('out/LoginCard.tsx',toTsx(model,options));
