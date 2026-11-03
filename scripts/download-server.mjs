/** Embed the public portable-skill archive in a download-only site handler. */
import fs from 'node:fs';
const b64=fs.readFileSync('site/public/isometric.zip').toString('base64');
fs.writeFileSync('site/download-server.mjs',`const archive = ${JSON.stringify(b64)};\nexport default { async fetch(request) { const url = new URL(request.url); if (url.pathname !== '/isometric.zip') return new Response('Not found', {status:404}); return new Response(Buffer.from(archive,'base64'), {headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="isometric.zip"','Cache-Control':'public, max-age=3600'}}); } };\n`);
fs.rmSync('site/out/isometric.zip',{force:true});
console.log('Download server prepared; archive removed from static output');
