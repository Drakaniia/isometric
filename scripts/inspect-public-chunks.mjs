import fs from 'node:fs';
const dir='site/out/_next/static/chunks';
for(const file of ['0bhzjx2i9_hnw.js','0cz1d0mv5g_q7.js','0zkjtuwduxow8.js','3gh7_agm4adn3.js']) {
 const text=fs.readFileSync(`${dir}/${file}`,'utf8');
 console.log(file);
 const matches=[...text.matchAll(/.{0,80}(?:secret|password|token).{0,120}/gi)];
 for(const m of matches) console.log(m[0].slice(0,150));
}
