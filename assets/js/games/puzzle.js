import { $, h, fit, pos, B, game, report } from "./shared.js";
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
      if (t.join() === "1,2,3,4,5,6,7,8,0") { $("#slideMsg").textContent = `Solved in ${moves} moves. Beautiful.`; report(moves, { low: true }); if (ready()) bowl(294); }
    }
    $("#slideNew").addEventListener("click", shuffle); shuffle();
  });

game("memory",
  `<div class="memory" id="memory"></div><div class="row"><span class="game-msg" id="mMsg"></span><select class="mini" id="mLevel" aria-label="Number of pairs"><option value="6">6 pairs</option><option value="8">8 pairs</option><option value="10">10 pairs</option></select><button class="${B}" id="mReset">Shuffle</button></div>`,
  () => {
    const icons = ["🌈", "🌸", "🌙", "⭐", "🍃", "🦋", "🌻", "🐚", "🕊️", "🍵"], mem = $("#memory");
    let open = [], found = 0, lock = false, n, turns = 0;
    function deal() {
      n = +$("#mLevel").value; mem.innerHTML = ""; open = []; found = 0; turns = 0; lock = false; $("#mMsg").textContent = "";
      mem.style.gridTemplateColumns = `repeat(${n === 10 ? 5 : 4},1fr)`;
      [...icons.slice(0, n), ...icons.slice(0, n)].sort(() => Math.random() - 0.5).forEach((ic) => {
        const b = h("button", { class: "mcard", "aria-label": "Hidden card" }, `<span>${ic}</span>`); b.dataset.ic = ic;
        b.addEventListener("click", () => {
          if (lock || b.classList.contains("open") || b.classList.contains("done")) return;
          b.classList.add("open"); b.setAttribute("aria-label", ic); open.push(b);
          if (open.length === 2) {
            lock = true; turns++; const [a, c] = open;
            if (a.dataset.ic === c.dataset.ic) setTimeout(() => { a.classList.add("done"); c.classList.add("done"); open = []; lock = false; found++; tone(PENTA[found % PENTA.length], 0.5, 0.08); if (found === n) { $("#mMsg").textContent = `All pairs found in ${turns} turns. Lovely.`; if (n === 6) report(turns, { low: true }); } }, 450);
            else setTimeout(() => { [a, c].forEach((x) => { x.classList.remove("open"); x.setAttribute("aria-label", "Hidden card"); }); open = []; lock = false; }, 900);
          }
        });
        mem.appendChild(b);
      });
    }
    $("#mReset").addEventListener("click", deal); $("#mLevel").addEventListener("change", deal); deal();
  });
