# Rodeo 419 Marketing: Website

Website for **Rodeo 419 Marketing**, a Fort Worth–area web design and local search business.

A fast static site with no frameworks and no runtime dependencies. Every page's text lives in a Markdown file under `content/`. A small Node build script turns it into plain HTML with shared templates, and GitHub Actions publishes the result to GitHub Pages. The setup follows the Doctor-Rainey site.

> **Status: preview.** `previewMode` is `true` in `content/site.json`. While it's on, every page carries `<meta name="robots" content="noindex">`, crawling is allowed (so search engines can read that directive), a slim "Preview draft" bar sits at the top, and anything awaiting approval shows as a highlighted ◇ note. **Turning preview mode off, indexing, or adding a custom domain needs the owner's explicit approval.**

- **Preview:** https://petermiller-dev.github.io/rodeo419-website/
- **Open decisions:** [`REVIEW-CHECKLIST.md`](REVIEW-CHECKLIST.md)
- **Photo slots and image prompts:** [`PHOTO-GUIDE.md`](PHOTO-GUIDE.md)

---

## Structure

```
content/                     ← EDIT TEXT HERE
  site.json                  Name, URL, preview flag, contact details + "verified" flags, navigation
  images.json                Every photo slot: file names, sizes, focal points, alt text
  work.json                  Portfolio projects: status labels, colors, preview URLs, screenshots
  pages/home.md              Homepage (hero in front matter; sections split by <!-- section: name -->)
  pages/services.md          Services (one "## " section per service)
  pages/process.md           Process (one "## " section per step)
  pages/about.md, contact.md, privacy.md, work.md, 404.md
  work/<project>.md          One file per case study (matches a slug in work.json)
  pages/insights.md          Insights landing page (front matter only)
  insights/<slug>.md         One file per Insights article (the slug is the URL)
assets/
  css/main.css               All styles. Colors, fonts and spacing are tokens at the top.
  js/main.js                 Menu, reveals, hero drift, work sequence, process line (optional)
  fonts/                     Self-hosted fonts (no requests to Google)
  images/                    Photos, screenshots, favicon, social image
scripts/
  build.mjs                  content/ → _site/
  templates.mjs              Shared layout, header, footer, page compositions
  markdown.mjs               Tiny Markdown renderer
  placeholders.mjs           Tonal placeholder images for photo slots without a photo
  covers.mjs                 Small decorative SVG covers for Insights articles
  check.mjs                  Links, anchors, headings, titles, alt text, noindex, privacy checks
  serve.mjs                  Local server that mimics the GitHub Pages subpath
tools/                       Optional helpers (need Playwright; not part of the build)
  capture-screenshots.mjs    Re-captures portfolio screenshots from the live previews
  make-og.mjs                Re-renders the 1200×630 social sharing image
.github/workflows/pages.yml  Build → check → publish on every push to main
```

`_site/` is generated and not committed.

## Run it locally

Requires **Node 18+**. Nothing to install.

```bash
node scripts/build.mjs
```

```bash
node scripts/check.mjs
```

```bash
node scripts/serve.mjs
```

Then open http://localhost:4000/rodeo419-website/. The local server uses the same subpath as GitHub Pages, so what works locally works live.

## Editing text

Open the Markdown file for the page, edit, rebuild (or just push).

- **Front matter** (between the `---` lines): `title` (browser tab and search result title, unique per page), `description` (meta description, 50–160 characters), `eyebrow`, `h1`, `intro`.
- **Formatting:** standard Markdown: `## Heading`, `**bold**`, `*italic*`, `[link](/services/)`, lists, `> quotes`. Write internal links from the site root (`/work/dr-rainey/`); the build makes them work under any subpath.
- **Sections:** on Services, Process, About, Contact and Privacy, each `## Heading {#anchor-id}` becomes a numbered section. Keep the `{#id}` stable, because other pages link to it.
- **Section fields:** lines right under a heading such as `Summary: …` are fields, not body text.
  - `Summary:` the short line used on the homepage (capabilities and process steps)
  - `Home: yes` shows a service in the homepage capabilities list
  - `Label:` the short name in the Services jump menu
  - `Your part:` (Process only) shows as "Where you come in"
