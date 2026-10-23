import { $, $$, h, fit, pos, B, game, report, shuffle, rnd, reduce, glow } from "./shared.js";
import { SCENES } from "./scenes.js";
import { ac, masterGain, reverbNode, blip, bowl, tone, PENTA, ready } from "../audio.js";

game("hue",
  `<div class="hue" id="hueGrid"></div><div class="row"><span class="game-msg" id="hueMsg"></span><select class="mini" id="hueSize" aria-label="Grid size"><option value="4">4 × 4</option><option value="5" selected>5 × 5</option><option value="6">6 × 6</option></select><button class="${B}" id="hueNew">New puzzle</button></div>`,
  () => {
    const el = $("#hueGrid"); let N, sol, cur, sel = null, moves = 0;
    const rnd = () => [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    function make() {
      N = +$("#hueSize").value; const C = [rnd(), rnd(), rnd(), rnd()]; sol = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / (N - 1), v = y / (N - 1);
        const col = [0, 1, 2].map((k) => C[0][k] * (1 - u) * (1 - v) + C[1][k] * u * (1 - v) + C[2][k] * (1 - u) * v + C[3][k] * u * v);
        sol.push(`rgb(${col.map(Math.round).join(",")})`);
      }
      const fixed = (i) => [0, N - 1, N * (N - 1), N * N - 1].includes(i);
      const free = sol.filter((_, i) => !fixed(i)).sort(() => Math.random() - 0.5);
      let k = 0; cur = sol.map((c, i) => (fixed(i) ? { c, f: 1 } : { c: free[k++], f: 0 }));
      moves = 0; sel = null; $("#hueMsg").textContent = ""; el.style.gridTemplateColumns = `repeat(${N},1fr)`; draw();
    }
    function draw() {
      el.innerHTML = "";
      cur.forEach((t, i) => { const b = h("button", { class: (t.f ? "fixed " : "") + (sel === i ? "sel" : ""), style: `background:${t.c}`, "aria-label": `Tile ${i + 1}` }); b.addEventListener("click", () => tap(i)); el.appendChild(b); });
    }
    function tap(i) {
      if (cur[i].f) return;
      if (sel === null) { sel = i; draw(); return; }
      if (sel !== i) { [cur[sel].c, cur[i].c] = [cur[i].c, cur[sel].c]; moves++; }
      sel = null; draw();
      if (cur.every((t, k) => t.c === sol[k])) { $("#hueMsg").textContent = `Harmony restored in ${moves} swaps.`; report(moves, { low: true }); if (ready()) bowl(262); }
    }
    $("#hueNew").addEventListener("click", make); $("#hueSize").addEventListener("change", make); make();
  });

game("slide",
  `<div class="slide" id="slideGrid"></div><div class="row"><span class="game-msg" id="slideMsg"></span><button class="${B}" id="slideNew">Shuffle</button></div>`,
  () => {
    const el = $("#slideGrid"); let t, moves;
    const nb = (i) => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter((j) => j >= 0 && j < 9);
    function shuffle() {
      t = [1, 2, 3, 4, 5, 6, 7, 8, 0]; let e = 8, prev = -1;
      for (let k = 0; k < 150; k++) { const opts = nb(e).filter((j) => j !== prev); const j = opts[Math.floor(Math.random() * opts.length)]; [t[e], t[j]] = [t[j], t[e]]; prev = e; e = j; }
      moves = 0; $("#slideMsg").textContent = ""; draw();
    }
    function draw() {
      el.style.gridTemplateColumns = "repeat(3,1fr)"; el.innerHTML = "";
      t.forEach((v, i) => { const b = h("button", { class: v ? "" : "blank", style: v ? `background:hsl(${(v - 1) * 40 + 260},62%,52%)` : "", "aria-label": v ? `Tile ${v}` : "Empty" }, v || ""); b.addEventListener("click", () => mv(i)); el.appendChild(b); });
    }
    function mv(i) {
      const e = t.indexOf(0); if (!nb(e).includes(i)) return;
      [t[e], t[i]] = [t[i], t[e]]; moves++; draw();
      if (t.join() === "1,2,3,4,5,6,7,8,0") { $("#slideMsg").textContent = `Solved in ${moves} moves.`; report(moves, { low: true }); if (ready()) bowl(294); }
    }
    $("#slideNew").addEventListener("click", shuffle); shuffle();
  });

