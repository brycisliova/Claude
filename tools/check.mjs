#!/usr/bin/env node
// Verifies every internal link, asset and #anchor in the built site. Usage: node tools/check.mjs
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skip = new Set([".git", "node_modules", "src", "tools"]);
const htmlFiles = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (skip.has(f)) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) htmlFiles.push(p);
  }
})(root);

const idCache = new Map();
const idsOf = (file) => {
  if (!idCache.has(file)) idCache.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(file);
};

let bad = 0, checked = 0;
for (const file of htmlFiles) {
  if (file.endsWith("404.html")) continue; // uses root-absolute paths by design
  const src = readFileSync(file, "utf8");
  const dir = dirname(file);
  for (const m of src.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url) || url.startsWith("//")) continue;
    const [pathPart, hash] = url.split("#");
    const clean = pathPart.split("?")[0];
    let target = clean ? resolve(dir, clean) : file;
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
    checked++;
    if (!existsSync(target)) { console.log(`MISSING  ${relative(root, file)} -> ${url}`); bad++; continue; }
    if (hash && target.endsWith(".html") && !idsOf(target).has(hash)) {
      // some anchors are handled by JavaScript (tabs and filters), which is fine
      if (!/^(lines|questioning|coming|family|allies|work|rights|illness|choice|change|health|nature|all|wall-section)$/.test(hash)) { console.log(`NO ANCHOR ${relative(root, file)} -> ${url}`); bad++; }
    }
  }
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) { console.log(`DUPLICATE IDS ${relative(root, file)}: ${[...new Set(dup)].join(", ")}`); bad++; }
}
console.log(bad ? `${bad} problem(s) in ${checked} internal references` : `OK: ${checked} internal references across ${htmlFiles.length} pages`);
process.exit(bad ? 1 : 0);
