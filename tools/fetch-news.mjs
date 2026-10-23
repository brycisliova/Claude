#!/usr/bin/env node
// Pulls today's LGBTQIA+ news (India and the world) and good news from public RSS feeds into assets/data/news.json.
// Only the headline, the publisher's name, the date, a short snippet where the feed gives one, and the link are kept. Nothing
// is rewritten: every item links to the publisher. Run by .github/workflows/news.yml every morning, then the site is rebuilt.
// usage: node tools/fetch-news.mjs [--dry]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../assets/data/news.json", import.meta.url));
const DAYS = 45, CAP = { india: 90, world: 120, good: 60, general: 24 };
const GN = (q, ceid = "IN:en", hl = "en-IN", gl = "IN") => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

// topical: the whole feed is about LGBTQIA+ lives. Otherwise an item must mention it.
const FEEDS = [
  { id: "pinknews", name: "PinkNews", url: "https://www.pinknews.co.uk/feed/", topical: true },
  { id: "lgbtqnation", name: "LGBTQ Nation", url: "https://www.lgbtqnation.com/feed/", topical: true },
  { id: "advocate", name: "The Advocate", url: "https://www.advocate.com/rss.xml", topical: true },
  { id: "76crimes", name: "Erasing 76 Crimes", url: "https://76crimes.com/feed/", topical: true },
  { id: "guardian", name: "The Guardian", url: "https://www.theguardian.com/world/lgbt-rights/rss", topical: true },
  { id: "gn-india-1", name: "", url: GN("(LGBTQ OR transgender OR queer OR \"same-sex\" OR \"Section 377\") India when:7d"), india: true },
  { id: "gn-india-2", name: "", url: GN("(transgender OR LGBTQ OR queer) (High Court OR Supreme Court OR police OR students OR rights) India when:7d"), india: true },
  { id: "gn-world", name: "", url: GN("(LGBTQ OR transgender OR \"same-sex marriage\") (court OR law OR rights) when:3d", "US:en", "en-US", "US") },
  { id: "gn-good", name: "", url: GN("(LGBTQ OR transgender OR queer) (landmark OR victory OR \"historic ruling\" OR legalises OR decriminalises OR \"first openly\" OR scholarship OR celebrates OR welcomes) when:14d", "US:en", "en-US", "US") },
  { id: "gnn", name: "Good News Network", url: "https://www.goodnewsnetwork.org/feed/", general: true },
  { id: "positive", name: "Positive News", url: "https://www.positive.news/feed/", general: true },
  { id: "betterindia", name: "The Better India", url: "https://www.thebetterindia.com/feed/", general: true }
];