game("memory",
  `<div class="memory" id="memory"></div><div class="row"><span class="game-msg" id="mMsg"></span><select class="mini" id="mLevel" aria-label="Number of pairs"><option value="6">6 pairs</option><option value="8">8 pairs</option><option value="10">10 pairs</option><option value="12">12 pairs</option><option value="15">15 pairs</option></select><button class="${B}" id="mReset">Shuffle</button></div>`,
  () => {
    const mem = $("#memory");
    let open = [], found = 0, lock = false, n, turns = 0;
    function deal() {
      n = +$("#mLevel").value; mem.innerHTML = ""; open = []; found = 0; turns = 0; lock = false; $("#mMsg").textContent = "";
      mem.style.gridTemplateColumns = `repeat(${n <= 8 ? 4 : n <= 10 ? 5 : 6},1fr)`;
      const picks = shuffle([...SCENES.keys()]).slice(0, n);
      shuffle([...picks, ...picks]).forEach((k) => {
        const b = h("button", { class: "mcard", "aria-label": "Hidden card" }, `<span class="mc-art">${SCENES[k].svg}</span>`); b.dataset.k = k;
        b.addEventListener("click", () => {
          if (lock || b.classList.contains("open") || b.classList.contains("done")) return;
          b.classList.add("open"); b.setAttribute("aria-label", SCENES[k].n); open.push(b);
          if (open.length === 2) {
            lock = true; turns++; const [a, c] = open;
            if (a.dataset.k === c.dataset.k) setTimeout(() => { a.classList.add("done"); c.classList.add("done"); open = []; lock = false; found++; tone(PENTA[found % PENTA.length], 0.5, 0.08); if (found === n) { $("#mMsg").textContent = `All pairs found in ${turns} turns. Well done.`; if (n === 6) report(turns, { low: true }); } }, 450);
            else setTimeout(() => { [a, c].forEach((x) => { x.classList.remove("open"); x.setAttribute("aria-label", "Hidden card"); }); open = []; lock = false; }, 900);
          }
        });
        mem.appendChild(b);
      });
    }
    $("#mReset").addEventListener("click", deal); $("#mLevel").addEventListener("change", deal); deal();
  });

/* ---------------------------------------------------------------- Merge (2048) */
game("merge",
  `<div class="mg"><div class="row mg-head"><span class="game-msg" id="mgScore">Score 0</span><button class="${B}" id="mgNew">New game</button></div><div class="mg-board" id="mgBoard" tabindex="0" role="application" aria-label="Merge board. Use the arrow keys or swipe to slide the tiles."></div><p class="muted small mg-tip">Slide with the arrow keys or WASD, or swipe. Equal tiles merge. There is no clock.</p></div>`,
  () => {
    const el = $("#mgBoard"), N = 4; let G, score, won, done, mx = 0, my = 0;
    const msg = $("#mgScore");
    const empty = () => G.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    function add() { const e = empty(); if (!e.length) return -1; const i = e[rnd(e.length)]; G[i] = Math.random() < 0.9 ? 2 : 4; return i; }
    function slide(line) {
      const a = line.filter(Boolean); let gain = 0;
      for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; gain += a[i]; a.splice(i + 1, 1); }
      while (a.length < N) a.push(0);
      return [a, gain];
    }
    const stuck = () => !empty().length && G.every((v, i) => (i % N === N - 1 || G[i + 1] !== v) && (i >= N * (N - 1) || G[i + N] !== v));
    function draw(fresh = []) {
      el.innerHTML = "";
      G.forEach((v, i) => {
        const c = h("div", { class: "mg-cell" });
        if (v) { const L = Math.log2(v); c.appendChild(h("div", { class: "mg-tile" + (fresh.includes(i) ? " pop" : ""), style: `background:hsl(${(200 + L * 24) % 360},${Math.min(70, 38 + L * 4)}%,${Math.max(48, 86 - L * 3.2)}%);font-size:${v > 999 ? "clamp(1.1rem,3.2vw,2rem)" : v > 99 ? "clamp(1.4rem,4vw,2.6rem)" : "clamp(1.7rem,5vw,3.2rem)"}` }, v)); }
        el.appendChild(c);
      });
      msg.textContent = done ? `Board full. You scored ${score}. Start a new game any time.` : won ? `2048! Score ${score}. Keep going if you like.` : `Score ${score}`;
    }
    function start() { G = Array(N * N).fill(0); score = 0; won = false; done = false; add(); add(); draw(); }
    function move(d) {
      if (done) return false;
      let moved = false, gain = 0; const ng = G.slice();
      for (let r = 0; r < N; r++) {
        const idx = Array.from({ length: N }, (_, k) => (d === 0 ? r * N + k : d === 2 ? r * N + (N - 1 - k) : d === 1 ? k * N + r : (N - 1 - k) * N + r));
        const [l, g] = slide(idx.map((i) => G[i])); gain += g;
        idx.forEach((i, k) => { if (ng[i] !== l[k]) moved = true; ng[i] = l[k]; });
      }
      if (!moved) return true;
      G = ng; score += gain; const born = add();
      if (!won && G.includes(2048)) won = true;
      if (stuck()) done = true;
      draw(born >= 0 ? [born] : []); if (score) report(score);
      return true;
    }
    const KEYS = { ArrowLeft: 0, a: 0, A: 0, ArrowUp: 1, w: 1, W: 1, ArrowRight: 2, d: 2, D: 2, ArrowDown: 3, s: 3, S: 3 };
    el.addEventListener("pointerdown", (e) => { mx = e.clientX; my = e.clientY; });
    el.addEventListener("pointerup", (e) => {
      const dx = e.clientX - mx, dy = e.clientY - my;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 2) : (dy < 0 ? 1 : 3));
    });
    $("#mgNew").addEventListener("click", start); start();
    return { key(e) { if (e.key in KEYS) { move(KEYS[e.key]); return true; } return false; } };
  });

