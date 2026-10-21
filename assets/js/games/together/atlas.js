// Atlas: name a place that starts with the last letter of the one before. Cities, districts, states, countries, deserts and
// oceans only. For a city or district you also say where it is: the state (in India) or the country. The host (or your own
// browser in solo play, against a bot) checks every answer against a bundled list built from GeoNames.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$, report } from "../shared.js";
import { tone, PENTA, ready } from "../../audio.js";

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const KIND = { c: "Country", s: "State or province", d: "District", t: "City or town", w: "Ocean or sea", x: "Desert" };
const NEEDS_REGION = new Set(["t", "d"]);

/* ---------- data ---------- */
let DATA = null, loading = null;
export function loadAtlas() {
  if (DATA) return Promise.resolve(DATA);
  return (loading ||= fetch(new URL("../../../data/atlas.json", import.meta.url)).then((r) => { if (!r.ok) throw new Error("atlas"); return r.json(); }).then((j) => { DATA = index(j); return DATA; }).catch((e) => { loading = null; throw e; }));
}
function index(j) {
  const ix = new Map(), byFirst = {}, ent = [];
  const push = (k, row) => {
    const name = row[0], reg = row[1] ?? -1, alias = k === "t" ? row[2] === 0 : (k === "s" && row[2] === 1) || (k === "c" && ["USA", "UK", "UAE", "United States of America", "United Kingdom of Great Britain", "Burma", "Ivory Coast", "East Timor", "Czechia", "Holland"].includes(name));
    const e = { k, name, n: norm(name), reg, region: reg >= 0 ? j.r[reg] : "", pop: k === "t" ? row[2] : 5, alias };
    if (e.n.length < 2) return;
    ent.push(e); (ix.get(e.n) || ix.set(e.n, []).get(e.n)).push(e);
    if (!alias) (byFirst[e.n[0]] ||= []).push(e);
  };
  j.c.forEach((n) => push("c", [n])); j.s.forEach((r) => push("s", r)); j.d.forEach((r) => push("d", r)); j.t.forEach((r) => push("t", r)); j.w.forEach((n) => push("w", [n])); j.x.forEach((n) => push("x", [n]));
  const indiaRegs = new Set(j.d.map((r) => r[1]));
  const regAlias = new Map(); j.r.forEach((n) => regAlias.set(norm(n), n)); j.a.forEach(([a, c]) => regAlias.set(norm(a), c)); j.ca.forEach(([a, c]) => regAlias.set(norm(a), c));
  const isIndia = (e) => e.k === "d" || (e.k === "s" && e.region === "India") || (e.k === "t" && indiaRegs.has(e.reg)) || (e.k === "c" && e.n === "india");
  return { ix, byFirst, regions: j.r, regAlias, isIndia, ent };
}

/* ---------- rules ---------- */
const TWISTS = [
  { id: "india", label: "India only", test: (e, D) => D.isIndia(e) },
  { id: "water", label: "An ocean, sea or desert", test: (e) => e.k === "w" || e.k === "x" },
  { id: "country", label: "A country", test: (e) => e.k === "c" },
  { id: "state", label: "A state, province or district", test: (e) => e.k === "s" || e.k === "d" },
  { id: "short", label: "Six letters or fewer", test: (e) => e.n.length <= 6 },
  { id: "long", label: "Ten letters or more", test: (e) => e.n.length >= 10 }
];
const lastLetter = (n) => n[n.length - 1];
const START = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

