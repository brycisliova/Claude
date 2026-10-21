#!/usr/bin/env node
// Builds the village lists for the Atlas game from GeoNames (CC BY 4.0).
// Usage: node tools/build-villages.mjs <folder with IN.txt, cities500.txt, admin1CodesASCII.txt, countryInfo.txt>
// Writes assets/data/atlas-villages-in.json (state -> names) and atlas-villages-world.json (country -> names).
// Names are stored lowercase, letters only, joined with "|". The game loads a file only when a player claims a village.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const dir = process.argv[2]; if (!dir) { console.error("Give the folder that holds the GeoNames files."); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = (f) => readFileSync(join(dir, f), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t"));
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const admin1 = {}; rows("admin1CodesASCII.txt").forEach((r) => (admin1[r[0]] = r[1]));
const FIX = { "Andaman and Nicobar": "Andaman and Nicobar Islands" };
const country = {}; rows("countryInfo.txt").forEach((r) => (country[r[0]] = r[4]));
const FIXC = { Czechia: "Czech Republic", "Myanmar [Burma]": "Myanmar", Macedonia: "North Macedonia", Swaziland: "Eswatini", "Timor Leste": "Timor-Leste" };
const IN = {}, W = {}; const add = (m, k, n) => { if (n.length >= 3) (m[k] ||= new Set()).add(n); };
for (const p of rows("IN.txt")) {
  if (p[6] !== "P") continue; const st = admin1["IN." + p[10]]; if (!st) continue; const s = FIX[st] || st;
  add(IN, s, norm(p[1])); add(IN, s, norm(p[2]));
}
for (const p of rows("cities500.txt")) {
  if (p[8] === "IN") continue; const c = country[p[8]]; if (!c) continue; const cc = FIXC[c] || c;
  add(W, cc, norm(p[1])); add(W, cc, norm(p[2]));
}
const pack = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, "|" + [...v].sort().join("|") + "|"]));
writeFileSync(join(root, "assets/data/atlas-villages-in.json"), JSON.stringify(pack(IN)));
writeFileSync(join(root, "assets/data/atlas-villages-world.json"), JSON.stringify(pack(W)));
console.log({ indiaPairs: Object.values(IN).reduce((a, s) => a + s.size, 0), worldPairs: Object.values(W).reduce((a, s) => a + s.size, 0) });
