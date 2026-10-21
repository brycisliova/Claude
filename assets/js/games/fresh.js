// Picks questions you have not seen yet on this device, and remembers what it handed out.
// When a pool runs low it starts over, using whatever is still new first.
import { shuffle } from "./shared.js";
const read = (key) => { try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const write = (key, a) => { try { localStorage.setItem(key, JSON.stringify(a.slice(-3000))); } catch (e) { /* private mode */ } };
export function pickFresh(key, items, idOf, count) {
  let seen = read(key); const set = new Set(seen);
  const fresh = shuffle(items.filter((x) => !set.has(idOf(x)))), rest = shuffle(items.filter((x) => set.has(idOf(x))));
  if (fresh.length < count) { const ids = new Set(items.map(idOf)); seen = seen.filter((id) => !ids.has(id)); }
  const out = fresh.concat(rest).slice(0, count);
  write(key, seen.concat(out.map(idOf)));
  return out;
}
export const forget = (key) => write(key, []);
