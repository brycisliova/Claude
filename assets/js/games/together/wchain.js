// Word antakshari: a word chain. Say a word that starts with the last letter of the one before. Any real English word
// counts (a dictionary of about 270,000), no word can be used twice, and twists are optional.
// Play the bot, or a room of 2 to 8. The host (or your own browser in solo play) checks every answer.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$, report } from "../shared.js";
import { tone, PENTA, ready } from "../../audio.js";
import { startClass, endClasses, classLabel, classDev, canon } from "./hinglish.js";

const lower = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
// words the dictionary holds but a friendly game should neither accept nor offer
const BLOCK = new Set("fuck fucker fucking shit bitch bastard cunt dick cock pussy whore slut nigger nigga faggot fag retard rape rapist porn penis vagina anal anus tits boob boobs dildo wank wanker twat piss crap damn".split(" "));

let DATA = null, loading = null;
export function loadWords() {
  if (DATA) return Promise.resolve(DATA);
  const get = (f) => fetch(new URL(`../../../data/${f}`, import.meta.url)).then((r) => { if (!r.ok) throw new Error(f); return r.text(); });
  return (loading ||= Promise.all([get("words.txt"), get("common-words.txt")]).then(([all, com]) => {
    const words = new Set(all.split("\n").filter((w) => w.length >= 3 && !BLOCK.has(w))), byFirst = {}, common = {};
    for (const w of words) (byFirst[w[0]] ||= []).push(w);
    for (const w of com.split("\n")) if (w.length >= 3 && words.has(w)) (common[w[0]] ||= []).push(w);
    return (DATA = { words, byFirst, common });
  }).catch((e) => { loading = null; throw e; }));
}

// Twists are optional, come on a fixed beat that is shown to everyone, apply to every player alike and only appear when
// plenty of words fit. Nothing here tries to corner the player.
// Hinglish mode: Hindi words typed in Roman letters. The word list is every word in the titles of the Hindi and Punjabi songs
// in our music list (build-hinglish.mjs), grouped by sound so that pyar and pyaar are one word. The chain follows the sound a
// word starts and ends on (see hinglish.js).
let HIN = null, hloading = null;
export function loadHinglish() {
  if (HIN) return Promise.resolve(HIN);
  return (hloading ||= fetch(new URL("../../../data/hinglish-words.json", import.meta.url)).then((r) => { if (!r.ok) throw new Error("hinglish"); return r.json(); }).then((rows) => {
    const known = new Map();
    for (const [w, n] of rows) { const c = canon(w); const e = known.get(c); if (!e) known.set(c, { c, w, n }); else { e.n += n; } }
    const byStart = {}; for (const e of [...known.values()].sort((a, b) => b.n - a.n)) (byStart[startClass(e.w)] ||= []).push(e);
    return (HIN = { known, byStart });
  }).catch((e) => { hloading = null; throw e; }));
}
const HI_START = "k kh g ch j t d n p ph b bh m y r l v sh s h a i u e o".split(" ");

const TWISTS = [
  { id: "long", label: "7 letters or more", test: (w) => w.length >= 7 },
  { id: "short", label: "3 or 4 letters only", test: (w) => w.length <= 4 },
  { id: "vowel", label: "Ends with a vowel", test: (w) => /[aeiou]$/.test(w) },
  { id: "double", label: "Has a double letter, like ball", test: (w) => /(.)\1/.test(w) }
];
const TWIST_EVERY = 5, TWIST_ROOM = 40;
const START = "abcdefghilmnoprstw".split("");
const PACE = { 1.5: 30000, 1: 20000, 0.7: 12000 };
const MIN = { 3: 3, 4: 4, 5: 5 };
const last = (w) => w[w.length - 1];

