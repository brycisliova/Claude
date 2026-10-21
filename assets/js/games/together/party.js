// Adda: a party game for 3 to 10 friends. Rounds rotate through eight mini-games: fool your friends with a fake answer,
// vote on who is most likely to, would you rather, hot takes, desi situations, confession roulette, truth or dare, and
// guess the word. Prompts are drawn from a big bank and never repeat on this device until the bank runs out.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$ } from "../shared.js";
import { pickFresh } from "../fresh.js";
import { LIKELY, WYR, TRUTHS, DARES, SITUATIONS, CONFESSIONS, HOT, WORDS } from "../../data/party.js";
import { FAKE } from "../../data/party-fake.js";
import { tone, PENTA, ready } from "../../audio.js";

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const fresh = (key, bank, idOf) => pickFresh("wwa-adda-" + key, bank, idOf, 1)[0];

const MODES = {
  fake: { label: "Fake it", min: 3, tip: "Write a believable fake answer. Then spot the real one." },
  likely: { label: "Most likely to", min: 2, tip: "Vote for the friend who fits best." },
  wyr: { label: "Would you rather", min: 2, tip: "Pick one. The majority scores." },
  hot: { label: "Hot take", min: 2, tip: "Agree or disagree. Go with the crowd." },
  sit: { label: "Situation", min: 3, tip: "Write what you would say. Everyone votes for the best answer." },
  conf: { label: "Confession roulette", min: 3, tip: "Write an anonymous answer. Then guess who wrote each one." },
  td: { label: "Truth or dare", min: 2, tip: "The hot seat picks truth or dare. The others rate it." },
  word: { label: "Guess the word", min: 2, tip: "The describer talks, everyone else types guesses. If nobody gets it, a truth comes out." }
};
const MS = { fake: [35000, 25000, 9000], likely: [20000, 7000], wyr: [15000, 7000], hot: [12000, 6000], sit: [40000, 25000, 9000], conf: [35000, 14000, 6000], td: [12000, 60000, 12000, 7000], word: [45000, 8000] };
const live = (ctx) => ctx.players.filter((p) => !p.left);