function matchRegion(D, input) { const c = D.regAlias.get(norm(input)); return c || ""; }
// Decide whether a typed answer is accepted. Returns { ok, entry } or { ok: false, msg }.
function judge(D, S, name, region) {
  const nn = norm(name); const list = D.ix.get(nn);
  if (nn.length < 2) return { ok: false, msg: "Type a place name first." };
  if (!list) return { ok: false, msg: "Not on my map. Cities, districts, states, countries, deserts and oceans only, no villages." };
  if (S.letter && nn[0] !== S.letter.toLowerCase()) return { ok: false, msg: `It has to start with ${S.letter}.` };
  if (S.used.has(nn)) return { ok: false, msg: "That one has already been played." };
  let pool = list;
  if (S.twist) { const t = TWISTS.find((x) => x.id === S.twist); pool = list.filter((e) => t.test(e, D)); if (!pool.length) return { ok: false, msg: `This turn's twist: ${t.label}.` }; }
  const free = pool.find((e) => !NEEDS_REGION.has(e.k)); if (free) return { ok: true, entry: free };
  const reg = matchRegion(D, region);
  if (!region.trim()) return { ok: false, msg: pool.some((e) => e.region && D.isIndia(e)) ? "Right idea. Which state is it in?" : "Right idea. Which country is it in?" };
  const hit = pool.find((e) => e.region === reg); if (hit) return { ok: true, entry: hit };
  return { ok: false, msg: "That is not where it is. Check the state or country." };
}

/* ---------- the host ---------- */
const PACE = { 1.5: 40000, 1: 25000, 0.7: 15000 };
function makeHost(ctx, solo) {
  let S = null, D = null;
  const alive = () => S.order.filter((id) => S.lives[id] > 0);
  const view = (ph, extra) => ({ ph, order: S.order, turn: S.turn, letter: S.letter, twist: S.twist, twistLabel: S.twist ? TWISTS.find((t) => t.id === S.twist).label : "", last: S.last, hist: S.hist.slice(-8), tl: Math.max(0, S.dl - Date.now()), ms: S.ms, lives: S.lives, score: S.score, words: S.words, count: S.hist.length, wrong: S.wrong, ...extra });
  const nextAlive = (from) => { const o = S.order, n = o.length; for (let k = 1; k <= n; k++) { const id = o[(o.indexOf(from) + k) % n]; if (S.lives[id] > 0) return id; } return from; };
  function turn(id) {
    S.turn = id; S.wrong = 0; clearTimeout(S.tm);
    // a twist every fourth turn makes each round different
    S.twist = S.hist.length > 0 && S.hist.length % 4 === 0 ? pickTwist() : "";
    S.dl = Date.now() + S.ms; S.tm = ctx.after(S.ms + 400, () => lose(id, "ran out of time"));
    ctx.push(view("play"));
    if (id === "bot") S.tm2 = ctx.after(1400 + Math.random() * 2200, botMove);
  }
  function pickTwist() {
    // only offer a twist that at least a few places can satisfy for this letter
    const opts = shuffle(TWISTS.slice());
    for (const t of opts) { const n = (D.byFirst[(S.letter || "a").toLowerCase()] || []).filter((e) => !S.used.has(e.n) && t.test(e, D)).length; if (n >= 6) return t.id; }
    return "";
  }
  function accept(id, e, fast) {
    const pts = (e.k === "w" || e.k === "x" ? 15 : D.isIndia(e) ? 12 : 10) + Math.round(8 * fast);
    const mult = S.twist ? 2 : 1; S.used.add(e.n); S.score[id] = (S.score[id] || 0) + pts * mult; S.words[id] = (S.words[id] || 0) + 1;
    S.last = { n: e.name, reg: e.region, k: e.k, by: id, pts: pts * mult }; S.hist.push(S.last); S.letter = lastLetter(e.n).toUpperCase();
    clearTimeout(S.tm); clearTimeout(S.tm2);
    if (!(D.byFirst[S.letter.toLowerCase()] || []).some((x) => !S.used.has(x.n))) { S.letter = shuffle(START.slice())[0]; }
    turn(nextAlive(id));
  }
  function lose(id, why) {
    if (!S || S.over || S.turn !== id) return;
    S.lives[id]--; S.last = { n: "", reg: "", k: "", by: id, miss: why };
    if (alive().length <= (solo ? 1 : 1)) return end();
    clearTimeout(S.tm); clearTimeout(S.tm2); turn(S.lives[id] > 0 ? nextAlive(id) : nextAlive(id));
  }
  function end() { S.over = true; clearTimeout(S.tm); clearTimeout(S.tm2); ctx.push(view("end", { winner: alive()[0] || null })); }
  function botMove() {
    if (!S || S.over || S.turn !== "bot") return;
    const hard = S.bot === "hard", L = S.letter.toLowerCase(), t = S.twist && TWISTS.find((x) => x.id === S.twist);
    let c = (D.byFirst[L] || []).filter((e) => !S.used.has(e.n) && (!t || t.test(e, D)));
    if (!c.length || Math.random() < (hard ? 0.03 : 0.12)) return lose("bot", "had no answer");
    // an easy bot likes famous places; a hard one picks names that end in tricky letters
    const left = (ch) => (D.byFirst[ch] || []).filter((x) => !S.used.has(x.n)).length;
    c = c.map((e) => ({ e, w: hard ? 1 / (1 + left(lastLetter(e.n))) + Math.random() * 0.2 : e.pop + Math.random() * 3 })).sort((a, b) => b.w - a.w);
    accept("bot", c[Math.floor(Math.random() * Math.min(5, c.length))].e, 0.3);
  }
  return {
    async start(o) {
      try { D = await loadAtlas(); } catch (e) { ctx.push({ ph: "error", order: ctx.players.map((p) => p.id) }); return; }
      const lives = +o.lives || 3;
      S = { order: ctx.players.map((p) => p.id), lives: {}, score: {}, words: {}, used: new Set(), hist: [], letter: "", turn: "", twist: "", dl: 0, ms: PACE[o.pace] || 25000, tm: null, tm2: null, over: false, wrong: 0, last: null, bot: o.bot || "easy" };
      S.order.forEach((id) => { S.lives[id] = lives; S.score[id] = 0; S.words[id] = 0; });
      S.letter = shuffle(START.filter((ch) => (D.byFirst[ch.toLowerCase()] || []).length > 40))[0] || "A";
      turn(S.order[0]);
    },
    act(pid, a) {
      if (!S || S.over || a.a !== "play" || S.turn !== pid) return;
      const name = String(a.n || "").slice(0, 40), region = String(a.r || "").slice(0, 40);
      const r = judge(D, S, name, region);
      if (!r.ok) {
        S.wrong++; ctx.reply(pid, { bad: r.msg, left: Math.max(0, 3 - S.wrong) });
        if (S.wrong >= 3) lose(pid, "made three wrong tries");
        return;
      }
      accept(pid, r.entry, Math.max(0, (S.dl - Date.now()) / S.ms));
    },
    left(pid) { if (S && !S.over && S.lives[pid] > 0) { S.lives[pid] = 0; if (alive().length <= 1) return end(); if (S.turn === pid) turn(nextAlive(pid)); else ctx.push(view("play")); } },
    destroy() { if (S) { clearTimeout(S.tm); clearTimeout(S.tm2); } }
  };
}

