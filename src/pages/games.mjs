import { esc } from "../layout.mjs";
import { hero, photo, arrowBtn } from "../ui.mjs";
import { QUOTES } from "../data/content.mjs";

export default {
  slug: "games",
  title: "Calm arcade",
  accent: "g",
  desc: "Thirteen gentle games: breathing orb, lanterns, bubbles, light painting, kaleidoscope, zen sand garden, colour puzzles, constellations, a growing garden, wind chimes and aurora. No timers, no losing.",
  scripts: ["games"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Play is rest too", title: "The calm <em class=\"grad\">arcade</em>", lede: "Thirteen gentle games. No timers chasing you, no losing. Just your hands, colour and quiet.", accent: "g" })}

<section class="sec" style="padding-top:2.5rem">
  <div class="wrap">
    <div class="card reveal" style="--c:var(--v);text-align:center;margin-bottom:2rem;padding:clamp(2rem,5vw,3.5rem)">
      <p class="serif" id="qText" data-quotes='${esc(JSON.stringify(QUOTES))}' style="font-style:italic;font-weight:300;font-size:clamp(1.6rem,3.6vw,2.6rem);line-height:1.2;max-width:28ch;margin:0 auto .8rem;transition:opacity .6s,filter .6s;letter-spacing:-.02em"></p>
      <p class="muted small" id="qBy" style="margin:0 auto 1.2rem"></p>
      <button class="btn btn-ghost btn-sm" id="qNext">Another thought</button>
    </div>
    <h2 class="sr-only">The games</h2>
    <div class="grid" id="gameGrid" style="--min:22rem"></div>
    <p class="muted small" style="margin-top:2rem">Sounds in the games stay silent until you tap something, and everything is generated in your browser.</p>
  </div>
</section>`
};
