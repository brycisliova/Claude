import { esc, icon } from "../layout.mjs";
import { hero, head, photo, hasPhoto, arrowBtn } from "../ui.mjs";
import { PEOPLE, BLOGS, STORY } from "../data/content.mjs";

const slug = (n) => n.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export default {
  slug: "stories",
  title: "Stories",
  accent: "green",
  desc: "Reiner's story, twelve queer Indian trailblazers, a community wall of anonymous experiences, and the best places to read more.",
  scripts: ["stories"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "People", title: "Stories", lede: "People who lived openly when it was dangerous, so the rest of us could breathe a little easier. Their stories are retold here in brief, with links to read more." })}

<section class="sec" id="reiner">
  <div class="wrap">
    <div class="longread longread-wrap">
      <div class="longread-side">
        <p class="label reveal"><span class="no"></span>Reiner's story</p>
        <h2 data-split style="margin-top:1.6rem">${esc(STORY.title)}</h2>
        <p class="byline reveal">${esc(STORY.byline)}</p>
      </div>
      <div class="longread-main">
        ${STORY.sections.map(([h, ps], i) => `<h3 class="reveal">${esc(h)}</h3>${ps.map((p, j) => `<p class="reveal${i === 0 && j === 0 ? " first" : ""}">${p}</p>`).join("")}${i === 3 ? `<blockquote class="pull reveal">${esc(STORY.pull)}</blockquote>` : ""}`).join("")}
        <p class="sign reveal">Reiner</p>
      </div>
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap-x">
    ${head("Trailblazers", "Twelve <em>trailblazers</em>", "A short version of each life, with a link to read more.")}
    <h2 class="sr-only">Trailblazers</h2>
    <div class="grid" style="--min:19rem">
      ${PEOPLE.map(([n, role, story, link, c], i) => {
        const id = "portrait-" + slug(n);
        const initials = esc(n.split(" ").map((w) => w[0]).slice(0, 2).join(""));
        return `<article class="card person lift reveal" style="--c:var(--${c});--i:${i % 3}"><div class="person-ph">${photo(ctx, id, { ratio: 0.8, c, sizes: "(max-width:700px) 100vw, 30vw" })}${hasPhoto(id) ? "" : `<span class="ph-initials" aria-hidden="true">${initials}</span>`}</div><div class="person-body"><h4>${esc(n)}</h4><div class="role">${esc(role)}</div><p>${esc(story)}</p><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Read more ${icon("up", 16)}</a></div></article>`;
      }).join("")}
    </div>
  </div>
</section>

<section class="sec" id="wall-section">
  <div class="wrap">
    ${head("Community wall", "Community <em>wall</em>", "Anonymous experiences, hopes and messages shared by visitors, each read and approved before it appears.")}
    <div class="wall" id="wall"><div class="empty">Stories will appear here once shared and approved. Yours could be the first.</div></div>
    <div class="cta-row">${arrowBtn("../connect/", "Share yours, anonymously")}</div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap">
    ${head("Keep reading", "More <em>stories</em>")}
    <div class="grid" style="--min:18rem">
      ${BLOGS.map(([n, d, u, c], i) => `<a class="card blog lift reveal" style="--c:var(--${c});--i:${i % 4}" href="${esc(u)}" target="_blank" rel="noopener noreferrer"><h4>${esc(n)} ${icon("up", 18)}</h4><p>${esc(d)}</p></a>`).join("")}
    </div>
  </div>
</section>`
};
