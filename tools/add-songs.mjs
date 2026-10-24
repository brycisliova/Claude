#!/usr/bin/env node
// Adds well-known songs to assets/data/songs.json. tools/data/song-wishlist.json lists songs people know (title, artist, year,
// language and a fame grade of 3 to 5). For each one this finds the original on iTunes, takes its 30 second preview, and
// adds it with a fame score ("q"); a song that is already in the file just has its score raised. It does a limited number of
// searches per run and carries on the next night, so Apple's rate limit is never a problem. Run by .github/workflows/songs.yml.
// usage: node tools/add-songs.mjs [max-searches]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL(".", import.meta.url)), SONGS = fileURLToPath(new URL("../assets/data/songs.json", import.meta.url));
const WISH = JSON.parse(readFileSync(DIR + "data/song-wishlist.json", "utf8")), STATE_FILE = DIR + "data/song-wishlist-state.json";
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { miss: {} };
const songs = JSON.parse(readFileSync(SONGS, "utf8"));
const MAX = +process.argv[2] || 350, AUDIO = "https://audio-ssl.itunes.apple.com/itunes-assets/", INDIAN = new Set(["hi", "pa", "ta", "te", "kn", "mr", "ml", "bn", "bho"]);
const BAD = /remix|\bflip\b|lo-?fi|slowed|reverb|karaoke|instrumental|\bcover\b|tribute|mashup|\bmix\b|live at|\(live|unplugged|sped up|8d audio|nightcore|ringtone|dialogue|reprise|recreated|acoustic|cover version/i;

const strip = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const norm = (s) => strip(s).replace(/\(.*?\)|\[.*?\]/g, " ").replace(/\b(feat|ft)\b\.?.*$/, " ").replace(/[^a-z0-9ऀ-ॿ]/g, "");
// Indian names are spelled many ways (Mohd., Md., Mohammad, Muhammad), so they are brought to one spelling before comparing
const NAMES = { mohd: "mohammed", md: "mohammed", mohammad: "mohammed", muhammad: "mohammed", mohamed: "mohammed" };
const toks = (s) => new Set(strip(s).replace(/[^a-z0-9ऀ-ॿ ]/g, " ").split(/\s+/).filter(Boolean).map((t) => NAMES[t] || t));
const first = (a) => a.split("&")[0].split(",")[0];
const keyOf = (t, a) => norm(t) + "|" + norm(first(a));
function lev(a, b) { if (a === b) return 0; let p = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[b.length]; }
const ratio = (a, b) => (a || b ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0);

const have = new Map(songs.map((s) => [keyOf(s.t, s.a), s])), ids = new Set(songs.map((s) => s.id));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function search(t, a) {
  const url = "https://itunes.apple.com/search?" + new URLSearchParams({ term: `${t} ${a}`, entity: "song", limit: "10", country: "IN" });
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(25000) }); if (r.ok) return (await r.json()).results || []; if (r.status < 500 && r.status !== 403 && r.status !== 429) return []; } catch { /* retry */ }
    await sleep(20000 * (i + 1));
  }
  return null; // blocked: stop for tonight
}

let searches = 0, added = 0, raised = 0, changed = false;
for (const w of WISH) {
  const q = w.g * 20 + 10, key = keyOf(w.t, w.a), ex = have.get(key);
  if (ex) { if ((ex.q || 0) < q) { ex.q = q; raised++; changed = true; } continue; }
  if ((state.miss[key] || 0) >= 2) continue;
  if (searches >= MAX) break;
  const res = await search(w.t, w.a); searches++; await sleep(1500);
  if (res === null) { console.log("Apple is rate limiting; stopping for tonight"); break; }
  const nt = norm(w.t), at = toks(first(w.a)); let best = null;
  for (const x of res) {
    if (!x.previewUrl || x.trackExplicitness === "explicit" || !x.previewUrl.startsWith(AUDIO) || BAD.test(x.trackName) || BAD.test(x.collectionName || "")) continue;
    const xt = norm(x.trackName), sim = ratio(nt, xt);
    if (!(sim >= 0.88 || (nt && (nt.includes(xt) || xt.includes(nt)) && Math.min(nt.length, xt.length) / Math.max(nt.length, xt.length) >= 0.7))) continue;
    const xa = toks(x.artistName); let hit = 0; at.forEach((t) => xa.has(t) && hit++);
    if (!at.size || hit / at.size < (at.size <= 2 ? 1 : 0.6)) continue; // a two-word name must match in full, so "Anwar Rafi" is never taken for "Mohammed Rafi"
    const yr = +(x.releaseDate || "9999").slice(0, 4), cand = { sim, yr, x };
    if (!best || cand.sim > best.sim || (cand.sim === best.sim && cand.yr < best.yr)) best = cand;
  }
  if (!best) { state.miss[key] = (state.miss[key] || 0) + 1; continue; }
  const x = best.x;
  if (ids.has(x.trackId)) { const s = songs.find((s) => s.id === x.trackId); if (s && (s.q || 0) < q) { s.q = q; raised++; changed = true; } continue; }
  const title = x.trackName.replace(/\s*[\(\[].*?[\)\]]/g, "").trim(), m = /\/image\/thumb\/(.+)\/\d+x\d+bb\.jpg$/.exec(x.artworkUrl100 || "");
  const o = { id: x.trackId, t: title, a: x.artistName, f: (x.collectionName || "").replace(/\s*[\(\[].*?[\)\]]/g, "").trim(), y: +(x.releaseDate || "0").slice(0, 4) || w.y || 0, l: w.l, q, g: INDIAN.has(w.l) ? "hi" : w.l === "en" ? "en" : "world", u: x.previewUrl.slice(AUDIO.length), i: m ? m[1] : "" };
  if (norm(x.trackName) !== norm(title)) o.tn = x.trackName.replace(/\s*[\(\[].*$/, "").trim() || x.trackName;
  songs.push(o); ids.add(o.id); have.set(keyOf(o.t, o.a), o); added++; changed = true;
}
if (changed) writeFileSync(SONGS, JSON.stringify(songs));
writeFileSync(STATE_FILE, JSON.stringify(state));
const left = WISH.filter((w) => !have.has(keyOf(w.t, w.a)) && (state.miss[keyOf(w.t, w.a)] || 0) < 2).length;
console.log(`searched ${searches}, added ${added}, raised ${raised}, ${left} still to look up, ${Object.values(state.miss).filter((n) => n >= 2).length} not found`);
