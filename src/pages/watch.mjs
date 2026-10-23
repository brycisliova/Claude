import { esc } from "../layout.mjs";
import { hero, mediaId, player } from "../ui.mjs";
import { FILMS } from "../data/content.mjs";

const PAL = [["pink", "yellow"], ["violet", "blue"], ["green", "sky"], ["orange", "pink"], ["blue", "green"], ["yellow", "r"]];
const TONE = { hopeful: "Feel-good", funny: "Funny", heavy: "Emotionally heavy", mixed: "Bittersweet" };
const FORMAT = { film: "Film", series: "Series", doc: "Documentary", short: "Short film" };

export default {
  slug: "watch",
  title: "Watch",
  accent: "violet",
  desc: "Twenty-eight films and series, Indian and global, that make you feel seen. Filter by feel-good, funny, documentary and more.",
  scripts: ["watch"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Watch", title: "Films <em>and series</em>", lede: `Queer stories from India and around the world. Streaming availability changes, so check <a href="https://www.justwatch.com/in" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">JustWatch India</a> for where each one is playing.` })}

<section class="sec" style="padding-top:2.4rem">
  <div class="wrap-x">
    <div class="chips" id="filmChips" role="group" aria-label="Filter titles">
      ${[["all", "All"], ["india", "Indian"], ["global", "Global"], ["series", "Series"], ["doc", "Documentaries"], ["hopeful", "Feel-good"], ["funny", "Funny"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <p class="muted small" id="filmCount" aria-live="polite">${FILMS.length} titles</p>
    <h2 class="sr-only">Titles</h2>
    <div class="grid" style="--min:17rem">
      ${FILMS.map((f, i) => { const [c, c2] = PAL[i % PAL.length]; return `<article class="card film lift" style="--c:var(--${c});--c2:var(--${c2})" data-f="${f[2]} ${f[3]} ${f[5]}">${mediaId("films", f[0]) ? player(mediaId("films", f[0]), f[0] + " (" + f[1] + ") trailer", { class: "yt--film" }) : `<div class="poster"><span>${esc(f[0])}</span></div>`}<div class="film-body"><p class="meta">${esc(f[1])} · ${f[2] === "india" ? "India" : "Global"} · ${FORMAT[f[3]]}</p><p>${esc(f[4])}</p><span class="tag" style="--c:var(--${c})">${TONE[f[5]]}</span></div></article>`; }).join("")}
    </div>
  </div>
</section>`
};
