// Builds assets/data/songs.json from the looked-up song lists (see the README, "Song game data").
// usage: node tools/build-songs.mjs hindi.json intl.json
// Each input row: { t, a, f, y, l, id, u, img, tn }  (u is the iTunes preview URL, img the cover art URL)
import { readFileSync, writeFileSync } from "node:fs";
const AUDIO = "https://audio-ssl.itunes.apple.com/itunes-assets/";
const INDIAN = new Set(["hi", "pa", "ta", "te", "kn", "mr", "ml", "bn"]);
const rows = process.argv.slice(2).flatMap((f) => JSON.parse(readFileSync(f, "utf8")));
const seen = new Set(), out = [];
for (const r of rows) {
  if (seen.has(r.id) || !r.u.startsWith(AUDIO)) continue; seen.add(r.id);
  const m = /\/image\/thumb\/(.+)\/\d+x\d+bb\.jpg$/.exec(r.img || "");
  const o = { id: r.id, t: r.t, a: r.a, f: r.f || "", y: r.y || 0, l: r.l, g: INDIAN.has(r.l) ? "hi" : r.l === "en" ? "en" : "world", u: r.u.slice(AUDIO.length), i: m ? m[1] : "" };
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (r.tn && norm(r.tn) !== norm(r.t)) o.tn = r.tn.replace(/\s*[\(\[].*$/, "").trim() || r.tn;
  out.push(o);
}
writeFileSync(new URL("../assets/data/songs.json", import.meta.url), JSON.stringify(out));
const by = out.reduce((a, o) => ((a[o.g] = (a[o.g] || 0) + 1), a), {});
console.log(out.length, "songs", by);
