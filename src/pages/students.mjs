import { readFileSync } from "node:fs";
import { esc } from "../layout.mjs";
import { hero, arrowBtn } from "../ui.mjs";

// src/data/students.json: every entry was read on the organisation's or government's own page on 23 October 2026.
const DATA = JSON.parse(readFileSync(new URL("../data/students.json", import.meta.url), "utf8"));
const CHECKED = "23 October 2026";
const DROP = new Set(["ilga-world-support", "educationusa-india", "pew-marriage-years"]);
const FIX = {
  chevening: { gives: "A one-year master's in the UK. The official page calls the awards fully funded." },
  "ilga-europe-rainbow-map-2026": { gives: "Published 12 May 2026. Spain is first, ahead of Malta, Iceland, Belgium and Denmark. The UK is 22nd. Russia, Azerbaijan and Turkey are at the bottom. Scores run from 0 to 100% and measure laws and policies, nothing else." }
};
const STATUS = { closed: ["Closed now", "no"], "closed-2027-28": ["Closed this round", "no"], "closed-2027": ["Closed this round", "no"], "open-now": ["Open", "yes"], "open-for-2027-28": ["Open for 2027-28", "yes"], "closing-soon": ["Closing soon", "soon"], "opens-december-2026": ["Opens December 2026", "soon"], "not-for-india-residents": ["Not for people living in India", "no"], "not-for-india-citizens": ["Not for Indian citizens", "no"], "check-site": ["Check the site", "ask"], "check-each-school": ["Check each school", "ask"], "check-each-call": ["Check each call", "ask"], "check-each-university": ["Check each university", "ask"] };
const ORDER = ["lgbtq-scholarships", "general-scholarships", "applying", "safest-countries", "visas-and-partners", "support-orgs", "india-side"];
const TITLE = {
  "lgbtq-scholarships": ["Scholarships made for LGBTQ+ students", "Awards made for LGBTQ+ students are few. Most are for people who already live or study in the US, UK or Australia, and many are closed right now. These are the ones we could confirm. Where an award is not open to Indian students, we say so."],
  "general-scholarships": ["General scholarships open to Indian students", "This is where most of the real money is. These scholarships are open to anyone who qualifies and are not LGBTQ+ awards. Chevening says in writing that orientation does not matter. On the other pages we read, we found no question about orientation."],
  applying: ["Applying: what you do not have to share", "You never have to share your orientation to get a place or a general scholarship. If you choose to write about LGBTQ+ community work, treat it as one example of leadership. Your safety and privacy come first."],
  "safest-countries": ["Which countries are safer and more protective", "No ranking tells you how safe you will feel on an ordinary Tuesday. Law is one part. For Europe we use ILGA-Europe's 2026 Rainbow Map. Elsewhere we use laws and court rulings where we could open them, and a community-edited database where we could not. We say which is which."],
  "visas-and-partners": ["Student visas and bringing a partner", "Rules for bringing a partner are tight and keep changing. On many taught Master's courses a partner cannot join you at all. Several of these pages never use the words same-sex, so if you are unsure, ask the immigration office before you pay for anything."],
  "support-orgs": ["Support, health cover and housing", "Places to ask for help, and plain guides to health cover and housing. Few are made only for international LGBTQ+ students, so we also show how to find a campus office or a student group."],
  "india-side": ["In India: documents and community groups", "India's rules for transgender identity certificates were amended in 2026, and we could not confirm every detail from an official page. The community groups below mostly work on health and support. We did not find one that gives study-abroad advice."]
};
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "official page"; } };
const sentence = (s) => esc(String(s || "").replace(/https?:\/\/\S+/g, "").replace(/\s*:\s*$/, "").replace(/\s+/g, " ").trim());

