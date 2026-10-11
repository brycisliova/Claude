import { icon } from "../layout.mjs";
import { arrowBtn } from "../ui.mjs";
import { ABOUT_BRIEF } from "../data/content.mjs";

export default {
  slug: "about",
  title: "About the builder",
  accent: "violet",
  desc: "A note from Reiner Endrios, the anonymous builder of this site: why it exists, and who it is for.",
  scripts: ["about"],
  body: (ctx) => `
<div class="about" data-tone="dark">
  <canvas id="stars" aria-hidden="true"></canvas>
  <div class="wrap" style="padding-block:clamp(7rem,14vw,12rem) clamp(4rem,10vw,8rem)">
    <p class="label reveal"><span class="no">14</span>About the builder</p>
    <h1 class="name" data-split style="margin-top:2rem">Reiner <em>Endrios</em></h1>
    <p class="reveal" style="color:var(--fg2);margin-bottom:5rem;font-size:1.1rem">Not my real name. A name for the part of me that stayed.</p>
    <div class="poem" id="poem">
      ${ABOUT_BRIEF.map((p) => `<p>${p}</p>`).join("\n      ")}
      <p><a href="${ctx.href("stories")}#reiner">Read my whole story</a></p>
    </div>
    <p class="sig reveal">Reiner</p>
    <div class="cta-row reveal">
      ${arrowBtn(ctx.href("connect"), "Reach out", "btn--light")}
      ${arrowBtn(ctx.href("help"), "If that's you right now", "btn--ghost-light")}
    </div>
  </div>
</div>`
};
