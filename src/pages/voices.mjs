import { esc, icon } from "../layout.mjs";
import { hero, sectionHead, photo, arrowBtn } from "../ui.mjs";
import { TALKS, INTERVIEWS, SHELF } from "../data/content.mjs";

export default {
  slug: "voices",
  title: "Voices",
  accent: "b",
  desc: "Talks, interviews and videos from queer India and beyond. Press play right here, or follow links to the full talks.",
  scripts: ["voices"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Video", title: "<em>Voices</em>", lede: "Press play to watch right here. Videos load only when you click, so nothing is tracked until you choose to watch.", accent: "b" })}

<section class="sec">
  <div class="wrap">
    ${sectionHead("Watch here", "Featured videos")}
    <div class="grid" id="videos" style="--min:21rem">
      ${TALKS.map((v, i) => `<article class="card video lift reveal" style="--c:var(--${v.c});--i:${i}"><a class="player" href="${esc(v.link)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none"><span class="play">${icon("play", 26)}</span><span class="ptitle">${esc(v.title)}</span></a><div class="vbody"><p>${esc(v.note)}</p><a href="${esc(v.link)}" target="_blank" rel="noopener noreferrer">${esc(v.label)} ${icon("up", 16)}</a></div></article>`).join("")}
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap">
    ${sectionHead("Interview highlights", "In their own words")}
    <div class="grid" style="--min:21rem">
      ${INTERVIEWS.map(([who, t, d, u, c], i) => `<article class="card interview lift reveal" style="--c:var(--${c});--i:${i % 2}"><p class="who">${esc(who)}</p><h4>${esc(t)}</h4><p>${esc(d)}</p><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Read or listen ${icon("up", 16)}</a></article>`).join("")}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead("Explore by topic", "Shelves on YouTube", "Curated searches open YouTube directly, so you always see the newest uploads.")}
    <div class="shelf reveal">
      ${SHELF.map(([l, q]) => `<a class="btn btn-ghost btn-sm" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a>`).join("")}
    </div>
  </div>
</section>`
};
