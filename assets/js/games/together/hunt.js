import { mp, h, esc, results, byId, colour, dot } from "./common.js";
import { makeSearch, lineCells, isStraight } from "../grid.js";
import { tone, PENTA, ready } from "../../audio.js";

const N = 10;
const POOL = ["LOVE", "PRIDE", "HOPE", "CARE", "SAFE", "PROUD", "BRAVE", "KIND", "TRUST", "HOME", "UNITY", "JOY", "ALLY", "FREE", "EQUAL", "RESPECT", "BELONG", "HEAL", "CALM", "SHINE", "FAMILY", "COURAGE"];

mp({
  id: "words", title: "Word garden", min: 2, max: 6,
  options: [{ id: "count", label: "Words to find", def: 8, choices: [[6, "6"], [8, "8"], [10, "10"]] }],
  host(ctx) {
    let S = null;
    const view = () => ({ grid: S.grid, words: S.words, found: S.found, scores: S.scores, order: S.order, over: S.over });
    return {
      start(o) { const { words, grid } = makeSearch(N, POOL, +o.count || 8); S = { words, grid, found: {}, scores: {}, order: ctx.players.map((p) => p.id), over: false }; S.order.forEach((id) => (S.scores[id] = 0)); ctx.push(view()); },
      act(pid, a) {
        if (!S || S.over || a.a !== "claim" || !Array.isArray(a.cells) || a.cells.length < 2 || a.cells.length > 12) return;
        const cells = a.cells; if (!cells.every((i) => Number.isInteger(i) && i >= 0 && i < N * N) || new Set(cells).size !== cells.length || !isStraight(cells, N)) return;
        const s = cells.map((i) => S.grid[i]).join(""), r = [...s].reverse().join(""), w = S.words.find((x) => !S.found[x] && (x === s || x === r));
        if (!w) return ctx.reply(pid, { miss: true });
        S.found[w] = { by: pid, cells }; S.scores[pid] = (S.scores[pid] || 0) + w.length;
        if (S.words.every((x) => S.found[x])) S.over = true; ctx.push(view());
      }
    };
  },
  view(root, api) {
    root.innerHTML = `<div class="mp mp-hunt"><div class="mp-head"><p class="mp-turn" id="huInfo" aria-live="polite">Race to find the words. Drag across the letters.</p></div><div class="hu-main"><div class="ws-board hu-board" id="huBoard" aria-label="Word search grid"></div><div><ul class="ws-list hu-list" id="huList"></ul><ul class="mp-score" id="huScore"></ul></div></div><div id="huEnd"></div></div>`;
    const $ = (s) => root.querySelector(s), board = $("#huBoard"); let last = null, a = -1, b = -1, built = false, nFound = 0;
    function build(g) { board.style.gridTemplateColumns = `repeat(${N},1fr)`; board.innerHTML = ""; g.forEach((ch, i) => board.appendChild(h("div", { class: "ws-c", "data-i": i }, ch))); built = true; }
    const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList.contains("ws-c") && board.contains(el) ? +el.dataset.i : -1; };
    function paintSel(sel = []) { [...board.children].forEach((c, i) => c.classList.toggle("s", sel.includes(i))); }
    board.addEventListener("pointerdown", (e) => { if (!last || last.over) return; const i = cellAt(e); if (i < 0) return; a = b = i; board.setPointerCapture(e.pointerId); paintSel(lineCells(a, b, N)); });
    board.addEventListener("pointermove", (e) => { if (a < 0) return; const i = cellAt(e); if (i < 0 || i === b) return; b = i; paintSel(lineCells(a, b, N)); });
    board.addEventListener("pointerup", () => { if (a < 0) return; const L = lineCells(a, b, N); a = b = -1; paintSel(); if (L.length > 1) api.act({ a: "claim", cells: L }); });
    board.addEventListener("pointercancel", () => { a = b = -1; paintSel(); });
    function render(s) {
      if (!s || !s.grid) return; last = s; if (!built) build(s.grid);
      const owner = {}; Object.values(s.found).forEach((f) => f.cells.forEach((i) => (owner[i] = f.by)));
      [...board.children].forEach((c, i) => { const by = owner[i]; c.classList.toggle("f", !!by); if (by) c.style.background = colour(byId(api, by)); else c.style.removeProperty("background"); });
      $("#huList").innerHTML = s.words.map((w) => { const f = s.found[w]; return `<li class="${f ? "done" : ""}">${f ? dot(byId(api, f.by) || { color: 0, name: "?" }, "xs") : ""}${esc(w)}</li>`; }).join("");
      $("#huScore").innerHTML = s.order.map((id) => { const p = byId(api, id); return p ? `<li class="${p.away ? "away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b></li>` : ""; }).join("");
      const n = Object.keys(s.found).length; if (n > nFound && ready()) tone(PENTA[n % PENTA.length] * 2, 0.5, 0.07); nFound = n;
      $("#huInfo").textContent = s.over ? "All words found" : `${n} of ${s.words.length} found. Be the first to each one.`;
      const end = $("#huEnd"); if (s.over) results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0 })), { unit: "pts" }); else end.innerHTML = "";
    }
    return { render, players() { last && render(last); }, msg() { const i = $("#huInfo"); i.textContent = "Not one of the words, or someone got there first."; } };
  }
});
