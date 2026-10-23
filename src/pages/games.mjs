import { esc, icon } from "../layout.mjs";
import { hero } from "../ui.mjs";
import { QUOTES } from "../data/content.mjs";
import { GAMES, CATS, FACTS } from "../data/games.mjs";
import { MYTHS } from "../data/content.mjs";
import { gameArt } from "../data/game-art.mjs";

const CAT = Object.fromEntries(CATS);
const LVL = ["", "Easy", "Medium", "Thoughtful"];
const dots = (n) => "●".repeat(n) + "○".repeat(3 - n);

export default {
  slug: "games",
  title: "Games",
  accent: "g",
  desc: `${GAMES.length} games: Truth or Dare, Name that tune, Where in the world, Atlas, Trivia night and party games to play with friends, plus quieter games to play on your own.`,
  scripts: ["games"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Games", title: "Games for <em>everyone</em>", lede: `${GAMES.length} games. Party games and quizzes to play with friends on their own phones, and quieter ones to play on your own. Open one and it fills the screen. No sign-up, no ads.`, accent: "g" })}

<section class="sec" style="padding-top:2.5rem">
  <div class="wrap-x">
    <div class="gfeat reveal" id="gFeat" hidden>
      <div class="gfeat-t"><p class="label"><span>Today's pick</span></p><h2 id="gFeatT"></h2><p id="gFeatH"></p></div>
      <div class="gfeat-a"><button class="btn btn-primary" id="gFeatGo" type="button"><span class="btn-t">Play it now</span><span class="btn-i">${icon("arrow", 18)}</span></button><button class="btn btn-ghost" id="gSurprise" type="button"><span class="btn-t">Surprise me</span></button></div>
    </div>
    <div class="gtogether reveal" id="gTogether">
      <div class="gtg-t"><p class="label"><span>Play together</span></p><h2>Play with friends on their own devices</h2><p>Make a room, share the code or link, and play in real time. No accounts, nothing to install. The board grows with every player who joins.</p></div>
      <div class="gtg-a">
        <div class="gtg-box"><label for="gtGame">Pick a game</label><div class="row"><select class="mini" id="gtGame">${GAMES.filter((g) => g.mp).map((g) => `<option value="${g.id}">${esc(g.title)} (${g.mp[0] === g.mp[1] ? g.mp[0] : g.mp[0] + " to " + g.mp[1]} players)</option>`).join("")}</select><button class="btn btn-primary" id="gtCreate" type="button"><span class="btn-t">Create a room</span></button></div></div>
        <div class="gtg-box"><label for="gtCode">Have a code?</label><div class="row"><input class="text-in tg-codein" id="gtCode" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC DEF" aria-label="Room code"><button class="btn btn-ghost" id="gtJoin" type="button"><span class="btn-t">Join</span></button></div></div>
      </div>
    </div>
    <div class="gtools">
      <div class="chips" id="gChips" role="group" aria-label="Filter games">${[["all", "All games"], ["friends", "With friends"], ["new", "New"], ...CATS.filter(([k]) => k !== "all")].map(([k, l]) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}</div>
      <p class="muted small" id="gCount" aria-live="polite">${GAMES.length} games</p>
    </div>
    <h2 class="sr-only">All games</h2>
    <div class="gcards" id="gameGrid">
      ${GAMES.map((g, i) => `<button class="gcard reveal" type="button" data-id="${g.id}" data-cat="${g.cat}" data-mp="${g.mp ? g.mp.join("-") : ""}" data-unit="${esc(g.best?.unit || "")}"${g.isNew ? " data-new=\"1\"" : ""} style="--c:var(--${g.c});--i:${i % 4};--a:${(i * 47) % 360}deg" aria-haspopup="dialog">
        <span class="gc-art">${gameArt(g.id)}</span>
        <span class="gc-top"><span class="gc-no">${String(i + 1).padStart(2, "0")}</span>${g.mp ? `<span class="gc-tg">Together ${g.mp[0] === g.mp[1] ? g.mp[0] : g.mp[0] + "-" + g.mp[1]}</span>` : ""}${g.isNew ? `<span class="gc-new">New</span>` : ""}<span class="gc-played" hidden>Played</span></span>
        <span class="gc-t">${esc(g.title)}</span>
        <span class="gc-how">${esc(g.how)}</span>
        <span class="gc-meta"><span>${esc(CAT[g.cat])}</span><span>${g.mins} min</span><span title="${LVL[g.lvl]}" aria-label="${LVL[g.lvl]}">${dots(g.lvl)}</span></span>
        <span class="gc-foot"><span class="gc-best" hidden></span><span class="gc-go">Play ${icon("arrow", 16)}</span></span>
      </button>`).join("")}
    </div>
    <noscript><p class="muted">The games need JavaScript. Everything else on this site works without it.</p></noscript>
    <p class="muted small" style="margin-top:2rem">Sounds stay silent until you tap something. Everything is generated in your browser, and your best scores stay on this device only.</p>

    <div class="card reveal" style="--c:var(--violet);text-align:center;margin-top:clamp(3rem,6vw,5rem);padding:clamp(2rem,5vw,3.5rem)">
      <p class="qtext" id="qText" data-quotes='${esc(JSON.stringify(QUOTES))}'></p>
      <p class="muted small" id="qBy" style="margin:0 auto 1.2rem"></p>
      <button class="btn btn-ghost btn-sm" id="qNext" type="button">Another thought</button>
    </div>
  </div>
</section>

<script type="application/json" id="gameData">${JSON.stringify({ myths: MYTHS.filter((m) => m[0] === "Myth").map((m) => ({ q: m[1].replace(/^"|"$/g, ""), e: m[2] })), facts: FACTS }).replace(/</g, "\\u003c")}</script>

<div class="gm" id="gm" role="dialog" aria-modal="true" aria-labelledby="gmTitle" hidden>
  <div class="gm-panel" id="gmPanel" tabindex="-1">
    <header class="gm-head">
      <div class="gm-id"><p class="gm-cat" id="gmCat"></p><h2 id="gmTitle"></h2></div>
      <p class="gm-how" id="gmHow"></p>
      <p class="gm-best" id="gmBest" aria-live="polite"></p>
      <div class="gm-tools"><button class="gm-btn" id="gmFull" type="button" hidden>Full screen</button><button class="gm-btn gm-close" id="gmClose" type="button" aria-label="Close game"><span class="gm-close-t">Close</span> ${icon("close", 16)}</button></div>
    </header>
    <div class="gm-body" id="gmBody" data-lenis-prevent></div>
    <footer class="gm-foot"><button class="gm-btn" id="gmPrev" type="button">&larr; Previous game</button><span class="gm-hint">Esc to close</span><button class="gm-btn" id="gmNext" type="button">Next game &rarr;</button></footer>
  </div>
</div>`
};
