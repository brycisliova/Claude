// Truth or Dare: the friends-on-a-sofa classic, with Indian-teen prompts. Each turn somebody sits in the hot seat and picks
// truth or dare; everyone else rates whether they really did it. Every few turns the whole group plays "Never have I ever"
// or "Spill the tea". Solo mode is a pass-the-phone game for one device; rooms let everyone use their own phone.
// Prompts come from a big bank and never repeat on this device until the bank runs out.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$, report } from "../shared.js";
import { pickFresh } from "../fresh.js";
import { TRUTHS, DARES, NEVER, TEA } from "../../data/tod.js";
import { tone, PENTA, ready } from "../../audio.js";

const BANK = { truth: TRUTHS, dare: DARES, never: NEVER, tea: TEA };
const HEAT = ["mild", "medium", "wild"], HEAT_LABEL = { mild: "Mild", medium: "Medium", wild: "Wild" }, BONUS = { mild: 0, medium: 1, wild: 2 };
const LEVEL = { chill: "mild", spicy: "medium", wild: "wild" };
const heatFor = (level, i, total) => (level === "mixed" ? null : level === "build" ? HEAT[Math.min(2, Math.floor((3 * i) / Math.max(1, total)))] : LEVEL[level] || null);
function draw(kind, level, i, total) {
  const want = heatFor(level, i, total), bank = BANK[kind];
  let pool = want ? bank.filter((x) => x[1] === want) : bank; if (pool.length < 4) pool = bank;
  const it = pickFresh("wwa-tod-" + kind + "-" + (want || "all"), pool, (x) => x[0], 1)[0];
  return { t: it[0], heat: it[1] };
}
const MS = { pick: 20000, truth: 60000, dare: 75000, rate: 9000, grp: 18000, show: 4200 };

