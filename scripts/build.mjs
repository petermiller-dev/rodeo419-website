#!/usr/bin/env node
// Build the static site from /content into /_site.
//   node scripts/build.mjs
// No dependencies. Requires Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter, renderMarkdown, slugify, inline } from './markdown.mjs';
import {
  layout, pageHero, chapterList, processTimeline, contactLinks, ctaBand, homePage, workGrid, caseStudy,
  imageSlot, shotFigure, button, insightsIndex, articlePage, inquiryForm,
} from './templates.mjs';
import { coverSvg } from './covers.mjs';
import { placeholderFiles } from './placeholders.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, '_site');

const readJson = (f) => { const d = JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8')); delete d._readme; return d; };
const site = readJson('site.json');
const images = readJson('images.json');
const work = readJson('work.json');
const version = Date.now().toString(36);
const basePath = new URL(site.siteUrl).pathname.replace(/\/$/, ''); // e.g. /rodeo419-website

const read = (p) => parseFrontMatter(fs.readFileSync(path.join(CONTENT, p), 'utf8'));
const hasImage = (file) => !!file && fs.existsSync(path.join(ROOT, 'assets/images', file));

/** Context for a page at `pagePath` (e.g. "/about/"). Links are relative so the
 *  site works under any subpath; the 404 page uses absolute links because
 *  GitHub Pages serves it at whatever URL was requested. */
function makeCtx(pagePath, { absolute = false, project = null } = {}) {
  const depth = pagePath.split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  const ctx = {
    site, images, version, project, previewMode: site.previewMode, hasImage,
    url(href) {
      if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
      if (absolute) return basePath + href;
      const rest = href.slice(1);
      return rest ? (depth ? prefix + rest : rest) : prefix;
    },
    /** Optional smaller copies: photo-800.jpg / photo-1200.jpg next to photo.jpg. */
    srcsetFor(file, width) {
      const ext = path.extname(file);
      const stem = file.slice(0, -ext.length);
      const set = [800, 1200, 1600].filter((w) => w < width && hasImage(`${stem}-${w}${ext}`)).map((w) => `${ctx.url(`/assets/images/${stem}-${w}${ext}`)} ${w}w`);
      return set.length ? [...set, `${ctx.url('/assets/images/' + file)} ${width}w`].join(', ') : '';
    },
    directive(kind, id) {
      if (kind === 'image') {
        const slot = images[id];
        return `<figure class="figure figure--photo" data-reveal>${imageSlot(ctx, id, { sizes: '(min-width: 1000px) 60vw, 92vw' })}${slot.decorative ? '' : ''}</figure>`;
      }
      if (kind === 'form') {
        if (id !== 'inquiry') throw new Error(`Unknown form "${id}"`);
        return inquiryForm(ctx);
      }
      if (kind === 'shot') {
        // {{shot: id}} inside a case study, or {{shot: project/id}} anywhere.
        if (id.includes('/')) {
          const [slug, shotId] = id.split('/');
          const proj = work.projects.find((p) => p.slug === slug && p.published);
          if (!proj) throw new Error(`{{shot: ${id}}}: no published project "${slug}"`);
          return shotFigure(ctx, proj, shotId, { credit: true });
        }
        if (!ctx.project) throw new Error(`{{shot: ${id}}} used outside a case study`);
        return shotFigure(ctx, ctx.project, id);
      }
      return '';
    },
  };
  return ctx;
}

/** Split a Markdown body at each "## Heading {#id}" into chapters.
 *  Lines like "Summary: text" right after a heading become fields.
 *  A line "{{band: slot-id}}" between chapters becomes a full-width image band. */
function splitChapters(body, ctx) {
  const chapters = [];
  let cur = null;
  const flush = () => { if (cur) { cur.html = renderMarkdown(cur.lines.join('\n'), ctx).html; delete cur.lines; chapters.push(cur); } };
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*?)(?:\s+\{#([a-z0-9-]+)\})?\s*$/);
    const band = line.match(/^\{\{band:\s*([a-z0-9-]+)\s*\}\}\s*$/);
    if (h) { flush(); cur = { title: h[1], id: h[2] || slugify(h[1]), fields: {}, lines: [], inFields: true }; continue; }
    if (band) { flush(); cur = null; chapters.push({ band: band[1] }); continue; }
    if (!cur) continue;
    const f = line.match(/^([A-Z][A-Za-z' ]+):\s+(.+)$/);
    if (cur.inFields && f) { cur.fields[f[1]] = f[2]; continue; }
    if (cur.inFields && line.trim() === '') continue;
    cur.inFields = false;
    cur.lines.push(line);
  }
  flush();
  return chapters;
}

/** The Process page's closing section (after <!-- section: foundation -->):
 *  one "## Heading {#id}", an optional "Eyebrow: text" line, an introduction,
 *  then "### " points. Laid out like a chapter, without a step number. */
function foundationSection(ctx, src) {
  if (!src.trim()) return '';
  let eyebrow = '';
  const md = src.replace(/^Eyebrow:\s+(.+)$/m, (_, t) => { eyebrow = t.trim(); return ''; });
  const html = renderMarkdown(md, ctx).html;
  const h2 = html.match(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/);
  if (!h2) throw new Error('process.md foundation section needs a "## Heading {#id}"');
  const [, id, title] = h2;
  const body = html.replace(h2[0], '').replace(/<h3 id="/g, `<h3 id="${id}-`);
  return `<section class="chapter chapter--faq" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap chapter__inner">
    <header class="chapter__head" data-reveal>
      ${eyebrow ? `<p class="chapter__label">${inline(eyebrow, ctx)}</p>` : ''}
      <h2 id="${id}-title" class="chapter__title">${title}</h2>
    </header>
    <div class="chapter__body prose" data-reveal>${body}</div>
  </div>
</section>`;
}

const renderChapters = (ctx, chapters, opts) =>
  chapters.map((c) => (c.band
    ? `<div class="band" data-reveal>${imageSlot(ctx, c.band, { className: 'band__media', guides: 'Decorative band' })}</div>`
    : chapterList(ctx, [c], opts).replace(/<span class="chapter__num" aria-hidden="true">\d+<\/span>/, `<span class="chapter__num" aria-hidden="true">${String(chapters.filter((x) => !x.band).indexOf(c) + 1).padStart(2, '0')}</span>`)
  )).join('\n');

const pages = []; // { path, lastmod } for the sitemap
function write(pagePath, html, { lastmod } = {}) {
  const file = pagePath === '/404.html' ? path.join(OUT, '404.html') : path.join(OUT, pagePath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (pagePath !== '/404.html') pages.push({ path: pagePath, lastmod });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.md')) continue;
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

/* Structured data: verified facts only ------------------------------------- */
const absUrl = (p) => site.siteUrl + p;
function businessLd() {
  const o = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    url: absUrl('/'),
    image: absUrl(site.ogImage),
    areaServed: { '@type': 'City', name: 'Fort Worth', containedInPlace: { '@type': 'State', name: 'Texas' } },
    knowsAbout: ['Market research', 'Website development', 'Web design', 'Search engine optimization', 'Local search', 'Google Business Profile', 'Content marketing'],
  };
  if (site.verified.email && site.contact.email) o.email = site.contact.email;
  if (site.verified.phone && site.contact.phoneE164) o.telephone = site.contact.phoneE164;
  return o;
}
const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absUrl(p) })),
});

/* ---------------------------------------------------------------------------
   Build
--------------------------------------------------------------------------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const published = work.projects.filter((p) => p.published);
const featured = published.filter((p) => p.featured > 0).sort((a, b) => a.featured - b.featured);
const caseProjects = published.filter((p) => p.caseStudy);

const services = splitChapters(read('pages/services.md').body, makeCtx('/services/'));
// Process: the steps come first; anything after <!-- section: foundation -->
// is the closing "better foundation" section, shown below the steps (not a step).
const [processSteps, processFoundation = ''] = read('pages/process.md').body.split(/<!--\s*section:\s*foundation\s*-->/);
const steps = splitChapters(processSteps, makeCtx('/process/'));

// HOME -----------------------------------------------------------------------
{
  const { data, body } = read('pages/home.md');
  const ctx = makeCtx('/');
  const sections = {};
  const parts = body.split(/<!--\s*section:\s*([a-z]+)\s*-->/);
  for (let i = 1; i < parts.length; i += 2) sections[parts[i]] = renderMarkdown(parts[i + 1], ctx).html;
  const capabilities = services.filter((s) => s.fields.Home === 'yes');
  write('/', layout(ctx, {
    title: data.title, description: data.description, pagePath: '/', bodyClass: 'page-home',
    body: homePage(ctx, { fm: { ...data, heroTitleLines: 'Research-first|marketing for|*Fort Worth*|small businesses' }, sections, featured, capabilities, steps }),
    jsonLd: [businessLd(), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: absUrl('/') }],
  }));
}

// WORK index -----------------------------------------------------------------
{
  const { data } = read('pages/work.md');
  const p = '/work/';
  const ctx = makeCtx(p);
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-work',
    body: pageHero(ctx, data, { num: '01' }) + workGrid(ctx, published) + ctaBand(ctx, { text: 'If your business does good work and your website doesn’t show it yet, let’s talk about what it could look like.' }),
    jsonLd: [breadcrumbLd([['Home', '/'], ['Work', p]])],
  }));
}

// CASE STUDIES ---------------------------------------------------------------
caseProjects.forEach((proj, i) => {
  const file = `work/${proj.slug}.md`;
  if (!fs.existsSync(path.join(CONTENT, file))) throw new Error(`Missing case study ${file}`);
  const { data, body } = read(file);
  const p = `/work/${proj.slug}/`;
  const ctx = makeCtx(p, { project: proj });
  const chapters = splitChapters(body, ctx);
  const next = caseProjects[(i + 1) % caseProjects.length];
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-case',
    body: caseStudy(ctx, { project: proj, fm: data, chapters, next }) + ctaBand(ctx, { text: 'Every project starts with a conversation about how your business earns trust. Tell me about yours.' }),
    jsonLd: [breadcrumbLd([['Home', '/'], ['Work', '/work/'], [proj.name, p]])],
  }));
});

// INSIGHTS -------------------------------------------------------------------
// One Markdown file per article in content/insights/. "draft: true" keeps an
// article off the site, out of the index, and out of the sitemap.
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const articles = fs.readdirSync(path.join(CONTENT, 'insights')).filter((f) => f.endsWith('.md')).map((f) => {
  const { data, body } = read(`insights/${f}`);
  const slug = f.replace(/\.md$/, '');
  for (const k of ['title', 'description', 'h1', 'dek', 'topic', 'number', 'published']) if (!data[k] && data[k] !== 0) throw new Error(`insights/${f}: missing "${k}"`);
  if (!ISO.test(data.published) || (data.updated && !ISO.test(data.updated))) throw new Error(`insights/${f}: dates must be YYYY-MM-DD`);
  const words = body.replace(/\{\{[^}]+\}\}|\]\([^)]*\)|[#>*_`:|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { ...data, slug, body, words, minutes: Math.max(1, Math.round(words / 225)), updated: data.updated || data.published };
}).filter((a) => !a.draft).sort((a, b) => b.published.localeCompare(a.published) || b.number - a.number);

const publisherLd = { '@type': 'Organization', name: site.name, url: absUrl('/') };
{
  const { data } = read('pages/insights.md');
  const p = '/insights/';
  const ctx = makeCtx(p);
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-insights',
    body: pageHero(ctx, data, { num: '06' }) + insightsIndex(ctx, { articles }) + ctaBand(ctx, { text: 'Have a question about your own website or Google listing? Ask me directly. I’ll give you a straight answer.' }),
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'Blog', name: `${site.shortName} Insights`, description: data.description, url: absUrl(p), inLanguage: site.language, publisher: publisherLd,
      blogPost: articles.map((a) => ({ '@type': 'BlogPosting', headline: a.h1, url: absUrl(`/insights/${a.slug}/`), datePublished: a.published, dateModified: a.updated })),
    }, breadcrumbLd([['Home', '/'], ['Insights', p]])],
  }), { lastmod: articles.reduce((m, a) => (a.updated > m ? a.updated : m), '') || undefined });
}
for (const a of articles) {
  const p = `/insights/${a.slug}/`;
  const ctx = makeCtx(p);
  const { html, headings } = renderMarkdown(a.body, ctx);
  const related = (a.related?.length ? a.related.map((s) => articles.find((x) => x.slug === s) || (() => { throw new Error(`insights/${a.slug}: unknown related "${s}"`); })()) : articles.filter((x) => x !== a)).slice(0, 3);
  const workLinks = (a.work || []).map((line) => {
    const [ref, note = ''] = String(line).split(/\s*\|\s*/);
    const [slug, anchor] = ref.split('#');
    const project = work.projects.find((x) => x.slug === slug && x.published && x.caseStudy);
    if (!project) throw new Error(`insights/${a.slug}: no published case study "${slug}"`);
    return { project, anchor, note };
  });
  write(p, layout(ctx, {
    title: a.title, description: a.description, pagePath: p, bodyClass: 'page-article',
    ogType: 'article',
    headExtra: `\n<meta property="article:published_time" content="${a.published}">\n<meta property="article:modified_time" content="${a.updated}">\n<meta property="article:section" content="${a.topic}">`,
    body: articlePage(ctx, { a, html, headings, related, work: workLinks }) + ctaBand(ctx, { text: 'If this raised a question about your own website, I’m glad to look at it with you. No pitch, just a straight answer.' }),
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.h1, description: a.description,
      datePublished: a.published, dateModified: a.updated, author: publisherLd, publisher: publisherLd,
      image: absUrl(site.ogImage), url: absUrl(p), mainEntityOfPage: { '@type': 'WebPage', '@id': absUrl(p) },
      articleSection: a.topic, wordCount: a.words, inLanguage: site.language,
      isPartOf: { '@type': 'Blog', name: `${site.shortName} Insights`, url: absUrl('/insights/') },
    }, breadcrumbLd([['Home', '/'], ['Insights', '/insights/'], [a.h1, p]])],
  }), { lastmod: a.updated });
}

