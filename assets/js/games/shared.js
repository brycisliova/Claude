// Shared helpers for the games: the registry, pointer maths, and a small progress store kept in the browser.
import { $, $$, h, esc, fit as coreFit, reduce, store, coarse } from "../core.js";
export { $, $$, h, esc, reduce, coarse };
// Heavy canvases draw at a lower pixel density on touch screens, where fill rate is the bottleneck.
export const fit = (c, cap) => coreFit(c, cap ?? (coarse ? 1.25 : 2));
// Pre-draw something once and reuse it with drawImage, which is far cheaper than a gradient every frame.
const SP = new Map();
export function sprite(key, w, h, draw) { let s = SP.get(key); if (!s) { s = document.createElement("canvas"); s.width = w; s.height = h; draw(s.getContext("2d"), w, h); SP.set(key, s); } return s; }
export const glow = (key, r, rgb) => sprite("glow" + key, r * 2, r * 2, (x) => { const g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, `rgba(${rgb},.95)`); g.addColorStop(0.35, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2); });

export const REG = new Map();
// game(id, bodyHtml, init): init() builds behaviour inside the opened game and may return
// { frame(), resize(), key(event), destroy() }.
export const game = (id, body, init) => REG.set(id, { id, body, init });
export const pos = (c, e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
export const B = "btn btn-ghost btn-sm";
export const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const rnd = (n) => Math.floor(Math.random() * n);

/* ---- progress (localStorage only; the privacy page can wipe it) ---- */
const KEY = "wwa-games";
const read = () => store(KEY) || { plays: {}, best: {} };
let current = null;
export const setCurrent = (id) => { current = id; };
export const progress = () => read();
export function countPlay(id) { const d = read(); d.plays[id] = (d.plays[id] || 0) + 1; store(KEY, d); return d; }
// Record a score for the open game. low: smaller is better (moves, seconds). Returns true when it is a new best.
export function report(value, opts = {}) {
  if (current == null || !Number.isFinite(value)) return false;
  const d = read(), old = d.best[current];
  const better = old == null || (opts.low ? value < old : value > old);
  if (better) { d.best[current] = value; store(KEY, d); }
  document.dispatchEvent(new CustomEvent("game:score", { detail: { id: current, value, best: better ? value : old, isBest: better && old != null } }));
  return better;
}

// Save a canvas (over a background colour) as a PNG the player keeps on their own device.
export function savePng(c, bg, name = "my-picture") {
  bg = bg || getComputedStyle(c).backgroundColor || "#ffffff";
  const t = document.createElement("canvas"); t.width = c.width; t.height = c.height;
  const g = t.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, t.width, t.height); g.drawImage(c, 0, 0);
  t.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, "image/png");
}
