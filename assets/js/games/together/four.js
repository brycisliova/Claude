import { game, $, h, B, rnd } from "../shared.js";
import { mp, esc, colour, byId, dot, results, COLORS } from "./common.js";
import { tone, PENTA, ready } from "../../audio.js";

const R = 6, C = 7;
const rowFor = (b, c) => { for (let r = R - 1; r >= 0; r--) if (!b[r * C + c]) return r; return -1; };
function winLine(b) {
  const at = (r, c) => (r >= 0 && r < R && c >= 0 && c < C ? b[r * C + c] : 0);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const v = at(r, c); if (!v) continue;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      let k = 1; while (k < 4 && at(r + dr * k, c + dc * k) === v) k++;
      if (k === 4) return [0, 1, 2, 3].map((i) => (r + dr * i) * C + c + dc * i);
    }
  }
  return null;
}
const full = (b) => b.every(Boolean);

/* ---- a small computer opponent (depth-limited minimax) ---- */
function score(b, me) {
  let s = 0; const op = 3 - me;
  const at = (r, c) => b[r * C + c];
  for (let r = 0; r < R; r++) if (at(r, 3) === me) s += 3; else if (at(r, 3) === op) s -= 3;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const er = r + dr * 3, ec = c + dc * 3; if (er < 0 || er >= R || ec < 0 || ec >= C) continue;
    let m = 0, o = 0; for (let k = 0; k < 4; k++) { const v = at(r + dr * k, c + dc * k); if (v === me) m++; else if (v === op) o++; }
    if (m && !o) s += [0, 1, 5, 30][m - 1] || 0; else if (o && !m) s -= [0, 1, 6, 40][o - 1] || 0;
  }
  return s;
}
function best(b, me, depth) {
  const order = [3, 2, 4, 1, 5, 0, 6];
  function mm(b, turn, d, a, be) {
    const w = winLine(b); if (w) return b[w[0]] === me ? 1e5 + d : -1e5 - d;
    if (full(b) || d === 0) return score(b, me);
    let bestV = turn === me ? -Infinity : Infinity;
    for (const c of order) {
      const r = rowFor(b, c); if (r < 0) continue; b[r * C + c] = turn;
      const v = mm(b, 3 - turn, d - 1, a, be); b[r * C + c] = 0;
      if (turn === me) { bestV = Math.max(bestV, v); a = Math.max(a, v); } else { bestV = Math.min(bestV, v); be = Math.min(be, v); }
      if (a >= be) break;
    }
    return bestV;
  }
  let pick = -1, pv = -Infinity;
  for (const c of order) { const r = rowFor(b, c); if (r < 0) continue; b[r * C + c] = me; const v = mm(b, 3 - me, depth - 1, -Infinity, Infinity) + Math.random() * 0.5; b[r * C + c] = 0; if (v > pv) { pv = v; pick = c; } }
  return pick;
}

/* ---- drawing the board (shared by solo and together) ---- */
function board(el, onDrop) {
  el.innerHTML = ""; el.className = "c4"; const cells = [], cols = [];
  for (let c = 0; c < C; c++) { const col = h("button", { class: "c4-col", type: "button", "aria-label": `Drop in column ${c + 1}` }); for (let r = 0; r < R; r++) { const cell = h("span", { class: "c4-cell" }); col.appendChild(cell); cells[r * C + c] = cell; } col.addEventListener("click", () => onDrop(c)); el.appendChild(col); cols.push(col); }
  return { cells, cols };
}
function paint(bd, b, colours, last, win, canPlay) {
  bd.cells.forEach((cell, i) => { const v = b[i]; cell.className = "c4-cell" + (v ? " on" : "") + (i === last ? " new" : "") + (win?.includes(i) ? " win" : ""); cell.style.setProperty("--dc", v ? colours[v] : "transparent"); });
  bd.cols.forEach((col, c) => { col.disabled = !canPlay || rowFor(b, c) < 0; });
}