/* ---------- the host ---------- */
function makeHost(ctx) {
  let S = null;
  const ids = () => S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left; });
  const pace = (ms) => Math.round(ms * S.pace);
  const view = (extra) => ({ ph: S.ph, mode: S.mode, mlabel: MODES[S.mode]?.label, tip: MODES[S.mode]?.tip, i: S.i, total: S.total, order: S.order, scores: S.scores, tl: Math.max(0, S.dl - Date.now()), ms: S.ms, done: Object.keys(S.sub), prompt: S.prompt, opts: S.opts, who: S.who, k: S.k, kn: S.kn, text: S.text, wlen: S.wlen, ...extra });
  const add = (id, n) => { S.scores[id] = (S.scores[id] || 0) + n; S.gain[id] = (S.gain[id] || 0) + n; };
  const stat = (id, k, n = 1) => { (S.stat[id] ||= {})[k] = ((S.stat[id] || {})[k] || 0) + n; };
  function setPhase(ph, ms, extra = {}) { S.ph = ph; S.sub = {}; S.ms = pace(ms); S.dl = Date.now() + S.ms; Object.assign(S, extra); clearTimeout(S.tm); S.tm = ctx.after(S.ms + 300, () => timeout()); }
  const allIn = () => { const who = ids().filter((id) => S.need ? S.need(id) : true); return who.length && who.every((id) => id in S.sub); };

  /* round setup */
  function pickMode() {
    const n = ids().length; let pool = Object.keys(MODES).filter((m) => MODES[m].min <= n && (m !== "fake" || FAKE.length > 8));
    if (S.only !== "mixed" && pool.includes(S.only)) return S.only;
    if (!S.bag.length) S.bag = shuffle(pool.slice());
    let m = S.bag.pop(); if (m === S.mode && S.bag.length) { const m2 = S.bag.pop(); S.bag.unshift(m); m = m2; }
    return m;
  }
  function nextRound() {
    if (S.i >= S.total) { S.ph = "end"; clearTimeout(S.tm); return ctx.push(view({ awards: awards() })); }
    S.i++; S.gain = {}; S.mode = pickMode(); S.opts = []; S.who = ""; S.text = ""; S.k = 0; S.kn = 0; S.R = {}; S.need = null; S.wlen = 0; S.prompt = "";
    const m = S.mode, R = S.R;
    if (m === "fake") { const q = fresh("fake", FAKE, (x) => x.q); R.q = q; S.prompt = q.q; setPhase("w", MS.fake[0]); }
    else if (m === "likely") { const p = fresh("likely", LIKELY, (x) => x); S.prompt = "Most likely to " + p + "?"; S.opts = ids().map((id) => ({ id, label: "" })); setPhase("v", MS.likely[0]); }
    else if (m === "wyr") { const p = fresh("wyr", WYR, (x) => x[0] + x[1]); R.p = p; S.prompt = "Would you rather…"; S.opts = [{ id: 0, label: p[0] }, { id: 1, label: p[1] }]; setPhase("v", MS.wyr[0]); }
    else if (m === "hot") { const p = fresh("hot", HOT, (x) => x); S.prompt = p; S.opts = [{ id: 0, label: "Agree" }, { id: 1, label: "Disagree" }]; setPhase("v", MS.hot[0]); }
    else if (m === "sit") { const p = fresh("sit", SITUATIONS, (x) => x); S.prompt = p; setPhase("w", MS.sit[0]); }
    else if (m === "conf") { const p = fresh("conf", CONFESSIONS, (x) => x); S.prompt = p; setPhase("w", MS.conf[0]); }
    else if (m === "td") { S.tdi = (S.tdi + 1) % S.order.length; let c = S.order[S.tdi], tries = 0; while (!ids().includes(c) && tries++ < 12) { S.tdi = (S.tdi + 1) % S.order.length; c = S.order[S.tdi]; } R.who = c; S.who = c; S.prompt = ""; S.need = (id) => id === c; setPhase("p", MS.td[0]); }
    else if (m === "word") { const w = fresh("word", WORDS, (x) => x.w), ps = ids(); const g = ps[(S.wi++) % ps.length]; R.w = w; R.giver = g; S.who = g; S.prompt = `${S.name(g)} describes. Everyone else guesses.`; S.wlen = w.w.length; S.need = (id) => id !== g; R.wrong = 0; R.order = []; setPhase("g", MS.word[0]); ctx.reply(g, { secret: { w: w.w, no: w.no, c: w.c } }); }
    ctx.push(view());
  }

  /* when time is up or everyone has answered */
  function timeout() { if (!S || S.ph === "end") return; step(); }
  function step() {
    const m = S.mode, R = S.R; clearTimeout(S.tm);
    if (m === "fake") { if (S.ph === "w") return startFakeVote(); if (S.ph === "v") return revealFake(); return nextRound(); }
    if (m === "likely" || m === "wyr" || m === "hot") { if (S.ph === "v") return revealVotes(); return nextRound(); }
    if (m === "sit") { if (S.ph === "w") return startSitVote(); if (S.ph === "v") return revealSit(); return nextRound(); }
    if (m === "conf") { if (S.ph === "w") return startConf(); if (S.ph === "g") return revealConf(); if (S.k + 1 >= S.kn) return nextRound(); return confAsk(S.k + 1); }
    if (m === "td") { if (S.ph === "p") return tdDo(); if (S.ph === "d") return tdRate(); if (S.ph === "t") return tdReveal(); return nextRound(); }
    if (m === "word") { if (S.ph === "g") return revealWord(); return nextRound(); }
  }
  const finishPhase = () => { if (allIn()) { clearTimeout(S.tm); S.tm = ctx.after(600, () => step()); } };

  /* fake it */
  function startFakeVote() {
    const R = S.R, by = new Map();
    Object.entries(S.sub).forEach(([pid, t]) => { const k = norm(t); if (!k) return; (by.get(k) || by.set(k, { t, by: [] }).get(k)).by.push(pid); });
    const real = R.q.a, rk = norm(real); if (by.has(rk)) by.delete(rk);
    R.cards = [...by.values(), { t: real, by: [], real: true }]; R.cards = shuffle(R.cards);
    S.opts = R.cards.map((c, i) => ({ id: i, label: c.t }));
    S.need = null; setPhase("v", MS.fake[1]); ctx.push(view());
  }
  function revealFake() {
    const R = S.R, rows = [];
    R.cards.forEach((c, i) => {
      const voters = Object.entries(S.sub).filter(([, v]) => v === i).map(([p]) => p);
      if (c.real) voters.forEach((v) => { add(v, 100); stat(v, "spotted"); }); else voters.forEach(() => c.by.forEach((a) => { add(a, 50); stat(a, "fooled"); }));
      rows.push({ t: c.t, by: c.by, voters, real: !!c.real });
    });
    setPhase("r", MS.fake[2]); ctx.push(view({ rv: { rows, msg: R.q.e, gain: S.gain } }));
  }
  /* votes for likely / wyr / hot */
  function revealVotes() {
    const m = S.mode, tally = {}; Object.values(S.sub).forEach((v) => { tally[v] = (tally[v] || 0) + 1; });
    const top = Math.max(0, ...Object.values(tally)); const wins = Object.keys(tally).filter((k) => tally[k] === top);
    Object.entries(S.sub).forEach(([pid, v]) => { if (wins.includes(String(v))) add(pid, m === "likely" ? 100 : 50); });
    if (m === "likely") wins.forEach((w) => stat(w, "crowned"));
    const rows = S.opts.map((o) => ({ t: m === "likely" ? "" : o.label, pid: m === "likely" ? o.id : null, voters: Object.entries(S.sub).filter(([, v]) => v === o.id).map(([p]) => p), win: wins.includes(String(o.id)) }));
    setPhase("r", MS[m][1]); ctx.push(view({ rv: { rows, gain: S.gain, msg: m === "likely" ? "Voters who matched the crowd score." : "The majority scores." } }));
  }
  /* situation */
  function startSitVote() {
    const R = S.R, ans = Object.entries(S.sub).map(([pid, t]) => ({ t, by: [pid] }));
    if (ans.length < 2) { setPhase("r", 5000); return ctx.push(view({ rv: { rows: ans.map((a) => ({ t: a.t, by: a.by, voters: [] })), gain: S.gain, msg: "Not enough answers to vote on." } })); }
    R.cards = shuffle(ans); S.opts = R.cards.map((c, i) => ({ id: i, label: c.t })); S.need = null; setPhase("v", MS.sit[1]); ctx.push(view());
  }
  function revealSit() {
    const R = S.R; const rows = R.cards.map((c, i) => { const voters = Object.entries(S.sub).filter(([, v]) => v === i).map(([p]) => p); voters.forEach(() => { add(c.by[0], 100); stat(c.by[0], "funny"); }); return { t: c.t, by: c.by, voters }; });
    setPhase("r", MS.sit[2]); ctx.push(view({ rv: { rows, gain: S.gain, msg: "100 points for every vote." } }));
  }
  /* confession roulette */
  function startConf() {
    const R = S.R, ans = shuffle(Object.entries(S.sub).map(([pid, t]) => ({ pid, t }))).slice(0, 6);
    if (ans.length < 2) { setPhase("r", 4000); S.kn = 0; return ctx.push(view({ rv: { rows: [], gain: S.gain, msg: "Not enough confessions this time." } })); }
    R.ans = ans; S.kn = ans.length; confAsk(0);
  }
  function confAsk(k) { const R = S.R, a = R.ans[k]; S.k = k; S.text = a.t; S.opts = ids().map((id) => ({ id, label: "" })); S.need = (id) => id !== a.pid; setPhase("g", MS.conf[1]); ctx.push(view()); }
  function revealConf() {
    const R = S.R, a = R.ans[S.k], rows = []; let wrong = 0;
    Object.entries(S.sub).forEach(([pid, g]) => { if (g === a.pid) { add(pid, 100); stat(pid, "sleuth"); } else { wrong++; } });
    if (wrong) { add(a.pid, 50 * wrong); stat(a.pid, "fooled", wrong); }
    rows.push({ t: a.t, by: [a.pid], voters: Object.entries(S.sub).filter(([, g]) => g === a.pid).map(([p]) => p) });
    setPhase("r", MS.conf[2]); ctx.push(view({ rv: { rows, gain: S.gain, msg: "" } }));
  }
  /* truth or dare */
  function tdDo() {
    const R = S.R, kind = S.sub[R.who] || (Math.random() < 0.5 ? "truth" : "dare");
    R.kind = kind; const p = kind === "truth" ? fresh("truth", TRUTHS, (x) => x) : fresh("dare", DARES, (x) => x); S.prompt = `${kind === "truth" ? "Truth" : "Dare"}: ${p}`;
    S.need = (id) => id === R.who; setPhase("d", MS.td[1]); ctx.push(view({ kind }));
  }
  function tdRate() {
    const R = S.R; R.did = S.sub[R.who] === "done";
    if (!R.did) return tdReveal();
    S.need = (id) => id !== R.who; setPhase("t", MS.td[2]); ctx.push(view({ kind: R.kind }));
  }
  function tdReveal() {
    const R = S.R; let msg;
    if (R.did) { const hot = Object.values(S.sub).filter((v) => v === 1).length; add(R.who, 100 + 25 * hot); stat(R.who, "brave"); Object.keys(S.sub).forEach((p) => add(p, 10)); msg = `${hot} found it spicy.`; }
    else { add(R.who, -50); msg = "Skipped. Minus 50."; }
    setPhase("r", MS.td[3]); ctx.push(view({ kind: R.kind, rv: { rows: [], gain: S.gain, msg } }));
  }
  /* guess the word */
  function revealWord() {
    const R = S.R, got = R.order.length; let truth = "";
    if (!got) truth = fresh("truth", TRUTHS, (x) => x);
    setPhase("r", MS.word[1]); ctx.push(view({ rv: { rows: [], gain: S.gain, msg: got ? "" : "Nobody got it, so the describer answers a truth.", word: R.w.w, truth, giver: R.giver } }));
  }

  /* actions */
  function act(pid, a) {
    if (!S || S.ph === "end" || S.ph === "r") return;
    if (S.need && !S.need(pid)) return;
    const m = S.mode, ph = S.ph, R = S.R;
    if (m === "word" && ph === "g") {
      if (a.a !== "guess" || pid === R.giver || R.order.includes(pid)) return;
      const t = clean(a.t, 40); if (!t) return;
      if (norm(t) === norm(R.w.w)) { const rank = R.order.length; R.order.push(pid); add(pid, Math.max(40, 100 - rank * 25)); add(R.giver, 80); stat(pid, "wordy"); S.sub[pid] = 1; ctx.reply(pid, { ok: "Got it!" }); }
      else { R.wrong++; ctx.reply(pid, { bad: "Not that one." }); }
      ctx.push(view({ wrong: R.wrong })); const others = ids().filter((id) => id !== R.giver); if (others.every((id) => R.order.includes(id))) { clearTimeout(S.tm); S.tm = ctx.after(900, () => step()); } return;
    }
    if (S.sub[pid] !== undefined) return;
    if (ph === "w") {
      if (a.a !== "text") return; const t = clean(a.t, m === "sit" || m === "conf" ? 140 : 40); if (!t) return;
      if (m === "fake" && norm(t) === norm(R.q.a)) return ctx.reply(pid, { bad: "Too close to the real thing! Try another." });
      S.sub[pid] = t; ctx.reply(pid, { ok: "Locked in." }); ctx.push(view()); return finishPhase();
    }
    if (ph === "v" || (m === "conf" && ph === "g")) {
      if (a.a !== "vote" || !S.opts.some((o) => o.id === a.c)) return;
      if (m === "fake" || m === "sit") { const c = R.cards[a.c]; if (c?.by.includes(pid)) return ctx.reply(pid, { bad: "You can't vote for your own." }); }
      if (m === "likely" && a.c === pid) return ctx.reply(pid, { bad: "Pick someone else." });
      S.sub[pid] = a.c; ctx.push(view()); return finishPhase();
    }
    if (m === "td") {
      if (ph === "p" && (a.c === "truth" || a.c === "dare")) { S.sub[pid] = a.c; ctx.push(view()); clearTimeout(S.tm); S.tm = ctx.after(500, () => step()); }
      else if (ph === "d" && (a.c === "done" || a.c === "skip")) { S.sub[pid] = a.c; clearTimeout(S.tm); S.tm = ctx.after(300, () => step()); ctx.push(view()); }
      else if (ph === "t" && (a.c === 0 || a.c === 1)) { S.sub[pid] = a.c; ctx.push(view()); finishPhase(); }
    }
  }
  function awards() {
    const best = (k) => { let b = null; Object.entries(S.stat).forEach(([id, s]) => { if ((s[k] || 0) > (b?.n || 0)) b = { id, n: s[k] }; }); return b; };
    const A = [["Master of lies", best("fooled"), "fooled"], ["Lie detector", best("spotted"), "spotted"], ["Everyone's pick", best("crowned"), "crowned"], ["Funniest in the room", best("funny"), "votes"], ["Sleuth", best("sleuth"), "caught"], ["Brave one", best("brave"), "dares"], ["Word wizard", best("wordy"), "words"]];
    return A.filter((a) => a[1]).slice(0, 4).map((a) => ({ t: a[0], id: a[1].id, n: a[1].n, u: a[2] }));
  }

  return {
    start(o) {
      const ps = ctx.players; S = { order: ps.map((p) => p.id), scores: {}, stat: {}, gain: {}, i: 0, total: +o.rounds || 12, only: o.mode || "mixed", pace: +o.pace || 1, bag: [], mode: "", ph: "", sub: {}, tm: null, dl: 0, ms: 0, tdi: -1, wi: 0, opts: [], prompt: "", who: "", R: {}, name: (id) => ctx.players.find((p) => p.id === id)?.name || "Player", need: null };
      S.order.forEach((id) => { S.scores[id] = 0; }); nextRound();
    },
    act,
    left() { if (S && S.ph !== "end" && S.ph !== "r") { if (S.need && ids().length && S.mode === "td" && S.R.who && !ids().includes(S.R.who)) return step(); finishPhase(); } },
    destroy() { if (S) clearTimeout(S.tm); }
  };
}

