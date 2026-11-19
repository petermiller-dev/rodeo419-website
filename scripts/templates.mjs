// Shared templates: page layout, header, footer, image slots, screenshots,
// and the larger page compositions (home, work, case studies, chapters).
// Every function receives `ctx` (see makeCtx in build.mjs), which knows the
// page's path, how to build relative URLs, and the site settings.

import { escapeHtml as esc, inline } from './markdown.mjs';

const pad = (n) => String(n).padStart(2, '0');
const attr = (s) => esc(s ?? '');

/* ---------------------------------------------------------------------------
   Small parts
--------------------------------------------------------------------------- */
export function wordmark(ctx, { tag = 'a', size = '' } = {}) {
  const inner = `<span class="wordmark__main" aria-hidden="true">Rodeo<span class="wordmark__num">419</span></span><span class="wordmark__sub" aria-hidden="true">Marketing</span>`;
  if (tag === 'a') return `<a class="wordmark ${size}" href="${ctx.url('/')}" aria-label="${attr(ctx.site.name)}, home">${inner}</a>`;
  return `<span class="wordmark ${size}" role="img" aria-label="${attr(ctx.site.name)}">${inner}</span>`;
}

export const button = (ctx, label, href, variant = 'primary', extra = '') =>
  `<a class="btn btn--${variant}" href="${attr(ctx.url(href))}"${extra}><span>${esc(label)}</span><svg class="btn__arrow" aria-hidden="true" viewBox="0 0 20 20" width="18" height="18"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a>`;

export const externalLink = (href, label, cls = 'link-ext') =>
  `<a class="${cls}" href="${attr(href)}" rel="noopener" target="_blank">${esc(label)}<span class="visually-hidden"> (opens in a new tab)</span><svg aria-hidden="true" viewBox="0 0 16 16" width="13" height="13"><path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a>`;

export const pending = (ctx, text) =>
  ctx.site.previewMode ? `<span class="pending"><span class="visually-hidden">Pending: </span>${esc(text)}</span>` : '';

const kicker = (num, text) => `<p class="kicker"><span class="kicker__num">${num}</span><span class="kicker__text">${esc(text)}</span></p>`;

/* ---------------------------------------------------------------------------
   Photo slots (content/images.json)
--------------------------------------------------------------------------- */
export function imageSlot(ctx, id, { className = '', eager = false, sizes = '100vw', guides = false, safe = '' } = {}) {
  const slot = ctx.images[id];
  if (!slot) throw new Error(`Unknown image slot "${id}"`);
  const d = slot.desktop, m = slot.mobile;
  const real = ctx.hasImage(d.file);
  const realM = m && ctx.hasImage(m.file);
  const alt = slot.decorative ? '' : slot.alt;
  const style = `--focal:${d.focal};--focal-m:${(m || d).focal};--ratio:${d.width}/${d.height};--ratio-m:${(m || d).width}/${(m || d).height}`;
  const loading = eager ? 'eager" fetchpriority="high' : 'lazy';

  let pic;
  if (real) {
    const src = ctx.url('/assets/images/' + d.file);
    const srcset = ctx.srcsetFor(d.file, d.width);
    const msrc = realM ? `<source media="(max-width: 699px)" srcset="${ctx.srcsetFor(m.file, m.width) || ctx.url('/assets/images/' + m.file)}" width="${m.width}" height="${m.height}">` : '';
    pic = `<picture>${msrc}<img src="${src}"${srcset ? ` srcset="${srcset}" sizes="${sizes}"` : ''} width="${d.width}" height="${d.height}" alt="${attr(alt)}" loading="${loading}" decoding="async"></picture>`;
  } else {
    const ph = (crop) => ctx.url(`/assets/images/placeholders/${id}-${crop}.svg`);
    const msrc = m ? `<source media="(max-width: 699px)" srcset="${ph('mobile')}" width="${m.width}" height="${m.height}">` : '';
    pic = `<picture>${msrc}<img src="${ph('desktop')}" width="${d.width}" height="${d.height}" alt="${attr(alt)}" loading="${loading}" decoding="async"></picture>`;
  }

  const preview = ctx.site.previewMode;
  const tag = preview && !real ? `<span class="slot-tag" aria-hidden="true">Photo placeholder · ${esc(slot.label)}</span>` : '';
  const guide = preview && guides !== false
    ? `<span class="guides" aria-hidden="true">${safe ? `<span class="guides__safe guides__safe--${safe}"><span>Text-safe area</span></span>` : ''}<span class="guides__focal guides__focal--d" style="left:${d.focal.split(' ')[0]};top:${d.focal.split(' ')[1]}"></span>${m ? `<span class="guides__focal guides__focal--m" style="left:${m.focal.split(' ')[0]};top:${m.focal.split(' ')[1]}"></span>` : ''}<span class="guides__note">${esc(slot.label)} · desktop ${d.width}×${d.height}, focal ${d.focal}${m ? ` · phone ${m.width}×${m.height}, focal ${m.focal}` : ''}${typeof guides === 'string' ? ` · ${esc(guides)}` : ''}</span></span>`
    : '';
  return `<div class="slot ${real ? 'slot--photo' : 'slot--placeholder'} ${className}" style="${style}" data-slot="${id}">${pic}${tag}${guide}</div>`;
}