/* ---------- the host ---------- */
function makeHost(ctx, solo) {
  let S = null;
  const live = () => S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left; });
  const active = () => live().filter((id) => { const p = ctx.players.find((x) => x.id === id); return !p.away; });
  const view = (extra) => ({ ph: S.ph, n: S.n, total: S.plan.length, order: S.order, scores: S.scores, who: S.who, kind: S.kind, card: S.card, tl: S.ms ? Math.max(0, S.dl - Date.now()) : 0, ms: S.ms, voted: Object.keys(S.sub), solo, res: S.res, grp: S.grp, ...extra });
  function arm(ph, ms, fn) { S.ph = ph; S.sub = {}; S.ms = solo && (ph === "pick" || ph === "card" || ph === "grp") ? 0 : ms; S.dl = Date.now() + S.ms; clearTimeout(S.tm); if (S.ms) S.tm = ctx.after(S.ms + 300, fn); }
  const add = (id, n) => { S.scores[id] = Math.max(0, (S.scores[id] || 0) + n); };
  const stat = (id, k, n = 1) => { (S.stat[id] ||= {})[k] = ((S.stat[id] || {})[k] || 0) + n; };
  function nextSeat() {
    for (let k = 0; k < S.order.length; k++) { const id = S.order[S.seat % S.order.length]; S.seat++; if (live().includes(id)) return id; }
    return S.order[0];
  }
  function advance() {
    clearTimeout(S.tm);
    if (S.n >= S.plan.length || live().length < (solo ? 2 : 2)) return finish();
    const type = S.plan[S.n]; S.n++; S.res = null; S.grp = null; S.card = null; S.kind = "";
    if (type === "seat") { S.who = nextSeat(); arm("pick", MS.pick, () => choose(S.who, "random")); }
    else {
      S.who = ""; S.kind = type; S.card = draw(type, S.opts.level, S.n, S.plan.length); S.grp = { type };
      arm("grp", MS.grp, reveal);
    }
    ctx.push(view());
  }
  function choose(pid, k) {
    if (S.ph !== "pick" || pid !== S.who) return;
    const kind = k === "random" ? (Math.random() < 0.5 ? "truth" : "dare") : k;
    if (kind !== "truth" && kind !== "dare") return;
    S.kind = kind; S.card = draw(kind, S.opts.level, S.n, S.plan.length);
    arm("card", MS[kind], () => settle(false, "Time's up"));
    ctx.push(view());
  }
  function settle(done, why) {
    if (S.ph !== "card" && S.ph !== "rate") return;
    clearTimeout(S.tm);
    let verdict = "skip", gain = 0;
    if (done) {
      const yes = Object.values(S.sub).filter((v) => v === 1).length, no = Object.values(S.sub).filter((v) => v === 0).length;
      if (solo || yes >= no) { verdict = "ok"; gain = 3 + BONUS[S.card.heat]; add(S.who, gain); stat(S.who, S.kind + "s"); }
      else { verdict = "nah"; stat(S.who, "nah"); }
      S.res = { verdict, gain, yes, no };
    } else { add(S.who, -1); stat(S.who, "skips"); gain = -1; S.res = { verdict: "skip", gain, why }; }
    S.sub = {}; arm("res", MS.show, advance);
    ctx.push(view());
  }
  function reveal() {
    if (S.ph !== "grp") return;
    clearTimeout(S.tm); const ids = live();
    if (S.kind === "never") {
      const have = ids.filter((id) => S.sub[id] === 1);
      have.forEach((id) => { add(id, 1); stat(id, "have"); });
      S.grp = { type: "never", have, n: ids.length };
    } else {
      const counts = {}; Object.values(S.sub).forEach((id) => { if (ids.includes(id)) counts[id] = (counts[id] || 0) + 1; });
      const top = Math.max(0, ...Object.values(counts)), hot = top ? Object.keys(counts).filter((id) => counts[id] === top) : [];
      hot.forEach((id) => { add(id, 2); stat(id, "tea", 1); });
      S.grp = { type: "tea", counts, hot };
    }
    arm("grpr", MS.show + 1500, advance);
    ctx.push(view());
  }
  function finish() {
    clearTimeout(S.tm); S.ph = "end"; S.ms = 0;
    const top = (k) => { let best = 0, who = []; S.order.forEach((id) => { const v = (S.stat[id] || {})[k] || 0; if (v > best) { best = v; who = [id]; } else if (v === best && v > 0) who.push(id); }); return best ? { who, n: best } : null; };
    const awards = [["Most daring", top("dares"), "dares done"], ["Open book", top("truths"), "truths told"], ["Tea magnet", top("tea"), "times the group named them"], ["Chicken of the night", top("skips"), "skips"]].filter((a) => a[1] && a[1].who.length < S.order.length);
    ctx.push(view({ awards }));
  }
  return {
    start(o) {
      const order = ctx.players.map((p) => p.id), per = +o.turns || 3, groups = o.groups !== "off";
      const plan = []; let seats = 0;
      for (let i = 0; i < per * order.length; i++) { plan.push("seat"); seats++; if (groups && seats % 3 === 0 && i < per * order.length - 1) plan.push(Math.floor(seats / 3) % 2 ? "never" : "tea"); }
      S = { opts: { level: o.level || "build" }, order, plan, n: 0, seat: Math.floor(Math.random() * order.length), scores: {}, stat: {}, sub: {}, ph: "", tm: null, dl: 0, ms: 0, who: "", kind: "", card: null, res: null, grp: null };
      order.forEach((id) => (S.scores[id] = 0));
      advance();
    },
    act(pid, a) {
      if (!S) return;
      if (solo) pid = S.ph === "pick" || S.ph === "card" ? S.who : pid;
      if (a.a === "pick") return choose(pid, a.k);
      if (a.a === "done" && S.ph === "card" && pid === S.who) {
        if (solo) { S.sub = {}; return settle(true); }
        clearTimeout(S.tm); S.ph = "rate"; S.sub = {}; S.ms = MS.rate; S.dl = Date.now() + S.ms; S.tm = ctx.after(S.ms + 300, () => settle(true));
        return ctx.push(view());
      }
      if (a.a === "skip" && S.ph === "card" && pid === S.who) return settle(false, "Skipped");
      if (a.a === "rate" && S.ph === "rate" && pid !== S.who && live().includes(pid) && !(pid in S.sub)) {
        S.sub[pid] = a.v ? 1 : 0;
        const others = active().filter((id) => id !== S.who);
        if (others.every((id) => id in S.sub)) { clearTimeout(S.tm); S.tm = ctx.after(500, () => settle(true)); }
        return ctx.push(view());
      }
      if (S.ph !== "grp") return;
      if (solo && a.a === "next") return advance();
      if (!solo && !live().includes(pid)) return;
      if (a.a === "never" && S.kind === "never" && !(pid in S.sub)) S.sub[pid] = a.v ? 1 : 0;
      else if (a.a === "vote" && S.kind === "tea" && !(pid in S.sub) && live().includes(a.c)) { S.sub[pid] = a.c; if (solo) return reveal(); }
      else return;
      if (active().every((id) => id in S.sub)) { clearTimeout(S.tm); S.tm = ctx.after(500, reveal); }
      ctx.push(view());
    },
    destroy() { if (S) clearTimeout(S.tm); }
  };
}

