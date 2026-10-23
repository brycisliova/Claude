// The helper chat. It works on its own: it finds pages, answers common questions and shows helplines, all in the browser.
// When the site has a backend (data-chat on <html>, see backend/README.md) it also holds an open conversation and can
// search the web for recent facts. Nothing is saved: the chat lives in memory and is gone when the page closes.

const root = document.documentElement, BASE = root.dataset.base || "./";
// The backend address lives in assets/data/chat.json, so it can be changed without rebuilding the site.
let ENDPOINT = root.dataset.chat || "";
const ready = (async () => {
  if (!ENDPOINT) { try { const j = await fetch(new URL("../data/chat.json", import.meta.url)).then((r) => r.json()); ENDPOINT = String(j.endpoint || "").trim(); } catch (e) { /* no backend: the helper stays simple */ } }
  if (ENDPOINT && !/^https:\/\//.test(ENDPOINT)) ENDPOINT = "";
  if (ENDPOINT && !/\/chat\/?$/.test(ENDPOINT)) ENDPOINT = ENDPOINT.replace(/\/+$/, "") + "/chat";
})();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const page = (u) => BASE + u;

const CRISIS = /(kill(ing)? myself|suicid|end (my|it all)|want to die|wanna die|don'?t want to (live|be here|exist)|self[- ]?harm|hurt(ing)? myself|cut(ting)? myself|no reason to live|better off dead|marna chah|jaan de|khudkushi|mar jaana|jeena nahi)/i;
const CRISIS_HTML = `<p>I'm really glad you said it. You do not have to carry this alone, and you do not have to be sure about anything right now.</p><ul class="ch-lines"><li>In danger right now: <a href="tel:112"><b>112</b></a></li><li><a href="tel:14416"><b>Tele-MANAS 14416</b></a>, free, 24/7, many Indian languages</li><li><a href="tel:+919152987821"><b>iCALL 9152987821</b></a>, counsellors who are LGBTQ+ affirming</li></ul><p>If you can, tell someone near you where you are. <a href="${page("help/")}">More people to call and talk to</a>.</p>`;

// common questions: [pattern, answer html]. Facts here match what the pages themselves say.
const FAQ = [
  [/\b(choice|choose|chosen|illness|disease|disorder|mental (illness|disorder)|cure|fix|normal|phase|unnatural)\b/i, `<p>No. Being LGBTQ+ is not a choice and not an illness. The American Psychiatric Association removed homosexuality from its list of disorders in 1973 and the World Health Organization did in 1990. Nothing about it needs fixing.</p><p>The studies behind that are on <a href="${page("science/")}">the science page</a>.</p>`],
  [/\b(come out|coming out|tell my (parents|family|friends)|tell them|am i (gay|lesbian|bi|trans|queer)|how to tell)\b/i, `<p>There is no deadline and no rule that you must. Your safety and your timing come first. If you are not safe at home, wait, and build support first.</p><p>There is a gentle guide, with wording for parents and friends, on <a href="${page("help/")}">Help and guides</a>.</p>`],
  [/\b(parents?|mom|dad|mother|father|family) (found out|know|don'?t accept|will not accept|won'?t accept|angry|kicked)|support my (child|son|daughter|kid)\b/i, `<p>That is a hard place to be, whichever side of it you are on. <a href="${page("help/")}">Help and guides</a> has a section for parents and one for people whose families are not accepting, plus helplines.</p>`],
  [/\b(shared (phone|device|computer)|someone (will )?see|history|private|monitored|hide|safe(ly)? (visit|use)|quick exit)\b/i, `<p>Use a private window, and the red <b>Quick exit</b> button (or press Esc three times) jumps straight to a neutral site. This site has no tracking and no cookies. The full list of steps is on <a href="${page("privacy/")}">Privacy and safety</a>.</p>`],
  [/\b(conversion|reparative|cure therapy|pray the gay away|change my (orientation|sexuality))\b/i, `<p>Conversion practices do not work and they do harm. Major medical bodies say so. <a href="${page("therapies/")}">The therapies page</a> explains what does help.</p>`],
  [/\b(377|legal|law|illegal|marriage|marry|supreme court|rights|transgender (act|persons)|nalsa)\b/i, `<p>In 2018 India's Supreme Court decriminalised consensual same-sex relations (Navtej Singh Johar). In 2023 it did not recognise same-sex marriage and left that to Parliament. Transgender people are covered by the 2019 Act, which has been criticised by trans-led groups. Laws change, so check a current source before you act.</p><p>See <a href="${page("timeline/")}">the timeline</a> and <a href="${page("india/")}">India and the world</a>.</p>`],
  [/\b(news|headlines?|latest news)\b/i, `<p><a href="${page("news/")}">The News page</a> has today's headlines on LGBTQIA+ lives in India and the world, and a Good news tab.</p>`],
  [/\b(scholarship|study abroad|abroad|admission|university|college|visa|masters|phd|student)\b/i, `<p>There is a page for LGBTQIA+ students who want to study in safer countries, with scholarships, country facts and where to get help: <a href="${page("students/")}">Study abroad</a>.</p>`],
  [/\b(game|play|room|friends|antakshari|atlas|trivia|quiz)\b/i, `<p>The <a href="${page("games/")}">games room</a> has party games, quizzes, Atlas, antakshari (you can type Hindi in Hinglish) and calm games. To play with friends, choose "Play together", make a room and share the code.</p>`],
  [/\b(anxious|anxiety|stress|panic|sleep|calm|relax|breath|lonely|sad|down|low)\b/i, `<p>Try <a href="${page("therapies/")}">the tools on the therapies page</a> (breathing, grounding, writing) or the <a href="${page("sound/")}">sound studio</a>. If it feels heavier than a bad day, <a href="${page("help/")}">these helplines</a> are free and confidential.</p>`],
  [/\b(letters?|lgbtqia|what does .* mean|asexual|pansexual|non-?binary|intersex|glossary|meaning)\b/i, `<p><a href="${page("learn/")}">LGBTQIA+ explained</a> goes through every letter, the four separate dials (body, gender identity, expression and attraction) and has a glossary.</p>`],
  [/\b(who (made|built|runs)|about (you|this)|reiner|contact|email|feedback)\b/i, `<p>The site was built by Reiner Endrios, so that more people understand and fewer feel alone. You can read <a href="${page("about/")}">a note from Reiner</a> or write via <a href="${page("connect/")}">Connect</a>, including anonymously.</p>`],
  [/\b(helpline|hotline|call|talk to someone|counsell?or|therapist|emergency)\b/i, `<p>Free and confidential: <a href="tel:14416"><b>Tele-MANAS 14416</b></a> (24/7), <a href="tel:+919152987821"><b>iCALL 9152987821</b></a>. In danger: <a href="tel:112"><b>112</b></a>. More numbers on <a href="${page("help/")}">Help and guides</a>.</p>`]
];
const SYN = { gay: "gay lesbian homosexual", trans: "transgender", lgbt: "lgbtqia", help: "help helpline support", song: "sound music songs", movie: "watch films", film: "watch films", video: "voices watch" };
const STOP = new Set("the a an and or of to in on for is are was be i me my you your it this that with what how do does can will about from at as by we".split(" "));
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).flatMap((w) => (SYN[w] || w).split(" "));

let INDEX = null;
async function index() { if (INDEX) return INDEX; try { INDEX = await fetch(new URL("../data/search.json", import.meta.url)).then((r) => r.json()); } catch { INDEX = []; } return INDEX; }
async function findPages(q) {
  const ws = words(q); if (!ws.length) return [];
  const rows = (await index()).map((p) => {
    const title = words(p.t), desc = words(p.d), heads = words(p.h.join(" "));
    let s = 0; for (const w of ws) { if (title.includes(w)) s += 5; if (heads.includes(w)) s += 3; if (desc.includes(w)) s += 2; }
    return { p, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return rows.slice(0, 3).map((x) => x.p);
}

/* ---- the panel ---- */
const btn = document.createElement("button");
btn.className = "chat-btn"; btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "chatPanel");
btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Ask</span>`;
const panel = document.createElement("section");
panel.className = "chat"; panel.id = "chatPanel"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Site helper");
panel.innerHTML = `<header class="chat-head"><div><b>Ask the helper</b><span>An automated helper, not a person. Nothing is saved.</span></div><button class="chat-x" type="button" aria-label="Close the helper">&times;</button></header>
<div class="chat-log" id="chatLog" role="log" aria-live="polite"></div>
<div class="chat-tips" id="chatTips"></div>
<form class="chat-form" id="chatForm" autocomplete="off"><label class="sr-only" for="chatIn">Your message</label><input id="chatIn" class="chat-in" maxlength="600" placeholder="Ask anything, or say what you need" enterkeyhint="send"><button class="chat-send" type="submit">Send</button></form>`;
document.body.append(btn, panel);
const log = panel.querySelector("#chatLog"), input = panel.querySelector("#chatIn"), tips = panel.querySelector("#chatTips");
const history = []; let busy = false, opened = false;

const TIPS = ["Where do I start?", "I need to talk to someone", "Is it a choice?", "Study abroad and scholarships", "What is in the news today?"];
function say(who, html, cls = "") { const d = document.createElement("div"); d.className = `ch ch-${who} ${cls}`; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
// the online helper writes light markdown: **bold** and [text](link). Everything else is escaped.
function md(t) {
  let h = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (m, a, u) => { const local = u[0] === "/"; return `<a href="${local ? BASE + u.replace(/^\//, "") : u}"${local ? "" : ' target="_blank" rel="noopener noreferrer"'}>${a}</a>`; });
  return h.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
}
function open() {
  panel.hidden = false; btn.setAttribute("aria-expanded", "true"); btn.classList.add("on");
  if (!opened) { opened = true; ready.then(() => { say("bot", `<p>Hi, I'm the helper for this site. I'm automated, not a person. ${ENDPOINT ? "Ask me about the site, about life, or about the world." : "I can point you to the right page, answer common questions and find helplines."}</p><p>If today is heavy, say so. That is fine here.</p>`); tips.innerHTML = TIPS.map((t) => `<button type="button" class="chat-tip">${esc(t)}</button>`).join(""); }); }
  setTimeout(() => input.focus({ preventScroll: true }), 50);
}
function close() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.classList.remove("on"); btn.focus({ preventScroll: true }); }
btn.addEventListener("click", () => (panel.hidden ? open() : close()));
panel.querySelector(".chat-x").addEventListener("click", close);
panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
tips.addEventListener("click", (e) => { const b = e.target.closest(".chat-tip"); if (b) ask(b.textContent); });
panel.querySelector("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ""; ask(q); } });

async function local(q) {
  const hit = FAQ.find(([re]) => re.test(q));
  if (/\b(start|begin|new here|where do i)\b/i.test(q)) return `<p>Start wherever feels easiest. If you are new to this, <a href="${page("learn/")}">LGBTQIA+ explained</a> is gentle. If you want proof, <a href="${page("science/")}">the science</a>. If you need people right now, <a href="${page("help/")}">Help and guides</a>. If you just need a break, <a href="${page("games/")}">the games room</a>.</p>`;
  if (hit) return hit[1];
  const pages = await findPages(q);
  if (pages.length) return `<p>These pages look closest to what you asked:</p><ul class="ch-lines">${pages.map((p) => `<li><a href="${page(p.u)}"><b>${esc(p.t)}</b></a>. ${esc(p.d.split(". ")[0].replace(/\.$/, ""))}.</li>`).join("")}</ul>`;
  return `<p>I could not find that on this site, and I am a simple helper right now, so I would rather not guess. Try different words, or look through the <a href="${page("")}">menu</a>. If you need a person, <a href="${page("help/")}">Help and guides</a> lists free helplines.</p>`;
}
async function online(q) {
  history.push({ role: "user", content: q });
  const r = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-12), page: location.pathname }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { history.pop(); throw new Error(j.error || "failed"); }
  history.push({ role: "assistant", content: j.reply });
  return md(j.reply) + (j.sources?.length ? `<p class="ch-src">Sources: ${j.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join(" · ")}</p>` : "");
}
async function ask(q) {
  if (busy) return; busy = true; tips.innerHTML = ""; await ready;
  say("me", `<p>${esc(q)}</p>`);
  const crisis = CRISIS.test(q); if (crisis) say("bot", CRISIS_HTML, "ch-care");
  const wait = say("bot", `<p class="ch-dots" aria-label="Thinking"><i></i><i></i><i></i></p>`);
  try {
    let html;
    if (ENDPOINT) { try { html = await online(q); } catch (err) { html = crisis ? "" : `<p>${esc(/switched on|trouble|reached|many messages|lot of messages/i.test(err.message) ? err.message : "I could not reach the full helper just now.")}</p>` + (await local(q)); } }
    else if (!crisis) html = await local(q);
    if (html) wait.innerHTML = html; else wait.remove();
  } finally { busy = false; log.scrollTop = log.scrollHeight; input.focus({ preventScroll: true }); }
}