/* ---------------------------------------------------------------------------
   Screenshots inside device frames (content/work.json)
--------------------------------------------------------------------------- */
export function shotImg(ctx, project, shot, { sizes, eager = false } = {}) {
  const desk = shot.device === 'desktop';
  const base = `/assets/images/work/${project.slug}/${shot.id}`;
  if (!ctx.hasImage(`work/${project.slug}/${shot.id}.webp`)) {
    return `<div class="shot-missing"><p>Screenshot pending: ${esc(shot.label)} (${shot.device}).</p></div>`;
  }
  const [w, h] = desk ? [1440, 900] : [780, 1688];
  const small = desk ? 720 : 390;
  const sz = sizes || (desk ? '(min-width: 1100px) 60vw, 92vw' : '(min-width: 900px) 18vw, 45vw');
  return `<img src="${ctx.url(base + '.webp')}" srcset="${ctx.url(`${base}-${small}.webp`)} ${small}w, ${ctx.url(base + '.webp')} ${w}w" sizes="${sz}" width="${w}" height="${h}" alt="${attr(shot.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}

export function device(ctx, project, shot, opts = {}) {
  const host = new URL(project.previewUrl).host + new URL(shot.path || '', project.previewUrl).pathname;
  if (shot.device === 'desktop') {
    return `<div class="device device--desktop ${opts.className || ''}"><div class="device__bar" aria-hidden="true"><span class="device__dots"><i></i><i></i><i></i></span><span class="device__url">${esc(host)}</span></div><div class="device__screen">${shotImg(ctx, project, shot, opts)}</div></div>`;
  }
  return `<div class="device device--phone ${opts.className || ''}"><div class="device__screen">${shotImg(ctx, project, shot, opts)}</div></div>`;
}

export function shotFigure(ctx, project, shotId) {
  const shot = project.screenshots.find((s) => s.id === shotId);
  if (!shot) throw new Error(`Unknown screenshot ${project.slug}/${shotId}`);
  return `<figure class="shot shot--${shot.device}" data-reveal>${device(ctx, project, shot)}<figcaption><span>${esc(shot.label)}</span> · ${shot.device === 'desktop' ? 'Desktop' : 'Phone'}</figcaption></figure>`;
}

const statusChip = (p) => `<span class="status"><span class="status__dot" aria-hidden="true"></span>${esc(p.status)}</span>`;
const projectVars = (p) => `--p-bg:${p.colors.bg};--p-surface:${p.colors.surface};--p-ink:${p.colors.ink};--p-accent:${p.colors.accent}`;

/* ---------------------------------------------------------------------------
   Layout
--------------------------------------------------------------------------- */
function header(ctx, pagePath) {
  const { site } = ctx;
  const current = (href) => (href === '/' ? pagePath === '/' : pagePath.startsWith(href)) ? ' aria-current="page"' : '';
  const links = site.nav.map((n) => `<li><a href="${ctx.url(n.href)}"${current(n.href)}>${esc(n.label)}</a></li>`).join('');
  return `<header class="site-header" data-header>
  <div class="wrap site-header__inner">
    ${wordmark(ctx)}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle hidden>
      <span class="menu-toggle__label" data-menu-label>Menu</span><span class="menu-toggle__icon" aria-hidden="true"><i></i><i></i></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main" data-menu>
      <ul class="site-nav__list">${links}<li class="site-nav__cta"><a class="btn btn--small" href="${ctx.url(site.navCta.href)}"${current(site.navCta.href)}>${esc(site.navCta.label)}</a></li></ul>
    </nav>
  </div>
</header>`;
}

function previewBar(ctx) {
  if (!ctx.site.previewMode || ctx.site.showPreviewBanner === false) return '';
  return `<div class="preview-bar" role="note">
  <div class="wrap preview-bar__inner">
    <p><strong>Preview draft</strong><span class="preview-bar__more"> · Not public yet. Highlighted notes are waiting on owner approval.</span></p>
    <button type="button" class="preview-bar__toggle" data-guides-toggle aria-pressed="false" hidden>Photo guides</button>
  </div>
</div>`;
}

function footer(ctx) {
  const { site } = ctx;
  const nav = [{ label: 'Home', href: '/' }, ...site.nav, site.navCta, { label: 'Privacy', href: '/privacy/' }];
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        ${wordmark(ctx, { size: 'wordmark--large' })}
        <p>${esc(site.tagline)}. Working directly with owners in Fort Worth and nearby communities.</p>
      </div>
      <nav aria-label="Footer"><ul class="site-footer__nav">${nav.map((n) => `<li><a href="${ctx.url(n.href)}">${esc(n.label)}</a></li>`).join('')}</ul></nav>
    </div>
    <div class="site-footer__base">
      <p>© ${new Date().getFullYear()} ${esc(site.name)} · Fort Worth, Texas</p>
      <p class="site-footer__verse">Phil. 4:19</p>
      ${site.previewMode && site.showPreviewBanner !== false ? '<p>Preview draft · not indexed by search engines</p>' : ''}
    </div>
  </div>
</footer>`;
}