- **Callouts:** wrap a list in `::: gets What you get` … `:::` and `::: when When it's useful` … `:::`. A pair sits side by side.
- **Pending note:** `{{pending: text}}` shows a highlighted "awaiting approval" note in preview and disappears in production.
- **Photo:** a line with only `{{image: slot-id}}` places a photo slot; `{{band: slot-id}}` between sections places a full-width band.
- **Screenshot** (case studies only): `{{shot: home-desktop}}`, using shot ids from `content/work.json`.
- **Homepage:** the hero is in front matter. Body sections are marked `<!-- section: work -->`, `build`, `capabilities`, `process`, `name`, `contact`. In `build` ("Custom-coded websites built to load fast"), the `## ` heading and first paragraph form the section head, each `### ` point becomes a column, and the closing paragraph of links sits above the inquiry button. The capability rows come from `services.md` and the process steps from `process.md`, so each is written once.
- **Process page closing section:** everything after `<!-- section: foundation -->` in `process.md` is "A better foundation", shown below the six steps (it is not a step). Start it with `## Heading {#foundation}`, an `Eyebrow:` line, the introduction, then one `### ` heading per point.

### Portfolio

`content/work.json` drives the homepage sequence, the Work grid, and case-study headers.

- `featured: 1`, `2`, `3` set the homepage order; `0` means Work page only.
- `published: false` hides a project everywhere (Charted Course is hidden for now).
- `status` / `statusNote` are the labels visitors see. Keep them accurate: Preview, Concept, In progress, Launched.
- `colors` theme each project's panel and case study (`bg`, `ink` for text on `bg`, `accent`).
- `caseStudy: true` needs a matching `content/work/<slug>.md`.

### Insights (articles)

Each article is one Markdown file in `content/insights/`. The file name is the URL: `who-owns-your-website.md` → `/insights/who-owns-your-website/`. Publishing is the same as any other edit: push to `main`. The landing page, related links, sitemap, and structured data update automatically.

Front matter:

- `title` (browser tab and search result), `description` (50–160 characters), `h1`, `dek` (the standfirst under the headline)
- `topic` (e.g. Ownership), `number` (the issue number shown on the cover)
- `published` and optional `updated`, as `YYYY-MM-DD`. `updated` drives the sitemap date and the "Updated" line.
- `cover` (`fence`, `rings`, or `wind`) and `coverTone` (`saddle`, `ink`, or `rust`)
- `takeaways`: a short list shown as "The short version"
- `related`: other article slugs (defaults to the newest others)
- `work`: case studies to link, one per line as `slug#anchor | why it's relevant`
- `draft: true` keeps an article off the site and out of the sitemap

In the body, use `## Heading {#id}` for sections (they form the "In this article" list), `::: note` for a callout, and `{{shot: project/shot-id}}` to show a portfolio screenshot. End with `## Sources {#sources}` as a numbered list, and link every factual claim to its source. Quote sources exactly, and say where the evidence stops.

### Contact details

In `content/site.json` → `contact`, fill in the email and phone, then set the matching `verified` flag to `true`. Until then the Contact page shows "coming soon" with a pending note. Once verified, it shows a `mailto:` link (with a prefilled subject and prompts) and a tap-to-call link, and the details are added to structured data. Only verified facts ever reach structured data.

## Changing colors and fonts

All colors are CSS custom properties at the top of `assets/css/main.css`: palette first (`--cream`, `--saddle`, `--ink`, `--rust`…), then roles (`--bg`, `--text`, `--muted`, `--focus`). Change a hex value and rebuild. Check contrast if you darken `--rust` or lighten `--ink-soft`; both are currently above 4.5:1 on cream.

