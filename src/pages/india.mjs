import { esc } from "../layout.mjs";
import { hero, sectionHead, arrowBtn } from "../ui.mjs";
import { fact, OFFICIAL, NEWS, GLOBAL, allSources } from "../data/violence.mjs";

const num = (n) => Number(n).toLocaleString("en-IN");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "source"; } };
const link = (f, label) => `<a href="${esc(f.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(label || host(f.sourceUrl))}</a>`;
const short = (s, n = 70) => (s.length > n ? s.slice(0, n - 1).replace(/[\s,;:]+$/, "") + "…" : s);
const COL = ["pink", "orange", "yellow", "green", "blue", "violet", "sky", "r"];

/* a card with one percentage shown as one hundred people */
function card(id, { big, title, tag, pct, must = [], col, note }) {
  const f = fact(id, ...(must.length ? must : [big])), p = pct ?? parseFloat(big), dec = String(big).includes(".") ? String(big).split(".")[1].length : 0;
  const meta = [f.n && f.n !== "null" ? "n=" + f.n : "", f.scope && f.scope !== "null" ? f.scope : "", f.period && f.period !== "null" ? f.period : ""].filter(Boolean).join(" · ");
  return `<article class="vz-card d100 reveal" style="--c:var(--${col || "pink"})" data-n="${p}">
    <span class="vz-tag">${esc(tag)}</span>
    <p class="vz-big"><span class="cnt" data-v="${parseFloat(big)}" data-d="${dec}">${esc(big)}</span><small>%</small></p>
    <h4>${esc(title)}</h4>
    <div class="d100-grid" aria-hidden="true"></div>
    <p>${esc(f.claim.replace(/\s*\[[^\]]*\]\s*$/, ""))}</p>
    ${note ? `<p class="vz-meta">${esc(note)}</p>` : ""}
    <p class="vz-meta">${esc(meta)}${meta ? " · " : ""}${link(f, short(f.sourceName, 60))}</p>
  </article>`;
}
const cards = (list) => `<div class="vz-grid">${list.map(([id, o], i) => card(id, { col: COL[i % COL.length], ...o })).join("")}</div>`;

/* vertical bars; items: [label, value, note] */
function vbars(items, { color = "r", max, aria }) {
  const m = max || Math.max(...items.map((i) => i[1]));
  return `<div class="vbars reveal" tabindex="0" style="--c:var(--${color})" role="img" aria-label="${esc(aria)}">${items.map(([l, v, note], k) => `<div class="vb" style="--k:${k}"><b>${num(v)}</b><span class="col"><i style="--h:${Math.max(3, (v / m) * 100)}%"></i></span><span>${esc(l)}</span>${note ? `<small class="muted">${esc(note)}</small>` : ""}</div>`).join("")}</div>`;
}
function hbars(items, { color = "b", max, aria }) {
  const m = max || Math.max(...items.map((i) => i[1]));
  return `<div class="hbars reveal" role="img" aria-label="${esc(aria)}">${items.map(([l, v], k) => `<div class="hb" style="--k:${k};--c:var(--${color})"><span>${esc(l)}</span><span class="tr"><i class="fl" style="--w:${Math.max(1.5, (v / m) * 100)}%"></i></span><b>${num(v)}</b></div>`).join("")}</div>`;
}
const stat = (n, label, f, col, extra = "") => `<article class="vz-card reveal" style="--c:var(--${col})"><p class="vz-big"><span class="cnt" data-v="${parseFloat(String(n).replace(/,/g, ""))}" data-d="${String(n).includes(".") ? 1 : 0}">${esc(n)}</span>${extra}</p><h4>${label}</h4><p class="vz-meta">${link(f, short(f.sourceName, 64))}</p></article>`;

