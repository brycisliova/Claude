import { mp, h, esc, shuffle, rnd, results, timerBar, byId, dot } from "./common.js";
import { DATA, FLAGS, flagCss } from "../mind.js";
import { tone, PENTA, ready } from "../../audio.js";

const Q_MS = 15000, REVEAL_MS = 5200;
function buildQuestions(topic, total) {
  const mf = [...DATA.myths.map((m) => ({ k: "mf", q: m.q, a: "myth", e: m.e })), ...DATA.facts.map((f) => ({ k: "mf", q: f.q, a: "fact", e: f.e }))];
  const fl = FLAGS.map((F, i) => ({ k: "fl", f: i, e: F.f, a: i }));
  const flagQ = () => { const q = fl[rnd(fl.length)]; const opts = shuffle([q.f, ...shuffle([...FLAGS.keys()].filter((i) => i !== q.f)).slice(0, 3)]); return { ...q, o: opts }; };
  const out = [];
  if (topic === "myth") out.push(...shuffle(mf.slice()).slice(0, total));
  else if (topic === "flags") { const used = new Set(); while (out.length < total && used.size < FLAGS.length) { const q = flagQ(); if (!used.has(q.f)) { used.add(q.f); out.push(q); } } }
  else { const a = shuffle(mf.slice()), used = new Set(); while (out.length < total) { if (out.length % 2 === 0 && a.length) out.push(a.pop()); else { const q = flagQ(); if (!used.has(q.f)) { used.add(q.f); out.push(q); } else if (a.length) out.push(a.pop()); else break; } } }
  return out.slice(0, total);
}
const pub = (q) => (q.k === "mf" ? { k: "mf", q: q.q } : { k: "fl", f: q.f, o: q.o });

