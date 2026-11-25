#!/usr/bin/env node
// Renders the branded Open Graph image (1200×630) to assets/images/og/og-default.png.
// Optional tool, not part of the build. Needs Playwright + Chromium.
// Uses the hero photo if one has been added, otherwise the tonal placeholder.
//   node tools/make-og.mjs   (run after node scripts/build.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/images.json'), 'utf8'));
const photo = path.join(ROOT, 'assets/images', images.hero.desktop.file);
const bg = fs.existsSync(photo) ? photo : path.join(ROOT, '_site/assets/images/placeholders/hero-desktop.svg');
if (!fs.existsSync(bg)) { console.error('Run node scripts/build.mjs first.'); process.exit(1); }
const f = (n) => pathToFileURL(path.join(ROOT, 'assets/fonts', n)).href;

const html = `<!doctype html><html><head><style>
@font-face{font-family:D;src:url(${f('big-shoulders-display-latin.woff2')});font-weight:600 900}
@font-face{font-family:B;src:url(${f('public-sans-latin.woff2')});font-weight:400 700}
@font-face{font-family:S;src:url(${f('instrument-serif-italic-latin.woff2')});font-style:italic}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#1b1714;color:#f3eadb;font-family:B;position:relative;overflow:hidden}
.bg{position:absolute;inset:0;background:url(${pathToFileURL(bg).href}) ${images.hero.desktop.focal}/cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,14,10,.94) 0%,rgba(20,14,10,.82) 48%,rgba(20,14,10,.25) 100%)}
.stitch{position:absolute;inset:18px;border:1.5px dashed rgba(243,234,219,.42)}
.c{position:absolute;left:72px;top:70px;right:72px;bottom:64px;display:flex;flex-direction:column}
.wm{display:inline-flex;flex-direction:column;align-self:flex-start}
.main{display:flex;align-items:center;gap:22px;font-family:D;font-weight:900;font-size:150px;line-height:.8;text-transform:uppercase;letter-spacing:.02em}
.num{font-size:84px;color:#d4ae7b;border:5px solid #d4ae7b;outline:2px solid #d4ae7b;outline-offset:6px;padding:10px 16px 4px;line-height:.9}
.sub{display:flex;align-items:center;gap:18px;margin-top:22px;font-weight:700;font-size:22px;letter-spacing:.5em;text-transform:uppercase;color:#d4ae7b}
.sub:before,.sub:after{content:'';flex:1;height:2px;background:#d4ae7b;opacity:.7}
.tag{margin-top:auto;font-family:D;font-weight:800;text-transform:uppercase;font-size:56px;line-height:.92;max-width:760px}
.tag em{font-family:S;font-weight:400;text-transform:none;color:#f1c27d;font-size:1.04em}
.meta{margin-top:20px;font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:rgba(243,234,219,.8);font-weight:700}
</style></head><body><div class="bg"></div><div class="shade"></div><div class="stitch"></div>
<div class="c"><div class="wm"><div class="main">Rodeo<span class="num">419</span></div><div class="sub">Marketing</div></div>
<p class="tag">Research-first marketing for <em>Fort&nbsp;Worth</em> small businesses</p>
<p class="meta">Market research · Websites · Search marketing</p></div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(ROOT, '_site', '.og-render.html');
fs.writeFileSync(tmp, html);
await p.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const out = path.join(ROOT, 'assets/images/og/og-default.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
await p.screenshot({ path: out });
await b.close();
fs.rmSync(tmp);
console.log('✓ Wrote', path.relative(ROOT, out));