/* ---------- the view ---------- */
function mountView(root, api) {
  root.innerHTML = `<div class="mp pt"><div class="mp-head"><p class="mp-turn" id="ptInfo"></p><div class="mp-tl"><i id="ptTl"></i></div></div><p class="pt-tag" id="ptTag"></p><div class="qz-card pt-card" id="ptCard"></div><div id="ptBody"></div><p class="pt-msg" id="ptMsg" role="status"></p><ul class="mp-score pt-score" id="ptScore"></ul><div id="ptEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, secret = null, myVote = null, mySub = null, key = "";
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || "Player", norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const onMsg = (m) => { if (m?.secret) { secret = m.secret; paint(); } else if (m?.bad) say(m.bad, true); else if (m?.ok) say(m.ok); };
  api.room.on("msg", onMsg);
  const say = (t, bad) => { const el = $("#ptMsg"); el.textContent = t; el.classList.toggle("bad", !!bad); };
  const send = (a) => api.act(a);
  const dots = (arr) => (arr || []).map((id) => dot(byId(api, id) || { color: 0, name: "?" })).join("");

  function reveal(rv) {
    const s = st, rows = (rv.rows || []).map((r) => `<li class="${r.win ? "win" : ""}${r.real ? " real" : ""}"><span class="pt-rt">${r.pid ? esc(name(r.pid)) : esc(r.t)}</span><span class="pt-rb">${r.real ? `<em class="pt-real">The real one</em>` : r.by?.length ? `<em>by ${r.by.map((p) => esc(name(p))).join(", ")}</em>` : ""}${r.voters?.length ? `<span class="pt-vt">${dots(r.voters)}</span>` : ""}</span></li>`).join("");
    const gain = s.order.filter((id) => rv.gain?.[id]).map((id) => `<span>${dot(byId(api, id) || { color: 0, name: "?" })}${esc(name(id))} <b class="${rv.gain[id] < 0 ? "neg" : "up"}">${rv.gain[id] > 0 ? "+" : ""}${rv.gain[id]}</b></span>`).join("");
    const extra = rv.word ? `<p class="pt-wordis">The word was <b>${esc(rv.word)}</b></p>` : "";
    const truth = rv.truth ? `<p class="pt-truth"><b>${esc(name(rv.giver))}</b>, truth time: ${esc(rv.truth)}</p>` : "";
    return `${extra}${truth}<ul class="pt-rows">${rows}</ul>${rv.msg ? `<p class="pt-note">${esc(rv.msg)}</p>` : ""}<p class="pt-gain">${gain}</p>`;
  }
  const textForm = (ph, max) => `<form class="pt-form" id="ptForm" autocomplete="off"><label class="sr-only" for="ptIn">Your answer</label><input class="text-in" id="ptIn" maxlength="${max}" placeholder="${ph}"><button class="btn btn-primary" type="submit"><span class="btn-t">Lock it in</span></button></form>`;
  const optButtons = (s, own) => `<div class="pt-opts">${s.opts.map((o) => { const label = s.mode === "likely" || s.mode === "conf" ? name(o.id) : o.label, dis = myVote !== null || (own && own(o)) || (s.mode === "likely" && o.id === me()) || false; return `<button class="qz-o pt-o${myVote === o.id ? " picked" : ""}" data-c="${esc(String(o.id))}" type="button"${dis ? " disabled" : ""}>${s.mode === "likely" || s.mode === "conf" ? dot(byId(api, o.id) || { color: 0, name: "?" }) : ""}${esc(label)}</button>`; }).join("")}</div>`;

  function paint() {
    const s = st; if (!s) return;
    $("#ptInfo").innerHTML = s.ph === "end" ? "Game over" : `Round <b>${s.i}</b> of ${s.total}`;
    $("#ptTag").innerHTML = s.ph === "end" ? "" : `<span class="pq-chip pt-chip pt-${s.mode}">${esc(s.mlabel)}</span><span class="pt-tip">${esc(s.tip)}</span>`;
    const body = $("#ptBody"), card = $("#ptCard"), m = s.mode, ph = s.ph, mine = me();
    card.hidden = ph === "end";
    if (ph === "end") { body.innerHTML = ""; }
    else {
      let c = s.prompt ? `<p class="qz-q">${esc(s.prompt)}</p>` : "";
      if (m === "conf" && ph !== "w") c = `<p class="pt-sub">${esc(st.confPrompt || "")}</p><p class="pt-quote">“${esc(s.text)}”</p><p class="muted small">Answer ${s.k + 1} of ${s.kn}. Who wrote it?</p>`;
      if (m === "conf" && ph === "w") c = `<p class="qz-q">${esc(s.prompt)}</p>`;
      if (m === "word" && ph === "g") c = `<p class="qz-q">${esc(s.prompt)}</p><p class="pt-blanks" aria-label="${s.wlen} letters">${"_ ".repeat(s.wlen).trim()}</p><p class="muted small">${s.wrong || 0} wrong guesses so far</p>`;
      if (m === "td") { const hot = s.who; c = ph === "p" ? `<p class="qz-q">${esc(name(hot))} is in the hot seat</p><p class="muted">Truth or dare?</p>` : `<p class="pt-sub">${esc(name(hot))} is on it</p><p class="qz-q">${esc(s.prompt)}</p>`; }
      card.innerHTML = c;
      // body
      const newKey = s.i + ":" + s.mode + ":" + s.ph + ":" + (s.k || 0);
      const same = newKey === key;
      if (!same) { myVote = null; mySub = null; key = newKey; say(""); }
      const done = (s.done || []).includes(mine);
      if (ph === "r") body.innerHTML = reveal(s.rv || {});
      else if (m === "word" && ph === "g") {
        if (mine === s.who) body.innerHTML = secret ? `<div class="pt-secret"><p class="muted small">Only you can see this. Describe it without saying the words below.</p><p class="pt-sw">${esc(secret.w)}</p><p class="pt-no">${secret.no.map((n) => `<span>${esc(n)}</span>`).join("")}</p></div>` : `<p class="muted">Getting your word…</p>`;
        else if (done) body.innerHTML = `<p class="pt-ok">You got it!</p>`;
        else if (!same || !$("#ptForm")) { body.innerHTML = textForm("Type your guess", 40); }
      } else if (ph === "w") {
        if (done) body.innerHTML = `<p class="pt-ok">Locked in. Waiting for the others… (${(s.done || []).length} of ${s.order.length})</p>`;
        else if (!$("#ptForm")) body.innerHTML = textForm(m === "fake" ? "Write a believable fake answer" : m === "conf" ? "Your anonymous confession" : "What do you say?", m === "fake" ? 40 : 140);
      } else if (m === "td" && ph === "p") body.innerHTML = mine === s.who ? `<div class="pt-opts"><button class="qz-o pt-o" data-c="truth" type="button">Truth</button><button class="qz-o pt-o" data-c="dare" type="button">Dare</button></div>` : `<p class="muted">Waiting for ${esc(name(s.who))} to choose…</p>`;
      else if (m === "td" && ph === "d") body.innerHTML = mine === s.who ? `<div class="pt-opts"><button class="qz-o pt-o" data-c="done" type="button">Done it</button><button class="qz-o pt-o" data-c="skip" type="button">Skip (minus 50)</button></div>` : `<p class="muted">Watching ${esc(name(s.who))}… the rating comes next.</p>`;
      else if (m === "td" && ph === "t") body.innerHTML = mine === s.who ? `<p class="muted">The others are rating you…</p>` : `<div class="pt-opts"><button class="qz-o pt-o${myVote === 1 ? " picked" : ""}" data-c="1" type="button"${myVote !== null ? " disabled" : ""}>Spicy</button><button class="qz-o pt-o${myVote === 0 ? " picked" : ""}" data-c="0" type="button"${myVote !== null ? " disabled" : ""}>Meh</button></div>`;
      else if (ph === "v" || (m === "conf" && ph === "g")) {
                const own = (o) => (m === "fake" || m === "sit") && mySub && norm(o.label) === norm(mySub);
        body.innerHTML = (m === "conf" && mySub && norm(s.text) === norm(mySub)) ? `<p class="pt-ok">That one is yours. Sit tight and watch them guess.</p>` : (m === "conf" && done) ? `<p class="pt-ok">Guess locked in.</p>` : optButtons(s, own) + `<p class="muted small">${(s.done || []).length} of ${s.order.length} voted</p>`;
      }
    }
    $("#ptScore").innerHTML = s.order.map((id) => { const p = byId(api, id) || { color: 0, name: "?" }; return `<li class="${p.away ? "away" : ""}${s.who === id && s.ph !== "end" ? " on" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b></li>`; }).join("");
    const end = $("#ptEnd");
    if (ph === "end") {
      results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0 })), { unit: "pts", title: "Adda champion" });
      const aw = (s.awards || []).map((a) => `<li><b>${esc(a.t)}</b> ${dot(byId(api, a.id) || { color: 0, name: "?" })}${esc(name(a.id))} <small>(${a.n} ${esc(a.u)})</small></li>`).join("");
      if (aw) end.insertAdjacentHTML("afterbegin", `<ul class="pt-awards">${aw}</ul>`);
    } else end.innerHTML = "";
    bind();
  }
  function bind() {
    root.querySelectorAll(".pt-o").forEach((b) => { if (b.dataset.b) return; b.dataset.b = 1; b.addEventListener("click", () => { if (b.disabled) return; const raw = b.dataset.c, ph = st.ph, m = st.mode; const c = m === "td" ? (ph === "t" ? +raw : raw) : (m === "likely" || m === "conf") ? raw : +raw; if (m === "td" && ph === "t" || ph === "v" || (m === "conf" && ph === "g")) myVote = c; send({ a: m === "td" ? "td" : "vote", c }); paint(); }); });
    const f = $("#ptForm"); if (f && !f.dataset.b) { f.dataset.b = 1; f.addEventListener("submit", (e) => { e.preventDefault(); const t = $("#ptIn").value.trim(); if (!t) return; send({ a: st.mode === "word" ? "guess" : "text", t }); if (st.mode === "word") { $("#ptIn").value = ""; } else mySub = t; }); setTimeout(() => $("#ptIn")?.focus({ preventScroll: true }), 60); }
  }
  function render(s) {
    if (!s || !s.ph) return;
    const fresh = !st || st.i !== s.i || st.ph !== s.ph || st.k !== s.k || st.mode !== s.mode;
    if (s.ph !== "end" && s.ph !== "r" && fresh) timerBar($("#ptTl"), s.tl); else if (s.ph === "r" || s.ph === "end") timerBar($("#ptTl"), 0);
    if (s.mode === "conf" && s.ph === "w") s.confPrompt = s.prompt; else if (s.mode === "conf" && st?.confPrompt) s.confPrompt = st.confPrompt;
    if (fresh && s.ph === "r" && ready()) tone(PENTA[4], 0.35, 0.05);
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() { api.room.off("msg", onMsg); } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "mode", label: "Games", def: "mixed", choices: [["mixed", "A mix of everything"], ...Object.entries(MODES).map(([k, v]) => [k, v.label])] },
  { id: "rounds", label: "Rounds", def: 12, choices: [[4, "4 (quick)"], [8, "8"], [12, "12"], [16, "16"], [24, "24"]] },
  { id: "pace", label: "Pace", def: 1, choices: [[1.5, "Relaxed"], [1, "Normal"], [0.7, "Quick"]] }
];
mp({ id: "adda", title: "Adda night", min: 3, max: 10, only: true, options: OPTIONS, host: (ctx) => makeHost(ctx), view: (root, api) => mountView(root, api) });
game("adda",
  `<div class="pq-solo"><div class="pq-setup"><p class="pq-lede">Adda night is a party game for 3 to 10 friends, each on their own phone. Fool everyone with a fake fact, vote on who is most likely to, share confessions, take on truths and dares, and describe words without saying them. Prompts are cheeky and desi, and always PG-13: no one is ever made to do anything unsafe.</p><div class="row"><button class="btn btn-primary" id="adGo" type="button"><span class="btn-t">Make a room</span></button></div></div></div>`,
  () => { q$("#adGo").addEventListener("click", () => document.querySelector('.gm-modes button[data-m="together"]')?.click()); return {}; });
