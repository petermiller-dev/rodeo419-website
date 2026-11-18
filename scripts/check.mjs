#!/usr/bin/env node
// Checks the built site in _site and exits non-zero on any problem:
// - every internal link, image, script and stylesheet resolves (and #anchors exist)
// - one <h1>, a unique <title>, and a meta description on every page
// - every <img> has an alt attribute
// - preview mode: every page carries noindex and robots.txt allows crawling
// - privacy: no third-party scripts, stylesheets, fonts, iframes or forms
// - structured data parses as JSON
// - every photo slot is documented in PHOTO-GUIDE.md
//   node scripts/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/images.json'), 'utf8'));
const base = new URL(site.siteUrl).pathname.replace(/\/$/, '');
const problems = [];
const titles = new Map();
const external = new Set();

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(OUT);

const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
let checked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(OUT, file);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: has ${h1s} <h1> elements`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) problems.push(`${rel}: missing <title>`);
  else if (titles.has(title)) problems.push(`${rel}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, rel);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) problems.push(`${rel}: missing/short meta description`);
  if (site.previewMode && !/<meta name="robots" content="noindex/.test(html)) problems.push(`${rel}: preview page without noindex`);
  if (!/<meta property="og:image" content="https:/.test(html)) problems.push(`${rel}: missing absolute og:image`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) problems.push(`${rel}: <img> without alt: ${m[0].slice(0, 80)}`);
  if (/<iframe|<form\b|<embed\b/i.test(html)) problems.push(`${rel}: contains an iframe, form or embed`);
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(https?:)?\/\/(?!petermiller-dev\.github\.io)[^"]*"[^>]*>/g)) {
    if (!/rel="canonical"/.test(m[0])) problems.push(`${rel}: third-party resource ${m[0].slice(0, 100)}`);
  }
  if (/(?:src|href|srcset)="[^"]*(?:googleapis|gstatic|googletagmanager|google-analytics|doubleclick)/i.test(html)) problems.push(`${rel}: loads a Google/analytics resource`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { problems.push(`${rel}: invalid JSON-LD`); }
  }

  const ids = idsOf(html);
  for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    const urls = m[0].includes('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (let url of urls) {
      url = url.replace(/&amp;/g, '&');
      if (/^https?:/.test(url)) { if (!url.startsWith(site.siteUrl)) external.add(url); continue; }
      if (/^(mailto:|tel:|data:)/.test(url) || url.startsWith('//')) continue;
      checked++;
      const [p, hash] = url.split('#');
      let target;
      if (p === '') target = file;
      else if (p.startsWith('/')) {
        if (!p.startsWith(base + '/')) { problems.push(`${rel}: absolute link outside ${base}/: ${url}`); continue; }
        target = path.join(OUT, p.slice(base.length).split('?')[0]);
      } else target = path.resolve(path.dirname(file), p.split('?')[0]);
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) { problems.push(`${rel}: broken link → ${url}`); continue; }
      if (hash && !(target === file ? ids : idsOf(fs.readFileSync(target, 'utf8'))).has(hash)) problems.push(`${rel}: missing anchor #${hash} in ${url}`);
    }
  }
}

const robots = fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots)) problems.push('robots.txt blocks crawling (search engines could not read noindex)');
if (!fs.existsSync(path.join(OUT, 'sitemap.xml'))) problems.push('sitemap.xml missing');
if (!fs.existsSync(path.join(ROOT, 'assets/images/og/og-default.png'))) problems.push('Open Graph image assets/images/og/og-default.png missing');

const guide = fs.existsSync(path.join(ROOT, 'PHOTO-GUIDE.md')) ? fs.readFileSync(path.join(ROOT, 'PHOTO-GUIDE.md'), 'utf8') : '';
for (const [id, slot] of Object.entries(images)) {
  if (id === '_readme') continue;
  if (!guide.includes('`' + id + '`')) problems.push(`PHOTO-GUIDE.md does not document slot \`${id}\``);
  if (!slot.decorative && !slot.alt) problems.push(`images.json: slot ${id} needs alt text or decorative: true`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} pages, ${checked} internal links/assets checked: no problems.`);
console.log(`  ${external.size} external links (portfolio previews, privacy policy) not fetched; run with network access to spot-check them.`);
