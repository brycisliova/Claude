// Reusable page components: photo slots, the constellation motif, section heads, marquee.
import { readFileSync } from "node:fs";
import { esc, icon, PAGES } from "./layout.mjs";
import { SLOT } from "./data/photo-slots.mjs";

const MANIFEST = JSON.parse(readFileSync(new URL("./data/photos.json", import.meta.url), "utf8"));
export const hasPhotos = () => Object.keys(MANIFEST).length > 0;
export const photoManifest = () => MANIFEST;
export const hasPhoto = (id) => !!MANIFEST[id];

// ---- seeded constellation (the site's visual motif: points that connect) ----
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const FLAG = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"];

export function constellation(seed, ratio = 1.5, n = 12) {
  const r = rng(seed), H = 100, W = Math.round(100 * ratio);
  const pts = [];
  for (let tries = 0; pts.length < n && tries < 400; tries++) {
    const p = [6 + r() * (W - 12), 6 + r() * (H - 12)];
    if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 15)) pts.push(p);
  }
  const edges = new Set();
  pts.forEach((p, i) => {
    pts.map((q, j) => [j, Math.hypot(q[0] - p[0], q[1] - p[1])]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 2)
      .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const lines = [...edges].map((e) => { const [a, b] = e.split("-").map(Number); return `<line x1="${pts[a][0].toFixed(1)}" y1="${pts[a][1].toFixed(1)}" x2="${pts[b][0].toFixed(1)}" y2="${pts[b][1].toFixed(1)}" vector-effect="non-scaling-stroke"/>`; }).join("");
  const dots = pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i < 6 ? 0.62 : 0.3}" ${i < 6 ? `fill="${FLAG[i]}"` : 'fill="#0E0E10"'}/>`).join("");
  return `<svg class="constel" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g stroke="#0E0E10" stroke-width="1" stroke-opacity=".34" fill="none">${lines}</g>${dots}</svg>`;
}

// ---- photograph slot ----
// With an entry in photos.json: a responsive, lazy-loaded, credited photograph.
// Without one: a designed colour field with the constellation motif (decorative, hidden from assistive tech).
export function photo(ctx, id, o = {}) {
  const slot = SLOT[id], m = MANIFEST[id];
  const ratio = o.ratio ?? (m ? m.w / m.h : slot?.ratio ?? 1.5);
  const c = o.c || slot?.c || "pink";
  const cls = `ph${o.class ? " " + o.class : ""}`;
  const st = o.static ? " data-static" : "";
  if (!m) return `<figure class="${cls} ph--empty"${st} style="--ar:${ratio.toFixed(3)};--c:var(--${c})" aria-hidden="true">${constellation(id, ratio)}</figure>`;
  const srcset = m.sizes.map((w) => `${ctx.base}assets/img/photos/${m.file}-${w}.webp ${w}w`).join(", ");
  const src = `${ctx.base}assets/img/photos/${m.file}-${m.sizes[Math.min(1, m.sizes.length - 1)]}.webp`;
  const eager = o.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<figure class="${cls} ph--photo"${st} style="--ar:${ratio.toFixed(3)};--bg-photo:${m.color || "#999"}"><div class="ph-in"><img src="${src}" srcset="${srcset}" sizes="${o.sizes || "100vw"}" width="${m.w}" height="${m.h}" alt="${esc(m.alt || "")}" ${eager} decoding="async"></div>${o.credit === false ? "" : `<figcaption class="credit"><a href="${esc(m.pageUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(m.license)}">${esc(m.author)} · ${esc(m.source)}</a></figcaption>`}</figure>`;
}

// ---- section scaffolding ----
// Section numbers (01, 02 ...) come from a CSS counter, so templates never number by hand.
export const head = (label, title, lede = "") =>
  `<header class="sec-head"><p class="label reveal"><span class="no"></span>${label}</p><div class="sec-head-main"><h2 class="sec-title" data-split>${title}</h2>${lede ? `<p class="sec-lede reveal">${lede}</p>` : ""}</div></header>`;
export const sectionHead = head;

// Page hero: pastel colour block, huge title, wide photo band underneath.
export function hero(ctx, { eyebrow, title, lede, accent, extra = "" }) {
  const meta = PAGES[ctx.slug] || [];
  const c = accent || meta[3] || "pink";
  return `<header class="phero block" style="--c:var(--${c})">
  <div class="phero-grid">
    <div class="phero-meta"><span class="label"><span class="no">${meta[5] || "00"}</span>${meta[6] || ""}</span><span class="label">${eyebrow}</span></div>
    <h1 class="phero-title" data-split>${title}</h1>
    <div class="phero-foot">${lede ? `<p class="phero-lede reveal">${lede}</p>` : ""}${extra}</div>
  </div>
  <div class="phero-img" data-tone="${MANIFEST["hero-" + ctx.slug] ? "dark" : "light"}">${photo(ctx, "hero-" + ctx.slug, { class: "ph--band", eager: true })}</div>
</header>`;
}

export const marquee = (items, cls = "") =>
  `<div class="marquee ${cls}" aria-hidden="true"><div class="marquee-track">${[...items, ...items, ...items, ...items].map((t) => `<span>${esc(t)}</span><i></i>`).join("")}</div></div>`;

export const arrowBtn = (href, label, cls = "") =>
  `<a class="btn ${cls}" href="${esc(href)}" data-magnetic><span class="btn-t">${label}</span><span class="btn-i">${icon("arrow", 18)}</span></a>`;

export const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;

// ---- YouTube players ----
// media.json maps a title to a YouTube link or id. A player is a button that loads the privacy-enhanced embed
// only when pressed. The preview picture is the video's own thumbnail from YouTube's image server.
const MEDIA = JSON.parse(readFileSync(new URL("./data/media.json", import.meta.url), "utf8"));
export function ytId(v) {
  const m = String(v || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : /^[A-Za-z0-9_-]{11}$/.test(String(v || "")) ? String(v) : null;
}
export const mediaId = (kind, title) => ytId(MEDIA[kind]?.[title]);
export function player(id, title, o = {}) {
  return `<div class="yt${o.class ? " " + o.class : ""}"><button class="yt-btn" type="button" data-yt="${id}" data-title="${esc(title)}" aria-label="Play: ${esc(title)}"><img class="yt-img" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="270" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="yt-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="yt-t">${esc(title)}</span></button></div>`;
}
