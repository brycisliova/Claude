import { PAGES, NAV_GROUPS, esc, icon } from "../layout.mjs";
import { photo, hasPhoto, arrowBtn } from "../ui.mjs";
import { QUOTES } from "../data/content.mjs";
import { GAMES } from "../data/games.mjs";
import { gameArt } from "../data/game-art.mjs";

const PANELS = [
  ["hero-choice", "pink", "science/#choice", "01", "Not a <em>choice.</em>", "Twins, genes and 477,522 people agree: nobody picks who they love.", "Read the science"],
  ["hero-illness", "yellow", "science/#illness", "02", "Not an <em>illness.</em>", "WHO, psychiatrists and India's own society settled this long ago.", "See who agrees"],
  ["hero-who", "blue", "stories/", "03", "Just who <em>we are.</em>", "Real stories, real history, and a place to be heard.", "Meet us"]
];
const PICKS = ["tod", "tune", "geo", "gk", "atlas", "breathe"];
const QCOL = ["pink", "yellow", "blue", "green", "violet", "orange", "sky", "r"];

export default {
  slug: "",
  title: "Home",
  accent: "pink",
  desc: "A calm, research-backed home for understanding LGBTQIA+ lives: the science, the history, queer India, therapies, sound, games, and a place to be heard.",
  scripts: ["home"],
  body: (ctx) => {
    const { href } = ctx;
    const GAMES_HOME = PICKS.map((id, i) => GAMES.find((g) => g.id === id)).map((g, i) => `<a class="gcard arc-card reveal" href="${href("games")}#g-${g.id}" style="--c:var(--${g.c});--i:${i % 3}" aria-label="Play ${esc(g.title)}">
        <span class="gc-art">${gameArt(g.id)}</span>
        <span class="gc-top"><span class="gc-no">${String(i + 1).padStart(2, "0")}</span>${g.mp ? `<span class="gc-tg">Together ${g.mp[0] === g.mp[1] ? g.mp[0] : g.mp[0] + "-" + g.mp[1]}</span>` : ""}</span>
        <span class="gc-t">${esc(g.title)}</span>
        <span class="gc-how">${esc(g.how)}</span>
        <span class="gc-foot"><span class="gc-go">Play ${icon("arrow", 16)}</span></span>
      </a>`).join("");
    const panels = PANELS.map(([id, c, to, no, title, sub, cta]) => `
      <a class="panel${hasPhoto(id) ? " has-photo" : ""}" href="${ctx.base}${to}" style="--c:var(--${c})" data-cursor="Open">
        ${photo(ctx, id, { class: "ph--panel", static: true, ratio: 0.62, sizes: "(max-width:820px) 100vw, 40vw", eager: true, credit: "text" })}
        <span class="panel-top"><span class="panel-no">(${no})</span></span>
        <span class="panel-body"><span class="panel-title" data-split>${title}</span><span class="panel-sub">${sub}</span><span class="panel-cta">${cta} ${icon("arrow", 16)}</span></span>
      </a>`).join("");

    const groups = NAV_GROUPS.filter(([g]) => g !== "About").map(([label, items]) => {
      const rows = items.map((k) => {
        const [s, l, , c, d, idx] = PAGES[k];
        return `<a class="chapter" href="${href(s)}" style="--c:var(--${c})" data-peek="${s}" data-cursor="Open"><span class="chapter-no">${idx}</span><span class="chapter-t">${esc(l)}</span><span class="chapter-d">${esc(d)}</span><span class="chapter-a">${icon("arrow", 18)}</span></a>`;
      }).join("");
      return `<div class="chapters-group"><p class="label">${label}</p></div>${rows}`;
    }).join("");
    const peeks = NAV_GROUPS.filter(([g]) => g !== "About").flatMap(([, items]) => items).map((k) => `<div class="peek-card" data-for="${k}">${photo(ctx, "hero-" + k, { ratio: 0.8, static: true, credit: false })}</div>`).join("");

    const thoughts = QUOTES.slice(0, 8).map(([q, by], i) => `<article class="hs-card" style="--c:var(--${QCOL[i % 8]})"><p class="label"><span>${String(i + 1).padStart(2, "0")}</span><span>${esc(by)}</span></p><q>${esc(q)}</q></article>`).join("");

    return `
<section class="hero" data-tone="${hasPhoto("hero-choice") ? "dark" : "light"}" aria-labelledby="h1">
  <h1 id="h1" class="sr-only">Who We Are: Not a choice. Not an illness. Just who we are.</h1>
  ${panels}
</section>

<section class="sec">
  <div class="wrap">
    <p class="manifesto" data-manifesto>This is a place for understanding, healing and being seen. The science is settled: orientation is <em>not a choice</em>, <em>not an illness</em>, and cannot be fixed. What is left is how we treat each other. <em>Let us live.</em></p>
    <div class="cta-row reveal">${arrowBtn(href("science"), "See the evidence")}${arrowBtn(href("help"), "I need help right now", "btn--ghost")}</div>
  </div>
</section>


<section class="strip" aria-label="Photographs">
  <div class="strip-row">
    <div class="strip-col" data-drift="1">${photo(ctx, "strip-1", { ratio: 0.78, class: "reveal-clip", sizes: "(max-width:820px) 80vw, 28vw" })}</div>
    <div class="strip-col strip-col--mid" data-drift="-1">${photo(ctx, "strip-2", { ratio: 1, class: "reveal-clip", sizes: "(max-width:820px) 80vw, 32vw" })}</div>
    <div class="strip-col" data-drift="1">${photo(ctx, "strip-3", { ratio: 0.78, class: "reveal-clip", sizes: "(max-width:820px) 80vw, 28vw" })}</div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap-x">
    <header class="sec-head"><p class="label reveal"><span class="no"></span>Sections</p><div class="sec-head-main"><h2 class="sec-title" data-split>Explore the <em>site</em></h2></div></header>
  </div>
  <div class="chapters" id="chapters">${groups}</div>
  <div class="peek" id="peek" aria-hidden="true">${peeks}</div>
</section>

<section class="sec arcade" aria-labelledby="arcadeT">
  <div class="wrap-x">
    <header class="sec-head"><p class="label reveal"><span class="no"></span>Play</p><div class="sec-head-main"><h2 class="sec-title" id="arcadeT" data-split>The <em>games</em> room</h2></div></header>
    <div class="arc-intro reveal">
      <p>${GAMES.length} games: Truth or Dare, Name that tune, Where in the world, Atlas and quizzes to play with friends on their own phones, plus calm ones to breathe, create and puzzle with. Make a room, share the code, and play together. No sign-up.</p>
      <div class="cta-row" style="margin:0">${arrowBtn(href("games"), `Open all ${GAMES.length} games`)}${arrowBtn(href("games") + "#gTogether", "Play with friends", "btn--ghost")}</div>
    </div>
    <div class="arc-row">${GAMES_HOME}</div>
  </div>
</section>

<section class="hs" data-hs data-tone="light">
  <div class="hs-head"><p class="label"><span class="no"></span>Quotes</p></div>
  <div class="hs-track">${thoughts}</div>
</section>

<section class="split2 block" style="--c:var(--pink)">
  <div class="feature-q">
    <p class="label"><span class="no"></span>Reiner's story</p>
    <blockquote data-split>The people I was sure would never accept me supported me the most.</blockquote>
  </div>
  <div class="feature-r">
    <p class="reveal">I realised I was different, and felt it was wrong. Then I learned, and learned, and learned, and was still too scared to tell anyone. This place is what came after: for anyone who is struggling, and for anyone who still believes it is a choice, if they are willing to read the evidence.</p>
    <div class="cta-row" style="margin:0">${arrowBtn(href("stories") + "#reiner", "Read the whole story")}${arrowBtn(href("about"), "About Reiner", "btn--ghost")}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap-x">
    <header class="sec-head"><p class="label reveal"><span class="no"></span>The record</p><div class="sec-head-main"><h2 class="sec-title" data-split>What is <em>settled</em></h2></div></header>
    <div class="stats">
      <div class="stat reveal"><strong data-count="1973">0</strong><span>American psychiatrists removed homosexuality from their list of mental disorders</span></div>
      <div class="stat reveal" style="--i:1"><strong data-count="1990">0</strong><span>The World Health Organization removed it from its classification of diseases</span></div>
      <div class="stat reveal" style="--i:2"><strong data-count="2018">0</strong><span>India's Supreme Court decriminalised same-sex love</span></div>
      <div class="stat reveal" style="--i:3"><strong data-count="477522">0</strong><span>people in the largest genetic study of sexual orientation ever done</span></div>
    </div>
  </div>
</section>

<section class="sec ink">
  <div class="wrap">
    <p class="label reveal" style="margin-bottom:2rem"><span class="no"></span>India and the world</p>
    <h2 class="sec-title" data-split style="margin-bottom:clamp(2.5rem,5vw,5rem);max-width:12ch">No official <em>count</em></h2>
    <div class="big-num">
      <div class="reveal"><strong data-count="9">0</strong><span>transgender murder victims in the national crime bureau's 2022 report, out of 29,356 murders. It counts victims, not reasons.</span></div>
      <div class="reveal" style="--i:1"><strong><span data-count="47" style="display:inline;margin:0;color:inherit">0</span>%</strong><span>of 164 Indian news reports on LGBTQ suicides blamed a family not accepting the person</span></div>
      <div class="reveal" style="--i:2"><strong data-count="65">0</strong><span>countries still criminalise consensual same-sex relations. India stopped in 2018.</span></div>
    </div>
    <div class="cta-row reveal">${arrowBtn(href("india"), "See the data and sources", "btn--light")}</div>
  </div>
</section>

<a class="cta-giant block" href="tel:14416" style="--c:var(--blue)" data-cursor="Call">
  <p class="label"><span>If today is heavy</span></p>
  <span class="cta-giant-t" data-split>You don't have to <em>carry it alone.</em></span>
  <span class="cta-giant-row"><span class="btn btn--ghost" style="pointer-events:none"><span class="btn-t">Tele-MANAS 14416</span><span class="btn-i">${icon("phone", 18)}</span></span><span class="small">Free, confidential, 24/7, in 20+ languages</span></span>
</a>`;
  }
};
