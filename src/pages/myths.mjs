import { esc, hero, icon } from "../layout.mjs";
import { MYTHS } from "../data/content.mjs";

export default {
  slug: "myths",
  title: "Myths and facts",
  accent: "r",
  desc: "Twelve things people say about LGBTQIA+ people, and what the evidence actually shows. Flip each card.",
  scripts: ["myths"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Tap a card to flip it", title: "Myths <em class=\"grad\">and facts</em>", lede: "The things people say at dinner tables and in family group chats, and what the evidence actually shows.", accent: "r" })}

<section class="section">
  <div class="wrap">
    <h2 class="sr-only">Twelve myths and questions</h2>
    <div class="flips" id="flips">
      ${MYTHS.map(([k, q, a], i) => `<button class="flip reveal" style="--i:${i % 3}" aria-pressed="false" aria-label="${esc(k + ": " + q)}. Press to reveal the answer."><div class="flip-inner"><div class="face front"><small>${k}</small><h4>${esc(q)}</h4><span class="hint">Tap to flip</span></div><div class="face back"><small>${k === "Myth" ? "What's true" : "An answer"}</small><p>${esc(a)}</p></div></div></button>`).join("")}
    </div>
    <div class="callout reveal" style="--c:var(--g)"><p>Want the sources behind each answer? They're all in the <a href="../library/">research library</a>. Talking to someone who disagrees? Lead with curiosity, then bring the study.</p></div>
  </div>
</section>`
};