/* ---------------------------------------------------------------- Lights out */
game("lights",
  `<div class="lo"><div class="row lo-head"><span class="game-msg" id="loMsg"></span></div><div class="lo-board" id="loBoard"></div><div class="row"><button class="${B}" id="loHint">Show a hint</button><button class="${B}" id="loReset">Restart level</button><button class="btn btn-primary btn-sm" id="loNext" hidden>Next level</button></div><p class="muted small lo-tip">Tap a light to flip it and its four neighbours. Switch them all off. Levels get a little harder, and any level can be solved.</p></div>`,
  () => {
    const el = $("#loBoard"), N = 5; let level = 1, state, start, sol, sol0, moves = 0, solved = false, hint = -1;
    const nb = (i) => { const r = Math.floor(i / N), c = i % N; return [i, r > 0 && i - N, r < N - 1 && i + N, c > 0 && i - 1, c < N - 1 && i + 1].filter((x) => x !== false); };
    function press(i, s) { nb(i).forEach((j) => (s[j] ^= 1)); }
    function make() {
      state = Array(N * N).fill(0); sol = new Set();
      const presses = Math.min(3 + level * 1, 16), cells = shuffle([...Array(N * N).keys()]).slice(0, presses);
      cells.forEach((i) => { press(i, state); sol.add(i); });
      if (!state.some(Boolean)) return make();
      start = state.slice(); sol0 = new Set(sol); moves = 0; solved = false; hint = -1; $("#loNext").hidden = true; draw();
    }
    function draw() {
      el.innerHTML = "";
      el.style.gridTemplateColumns = `repeat(${N},1fr)`;
      state.forEach((v, i) => { const b = h("button", { class: "lo-c" + (v ? " on" : "") + (hint === i ? " hint" : ""), "aria-label": `Light ${i + 1}, ${v ? "on" : "off"}`, "aria-pressed": String(!!v) }); b.addEventListener("click", () => tap(i)); el.appendChild(b); });
      $("#loMsg").textContent = solved ? `Level ${level} cleared in ${moves} moves.` : `Level ${level} · ${moves} move${moves === 1 ? "" : "s"} · ${state.filter(Boolean).length} lights on`;
    }
    function tap(i) {
      if (solved) return;
      press(i, state); moves++; hint = -1; if (sol.has(i)) sol.delete(i); else sol.add(i);
      if (!state.some(Boolean)) { solved = true; report(level); $("#loNext").hidden = false; if (ready()) bowl(262 + level * 12); }
      draw();
    }
    $("#loHint").addEventListener("click", () => { if (solved || !sol.size) return; hint = [...sol][rnd(sol.size)]; draw(); });
    $("#loReset").addEventListener("click", () => { state = start.slice(); sol = new Set(sol0); moves = 0; solved = false; hint = -1; $("#loNext").hidden = true; draw(); });
    $("#loNext").addEventListener("click", () => { level++; make(); });
    make();
  });

