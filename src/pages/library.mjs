import { esc, hero } from "../layout.mjs";
import { PAPERS, PTAGS, TAG_COLOR } from "../data/content.mjs";

const label = (t) => PTAGS.find((x) => x[0] === t)[1];

export default {
  slug: "library",
  title: "Research library",
  accent: "y",
  desc: "Twenty-six key papers on sexual orientation, gender identity and mental health: what each found, its honest limitations, and a link to the original.",
  scripts: ["library"],
  body: (ctx) => {
    const list = [...PAPERS].sort((a, b) => a.y - b.y);
    return `
${hero(ctx, { eyebrow: "26 papers, honestly described", title: "The research <em class=\"grad\">library</em>", lede: "Every key paper, what it found, and its limitations. Filter by question or search by author, journal or topic. Every title links to the original.", accent: "y" })}

<section class="section" style="padding-top:2rem">
  <div class="wrap">
    <div class="lib-tools">
      <div class="chips" id="paperChips" role="group" aria-label="Filter by question">
        ${PTAGS.map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
      </div>
      <label class="sr-only" for="paperSearch">Search papers</label>
      <input class="search" id="paperSearch" type="search" placeholder="Search papers, authors, journals" autocomplete="off">
      <p class="lib-count" id="libCount" aria-live="polite"></p>
    </div>
    <h2 class="sr-only">Papers</h2>
    <div class="papers">
      ${list.map((p) => `<article class="card paper lift" style="--c:var(--${TAG_COLOR[p.tags[0]]})" data-tags="${p.tags.join(" ")}" data-text="${esc((p.t + " " + p.a + " " + p.j + " " + p.f).toLowerCase())}">
        <div class="yr">${p.y}</div>
        <h4><a href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">${esc(p.t)}</a></h4>
        <div class="cite">${esc(p.a)} · <em>${esc(p.j)}</em></div>
        <p class="find">${esc(p.f)}</p>
        <div>${p.tags.map((t) => `<span class="tag" style="--c:var(--${TAG_COLOR[t]})">${label(t)}</span>`).join("")}</div>
        <p class="caveat"><strong>Limits:</strong> ${esc(p.c)}</p>
      </article>`).join("")}
    </div>
    <div class="empty" id="libNone" hidden>No papers match. Try a different word or filter.</div>
    <div class="callout reveal" style="--c:var(--y)"><p><strong>How to read this library.</strong> One study never settles a question. Small or early studies (like LeVay 1991 or Hamer 1993) were important but had limits, and some findings didn't fully replicate. The conclusions on this site rest on what many independent studies, across countries and decades, keep finding.</p></div>
  </div>
</section>`;
  }
};
