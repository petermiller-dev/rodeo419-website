#!/usr/bin/env node
// Preview the built site exactly as GitHub Pages serves it: under the
// repository subpath (http://localhost:4000/rodeo419-website/), with the
// custom 404 page for unknown URLs.
//   node scripts/serve.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const base = new URL(site.siteUrl).pathname.replace(/\/$/, '');
const port = Number(process.argv[2]) || 4000;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '') { res.writeHead(302, { Location: base + '/' }); return res.end(); }
  if (!url.startsWith(base + '/') && url !== base) return notFound(res);
  let rel = url.slice(base.length) || '/';
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(OUT, path.normalize(rel));
  if (!file.startsWith(OUT)) return notFound(res);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(301, { Location: url + '/' }); return res.end(); }
  if (!fs.existsSync(file)) return notFound(res);
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving _site at http://localhost:${port}${base}/`));

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(path.join(OUT, '404.html')).pipe(res);
}
