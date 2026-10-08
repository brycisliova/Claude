import { esc, hero, sectionHead } from "../layout.mjs";
import { LETTERS, GLOSSARY } from "../data/content.mjs";

const GC = ["r", "o", "y", "g", "b", "v", "pink", "sky"];

export default {
  slug: "learn",
  title: "LGBTQIA+ explained",
  accent: "r",
  desc: "Every letter of LGBTQIA+ explained gently, four separate dials of identity, India's own gender traditions, and a searchable glossary.",
  scripts: ["learn"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "The vocabulary", title: "LGBTQIA+, <em class=\"grad\">explained gently</em>", lede: "The acronym grew because people kept finding words for experiences that had always existed. No one needs to memorise it. It's a way of saying everyone here belongs.", accent: "r" })}

<section class="section">
  <div class="wrap">
    <h2 class="sr-only">The letters</h2>
    <div class="letters">
      ${LETTERS.map(([g, t, d, c], i) => `<div class="card letter lift reveal" style="--c:var(--${c});--i:${i % 4}"><div class="glyph">${g}</div><div><h4>${esc(t)}</h4><p>${esc(d)}</p></div></div>`).join("")}
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    ${sectionHead("Four separate dials", "Not one switch", "The most common confusion is mixing up four different things. Drag the dials. Moving one never moves the others.")}
    <div class="card reveal" style="--c:var(--v);padding:clamp(1.5rem,3vw,2.5rem)">
      <div class="dials">
        <div class="dial"><label for="d1">Sex characteristics <span>Chromosomes, hormones, anatomy</span></label><input id="d1" type="range" min="0" max="100" value="15" style="--a:var(--b);--z:var(--pink)"><div class="ends"><span>Typically male</span><span>Intersex variations</span><span>Typically female</span></div></div>
        <div class="dial"><label for="d2">Gender identity <span>Who you know yourself to be</span></label><input id="d2" type="range" min="0" max="100" value="15" style="--a:var(--sky);--z:var(--v)"><div class="ends"><span>Man</span><span>Non-binary</span><span>Woman</span></div></div>
        <div class="dial"><label for="d3">Gender expression <span>How you dress, speak, present</span></label><input id="d3" type="range" min="0" max="100" value="30" style="--a:var(--g);--z:var(--y)"><div class="ends"><span>Masculine</span><span>Androgynous</span><span>Feminine</span></div></div>
        <div class="dial"><label for="d4">Attraction <span>Whom you're drawn to</span></label><input id="d4" type="range" min="0" max="100" value="90" style="--a:var(--o);--z:var(--r)"><div class="ends"><span>Men</span><span>More than one gender</span><span>Women</span></div></div>
      </div>
      <p class="dial-note" id="dialNote" aria-live="polite"></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead("Not a Western import", "India's own gender traditions", "Gender diversity is not a foreign idea. South Asia has some of the world's oldest communities of people outside the man-woman binary.")}
    <div class="grid" style="--min:15rem">
      <div class="card edge reveal" style="--c:var(--r)"><h4>Hijra and Kinnar</h4><p class="muted" style="margin:.6rem 0 0">Centuries-old communities with their own social structures and the guru-chela tradition, recorded in Mughal courts and earlier.</p></div>
      <div class="card edge reveal" style="--c:var(--y);--i:1"><h4>Aravani and Thirunangai</h4><p class="muted" style="margin:.6rem 0 0">Tamil identities. The annual Koovagam festival celebrates Aravan from the Mahabharata.</p></div>
      <div class="card edge reveal" style="--c:var(--g);--i:2"><h4>Jogti and Jogappa</h4><p class="muted" style="margin:.6rem 0 0">Gender-diverse devotees of the goddess Yellamma in Karnataka and Maharashtra.</p></div>
      <div class="card edge reveal" style="--c:var(--v);--i:3"><h4>Epics and temples</h4><p class="muted" style="margin:.6rem 0 0">Shikhandi in the Mahabharata, Ardhanarishvara, the half-Shiva half-Parvati form, and the carvings of Khajuraho.</p></div>
    </div>
  </div>
</section>

<section class="section alt" id="glossary">
  <div class="wrap">
    ${sectionHead("Glossary", "Words, plainly", "Thirty-two terms in everyday language. Search for any word.")}
    <label class="sr-only" for="glossSearch">Search the glossary</label>
    <input class="search reveal" id="glossSearch" type="search" placeholder="Search a word, like pansexual or deadname" autocomplete="off">
    <div class="gloss" id="gloss">
      ${GLOSSARY.map(([t, d], i) => `<div class="gloss-item" style="--c:var(--${GC[i % 8]})" data-text="${esc((t + " " + d).toLowerCase())}"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join("")}
    </div>
    <div class="empty" id="glossNone" hidden>No match. Try another word.</div>
  </div>
</section>`
};