// SERVICES -------------------------------------------------------------------
{
  const { data } = read('pages/services.md');
  const p = '/services/';
  const ctx = makeCtx(p);
  const index = `<nav class="jump" aria-label="Services on this page"><div class="wrap"><ol class="jump__list">${services.map((s, i) => `<li><a href="#${s.id}"><span>${String(i + 1).padStart(2, '0')}</span> ${s.fields.Label || s.title}</a></li>`).join('')}</ol></div></nav>`;
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-services',
    body: pageHero(ctx, data, { num: '02' }) + index + renderChapters(ctx, services) + ctaBand(ctx, { text: 'Not sure which of these you need? Most owners aren’t. Tell me what’s going on and I’ll suggest where to start.' }),
    jsonLd: [breadcrumbLd([['Home', '/'], ['Services', p]])],
  }));
}

// PROCESS --------------------------------------------------------------------
{
  const { data } = read('pages/process.md');
  const p = '/process/';
  const ctx = makeCtx(p);
  const overview = `<section class="process process--page" aria-label="The stages at a glance"><div class="wrap">${processTimeline(ctx, steps, { headingLevel: 0, link: true })}</div></section>`;
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-process',
    body: pageHero(ctx, data, { num: '03' }) + overview + renderChapters(ctx, steps, { variant: 'chapter--step' }) + foundationSection(ctx, processFoundation) + ctaBand(ctx, { text: 'The first step is a conversation. No pitch, no pressure, just an honest look at what would help.' }),
    jsonLd: [breadcrumbLd([['Home', '/'], ['Process', p]])],
  }));
}

