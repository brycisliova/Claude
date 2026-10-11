import { esc } from "../layout.mjs";
import { hero, ext, photo, arrowBtn } from "../ui.mjs";
import { SOURCES, PAPERS } from "../data/content.mjs";

const slugify = (s) => s.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export default {
  slug: "sources",
  title: "Sources",
  accent: "sky",
  desc: "Every reference used on this site in one place: news and data sources, law and policy, surveys, help directories and all twenty-six research papers.",
  scripts: [],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Sources", title: "Sources", lede: "Everything on this site should be checkable. If you find an error, please tell us at the address in the footer.", accent: "sky" })}

<section class="sec">
  <div class="wrap narrow prose">
    ${SOURCES.map(([title, items]) => `<h2 id="${slugify(title).split("-")[0]}" style="margin-top:0">${esc(title)}</h2><ul>${items.map(([l, u]) => `<li>${ext(u, esc(l))}</li>`).join("")}</ul>`).join("")}
    <h2 id="papers">Research papers</h2>
    <p class="muted">The full library, with what each found and its limits, is on the <a href="../library/">research library</a>. Direct links:</p>
    <ul>${[...PAPERS].sort((a, b) => a.y - b.y).map((p) => `<li>${ext(p.u, esc(p.t))} <span class="muted">· ${esc(p.a)}, ${p.y}</span></li>`).join("")}</ul>
  </div>
</section>`
};
