import { esc, hero } from "../layout.mjs";
import { FILMS } from "../data/content.mjs";

const PAL = [["r", "o"], ["v", "b"], ["g", "sky"], ["pink", "v"], ["o", "y"], ["b", "g"]];
const TONE = { hopeful: "Feel-good", funny: "Funny", heavy: "Emotionally heavy", mixed: "Bittersweet" };
const FORMAT = { film: "Film", series: "Series", doc: "Documentary", short: "Short film" };

export default {
  slug: "watch",
  title: "Watch",
  accent: "v",
  desc: "Twenty-eight films and series, Indian and global, that make you feel seen. Filter by feel-good, funny, documentary and more.",
  scripts: ["watch"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Films and series", title: "Something to <em class=\"grad\">watch tonight</em>", lede: `Stories that make you feel seen, from India and around the world. Streaming availability changes, so check <a href="https://www.justwatch.com/in" target="_blank" rel="noopener noreferrer">JustWatch India</a> for where each one is playing.`, accent: "v" })}

<section class="section" style="padding-top:2rem">
  <div class="wrap">
    <div class="chips" id="filmChips" role="group" aria-label="Filter titles">
      ${[["all", "All"], ["india", "Indian"], ["global", "Global"], ["series", "Series"], ["doc", "Documentaries"], ["hopeful", "Feel-good"], ["funny", "Funny"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <p class="muted small" id="filmCount" aria-live="polite">${FILMS.length} titles</p>
    <div class="grid" style="--min:16.5rem">
      ${FILMS.map((f, i) => { const [c, c2] = PAL[i % PAL.length]; return `<article class="card film lift" style="--c:var(--${c});--c2:var(--${c2})" data-f="${f[2]} ${f[3]} ${f[5]}"><div class="poster">${esc(f[0])}</div><div class="meta">${esc(f[1])} · ${f[2] === "india" ? "India" : "Global"} · ${FORMAT[f[3]]}</div><p>${esc(f[4])}</p><span class="tag" style="--c:var(--${c})">${TONE[f[5]]}</span></article>`; }).join("")}
    </div>
  </div>
</section>`
};
