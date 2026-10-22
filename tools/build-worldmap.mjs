#!/usr/bin/env node
// Builds assets/data/worldmap.json: country outlines as SVG path strings (Equal Earth projection) for the data map on the India page.
// Usage: node tools/build-worldmap.mjs <countries-50m.json from the world-atlas package (Natural Earth, public domain)> <countryInfo.txt from GeoNames>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const [topoFile, infoFile] = process.argv.slice(2);
if (!topoFile || !infoFile) { console.error("Usage: node tools/build-worldmap.mjs <countries-50m.json> <countryInfo.txt>"); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const topo = JSON.parse(readFileSync(topoFile, "utf8")), { scale, translate } = topo.transform;
const iso = {}; readFileSync(infoFile, "utf8").split("\n").filter((l) => l && !l.startsWith("#")).forEach((l) => { const f = l.split("\t"); iso[String(+f[2])] = [f[1], f[4]]; });
const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; }); });
const ring = (idx) => { let pts = []; idx.forEach((i) => { const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse(); pts = pts.concat(pts.length ? a.slice(1) : a); }); return pts; };
// Equal Earth projection
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2, R = Math.PI / 180;
const proj = ([lon, lat]) => { const t = Math.asin(M * Math.sin(lat * R)), t2 = t * t, t6 = t2 * t2 * t2; const x = (2 * Math.sqrt(3) * lon * R * Math.cos(t)) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1)); const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)); return [x, y]; };
const W = 1000, S = W / 5.4; // projected width of the world is about 5.4 units
const px = ([x, y]) => [x * S + W / 2, -y * S + 255];
function rdp(pts, eps) { // Douglas-Peucker
  if (pts.length < 3) return pts; const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) { const [a, b] = st.pop(); let md = 0, mi = -1; const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  return pts.filter((_, i) => keep[i]);
}
const countries = [];
for (const g of topo.objects.countries.geometries) {
  if (String(g.id) === "010") continue; // Antarctica
  const meta = iso[String(+g.id)]; const polys = g.type === "Polygon" ? [g.arcs] : g.arcs; let d = "", cx = 0, cy = 0, best = 0;
  for (const poly of polys) {
    const outer = ring(poly[0]); if (outer.length < 4) continue;
    // a ring that crosses the date line (Russia, Fiji, Alaska) is unwrapped and drawn twice, once on each edge of the map
    const cross = outer.some((c, k) => k && Math.abs(c[0] - outer[k - 1][0]) > 180), copies = cross ? [(c) => [c[0] < 0 ? c[0] + 360 : c[0], c[1]], (c) => [c[0] < 0 ? c[0] : c[0] - 360, c[1]]] : [(c) => c];
    let p = null;
    for (const fix of copies) {
      const all = outer.map((c) => px(proj(fix(c)))), mid = all.length >> 1, q = rdp(all.slice(0, mid + 1), 0.35).concat(rdp(all.slice(mid), 0.35).slice(1)); if (q.length < 3) continue;
      d += "M" + q.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + "Z"; p = p || q;
    }
    if (!p) continue;
    if (outer.length > best) { best = outer.length; cx = p.reduce((s, q) => s + q[0], 0) / p.length; cy = p.reduce((s, q) => s + q[1], 0) / p.length; }
  }
  if (!d) continue; countries.push({ i: meta ? meta[0] : "X" + g.id, n: meta ? meta[1] : g.properties.name, c: [Math.round(cx), Math.round(cy)], d });
}
// the outline of the projected world, used to clip the date-line copies
const edge = (lon) => Array.from({ length: 61 }, (_, k) => px(proj([lon, -90 + k * 3]))), outline = "M" + edge(180).concat(edge(-180).reverse()).map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + "Z";
writeFileSync(join(root, "assets/data/worldmap.json"), JSON.stringify({ w: W, h: 520, o: outline, countries }));
console.log(countries.length, "countries,", Math.round(JSON.stringify(countries).length / 1024), "KB", countries.filter((c) => c.i.startsWith("X")).map((c) => c.n).join(", "));