/* ---------- the view ---------- */
const KIND = { truth: ["Truth", "td-truth"], dare: ["Dare", "td-dare"], never: ["Never have I ever", "td-never"], tea: ["Spill the tea", "td-tea"] };
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp td"><div class="mp-head"><p class="mp-turn" id="tdInfo" aria-live="polite"></p><div class="mp-tl"><i id="tdTl"></i></div></div>
  <div class="td-seat" id="tdSeat"></div><div class="td-card" id="tdCard" aria-live="polite"></div><div class="td-acts" id="tdActs"></div><p class="td-note" id="tdNote" role="status"></p>
  <ul class="mp-score" id="tdScore"></ul><details class="at-how"><summary>How to play</summary><ul><li>Each turn one player sits in the hot seat and picks <b>truth</b> or <b>dare</b>, or lets fate decide.</li><li>Do it (or answer honestly) and tap <b>Done</b>. ${solo ? "The rest of the group decides if it counts." : "The others vote whether it was legit."} Skipping or running out of time costs a point.</li><li>Wilder prompts score more. Every few turns the whole group plays <b>Never have I ever</b> or <b>Spill the tea</b>.</li><li>Nothing here needs you to touch anyone, drink anything or share anything private. Pass on anything that is not okay for you.</li></ul></details><div id="tdEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, lastKey = "", mine = null;
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || "Player";
  const act = (a) => api.act(a);
  const btn = (cls, label, fn, dis) => { const b = h("button", { class: "btn " + cls, type: "button" }, `<span class="btn-t">${esc(label)}</span>`); b.disabled = !!dis; b.addEventListener("click", fn); return b; };
  function paint() {
    const s = st; if (!s) return;
    const acts = $("#tdActs"), card = $("#tdCard"), seat = $("#tdSeat"), note = $("#tdNote"); acts.innerHTML = ""; note.textContent = "";
    const key = s.ph + ":" + s.n; if (key !== lastKey) { mine = null; lastKey = key; }
    const iAm = solo ? true : s.who === me(), who = s.who;
    $("#tdInfo").innerHTML = s.ph === "end" ? "Final scores" : `Turn <b>${Math.min(s.n, s.total)}</b> of ${s.total}`;
    const k = s.kind && KIND[s.kind];
    if (s.ph === "end") { seat.innerHTML = ""; card.className = "td-card"; card.innerHTML = ""; }
    else if (who) { const p = byId(api, who) || { color: 0, name: "?" }; seat.innerHTML = `<span class="td-seatlab">In the hot seat</span><span class="td-seatname">${dot(p)}${esc(p.name)}${!solo && who === me() ? ` <em>you</em>` : ""}</span>`; }
    else seat.innerHTML = `<span class="td-seatlab">Everybody plays</span><span class="td-seatname">Whole group</span>`;
    if (s.ph === "pick") {
      card.className = "td-card td-pick"; card.innerHTML = `<p class="td-big">Truth or dare?</p><p class="td-sub">${iAm ? (solo ? `${esc(name(who))}, your call.` : "Your call.") : `${esc(name(who))} is choosing…`}</p>`;
      if (iAm) { acts.append(btn("td-b td-b-truth", "Truth", () => act({ a: "pick", k: "truth" })), btn("td-b td-b-dare", "Dare", () => act({ a: "pick", k: "dare" })), btn("btn-ghost", "Surprise me", () => act({ a: "pick", k: "random" }))); }
    } else if (s.ph === "card" || s.ph === "rate" || s.ph === "res") {
      card.className = "td-card " + k[1] + " heat-" + s.card.heat; card.innerHTML = `<p class="td-kind">${k[0]}<span class="td-heat" title="${HEAT_LABEL[s.card.heat]}">${HEAT.map((x, i) => `<i class="${i <= HEAT.indexOf(s.card.heat) ? "on" : ""}"></i>`).join("")}<b>${HEAT_LABEL[s.card.heat]}</b></span></p><p class="td-text">${esc(s.card.t)}</p>`;
      if (s.ph === "card") {
        if (iAm) acts.append(btn("btn-primary", "Done", () => act({ a: "done" })), btn("btn-ghost", "Skip (-1)", () => act({ a: "skip" })));
        else note.textContent = `Waiting for ${name(who)}…`;
        if (iAm && solo) note.textContent = "When it is done, tap Done. The group decides if it counts.";
      } else if (s.ph === "rate") {
        if (!iAm && who !== me()) { if (mine === null) acts.append(btn("btn-primary", "Legit", () => { mine = 1; act({ a: "rate", v: 1 }); paint(); }), btn("btn-ghost", "Nah", () => { mine = 0; act({ a: "rate", v: 0 }); paint(); })); else note.textContent = "Vote locked in."; }
        else note.textContent = "The others are voting on it…";
      } else {
        const r = s.res || {};
        note.innerHTML = r.verdict === "ok" ? `<strong>Counts. +${r.gain}</strong>${r.yes != null && !solo ? ` ${r.yes} legit, ${r.no} nah.` : ""}` : r.verdict === "nah" ? `<strong>Not convinced.</strong> ${r.yes} legit, ${r.no} nah. No points.` : `<strong>${esc(r.why || "Skipped")}. -1</strong>`;
      }
    } else if (s.ph === "grp" || s.ph === "grpr") {
      card.className = "td-card " + k[1]; const reveal = s.ph === "grpr";
      card.innerHTML = `<p class="td-kind">${k[0]}<span class="td-heat" title="${HEAT_LABEL[s.card.heat]}">${HEAT.map((x, i) => `<i class="${i <= HEAT.indexOf(s.card.heat) ? "on" : ""}"></i>`).join("")}<b>${HEAT_LABEL[s.card.heat]}</b></span></p><p class="td-text">${s.kind === "never" ? "Never have I ever " : ""}${esc(s.card.t.replace(/^never have i ever\s*/i, ""))}</p>`;
      if (!reveal) {
        if (s.kind === "never") {
          if (solo) acts.append(btn("btn-primary", "Fingers counted, next", () => act({ a: "next" })));
          else if (s.voted.includes(me())) note.textContent = "Locked in. Waiting for the others…";
          else acts.append(btn("td-b td-b-dare", "I have", () => act({ a: "never", v: 1 })), btn("td-b td-b-truth", "Never", () => act({ a: "never", v: 0 })));
          if (solo) note.textContent = "Everybody puts a finger down if they have. Honesty is the whole game.";
        } else {
          if (s.voted.includes(me()) && !solo) note.textContent = "Vote in. Waiting for the others…";
          else { note.textContent = solo ? "Talk it over, then tap who it is." : "Who is it? Pick one."; s.order.forEach((id) => { const p = byId(api, id); if (p && !p.left) acts.append(btn("btn-ghost td-who", p.name, () => act({ a: "vote", c: id }))); }); }
        }
      } else if (s.grp.type === "never") note.innerHTML = s.grp.have.length ? `<strong>${s.grp.have.length} of ${s.grp.n} have:</strong> ${s.grp.have.map((id) => esc(name(id))).join(", ")} (+1 each)` : `<strong>Nobody has.</strong> Suspiciously innocent.`;
      else note.innerHTML = s.grp.hot.length ? `<strong>${s.grp.hot.map((id) => esc(name(id))).join(" and ")}</strong> got the most votes${solo ? "" : " (" + s.grp.counts[s.grp.hot[0]] + ")"}. Time to answer! (+2)` : `<strong>No votes.</strong> Everyone is innocent for now.`;
    } else { card.className = "td-card"; card.innerHTML = ""; }
    $("#tdScore").innerHTML = s.order.map((id) => { const p = byId(api, id); if (!p) return ""; return `<li class="${(s.who === id && s.ph !== "end") ? "on" : ""}${p.away ? " away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b></li>`; }).join("");
    const end = $("#tdEnd");
    if (s.ph === "end") {
      results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0 })), { unit: "pts" });
      if (s.awards?.length) end.querySelector(".mp-end").insertAdjacentHTML("beforeend", `<ul class="td-awards">${s.awards.map(([t, a, u]) => `<li><b>${t}</b> ${a.who.map((id) => esc(name(id))).join(" and ")} <span>${a.n} ${u}</span></li>`).join("")}</ul>`);
    } else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    if (!st || st.ph !== s.ph || st.n !== s.n) { timerBar($("#tdTl"), s.tl); if (ready() && s.ph !== "end") tone(PENTA[(s.n + 2) % 7], 0.25, 0.05); }
    if (s.ph === "res" || s.ph === "grpr") { if (st?.ph !== s.ph && ready()) tone(s.res?.verdict === "ok" || s.ph === "grpr" ? PENTA[6] : PENTA[1], 0.4, 0.06); timerBar($("#tdTl"), 0); }
    if (s.ph === "end") { timerBar($("#tdTl"), 0); if (solo && st?.ph !== "end") report(Math.max(0, ...Object.values(s.scores))); }
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() {} };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "level", label: "Spice level", def: "build", choices: [["build", "Build-up (mild to wild)"], ["chill", "Chill"], ["spicy", "Spicy"], ["wild", "Wild"], ["mixed", "Everything"]] },
  { id: "turns", label: "Turns each", def: 3, choices: [[2, "2"], [3, "3"], [5, "5"]] },
  { id: "groups", label: "Group rounds", def: "on", choices: [["on", "Never have I ever + Spill the tea"], ["off", "Off"]] }
];
mp({ id: "tod", title: "Truth or Dare", min: 2, max: 10, options: OPTIONS, host: (ctx) => makeHost(ctx, false), view: (root, api) => mountView(root, api, false) });

