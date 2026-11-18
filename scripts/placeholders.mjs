// Tonal placeholder compositions for photo slots that don't have a photo yet.
// Each one is a simple SVG at the slot's final aspect ratio that shows where
// the land or arena, the light, and the darker text-safe area will sit, so the
// layout and motion can be judged before final photography exists.
//
// The build writes them to _site/assets/images/placeholders/<slot>-<crop>.svg.
// They disappear automatically once a real photo is saved for the slot.

const pct = (v) => parseFloat(v) / 100;
const focalXY = (focal = '50% 50%') => focal.split(/\s+/).map(pct);

const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;

/** Golden-hour arena: grandstand, light towers, fence rails, raked dirt. */
function arena(w, h, focal) {
  const [fx, fy] = focalXY(focal);
  const hz = fy * h; // horizon / top of the arena floor
  const sunX = fx * w, sunY = hz - h * 0.06;
  const posts = [];
  const step = w / 11;
  for (let i = -1; i < 13; i++) posts.push(`<rect x="${(i * step).toFixed(1)}" y="${(hz + h * 0.05).toFixed(1)}" width="${(w * 0.006).toFixed(1)}" height="${(h * 0.16).toFixed(1)}"/>`);
  const towers = [0.12, 0.34, 0.86].map((t) => {
    const x = t * w, top = hz - h * 0.34;
    return `<g opacity=".75"><rect x="${x - w * 0.002}" y="${top}" width="${w * 0.004}" height="${h * 0.3}" fill="#2b1a10"/><rect x="${x - w * 0.018}" y="${top - h * 0.012}" width="${w * 0.036}" height="${h * 0.02}" fill="#3a2416"/><circle cx="${x}" cy="${top - h * 0.002}" r="${w * 0.03}" fill="url(#lamp)"/></g>`;
  }).join('');
  return svg(w, h, `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1b13"/><stop offset="${(fy * 0.55).toFixed(2)}" stop-color="#6d4123"/>
      <stop offset="${(fy * 0.9).toFixed(2)}" stop-color="#c98543"/><stop offset="${fy.toFixed(2)}" stop-color="#e9b26a"/>
    </linearGradient>
    <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9a6436"/><stop offset=".45" stop-color="#5d3a20"/><stop offset="1" stop-color="#1d130d"/>
    </linearGradient>
    <radialGradient id="sun" cx="${sunX}" cy="${sunY}" r="${w * 0.42}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff1cf" stop-opacity=".95"/><stop offset=".18" stop-color="#f6c77c" stop-opacity=".65"/><stop offset="1" stop-color="#f6c77c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lamp"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient>
    <linearGradient id="shadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#140e0a" stop-opacity=".55"/><stop offset=".55" stop-color="#140e0a" stop-opacity="0"/></linearGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sun)"/>
    ${towers}
    <path d="M0 ${hz - h * 0.07} L${w * 0.28} ${hz - h * 0.1} L${w * 0.5} ${hz - h * 0.085} L${w * 0.62} ${hz - h * 0.04} L${w} ${hz - h * 0.08} L${w} ${hz} L0 ${hz} Z" fill="#3b2416" opacity=".9"/>
    <rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#dirt)"/>
    <ellipse cx="${sunX}" cy="${hz + h * 0.02}" rx="${w * 0.32}" ry="${h * 0.035}" fill="#f2c27a" opacity=".16"/>
    <g fill="#1a110c" opacity=".9">${posts.join('')}</g>
    <g stroke="#1a110c" stroke-width="${(h * 0.007).toFixed(1)}" opacity=".9">
      <line x1="0" x2="${w}" y1="${hz + h * 0.07}" y2="${hz + h * 0.07}"/>
      <line x1="0" x2="${w}" y1="${hz + h * 0.12}" y2="${hz + h * 0.12}"/>
      <line x1="0" x2="${w}" y1="${hz + h * 0.17}" y2="${hz + h * 0.17}"/>
    </g>
    <rect width="${w}" height="${h}" fill="url(#shadeL)"/>`);
}

/** Open Texas land with a receding fence line and a single tree. */
function land(w, h, focal) {
  const [fx, fy] = focalXY(focal);
  const hz = fy * h;
  const posts = [];
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const x = w * (0.02 + t * 0.62);
    const y = hz + h * (0.36 - t * 0.33);
    const ph = h * (0.22 - t * 0.19);
    posts.push(`<rect x="${x.toFixed(1)}" y="${(y - ph).toFixed(1)}" width="${(w * (0.008 - t * 0.006)).toFixed(1)}" height="${ph.toFixed(1)}"/>`);
  }
  return svg(w, h, `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b98c"/><stop offset="${fy}" stop-color="#f3d9a4"/></linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7834f"/><stop offset="1" stop-color="#4a3018"/></linearGradient>
    <radialGradient id="sun" cx="${fx * w}" cy="${hz - h * 0.05}" r="${w * 0.4}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff3d6" stop-opacity=".9"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#sky)"/><rect width="${w}" height="${h}" fill="url(#sun)"/>
    <path d="M0 ${hz} C ${w * 0.3} ${hz - h * 0.03}, ${w * 0.6} ${hz + h * 0.02}, ${w} ${hz - h * 0.01} L${w} ${h} L0 ${h} Z" fill="url(#grass)"/>
    <g fill="#3a2414" opacity=".85"><ellipse cx="${w * 0.82}" cy="${hz - h * 0.1}" rx="${w * 0.07}" ry="${h * 0.08}"/><rect x="${w * 0.817}" y="${hz - h * 0.06}" width="${w * 0.006}" height="${h * 0.07}"/></g>
    <g fill="#2a1a0e">${posts.join('')}</g>
    <g stroke="#2a1a0e" stroke-width="${(h * 0.003).toFixed(1)}" opacity=".7"><line x1="${w * 0.02}" y1="${hz + h * 0.2}" x2="${w * 0.64}" y2="${hz - h * 0.0}"/><line x1="${w * 0.02}" y1="${hz + h * 0.27}" x2="${w * 0.64}" y2="${hz + h * 0.015}"/></g>`);
}

