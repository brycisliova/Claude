#!/usr/bin/env node
// Builds assets/data/world.json (country outlines, country label points and big cities) for the location game.
// Usage: node tools/build-world.mjs <countries-50m.json from the world-atlas package> <cities15000.txt from GeoNames> <countryInfo.txt>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const [topoFile, citiesFile, infoFile] = process.argv.slice(2);
if (!topoFile || !citiesFile) { console.error("Usage: node tools/build-world.mjs <countries-50m.json> <cities15000.txt> [countryInfo.txt]"); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const topo = JSON.parse(readFileSync(topoFile, "utf8")), { scale, translate } = topo.transform;
// decode the shared, delta-coded arcs into lon/lat points
const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; }); });
const ring = (idx) => { let pts = []; idx.forEach((i) => { const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse(); pts = pts.concat(pts.length ? a.slice(1) : a); }); return pts; };
const q = (v) => Math.round(v * 100); // hundredths of a degree
const enc = (pts) => { const out = []; let px = 0, py = 0, last = null; for (const [lon, lat] of pts) { const x = q(lon), y = q(lat); if (last && x === last[0] && y === last[1]) continue; out.push(x - px, y - py); px = x; py = y; last = [x, y]; } return out; };
const countries = [];
for (const g of topo.objects.countries.geometries) {
  const polys = g.type === "Polygon" ? [g.arcs] : g.arcs; const rings = []; let best = null, bestN = 0;
  for (const poly of polys) {
    const outer = ring(poly[0]); if (outer.length < 4) continue;
    const e = enc(outer); if (e.length < 8) continue;
    rings.push(e); if (outer.length > bestN) { bestN = outer.length; best = outer; }
  }
  if (!rings.length) continue;
  const mx = best.reduce((s, p) => s + p[0], 0) / best.length, my = best.reduce((s, p) => s + p[1], 0) / best.length;
  countries.push({ n: g.properties.name, c: [Math.round(mx * 10) / 10, Math.round(my * 10) / 10], r: rings });
}
const iso = {}; if (infoFile) readFileSync(infoFile, "utf8").split("\n").filter((l) => l && !l.startsWith("#")).forEach((l) => { const f = l.split("\t"); iso[f[0]] = f[4]; });
const cities = readFileSync(citiesFile, "utf8").split("\n").filter(Boolean).map((l) => l.split("\t")).filter((c) => +c[14] >= 1000000 || c[7] === "PPLC" || (c[8] === "IN" && +c[14] >= 400000)).map((c) => [c[2] || c[1], Math.round(+c[4] * 100) / 100, Math.round(+c[5] * 100) / 100, Math.min(9, Math.max(1, Math.floor(Math.log10(Math.max(+c[14], 1000)) - 2))), c[7] === "PPLC" ? 1 : 0]);
const out = { countries, cities };
writeFileSync(join(root, "assets/data/world.json"), JSON.stringify(out));
console.log({ countries: countries.length, cities: cities.length, KB: Math.round(JSON.stringify(out).length / 1024) });
