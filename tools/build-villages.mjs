#!/usr/bin/env node
// Builds the village lists for the Atlas game from GeoNames (CC BY 4.0, geonames.org): one small file per Indian state
// (assets/data/villages/in-<state>.json) and one per other country (c-<country>.json). Each file is a single string
// "|name|name|" of normalised place names, loaded only when a player claims a village in that state or country.
// Usage: node tools/build-villages.mjs <GeoNames folder with allCountries.zip, admin1CodesASCII.txt, countryInfo.txt>
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2];
if (!dir) { console.error("Give the GeoNames folder."); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lines = (f) => readFileSync(join(dir, f), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t"));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const slug = norm;

const FIXC = { "Czechia": "Czech Republic", "Myanmar [Burma]": "Myanmar", "Macedonia": "North Macedonia", "Swaziland": "Eswatini", "Timor Leste": "Timor-Leste" };
const countries = {}; for (const r of lines("countryInfo.txt")) countries[r[0]] = FIXC[r[4]] || r[4];
const admin1 = {}; for (const r of lines("admin1CodesASCII.txt")) admin1[r[0]] = r[1];
const FIX = { "Andaman and Nicobar": "Andaman and Nicobar Islands" };
const SKIP = new Set(["PPLH", "PPLW", "PPLQ", "PPLR"]);

const buckets = new Map(); // file -> Set
const put = (file, n) => { if (n.length < 3) return; let s = buckets.get(file); if (!s) buckets.set(file, (s = new Set())); s.add(n); };
const zip = join(dir, "allCountries.zip");
const rl = createInterface({ input: spawn("unzip", ["-p", zip, "allCountries.txt"]).stdout, crlfDelay: Infinity });
let rows = 0;
for await (const line of rl) {
  const c = line.split("\t"); if (c[6] !== "P" || SKIP.has(c[7])) continue;
  const iso = c[8], country = countries[iso]; if (!country) continue;
  let file;
  if (iso === "IN") { const st = admin1["IN." + c[10]]; if (!st) continue; file = "in-" + slug(FIX[st] || st); }
  else file = "c-" + slug(country);
  const a = norm(c[2] || ""), b = norm(c[1] || ""); if (a) put(file, a); if (b && b !== a && /^[\p{Script=Latin}\s'.-]+$/u.test(c[1])) put(file, b);
  rows++;
}
const out = join(root, "assets/data/villages"); rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
let total = 0, bytes = 0;
for (const [file, set] of buckets) { const str = "|" + [...set].sort().join("|") + "|"; writeFileSync(join(out, file + ".json"), JSON.stringify(str)); total += set.size; bytes += str.length; }
console.log({ rows, files: buckets.size, names: total, MB: +(bytes / 1048576).toFixed(1) });