// ABOUT ----------------------------------------------------------------------
{
  const { data, body } = read('pages/about.md');
  const p = '/about/';
  const ctx = makeCtx(p);
  const aside = `<figure class="page-hero__portrait" data-reveal>${imageSlot(ctx, 'about-headshot', { eager: true, sizes: '(min-width: 900px) 34vw, 80vw' })}</figure>`;
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-about',
    body: pageHero(ctx, data, { num: '04', aside }) + renderChapters(ctx, splitChapters(body, ctx)) + ctaBand(ctx, { text: 'If that sounds like the kind of person you’d like to work with, I’d be glad to hear about your business.' }),
    jsonLd: [businessLd(), breadcrumbLd([['Home', '/'], ['About', p]])],
  }));
}

// CONTACT --------------------------------------------------------------------
{
  const { data, body } = read('pages/contact.md');
  const p = '/contact/';
  const ctx = makeCtx(p);
  const aside = `<div class="contact-card" data-reveal><p class="contact-card__label">Reach me directly</p>${contactLinks(ctx)}</div>`;
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-contact',
    body: pageHero(ctx, data, { num: '05', aside }) + renderChapters(ctx, splitChapters(body, ctx)),
    jsonLd: [businessLd(), breadcrumbLd([['Home', '/'], ['Contact', p]])],
  }));
}