function card(it) {
  const f = FIX[it.id] || {}, who = f.who ?? it.who, gives = f.gives ?? it.gives, note = f.note ?? it.note;
  const st = STATUS[it.status] ? `<span class="st-chip st-${STATUS[it.status][1]}">${STATUS[it.status][0]}</span>` : "";
  const isGuide = /guide|visa|country-fact/.test(it.kind);
  return `<article class="st-card">
    <header><h3 class="ct"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.name)}</a></h3><p class="st-meta">${esc(it.country)}${st ? " · " : ""}${st}</p></header>
    <dl>${who && !(isGuide && who.length < 4) ? `<div><dt>Who it is for</dt><dd>${sentence(who)}</dd></div>` : ""}${gives ? `<div><dt>${isGuide ? "What it says" : "What you get"}</dt><dd>${sentence(gives)}</dd></div>` : ""}${note ? `<div><dt>Good to know</dt><dd>${sentence(note)}</dd></div>` : ""}</dl>
    <p class="st-src"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(host(it.url))}</a> · read ${CHECKED}</p>
  </article>`;
}
const country = (c) => {
  const rank = c.ilga_rank && /\d+(st|nd|rd|th) of/.test(c.ilga_rank) ? c.ilga_rank.replace(/\s*\([^)]*\)/, "") + " on the Rainbow Map" : "Not on the Rainbow Map (Europe only)";
  const src = (c.sources || []).slice(0, 4).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a>`).join(" · ");
  return `<article class="st-card st-country"><header><h3 class="ct">${esc(c.country)}</h3><p class="st-meta">${esc(rank)} · Marriage since ${esc(c.marriage)}</p></header>
    <dl><div><dt>Protection in law</dt><dd>${sentence(c.protections)}</dd></div><div><dt>Trans students</dt><dd>${sentence(c.trans)}</dd></div><div><dt>Before you choose</dt><dd>${sentence(c.caveat)}</dd></div></dl>
    <p class="st-src">${src} · read ${CHECKED}</p></article>`;
};

export default {
  slug: "students",
  title: "Study abroad",
  accent: "green",
  desc: "Scholarships, safer countries, partner and visa rules, and where to get help, for LGBTQIA+ students who want to study abroad. Every entry checked on an official page.",
  scripts: [],
  body: (ctx) => {
    const groups = Object.fromEntries(DATA.groups.map((g) => [g.id, g]));
    const sections = ORDER.map((id) => {
      const g = groups[id]; if (!g) return "";
      const [title, intro] = TITLE[id];
      const items = g.items.filter((it) => !DROP.has(it.id));
      const body = id === "safest-countries" ? `<div class="st-grid">${DATA.countries.map(country).join("")}</div><h3 class="st-sub">The sources behind the table</h3><div class="st-grid">${items.filter((it) => !/^(uk-|canada-|australia-|us-|spain-|ireland-)/.test(it.id) || /executive-order|supreme-court/.test(it.id)).map(card).join("")}</div>` : `<div class="st-grid">${items.map(card).join("")}</div>`;
      return `<section class="sec${ORDER.indexOf(id) % 2 ? " alt" : ""}" id="${id}"><div class="wrap-x"><header class="sec-head"><p class="label"><span class="no"></span>${esc(title.split(":")[0])}</p><div class="sec-head-main"><h2 class="sec-title">${esc(title)}</h2><p class="sec-lede">${esc(intro)}</p></div></header>${body}</div></section>`;
    }).join("");
    const nav = ORDER.map((id) => `<a href="#${id}">${esc(TITLE[id][0].replace(/^Which countries are safer and more protective$/, "Safer countries").replace(/^Scholarships made for LGBTQ\+ students$/, "LGBTQ+ scholarships").replace(/^General scholarships open to Indian students$/, "General scholarships").replace(/^Applying: what you do not have to share$/, "Applying and privacy").replace(/^Student visas and bringing a partner$/, "Visas and partners").replace(/^Support, health cover and housing$/, "Support and housing").replace(/^In India: documents and community groups$/, "In India"))}</a>`).join("");
    return `
${hero(ctx, { eyebrow: "Study abroad", title: "Studying <em>abroad</em>", lede: "For LGBTQIA+ students, especially from India, who are thinking about a degree somewhere safer. Scholarships, how countries compare, what to ask before you go, and where to get help. Everything here was read on an official page, and we say so when we could not." })}

<section class="sec" style="padding-top:2.4rem">
  <div class="wrap-x">
    <div class="st-top">
      <p class="callout" role="note"><strong>Read this first.</strong> Deadlines, rules and visa law change often. Everything below was checked on ${CHECKED}. Open the official link before you decide anything, and treat this page as a map, not as advice from a lawyer or an adviser.</p>
      <ul class="st-points">
        <li><strong>Very few scholarships are made for LGBTQ+ students from India.</strong> Most are for people already living in the US, UK or Australia. The real money is in general scholarships, and they do not ask about orientation.</li>
        <li><strong>You never have to share your orientation</strong> to get a place or a general scholarship. Write about it only if you want to.</li>
        <li><strong>Law is only part of safety.</strong> A strong score on a map does not mean every street is friendly. Look for a campus LGBTQ+ office or student group before you apply, and write to them.</li>
        <li><strong>Check partner rules first</strong> if you are in a relationship. On many courses a partner cannot join you, and the rules just changed in Australia.</li>
        <li><strong>Trans students:</strong> the rules in the US and the UK moved in 2025. Read each university's policy before you commit.</li>
      </ul>
    </div>
    <nav class="st-nav" aria-label="On this page">${nav}</nav>
  </div>
</section>
${sections}
<section class="sec">
  <div class="wrap-x">
    <p class="muted">Something out of date, wrong or missing? Write to <a href="mailto:${esc(ctx.config.email)}">${esc(ctx.config.email)}</a> and we will fix it. If you need someone to talk to about any of this, <a href="${ctx.href("help")}">Help and guides</a> lists free, confidential helplines.</p>
    <div class="cta-row">${arrowBtn(ctx.href("help"), "Help and guides")}${arrowBtn(ctx.href("india"), "India and the world: the data", "btn--ghost")}</div>
  </div>
</section>`;
  }
};