/* ---------- the host ---------- */
function makeHost(ctx, solo) {
  let S = null, D = null, H = null;
  const alive = () => S.order.filter((id) => S.lives[id] > 0);
  const tw = () => (S.twist ? TWISTS.find((t) => t.id === S.twist) : null);
  const view = (ph, extra) => ({ ph, order: S.order, turn: S.turn, letter: S.letter, allowed: S.allowed, hi: S.hi, twist: S.twist, twistLabel: tw()?.label || "", last: S.last, hist: S.hist.slice(-8), tl: Math.max(0, S.dl - Date.now()), ms: S.ms, lives: S.lives, score: S.score, words: S.words, count: S.hist.length, min: S.min, twistIn: S.twists ? TWIST_EVERY - (S.hist.length % TWIST_EVERY) : 0, swap: S.swap, ...extra });
  const nextAlive = (from) => { const o = S.order, n = o.length; for (let k = 1; k <= n; k++) { const id = o[(o.indexOf(from) + k) % n]; if (S.lives[id] > 0) return id; } return from; };
  const options = (letter, t) => (D.byFirst[letter] || []).filter((w) => w.length >= S.min && !S.used.has(w) && (!t || t.test(w)));
  const hOptions = (classes) => classes.flatMap((c) => (H.byStart[c] || []).filter((e) => e.w.length >= S.min && !S.used.has(e.c)));
  function pickTwist() { for (const t of shuffle(TWISTS.slice())) if (options(S.letter, t).length >= TWIST_ROOM) return t.id; return ""; }
  // Fair letter: if a word ends in a letter almost nothing starts with (Q, X and the like), the next word starts with the
  // letter before it, for whoever is next, human or bot.
  function nextLetter(w) {
    let i = w.length - 1; S.swap = "";
    while (i > 0 && (D.common[w[i]] || []).filter((x) => !S.used.has(x)).length < 10) i--;
    if (i < w.length - 1) S.swap = `${w[w.length - 1].toUpperCase()} is too rare, so the next word starts with ${w[i].toUpperCase()}.`;
    return w[i];
  }
  function turn(id) {
    S.turn = id; S.wrong = 0; S.tk = (S.tk || 0) + 1; clearTimeout(S.tm);
    S.twist = S.twists && !S.hi && S.hist.length > 0 && S.hist.length % TWIST_EVERY === 0 ? pickTwist() : "";
    S.ms = S.ms0; S.dl = Date.now() + S.ms; S.tm = ctx.after(S.ms + 300, () => lose(id, "ran out of time"));
    ctx.push(view("play"));
    if (id === "bot") S.tm2 = ctx.after((S.bot === "hard" ? 1100 : 1700) + Math.random() * 2400, botMove);
  }
  function accept(id, w, fast) {
    const pts = w.length * 2 + Math.round(8 * fast) + (!S.hi && /[jqxz]/.test(w) ? 6 : 0), mult = S.twist ? 2 : 1;
    S.used.add(S.hi ? canon(w) : w); S.score[id] = (S.score[id] || 0) + pts * mult; S.words[id] = (S.words[id] || 0) + 1;
    S.last = { n: w, by: id, pts: pts * mult }; S.hist.push(S.last);
    clearTimeout(S.tm); clearTimeout(S.tm2);
    if (S.hi) {
      S.swap = ""; S.allowed = endClasses(w); if (!S.allowed.length) S.allowed = [HI_START[0]];
      if (!hOptions(S.allowed).length) { S.allowed = [shuffle(HI_START.filter((c) => hOptions([c]).length > 5))[0] || "k"]; S.swap = "Nothing is left for that sound, so here is a fresh one."; }
      S.letter = S.allowed[0];
    } else {
      S.letter = nextLetter(w); S.allowed = [S.letter];
      if (!options(S.letter).length) { S.letter = shuffle(START.slice())[0]; S.allowed = [S.letter]; S.swap = "Nothing is left for that letter, so here is a fresh one."; }
    }
    turn(nextAlive(id));
  }
  function lose(id, why) {
    if (!S || S.over || S.turn !== id) return;
    S.lives[id]--; S.last = { n: "", by: id, miss: why };
    if (alive().length <= 1) return end();
    clearTimeout(S.tm); clearTimeout(S.tm2); turn(nextAlive(id));
  }
  function end() { S.over = true; clearTimeout(S.tm); clearTimeout(S.tm2); ctx.push(view("end", { winner: alive()[0] || null })); }
  // The bot plays like a person: it says a common word that fits, and never chooses a word for the letter it leaves you with.
  // "Sharp" has a bigger vocabulary and answers a little faster.
  function botMove() {
    if (!S || S.over || S.turn !== "bot") return;
    const sharp = S.bot === "hard", t = tw();
    if (S.hi) {
      const all = hOptions(S.allowed), common = all.filter((e) => e.n >= 2), pool = (common.length >= 4 ? common : all).slice(0, sharp ? 500 : 140);
      if (!pool.length || Math.random() < (pool.length < 4 ? 0.35 : sharp ? 0.015 : 0.04)) return lose("bot", "could not think of one");
      return accept("bot", pool[Math.floor(Math.random() * pool.length)].w, 0.3);
    }
    let c = (D.common[S.letter] || []).filter((w) => w.length >= S.min && !S.used.has(w) && (!t || t.test(w)));
    if (!c.length) c = options(S.letter, t);
    else c = c.slice(0, sharp ? 900 : 260);
    if (!c.length || Math.random() < (c.length < 4 ? 0.35 : sharp ? 0.015 : 0.04)) return lose("bot", "could not think of one");
    accept("bot", c[Math.floor(Math.random() * c.length)], 0.3);
  }
  return {
    async start(o) {
      const hi = o.lang === "hi";
      try { if (hi) H = await loadHinglish(); else D = await loadWords(); } catch (e) { ctx.push({ ph: "error", order: ctx.players.map((p) => p.id) }); return; }
      const lives = +o.lives || 3;
      S = { order: ctx.players.map((p) => p.id), lives: {}, score: {}, words: {}, used: new Set(), hist: [], letter: "", allowed: [], hi, turn: "", twist: "", dl: 0, ms: 0, ms0: PACE[o.pace] || 20000, tm: null, tm2: null, over: false, wrong: 0, last: null, bot: o.bot || "easy", min: MIN[o.min] || 3, twists: String(o.twists) === "1", swap: "" };
      S.order.forEach((id) => { S.lives[id] = lives; S.score[id] = 0; S.words[id] = 0; });
      S.letter = hi ? shuffle(HI_START.filter((c) => hOptions([c]).length > 30))[0] : shuffle(START.slice())[0]; S.allowed = [S.letter];
      turn(S.order[0]);
    },
    act(pid, a) {
      if (!S || S.over || a.a !== "play" || S.turn !== pid) return;
      if (S.hi) {
        const word = String(a.w || "").trim().split(/\s+/)[0].slice(0, 30), c = canon(word); let msg = "";
        if (!word || !c) msg = "Type a word first.";
        else if (word.replace(/[^\p{L}]/gu, "").length < Math.min(S.min, 3)) msg = `Use a word with at least ${Math.min(S.min, 3)} letters.`;
        else if (!S.allowed.includes(startClass(word))) msg = `It has to start with ${S.allowed.map(classLabel).join(" or ")}.`;
        else if (S.used.has(c)) msg = "That word has already been used (spellings count as the same word).";
        else if (!H.known.has(c) && !H.known.has(canon(word.replace(/n$/i, "")))) msg = "I do not know that Hindi word yet. I know words from Hindi and Punjabi song titles. Try another spelling, or another word.";
        if (msg) { S.wrong++; ctx.reply(pid, { bad: msg, left: Math.max(0, 3 - S.wrong) }); if (S.wrong >= 3) lose(pid, "made three wrong tries"); return; }
        return accept(pid, word.toLowerCase(), Math.max(0, (S.dl - Date.now()) / S.ms));
      }
      const w = lower(a.w).slice(0, 30), t = tw();
      let msg = "";
      if (w.length < S.min) msg = `Use a word with at least ${S.min} letters.`;
      else if (w[0] !== S.letter) msg = `It has to start with ${S.letter.toUpperCase()}.`;
      else if (S.used.has(w)) msg = "That word has already been used.";
      else if (!D.words.has(w)) msg = "That is not in my dictionary. Check the spelling.";
      else if (t && !t.test(w)) msg = `This turn's twist: ${t.label}.`;
      if (msg) { S.wrong++; ctx.reply(pid, { bad: msg, left: Math.max(0, 3 - S.wrong) }); if (S.wrong >= 3) lose(pid, "made three wrong tries"); return; }
      accept(pid, w, Math.max(0, (S.dl - Date.now()) / S.ms));
    },
    left(pid) { if (S && !S.over && S.lives[pid] > 0) { S.lives[pid] = 0; if (alive().length <= 1) return end(); if (S.turn === pid) turn(nextAlive(pid)); else ctx.push(view("play")); } },
    destroy() { if (S) { clearTimeout(S.tm); clearTimeout(S.tm2); } }
  };
}

