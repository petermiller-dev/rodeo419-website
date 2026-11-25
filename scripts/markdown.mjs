// Tiny, dependency-free Markdown renderer (adapted from the Doctor-Rainey site).
// Supports: front matter, headings (with ids), paragraphs, emphasis, links,
// unordered/ordered lists, blockquotes, horizontal rules, and a few
// site-specific directives:
//
//   ::: note | pending | callout        → styled aside (closed by :::)
//   {{image: slot-id}}                  → photo slot from content/images.json
//   {{shot: shot-id}}                   → portfolio screenshot (case studies)
//   {{shot: project/shot-id}}           → another project's screenshot (Insights)
//   {{pending: text to be supplied}}    → inline "needs approval" marker
//                                         (shown only while previewMode is on)
//
// Everything is intentionally small and readable so non-developers can
// follow what happens to their content.

export function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let currentKey = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const listItem = raw.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(coerce(listItem[1]));
      continue;
    }
    const kv = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      data[currentKey] = kv[2] === '' ? [] : coerce(kv[2]);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

function coerce(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

export const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const slugify = (s) =>
  String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function inline(text, ctx = {}) {
  let out = escapeHtml(text);
  // pending markers
  out = out.replace(/\{\{pending:\s*([^}]+)\}\}/g, (_, t) =>
    ctx.previewMode === false ? '' : `<span class="pending"><span class="visually-hidden">Pending: </span>${t.trim()}</span>`);
  // links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const h = href.replace(/&amp;/g, '&');
    const external = /^https?:\/\//.test(h);
    const finalHref = ctx.url ? ctx.url(h) : h;
    return external
      ? `<a href="${escapeHtml(finalHref)}" rel="noopener" target="_blank">${label}<span class="visually-hidden"> (opens in a new tab)</span></a>`
      : `<a href="${escapeHtml(finalHref)}">${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/ -- /g, ' &mdash; ');
  return out;
}

export function renderMarkdown(src, ctx = {}) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const headings = [];
  let i = 0;

  const flushPara = (buf) => {
    if (!buf.length) return;
    const text = buf.join(' ').trim();
    const dir = text.match(/^\{\{(image|shot):\s*([a-z0-9/-]+)\s*\}\}$/);
    if (dir) html.push(ctx.directive ? ctx.directive(dir[1], dir[2]) : '');
    else html.push(`<p>${inline(text, ctx)}</p>`);
    buf.length = 0;
  };

  let para = [];
  while (i < lines.length) {
    const line = lines[i];

    if (/^:::\s*(\w[\w-]*)(.*)$/.test(line)) {
      flushPara(para);
      const [, kind, rest] = line.match(/^:::\s*(\w[\w-]*)(.*)$/);
      const inner = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) inner.push(lines[i++]);
      i++;
      if (kind === 'pending' && ctx.previewMode === false) continue;
      const body = renderMarkdown(inner.join('\n'), ctx).html;
      const label = rest.trim();
      html.push(
        `<aside class="callout callout--${kind}">${label ? `<p class="callout__label">${inline(label, ctx)}</p>` : ''}${body}</aside>`
      );
      continue;
    }

    const h = line.match(/^(#{2,4})\s+(.*?)(?:\s+\{#([a-z0-9-]+)\})?\s*$/);
    if (h) {
      flushPara(para);
      const level = h[1].length;
      const id = h[3] || slugify(h[2]);
      headings.push({ level, id, text: h[2] });
      html.push(`<h${level} id="${id}">${inline(h[2], ctx)}</h${level}>`);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      flushPara(para);
      html.push('<hr>');
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushPara(para);
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderMarkdown(q.join('\n'), ctx).html}</blockquote>`);
      continue;
    }

    const ul = /^\s*[-*]\s+/;
    const ol = /^\s*\d+\.\s+/;
    if (ul.test(line) || ol.test(line)) {
      flushPara(para);
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (re.test(lines[i])) items.push(lines[i].replace(re, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</${tag}>`);
      continue;
    }

    if (/^<[a-z!]/i.test(line.trim())) {
      // raw HTML block (used sparingly)
      flushPara(para);
      const block = [];
      while (i < lines.length && lines[i].trim() !== '') block.push(lines[i++]);
      html.push(block.join('\n'));
      continue;
    }

    if (line.trim() === '') {
      flushPara(para);
      i++;
      continue;
    }
    para.push(line);
    i++;
  }
  flushPara(para);
  return { html: html.join('\n'), headings };
}