/* ---- solo against the computer ---- */
game("four",
  `<div class="c4wrap"><div class="row"><span class="game-msg" id="c4Msg"></span></div><div id="c4Board"></div><div class="row"><select class="mini" id="c4Lvl" aria-label="Computer strength"><option value="1">Easy</option><option value="3" selected>Medium</option><option value="5">Hard</option></select><button class="${B}" id="c4New">New game</button></div><p class="muted small c4-tip">Drop discs and make four in a row, any direction. Keys 1 to 7 drop a disc too.</p></div>`,
  () => {
    const msg = $("#c4Msg"), you = COLORS[0], cpu = COLORS[2]; let b, over, turn, last, timer, win; const cols = [null, you, cpu];
    const bd = board($("#c4Board"), (c) => play(c));
    function start() { b = Array(R * C).fill(0); over = false; turn = 1; last = -1; win = null; clearTimeout(timer); msg.textContent = "Your move. You are the pink discs."; paint(bd, b, cols, last, win, true); }
    function drop(c, who) { const r = rowFor(b, c); if (r < 0) return false; b[r * C + c] = who; last = r * C + c; if (ready()) tone(PENTA[(c + (who === 1 ? 2 : 0)) % PENTA.length] * 2, 0.25, 0.05); return true; }
    function after() { win = winLine(b); if (win) { over = true; msg.textContent = b[win[0]] === 1 ? "You won. Nicely done." : "The computer won this one. Rematch?"; } else if (full(b)) { over = true; msg.textContent = "A draw."; } paint(bd, b, cols, last, win, !over && turn === 1); }
    function play(c) {
      if (over || turn !== 1 || !drop(c, 1)) return; turn = 2; after(); if (over) return; msg.textContent = "The computer is thinking…";
      timer = setTimeout(() => { const d = +$("#c4Lvl").value, open = [0, 1, 2, 3, 4, 5, 6].filter((x) => rowFor(b, x) >= 0), pick = d === 1 && Math.random() < 0.45 ? open[rnd(open.length)] : best(b, 2, d); drop(pick, 2); turn = 1; after(); if (!over) msg.textContent = "Your move."; }, 450);
    }
    $("#c4New").addEventListener("click", start); start();
    return { destroy() { clearTimeout(timer); }, key(e) { if (/^[1-7]$/.test(e.key)) { play(+e.key - 1); return true; } return false; } };
  });

/* ---- two players, each on their own device ---- */
mp({
  id: "four", title: "Four in a row", min: 2, max: 2, options: [],
  host(ctx) {
    let S = null, firstIdx = 0;
    const view = () => ({ b: S.b, order: S.order, turn: S.order[S.turn], win: S.win, over: S.over, draw: S.draw, last: S.last });
    return {
      start() { S = { b: Array(R * C).fill(0), order: ctx.players.slice(0, 2).map((p) => p.id), turn: firstIdx % 2, win: null, over: false, draw: false, last: -1 }; firstIdx++; ctx.push(view()); },
      act(pid, a) {
        if (!S || S.over || a.a !== "drop" || S.order[S.turn] !== pid || !Number.isInteger(a.c) || a.c < 0 || a.c >= C) return;
        const r = rowFor(S.b, a.c); if (r < 0) return; S.b[r * C + a.c] = S.turn + 1; S.last = r * C + a.c;
        S.win = winLine(S.b); if (S.win) S.over = true; else if (full(S.b)) { S.over = true; S.draw = true; } else S.turn = 1 - S.turn;
        ctx.push(view());
      },
      left(pid) { if (S && !S.over && S.order.includes(pid)) { S.over = true; S.win = null; S.draw = false; S.forfeit = pid; ctx.push({ ...view(), forfeit: pid }); } }
    };
  },
  view(root, api) {
    root.innerHTML = `<div class="mp mp-four"><div class="mp-head"><p class="mp-turn" id="c4Turn" aria-live="polite"></p></div><div id="c4B"></div><div id="c4End"></div></div>`;
    let last = null, built = false, bd = null;
    const keys = (e) => { if (/^[1-7]$/.test(e.key) && !/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) drop(+e.key - 1); };
    const drop = (c) => { if (last && !last.over && last.turn === api.me?.id) api.act({ a: "drop", c }); };
    document.addEventListener("keydown", keys);
    function render(s) {
      if (!s || !s.b) return; last = s; if (!built) { bd = board(root.querySelector("#c4B"), drop); built = true; }
      const cols = [null, colour(byId(api, s.order[0])), colour(byId(api, s.order[1]))];
      paint(bd, s.b, cols, s.last, s.win, !s.over && s.turn === api.me?.id);
      const cur = byId(api, s.turn), p1 = byId(api, s.order[0]), p2 = byId(api, s.order[1]);
      const t = root.querySelector("#c4Turn");
      t.innerHTML = s.forfeit ? `${esc(byId(api, s.forfeit)?.name || "Your opponent")} left the game.` : s.over ? (s.draw ? "A draw." : `<b>${esc(byId(api, s.b[s.win[0]] === 1 ? s.order[0] : s.order[1])?.name || "")}</b> wins`) : s.turn === api.me?.id ? "<b>Your turn.</b> Pick a column." : `${cur ? dot(cur, "sm") : ""} <b>${esc(cur?.name || "")}</b> is thinking`;
      t.insertAdjacentHTML("beforeend", `<span class="c4-vs">${p1 ? dot(p1, "sm") : ""} ${esc(p1?.name || "")} vs ${p2 ? dot(p2, "sm") : ""} ${esc(p2?.name || "")}</span>`);
      const end = root.querySelector("#c4End");
      if (s.over) { const winner = s.win ? s.order[s.b[s.win[0]] - 1] : null; results(end, api, s.order.map((id) => ({ id, score: s.draw || s.forfeit ? 0 : id === winner ? 1 : 0, note: id === winner ? "won" : "" })), { title: s.draw ? "A draw" : s.forfeit ? "Game ended" : "Winner", hide: true }); } else end.innerHTML = "";
    }
    return { render, players() { last && render(last); }, destroy() { document.removeEventListener("keydown", keys); } };
  }
});