Fonts are self-hosted in `assets/fonts/` (all SIL Open Font License): **Big Shoulders Display** for headlines and the wordmark, **Public Sans** for body text, and **Instrument Serif** italic for emphasis such as "Fort Worth" in the hero. To swap one, replace the `.woff2` file, update its `@font-face` rule, and update `--font-display`, `--font-body`, or `--font-serif`.

## Replacing images and screenshots

- **Photos:** see [`PHOTO-GUIDE.md`](PHOTO-GUIDE.md). Save the photo at the path listed for its slot and rebuild. The tonal placeholder, its label, and its guides disappear; the frame, crop, and motion stay. Crop focal points (`focal`) and alt text are in `content/images.json`. Separate phone crops are supported.
- **Screenshots:** `node tools/capture-screenshots.mjs [slug]` re-captures from each project's live preview. To add a shot, add an entry to that project's `screenshots` in `content/work.json`, capture, then place it in a case study with `{{shot: id}}`.
- **Social image:** `node tools/make-og.mjs` after changing the hero.

## Motion and accessibility

- **Hero:** the image (or placeholder) does a slow 14-second push-in and drifts up to 48px while scrolling. The motion stays inside the frame; the headline lines rise once, in under a second. Two faint, warm dust layers (`.hero__dust`, pure CSS) drift sideways over the arena dirt and fade in gusts at different speeds. A one-time first gust (`.hero__dust::after`) rolls over the open dirt on the right about 2 seconds after load, so the effect reads right away. They sit above the photo's shade but below the stitch border and headline, ignore taps and clicks, are quieter on phones, and stand still for reduced motion.
- **Featured work:** each project gets its own panel in its own colors. On large screens the panel is about 1¾ screens tall and its contents stay pinned (`position: sticky`) while the desktop screenshot settles and the phone rises, giving visitors time to look. Normal scrolling throughout; no scroll hijacking.
- **Process:** a rust line grows with scroll and each step lights up as the line reaches it. Horizontal on wide screens, a vertical rail on phones.
- All motion uses `transform` and `opacity`. **`prefers-reduced-motion`** shows the final composition with no movement.
- **Without JavaScript:** everything is visible, the navigation shows as plain links, and the final compositions are shown. If the script fails, a 2.5-second fallback reveals all content.
- Skip link, visible focus styles, one `<h1>` per page, semantic landmarks, keyboard-operable mobile menu (Escape closes it, focus stays inside while open), and alt text on all informative images. `scripts/check.mjs` enforces the checkable parts.

## Publishing

Every push to `main` runs `.github/workflows/pages.yml`: build → check → publish `_site/` to the `gh-pages` branch, the same approach as the Doctor-Rainey site. GitHub Pages serves that branch.

**One-time setup:** repository **Settings → Pages → Build and deployment → Deploy from a branch → `gh-pages` / `(root)`**. Never edit `gh-pages` by hand; every publish overwrites it.

### Going live (only with approval)

1. Choose the domain and point its DNS at GitHub Pages (Settings → Pages shows the records).
2. In `content/site.json`, set `customDomain` (for example `"rodeo419.com"`) and change `siteUrl` to `https://rodeo419.com`. The build writes the `CNAME` file GitHub Pages needs, so the domain survives each publish.
3. Set `previewMode` to `false`. This removes `noindex`, the preview bar, and pending notes.
4. Push, then submit the sitemap in Google Search Console.

`robots.txt` is only honored at a domain's root, so it takes effect once the site is on its own domain. On the GitHub Pages subpath, the per-page `noindex` tag is what keeps the preview out of search results.

## Privacy rules for this site

- No analytics, trackers, cookies, forms, embedded maps or videos, or third-party fonts and scripts. `scripts/check.mjs` fails the build if a page loads a third-party script, stylesheet, iframe, or form.
- If any of that changes, update `content/pages/privacy.md` first.
- Never invent testimonials, results, credentials, or client claims. Never present stock or generated people as the owner or a client.