/* ---------- the four main datasets, turned into page pieces ---------- */
const ncrbYears = ["2022", "2023", "2024"];
const ncrbMurder = ncrbYears.map((y) => fact(`ncrb-${y}-murder-trans`));
const tmm = GLOBAL.tmmSeries.filter((r) => r.reportYear >= 2012);
const TMM_LINE = { label: "Reported murders of trans and gender-diverse people worldwide, by Trans Murder Monitoring reporting year", points: tmm.map((r) => ({ l: String(r.reportYear), v: r.killings, note: r.period.replace(/ \(.*$/, "") })) };
const UK = [["2022/23", 24102, 4732], ["2023/24", 22839, 4780], ["2024/25", 18702, 3809], ["2025/26", 21407, 3955]];
const UK_LINE = { label: "Police-recorded sexual orientation hate crimes, England and Wales", points: UK.map(([y, so]) => ({ l: y, v: so })) };

// map layers
const C = GLOBAL.countries, ISO = Object.keys(C);
const lawStatus = { "death-penalty-possible": "death", "criminalised-prison": "crim", "criminalised-other-de-facto": "partial", "not-criminalised": "ok" };
const lawLayer = { id: "law", status: Object.fromEntries(ISO.map((k) => [k, lawStatus[C[k].status]])), counts: { death: 0, crim: 0, partial: 0, ok: 0 }, legend: [["death", "Death penalty possible"], ["crim", "Criminalised (prison)"], ["partial", "Criminalised in practice"], ["ok", "Not criminalised"], ["none", "No data"]], note: "ILGA World Database, queried 22 October 2026 (maps dated May 2026). 65 UN member states criminalise consensual same-sex acts." };
ISO.forEach((k) => { lawLayer.counts[lawStatus[C[k].status]]++; });
const marriageLayer = { id: "marriage", status: Object.fromEntries(ISO.map((k) => [k, C[k].sameSexMarriage ? "marriage" : C[k].status === "not-criminalised" ? "mid" : "crim"])), counts: {}, legend: [["marriage", "Same-sex marriage legal"], ["mid", "Not criminalised, no marriage"], ["crim", "Criminalised"], ["none", "No data"]], note: "Marriage: Pew Research Center fact sheet, 2 June 2025 (38 UN member states). Criminalisation: ILGA World." };
marriageLayer.counts = { marriage: ISO.filter((k) => C[k].sameSexMarriage).length, mid: ISO.filter((k) => !C[k].sameSexMarriage && C[k].status === "not-criminalised").length, crim: ISO.filter((k) => C[k].status !== "not-criminalised").length };
const notes = {};
GLOBAL.recentChanges.forEach((r) => { const k = ISO.find((i) => C[i].name === r.country); if (k) notes[k] = `${r.date}: ${r.change}`; });
const MAP = { label: "World map of laws on consensual same-sex relations", labels: { death: "Criminalised. Death penalty possible", crim: "Criminalised, prison", partial: "Criminalised in practice", ok: "Not criminalised", marriage: "Same-sex marriage legal", mid: "Not criminalised, marriage not legal" }, layers: [lawLayer, marriageLayer], notes, none: "No data" };
const cn = (k) => (lawLayer.counts[k]);

/* ---------- the incident and news record ---------- */
const items = NEWS.items.slice().sort((a, b) => (b.incidentDate + "").localeCompare(a.incidentDate + ""));
const TYPE = { killing: "Killing", suicide: "Suicide", family: "Family", mob: "Mob violence", police: "Police", blackmail: "Blackmail", conversion: "Conversion", discrimination: "Discrimination", court: "Court", policy: "Policy", milestone: "Milestone", other: "Other" };
const TCOL = { killing: "r", suicide: "violet", family: "orange", mob: "r", police: "yellow", blackmail: "pink", conversion: "orange", discrimination: "yellow", court: "blue", policy: "sky", milestone: "green", other: "bg2" };
const years = [...new Set(items.map((i) => i.incidentDate.slice(0, 4)))].sort().reverse();
const states = [...new Set(items.map((i) => i.state))].sort((a, b) => (a === "National" ? -1 : b === "National" ? 1 : a.localeCompare(b)));
const byYear = years.slice().reverse().map((y) => [y, items.filter((i) => i.incidentDate.startsWith(y)).length]);
const byType = Object.keys(TYPE).map((k) => [TYPE[k], items.filter((i) => i.type === k).length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]);
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = (d) => { const [y, m, dd] = d.split("-"); return `<b>${y}</b>${m ? MONTH[+m - 1] + (dd ? " " + +dd : "") : ""}`; };
const recHtml = items.map((i) => `<li class="rec" data-k="${i.type}" data-y="${i.incidentDate.slice(0, 4)}" data-s="${esc(i.state)}" data-q="${esc((i.headline + " " + i.summary + " " + i.state + " " + (i.tags || []).join(" ")).toLowerCase())}" style="--c:var(--${TCOL[i.type] || "bg2"})">
  <time datetime="${esc(i.incidentDate)}">${when(i.incidentDate)}</time>
  <div><h4>${esc(i.headline)}</h4><p>${esc(i.summary)}</p>${i.outcome ? `<p><strong>Outcome:</strong> ${esc(i.outcome)}</p>` : ""}
  <div class="tags"><span class="k">${esc(TYPE[i.type] || i.type)}</span><span>${esc(i.state)}</span><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">${esc(i.outlet)}</a></div></div></li>`).join("");

/* legal timeline */
const tlHtml = OFFICIAL.timeline.map((t, k) => `<li class="reveal" style="--i:${k % 4}"><time>${esc(t.date.length > 4 ? t.date.slice(0, 4) : t.date)}</time><div><h4>${esc(t.title)}</h4><p>${esc(t.detail)} ${t.sourceUrl ? `<a href="${esc(t.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>` : ""}</p></div></li>`).join("");

const changesHtml = GLOBAL.recentChanges.map((r, k) => `<li class="reveal" style="--i:${k % 4}"><time>${esc(r.date)}</time><div><h4>${esc(r.country)}</h4><p>${esc(r.change)} <a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a></p></div></li>`).join("");

const VZ = { tmm: TMM_LINE, uk: UK_LINE, map: MAP };

export default {
  slug: "india",
  title: "India and the world",
  accent: "b",
  desc: "Violence, discrimination and mental health among LGBTQ people in India and around the world: official records, studies, news, hate crime data, criminalisation laws and what is still unknown. Every figure is sourced.",
  scripts: ["india"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "India and the world", title: "Violence against <em>LGBTQ people</em>: the record", lede: "What official records, studies and news reports show in India and across the world about killings, family rejection, discrimination and mental health, and what is still not counted. Every number links to its source.", accent: "b" })}

<nav class="vz-nav" id="vzNav" aria-label="On this page"><ul>
  <li><a href="#glance">At a glance</a></li><li><a href="#counting">What is counted</a></li><li><a href="#law">Law and courts</a></li><li><a href="#studies">What studies find</a></li><li><a href="#record">News record</a></li><li><a href="#world">The world</a></li><li><a href="#map">Laws map</a></li><li><a href="#help">What helps</a></li><li><a href="#method">Method</a></li></ul></nav>

<section class="sec vz-sec" id="glance">
  <div class="wrap">
    ${sectionHead("Overview", "The numbers behind the stories", "Decriminalisation changed the law in India in 2018. These figures show what daily life, and the official record, still look like. Each card names its source, the place it covers and who was asked.")}
    <div class="vz-grid">
      ${stat("9", "transgender murder victims recorded by India's NCRB in 2022, out of 29,356 murder victims. It recorded 13 in 2023 and 9 in 2024.", ncrbMurder[0], "r")}
      ${stat("47", "of 164 Indian news reports on LGBTQ suicides (2001 to 2022) put the cause as a family not accepting the person's identity or relationship. Another 41% were couples dying together.", fact("khuman2025-family-trigger", "47%"), "violet", "<small>%</small>")}
      ${stat("96", "of 900 transgender people in a national human rights commission study said they were denied jobs (Delhi and Uttar Pradesh sample).", fact("nhrc-employment-denied", "96%"), "yellow", "<small>%</small>")}
      ${stat("39.2", "of 4,607 transgender women in a national HIV survey reported physical or sexual violence.", fact("pgph2022-violence", "39.2%"), "orange", "<small>%</small>")}
      ${stat("281", "trans and gender-diverse people reported murdered worldwide from October 2024 to September 2025, Transgender Europe counted. Asia's 51 cases were its highest ever.", fact("tmm-2025-total", "281"), "pink")}
      ${stat("65", "United Nations member states still criminalise consensual same-sex relations. In 12 the death penalty is possible. India stopped in 2018.", fact("crim-65", "65"), "blue")}
    </div>
    <p class="muted small">Counts are not comparable across cards. They come from different sources and different groups of people, and they are not a count of all cases.</p>
  </div>
</section>

<section class="sec alt vz-sec" id="counting">
  <div class="wrap narrow prose">
    ${sectionHead("Part one", "What India counts, and what it does not", "Anyone who gives you an exact yearly count of LGBTQ hate killings in India is guessing. Here is what the official tables actually hold.")}
    <div class="callout reveal" style="--c:var(--b)"><p><strong>No national hate-crime data.</strong> ${esc(fact("hate-crime-lok-sabha-2021").claim)} In December 2022 the Home Ministry told the Rajya Sabha that NCRB does not maintain data on hate crimes because the term is not defined in the IPC (${link(fact("hate-crime-lok-sabha-2021"), "ThePrint")}, ${link(fact("hate-crime-rs-2022"), "BOOM")}).</p></div>
    <p>The only LGBTQ-specific figures in the National Crime Records Bureau tables are for transgender people, and they count victims, not reasons. They say nothing about motive, and nothing at all about lesbian, gay or bisexual victims. A death caused by someone's identity is not a category in these tables.</p>
    <h3>What the NCRB records about transgender people</h3>
    ${vbars(ncrbMurder.map((f, i) => [ncrbYears[i], f.figure, "of " + num(fact(`ncrb-${ncrbYears[i]}-murder-trans`).claim.match(/out of ([\d,]+)/)[1].replace(/,/g, "")) + " victims"]), { color: "r", aria: "Transgender murder victims recorded by NCRB: 9 in 2022, 13 in 2023, 9 in 2024" })}
    <div class="table-wrap reveal" tabindex="0"><table>
      <caption class="sr-only">Transgender persons in NCRB Crime in India tables</caption>
      <thead><tr><th scope="col">NCRB table</th><th scope="col">2022</th><th scope="col">2023</th><th scope="col">2024</th></tr></thead>
      <tbody>
        <tr><td>Murder victims</td><td>${fact("ncrb-2022-murder-trans").figure}</td><td>${fact("ncrb-2023-murder-trans").figure}</td><td>${fact("ncrb-2024-murder-trans").figure}</td></tr>
        <tr><td>Kidnapping and abduction victims</td><td>${fact("ncrb-2022-kidnap-trans").figure}</td><td>${fact("ncrb-2023-kidnap-trans").figure}</td><td>${fact("ncrb-2024-kidnap-trans").figure}</td></tr>
        <tr><td>Persons reported missing</td><td>${fact("ncrb-2022-missing-trans").figure}</td><td>${fact("ncrb-2023-missing-trans").figure}</td><td>${fact("ncrb-2024-missing-trans").figure}</td></tr>
        <tr><td>Cases under the Transgender Persons Act</td><td>1</td><td>11</td><td>10</td></tr>
      </tbody>
    </table></div>
    <p class="muted small">${link(fact("ncrb-tg-act-cases"), "NCRB Crime in India 2024, Volume I")} (tables 1.3 and 2A.3 and the missing-persons and kidnapping tables), with the 2022 and 2023 editions. ${esc(fact("ncrb-rape-table-women-only").claim)}</p>
    <div class="callout reveal" style="--c:var(--y)"><p><strong>Few would report.</strong> Trans activists say low numbers reflect underreporting, not safety. In one Mumbai set of crisis cases handled by an LGBTQ organisation, only ${fact("li2017-recourse").figure}% sought legal recourse, most fearing exposure (${link(fact("li2017-recourse"), "Li et al., 2017")}).</p></div>
    <h3>Section 377 cases, before and after</h3>
    <p>Before 2018, Section 377 of the Indian Penal Code was used in cases of "unnatural offences". NCRB's counts include cases involving children, so they do not measure prosecutions of consenting adults. The Supreme Court noted in 2013 that fewer than 200 people had been prosecuted under it in over 150 years (${link(fact("koushal-200-prosecutions"), "Koushal judgment")}).</p>
    ${vbars(Object.entries(OFFICIAL.series.section377CasesByYear).map(([y, v]) => [y, v]), { color: "orange", aria: "Section 377 cases recorded by NCRB: 2014 1,148; 2015 1,347; 2016 2,195; 2020 826; 2021 955; 2022 987; 2023 888" })}
    <p class="muted small">Years 2017 to 2019 are missing because no verified figure was found. NCRB's 2024 report, the first under the Bharatiya Nyaya Sanhita, shows no 2024 figure. 2014 to 2016 figures are from NCRB data cited by PTI and The Quint (${link(fact("ncrb-sec377-2014"), "The Quint")}); 2020 to 2023 are NCRB's own tables (${link(fact("ncrb-unnatural-2020-2022"), "OpenCity")}).</p>
  </div>
</section>

<section class="sec vz-sec" id="law">
  <div class="wrap narrow prose">
    ${sectionHead("Part two", "The law, the courts and where they stand", "Rights on paper, and what the courts say about how they are carried out.")}
    <div class="vz-grid">
      ${stat("4,87,803", "people counted in the 'Others' category in Census 2011. That is 0.04% of the population, and the category included but was not limited to transgender people.", fact("census-2011-total", "487803"), "sky")}
      ${stat("31,559", "transgender identity certificates issued through the National Portal by February 2026, up from 277 in March 2021.", fact("portal-2026-feb", "31559"), "green")}
      ${stat("25", "state Transgender Welfare Boards and 20 Protection Cells, as listed by the government in November 2025.", fact("welfare-boards-cells-2025-nov", "25"), "orange")}
    </div>
    <h3>In 2026 the law on transgender identity changed</h3>
    <p>The Transgender Persons (Protection of Rights) Amendment Act, 2026 received assent on 30 March 2026 and came into force on 25 May 2026 (${link(fact("amend-2026-assent"), "Supreme Court Observer")}). According to PRS Legislative Research, the bill ${esc(fact("amend-2026-definition").claim.replace(/^The 2026 Bill /, ""))} Under it, ${esc(fact("amend-2026-medical-board").claim.replace(/^Under the 2026 Bill the /, "the ").replace(/ the District Magistrate/, " the District Magistrate"))} The Act also deleted the 2019 Act's clause on the right to a self-perceived gender identity (${link(fact("amend-2026-selfperceived"), "Supreme Court Observer")}), and adds new offences, including forcing a person to present as transgender for begging (${link(fact("amend-2026-penalties"), "PRS summary")}).</p>
    <p>The Supreme Court issued notice on the challenge to the Act on 4 May 2026 (${link(fact("amend-2026-sc-notice"), "Supreme Court Observer")}). On 17 August 2026 the Centre told it that identity cards already issued would continue (${link(fact("amend-2026-ids"), "LiveLaw")}). In October 2025 the Court had said the 2019 Act and Rules had been "reduced to dead letters" through state indifference (${link(fact("jane-kaushik-2025"), "Supreme Court Observer")}).</p>
    <h3>Timeline: from 1860 to 2026</h3>
    <ol class="vz-tl">${tlHtml}</ol>
  </div>
</section>

<section class="sec alt vz-sec" id="studies">
  <div class="wrap">
    ${sectionHead("Part three", "What studies and surveys find", "Surveys of LGBTQ people in India are small, local and mostly done with community organisations, so none of these figures is a national rate. Each card says who was asked, how many and where. Read them as evidence of patterns, not as precise national totals.")}
    <h3 id="mh">Mental health and suicide</h3>
    <div class="callout" style="--c:var(--v)"><p>If you are struggling, you are not alone and help exists. In India, call the free, confidential Tele-MANAS line on <strong>14416</strong>. In danger, call <strong>112</strong>. <a href="../help/">More helplines</a>.</p></div>
    ${cards([
      ["pudu2023-suicide", { big: "46.2", tag: "Puducherry, n=119", title: "of transgender people had tried to end their life at some point", must: ["46.2%"] }],
      ["halli2021-wish-dead", { big: "42", tag: "Bangalore, n=282", title: "of hijras and kothis wished they were dead in the past month", must: ["42%"] }],
      ["sivasubramanian2011-ideation", { big: "45", tag: "Mumbai, n=150", title: "of gay and bisexual men at one centre reported current suicidal thoughts", must: ["45%"] }],
      ["majumder2021-attempt", { big: "25.8", tag: "Clinical sample, n=120", title: "of gender-incongruent adults had attempted suicide before", must: ["25.8%"] }],
      ["khuman2025-couple", { big: "41", tag: "164 news reports", title: "of reported LGBTQ suicides were couples dying together", must: ["41%"], note: "News reports are not a count of all deaths. The author notes media selection bias." }],
      ["umashankar2025-mh", { big: "68.3", tag: "Chennai, n=104", title: "of transgender adults had mental health symptoms in the past year, and only 18% of them sought therapy", must: ["68.3%"] }],
      ["wilkerson2018-depression", { big: "58", tag: "Maharashtra, n=433", title: "of men who have sex with men in an online survey had depression", must: ["58%"] }],
      ["sudarisan2026-dsm", { big: "72", tag: "Trans women, n=128", title: "had a diagnosable mental disorder, and only 8.5% of needs were being met", must: ["72%"] }]
    ])}
    <div class="callout reveal" style="--c:var(--b)"><p><strong>What the reports on suicide show.</strong> The 2025 review of 164 news reports (2001 to 2022) found the death was described in 88% of them, and the reasons most often framed were family non-acceptance (47%) and forced separation or relationship breakdown. The most common ages were 19 to 24 (36%) and 25 to 44 (32%). The author stresses these are news narratives, not rates (${link(fact("khuman2025-limit"), "Khuman, 2025")}). Honour killings are sometimes disguised as suicides, so the true toll may be higher.</p></div>

    <h3 id="violence">Violence, harassment and police</h3>
    ${cards([
      ["pgph2022-violence", { big: "39.2", tag: "National survey, n=4,607", title: "of transgender women reported physical or sexual violence", must: ["39.2%"], note: "Probability-based national HIV survey (IBBS 2014 to 2015). 27.3% reported physical and 22.3% sexual violence." }],
      ["pgph2022-police", { big: "24.5", tag: "National survey, n=1,257", title: "of those who suffered physical violence named the police among the perpetrators", must: ["24.5%"] }],
      ["suriya2024-manipur", { big: "91.8", tag: "Manipur, n=171", title: "of trans women had been harassed because of their identity", must: ["91.8%"] }],
      ["pudu2023-harassment", { big: "84.87", tag: "Puducherry, n=119", title: "of transgender people had faced sexual harassment", must: ["84.87%"] }],
      ["thompson2019-violence", { big: "46", tag: "Bangalore, n=282", title: "of nirvan hijras reported physical violence in the previous six months", must: ["46%"] }],
      ["li2017-victimised", { big: "56.5", tag: "Maharashtra, n=449", title: "had been victimised in their lifetime", must: ["56.5%"], note: "37.1% within the past 12 months." }],
      ["ssm2019-msm-violence", { big: "24.7", tag: "National survey, n=22,297", title: "of men who have sex with men reported violence", must: ["24.7%"] }],
      ["verma2026-ipv", { big: "58.5", tag: "College women, n=53", title: "of lesbian and bisexual women had faced partner violence", must: ["58.5%"] }]
    ])}
    <h3 id="blackmail">Blackmail and extortion through dating apps</h3>
    ${cards([
      ["li2017-blackmail-online", { big: "14.8", tag: "Maharashtra, n=449", title: "were asked for money after sex by someone they met online (9.9% for offline partners)", must: ["14.8%"] }],
      ["salim2024-soce", { big: "45.4", tag: "Kerala, n=130", title: "had been through conversion or orientation change efforts, a practice the medical commission has called misconduct", must: ["45.4%"] }]
    ])}
    <p>The same research describes organised gangs who posed as men seeking sex online, lured people to isolated places and extorted them, while fear of exposure kept most victims from going to the police (${link(fact("li2017-extortion-narrative"), "Li et al., 2017")}).</p>

    <h3 id="family">Home and family</h3>
    ${cards([
      ["nhrc-family-support", { big: "71", tag: "Delhi, n=900 study", title: "of transgender people in Delhi said they lacked family support and inheritance (77% in Uttar Pradesh)", must: ["71%"] }],
      ["fernandez2024-family", { big: "69", tag: "Kerala, n=120", title: "of trans and gender-diverse people lived away from their families", must: ["69%"] }],
      ["bmjgh2026-family", { big: "28.8", tag: "14 states, n=2,208", title: "of trans respondents lived with their families (76.4% of gay and bisexual men did)", must: ["28.8%"] }],
      ["nhrc-housing", { big: "19", tag: "Delhi and UP, n=900", title: "of transgender respondents owned their accommodation", must: ["19%"] }]
    ])}
    <p>Being thrown out of home is not counted anywhere nationally. The sources above show that many trans people live apart from their families, but they do not give a count of evictions. In the United States, where it has been studied, 20% to 45% of homeless youth identify as LGBTQ, and the Williams Institute names family non-acceptance as a leading cause (${link(fact("wi-homeless-youth"), "Williams Institute, 2020")}).</p>

    <h3 id="school">School and college</h3>
    ${cards([
      ["unesco2019-unsafe", { big: "65", tag: "Chennai, n=371", title: "of sexual and gender minority youth felt unsafe at school", must: ["65%"] }],
      ["unesco2019-bullied-by-students", { big: "84", tag: "Chennai, n=371", title: "had been bullied by other students; 19% by male teachers", must: ["84%"] }],
      ["unesco2019-dropout", { big: "33.2", tag: "Chennai, n=371", title: "said bullying played a key role in them leaving school", must: ["33.2%"] }],
      ["unesco2019-reported", { big: "18", tag: "Chennai, n=371", title: "of those bullied told the school, and many were told to change themselves", must: ["18%"] }],
      ["nhrc-never-school", { big: "29.11", tag: "Delhi, n=900 study", title: "of transgender respondents in Delhi had never attended school (33.11% in Uttar Pradesh)", must: ["29.11%"] }]
    ])}

    <h3 id="work">Work, income and property</h3>
    ${cards([
      ["nhrc-employment-denied", { big: "96", tag: "Delhi and UP, n=900", title: "were denied in the employment market", must: ["96%"] }],
      ["nhrc-employed", { big: "6", tag: "Delhi and UP, n=900", title: "were employed, and none in a government job", must: ["6%"] }],
      ["nhrc-no-property", { big: "98", tag: "Delhi and UP, n=900", title: "owned no property", must: ["98%"] }],
      ["bmjgh2026-livelihood", { big: "35", tag: "14 states, n=2,208", title: "of trans respondents lived off sex work, begging or ritual work", must: ["35%"] }],
      ["bmjgh2026-govjobs", { big: "1.7", tag: "14 states, n=2,208", title: "of all respondents held a government job", must: ["1.7%"] }]
    ])}
    <p class="muted small">The study of 900 people was done for the National Human Rights Commission (Kerala Development Society, 2017) in Delhi and in two districts of Uttar Pradesh. It is not representative of India.</p>

    <h3 id="health">Health care and HIV</h3>
    ${cards([
      ["thapa2025-healthcare", { big: "76.7", tag: "Uttarakhand, n=73", title: "of transgender women faced discrimination when seeking health care", must: ["76.7%"] }],
      ["fernandez2024-kerala", { big: "41.7", tag: "Kerala, n=120", title: "faced discrimination at a health centre in the past year", must: ["41.7%"] }],
      ["bmjgh2026-identity-card", { big: "52.4", tag: "14 states, n=2,208", title: "of trans respondents had a transgender identity card", must: ["52.4%"] }],
      ["das2026-med-students", { big: "30.3", tag: "One college, n=155", title: "of medical and nursing students said they would prefer not to treat LGBT patients", must: ["30.3%"] }],
      ["rajan2020-hiv", { big: "9.5", tag: "7 states, n=3,325", title: "of hijra and transgender people were living with HIV in 2014 to 2015", must: ["9.5%"], note: "NACO's later estimates are lower: 3.26% of men who have sex with men and 3.78% of hijra and transgender people in 2021." }]
    ])}

    <h3 id="views">What people in India say they think</h3>
    ${cards([
      ["pew2023-ssm", { big: "53", tag: "National poll, 2023", title: "of Indian adults said same-sex marriage should be legal; 43% opposed", must: ["53%"] }],
      ["pew-india-moral", { big: "59", tag: "National poll, 2025", title: "of Indian adults said homosexuality is morally unacceptable", must: ["59%"] }],
      ["ipsos2021-marry", { big: "44", tag: "Urban online poll, 2021", title: "of urban Indians said same-sex couples should be allowed to marry", must: ["44%"] }]
    ])}
    <p class="muted small">Polls differ in method, year and wording, so these numbers should not be set against each other.</p>
  </div>
</section>

<section class="sec vz-sec" id="record">
  <div class="wrap narrow">
    ${sectionHead("Part four", "The news record: cases, rulings and milestones", `${num(items.length)} reported incidents, court rulings and policy changes in India from 2014 to October 2026, each linked to the article it comes from. This is a record of what was reported, not a count of everything that happened.`)}
    <div class="vz-grid two">
      <div class="reveal"><h4>Entries by year</h4>${vbars(byYear, { color: "b", aria: "Entries in this record by year" })}</div>
      <div class="reveal"><h4>Entries by kind</h4>${hbars(byType, { color: "violet", aria: "Entries in this record by kind" })}</div>
    </div>
    <p class="muted small">The collection grows as reporting and our searching grow, so a rising bar means more was documented, not necessarily that more happened.</p>
    <div class="rec-tools">
      <label>Kind<select class="mini" id="recKind"><option value="all">All kinds</option>${Object.entries(TYPE).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      <label>Year<select class="mini" id="recYear"><option value="all">All years</option>${years.map((y) => `<option>${y}</option>`).join("")}</select></label>
      <label>Place<select class="mini" id="recState"><option value="all">All places</option>${states.map((s) => `<option>${esc(s)}</option>`).join("")}</select></label>
      <label>Search<input class="text-in" id="recQ" type="search" placeholder="Word or place" autocomplete="off"></label>
    </div>
    <p class="muted small" id="recCount" aria-live="polite"></p>
    <ul class="rec-list" id="recList">${recHtml}</ul>
    <div class="row"><button class="btn btn-ghost" id="recMore" type="button"><span class="btn-t">Show more</span></button></div>
    <p class="muted small">Care taken: we use only what each outlet reported, say "police said" or "the court found" where that is the source, leave out graphic detail, and do not name minors. Outlets such as The Hindu and Indian Express could not be reached while compiling this, so their reports are not cited, and some entries relay their reporting second-hand through other outlets.</p>
  </div>
</section>

<section class="sec alt vz-sec" id="world">
  <div class="wrap">
    ${sectionHead("Part five", "Around the world", "Transgender Europe's Trans Murder Monitoring project is the only worldwide count. It records only cases that are reported and found, so the real number is higher. Hate-crime statistics are collected by police in a few countries and are not comparable between them.")}
    <div class="narrow">
      <h3>Reported murders of trans and gender-diverse people</h3>
      <div class="linechart reveal" data-line="tmm" style="--c:#c9312f"></div>
      <p class="muted small">Each point is a reporting year (generally 1 October to 30 September). Counts for 2017 to 2022 come from secondary copies of the project's releases and are medium confidence. TGEU later cited 321 rather than 320 for 2023. Source: <a href="https://tgeu.org/trans-murder-monitoring-2025-reveals-new-trend-in-anti-trans-violence-systematic-targeting-of-activists-and-movement-leaders/" target="_blank" rel="noopener noreferrer">TGEU 2025 update</a> and earlier updates linked on the sources page.</p>
      <div class="candles reveal" data-n="281"><p class="cn">281</p><p>Reported murders of trans and gender-diverse people, 1 October 2024 to 30 September 2025. Each light is one person. A number is not a person, and these were people.</p><div class="candle-field" aria-hidden="true"></div></div>
      <div class="vz-grid">
        ${stat("5,322", "reported murders recorded by the project since 2009.", fact("tmm-cumulative-2025", "5,322"), "pink")}
        ${stat("34", "of the victims in the latest update were sex workers, the most targeted known occupation. 14% were activists.", fact("tmm-2025-sexwork", "34%"), "orange", "<small>%</small>")}
        ${stat("12", "listed cases in India in each of the 2024 and 2025 updates, by our count of TGEU's published lists. TGEU says India has the most all-time cases in Asia.", fact("tmm-2025-india", "12"), "yellow")}
      </div>
      <h3>Hate-crime data from countries that collect it</h3>
      <div class="vz-grid">
        ${stat("21,407", "sexual orientation hate crimes recorded by police in England and Wales, year to March 2026, plus 3,955 transgender hate crimes, including the Metropolitan Police.", fact("uk-2526", "21,407"), "blue")}
        ${stat("14.5", "of single-bias hate crime victims in the FBI's 2025 US data were targeted for sexual orientation, and 4.6% for gender identity. 10,881 incidents in total.", fact("fbi-2025-share", "14.5%"), "violet", "<small>%</small>")}
        ${stat("291", "violent deaths of LGBT+ people counted in Brazil in 2024 by Grupo Gay da Bahia (273 homicides, 18 suicides), from media reports. Brazil has no official count.", fact("ggb-2024", "291"), "green")}
        ${stat("80", "murders of trans people and travestis in Brazil in 2025 counted by ANTRA, down from 122 in 2024.", fact("antra-2025", "80"), "sky")}
        ${stat("60", "homicides presumably linked to orientation or gender identity documented by Letra S in Mexico in 2025, 35 of them trans women.", fact("letras-mx", "60"), "orange")}
        ${stat("658", "police-reported hate crimes targeting sexual orientation in Canada in 2024, down 26% from a peak of 889; gender identity crimes rose to 139.", fact("statcan-so", "658"), "pink")}
      </div>
      <div class="linechart reveal" data-line="uk" style="--c:#2e6bd1"></div>
      <p class="muted small">England and Wales: police-recorded sexual orientation hate crimes by year ending March (Home Office). Some years leave out a police force (2022/23 excludes Devon and Cornwall; 2024/25 excludes the Metropolitan Police), so compare with care. Source: ${link(fact("uk-2526"), "Home Office, October 2026")}.</p>
      <h3>Across the European Union</h3>
      <p>A 2023 survey of ${num(fact("fra-sample").figure)} LGBTIQ people in 30 countries by the EU Fundamental Rights Agency found that <strong>${fact("fra-attack-12m").figure}%</strong> had been physically or sexually attacked in the previous 12 months, <strong>${fact("fra-attack-5y").figure}%</strong> in the previous five years, <strong>${fact("fra-harass").figure}%</strong> had faced hate-motivated harassment in the past year (69% of trans respondents), and <strong>${fact("fra-unreported").figure}%</strong> did not report their most recent violent incident. ${fact("fra-hands").figure}% often or always avoid holding hands with a same-sex partner in public (${link(fact("fra-attack-12m"), "FRA LGBTIQ Survey III")}).</p>
      <h3>Mental health and family: evidence from abroad</h3>
      <div class="vz-grid">
        ${stat("39", "of LGBTQ+ young people in the US seriously considered attempting suicide in the past year and 12% attempted (Trevor Project 2024). In the 2025 survey: 36% and 10%.", fact("trevor-2024-consider", "39%"), "violet", "<small>%</small>")}
        ${stat("8.4", "times higher odds of attempting suicide for young LGB adults who faced high family rejection than for those who faced little (Ryan et al., 2009; 224 young adults).", fact("ryan-2009", "8.4"), "pink", "<small>×</small>")}
        ${stat("7", "fewer suicide attempts among US high-school students after states legalised same-sex marriage (Raifman et al., 2017).", fact("raifman-2017", "7%"), "green", "<small>%</small>")}
        ${stat("3.5", "times the odds of suicide attempts for sexual minority adolescents versus others, from a meta-analysis of 35 studies (Di Giacomo, 2018).", fact("digiacomo-2018", "3.50"), "orange", "<small>×</small>")}
      </div>
      <p>The Trevor Project found that LGBTQ+ young people living in very accepting communities attempted suicide at less than half the rate of those in very unaccepting communities (${link(fact("trevor-2024-accept"), "Trevor Project 2024")}).</p>
      <h3>Other kinds of harm</h3>
      <p>${esc(fact("corrective-rape-un").claim)} The UN also cites a source finding "conversion therapy" practices in at least 68 countries, and ILGA World counts 17 states with nationwide bans (${link(fact("conv-un-68"), "UN Independent Expert")}, ${link(fact("conv-ilga"), "ILGA World")}).</p>
    </div>
  </div>
</section>

<section class="sec vz-sec" id="map">
  <div class="wrap">
    ${sectionHead("Part six", "Where same-sex relations are a crime", "A map of every United Nations member state. Tap or hover a country for its status and any recent change.")}
    <div class="wmap reveal" id="wmap">
      <div class="wm-counts"><div><strong data-count-n="death">${cn("death")}</strong><span>death penalty possible</span></div><div><strong data-count-n="crim">${cn("crim")}</strong><span>criminalised (prison)</span></div><div><strong data-count-n="partial">${cn("partial")}</strong><span>criminalised in practice</span></div><div><strong data-count-n="ok">${cn("ok")}</strong><span>not criminalised</span></div></div>
      <div class="chips wm-chips" role="group" aria-label="Map layer"><button class="chip" type="button" data-f="law" aria-pressed="true">Criminalisation</button><button class="chip" type="button" data-f="marriage" aria-pressed="false">Same-sex marriage</button></div>
      <div class="wm-stage"><p class="wm-load">Loading the map…</p><div class="wm-tip" hidden></div></div>
      <div class="wm-legend"></div><p class="wm-note"></p><p class="sr-only wm-info" role="status" aria-live="polite"></p>
    </div>
    <div class="narrow">
      <h3>What changed recently</h3>
      <ol class="vz-tl">${changesHtml}</ol>
      <h3>How India compares</h3>
      <div class="table-wrap reveal" tabindex="0"><table>
        <thead><tr><th scope="col"></th><th scope="col">India</th><th scope="col">World</th></tr></thead>
        <tbody>
          <tr><td>Consensual same-sex relations</td><td>Decriminalised by the Supreme Court on 6 September 2018 (${link(fact("navtej-2018-holding"), "Navtej Singh Johar")})</td><td>Criminalised in 65 UN member states; death penalty possible in 12 (ILGA World, May 2026)</td></tr>
          <tr><td>Same-sex marriage</td><td>Not recognised. The Supreme Court declined to create it on 17 October 2023 and dismissed review petitions on 9 January 2025 (${link(fact("supriyo-2023-holding"), "Supriyo")})</td><td>Legal in 38 UN member states (Pew, June 2025)</td></tr>
          <tr><td>Transgender identity</td><td>Legal recognition since 2014; the 2019 Act was amended in 2026, with a Supreme Court challenge pending</td><td>18 states allow legal gender recognition on self-determination (ILGA World, 2026)</td></tr>
          <tr><td>Conversion therapy</td><td>Declared professional misconduct by the National Medical Commission in 2022; no national law</td><td>17 states ban it nationwide (ILGA World, 2026)</td></tr>
          <tr><td>Hate-crime data</td><td>Not collected nationally</td><td>Collected by police in some countries, such as the US, the UK and Canada</td></tr>
          <tr><td>Public acceptance</td><td>53% back marriage equality (Pew, 2023); 59% call homosexuality morally unacceptable (Pew, 2025)</td><td>Across 25 countries a median of 38% say it is morally acceptable (Pew, 2025)</td></tr>
        </tbody>
      </table></div>
    </div>
  </div>
</section>

<section class="sec alt vz-sec" id="help">
  <div class="wrap narrow prose">
    ${sectionHead("Part seven", "Rejection costs lives. Acceptance saves them.", "The same research that documents harm also shows what protects people.")}
    <ul>
      <li>US young adults who faced high family rejection were 8.4 times more likely to have attempted suicide (${link(fact("ryan-2009"), "Ryan et al., 2009")}).</li>
      <li>Young people in very accepting communities attempted suicide at less than half the rate of those in very unaccepting ones (${link(fact("trevor-2024-accept"), "Trevor Project")}).</li>
      <li>US states that legalised same-sex marriage saw a 7% fall in high-school suicide attempts (${link(fact("raifman-2017"), "Raifman et al., 2017")}).</li>
    </ul>
    <p>Need to talk? Tele-MANAS is free and confidential on 14416. In danger, call 112. Our <a href="../help/">help page</a> lists LGBTQ-friendly helplines and guides for coming out, parents and allies.</p>
    <div class="cta-row">${arrowBtn("../help/", "Get help")}${arrowBtn("../connect/", "Say something", "btn--ghost")}</div>
  </div>
</section>

<section class="sec vz-sec" id="method">
  <div class="wrap narrow prose">
    ${sectionHead("Method", "How this page was made, and what it cannot tell you")}
    <ul>
      <li><strong>Every figure is linked.</strong> Each number comes from a document someone opened and read: a government table, a court judgment, a peer-reviewed study, an NGO report or a news article. The sources page lists all ${num(allSources().reduce((n, g) => n + g[1].length, 0))} of them.</li>
      <li><strong>We say who was asked.</strong> Most Indian surveys use convenience or snowball samples through community organisations. Their percentages describe the people surveyed, not all LGBTQ people in India.</li>
      <li><strong>Counts are minimums.</strong> Police, courts and media record only what is reported. Hate crime is not a category in Indian law, and in much of the world it is not counted.</li>
      <li><strong>Researcher counts are labelled.</strong> Where we counted rows in a published list (the India entries in Transgender Europe's lists), we say so.</li>
      <li><strong>What we left out.</strong> Anything we could not confirm in the original source. That includes official transgender crime figures before 2022, some Section 377 counts, the Pew 2019 figure for India, and the outcome of the 2026 Supreme Court hearings after 17 August 2026.</li>
      <li><strong>Last checked:</strong> 22 October 2026. Laws and numbers change. If you find an error or a newer figure, <a href="../connect/">tell us</a> and we will correct it.</li>
    </ul>
    <p class="muted small">Every source for this page is listed on the <a href="../sources/#official">sources page</a>.</p>
  </div>
</section>

<script type="application/json" id="vzData">${JSON.stringify(VZ).replace(/</g, "\\u003c")}</script>`
};
