// Pride pop quiz: one quiz engine used twice, solo in the games window and as a room game for 2 to 8 players.
// The host (or the solo player's own browser) holds the answers. Players only ever receive the question.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, report, $ as q$ } from "../shared.js";
import { BANK, TOPICS } from "../../data/pop.js";
import { MORE } from "../../data/pop-more.js";
import { EXTRA } from "../../data/pop-extra.js";
import { FUN } from "../../data/pop-fun.js";
import { PICS } from "../../data/pop-pics.js";
import { PHOTOS } from "../../data/pop-photos.js";
import { tone, PENTA, ready } from "../../audio.js";

const ALL = [...BANK, ...MORE, ...EXTRA, ...PICS, ...FUN];
const TIME = { pic: 20000, place: 20000, mc: 15000, tf: 10000, who: 15000, emoji: 15000, clue: 21000, odd: 15000, first: 10000, num: 20000 };
const REVEAL_MS = 6000;
const LABEL = { pic: "Who is this?", place: "Spot the place", mc: "Quick question", tf: "True or false?", who: "Who said it?", emoji: "Emoji decoder", clue: "Who am I?", odd: "Odd one out", first: "Which came first?", num: "Closest wins" };
const WILD = new Set(["emoji", "clue", "odd", "who", "first", "pic", "place"]);
const RIGHT = ["Slay.", "Iconic.", "Correct, and fabulous.", "Serving knowledge.", "Gagged, in a good way.", "Encyclopaedia energy.", "Sashay to the next one.", "Not even a hint of shade. You're right."];
const WRONG = ["Not this time, babe.", "The tea was elsewhere.", "Plot twist!", "Honey, no. But kindly.", "That one stung a little.", "Learn it, love it, move on.", "Shade. But with love."];
const SLOW = ["Too slow. The music stopped.", "The clock won that round.", "Time's up, darling."];
const picUrl = (id) => new URL(`../../../img/pop/${id}.webp`, import.meta.url).href;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const RANKS = [[0.9, "Pop culture royalty"], [0.75, "Main character"], [0.55, "Certified fan"], [0.35, "Rising star"], [0, "Every legend starts somewhere"]];