const RELEVANT = /\b(lgbt\w*|queer|gay|gays|lesbians?|bisexual\w*|transgender|trans (?:man|men|woman|women|people|person|persons|rights|youth|kids?|athletes?|students?|community|health|folks?|teen\w*|children|care|law|bill|ban)|non-?binary|intersex|asexual|homophob\w*|transphob\w*|biphob\w*|same-?sex|marriage equality|section 377|third gender|hijras?|conversion therap\w*|gender identity|gender-affirming|gender recognition|coming out|pride (?:march|parade|month|flag|event|festival))\b/i;
const EXPLICIT = /\b(porn\w*|nude|naked|onlyfans|sex tape|sexy|orgy|escort|hook-?ups?|erotic\w*|bdsm|kink\w*|fetish\w*|xxx|nsfw|grindr date|thirst trap|genital\w*|penis|vagina\w*|nipples?|breasts?)\b/i;
// outlets that are tabloids, gossip sites, reference pages or that routinely frame LGBTQIA+ lives with hostility
const BLOCK_SOURCES = /^(breitbart|daily mail|dailymail|the sun|new york post|ny post|daily wire|the daily wire|the federalist|daily caller|the daily caller|washington examiner|fox news|lifesitenews|lifesite|the christian post|christian post|daily signal|the daily signal|gateway pundit|newsmax|oann|one america|the epoch times|epoch times|gb news|spiked|catholic news agency|cbn|cbn news|fandomwire|screen rant|screenrant|britannica|wikipedia|hs insider|collider|ndtv.*video|dailymotion|youtube|tiktok|reddit|quora|medium)\b/i;
const NOISE = /newsletter|\bNL\b \d|morning brief|daily digest|weekly roundup|podcast|webinar|job opening|hiring/i;
const GOSSIP = /\b(drag race|red carpet|box office|trailer|season \d|album|love island|bake off|netflix|hbo|disney|celebrity|rumou?rs?|spotted|dating|boyfriend|girlfriend|horoscope|fashion|met gala|taylor swift|eurovision|oscars?|grammys?|emmys?)\b/i;
const NEGATIVE = /\b(kill\w*|murder\w*|attack\w*|arrest\w*|beaten|beat up|assault\w*|suicid\w*|dies|died|dead|death|ban\b|bans|banned|rolls? back|rollback|anti-(?:lgbt\w*|trans|gay)|crackdown|jail\w*|sentenc\w*|raid\w*|hate|abus\w*|harass\w*|threat\w*|fear\w*|slur|violen\w*|rape\w*|sex offen\w*|stabb\w*|shot|shooting|bomb\w*|lawsuit|sued|fired|backlash|outrage|condemn\w*|persecut\w*|torture\w*|detain\w*|deport\w*|blackmail\w*|bullying|bullied|scrap\w*|strip\w*|slash\w*|cuts?|erase\w*|attack|extortion|honou?r killing)\b/i;
const POSITIVE = /\b(legali[sz]\w*|decriminali[sz]\w*|strikes? down|struck down|upholds?|upheld|ruling in favou?r|rules? in favou?r|landmark|historic|first[- ]ever|first openly|victory (?:for|in|at)|wins? (?:the )?(?:right|case|court|battle|vote|seat|election)|won (?:the )?(?:right|case|court|battle|vote|seat|election)|celebrat\w*|scholarships?|recogni[sz]es?|welcomes?|breakthrough|reunit\w*|rights granted|gets? (?:married|justice)|marriage equality|joyful|milestone)\b/i;
// things a headline can say that make "good news" the wrong label
const NEGATIVE2 = /\b(investigat\w*|scrutiny|probe|forgery|fraud\w*|controvers\w*|blocks?|blocked|rejects?|restrict\w*|retreat|dispute\w*|despite|but|warn\w*|struggl\w*|denied|denies|refus\w*|overturn\w*|reverse\w*|delet\w*|remov\w*|cancel\w*|ends?|cuts?|loses?|lost|silently|retreat\w*|re-?elect\w*)\b/i;
// general good news is only kept when it is about people, care or fairness, not hacks, recipes or products
const GENERAL_OK = /\b(communit\w*|kind\w*|inclusi\w*|equal\w*|rights|educat\w*|school\w*|student\w*|health\w*|mental|disab\w*|women|girls?|children|kids|volunteer\w*|rescu\w*|help\w*|donat\w*|teacher\w*|doctor\w*|free|village\w*|farmer\w*|saves?|saving|justice|court|law|access\w*|refugee\w*|elderly|survivor\w*|hospital\w*|nurse\w*|mother\w*|father\w*|neighbou?r\w*|friend\w*|love|home|shelter|food|hunger|reading|library|librar\w*|clean\w*|nature|wildlife|forest\w*)\b/i;
const GENERAL_SKIP = /good news in history|newsletter|podcast|giveaway|sponsored|recipe|hack|trick|diy|how to|best of|top \d+|deal|discount|coupon|shop/i;
const INDIA = /\b(india\w*|delhi|mumbai|bengaluru|bangalore|chennai|kolkata|hyderabad|kerala|tamil nadu|karnataka|maharashtra|west bengal|odisha|gujarat|punjab|bihar|assam|goa|madras high court|bombay high court|kerala high court|supreme court of india|lok sabha|rajya sabha|nalsa|tele-?manas|section 377)\b/i;

/* ---- tiny RSS and Atom reader ---- */
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", hellip: "…" };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => (e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m));
const text = (s) => decode(s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const tag = (b, t) => { const m = new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "i").exec(b); return m ? m[1] : ""; };
function parse(xml) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  return blocks.map((b) => {
    let link = text(tag(b, "link")); if (!link) { const m = /<link[^>]+href=["']([^"']+)["']/i.exec(b); link = m ? decode(m[1]) : ""; }
    const src = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(b);
    const date = new Date(text(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date")));
    return { title: text(tag(b, "title")), link, source: src ? text(src[1]) : "", date: isNaN(date) ? null : date, summary: text(tag(b, "description") || tag(b, "summary") || tag(b, "content:encoded")) };
  }).filter((x) => x.title && /^https?:\/\//.test(x.link));
}

/* ---- helpers ---- */
const clean = (u) => { try { const x = new URL(u); [...x.searchParams.keys()].filter((k) => /^(utm_|fbclid|gclid|ref$|cmp$|CMP$)/i.test(k)).forEach((k) => x.searchParams.delete(k)); x.hash = ""; return x.toString(); } catch { return u; } };
const keyOf = (t) => t.toLowerCase().replace(/ - [^-]+$/, "").replace(/[^a-z0-9]+/g, " ").trim().slice(0, 70);
const snippet = (s, t) => { if (!s || s.length < 40) return ""; let x = s.replace(/\s*(The post|Continue reading|Read more)[\s\S]*$/i, "").replace(/\s*\[…\]|\s*\.\.\.$/g, "").trim(); if (x.toLowerCase().startsWith(t.toLowerCase().slice(0, 30))) return ""; if (x.length > 200) x = x.slice(0, 200).replace(/\s+\S*$/, "") + "…"; return x; };

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; WhoWeAreNewsBot/1.0; +https://shiningforever.in)", accept: "application/rss+xml, application/xml, text/xml, */*" }, signal: AbortSignal.timeout(25000) });
      if (r.ok) return await r.text();
      if (r.status < 500 && r.status !== 429) return null;
    } catch { /* try again */ }
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  return null;
}

