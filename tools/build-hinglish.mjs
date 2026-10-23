// Builds assets/data/hinglish-words.json for the Hinglish word chain: the words that appear in the titles of Hindi and
// Punjabi songs in assets/data/songs.json, with how often each spelling appears. The game groups spellings by sound.
import { readFileSync, writeFileSync } from "node:fs";
const songs = JSON.parse(readFileSync(new URL("../assets/data/songs.json", import.meta.url), "utf8"));
const SKIP = new Set("feat from version original motion picture soundtrack remix theme title song track lofi film ost the and with live".split(" "));
const count = {};
for (const s of songs) {
  if (s.l !== "hi" && s.l !== "pa") continue;
  const t = (s.tn || s.t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\(.*?\)|\[.*?\]/g, " ");
  for (const w of new Set(t.split(/[^a-z]+/))) if (w.length >= 3 && !SKIP.has(w)) count[w] = (count[w] || 0) + 1;
}
const rows = Object.entries(count).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
writeFileSync(new URL("../assets/data/hinglish-words.json", import.meta.url), JSON.stringify(rows));
console.log(rows.length, "words,", rows.filter((r) => r[1] >= 2).length, "seen twice or more");