/** Head-and-shoulders portrait with warm window light from the right. */
function portrait(w, h, focal) {
  const [fx, fy] = focalXY(focal);
  const cx = fx * w, cy = fy * h;
  return svg(w, h, `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#c79a63"/></linearGradient>
    <radialGradient id="light" cx="${w * 0.85}" cy="${h * 0.2}" r="${w * 0.9}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f6dcae" stop-opacity=".7"/><stop offset="1" stop-color="#f6dcae" stop-opacity="0"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#bg)"/><rect width="${w}" height="${h}" fill="url(#light)"/>
    <g fill="#2b1b11" opacity=".82">
      <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.15}" ry="${w * 0.19}"/>
      <rect x="${cx - w * 0.06}" y="${cy + w * 0.15}" width="${w * 0.12}" height="${w * 0.1}"/>
      <path d="M${cx - w * 0.44} ${h} C ${cx - w * 0.42} ${cy + w * 0.36}, ${cx - w * 0.2} ${cy + w * 0.27}, ${cx} ${cy + w * 0.27} C ${cx + w * 0.2} ${cy + w * 0.27}, ${cx + w * 0.42} ${cy + w * 0.36}, ${cx + w * 0.44} ${h} Z"/>
    </g>
    <path d="M${cx + w * 0.13} ${cy - w * 0.1} C ${cx + w * 0.17} ${cy}, ${cx + w * 0.15} ${cy + w * 0.1}, ${cx + w * 0.1} ${cy + w * 0.15}" stroke="#f6dcae" stroke-width="${w * 0.006}" fill="none" opacity=".7"/>`);
}

/** A working session: shop counter, laptop, notebook, window light. */
function session(w, h) {
  const top = h * 0.62;
  return svg(w, h, `
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1d7a8"/><stop offset=".5" stop-color="#a77a4a"/><stop offset="1" stop-color="#5a3a22"/></linearGradient>
    <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a26"/><stop offset="1" stop-color="#2a1a0e"/></linearGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#wall)"/>
    <rect x="${w * 0.05}" y="${h * 0.08}" width="${w * 0.2}" height="${h * 0.42}" fill="#fff4dc" opacity=".55"/>
    <rect y="${top}" width="${w}" height="${h - top}" fill="url(#counter)"/>
    <path d="M${w * 0.38} ${top - h * 0.02} L${w * 0.41} ${top - h * 0.3} L${w * 0.68} ${top - h * 0.3} L${w * 0.7} ${top - h * 0.02} Z" fill="#1d1612"/>
    <path d="M${w * 0.42} ${top - h * 0.27} L${w * 0.67} ${top - h * 0.27} L${w * 0.68} ${top - h * 0.05} L${w * 0.41} ${top - h * 0.05} Z" fill="#e9dcc4" opacity=".85"/>
    <rect x="${w * 0.34}" y="${top - h * 0.02}" width="${w * 0.4}" height="${h * 0.025}" fill="#2b2420"/>
    <rect x="${w * 0.12}" y="${top + h * 0.03}" width="${w * 0.17}" height="${h * 0.1}" fill="#efe4cf" transform="rotate(-6 ${w * 0.2} ${top + h * 0.08})"/>
    <ellipse cx="${w * 0.82}" cy="${top + h * 0.02}" rx="${w * 0.035}" ry="${h * 0.015}" fill="#e9dcc4"/>
    <rect x="${w * 0.785}" y="${top - h * 0.08}" width="${w * 0.07}" height="${h * 0.1}" rx="${w * 0.008}" fill="#efe4cf"/>`);
}

/** Arena light towers glowing against a dusk sky. */
function lights(w, h, focal) {
  const [, fy] = focalXY(focal);
  const lampRows = [0.18, 0.5, 0.82].map((t) => {
    const x = t * w, y = fy * h;
    let lamps = '';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) lamps += `<circle cx="${x - w * 0.035 + c * w * 0.0175}" cy="${y + r * h * 0.035}" r="${Math.min(w, h) * 0.009}" fill="#ffeec7"/>`;
    return `<circle cx="${x}" cy="${y + h * 0.02}" r="${Math.max(w, h) * 0.14}" fill="url(#glow)"/><rect x="${x - w * 0.0025}" y="${y + h * 0.06}" width="${w * 0.005}" height="${h}" fill="#140e0a"/>${lamps}`;
  }).join('');
  return svg(w, h, `
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120d0a"/><stop offset=".7" stop-color="#3b2416"/><stop offset="1" stop-color="#6d4123"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#ffd896" stop-opacity=".55"/><stop offset="1" stop-color="#ffd896" stop-opacity="0"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#dusk)"/>${lampRows}<rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="#140e0a" opacity=".8"/>`);
}

const makers = { arena, land, portrait, session, lights };

/** Returns { 'slot-desktop.svg': '<svg…>', 'slot-mobile.svg': … } for every slot. */
export function placeholderFiles(images) {
  const files = {};
  for (const [id, slot] of Object.entries(images)) {
    const make = makers[slot.placeholder] || land;
    for (const crop of ['desktop', 'mobile']) {
      const c = slot[crop];
      if (!c) continue;
      // Draw at a reduced size; SVG scales without loss.
      const scale = 1200 / Math.max(c.width, c.height);
      files[`${id}-${crop}.svg`] = make(Math.round(c.width * scale), Math.round(c.height * scale), c.focal);
    }
  }
  return files;
}
