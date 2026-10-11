import { esc } from "../layout.mjs";
import { hero, head, photo } from "../ui.mjs";
import { LETTERS, GLOSSARY } from "../data/content.mjs";

export default {
  slug: "learn",
  title: "LGBTQIA+ explained",
  accent: "pink",
  desc: "Every letter of LGBTQIA+ explained gently, four separate dials of identity, India's own gender traditions, and a searchable glossary.",
  scripts: ["learn"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Learn", title: "LGBTQIA+ <em>explained</em>", lede: "The acronym grew because people kept finding words for experiences that had always existed. No one needs to memorise it. It's a way of saying everyone here belongs." })}

<section class="sec">
  <div class="wrap-x">
    ${head("The letters", "The <em>letters</em>")}
    <h2 class="sr-only">The letters</h2>
    <div class="letters">
      ${LETTERS.map(([g, t, d, c], i) => `<div class="letter reveal" style="--c:var(--${c});--i:${i % 4}"><span class="glyph" aria-hidden="true">${g}</span><div><h3 class="ct">${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join("")}
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap">
    ${head("Four separate dials", "Four separate <em>things</em>", "The most common confusion is mixing up four different things. Drag the dials. Moving one never moves the others.")}
    <div class="dials reveal">
      <div class="dial"><label for="d1">Sex characteristics <span>Chromosomes, hormones, anatomy</span></label><input id="d1" type="range" min="0" max="100" value="15"><div class="ends"><span>Typically male</span><span>Intersex variations</span><span>Typically female</span></div></div>
      <div class="dial"><label for="d2">Gender identity <span>Who you know yourself to be</span></label><input id="d2" type="range" min="0" max="100" value="15"><div class="ends"><span>Man</span><span>Non-binary</span><span>Woman</span></div></div>
      <div class="dial"><label for="d3">Gender expression <span>How you dress, speak, present</span></label><input id="d3" type="range" min="0" max="100" value="30"><div class="ends"><span>Masculine</span><span>Androgynous</span><span>Feminine</span></div></div>
      <div class="dial"><label for="d4">Attraction <span>Whom you're drawn to</span></label><input id="d4" type="range" min="0" max="100" value="90"><div class="ends"><span>Men</span><span>More than one gender</span><span>Women</span></div></div>
    </div>
    <p class="dial-note reveal" id="dialNote" aria-live="polite"></p>
  </div>
</section>

<div class="interlude">${photo(ctx, "interlude-2")}</div>

<section class="sec">
  <div class="wrap">
    ${head("Not a Western import", "Gender diversity <em>in India</em>", "Gender diversity is not a foreign idea. South Asia has some of the world's oldest communities of people outside the man-woman binary.")}
    <div class="grid" style="--min:17rem">
      <div class="card edge lift reveal" style="--c:var(--r)"><h3 class="ct">Hijra and Kinnar</h3><p class="muted" style="margin:.8rem 0 0">Centuries-old communities with their own social structures and the guru-chela tradition, recorded in Mughal courts and earlier.</p></div>
      <div class="card edge lift reveal" style="--c:var(--y);--i:1"><h3 class="ct">Aravani and Thirunangai</h3><p class="muted" style="margin:.8rem 0 0">Tamil identities. The annual Koovagam festival celebrates Aravan from the Mahabharata.</p></div>
      <div class="card edge lift reveal" style="--c:var(--g);--i:2"><h3 class="ct">Jogti and Jogappa</h3><p class="muted" style="margin:.8rem 0 0">Gender-diverse devotees of the goddess Yellamma in Karnataka and Maharashtra.</p></div>
      <div class="card edge lift reveal" style="--c:var(--v);--i:3"><h3 class="ct">Epics and temples</h3><p class="muted" style="margin:.8rem 0 0">Shikhandi in the Mahabharata, Ardhanarishvara, the half-Shiva half-Parvati form, and the carvings of Khajuraho.</p></div>
    </div>
  </div>
</section>

<section class="sec alt" id="glossary">
  <div class="wrap">
    ${head("Glossary", "Glossary", "Thirty-two terms in everyday language. Search for any word.")}
    <label class="sr-only" for="glossSearch">Search the glossary</label>
    <input class="search reveal" id="glossSearch" type="search" placeholder="Search a word, like pansexual or deadname" autocomplete="off">
    <div class="gloss" id="gloss">
      ${GLOSSARY.map(([t, d]) => `<div class="gloss-item" data-text="${esc((t + " " + d).toLowerCase())}"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join("")}
    </div>
    <div class="empty" id="glossNone" hidden>No match. Try another word.</div>
  </div>
</section>`
};
