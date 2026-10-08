import { esc, icon } from "../layout.mjs";
import { POEM } from "../data/content.mjs";

export default {
  slug: "about",
  title: "About the builder",
  accent: "pink",
  desc: "A note from Reiner Endrios, the anonymous builder of this site, in poetry.",
  scripts: ["about"],
  body: (ctx) => `
<div class="about">
  <canvas id="stars" aria-hidden="true"></canvas>
  <div class="wrap narrow" style="padding-block:clamp(4rem,10vw,8rem)">
    <p class="eyebrow reveal" style="--c:var(--pink)"><span class="dot"></span>About the builder</p>
    <h1 class="ph-title reveal" style="--i:1;margin-bottom:.6rem">Reiner Endrios</h1>
    <p class="muted reveal" style="--i:2;margin-bottom:4rem">Not my real name. A name for the part of me that stayed.</p>
    <div class="poem" id="poem">
      ${POEM.map((p) => `<p>${p}</p>`).join("\n      ")}
    </div>
    <p class="sig reveal">Reiner</p>
    <div class="cta-row reveal">
      <a class="btn btn-primary" href="${ctx.href("connect")}">Reach out ${icon("arrow", 18)}</a>
      <a class="btn btn-ghost" href="${ctx.href("help")}">If that's you right now</a>
    </div>
  </div>
</div>`
};
