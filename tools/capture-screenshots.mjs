#!/usr/bin/env node
// Captures real desktop and mobile screenshots of each portfolio preview.
// Optional tool, not part of the site build. Needs Playwright + Chromium and
// Python with Pillow (for WebP conversion):
//   node tools/capture-screenshots.mjs [project-slug]
// Output: assets/images/work/<slug>/<shot>.webp  (see content/work.json)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/work.json'), 'utf8'));
const only = process.argv[2];

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch();
const log = [];
for (const p of work.projects) {
  if (only && p.slug !== only) continue;
  const dir = path.join(ROOT, 'assets/images/work', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const shot of p.screenshots || []) {
    const ctx = await browser.newContext({ ...VIEWPORTS[shot.device], reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const url = new URL(shot.path || '', p.previewUrl).href;
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      if (!res || res.status() >= 400) throw new Error(`HTTP ${res && res.status()}`);
      await page.waitForTimeout(1200);
      const png = path.join(dir, `${shot.id}.png`);
      await page.screenshot({ path: png });
      const out = path.join(dir, `${shot.id}.webp`);
      // Full size plus a half-size copy for small screens (-720 desktop, -390 mobile).
      const small = out.replace(/\.webp$/, shot.device === 'desktop' ? '-720.webp' : '-390.webp');
      execFileSync('python3', ['-I', '-c', [
        'import sys;from PIL import Image',
        'im=Image.open(sys.argv[1]).convert("RGB");im.save(sys.argv[2],"WEBP",quality=80,method=6)',
        'w,h=im.size;nw=w//2;im.resize((nw,round(h*nw/w)),Image.LANCZOS).save(sys.argv[3],"WEBP",quality=80,method=6)',
      ].join('\n'), png, out, small]);
      fs.rmSync(png);
      log.push(`✓ ${p.slug}/${shot.id}  ${url}`);
    } catch (e) {
      log.push(`✗ ${p.slug}/${shot.id}  ${url}  — ${e.message}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(log.join('\n'));
