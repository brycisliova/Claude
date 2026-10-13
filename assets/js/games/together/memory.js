import { mp, h, esc, shuffle, results, timerBar, colour, byId, dot } from "./common.js";
import { SCENES } from "../scenes.js";
import { tone, PENTA, ready } from "../../audio.js";

// As more people join, the board grows: 10 pairs for two players, 14 for three, 18 for four.
export const pairsFor = (n) => Math.min(SCENES.length, 6 + 4 * (n - 1));
const TURN_MS = 30000;

mp({
  id: "memory", title: "Gentle memory", min: 2, max: 4, options: [],
  host(ctx) {
    let S = null;
    const here = () => S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left && !p.away; });
    const view = () => ({ cards: S.cards.map((c, i) => (S.up.has(i) || S.owner[i] >= 0 ? c : -1)), owner: S.owner.map((o) => (o >= 0 ? S.order[o] : "")), order: S.order, turn: S.order[S.turn], scores: S.scores, lock: S.lock, over: S.over, tl: S.over ? 0 : Math.max(0, S.dl - Date.now()), pairs: S.pairs });
    function arm() { clearTimeout(S.tm); S.dl = Date.now() + TURN_MS; S.tm = ctx.after(TURN_MS + 400, () => { if (!S.over && !S.lock) { S.up.clear(); next(); ctx.push(view()); } }); }
    function next() { const ok = here(); for (let k = 1; k <= S.order.length; k++) { const j = (S.turn + k) % S.order.length; if (ok.includes(S.order[j])) { S.turn = j; break; } } arm(); }
    return {
      start() {
        const pairs = pairsFor(ctx.players.length), ids = shuffle([...SCENES.keys()]).slice(0, pairs), cards = shuffle([...ids, ...ids]);
        S = { order: ctx.players.map((p) => p.id), cards, owner: cards.map(() => -1), up: new Set(), turn: 0, scores: {}, lock: false, over: false, pairs, tm: null, dl: 0 };
        S.order.forEach((id) => (S.scores[id] = 0)); arm(); ctx.push(view());
      },
      act(pid, a) {
        if (!S || S.over || S.lock || a.a !== "flip" || S.order[S.turn] !== pid) return;
        const i = a.i; if (!Number.isInteger(i) || i < 0 || i >= S.cards.length || S.owner[i] >= 0 || S.up.has(i)) return;
        S.up.add(i);
        if (S.up.size < 2) return ctx.push(view());
        S.lock = true; clearTimeout(S.tm); ctx.push(view());
        ctx.after(1100, () => {
          const [x, y] = [...S.up];
          if (S.cards[x] === S.cards[y]) { S.owner[x] = S.owner[y] = S.turn; S.scores[pid]++; S.up.clear(); S.lock = false; if (S.owner.every((o) => o >= 0)) { S.over = true; clearTimeout(S.tm); } else arm(); }
          else { S.up.clear(); S.lock = false; next(); }
          ctx.push(view());
        });
      },
      left(pid) { if (S && !S.over && !S.lock && S.order[S.turn] === pid) { S.up.clear(); next(); ctx.push(view()); } },
      destroy() { if (S) clearTimeout(S.tm); }
    };
  },
  view(root, api) {
    root.innerHTML = `<div class="mp mp-mem"><div class="mp-head"><p class="mp-turn" id="mmTurn" aria-live="polite"></p><div class="mp-tl"><i id="mmTl"></i></div></div><ul class="mp-score" id="mmScore"></ul><div class="memory mp-board" id="mmBoard"></div><div id="mmEnd"></div></div>`;
    const board = root.querySelector("#mmBoard"), turnEl = root.querySelector("#mmTurn"), sc = root.querySelector("#mmScore"), end = root.querySelector("#mmEnd");
    let built = 0, last = null, lastSum = -1;
    function build(n) {
      board.innerHTML = ""; const cols = n === 20 ? 5 : n === 28 ? 7 : n === 36 ? 6 : Math.ceil(Math.sqrt(n * 1.4));
      board.style.gridTemplateColumns = `repeat(${cols},1fr)`; board.style.width = `min(100%,calc(var(--gh) * ${((cols / Math.ceil(n / cols)) * 0.92).toFixed(2)}))`;
      for (let i = 0; i < n; i++) { const b = h("button", { class: "mcard", "aria-label": "Hidden card" }, `<span class="mc-art"></span>`); b.addEventListener("click", () => { if (last && !last.over && !last.lock && last.turn === api.me?.id) api.act({ a: "flip", i }); }); board.appendChild(b); }
      built = n;
    }
    function render(s) {
      if (!s || s.cards === undefined) return; last = s;
      if (built !== s.cards.length) build(s.cards.length);
      [...board.children].forEach((b, i) => {
        const c = s.cards[i], own = s.owner[i], art = b.firstChild;
        if (c >= 0) { if (b.dataset.k !== String(c)) { b.dataset.k = c; art.innerHTML = SCENES[c].svg; b.setAttribute("aria-label", SCENES[c].n); } b.classList.add("open"); }
        else { b.classList.remove("open", "done"); delete b.dataset.k; art.innerHTML = ""; b.setAttribute("aria-label", "Hidden card"); b.style.removeProperty("--oc"); }
        if (own) { b.classList.add("done"); b.style.setProperty("--oc", colour(byId(api, own))); }
      });
      const mine = s.turn === api.me?.id, cur = byId(api, s.turn);
      turnEl.innerHTML = s.over ? "All pairs found" : mine ? `<b>Your turn.</b> Flip two cards.` : `${cur ? dot(cur, "sm") : ""} <b>${esc(cur?.name || "Someone")}</b> is playing`;
      turnEl.classList.toggle("mine", mine && !s.over);
      sc.innerHTML = s.order.map((id) => { const p = byId(api, id); return p ? `<li class="${id === s.turn && !s.over ? "on" : ""}${p.away ? " away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b></li>` : ""; }).join("");
      timerBar(root.querySelector("#mmTl"), s.over || s.lock ? 0 : s.tl);
      const sum = Object.values(s.scores).reduce((a, n) => a + n, 0);
      if (lastSum >= 0 && sum > lastSum && ready()) tone(PENTA[sum % PENTA.length] * 2, 0.5, 0.07);
      lastSum = sum;
      if (s.over) results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0 })), { unit: "pairs" }); else end.innerHTML = "";
    }
    return { render, players() { last && render(last); } };
  }
});