/* ---------- the view ---------- */
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp at wc"><div class="mp-head"><p class="mp-turn" id="wcInfo" aria-live="polite">Loading the dictionary…</p><div class="mp-tl"><i id="wcTl"></i></div></div>
  <p class="at-twist" id="wcTwist" hidden></p><p class="at-msg at-swap" id="wcSwap" hidden></p>
  <div class="at-main"><div class="at-letter" id="wcLetter" aria-live="polite"><span>starts with</span><b>?</b></div><div class="at-last" id="wcLast"><span class="muted">The first word is yours.</span></div></div>
  <form class="at-form wc-form" id="wcForm" autocomplete="off" hidden><label class="sr-only" for="wcIn">Your word</label><input class="text-in at-in" id="wcIn" maxlength="30" placeholder="Type a word" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="send"><button class="btn btn-primary" type="submit"><span class="btn-t">Play it</span></button></form>
  <p class="at-msg" id="wcMsg" role="status"></p>
  <ul class="mp-score at-score" id="wcScore"></ul><ol class="at-hist" id="wcHist" aria-label="Words played"></ol>
  <details class="at-how"><summary>How to play</summary><ul><li>Say a word that starts with the last letter of the previous word. "Garden" is followed by a word starting with N.</li><li>Any real English word counts. No word can be used twice.</li><li>Longer words score more, and a J, Q, X or Z earns a bonus. Quick answers get extra.</li><li>Twists are optional. If you switch them on, every fifth turn has one, like "7 letters or more". It is the same for everyone, it is announced two turns ahead, and it only comes up when plenty of words fit. Twist turns score double.</li><li><b>Rare letters:</b> if a word ends in a letter almost nothing starts with, like Q or X, the next word starts with the letter before it. That goes for you and the bot alike.</li><li class="wc-hi" hidden><b>Hinglish mode:</b> type Hindi words the way you text them. Spelling does not matter (pyar and pyaar are the same word), and Hindi letters work too. The word has to start with the sound shown, and the next word starts with the sound yours ends on, ignoring the vowel on the end (so "dil" is followed by an L word, and "pyaar" by an R word). If a word ends in "n" after a vowel, like "nahin", the sound before it counts too. The word list is every word from the titles of Hindi and Punjabi songs in our music list.</li><li><b>The bot</b> says common words, the way a person would. It never picks a word to leave you a hard letter.</li><li>Three wrong tries, or running out of time, costs a life. The last player with lives wins.</li></ul></details>
  <div id="wcEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, lastKey = "";
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || (id === "bot" ? "Word bot" : "Player");
  loadWords().then(() => paint(), () => { $("#wcInfo").textContent = "Could not load the dictionary. Check your connection and reopen the game."; });
  const say = (t, bad) => { const m = $("#wcMsg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
  $("#wcForm").addEventListener("submit", (e) => { e.preventDefault(); const w = $("#wcIn").value.trim(); if (!w || !st || st.turn !== me()) return; api.act({ a: "play", w }); $("#wcIn").value = ""; });
  const onMsg = (m) => { if (m?.bad) { say(`${m.bad}${m.left != null ? " (" + m.left + " tries left)" : ""}`, true); const f = $("#wcForm"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); $("#wcIn").focus({ preventScroll: true }); } };
  if (api.room) api.room.on("msg", onMsg); else api.onMsg?.(onMsg);
  function paint() {
    const s = st; if (!s) return;
    if (s.ph === "error") { $("#wcInfo").textContent = "Could not load the dictionary. Check your connection and reopen the game."; return; }
    const mine = s.turn === me() && s.ph === "play";
    $("#wcInfo").innerHTML = s.ph === "end" ? "Game over" : mine ? "<b>Your turn</b>" : `${esc(name(s.turn))} is thinking…`;
    const al = s.allowed || [s.letter];
    $("#wcLetter").innerHTML = s.hi ? `<span>starts with</span><b>${esc(classLabel(al[0]) || "?")}</b><small>${esc(classDev(al[0]).split(" ").join(" or "))}${al.length > 1 ? " · or " + al.slice(1).map((c) => esc(classLabel(c))).join(" or ") : ""}</small>` : `<span>starts with</span><b>${esc((s.letter || "?").toUpperCase())}</b>`;
    $("#wcIn").placeholder = s.hi ? "A Hindi word, like pyar or zindagi" : "Type a word";
    root.querySelectorAll(".wc-hi").forEach((el) => (el.hidden = !s.hi));
    const tw = $("#wcTwist"); tw.hidden = !s.twist && !(s.twistIn > 0 && s.twistIn <= 2); if (s.twist) tw.innerHTML = `<b>Twist:</b> ${esc(s.twistLabel)}. Double points this turn.`; else if (!tw.hidden) tw.innerHTML = `A twist round is coming in ${s.twistIn} ${s.twistIn === 1 ? "turn" : "turns"}. It is the same for everyone.`;
    const sw = $("#wcSwap"); sw.hidden = !s.swap || s.ph !== "play"; sw.textContent = s.swap || "";
    const l = s.last;
    $("#wcLast").innerHTML = l ? (l.miss ? `<span class="at-miss">${esc(name(l.by))} ${esc(l.miss)} and lost a life.</span>` : `<span class="at-place">${esc(l.n)}</span><span class="at-by">${dot(byId(api, l.by) || { color: 4, name: "?" })}${esc(name(l.by))} +${l.pts}</span>`) : `<span class="muted">The first word is yours.</span>`;
    const form = $("#wcForm"); form.hidden = !mine;
    const key = s.turn + ":" + s.count + ":" + s.ph;
    if (mine && key !== lastKey) { $("#wcIn").value = ""; say(`Words of ${s.min}+ letters.`); setTimeout(() => $("#wcIn").focus({ preventScroll: true }), 60); }
    if (!mine && key !== lastKey) say("");
    lastKey = key;
    $("#wcScore").innerHTML = s.order.map((id) => { const p = byId(api, id) || { color: 4, name: name(id) }, out = s.lives[id] <= 0; return `<li class="${s.turn === id && s.ph === "play" ? "on" : ""}${out ? " away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.score[id] || 0}</b><em>${out ? "out" : "●".repeat(s.lives[id]) + "○".repeat(Math.max(0, (api.opts?.lives || 3) - s.lives[id]))}</em></li>`; }).join("");
    $("#wcHist").innerHTML = s.hist.slice().reverse().map((x) => `<li><b>${esc(x.n || "—")}</b></li>`).join("");
    const end = $("#wcEnd");
    if (s.ph === "end") {
      const rows = s.order.map((id) => ({ id, score: s.score[id] || 0, note: `${s.words[id] || 0} words` }));
      if (solo) {
        const win = s.winner === me();
        end.innerHTML = `<div class="mp-end" role="status"><p class="mp-endlab">${win ? "You win" : "The bot wins"}</p><h3>${s.score[me()] || 0} points</h3><p class="pq-final">${s.words[me()] || 0} words played, ${s.count} in the whole chain</p><div class="row"><button class="btn btn-primary" data-r type="button"><span class="btn-t">Play again</span></button><button class="btn btn-ghost" data-l type="button"><span class="btn-t">Change settings</span></button></div></div>`;
        end.querySelector("[data-r]").addEventListener("click", () => api.rematch()); end.querySelector("[data-l]").addEventListener("click", () => api.leave());
      } else results(end, api, rows, { unit: "pts", title: s.winner ? `${name(s.winner)} wins` : "Game over" });
    } else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    const changed = !st || st.turn !== s.turn || st.count !== s.count;
    if (s.ph === "play" && changed) timerBar($("#wcTl"), s.tl); else if (s.ph !== "play") timerBar($("#wcTl"), 0);
    if (st && s.count > st.count && ready()) tone(PENTA[(s.count * 2) % 7], 0.3, 0.05);
    if (s.ph === "end" && solo && st?.ph !== "end") report(s.score[me()] || 0);
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() { if (api.room) api.room.off("msg", onMsg); } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "lang", label: "Words in", def: "en", choices: [["en", "English"], ["hi", "Hinglish (Hindi words in Roman letters)"]] },
  { id: "lives", label: "Lives", def: 3, choices: [[2, "2"], [3, "3"], [5, "5"]] },
  { id: "pace", label: "Time per turn", def: 1, choices: [[1.5, "Relaxed (30s)"], [1, "Normal (20s)"], [0.7, "Fast (12s)"]] },
  { id: "min", label: "Shortest word", def: 3, choices: [[3, "3 letters"], [4, "4 letters"], [5, "5 letters"]] },
  { id: "twists", label: "Twist rounds", def: 0, choices: [[0, "Off"], [1, "Every fifth turn"]] }
];
mp({ id: "wchain", title: "Word antakshari", min: 2, max: 8, options: OPTIONS, host: (ctx) => makeHost(ctx, false), view: (root, api) => mountView(root, api, false) });

game("wchain",
  `<div class="pq-solo"><div class="pq-setup" id="wcSetup"><p class="pq-lede">Say a word that starts with the last letter of the one before. Any real English word counts, from "garden" to "quartz", or switch to Hinglish and play with Hindi words typed in Roman letters. No repeats. The bot plays fair: common words, no tricks with letters. Beat it, or play a room with friends.</p><div class="tg-opts">${[{ id: "bot", label: "Bot level", def: "easy", choices: [["easy", "Relaxed (everyday words)"], ["hard", "Sharp (bigger vocabulary)"]] }, ...OPTIONS].map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><div class="row"><button class="btn btn-primary" id="wcGo" type="button"><span class="btn-t">Start</span></button></div></div><div id="wcStage" hidden></div></div>`,
  () => {
    const setup = q$("#wcSetup"), stage = q$("#wcStage"); loadWords().catch(() => {}); loadHinglish().catch(() => {});
    let host = null, view = null, timers = [], msgFn = null;
    const me = { id: "me", name: "You", color: 0, host: true, away: false }, bot = { id: "bot", name: "Word bot", color: 4, host: false, away: false };
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { players: [me, bot], after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => view?.render(s), reply: (pid, d) => msgFn?.(d) };
    const api = { me, players: [me, bot], isHost: true, solo: true, opts: {}, act: (a) => host?.act("me", a), onMsg: (f) => (msgFn = f), rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; }
    function go() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); const o = get(); api.opts = o; o.lives = +o.lives; setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx, true); host.start(o); }
    q$("#wcGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
