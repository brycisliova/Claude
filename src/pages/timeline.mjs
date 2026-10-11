import { esc } from "../layout.mjs";
import { hero } from "../ui.mjs";
import { TIMELINE } from "../data/content.mjs";

const KIND = { india: "India · law", science: "Science · medicine", culture: "Culture · community" };

export default {
  slug: "timeline",
  title: "Timeline",
  accent: "green",
  desc: "A timeline of love, law and science: from Khajuraho and Section 377 to Navtej Singh Johar, the marriage equality case and the 2026 transgender amendment.",
  scripts: ["timeline"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "How we got here", title: "Love, law <em>and science</em>", lede: "Three threads running side by side for two thousand years. Filter by theme, then scroll." })}

<section class="sec" style="padding-top:2.4rem">
  <div class="wrap-x">
    <div class="chips" id="tlChips" role="group" aria-label="Filter timeline">
      ${[["all", "Everything"], ["india", "India law"], ["science", "Science and medicine"], ["culture", "Culture and community"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <h2 class="sr-only">Events</h2>
    <div class="tl" id="tl">
      ${TIMELINE.map(([k, when, title, text, c]) => `<article class="event reveal" data-k="${k}" style="--c:var(--${c})"><div class="when">${esc(when)}</div><div class="what"><span class="tag">${KIND[k]}</span><h4>${esc(title)}</h4><p>${esc(text)}</p></div></article>`).join("")}
    </div>
  </div>
</section>`
};