/* ---------------------------------------------------------------- Mini sudoku */
game("sudoku",
  `<div class="sd"><div class="row sd-head"><select class="mini" id="sdSize" aria-label="Grid size"><option value="4">4 × 4</option><option value="6" selected>6 × 6</option></select><select class="mini" id="sdLevel" aria-label="Difficulty"><option value="0">Easy</option><option value="1" selected>Medium</option><option value="2">Tricky</option></select><span class="game-msg" id="sdMsg"></span></div><div class="sd-board" id="sdBoard" role="group" aria-label="Sudoku board"></div><div class="sd-pad" id="sdPad"></div><div class="row"><button class="${B}" id="sdHint">Hint</button><button class="${B}" id="sdNew">New puzzle</button></div><p class="muted small sd-tip">Every row, column and box holds each number once. Pick a square, then a number. Wrong repeats turn red. Keys 1 to 6 and the arrows work too.</p></div>`,
  () => {
    const board = $("#sdBoard"), pad = $("#sdPad"), msg = $("#sdMsg");
    let N, br, bc, sol, giv, cur, sel = -1, t0, done, hints, timer;
    const box = (i) => { const r = Math.floor(i / N), c = i % N; return Math.floor(r / br) * (N / bc) + Math.floor(c / bc); };
    const peers = (i) => { const r = Math.floor(i / N), c = i % N, out = []; for (let k = 0; k < N * N; k++) if (k !== i && (Math.floor(k / N) === r || k % N === c || box(k) === box(i))) out.push(k); return out; };
    function cands(a, i) { const used = new Set(peers(i).map((k) => a[k])); return Array.from({ length: N }, (_, k) => k + 1).filter((v) => !used.has(v)); }
    function solve(a, limit) {
      let n = 0;
      (function rec() {
        if (n >= limit) return;
        let bi = -1, bl = null;
        for (let i = 0; i < a.length; i++) if (!a[i]) { const c = cands(a, i); if (!bl || c.length < bl.length) { bi = i; bl = c; if (c.length < 2) break; } }
        if (bi < 0) { n++; return; }
        for (const v of bl) { a[bi] = v; rec(); if (n >= limit) { a[bi] = 0; return; } }
        a[bi] = 0;
      })();
      return n;
    }
    function make() {
      N = +$("#sdSize").value; br = 2; bc = N === 4 ? 2 : 3;
      const g = Array(N * N).fill(0);
      (function fill(i) { if (i === N * N) return true; for (const v of shuffle(cands(g, i))) { g[i] = v; if (fill(i + 1)) return true; } g[i] = 0; return false; })(0);
      sol = g.slice(); giv = g.slice();
      const keep = { 4: [10, 8, 6], 6: [20, 16, 13] }[N][+$("#sdLevel").value];
      let left = N * N;
      for (const i of shuffle([...Array(N * N).keys()])) {
        if (left <= keep) break;
        const v = giv[i]; giv[i] = 0;
        if (solve(giv.slice(), 2) !== 1) giv[i] = v; else left--;
      }
      cur = giv.slice(); sel = -1; done = false; hints = 0; t0 = Date.now(); clearInterval(timer);
      timer = setInterval(() => { if (!done && !document.hidden) paintMsg(); }, 1000);
      build();
    }
    const clock = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
    function paintMsg() { msg.textContent = done ? `Solved in ${clock()}${hints ? ` with ${hints} hint${hints > 1 ? "s" : ""}` : ""}. Nice.` : `${cur.filter(Boolean).length} of ${N * N} filled · ${clock()}`; }
    function build() {
      board.style.gridTemplateColumns = `repeat(${N},1fr)`; board.className = "sd-board n" + N; board.innerHTML = "";
      for (let i = 0; i < N * N; i++) { const b = h("button", { class: "sd-c", "data-i": i }); b.addEventListener("click", () => { sel = i; paint(); }); board.appendChild(b); }
      pad.innerHTML = "";
      for (let v = 1; v <= N; v++) { const b = h("button", { class: "sd-k", "aria-label": `Number ${v}` }, v); b.addEventListener("click", () => put(v)); pad.appendChild(b); }
      const e = h("button", { class: "sd-k sd-e", "aria-label": "Erase" }, "⌫"); e.addEventListener("click", () => put(0)); pad.appendChild(e);
      paint();
    }
    function paint() {
      const bad = new Set();
      for (let i = 0; i < N * N; i++) if (cur[i]) for (const k of peers(i)) if (cur[k] === cur[i]) bad.add(i);
      [...board.children].forEach((b, i) => {
        const r = Math.floor(i / N), c = i % N;
        b.textContent = cur[i] || "";
        b.className = "sd-c" + (giv[i] ? " giv" : "") + (i === sel ? " sel" : "") + (sel >= 0 && i !== sel && (peers(sel).includes(i)) ? " pr" : "") + (bad.has(i) ? " bad" : "") + (c % bc === bc - 1 && c < N - 1 ? " rb" : "") + (r % br === br - 1 && r < N - 1 ? " bb" : "");
        b.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, ${cur[i] || "empty"}${giv[i] ? ", given" : ""}`);
      });
      if (!done && cur.every((v, i) => v === sol[i])) {
        done = true; if (ready()) bowl(262);
        if (N === 6 && $("#sdLevel").value === "1" && !hints) report(Math.floor((Date.now() - t0) / 1000), { low: true });
      }
      paintMsg();
    }
    function put(v) { if (sel < 0 || giv[sel] || done) return; cur[sel] = v; paint(); }
    $("#sdHint").addEventListener("click", () => {
      if (done) return;
      const wrong = [...Array(N * N).keys()].filter((i) => !giv[i] && cur[i] !== sol[i]);
      if (!wrong.length) return;
      const i = sel >= 0 && wrong.includes(sel) ? sel : wrong[rnd(wrong.length)];
      cur[i] = sol[i]; giv[i] = sol[i]; hints++; sel = i; paint();
    });
    $("#sdNew").addEventListener("click", make); $("#sdSize").addEventListener("change", make); $("#sdLevel").addEventListener("change", make);
    make();
    return {
      destroy() { clearInterval(timer); },
      key(e) {
        if (/^[1-9]$/.test(e.key) && +e.key <= N) { put(+e.key); return true; }
        if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { put(0); return true; }
        const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -N, ArrowDown: N }[e.key];
        if (d && sel >= 0) { const n = sel + d; if (n >= 0 && n < N * N && !(Math.abs(d) === 1 && Math.floor(n / N) !== Math.floor(sel / N))) { sel = n; paint(); } return true; }
        if (d) { sel = 0; paint(); return true; }
        return false;
      }
    };
  });

/* ---------------------------------------------------------------- Quiet maze */
game("maze",
  `<canvas id="mzCv" aria-label="Maze. Use the arrow keys, the buttons below, or drag from your dot."></canvas><div class="row"><span class="game-msg" id="mzMsg"></span></div><div class="mz-pad" aria-label="Move"><button class="sd-k" data-d="1" aria-label="Up">↑</button><div><button class="sd-k" data-d="3" aria-label="Left">←</button><button class="sd-k" data-d="2" aria-label="Down">↓</button><button class="sd-k" data-d="0" aria-label="Right">→</button></div></div><div class="row"><button class="${B}" id="mzNew">New maze</button></div>`,
  () => {
    const c = $("#mzCv"); let g = fit(c), level = 1, cols, rows, cell, ox, oy, open, me, px, py, goal, trail, steps, win = 0, ink = {};
    // d: 0 right, 1 up, 2 down, 3 left
    const DX = [1, 0, 0, -1], DY = [0, -1, 1, 0], OPP = [3, 2, 1, 0];
    const colours = () => { const s = getComputedStyle(document.documentElement); ink = { fg: s.getPropertyValue("--fg").trim() || "#111", line: s.getPropertyValue("--fg2").trim() || "#666" }; };
    // Recompute where the maze sits without building a new one (used when the window changes size).
    function place() {
      const W = c.clientWidth, H = c.clientHeight;
      cell = Math.floor(Math.min(W / cols, H / rows)); ox = Math.floor((W - cell * cols) / 2); oy = Math.floor((H - cell * rows) / 2);
      px = ox + (me % cols + 0.5) * cell; py = oy + (Math.floor(me / cols) + 0.5) * cell;
    }
    function make() {
      const W = c.clientWidth, H = c.clientHeight;
      cols = Math.min(6 + level * 2, 28); rows = Math.max(5, Math.min(Math.round(cols * H / W), 20));
      cell = Math.floor(Math.min(W / cols, H / rows)); ox = Math.floor((W - cell * cols) / 2); oy = Math.floor((H - cell * rows) / 2);
      open = Array(cols * rows).fill(0);
      const seen = new Set([0]), stack = [0];
      while (stack.length) {
        const i = stack[stack.length - 1], x = i % cols, y = Math.floor(i / cols);
        const opts = shuffle([0, 1, 2, 3]).filter((d) => { const nx = x + DX[d], ny = y + DY[d]; return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen.has(ny * cols + nx); });
        if (!opts.length) { stack.pop(); continue; }
        const d = opts[0], j = (y + DY[d]) * cols + x + DX[d];
        open[i] |= 1 << d; open[j] |= 1 << OPP[d]; seen.add(j); stack.push(j);
      }
      me = 0; px = ox + cell / 2; py = oy + cell / 2; goal = cols * rows - 1; trail = new Set([0]); steps = 0; win = 0;
      $("#mzMsg").textContent = `Level ${level}. Find the glowing light.`;
    }
    function move(d) {
      if (win) return false;
      if (!(open[me] & (1 << d))) return false;
      me += DY[d] * cols + DX[d]; trail.add(me); steps++;
      if (me === goal) { win = performance.now(); report(level); $("#mzMsg").textContent = `Level ${level} cleared in ${steps} steps.`; if (ready()) bowl(262 + level * 14); setTimeout(() => { level++; make(); }, reduce ? 600 : 1300); }
      return true;
    }
    const cellAt = (e) => { const [x, y] = pos(c, e); return [Math.floor((x - ox) / cell), Math.floor((y - oy) / cell)]; };
    c.addEventListener("pointermove", (e) => {
      if (!(e.buttons || e.pointerType === "touch")) return;
      const [x, y] = cellAt(e);
      for (let k = 0; k < 3; k++) { const dx = x - (me % cols), dy = y - Math.floor(me / cols); if (!dx && !dy) break; const d = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 3) : (dy > 0 ? 2 : 1); if (!move(d)) break; }
    });
    c.addEventListener("pointerdown", (e) => c.setPointerCapture?.(e.pointerId));
    $$(".mz-pad button").forEach((b) => b.addEventListener("click", () => move(+b.dataset.d)));
    $("#mzNew").addEventListener("click", make);
    addEventListener("themechange", colours);
    const KEYS = { ArrowRight: 0, d: 0, D: 0, ArrowUp: 1, w: 1, W: 1, ArrowDown: 2, s: 2, S: 2, ArrowLeft: 3, a: 3, A: 3 };
    colours(); make();
    return {
      resize() { g = fit(c); if (open) place(); else make(); },
      destroy() { removeEventListener("themechange", colours); },
      key(e) { if (e.key in KEYS) { move(KEYS[e.key]); return true; } return false; },
      frame(t) {
        const W = c.clientWidth, H = c.clientHeight; g.clearRect(0, 0, W, H);
        const gx = (i) => ox + (i % cols) * cell, gy = (i) => oy + Math.floor(i / cols) * cell;
        trail.forEach((i) => { g.fillStyle = "rgba(160,120,230,.16)"; g.fillRect(gx(i) + 2, gy(i) + 2, cell - 4, cell - 4); });
        g.strokeStyle = ink.fg; g.lineWidth = Math.max(2, cell * 0.09); g.lineCap = "round"; g.beginPath();
        for (let i = 0; i < cols * rows; i++) {
          const x = gx(i), y = gy(i);
          if (!(open[i] & 4)) { g.moveTo(x, y + cell); g.lineTo(x + cell, y + cell); }
          if (!(open[i] & 1)) { g.moveTo(x + cell, y); g.lineTo(x + cell, y + cell); }
          if (i < cols && !(open[i] & 2)) { g.moveTo(x, y); g.lineTo(x + cell, y); }
          if (i % cols === 0 && !(open[i] & 8)) { g.moveTo(x, y); g.lineTo(x, y + cell); }
        }
        g.stroke();
        const pulse = 0.5 + Math.sin(t / 300) * 0.5, gcx = gx(goal) + cell / 2, gcy = gy(goal) + cell / 2;
        const gs = cell * (1.3 + pulse * 0.5); g.drawImage(glow("goal", 48, "255,214,120"), gcx - gs, gcy - gs, gs * 2, gs * 2);
        px += (gx(me) + cell / 2 - px) * 0.28; py += (gy(me) + cell / 2 - py) * 0.28;
        g.drawImage(glow("me", 40, "167,139,250"), px - cell * 0.9, py - cell * 0.9, cell * 1.8, cell * 1.8); g.fillStyle = "#c2b0f6"; g.beginPath(); g.arc(px, py, cell * 0.28, 0, Math.PI * 2); g.fill();
      }
    };
  });
