import { mp, h, esc, results, byId, dot } from "./common.js";
import { scoreGuess, KEYROWS, SQUARE } from "../words.js";
import { tone, PENTA, ready } from "../../audio.js";

const MAX_MS = 5 * 60 * 1000;
let WL = null; const words = async () => (WL ||= await import("../../data/words.js"));

mp({
  id: "wordle", title: "Word guess", min: 2, max: 6,
  options: [{ id: "set", label: "Words", def: "answers", choices: [["answers", "Everyday words"], ["kind", "Kind words"]] }],
  host(ctx) {
    let S = null, W = null;
    const live = () => S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left && !p.away; });
    const view = () => ({ ph: S.over ? "end" : "play", order: S.order, rows: Object.fromEntries(S.order.map((id) => [id, S.rows[id].map((r) => r.s)])), done: S.done, won: S.won, ms: S.ms, secret: S.over ? S.secret : undefined, left: Math.max(0, S.t0 + MAX_MS - Date.now()) });
    function check() { if (!S.over && live().every((id) => S.done[id])) end(); }
    function end() { S.over = true; clearTimeout(S.tm); ctx.push(view()); }
    return {
      async start(o) {
        W = await words(); const list = o.set === "kind" ? W.KIND : W.ANSWERS;
        S = { secret: list[Math.floor(Math.random() * list.length)], order: ctx.players.map((p) => p.id), rows: {}, done: {}, won: {}, ms: {}, over: false, t0: Date.now(), tm: null };
        S.order.forEach((id) => { S.rows[id] = []; S.done[id] = false; S.won[id] = false; });
        S.tm = ctx.after(MAX_MS, end); ctx.push(view());
      },
      act(pid, a) {
        if (!S || S.over || a.a !== "guess" || S.done[pid] || !S.rows[pid]) return;
        const w = String(a.w || "").toLowerCase(); if (!/^[a-z]{5}$/.test(w)) return;
        if (!W.VALID.has(w)) return ctx.reply(pid, { err: "That isn't in the word list.", w });
        const s = scoreGuess(w, S.secret); S.rows[pid].push({ w, s });
        if (s.every((x) => x === 2)) { S.done[pid] = true; S.won[pid] = true; S.ms[pid] = Date.now() - S.t0; } else if (S.rows[pid].length >= 6) S.done[pid] = true;
        ctx.push(view()); check();
      },
      left() { if (S) check(); },
      destroy() { if (S) clearTimeout(S.tm); }
    };
  },
  view(root, api) {
    root.innerHTML = `<div class="mp mp-duel"><div class="mp-head"><p class="mp-turn" id="duInfo" aria-live="polite">Everyone is guessing the same word. Be quickest.</p></div><div class="du-main"><div class="wd"><div class="wd-grid" id="duGrid" role="group" aria-label="Your guesses"></div><div class="wd-kb" id="duKb"></div></div><ul class="du-others" id="duOthers"></ul></div><div id="duEnd"></div></div>`;
    const $ = (s) => root.querySelector(s); let mine = [], cur = "", last = null, sent = false, busy = false;
    const tiles = []; for (let i = 0; i < 30; i++) { const t = h("div", { class: "wd-t" }); $("#duGrid").appendChild(t); tiles.push(t); }
    const keys = {};
    KEYROWS.forEach((row) => { const d = h("div", { class: "wd-kr" }); [...row].forEach((k) => { const b = h("button", { class: "wd-k" + (k === "+" || k === "-" ? " wide" : ""), type: "button", "aria-label": k === "+" ? "Enter" : k === "-" ? "Delete" : k }, k === "+" ? "Enter" : k === "-" ? "⌫" : k); b.addEventListener("click", () => { press(k); b.blur(); }); keys[k] = b; d.appendChild(b); }); $("#duKb").appendChild(d); });
    function my() { return last?.rows?.[api.me?.id] || []; }
    function draw() {
      const rows = my(), over = last?.ph === "end", done = last?.done?.[api.me?.id];
      tiles.forEach((t, i) => { const r = Math.floor(i / 5), c = i % 5; let ch = "", st = ""; if (r < rows.length) { ch = mine[r]?.[c] || ""; st = ["a", "p", "c"][rows[r][c]]; } else if (r === rows.length && !done && !over) ch = cur[c] || ""; t.textContent = ch; t.className = "wd-t" + (st ? " " + st : "") + (ch && !st ? " on" : ""); });
      const best = {}; rows.forEach((s, r) => [...(mine[r] || "")].forEach((ch, i) => { best[ch] = Math.max(best[ch] ?? -1, s[i]); }));
      Object.entries(keys).forEach(([k, b]) => { const v = best[k]; b.className = "wd-k" + (k === "+" || k === "-" ? " wide" : "") + (v === 2 ? " c" : v === 1 ? " p" : v === 0 ? " a" : ""); });
    }
    function press(k) {
      if (!last || last.ph !== "play" || last.done[api.me?.id] || busy) return;
      if (k === "+") { if (cur.length < 5) return info("Five letters, please."); busy = true; sent = cur; api.act({ a: "guess", w: cur }); setTimeout(() => (busy = false), 400); return; }
      if (k === "-") { cur = cur.slice(0, -1); return draw(); }
      if (cur.length < 5) { cur += k; draw(); }
    }
    const info = (t) => { $("#duInfo").textContent = t; };
    const onKey = (e) => {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toLowerCase()); else if (e.key === "Enter" && e.target.tagName !== "BUTTON") press("+"); else if (e.key === "Backspace") press("-");
    };
    document.addEventListener("keydown", onKey);
    function others(s) {
      $("#duOthers").innerHTML = s.order.filter((id) => id !== api.me?.id).map((id) => {
        const p = byId(api, id); if (!p) return ""; const rows = s.rows[id] || [];
        return `<li class="${p.away ? "away" : ""}"><div class="du-who">${dot(p, "sm")}<span>${esc(p.name)}</span>${s.won[id] ? `<em>solved</em>` : s.done[id] ? `<em>done</em>` : ""}</div><div class="du-mini">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<i class="${rows[r] ? ["a", "p", "c"][rows[r][c]] : ""}"></i>`).join("")).join("")}</div></li>`;
      }).join("");
    }
    function render(s) {
      if (!s || !s.ph) return;
      const had = my().length; last = s; const now = my().length;
      if (now > had && sent) { mine[now - 1] = sent; cur = ""; sent = false; busy = false; if (ready()) tone(PENTA[now % 5] * 2, 0.2, 0.04); }
      while (mine.length > now) mine.pop();
      draw(); others(s);
      const me = api.me?.id;
      if (s.ph === "play") info(s.won[me] ? `You solved it in ${now}. Waiting for the others…` : s.done[me] ? "Out of guesses. Waiting for the others…" : "Everyone is guessing the same word. Be quickest.");
      const end = $("#duEnd");
      if (s.ph === "end") {
        const rank = s.order.map((id) => ({ id, score: s.won[id] ? (7 - s.rows[id].length) * 1e6 - Math.min(999999, Math.floor((s.ms[id] || 0) / 10)) : -s.order.indexOf(id), note: s.won[id] ? `${s.rows[id].length} guess${s.rows[id].length > 1 ? "es" : ""}` : "no luck" }));
        results(end, api, rank, { title: "The word was " + (s.secret || "").toUpperCase(), hide: true });
      } else end.innerHTML = "";
    }
    $("#duInfo").addEventListener("click", () => {});
    return {
      render, players() { last && others(last); },
      msg(d) { if (d?.err) { info(d.err); busy = false; sent = false; const r = Math.min(5, my().length); tiles.slice(r * 5, r * 5 + 5).forEach((t) => { t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake"); }); } },
      destroy() { document.removeEventListener("keydown", onKey); }
    };
  }
});