/* ---------- the view ---------- */
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp at"><div class="mp-head"><p class="mp-turn" id="atInfo" aria-live="polite">Loading the map…</p><div class="mp-tl"><i id="atTl"></i></div></div>
  <p class="at-twist" id="atTwist" hidden></p>
  <div class="at-main"><div class="at-letter" id="atLetter" aria-live="polite"><span>starts with</span><b>?</b></div><div class="at-last" id="atLast"><span class="muted">The first place is yours.</span></div></div>
  <form class="at-form" id="atForm" autocomplete="off" hidden>
    <label class="sr-only" for="atName">Place name</label><input class="text-in at-in" id="atName" maxlength="40" placeholder="A city, district, state, country, desert or ocean" autocapitalize="words" spellcheck="false">
    <label class="sr-only" for="atReg">Where is it</label><input class="text-in at-in" id="atReg" maxlength="40" list="atRegs" placeholder="State (India) or country, needed for cities and districts" autocapitalize="words" spellcheck="false"><datalist id="atRegs"></datalist>
    <button class="btn btn-primary" type="submit"><span class="btn-t">Play it</span></button>
  </form>
  <p class="at-msg" id="atMsg" role="status"></p>
  <ul class="mp-score at-score" id="atScore"></ul>
  <ol class="at-hist" id="atHist" aria-label="Places played"></ol>
  <details class="at-how"><summary>How to play</summary><ul><li>Name a place that starts with the last letter of the previous one. Mumbai is followed by something starting with I.</li><li>Allowed: cities and towns, districts, states and provinces, countries, deserts, oceans and seas. No villages.</li><li>For a city or district, also type where it is: the state if it is in India, the country if it is anywhere else. Countries, states, deserts and oceans need nothing extra.</li><li>No place can be used twice. Three wrong tries or running out of time costs a life.</li><li>Every fourth turn has a twist, like India only or deserts and oceans only, worth double points.</li><li>Last player with lives wins. Scores break ties: deserts and oceans pay more, so do places in India, and quick answers earn a bonus.</li></ul></details>
  <div id="atEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, D = null, lastTurnKey = "", offMsg = null;
  const me = () => api.me?.id;
  loadAtlas().then((d) => { D = d; $("#atRegs").innerHTML = d.regions.map((r) => `<option value="${esc(r)}"></option>`).join(""); paint(); }, () => { $("#atInfo").textContent = "Could not load the map data. Check your connection and reopen the game."; });
  $("#atForm").addEventListener("submit", (e) => { e.preventDefault(); const n = $("#atName").value.trim(), r = $("#atReg").value.trim(); if (!n || !st || st.turn !== me()) return; say("Checking…"); api.act({ a: "play", n, r }); });
  const say = (t, bad) => { const m = $("#atMsg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
  const onMsg = (m) => { if (m?.bad) { say(`${m.bad}${m.left != null ? " (" + m.left + " tries left)" : ""}`, true); const f = $("#atForm"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); } };
  if (api.room) api.room.on("msg", onMsg); else api.onMsg?.(onMsg);

  function paint() {
    const s = st; if (!s) return;
    if (s.ph === "error") { $("#atInfo").textContent = "Could not load the map data. Check your connection and reopen the game."; return; }
    const mine = s.turn === me() && s.ph === "play", name = (id) => byId(api, id)?.name || "Player";
    $("#atInfo").innerHTML = s.ph === "end" ? "Game over" : mine ? "<b>Your turn</b>" : `${esc(name(s.turn))} is thinking…`;
    $("#atLetter").innerHTML = `<span>starts with</span><b>${esc(s.letter || "?")}</b>`;
    const tw = $("#atTwist"); tw.hidden = !s.twist; if (s.twist) tw.innerHTML = `<b>Twist:</b> ${esc(s.twistLabel)}. Double points this turn.`;
    const l = s.last, box = $("#atLast");
    box.innerHTML = l ? (l.miss ? `<span class="at-miss">${esc(name(l.by))} ${esc(l.miss)} and lost a life.</span>` : `<span class="at-place">${esc(l.n)}</span><span class="at-reg">${esc(l.reg || KIND[l.k])}${l.reg ? " · " + KIND[l.k] : ""}</span><span class="at-by">${dot(byId(api, l.by) || { color: 0, name: "?" })}${esc(name(l.by))} +${l.pts}</span>`) : `<span class="muted">The first place is yours.</span>`;
    const form = $("#atForm"); form.hidden = !mine;
    const key = s.turn + ":" + s.count + ":" + s.ph;
    if (mine && key !== lastTurnKey) { $("#atName").value = ""; $("#atReg").value = ""; say(""); setTimeout(() => $("#atName").focus({ preventScroll: true }), 60); }
    if (!mine) { if (key !== lastTurnKey) say(""); }
    lastTurnKey = key;
    $("#atScore").innerHTML = s.order.map((id) => { const p = byId(api, id) || { color: 0, name: id === "bot" ? "Atlas bot" : "?" }, out = s.lives[id] <= 0; return `<li class="${s.turn === id && s.ph === "play" ? "on" : ""}${out ? " away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.score[id] || 0}</b><em>${out ? "out" : "●".repeat(s.lives[id]) + "○".repeat(Math.max(0, (api.opts?.lives || 3) - s.lives[id]))}</em></li>`; }).join("");
    $("#atHist").innerHTML = s.hist.slice().reverse().map((x) => `<li><b>${esc(x.n)}</b> <span>${esc(x.reg || KIND[x.k])}</span></li>`).join("");
    const end = $("#atEnd");
    if (s.ph === "end") {
      const rows = s.order.map((id) => ({ id, score: s.score[id] || 0, note: `${s.words[id] || 0} places` }));
      if (solo) {
        const win = s.winner === me();
        end.innerHTML = `<div class="mp-end" role="status"><p class="mp-endlab">${win ? "You win" : "The bot wins"}</p><h3>${s.score[me()] || 0} points</h3><p class="pq-final">${s.words[me()] || 0} places named, ${s.count} played in total</p><div class="row"><button class="btn btn-primary" data-r type="button"><span class="btn-t">Play again</span></button><button class="btn btn-ghost" data-l type="button"><span class="btn-t">Change settings</span></button></div></div>`;
        end.querySelector("[data-r]").addEventListener("click", () => api.rematch()); end.querySelector("[data-l]").addEventListener("click", () => api.leave());
      } else results(end, api, rows, { unit: "pts", title: s.winner ? `${name(s.winner)} wins` : "Game over" });
    } else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    const turnChanged = !st || st.turn !== s.turn || st.count !== s.count;
    if (s.ph === "play" && turnChanged) timerBar($("#atTl"), s.tl); else if (s.ph !== "play") timerBar($("#atTl"), 0);
    if (st && s.count > st.count && ready()) tone(PENTA[(s.count * 2) % 7], 0.3, 0.05);
    if (s.ph === "end" && solo && st?.ph !== "end") report(s.score[me()] || 0);
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() { if (api.room) api.room.off("msg", onMsg); } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "lives", label: "Lives", def: 3, choices: [[2, "2"], [3, "3"], [5, "5"]] },
  { id: "pace", label: "Time per turn", def: 1, choices: [[1.5, "Relaxed (40s)"], [1, "Normal (25s)"], [0.7, "Fast (15s)"]] }
];
mp({ id: "atlas", title: "Atlas", min: 2, max: 8, options: OPTIONS, host: (ctx) => makeHost(ctx, false), view: (root, api) => mountView(root, api, false) });

game("atlas",
  `<div class="pq-solo"><div class="pq-setup" id="atSetup"><p class="pq-lede">Name a place that starts with the last letter of the last one. Cities, districts, states, countries, deserts and oceans all count. For cities and districts you also say which state or country they are in. Take on the bot, or play a room with friends.</p><div class="tg-opts">${[{ id: "bot", label: "Bot level", def: "easy", choices: [["easy", "Easy"], ["hard", "Hard"]] }, ...OPTIONS].map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><div class="row"><button class="btn btn-primary" id="atGo" type="button"><span class="btn-t">Start</span></button></div></div><div id="atStage" hidden></div></div>`,
  () => {
    const setup = q$("#atSetup"), stage = q$("#atStage"); loadAtlas().catch(() => {});
    let host = null, view = null, timers = [], msgFn = null;
    const me = { id: "me", name: "You", color: 0, host: true, away: false }, bot = { id: "bot", name: "Atlas bot", color: 4, host: false, away: false };
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { players: [me, bot], after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => view?.render(s), reply: (pid, d) => msgFn?.(d) };
    const api = { me, players: [me, bot], isHost: true, solo: true, opts: {}, act: (a) => host?.act("me", a), onMsg: (f) => (msgFn = f), rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; }
    function go() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); const o = get(); api.opts = o; setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx, true); host.start(o); }
    q$("#atGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