// PRIVACY --------------------------------------------------------------------
{
  const { data, body } = read('pages/privacy.md');
  const p = '/privacy/';
  const ctx = makeCtx(p);
  write(p, layout(ctx, {
    title: data.title, description: data.description, pagePath: p, bodyClass: 'page-privacy',
    body: pageHero(ctx, data, { num: '§' }) + renderChapters(ctx, splitChapters(body, ctx), { variant: 'chapter--compact' }),
  }));
}

// 404 ------------------------------------------------------------------------
{
  const { data } = read('pages/404.md');
  const ctx = makeCtx('/404.html', { absolute: true });
  const actions = `<div class="wrap not-found__actions">${button(ctx, 'Back to the homepage', '/', 'primary')}${button(ctx, 'See my work', '/work/', 'ghost')}</div>`;
  write('/404.html', layout(ctx, {
    title: data.title, description: data.description, pagePath: '/404.html', bodyClass: 'page-404',
    body: pageHero(ctx, data, { num: '404' }) + actions,
  }));
}

/* Assets ------------------------------------------------------------------- */
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
const phDir = path.join(OUT, 'assets/images/placeholders');
fs.mkdirSync(phDir, { recursive: true });
for (const [name, svg] of Object.entries(placeholderFiles(images))) fs.writeFileSync(path.join(phDir, name), svg);
const coverDir = path.join(OUT, 'assets/images/insights');
fs.mkdirSync(coverDir, { recursive: true });
for (const a of articles) fs.writeFileSync(path.join(coverDir, `${a.slug}.svg`), coverSvg(a.cover, a.coverTone));

/* Sitemap & robots --------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${absUrl(p.path)}</loc><lastmod>${p.lastmod || today}</lastmod></url>`).join('\n')}
</urlset>
`);
// Crawling stays allowed in preview so search engines can read each page's
// noindex directive. (A robots.txt only takes effect at a domain's root.)
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absUrl('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
if (site.customDomain) fs.writeFileSync(path.join(OUT, 'CNAME'), site.customDomain.trim() + '\n');

console.log(`✓ Built ${pages.length + 1} pages into _site/ (${site.previewMode ? 'preview mode: noindex on' : 'production mode'}).`);
