import { esc } from "../layout.mjs";
import { hero } from "../ui.mjs";
import { PAPERS, PTAGS, TAG_COLOR } from "../data/content.mjs";

const label = (t) => PTAGS.find((x) => x[0] === t)[1];

export default {
  slug: "library",
  title: "Research library",
  accent: "yellow",
  desc: "Twenty-six key papers on sexual orientation, gender identity and mental health: what each found, its honest limitations, and a link to the original.",
  scripts: ["library"],
  body: (ctx) => {
    const list = [...PAPERS].sort((a, b) => a.y - b.y);
    return `
${hero(ctx, { eyebrow: "26 papers", title: "Research <em>library</em>", lede: "Every key paper, what it found, and its limitations. Filter by question or search by author, journal or topic. Open any row to read it." })}

<section class="sec" style="padding-block:0">
  <div class="lib-tools">
    <div class="chips" id="paperChips" role="group" aria-label="Filter by question">
      ${[["all", "All"], ...PTAGS.slice(1)].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <label class="sr-only" for="paperSearch">Search papers</label>
    <input class="search" id="paperSearch" type="search" placeholder="Search papers, authors, journals" autocomplete="off">
    <p class="lib-count" id="libCount" aria-live="polite"></p>
  </div>
  <h2 class="sr-only">Papers</h2>
  <div class="papers">
    ${list.map((p) => `<details class="paper" style="--c:var(--${TAG_COLOR[p.tags[0]]})" data-tags="${p.tags.join(" ")}" data-text="${esc((p.t + " " + p.a + " " + p.j + " " + p.f).toLowerCase())}">
      <summary><span class="yr">${p.y}</span><span><span class="pt" style="display:block">${esc(p.t)}</span><span class="cite" style="display:block">${esc(p.a)} · ${esc(p.j)}</span></span><span class="tags">${p.tags.map((t) => `<span class="tag">${label(t)}</span>`).join("")}</span><span class="plus" aria-hidden="true"></span></summary>
      <div class="paper-body"><span></span><div><span class="lbl">What it found</span><p>${esc(p.f)}</p></div><div><span class="lbl">Its limits</span><p>${esc(p.c)}</p></div><a class="go" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">Read the original ↗</a></div>
    </details>`).join("")}
  </div>
  <div class="wrap" style="padding-top:2rem"><div class="empty" id="libNone" hidden>No papers match. Try a different word or filter.</div></div>
  <div class="wrap"><div class="callout" style="--c:var(--y)"><p><strong>How to read this library.</strong> One study never settles a question. Small or early studies (like LeVay 1991 or Hamer 1993) were important but had limits, and some findings didn't fully replicate. The conclusions on this site rest on what many independent studies, across countries and decades, keep finding.</p></div></div>
</section>`;
  }
};