const now = Date.now();
const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { groups: { india: [], world: [], good: [], general: [] } };
const seen = new Map(); // key -> item, so the same story from two feeds appears once
for (const g of Object.keys(CAP)) for (const it of prior.groups[g] || []) seen.set(keyOf(it.t), { ...it, g });
const report = [];
let fresh = 0;
for (const f of FEEDS) {
  const xml = await get(f.url); if (!xml) { report.push({ id: f.id, ok: false, n: 0 }); continue; }
  let n = 0;
  for (const it of parse(xml)) {
    const d = it.date || new Date(now); if (now - d.getTime() > DAYS * 864e5 || d.getTime() - now > 864e5) continue;
    let title = it.title, source = f.name || it.source;
    const m = /^(.*\S)\s+-\s+([^-]{2,40})$/.exec(title); if (f.id.startsWith("gn-") && m) { title = m[1]; source = source || m[2]; }
    if (!source || /[^\u0000-\u024F\u2000-\u206F]/.test(source)) continue;
    const blob = title + " " + it.summary;
    if ((title.match(/[^\u0000-\u024F\u2000-\u206F]/g) || []).length > title.length * 0.2) continue; // headlines in other scripts are skipped
    if (EXPLICIT.test(blob) || GOSSIP.test(title) || NOISE.test(title) || BLOCK_SOURCES.test(source) || /\b(opinion|editorial|op-ed|column|letters?)\b/i.test(title)) continue;
    const key = keyOf(title); if (seen.has(key)) continue;
    let group;
    if (f.general) { if (NEGATIVE.test(title) || GENERAL_SKIP.test(title) || !GENERAL_OK.test(blob)) continue; group = "general"; }
    else {
      if (!f.topical && !RELEVANT.test(title)) continue;
      const isIndia = INDIA.test(f.id.startsWith("gn-") ? title : blob);
      group = isIndia ? "india" : "world";
    }
    const item = { t: title, u: clean(it.link), s: source, d: d.toISOString(), x: f.id.startsWith("gn-") ? "" : snippet(it.summary, title), g: group, good: group !== "general" && POSITIVE.test(title) && !NEGATIVE.test(title) && !NEGATIVE2.test(title) };
    if (f.id === "gn-good" && !item.good) continue; // that feed is only for wins
    seen.set(key, item); n++; fresh++;
  }
  report.push({ id: f.id, ok: true, n });
}
const all = [...seen.values()].filter((x) => now - new Date(x.d).getTime() <= DAYS * 864e5).sort((a, b) => (a.d < b.d ? 1 : -1));
const groups = { india: [], world: [], good: [], general: [] };
for (const x of all) {
  const { g, ...rest } = x; const dest = g === "general" ? "general" : g;
  const per = (groups[dest].filter((y) => y.s === rest.s).length); if (per >= 8) continue;
  if (groups[dest].length < CAP[dest]) groups[dest].push(rest);
  if (rest.good && dest !== "general" && groups.good.length < CAP.good) groups.good.push(rest);
}
const out = { updated: new Date().toISOString(), feeds: report, groups };
console.log(report.map((r) => `${r.id}: ${r.ok ? r.n + " new" : "FAILED"}`).join("\n"));
console.log("india", groups.india.length, "world", groups.world.length, "good", groups.good.length, "general", groups.general.length, "| fresh", fresh);
if (process.argv.includes("--dry")) process.exit(0);
// never replace a good file with an empty one when the network is down
if (report.every((r) => !r.ok)) { console.error("every feed failed; keeping the old file"); process.exit(0); }
writeFileSync(OUT, JSON.stringify(out));