game("tod",
  `<div class="pq-solo"><div class="pq-setup" id="tdSetup"><p class="pq-lede">One phone, passed around the circle. Add everyone's names, pick the spice level and let the dares begin. Want everyone on their own phone instead? Use Play together.</p><div class="td-names" id="tdNames"></div><div class="row"><button class="btn btn-ghost btn-sm" id="tdAdd" type="button"><span class="btn-t">Add a player</span></button></div><div class="tg-opts">${OPTIONS.map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><p class="td-note" id="tdErr" role="alert"></p><div class="row"><button class="btn btn-primary" id="tdGo" type="button"><span class="btn-t">Start</span></button></div></div><div id="tdStage" hidden></div></div>`,
  () => {
    const setup = q$("#tdSetup"), stage = q$("#tdStage"), box = q$("#tdNames");
    let host = null, view = null, timers = [], players = [];
    const SAVED = "wwa-tod-names", load = () => { try { const v = JSON.parse(localStorage.getItem(SAVED)); return Array.isArray(v) ? v.slice(0, 10) : []; } catch (e) { return []; } };
    const addRow = (v = "") => { if (box.children.length >= 10) return; const r = h("div", { class: "td-nrow" }, `<label class="sr-only">Player name</label><input class="text-in" maxlength="14" placeholder="Name" autocomplete="off" value="${esc(v)}"><button class="btn btn-ghost btn-sm" type="button" aria-label="Remove player"><span class="btn-t">Remove</span></button>`); r.querySelector("button").addEventListener("click", () => { if (box.children.length > 2) r.remove(); }); box.appendChild(r); };
    const saved = load(); (saved.length >= 2 ? saved : ["", "", ""]).forEach(addRow);
    q$("#tdAdd").addEventListener("click", () => { addRow(); box.lastChild.querySelector("input").focus(); });
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { get players() { return players; }, after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => view?.render(s), reply: () => {} };
    const api = { me: null, get players() { return players; }, isHost: true, solo: true, opts: {}, act: (a) => host?.act("table", a), onMsg: () => {}, rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; }
    function go() {
      const names = [...box.querySelectorAll("input")].map((i) => i.value.trim().replace(/[<>]/g, "")).filter(Boolean);
      const err = q$("#tdErr");
      if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) { err.textContent = "Every player needs a different name."; return; }
      if (names.length < 2) { err.textContent = "Add at least two names."; return; }
      err.textContent = ""; try { localStorage.setItem(SAVED, JSON.stringify(names)); } catch (e) { /* private mode */ }
      host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy();
      players = names.map((n, i) => ({ id: "p" + i, name: n, color: i, host: i === 0, away: false })); api.me = { id: "none" }; const o = get(); api.opts = o;
      setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx, true); host.start(o);
    }
    q$("#tdGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