const def = (id, title, topicDefault) => ({
  id, title, min: 2, max: 8,
  options: [
    { id: "topic", label: "Topic", def: topicDefault, choices: [["mix", "Myths, facts and flags"], ["myth", "Myth or fact"], ["flags", "Pride flags"]] },
    { id: "rounds", label: "Questions", def: 10, choices: [[5, "5"], [10, "10"], [15, "15"]] }
  ],
  host(ctx) {
    let S = null;
    const names = () => S.order;
    const view = (ph) => {
      const base = { ph, i: S.i, total: S.qs.length, scores: S.scores, order: S.order };
      if (ph === "q") return { ...base, q: pub(S.qs[S.i]), tl: Math.max(0, S.dl - Date.now()), answered: Object.keys(S.picks) };
      if (ph === "r") { const q = S.qs[S.i]; return { ...base, q: pub(q), a: q.a, e: q.e, picks: S.picks, gain: S.gain }; }
      return base;
    };
    function ask() { S.picks = {}; S.gain = {}; S.dl = Date.now() + Q_MS; S.ph = "q"; clearTimeout(S.tm); S.tm = ctx.after(Q_MS + 300, reveal); ctx.push(view("q")); }
    function reveal() {
      if (S.ph !== "q") return; S.ph = "r"; clearTimeout(S.tm); const q = S.qs[S.i];
      Object.entries(S.picks).forEach(([pid, c]) => { if (c.v === q.a) { const g = 100 + Math.round(50 * Math.max(0, 1 - c.t / Q_MS)); S.gain[pid] = g; S.scores[pid] += g; } else S.gain[pid] = 0; });
      ctx.push(view("r"));
      S.tm = ctx.after(REVEAL_MS, () => { if (S.i + 1 >= S.qs.length) { S.ph = "end"; ctx.push(view("end")); } else { S.i++; ask(); } });
    }
    return {
      start(o) { S = { qs: buildQuestions(o.topic || "mix", +o.rounds || 10), i: 0, scores: {}, picks: {}, gain: {}, order: ctx.players.map((p) => p.id), tm: null, dl: 0, ph: "q" }; S.order.forEach((id) => (S.scores[id] = 0)); ask(); },
      act(pid, a) {
        if (!S || S.ph !== "q" || a.a !== "ans" || S.picks[pid] || !S.order.includes(pid)) return;
        const q = S.qs[S.i], v = a.c; if (q.k === "mf" ? v !== "myth" && v !== "fact" : !q.o.includes(v)) return;
        S.picks[pid] = { v, t: Math.min(Q_MS, Date.now() - (S.dl - Q_MS)) };
        const live = S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left && !p.away; });
        if (live.every((id) => S.picks[id])) { clearTimeout(S.tm); S.tm = ctx.after(700, reveal); }
        ctx.push(view("q"));
      },
      destroy() { if (S) clearTimeout(S.tm); }
    };
  },
  view(root, api) {
    root.innerHTML = `<div class="mp mp-quiz"><div class="mp-head"><p class="mp-turn" id="qzInfo"></p><div class="mp-tl"><i id="qzTl"></i></div></div><div class="qz-card" id="qzCard"></div><div class="qz-opts" id="qzOpts"></div><p class="qz-fact" id="qzFact" aria-live="polite"></p><ul class="mp-score" id="qzScore"></ul><div id="qzEnd"></div></div>`;
    const $ = (s) => root.querySelector(s); let lastKey = "", mine = null, st = null;
    function answer(v) { if (!st || st.ph !== "q" || mine !== null) return; mine = v; api.act({ a: "ans", c: v }); paint(); }
    function paint() {
      const s = st; if (!s) return;
      $("#qzInfo").innerHTML = s.ph === "end" ? "Final scores" : `Question <b>${s.i + 1}</b> of ${s.total}`;
      const key = s.ph + s.i; if (key !== lastKey && s.ph === "q") { mine = null; }
      if (s.ph !== "end") {
        const q = s.q, card = $("#qzCard"), opts = $("#qzOpts");
        if (q.k === "mf") { card.innerHTML = `<p class="qz-q">${esc(q.q)}</p>`; card.style.cssText = ""; }
        else { card.innerHTML = `<p class="qz-q">Which pride flag is this?</p><div class="qz-flag" style="${flagCss(FLAGS[q.f])}">${FLAGS[q.f].ring ? `<span class="fl-ring"></span>` : ""}</div>`; }
        const choices = q.k === "mf" ? [["myth", "Myth"], ["fact", "Fact"]] : q.o.map((i) => [i, FLAGS[i].n]);
        opts.className = "qz-opts " + (q.k === "mf" ? "two" : "four"); opts.innerHTML = "";
        choices.forEach(([v, label]) => {
          const b = h("button", { class: "qz-o" + (q.k === "mf" ? ` ${v}` : ""), type: "button" }, esc(label)); b.disabled = s.ph !== "q" || mine !== null;
          if (s.ph === "q" && mine === v) b.classList.add("picked");
          if (s.ph === "r") { if (v === s.a) b.classList.add("ok"); else if (s.picks[api.me?.id]?.v === v) b.classList.add("no"); b.disabled = true; }
          b.addEventListener("click", () => answer(v)); opts.appendChild(b);
        });
        $("#qzFact").innerHTML = s.ph === "r" ? `<strong>${s.gain[api.me?.id] ? "Right, +" + s.gain[api.me.id] + "." : s.picks[api.me?.id] ? "Not this time." : "Too slow."}</strong> ${esc(s.e)}` : s.ph === "q" && mine !== null ? "Locked in. Waiting for the others…" : "";
      } else { $("#qzCard").innerHTML = ""; $("#qzOpts").innerHTML = ""; $("#qzFact").textContent = ""; }
      $("#qzScore").innerHTML = s.order.map((id) => { const p = byId(api, id); if (!p) return ""; const done = s.ph === "q" ? s.answered?.includes(id) : s.picks?.[id]; return `<li class="${p.away ? "away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b>${s.ph === "r" ? `<em class="${s.gain[id] ? "up" : ""}">${s.gain[id] ? "+" + s.gain[id] : ""}</em>` : done ? `<em>${s.ph === "q" ? "ready" : ""}</em>` : ""}</li>`; }).join("");
      if (s.ph === "end") results($("#qzEnd"), api, s.order.map((id) => ({ id, score: s.scores[id] || 0 })), { unit: "pts" }); else $("#qzEnd").innerHTML = "";
      lastKey = key;
    }
    function render(s) {
      if (!s || !s.ph) return;
      if (s.ph === "q" && (!st || st.i !== s.i || st.ph !== "q")) { mine = s.answered?.includes(api.me?.id) ? mine ?? "x" : null; timerBar($("#qzTl"), s.tl); }
      if (s.ph === "r" && st?.ph !== "r" && ready()) { const ok = s.gain[api.me?.id] > 0; tone(ok ? PENTA[6] : PENTA[1], 0.5, 0.07); }
      if (s.ph !== "q") timerBar($("#qzTl"), 0);
      st = s; paint();
    }
    return { render, players() { paint(); } };
  }
});
export const quizDefs = [def("myth", "Myth or fact?", "myth"), def("flags", "Know the flags", "flags")];
quizDefs.forEach((d) => mp(d));