export function layout(ctx, { title, description, body, pagePath, bodyClass = '', jsonLd = [], ogImage }) {
  const { site } = ctx;
  const canonical = site.siteUrl + (pagePath === '/404.html' ? '/404.html' : pagePath);
  const og = site.siteUrl + (ogImage || site.ogImage);
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="${site.language}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
${site.previewMode ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${attr(canonical)}">
<meta name="theme-color" content="#1b1714">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(site.name)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(site.name)}: ${attr(site.tagline)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.url('/assets/images/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${ctx.url('/assets/fonts/big-shoulders-display-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ctx.url('/assets/fonts/public-sans-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.url('/assets/css/main.css')}?v=${ctx.version}">
<script>document.documentElement.className=document.documentElement.className.replace('no-js','js');setTimeout(function(){if(!window.r419)document.documentElement.classList.add('reveal-all')},2500);</script>
<script src="${ctx.url('/assets/js/main.js')}?v=${ctx.version}" defer></script>
${ld}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${previewBar(ctx)}
${header(ctx, pagePath)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(ctx)}
</body>
</html>
`;
}

/* ---------------------------------------------------------------------------
   Page hero for inner pages
--------------------------------------------------------------------------- */
export function pageHero(ctx, fm, { aside = '', num = '' } = {}) {
  return `<section class="page-hero${aside ? ' page-hero--aside' : ''}">
  <div class="wrap page-hero__inner">
    <div class="page-hero__text">
      ${kicker(num || '—', fm.eyebrow)}
      <h1 class="page-hero__title">${inline(fm.h1, ctx)}</h1>
      <p class="page-hero__intro">${inline(fm.intro, ctx)}</p>
    </div>
    ${aside}
  </div>
  <div class="wrap"><hr class="double-rule"></div>
</section>`;
}

/* ---------------------------------------------------------------------------
   Chapters: a page body split at each "## Heading" into numbered sections.
   `chapters` come from splitChapters() in build.mjs.
--------------------------------------------------------------------------- */
// Put a "What you get" + "When it's useful" pair side by side.
const pairCallouts = (html) => html.replace(/(<aside class="callout callout--gets">[\s\S]*?<\/aside>)\s*(<aside class="callout callout--when">[\s\S]*?<\/aside>)/g, '<div class="callout-pair">$1$2</div>');

export function chapterList(ctx, chapters, { variant = '' } = {}) {
  return chapters.map((c, i) => {
    const feature = c.id === 'google-business-profile' ? ' chapter--feature' : '';
    const part = c.fields['Your part'] ? `<aside class="your-part"><p class="your-part__label">Where you come in</p><p>${inline(c.fields['Your part'], ctx)}</p></aside>` : '';
    return `<section class="chapter${feature} ${variant}" id="${c.id}" aria-labelledby="${c.id}-title">
  <div class="wrap chapter__inner">
    <header class="chapter__head" data-reveal>
      <span class="chapter__num" aria-hidden="true">${pad(i + 1)}</span>
      ${c.fields.Label && feature ? `<p class="chapter__label">Search &amp; Maps</p>` : ''}
      <h2 id="${c.id}-title" class="chapter__title">${inline(c.title, ctx)}</h2>
    </header>
    <div class="chapter__body prose" data-reveal>${pairCallouts(c.html)}${part}</div>
  </div>
</section>`;
  }).join('\n');
}

/* ---------------------------------------------------------------------------
   Process timeline (Home and Process page)
--------------------------------------------------------------------------- */
export function processTimeline(ctx, steps, { headingLevel = 3, link = true } = {}) {
  const h = headingLevel ? `h${headingLevel}` : 'p';
  return `<div class="timeline" data-timeline>
  <div class="timeline__track" aria-hidden="true"><span class="timeline__line" data-timeline-line></span></div>
  <ol class="timeline__steps">
    ${steps.map((s, i) => `<li class="timeline__step" data-step>
      <span class="timeline__marker" aria-hidden="true"></span>
      <span class="timeline__num">${pad(i + 1)}</span>
      <${h} class="timeline__title">${link ? `<a href="${ctx.url('/process/#' + s.id)}">${esc(s.title)}</a>` : esc(s.title)}</${h}>
      <p class="timeline__summary">${inline(s.fields.Summary || '', ctx)}</p>
    </li>`).join('\n    ')}
  </ol>
</div>`;
}

/* ---------------------------------------------------------------------------
   Contact details (only verified details become links)
--------------------------------------------------------------------------- */
export function contactLinks(ctx, { compact = false } = {}) {
  const { site } = ctx;
  const c = site.contact, v = site.verified;
  const subject = encodeURIComponent('About my business');
  const bodyTxt = encodeURIComponent('My business:\n\nMy current website (if any):\n\nWhat I want to improve:\n');
  const email = v.email && c.email
    ? `<a class="contact-line__value" href="mailto:${attr(c.email)}?subject=${subject}&amp;body=${bodyTxt}">${esc(c.email)}</a>`
    : `<span class="contact-line__value contact-line__value--pending">Email address coming soon ${pending(ctx, 'Awaiting verified email')}</span>`;
  const phone = v.phone && c.phoneE164
    ? `<a class="contact-line__value" href="tel:${attr(c.phoneE164)}">${esc(c.phoneDisplay)}</a>`
    : `<span class="contact-line__value contact-line__value--pending">Phone number coming soon ${pending(ctx, 'Awaiting verified phone')}</span>`;
  return `<dl class="contact-lines${compact ? ' contact-lines--compact' : ''}">
  <div class="contact-line"><dt>Email</dt><dd>${email}</dd></div>
  <div class="contact-line"><dt>Call or text</dt><dd>${phone}</dd></div>
  <div class="contact-line"><dt>Based in</dt><dd><span class="contact-line__value">Fort Worth, Texas</span></dd></div>
</dl>`;
}

/* ---------------------------------------------------------------------------
   Contact band (Home, Services, case studies)
--------------------------------------------------------------------------- */
export function ctaBand(ctx, { title = 'Tell me about your business', text, headingId = 'cta-title' } = {}) {
  return `<section class="cta-band" aria-labelledby="${headingId}">
  ${imageSlot(ctx, 'cta-lights', { className: 'cta-band__media', guides: false })}
  <div class="cta-band__shade" aria-hidden="true"></div>
  <div class="wrap cta-band__inner" data-reveal>
    <p class="stamp" aria-hidden="true"><span>Fort Worth</span><b>419</b><span>Texas</span></p>
    <h2 id="${headingId}" class="cta-band__title">${esc(title)}</h2>
    <p class="cta-band__text">${text}</p>
    <div class="actions">${button(ctx, 'Talk about your business', '/contact/', 'light')}</div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------------------
   HOME
--------------------------------------------------------------------------- */
export function homePage(ctx, { fm, sections, featured, capabilities, steps }) {
  const lines = String(fm.heroTitleLines || fm.heroTitle).split('|').map((l) => l.trim());
  const h1 = `<h1 class="hero__title" id="hero-title">${lines.map((l, i) => `<span class="hero__line" style="--i:${i}"><span>${inline(l, ctx)}</span></span>`).join(' ')}</h1>`;

  const hero = `<section class="hero" aria-labelledby="hero-title">
  <div class="wrap">
    <div class="hero__top"><p class="hero__eyebrow">${esc(fm.heroEyebrow)}</p><span class="hero__rule" aria-hidden="true"></span><p class="hero__no" aria-hidden="true">No. 419</p></div>
    <div class="hero__frame" data-hero>
      <div class="hero__drift" data-hero-drift>${imageSlot(ctx, 'hero', { className: 'hero__media', eager: true, sizes: '100vw', guides: 'Motion: slow push-in from 108% to 100% over 14s, plus up to 48px drift while scrolling, inside the frame only', safe: 'hero' })}</div>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__dust" aria-hidden="true"><span class="hero__dust-layer hero__dust-layer--far"></span><span class="hero__dust-layer hero__dust-layer--near"></span></div>
      <div class="hero__stitch" aria-hidden="true"></div>
      <div class="hero__copy">${h1}</div>
    </div>
    <div class="hero__deck">
      <p class="hero__intro">${inline(fm.heroIntro, ctx)}</p>
      <div class="actions">${button(ctx, fm.heroPrimaryLabel, fm.heroPrimaryHref, 'primary')}${button(ctx, fm.heroSecondaryLabel, fm.heroSecondaryHref, 'ghost')}</div>
    </div>
  </div>
</section>`;

  const total = featured.length;
  const work = `<section class="featured" aria-labelledby="work-title">
  <div class="wrap section-head" data-reveal>
    ${kicker('01', 'Featured work')}
    ${sections.work.replace('<h2 id="recent-work">', '<h2 id="work-title" class="section-title">')}
  </div>
  <ol class="features">
    ${featured.map((p, i) => {
      const desk = p.screenshots.find((s) => s.id === 'home-desktop');
      const mob = p.screenshots.find((s) => s.id === 'home-mobile');
      return `<li class="feature" style="${projectVars(p)}" data-feature>
      <div class="feature__sticky">
        <div class="wrap feature__inner">
          <div class="feature__info">
            <p class="feature__num"><span>${pad(i + 1)}</span> / ${pad(total)}</p>
            <h3 class="feature__name">${esc(p.name)}</h3>
            <p class="feature__meta">${esc(p.industry)}${p.location ? ` · ${esc(p.location)}` : ''}</p>
            ${statusChip(p)}
            <p class="feature__summary">${esc(p.summary)}</p>
            <p class="tags"><span class="visually-hidden">Work included: </span>${p.tags.map(esc).join(' · ')}</p>
            <p class="feature__links">${p.caseStudy ? button(ctx, 'Read the case study', `/work/${p.slug}/`, 'project', ` aria-label="Read the ${attr(p.shortName)} case study"`) : ''}${externalLink(p.previewUrl, 'Visit the preview', 'link-ext link-ext--project')}</p>
          </div>
          <div class="feature__stage">
            ${desk ? device(ctx, p, desk, { className: 'feature__desk', sizes: '(min-width: 1100px) 58vw, 92vw' }) : ''}
            ${mob ? device(ctx, p, mob, { className: 'feature__phone', sizes: '(min-width: 1100px) 15vw, 34vw' }) : ''}
          </div>
        </div>
      </div>
    </li>`;
    }).join('\n    ')}
  </ol>
  <div class="wrap featured__more">${button(ctx, 'See all work', '/work/', 'ghost')}</div>
</section>`;

  // How the sites are built: h2 + intro in the head, each "### " point as a
  // list item, and the closing paragraph of links above the inquiry button.
  let build = '';
  if (sections.build) {
    const [head, ...rest] = sections.build.split(/(?=<h3[\s>])/);
    const intro = head.replace(/<h2[^>]*>/, '<h2 id="build-title" class="section-title">');
    const last = rest.length ? rest[rest.length - 1] : '';
    const tailAt = last.search(/<\/p>\s*<p>/);
    const points = tailAt === -1 ? rest : [...rest.slice(0, -1), last.slice(0, tailAt + 4)];
    const more = tailAt === -1 ? '' : last.slice(tailAt + 4).trim();
    build = `<section class="build" aria-labelledby="build-title">
  <div class="wrap">
    <div class="section-head section-head--split" data-reveal>
      ${kicker('02', 'How it’s built')}
      ${intro}
    </div>
    <ul class="build__points">
      ${points.map((pt) => `<li class="build__point" data-reveal>${pt.replace(/<h3[^>]*>/, '<h3 class="build__title">')}</li>`).join('\n      ')}
    </ul>
    <div class="build__foot" data-reveal>
      ${more.replace('<p>', '<p class="build__more">')}
      <div class="actions">${button(ctx, fm.heroSecondaryLabel, fm.heroSecondaryHref, 'primary')}</div>
    </div>
  </div>
</section>`;
  }

  const caps = `<section class="caps" aria-labelledby="caps-title">
  <div class="wrap">
    <div class="section-head section-head--split" data-reveal>
      ${kicker('03', 'Capabilities')}
      ${sections.capabilities.replace('<h2 id="what-i-do">', '<h2 id="caps-title" class="section-title">')}
    </div>
    <ol class="caps__list">
      ${capabilities.map((c, i) => `<li class="cap${c.id === 'google-business-profile' ? ' cap--gbp' : ''}" data-reveal>
        <span class="cap__num" aria-hidden="true">${pad(i + 1)}</span>
        <h3 class="cap__title"><a href="${ctx.url('/services/#' + c.id)}">${esc(c.title)}</a></h3>
        <p class="cap__summary">${inline(c.fields.Summary, ctx)}</p>
        <span class="cap__arrow" aria-hidden="true"><svg viewBox="0 0 20 20" width="22" height="22"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>
      </li>`).join('\n      ')}
    </ol>
    <p class="caps__also" data-reveal><span>Also</span> Website care plans, hosting oversight, and ongoing updates after launch. <a href="${ctx.url('/services/#care')}">About site care</a></p>
  </div>
</section>`;

  const process = `<section class="process" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head section-head--split" data-reveal>
      ${kicker('04', 'Process')}
      ${sections.process.replace('<h2 id="how-we-ll-work-together">', '<h2 id="process-title" class="section-title">')}
    </div>
    ${processTimeline(ctx, steps)}
    <p class="process__more">${button(ctx, 'See the full process', '/process/', 'ghost')}</p>
  </div>
</section>`;

  const name = `<section class="name" aria-labelledby="name-title">
  <div class="wrap name__inner">
    <div class="name__mark" aria-hidden="true" data-reveal><span class="name__419">419</span><span class="name__cite">Philippians 4:19</span></div>
    <div class="name__text prose" data-reveal>
      ${kicker('05', 'The name')}
      ${sections.name.replace('<h2 id="about-the-name">', '<h2 id="name-title" class="section-title">')}
      <p><a class="text-link" href="${ctx.url('/about/#the-name')}">Read the full story</a></p>
    </div>
  </div>
</section>`;

  const contactText = sections.contact.replace(/<h2[^>]*>.*?<\/h2>/, '').replace(/^<p>|<\/p>$/g, '').trim();
  const cta = ctaBand(ctx, { text: contactText.replace(/<\/?p>/g, ' ') });

  return hero + work + build + caps + process + name + cta;
}

/* ---------------------------------------------------------------------------
   WORK index
--------------------------------------------------------------------------- */
export function workGrid(ctx, projects) {
  return `<section class="work-grid-section" aria-label="Projects">
  <div class="wrap">
    <ol class="work-grid">
    ${projects.map((p, i) => {
      const desk = p.screenshots.find((s) => s.device === 'desktop');
      const mob = p.screenshots.find((s) => s.device === 'mobile');
      const lead = i === 0;
      const titleId = `proj-${p.slug}`;
      return `<li class="work-card${lead ? ' work-card--lead' : ''}" style="${projectVars(p)}" data-reveal>
        <div class="work-card__stage">
          ${desk ? device(ctx, p, desk, { className: 'work-card__desk', sizes: lead ? '(min-width: 1100px) 55vw, 92vw' : '(min-width: 900px) 40vw, 92vw' }) : ''}
          ${mob ? device(ctx, p, mob, { className: 'work-card__phone', sizes: '(min-width: 900px) 12vw, 30vw' }) : ''}
        </div>
        <div class="work-card__info">
          <p class="work-card__num">${pad(i + 1)}</p>
          <h2 class="work-card__name" id="${titleId}">${esc(p.name)}</h2>
          <p class="work-card__meta">${esc(p.industry)}${p.location ? ` · ${esc(p.location)}` : ''}</p>
          ${statusChip(p)}
          <p class="work-card__summary">${esc(p.summary)}</p>
          <p class="work-card__links">${p.caseStudy ? button(ctx, 'Read the case study', `/work/${p.slug}/`, 'project', ` aria-describedby="${titleId}"`) : ''}${externalLink(p.previewUrl, 'Visit the preview', 'link-ext link-ext--project')}</p>
        </div>
      </li>`;
    }).join('\n    ')}
    </ol>
  </div>
</section>`;
}

/* ---------------------------------------------------------------------------
   CASE STUDY
--------------------------------------------------------------------------- */
export function caseStudy(ctx, { project: p, fm, chapters, next }) {
  const lead = p.screenshots.find((s) => s.id === 'home-desktop');
  const nav = chapters.map((c) => `<li><a href="#${c.id}">${esc(c.title)}</a></li>`).join('');
  return `<article class="case" style="${projectVars(p)}">
  <header class="case-hero">
    <div class="wrap case-hero__inner">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${ctx.url('/work/')}">Work</a></li><li><span aria-current="page">${esc(p.shortName)}</span></li></ol></nav>
      <p class="case-hero__client">${esc(p.name)}</p>
      <h1 class="case-hero__title">${inline(fm.h1, ctx)}</h1>
      <p class="case-hero__intro">${inline(fm.intro, ctx)}</p>
      <dl class="glance">
        <div><dt>Industry</dt><dd>${esc(p.industry)}</dd></div>
        ${p.location ? `<div><dt>Location</dt><dd>${esc(p.location)}</dd></div>` : ''}
        <div><dt>Status</dt><dd>${statusChip(p)}<span class="glance__note">${esc(p.statusNote)}</span></dd></div>
        <div><dt>What I did</dt><dd>${esc(p.tags.join(', '))}</dd></div>
        <div><dt>Preview</dt><dd>${externalLink(p.previewUrl, 'Visit the preview', 'link-ext link-ext--project')}</dd></div>
      </dl>
    </div>
    ${lead ? `<div class="wrap case-hero__shot">${device(ctx, p, lead, { eager: true, sizes: '(min-width: 1200px) 1100px, 94vw' })}</div>` : ''}
  </header>
  <div class="case-body">
    <div class="wrap case-body__inner">
      <nav class="case-toc" aria-label="In this case study"><p class="case-toc__label">In this case study</p><ol>${nav}</ol></nav>
      <div class="case-chapters">
        ${chapters.map((c) => `<section class="case-chapter" id="${c.id}" aria-labelledby="${c.id}-title"><h2 id="${c.id}-title" data-reveal>${inline(c.title, ctx)}</h2><div class="prose">${c.html}</div></section>`).join('\n')}
      </div>
    </div>
  </div>
  <nav class="case-next" aria-label="More work">
    <div class="wrap case-next__inner">
      <a class="case-next__link" href="${ctx.url(`/work/${next.slug}/`)}"><span class="case-next__label">Next case study</span><span class="case-next__name">${esc(next.name)}</span></a>
      <a class="text-link" href="${ctx.url('/work/')}">All work</a>
    </div>
  </nav>
</article>`;
}
