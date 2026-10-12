// Shared helpers for the games: the registry, pointer maths, and a small progress store kept in the browser.
import { $, h, esc, fit, reduce, store } from "../core.js";
export { $, h, esc, fit, reduce };

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
