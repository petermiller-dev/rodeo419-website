// Cover art for Insights articles: small, decorative SVGs drawn at build time
// (no photos to license, nothing to download, a few KB each). Each article
// picks a motif and a ground color in its front matter:
//   cover: fence | rings | wind
//   coverTone: saddle | ink | rust
// The article number and title are real HTML laid over the cover, so the SVG
// carries no text and stays decorative (alt="").

const TONES = {
  saddle: { bg: '#573318', glow: '#7a4a26', line: '#d4ae7b' },
  ink: { bg: '#26201b', glow: '#3a2f27', line: '#d4ae7b' },
  rust: { bg: '#7d2f12', glow: '#a3401c', line: '#f1c27d' },
};

export const COVER_W = 1600;
export const COVER_H = 700;

const r = (n) => Math.round(n * 10) / 10;

// Fence rails running into the distance: ownership, boundaries, what's yours.
function fence(t) {
  const vx = 1480, vy = 300; // vanishing point
  let s = '';
  for (const [y0, w] of [[430, 7], [520, 7], [610, 7]]) s += `<path d="M-20 ${y0} L${vx} ${vy}" stroke="${t.line}" stroke-width="${w}" stroke-linecap="round" opacity="0.5"/>`;
  let x = 60, gap = 300;
  while (x < vx - 30 && gap > 10) {
    const k = (vx - x) / (vx + 20);
    const top = vy + (380 - vy) * k, bot = vy + (650 - vy) * k;
    s += `<path d="M${r(x)} ${r(top)} V${r(bot)}" stroke="${t.line}" stroke-width="${r(4 + 14 * k)}" stroke-linecap="round" opacity="0.62"/>`;
    x += gap; gap *= 0.8;
  }
  return s + `<path d="M0 ${vy + 8} H${COVER_W}" stroke="${t.line}" stroke-width="1.5" opacity="0.35"/>`;
}

// Raked arena rings: routine, recurring care.
function rings(t) {
  let s = '';
  for (let i = 0; i < 26; i++) {
    const rx = 260 + i * 46, ry = 90 + i * 17;
    s += `<ellipse cx="1260" cy="760" rx="${rx}" ry="${ry}" fill="none" stroke="${t.line}" stroke-width="${i % 4 === 0 ? 2.4 : 1.2}" opacity="${r(0.62 - i * 0.017)}"/>`;
  }
  return s;
}

// Wind streaks over a horizon: speed.
function wind(t) {
  let s = `<path d="M0 470 H${COVER_W}" stroke="${t.line}" stroke-width="1.5" opacity="0.4"/>`;
  const rows = [[180, 0.15], [240, 0.42], [300, 0.08], [360, 0.3], [410, 0.55], [530, 0.2], [590, 0.48], [640, 0.1]];
  rows.forEach(([y, off], i) => {
    for (let j = 0; j < 3; j++) {
      const x = ((off + j * 0.37) % 1) * COVER_W;
      const len = 140 + ((i * 97 + j * 53) % 260);
      s += `<path d="M${r(x)} ${y} h${len}" stroke="${t.line}" stroke-width="${i % 3 === 0 ? 3 : 1.6}" stroke-linecap="round" opacity="${r(0.25 + ((i + j) % 4) * 0.12)}"/>`;
    }
  });
  return s;
}

const MOTIFS = { fence, rings, wind };

export function coverSvg(motif = 'rings', tone = 'ink') {
  const t = TONES[tone] || TONES.ink;
  const draw = MOTIFS[motif] || rings;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_W} ${COVER_H}" width="${COVER_W}" height="${COVER_H}" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="g" cx="78%" cy="40%" r="75%"><stop offset="0" stop-color="${t.glow}"/><stop offset="1" stop-color="${t.bg}"/></radialGradient></defs>
<rect width="${COVER_W}" height="${COVER_H}" fill="url(#g)"/>
${draw(t)}
<rect x="18" y="18" width="${COVER_W - 36}" height="${COVER_H - 36}" fill="none" stroke="#f3eadb" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="6 6"/>
</svg>
`;
}
