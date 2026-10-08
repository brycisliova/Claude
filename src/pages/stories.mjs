import { esc, hero, sectionHead, icon } from "../layout.mjs";
import { PEOPLE, BLOGS } from "../data/content.mjs";

export default {
  slug: "stories",
  title: "Stories",
  accent: "g",
  desc: "Twelve queer Indian trailblazers, a community wall of anonymous experiences, and the best places to read more stories.",
  scripts: ["stories"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Courage, in public", title: "Stories from <em class=\"grad\">queer India</em>", lede: "People who lived openly when it was dangerous, so the rest of us could breathe a little easier. Their stories are retold here in brief, with links to read more.", accent: "g" })}

<section class="section">
  <div class="wrap">
    <h2 class="sr-only">Trailblazers</h2>
    <div class="grid" style="--min:19rem">
      ${PEOPLE.map(([n, role, story, link, c], i) => `<article class="card person lift reveal" style="--c:var(--${c});--i:${i % 3}"><div class="avatar" aria-hidden="true">${esc(n.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</div><h4>${esc(n)}</h4><div class="role">${esc(role)}</div><p>${esc(story)}</p><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Read more ${icon("up", 16)}</a></article>`).join("")}
    </div>
  </div>
</section>

<section class="section alt" id="wall-section">
  <div class="wrap">
    ${sectionHead("Community wall", "Voices from people like you", "Anonymous experiences, hopes and messages shared by visitors, each read and approved before it appears.")}
    <div class="wall" id="wall"><div class="empty">Stories will appear here once shared and approved. Yours could be the first.</div></div>
    <div class="cta-row"><a class="btn btn-primary" href="../connect/">Share yours, anonymously ${icon("arrow", 18)}</a></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead("Keep reading", "Where to find more stories")}
    <div class="grid" style="--min:17rem">
      ${BLOGS.map(([n, d, u, c], i) => `<a class="card blog lift reveal" style="--c:var(--${c});--i:${i % 4}" href="${esc(u)}" target="_blank" rel="noopener noreferrer"><h4>${esc(n)} ${icon("up", 18)}</h4><p>${esc(d)}</p></a>`).join("")}
    </div>
  </div>
</section>`
};
