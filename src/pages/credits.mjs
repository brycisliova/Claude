import { esc } from "../layout.mjs";
import { hero, photoManifest } from "../ui.mjs";
import { SLOT } from "../data/photo-slots.mjs";
import { readFileSync } from "node:fs";

let POP = {};
try { POP = JSON.parse(readFileSync(new URL("../data/pop-photos.json", import.meta.url), "utf8")); } catch (e) { /* no quiz photos yet */ }
let GEO = {};
try { GEO = JSON.parse(readFileSync(new URL("../data/geo-photos.json", import.meta.url), "utf8")); } catch (e) { /* no location photos yet */ }

export default {
  slug: "credits",
  title: "Photo credits",
  accent: "pink",
  desc: "Where every photograph on this site comes from, who made it, and under what licence.",
  scripts: [],
  body: (ctx) => {
    const m = photoManifest();
    const rows = Object.entries(m).map(([id, p]) => `<tr><td>${esc(SLOT[id]?.brief?.split(".")[0] || id)}</td><td>${esc(p.title || p.alt || id)}</td><td>${esc(p.author)}</td><td><a href="${esc(p.licenseUrl || p.pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a></td><td><a href="${esc(p.pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.source)}</a></td></tr>`).join("");
    const popRows = Object.entries(POP).map(([id, p]) => `<tr><td>Pride pop quiz</td><td>${esc(p.title)}</td><td>${esc(p.author)}</td><td><a href="${esc(p.licenseUrl || p.pageUrl)}" rel="noopener noreferrer">${esc(p.license)}</a></td><td><a href="${esc(p.pageUrl)}" rel="noopener noreferrer">Wikimedia Commons</a></td></tr>`).join("");
    const geoRows = Object.entries(GEO).map(([id, p]) => `<tr><td>Where in the world?</td><td>${esc(p.title)}</td><td>${esc(p.author)}</td><td><a href="${esc(p.licenseUrl || p.pageUrl)}" rel="noopener noreferrer">${esc(p.license)}</a></td><td><a href="${esc(p.pageUrl)}" rel="noopener noreferrer">Wikimedia Commons</a></td></tr>`).join("");
    return `
${hero(ctx, { eyebrow: "Credits", title: "Photo <em>credits</em>", lede: "Every photograph here was made by someone else and shared under an open licence. This is who, and where to find the original." })}
<section class="sec">
  <div class="wrap">
    <div class="table-wrap"><table><thead><tr><th scope="col">Where it appears</th><th scope="col">Photograph</th><th scope="col">Photographer</th><th scope="col">Licence</th><th scope="col">Source</th></tr></thead><tbody>${rows}${popRows}${geoRows}</tbody></table></div>
    <p class="muted small">Place names in the Atlas game come from <a href="https://www.geonames.org/" rel="noopener noreferrer">GeoNames</a>, under a <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer">CC BY 4.0</a> licence. World map outlines used in the location game come from <a href="https://www.naturalearthdata.com/" rel="noopener noreferrer">Natural Earth</a>, which is in the public domain.</p>
    <p class="muted small">Images are resized and cropped for the page; otherwise unaltered. Each photograph also carries a short credit chip linking to its source.</p>
  </div>
</section>`;
  }
};