// registerQuiz builds a quiz game (solo and room) from a bank of questions. The Pride pop quiz is registered at the bottom;
// trivia.js registers the general knowledge quiz from the same engine.
export function registerQuiz(cfg) {
const ALL = cfg.all, RIGHT = cfg.right, WRONG = cfg.wrong, SLOW = cfg.slow, RANKS = cfg.ranks, TOPICS = cfg.topics, SEEN_KEY = cfg.seenKey;
/* ---------- building a round ---------- */
function prep(src) {
  const q = { ...src };
  if (q.t === "tf" || q.t === "num") return q;
  const right = q.o[0], o = shuffle(q.o.slice()); q.o = o; q.a = o.indexOf(right);
  if (q.t === "first") { q.o = shuffle(q.o.slice()); q.a = q.o.indexOf(right); }
  return q;
}
// Questions already seen on this device are skipped until the topic runs out, so every game feels fresh.
const fnv = (str) => { let x = 2166136261; for (let i = 0; i < str.length; i++) x = Math.imul(x ^ str.charCodeAt(i), 16777619); return (x >>> 0).toString(36); };
const qid = (b) => fnv(b.t + "|" + (b.img || b.code || (b.t === "clue" ? b.clues[0] : b.t === "first" ? b.o.slice().sort().join("|") : b.q)));
const readSeen = () => { try { const v = JSON.parse(localStorage.getItem(SEEN_KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const writeSeen = (a) => { try { localStorage.setItem(SEEN_KEY, JSON.stringify(a.slice(-2000))); } catch (e) { /* private mode */ } };
const forgetSeen = () => writeSeen([]);
const inTopic = (topic) => ALL.filter((b) => (topic === "mix" ? (cfg.mixFilter ? cfg.mixFilter(b) : true) : topic === "wild" ? WILD.has(b.t) : b.cat === topic));
function freshCount(topic) { const seen = new Set(readSeen()), pool = inTopic(topic); return { fresh: pool.filter((b) => !seen.has(qid(b))).length, total: pool.length }; }
function buildQuestions(topic, total) {
  let pool = inTopic(topic);
  if (pool.length < total) pool = ALL.slice();
  const seen0 = readSeen(), seenSet = new Set(seen0);
  let fresh = shuffle(pool.filter((b) => !seenSet.has(qid(b)))), rest = shuffle(pool.filter((b) => seenSet.has(qid(b))));
  // not enough unseen ones left: use what is new first, then start the topic over
  if (fresh.length < total) { const ids = new Set(pool.map(qid)); writeSeen(seen0.filter((id) => !ids.has(id))); }
  pool = fresh.concat(rest);
  const out = [], kinds = []; let nums = 0; const maxNum = Math.max(2, Math.ceil(total / 5)); const maxPic = Math.max(3, Math.ceil(total / 4)); let pics = 0;
  const isPic = (b) => b.t === "pic" || b.t === "place";
  while (out.length < total && pool.length) {
    let i = pool.findIndex((b) => b.t !== kinds[0] && !(b.t === "num" && nums >= maxNum) && !(isPic(b) && pics >= maxPic));
    if (i < 0) i = 0;
    const b = pool.splice(i, 1)[0]; if (b.t === "num") nums++; if (isPic(b)) pics++;
    kinds.unshift(b.t); out.push(prep(b));
  }
  writeSeen(readSeen().concat(out.map(qid)));
  return out;
}
const pub = (q, i) => ({ t: q.t, q: q.q, o: q.o, clues: q.clues, code: q.code, img: q.img, unit: q.unit, x2: (i + 1) % 5 === 0 });

/* ---------- the host: scoring and pacing ---------- */
function makeHost(ctx, manual) {
  let S = null;
  const ms = (q) => Math.round(TIME[q.t] * S.pace);
  const view = (ph) => {
    const base = { ph, i: S.i, total: S.qs.length, scores: S.scores, order: S.order, right: S.right, streak: S.streak, manual };
    if (ph === "q") return { ...base, pre: S.i === 0 ? S.qs.filter((x) => x.img).map((x) => x.img) : undefined, q: pub(S.qs[S.i], S.i), ms: S.ms, tl: Math.max(0, S.dl - Date.now()), answered: Object.keys(S.picks) };
    if (ph === "r") { const q = S.qs[S.i]; return { ...base, q: pub(q, S.i), ms: S.ms, a: q.a, e: q.e, picks: S.picks, gain: S.gain, good: S.good }; }
    return base;
  };
  function ask() {
    S.picks = {}; S.gain = {}; S.good = {}; const q = S.qs[S.i]; S.ms = ms(q); S.dl = Date.now() + S.ms; S.ph = "q";
    clearTimeout(S.tm); S.tm = ctx.after(S.ms + 300, reveal); ctx.push(view("q"));
  }
  function reveal() {
    if (S.ph !== "q") return; S.ph = "r"; clearTimeout(S.tm);
    const q = S.qs[S.i], x2 = (S.i + 1) % 5 === 0 ? 2 : 1;
    S.order.forEach((pid) => {
      const c = S.picks[pid]; let g = 0, good = false;
      if (c) {
        if (q.t === "num") { const d = Math.abs(c.v - q.a); g = Math.round(200 * Math.max(0, 1 - d / q.tol)); if (d === 0) g += 50; good = g >= 100; }
        else if (c.v === q.a) { good = true; const f = Math.max(0, 1 - c.t / S.ms); g = q.t === "clue" ? 100 + Math.round(100 * f) : 100 + Math.round(50 * f); }
      }
      S.streak[pid] = good ? (S.streak[pid] || 0) + 1 : 0;
      if (good) { g += Math.min(40, (S.streak[pid] - 1) * 10); S.right[pid] = (S.right[pid] || 0) + 1; }
      g *= g ? x2 : 1; S.gain[pid] = g; S.good[pid] = good; S.scores[pid] = (S.scores[pid] || 0) + g;
    });
    ctx.push(view("r"));
    if (!manual) S.tm = ctx.after(REVEAL_MS, next);
  }
  function next() {
    if (S.ph !== "r") return; clearTimeout(S.tm);
    if (S.i + 1 >= S.qs.length) { S.ph = "end"; ctx.push(view("end")); } else { S.i++; ask(); }
  }
  return {
    start(o) {
      S = { qs: buildQuestions(o.topic || "mix", +o.rounds || 10), i: 0, scores: {}, right: {}, streak: {}, picks: {}, gain: {}, good: {}, order: ctx.players.map((p) => p.id), tm: null, dl: 0, ms: 0, ph: "q", pace: +o.pace || 1 };
      S.order.forEach((id) => { S.scores[id] = 0; S.right[id] = 0; S.streak[id] = 0; }); ask();
    },
    act(pid, a) {
      if (!S) return;
      if (a.a === "next") { if (manual) next(); return; }
      if (S.ph !== "q" || a.a !== "ans" || S.picks[pid] || !S.order.includes(pid)) return;
      const q = S.qs[S.i]; let v = a.c;
      if (q.t === "num") { v = Number(v); if (!Number.isFinite(v) || Math.abs(v) > 1e7) return; }
      else if (!Number.isInteger(v) || v < 0 || v >= q.o.length) return;
      S.picks[pid] = { v, t: Math.min(S.ms, Date.now() - (S.dl - S.ms)) };
      const live = S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left && !p.away; });
      if (live.every((id) => S.picks[id])) { clearTimeout(S.tm); S.tm = ctx.after(700, reveal); }
      ctx.push(view("q"));
    },
    destroy() { if (S) clearTimeout(S.tm); }
  };
}

/* ---------- the shared view ---------- */
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp mp-quiz pq"><div class="mp-head"><p class="mp-turn" id="pqInfo"></p><div class="mp-tl"><i id="pqTl"></i></div></div><p class="pq-tag" id="pqTag"></p><div class="qz-card pq-card" id="pqCard"></div><div class="qz-opts" id="pqOpts"></div><form class="pq-num" id="pqNum" hidden><label class="sr-only" for="pqIn">Your guess</label><input class="text-in" id="pqIn" type="number" inputmode="numeric" step="1" placeholder="Type a number"><button class="btn btn-primary" type="submit"><span class="btn-t">Lock it in</span></button></form><p class="qz-fact" id="pqFact" aria-live="polite"></p><p class="pq-credit" id="pqCredit"></p><div class="row pq-nextrow" id="pqNextRow" hidden><button class="btn btn-primary" id="pqNext" type="button"><span class="btn-t">Next question</span></button></div><ul class="mp-score" id="pqScore"></ul><div id="pqEnd"></div></div>`;
  const $ = (s) => root.querySelector(s);
  let st = null, mine = null, builtKey = "", timers = [], quip = "";
  const clearT = () => { timers.forEach(clearTimeout); timers = []; };
  const send = (v) => { if (!st || st.ph !== "q" || mine !== null) return; mine = v; api.act({ a: "ans", c: v }); paint(); };
  $("#pqNum").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#pqIn").value; if (v === "" || !Number.isFinite(Number(v))) return; send(Number(v)); });
  $("#pqNext").addEventListener("click", () => api.act({ a: "next" }));

  function cardFor(s) {
    const q = s.q;
    if (q.t === "emoji") return `<p class="pq-emoji" aria-label="Emoji clue">${esc(q.code)}</p><p class="qz-q pq-sub">${esc(q.q)}</p>`;
    if (q.t === "who") return `<p class="pq-quote">&ldquo;${esc(q.q.replace(/^'|'$/g, ""))}&rdquo;</p>`;
    if (q.t === "clue") return `<ol class="pq-clues" id="pqClues">${q.clues.map((c, i) => `<li data-i="${i}" data-t="${esc(c)}" class="${i === 0 ? "on" : ""}"><span>${i + 1}</span><i>${i === 0 ? esc(c) : "Next clue is on its way…"}</i></li>`).join("")}</ol>`;
    if (q.t === "pic" || q.t === "place") return `<figure class="pq-photo" id="pqPhoto" style="--ms:${Math.round(Math.max(0, s.tl || 0) * 0.85)}ms"><img src="${picUrl(q.img)}" alt="A photograph to identify" decoding="async"></figure><p class="qz-q pq-sub">${esc(q.q)}</p>`;
    if (q.t === "first") return `<p class="qz-q">Which came first?</p>`;
    return `<p class="qz-q">${esc(q.q)}</p>`;
  }
  function revealClues(upTo) { root.querySelectorAll("#pqClues li").forEach((li) => { const on = +li.dataset.i <= upTo; li.classList.toggle("on", on); li.querySelector("i").textContent = on ? li.dataset.t : "Next clue is on its way…"; }); }

  function paint() {
    const s = st; if (!s) return;
    $("#pqInfo").innerHTML = s.ph === "end" ? "Final scores" : `Question <b>${s.i + 1}</b> of ${s.total}`;
    const tag = $("#pqTag");
    if (s.ph === "end") { tag.textContent = ""; $("#pqCard").innerHTML = ""; $("#pqCard").hidden = true; $("#pqOpts").innerHTML = ""; $("#pqNum").hidden = true; $("#pqFact").textContent = ""; $("#pqNextRow").hidden = true; }
    else {
      const q = s.q, key = s.i + ":" + q.q;
      tag.innerHTML = `<span class="pq-chip pqc-${q.t}">${LABEL[q.t]}</span>${q.x2 ? `<span class="pq-chip pqc-x2">Showstopper: double points</span>` : ""}`;
      $("#pqCard").hidden = false;
      if (key !== builtKey) { $("#pqCard").innerHTML = cardFor(s); builtKey = key; }
      const opts = $("#pqOpts"), num = $("#pqNum"), me = api.me?.id, myPick = s.picks?.[me];
      if (q.t === "num") {
        opts.innerHTML = ""; num.hidden = false; const inp = $("#pqIn"), btn = num.querySelector("button");
        const done = s.ph !== "q" || mine !== null; inp.disabled = done; btn.disabled = done;
        if (s.ph === "q" && mine === null && inp.dataset.k !== key) { inp.value = ""; inp.dataset.k = key; setTimeout(() => inp.focus({ preventScroll: true }), 50); }
        if (s.ph === "r") inp.value = myPick ? String(myPick.v) : "";
      } else {
        num.hidden = true;
        const two = q.t === "tf" || q.t === "first" || q.o.length === 2;
        opts.className = "qz-opts " + (two ? "two" : "four") + (q.t === "tf" ? " pq-tf" : ""); opts.innerHTML = "";
        q.o.forEach((label, i) => {
          const b = h("button", { class: "qz-o" + (q.t === "tf" ? (i === 0 ? " fact" : " myth") : ""), type: "button" }, `<span class="pq-k">${i + 1}</span>${esc(label)}`);
          b.disabled = s.ph !== "q" || mine !== null;
          if (s.ph === "q" && mine === i) b.classList.add("picked");
          if (s.ph === "r") {
            if (i === s.a) b.classList.add("ok"); else if (myPick?.v === i) b.classList.add("no"); b.disabled = true;
            const who = s.order.filter((id) => s.picks[id]?.v === i).map((id) => byId(api, id)).filter(Boolean);
            if (who.length) b.insertAdjacentHTML("beforeend", `<span class="pq-who" aria-label="${esc(who.map((p) => p.name).join(", "))}">${who.map((p) => dot(p)).join("")}</span>`);
          }
          b.addEventListener("click", () => send(i)); opts.appendChild(b);
        });
      }
      const fact = $("#pqFact");
      if (s.ph === "r") {
        const g = s.gain[me] || 0, good = s.good?.[me];
        const ans = q.t === "num" ? `The answer is <b>${esc(String(s.a))}${q.unit ? " " + esc(q.unit) : ""}</b>.` : "";
        const head = q.t === "num" && myPick ? `<strong>${esc(quip)} You said ${esc(String(myPick.v))}${g ? ", +" + g : ""}.</strong>` : `<strong>${esc(quip)}${g ? " +" + g : ""}</strong>`;
        fact.innerHTML = `${head} ${ans} ${esc(s.e)}${q.t === "num" && s.order.length > 1 ? `<span class="pq-guesses">${s.order.map((id) => { const p = byId(api, id); const c = s.picks[id]; return p ? `<i>${dot(p)}${esc(p.name)}: ${c ? esc(String(c.v)) : "no guess"}</i>` : ""; }).join("")}</span>` : ""}`;
        void good;
      } else fact.textContent = s.ph === "q" && mine !== null ? (solo ? "Locked in." : "Locked in. Waiting for the others…") : "";
      const cr = $("#pqCredit"), ph = PHOTOS[q.img];
      if (s.ph === "r" && ph) { const img = root.querySelector("#pqPhoto img"); if (img) img.alt = q.o[s.a]; root.querySelector("#pqPhoto")?.classList.add("done"); cr.innerHTML = `Photo: <a href="${esc(ph.pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(ph.title)}</a> by ${esc(ph.author)}, ${esc(ph.license)}, via Wikimedia Commons`; } else cr.textContent = "";
      $("#pqNextRow").hidden = !(solo && s.ph === "r");
      if (solo && s.ph === "r") { $("#pqNext").querySelector(".btn-t").textContent = s.i + 1 >= s.total ? "See my result" : "Next question"; $("#pqNext").focus({ preventScroll: true }); }
    }
    $("#pqScore").innerHTML = s.order.map((id) => {
      const p = byId(api, id); if (!p) return "";
      const done = s.ph === "q" ? s.answered?.includes(id) : s.picks?.[id], st2 = s.streak?.[id] || 0;
      return `<li class="${p.away ? "away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b>${s.ph === "r" ? `<em class="${s.gain[id] ? "up" : ""}">${s.gain[id] ? "+" + s.gain[id] : ""}</em>` : done && s.ph === "q" ? `<em>ready</em>` : ""}${st2 > 1 && s.ph !== "end" ? `<em class="pq-streak" title="Answers right in a row">streak ${st2}</em>` : ""}</li>`;
    }).join("");
    const end = $("#pqEnd");
    if (s.ph === "end") {
      const rows = s.order.map((id) => ({ id, score: s.scores[id] || 0, note: `${s.right[id] || 0} of ${s.total} right` }));
      if (solo) {
        const r = (s.right[api.me.id] || 0) / s.total, rank = RANKS.find(([m]) => r >= m)[1];
        end.innerHTML = `<div class="mp-end" role="status"><p class="mp-endlab">Your title</p><h3>${esc(rank)}</h3><p class="pq-final">${s.scores[api.me.id]} points &middot; ${s.right[api.me.id]} of ${s.total} right</p><div class="row"><button class="btn btn-primary" data-r type="button"><span class="btn-t">Play again</span></button><button class="btn btn-ghost" data-l type="button"><span class="btn-t">Change topic</span></button></div></div>`;
        end.querySelector("[data-r]").addEventListener("click", () => api.rematch()); end.querySelector("[data-l]").addEventListener("click", () => api.leave());
      } else results(end, api, rows, { unit: "pts" });
    } else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    const newQ = s.ph === "q" && (!st || st.i !== s.i || st.ph !== "q");
    if (s.pre) s.pre.forEach((id) => { const im = new Image(); im.src = picUrl(id); });
    if (newQ) { mine = s.answered?.includes(api.me?.id) ? (mine ?? "x") : null; builtKey = ""; clearT(); timerBar($("#pqTl"), s.tl); }
    if (s.ph === "q" && s.q.t === "clue") {
      // clues unlock one at a time: the quicker you guess, the fewer you need
      clearT(); const el = s.ms - s.tl, step = s.ms / 3;
      const unlocked = Math.min(2, Math.floor(el / step));
      [1, 2].forEach((k) => { const wait = k * step - el; if (wait > 0) timers.push(setTimeout(() => revealClues(k), wait)); });
      st = s; paint(); revealClues(unlocked); return;
    }
    if (s.ph === "r" && st?.ph !== "r") {
      const me = api.me?.id, good = s.good?.[me], any = s.picks?.[me];
      quip = good ? pick(RIGHT) : any ? pick(WRONG) : pick(SLOW);
      if (ready()) { tone(good ? PENTA[6] : PENTA[1], 0.5, 0.07); }
      clearT(); timerBar($("#pqTl"), 0);
    }
    if (s.ph === "end") { clearT(); timerBar($("#pqTl"), 0); }
    st = s; paint();
    if (newQ && (s.q.t === "pic" || s.q.t === "place")) {
      const f = root.querySelector("#pqPhoto"), im = f?.querySelector("img");
      // tall portraits get a squarer frame so faces are not cropped away
      const shape = () => { if (im.naturalHeight > im.naturalWidth * 0.9) f.classList.add("sq"); };
      if (im) { if (im.complete && im.naturalWidth) shape(); else im.addEventListener("load", shape, { once: true }); }
      if (f) requestAnimationFrame(() => requestAnimationFrame(() => f.classList.add("clearing")));
    }
    if (s.ph === "r" && s.q.t === "clue") revealClues(2);
  }
  const keys = (e) => {
    if (!st || st.ph !== "q" || mine !== null || e.target.closest?.("input,textarea,select") || e.ctrlKey || e.metaKey) return;
    const n = +e.key; if (n >= 1 && n <= st.q.o?.length) { send(n - 1); e.preventDefault(); }
  };
  root.addEventListener("keydown", keys);
  return { render, players() { paint(); }, destroy() { clearT(); } };
}

/* ---------- registering: room game and solo game ---------- */
const OPTIONS = [
  { id: "topic", label: "Topic", def: "mix", choices: TOPICS },
  { id: "rounds", label: "Questions", def: 15, choices: [[10, "10"], [15, "15"], [20, "20"], [30, "30"]] },
  { id: "pace", label: "Pace", def: 1, choices: [[1.5, "Chill"], [1, "Normal"], [0.7, "Frantic"]] }
];
mp({ id: cfg.id, title: cfg.title, min: 2, max: 8, options: OPTIONS, host: (ctx) => makeHost(ctx, false), view: (root, api) => mountView(root, api, false) });

game(cfg.id,
  `<div class="pq-solo"><div class="pq-setup" id="pqSetup"><p class="pq-lede">${cfg.lede(ALL.length)}</p><div class="tg-opts">${OPTIONS.map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><div class="row"><button class="btn btn-primary" id="pqGo" type="button"><span class="btn-t">Start the quiz</span></button></div><p class="pq-seen" id="pqSeen"></p></div><div id="pqStage" hidden></div></div>`,
  () => {
    const setup = q$("#pqSetup"), stage = q$("#pqStage");
    let host = null, view = null, last = null, timers = [];
    const me = { id: "me", name: "You", color: 0, host: true, away: false };
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { players: [me], after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => { last = s; view?.render(s); if (s.ph === "end") report(s.scores.me); } };
    const api = { me, players: [me], isHost: true, solo: true, act: (a) => host.act("me", a), rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; seenNote(); }
    function go() {
      host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); const o = get();
      setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx, true); host.start(o);
    }
    const seenNote = () => { const t = get().topic, { fresh, total } = freshCount(t); q$("#pqSeen").innerHTML = fresh >= total ? `${total} questions in this topic, and every one is new to you.` : `${fresh} of ${total} questions in this topic are new to you. <button class="pq-link" id="pqForget" type="button">Show me old ones again</button>`; q$("#pqForget")?.addEventListener("click", () => { forgetSeen(); seenNote(); }); };
    setup.querySelector('[data-o="topic"]').addEventListener("change", seenNote); seenNote();
    q$("#pqGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
}

// The everyday mix is pop culture: history and law questions (icons and Queer India facts) stay available as their own topics only.
const FACTS = new Set(["icons", "india"]), FACT_TYPES = new Set(["mc", "tf", "num", "first"]);
const POP_TOPICS = [["mix", "Everything fun (the default)"], ["music", "Music and divas"], ["screen", "Film, TV and stage"], ["desi", "Bollywood and desi pop"], ["ballroom", "Drag, ballroom and slang"], ["arts", "Stars, sport, books and games"], ["wild", "Emoji, riddles and odd ones out"], ["icons", "Icons, firsts and history"], ["india", "Queer India"]];
registerQuiz({ id: "pop", title: "Pride pop quiz", all: ALL, right: RIGHT, wrong: WRONG, slow: SLOW, ranks: RANKS, topics: POP_TOPICS, mixFilter: (b) => b.fun || !(FACTS.has(b.cat) && FACT_TYPES.has(b.t)), seenKey: "wwa-pop-seen-v2", lede: (n) => `${n} questions about pop music, films, Bollywood, drag, memes and the stars everyone loves, with photographs, emoji and riddles. History and law are in their own topics, so the default is just fun. Each game draws a fresh set, and a question will not come back until you have seen the rest.` });
