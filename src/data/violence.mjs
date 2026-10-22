// Verified figures for the India and the world page. The four JSON files next to this one were compiled from primary
// sources (government tables, court judgments, peer-reviewed studies, NGO reports, major news outlets); every entry
// carries its source URL, the period and place it covers, and a short verbatim quote used to check it.
import { readFileSync } from "node:fs";
const load = (f) => JSON.parse(readFileSync(new URL("./violence/" + f, import.meta.url), "utf8"));
export const OFFICIAL = load("official.json"), STUDIES = load("studies.json"), NEWS = load("news.json"), GLOBAL = load("global.json");

const facts = new Map();
[OFFICIAL, STUDIES, GLOBAL].forEach((d) => d.facts.forEach((f) => facts.set(f.id, f)));
// A fact by id. A figure shown on the page must appear in the fact's own wording, so a typo cannot slip through the build.
export function fact(id, ...mustContain) {
  const f = facts.get(id); if (!f) throw new Error("Unknown fact id: " + id);
  const text = (f.claim + " " + (f.quote || "")).replace(/,/g, "");
  mustContain.forEach((s) => { if (!text.includes(String(s).replace(/,/g, ""))) throw new Error(`Fact ${id} does not contain "${s}": ${f.claim}`); });
  return f;
}
export const allSources = () => {
  const groups = [["Official records, laws and courts", OFFICIAL.facts], ["Studies and reports on India", STUDIES.facts], ["Global data: killings, hate crime, laws, health", GLOBAL.facts]];
  return groups.map(([title, list]) => { const seen = new Map(); list.forEach((f) => { if (f.sourceUrl && !seen.has(f.sourceUrl)) seen.set(f.sourceUrl, f.sourceName); }); return [title, [...seen].map(([u, n]) => [n, u])]; })
    .concat([["News and incident record (India)", (() => { const seen = new Map(); NEWS.items.forEach((i) => { if (!seen.has(i.url)) seen.set(i.url, `${i.outlet}: ${i.headline}`); }); return [...seen].map(([u, n]) => [n, u]); })()]]);
};
