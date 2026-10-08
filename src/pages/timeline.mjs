import { esc, hero } from "../layout.mjs";
import { TIMELINE } from "../data/content.mjs";

const KIND = { india: "India · law", science: "Science · medicine", culture: "Culture · community" };

export default {
  slug: "timeline",
  title: "Timeline",
  accent: "g",
  desc: "A timeline of love, law and science: from Khajuraho and Section 377 to Navtej Singh Johar, the marriage equality case and the 2026 transgender amendment.",
  scripts: ["timeline"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "How we got here", title: "A timeline of <em class=\"grad\">love, law and science</em>", lede: "Filter by theme, then scroll. The line fills as you go.", accent: "g" })}

<section class="section" style="padding-top:2.5rem">
  <div class="wrap mid">
    <div class="chips" id="tlChips" role="group" aria-label="Filter timeline" style="justify-content:center">
      ${[["all", "Everything"], ["india", "India law"], ["science", "Science and medicine"], ["culture", "Culture and community"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <h2 class="sr-only">Events</h2>
    <div class="tl" id="tl">
      <div class="tl-progress" id="tlProgress" aria-hidden="true"></div>
      ${TIMELINE.map(([k, when, title, text, c]) => `<div class="event reveal" data-k="${k}" style="--c:var(--${c})"><span class="kind">${KIND[k]}</span><div class="when">${esc(when)}</div><h4>${esc(title)}</h4><p>${esc(text)}</p></div>`).join("")}
    </div>
  </div>
</section>`
};
