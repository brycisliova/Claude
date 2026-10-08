import { $, h, esc, fit, onFrame, reduce, reveal } from "../core.js";
import { ac, context, masterGain, reverbNode, blip, bowl, tone, PENTA, ready } from "../audio.js";

const GAMES = [];
const game = (id, title, how, body, init) => GAMES.push({ id, title, how, body, init });
const pos = (c, e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
const B = "btn btn-ghost btn-sm";

game("breathe", "Breathe with the orb", "Choose a pattern. Follow the orb in and out.",
  `<div class="stage"><span class="bcount" id="bCount">Ready when you are</span><div class="orb" id="orb"></div><div class="ring"></div><span class="blabel" id="bLabel">Press start</span></div><div class="row"><select class="mini" id="bMode" aria-label="Breathing pattern"><option value="box">Box 4-4-4-4</option><option value="478">Relax 4-7-8</option><option value="coh">Coherent 5-5</option></select><button class="btn btn-primary btn-sm" id="bStart">Start</button></div>`,
  () => {
    const P = { box: [["Breathe in", 4, 1], ["Hold", 4, 1], ["Breathe out", 4, 0], ["Hold", 4, 0]], "478": [["Breathe in", 4, 1], ["Hold", 7, 1], ["Breathe out", 8, 0]], coh: [["Breathe in", 5, 1], ["Breathe out", 5, 0]] };
    const orb = $("#orb"), bl = $("#bLabel"), bc = $("#bCount"), bs = $("#bStart");
    let T = null, IV = null, cyc = 0;
    function run(i) {
      const ph = P[$("#bMode").value], [txt, s, big] = ph[i];
      orb.style.transitionDuration = s + "s"; orb.classList.toggle("grow", !!big); bl.textContent = txt;
      let k = s; bc.textContent = `${txt}… ${k}`;
      clearInterval(IV); IV = setInterval(() => { k--; if (k > 0) bc.textContent = `${txt}… ${k}`; }, 1000);
      T = setTimeout(() => { if (i === ph.length - 1) cyc++; run((i + 1) % ph.length); }, s * 1000);
    }
    bs.addEventListener("click", () => {
      if (T) { clearTimeout(T); clearInterval(IV); T = null; orb.classList.remove("grow"); bl.textContent = cyc ? `Well done. ${cyc} full breath${cyc > 1 ? "s" : ""}.` : "Press start"; bc.textContent = "Ready when you are"; bs.textContent = "Start"; }
      else { cyc = 0; bs.textContent = "Stop"; run(0); }
    });
  });

game("lantern", "Release a lantern", "Type something heavy on your mind. Watch it float away.",
  `<div class="stage lantern-stage" id="lStage"></div><div class="row"><input type="text" id="lInput" class="text-in" maxlength="40" placeholder="Something I'm letting go of…" aria-label="What are you letting go of?"><button class="btn btn-primary btn-sm" id="lGo">Let it go</button></div>`,
  () => {
    const ls = $("#lStage"), li = $("#lInput");
    for (let i = 0; i < 45; i++) ls.appendChild(h("span", { class: "star", style: `left:${Math.random() * 100}%;top:${Math.random() * 70}%;animation-delay:${Math.random() * 3}s` }));
    function rel(t) {
      const l = h("div", { class: "lantern", style: `left:${10 + Math.random() * 75}%;--dx:${Math.random() * 80 - 40}px;--rot:${Math.random() * 16 - 8}deg` });
      l.textContent = t || ""; ls.appendChild(l); setTimeout(() => l.remove(), 10200);
    }
    const go = () => { rel(li.value.trim().slice(0, 40)); li.value = ""; };
    $("#lGo").addEventListener("click", go);
    li.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    rel("");
  });

game("bubbles", "Pop the bubbles", "No score to beat. Tap and watch them burst into colour.",
  `<canvas id="gBub" aria-label="Bubbles to pop"></canvas><div class="row"><span class="muted small" id="popCount">0 popped</span></div>`,
  () => {
    const c = $("#gBub"); let g = fit(c), Bs = [], bits = [], pops = 0;
    const add = (y) => Bs.push({ x: Math.random() * c.clientWidth, y: y ?? c.clientHeight + 30, r: 14 + Math.random() * 24, v: 0.35 + Math.random() * 0.6, h: Math.random() * 360, w: Math.random() * 6 });
    for (let i = 0; i < 10; i++) add(Math.random() * c.clientHeight);
    c.addEventListener("pointerdown", (e) => {
      const [mx, my] = pos(c, e);
      for (let i = Bs.length - 1; i >= 0; i--) {
        const b = Bs[i];
        if (Math.hypot(mx - b.cx, my - b.y) < b.r + 6) {
          for (let k = 0; k < 18; k++) { const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3; bits.push({ x: b.cx, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, h: (b.h + k * 20) % 360, l: 1 }); }
          tone(PENTA[Math.floor(Math.random() * PENTA.length)] * 2, 0.25, 0.06);
          Bs.splice(i, 1); pops++; $("#popCount").textContent = pops + " popped"; break;
        }
      }
    });
    return {
      resize() { g = fit(c); },
      frame() {
        const W = c.clientWidth, H = c.clientHeight; g.clearRect(0, 0, W, H);
        if (Bs.length < 15 && Math.random() < 0.045) add();
        Bs.forEach((b) => {
          b.y -= b.v; b.w += 0.02; const x = b.x + Math.sin(b.w) * 8; b.cx = x;
          const gr = g.createRadialGradient(x - b.r * 0.35, b.y - b.r * 0.35, 1, x, b.y, b.r);
          gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.3, `hsla(${b.h},80%,70%,.35)`); gr.addColorStop(1, `hsla(${(b.h + 60) % 360},80%,60%,.6)`);
          g.beginPath(); g.arc(x, b.y, b.r, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
        });
        Bs = Bs.filter((b) => b.y > -40);
        bits.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.l -= 0.02; g.globalAlpha = Math.max(0, p.l); g.fillStyle = `hsl(${p.h},85%,60%)`; g.beginPath(); g.arc(p.x, p.y, 3, 0, Math.PI * 2); g.fill(); });
        g.globalAlpha = 1; bits = bits.filter((p) => p.l > 0);
      }
    };
  });

game("paint", "Paint with light", "Drag to draw glowing trails that shift through the spectrum and slowly fade.",
  `<canvas id="gPaint" aria-label="Light painting canvas"></canvas><div class="row"><button class="${B}" id="pClear">Clear</button></div>`,
  () => {
    const c = $("#gPaint"); let g = fit(c), down = false, last = null, hue = 0;
    function st(p) {
      if (!last) { last = p; return; }
      hue = (hue + 3) % 360; g.lineCap = "round"; g.shadowBlur = 18; g.shadowColor = `hsl(${hue},90%,60%)`; g.strokeStyle = `hsl(${hue},90%,62%)`; g.lineWidth = 7;
      g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke(); g.shadowBlur = 0; last = p;
    }
    c.addEventListener("pointerdown", (e) => { down = true; last = null; c.setPointerCapture(e.pointerId); st(pos(c, e)); });
    c.addEventListener("pointermove", (e) => { if (down) st(pos(c, e)); });
    ["pointerup", "pointercancel"].forEach((ev) => c.addEventListener(ev, () => { down = false; last = null; }));
    $("#pClear").addEventListener("click", () => g.clearRect(0, 0, c.clientWidth, c.clientHeight));
    return { resize() { g = fit(c); }, frame() { g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,.025)"; g.fillRect(0, 0, c.clientWidth, c.clientHeight); g.globalCompositeOperation = "source-over"; } };
  });

game("kaleido", "Kaleidoscope", "Draw anywhere. Your strokes mirror into a mandala.",
  `<canvas id="gKal" style="background:#0b0a14" aria-label="Kaleidoscope canvas"></canvas><div class="row"><select class="mini" id="kN" aria-label="Symmetry"><option value="6">6-fold</option><option value="8" selected>8-fold</option><option value="12">12-fold</option></select><button class="${B}" id="kClear">Clear</button></div>`,
  () => {
    const c = $("#gKal"); let g = fit(c), down = false, last = null, hue = 200;
    function seg(a, b) {
      const W = c.clientWidth, H = c.clientHeight, cx = W / 2, cy = H / 2, n = +$("#kN").value;
      hue = (hue + 1.5) % 360; g.strokeStyle = `hsl(${hue},85%,65%)`; g.lineWidth = 2.5; g.lineCap = "round"; g.shadowBlur = 10; g.shadowColor = g.strokeStyle;
      for (let i = 0; i < n; i++) for (const m of [1, -1]) { g.save(); g.translate(cx, cy); g.rotate((i * Math.PI * 2) / n); g.scale(1, m); g.beginPath(); g.moveTo(a[0] - cx, a[1] - cy); g.lineTo(b[0] - cx, b[1] - cy); g.stroke(); g.restore(); }
      g.shadowBlur = 0;
    }
    c.addEventListener("pointerdown", (e) => { down = true; c.setPointerCapture(e.pointerId); last = pos(c, e); });
    c.addEventListener("pointermove", (e) => { if (!down) return; const p = pos(c, e); seg(last, p); last = p; });
    ["pointerup", "pointercancel"].forEach((ev) => c.addEventListener(ev, () => (down = false)));
    $("#kClear").addEventListener("click", () => g.clearRect(0, 0, c.clientWidth, c.clientHeight));
    return { resize() { g = fit(c); } };
  });

game("sand", "Zen sand garden", "Drag to rake patterns. Switch to stones and tap to place them.",
  `<canvas id="gSand" aria-label="Sand garden"></canvas><div class="row"><button class="${B}" id="sMode">Mode: rake</button><button class="${B}" id="sSmooth">Smooth the sand</button></div>`,
  () => {
    const c = $("#gSand"); let g = fit(c), mode = "rake", down = false, last = null;
    function smooth() {
      const W = c.clientWidth, H = c.clientHeight; g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, W, H);
      for (let i = 0; i < (W * H) / 30; i++) { g.fillStyle = Math.random() < 0.5 ? "rgba(140,115,80,.12)" : "rgba(255,255,255,.25)"; g.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2); }
    }
    smooth();
    function rake(a, b) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      for (let k = -2; k <= 2; k++) {
        const o = k * 7;
        g.strokeStyle = "rgba(120,95,60,.45)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(a[0] + nx * o, a[1] + ny * o); g.lineTo(b[0] + nx * o, b[1] + ny * o); g.stroke();
        g.strokeStyle = "rgba(255,250,240,.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0] + nx * (o + 2), a[1] + ny * (o + 2)); g.lineTo(b[0] + nx * (o + 2), b[1] + ny * (o + 2)); g.stroke();
      }
    }
    function stone(p) {
      for (let r = 50; r > 18; r -= 8) { g.strokeStyle = "rgba(120,95,60,.4)"; g.lineWidth = 2; g.beginPath(); g.ellipse(p[0], p[1], r * 1.3, r, 0, 0, Math.PI * 2); g.stroke(); }
      const gr = g.createRadialGradient(p[0] - 5, p[1] - 6, 2, p[0], p[1], 18); gr.addColorStop(0, "#9a958f"); gr.addColorStop(1, "#4a4743");
      g.fillStyle = gr; g.beginPath(); g.ellipse(p[0], p[1], 20, 15, 0.3, 0, Math.PI * 2); g.fill();
    }
    c.addEventListener("pointerdown", (e) => { const p = pos(c, e); if (mode === "stone") { stone(p); return; } down = true; last = p; c.setPointerCapture(e.pointerId); });
    c.addEventListener("pointermove", (e) => { if (!down) return; const p = pos(c, e); if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 3) { rake(last, p); last = p; } });
    ["pointerup", "pointercancel"].forEach((ev) => c.addEventListener(ev, () => (down = false)));
    $("#sMode").addEventListener("click", function () { mode = mode === "rake" ? "stone" : "rake"; this.textContent = "Mode: " + mode; });
    $("#sSmooth").addEventListener("click", smooth);
    return { resize() { g = fit(c); smooth(); } };
  });

game("hue", "Colour harmony", "Tap two tiles to swap them. Restore the smooth gradient. Dotted corners stay fixed.",
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
      if (cur.every((t, k) => t.c === sol[k])) { $("#hueMsg").textContent = `Harmony restored in ${moves} swaps.`; if (ready()) bowl(262); }
    }
    $("#hueNew").addEventListener("click", make); $("#hueSize").addEventListener("change", make); make();
  });

game("slide", "Sliding puzzle", "Slide the tiles into order, 1 to 8. Take as long as you like.",
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
      if (t.join() === "1,2,3,4,5,6,7,8,0") { $("#slideMsg").textContent = `Solved in ${moves} moves. Beautiful.`; if (ready()) bowl(294); }
    }
    $("#slideNew").addEventListener("click", shuffle); shuffle();
  });

game("memory", "Gentle memory", "Find the matching pairs. No timer.",
  `<div class="memory" id="memory"></div><div class="row"><span class="game-msg" id="mMsg"></span><select class="mini" id="mLevel" aria-label="Number of pairs"><option value="6">6 pairs</option><option value="8">8 pairs</option><option value="10">10 pairs</option></select><button class="${B}" id="mReset">Shuffle</button></div>`,
  () => {
    const icons = ["🌈", "🌸", "🌙", "⭐", "🍃", "🦋", "🌻", "🐚", "🕊️", "🍵"], mem = $("#memory");
    let open = [], found = 0, lock = false, n;
    function deal() {
      n = +$("#mLevel").value; mem.innerHTML = ""; open = []; found = 0; $("#mMsg").textContent = "";
      mem.style.gridTemplateColumns = `repeat(${n === 10 ? 5 : 4},1fr)`;
      [...icons.slice(0, n), ...icons.slice(0, n)].sort(() => Math.random() - 0.5).forEach((ic) => {
        const b = h("button", { class: "mcard", "aria-label": "Hidden card" }, `<span>${ic}</span>`); b.dataset.ic = ic;
        b.addEventListener("click", () => {
          if (lock || b.classList.contains("open") || b.classList.contains("done")) return;
          b.classList.add("open"); b.setAttribute("aria-label", ic); open.push(b);
          if (open.length === 2) {
            lock = true; const [a, c] = open;
            if (a.dataset.ic === c.dataset.ic) setTimeout(() => { a.classList.add("done"); c.classList.add("done"); open = []; lock = false; found++; tone(PENTA[found % PENTA.length], 0.5, 0.08); if (found === n) $("#mMsg").textContent = "All pairs found. Lovely."; }, 450);
            else setTimeout(() => { [a, c].forEach((x) => { x.classList.remove("open"); x.setAttribute("aria-label", "Hidden card"); }); open = []; lock = false; }, 900);
          }
        });
        mem.appendChild(b);
      });
    }
    $("#mReset").addEventListener("click", deal); $("#mLevel").addEventListener("change", deal); deal();
  });

game("stars", "Constellations", "Tap one star, then another, to connect them. Draw your own sky.",
  `<canvas id="gStar" style="background:linear-gradient(#0d0a1f,#2a1d4a)" aria-label="Constellation sky"></canvas><div class="row"><button class="${B}" id="stNew">New sky</button><span class="muted small" id="stCount"></span></div>`,
  () => {
    const c = $("#gStar"); let g = fit(c), S = [], L = [], sel = null, shoot = null;
    function sky() { S = Array.from({ length: 42 }, () => ({ x: Math.random() * 0.94 + 0.03, y: Math.random() * 0.9 + 0.05, r: Math.random() * 1.8 + 1.2, p: Math.random() * 6 })); L = []; sel = null; $("#stCount").textContent = ""; }
    sky();
    c.addEventListener("pointerdown", (e) => {
      const [mx, my] = pos(c, e), W = c.clientWidth, H = c.clientHeight; let best = -1, bd = 26;
      S.forEach((s, i) => { const d = Math.hypot(s.x * W - mx, s.y * H - my); if (d < bd) { bd = d; best = i; } });
      if (best < 0) { sel = null; return; }
      if (sel === null || sel === best) { sel = best; return; }
      L.push([sel, best]); tone(PENTA[L.length % PENTA.length] * 2, 0.8, 0.05); sel = best;
      $("#stCount").textContent = `${L.length} line${L.length > 1 ? "s" : ""}`;
    });
    $("#stNew").addEventListener("click", sky);
    return {
      resize() { g = fit(c); },
      frame() {
        const W = c.clientWidth, H = c.clientHeight; g.clearRect(0, 0, W, H);
        g.strokeStyle = "rgba(190,170,255,.75)"; g.lineWidth = 1.6; g.shadowBlur = 8; g.shadowColor = "#b58cff";
        L.forEach(([a, b]) => { g.beginPath(); g.moveTo(S[a].x * W, S[a].y * H); g.lineTo(S[b].x * W, S[b].y * H); g.stroke(); }); g.shadowBlur = 0;
        S.forEach((s, i) => { s.p += 0.03; g.globalAlpha = 0.6 + Math.sin(s.p) * 0.4; g.fillStyle = i === sel ? "#ffd27a" : "#fff"; g.beginPath(); g.arc(s.x * W, s.y * H, s.r + (i === sel ? 2 : 0), 0, Math.PI * 2); g.fill(); });
        g.globalAlpha = 1;
        if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * W, y: Math.random() * H * 0.4, l: 1 };
        if (shoot) { g.strokeStyle = `rgba(255,255,255,${shoot.l})`; g.lineWidth = 2; g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(shoot.x - 40, shoot.y - 15); g.stroke(); shoot.x += 7; shoot.y += 2.6; shoot.l -= 0.02; if (shoot.l <= 0) shoot = null; }
      }
    };
  });

game("garden", "Grow a garden", "Tap the ground to plant a flower. Watch it grow and sway in the breeze.",
  `<canvas id="gGarden" style="background:linear-gradient(#cfe8ff,#f3e9ff 70%,#cdeccf 70%)" aria-label="Garden"></canvas><div class="row"><button class="${B}" id="gClear">New season</button><span class="muted small" id="gCount"></span></div>`,
  () => {
    const c = $("#gGarden"); let g = fit(c), F = [], t = 0;
    c.addEventListener("pointerdown", (e) => {
      const [x, y] = pos(c, e), H = c.clientHeight;
      F.push({ x, base: Math.max(y, H * 0.72), hgt: 60 + Math.random() * 110, hue: Math.random() * 360, n: 5 + Math.floor(Math.random() * 4), age: 0, ph: Math.random() * 6 });
      if (F.length > 40) F.shift();
      tone(PENTA[Math.floor(Math.random() * 6)], 0.9, 0.05);
      $("#gCount").textContent = `${F.length} flower${F.length > 1 ? "s" : ""}`;
    });
    $("#gClear").addEventListener("click", () => { F = []; $("#gCount").textContent = ""; });
    return {
      resize() { g = fit(c); },
      frame() {
        t += 0.016; const W = c.clientWidth, H = c.clientHeight; g.clearRect(0, 0, W, H); F.sort((a, b) => a.base - b.base);
        F.forEach((f) => {
          f.age = Math.min(1, f.age + 0.012); const grow = Math.min(1, f.age * 1.6), sway = Math.sin(t * 1.4 + f.ph) * 10 * grow, top = [f.x + sway, f.base - f.hgt * grow];
          g.strokeStyle = "#3f8f54"; g.lineWidth = 3; g.beginPath(); g.moveTo(f.x, f.base); g.quadraticCurveTo(f.x + sway * 0.2, f.base - f.hgt * grow * 0.5, top[0], top[1]); g.stroke();
          if (grow > 0.4) { g.fillStyle = "#4caf65"; g.beginPath(); g.ellipse(f.x + sway * 0.3 + 8, f.base - f.hgt * grow * 0.35, 9, 4, -0.6, 0, Math.PI * 2); g.fill(); }
          const bloom = Math.max(0, (f.age - 0.55) / 0.45);
          if (bloom > 0) {
            const R = 14 * bloom;
            for (let k = 0; k < f.n; k++) { const a = (k / f.n) * Math.PI * 2 + t * 0.2; g.fillStyle = `hsl(${f.hue},75%,68%)`; g.beginPath(); g.ellipse(top[0] + Math.cos(a) * R * 0.8, top[1] + Math.sin(a) * R * 0.8, R * 0.7, R * 0.4, a, 0, Math.PI * 2); g.fill(); }
            g.fillStyle = `hsl(${(f.hue + 50) % 360},85%,55%)`; g.beginPath(); g.arc(top[0], top[1], R * 0.4, 0, Math.PI * 2); g.fill();
          }
        });
      }
    };
  });

game("chimes", "Wind chimes", "Tap or drag across the bars to play a calm pentatonic melody. Every combination sounds gentle.",
  `<div class="chimes" id="chimes"></div><div class="row"><button class="${B}" id="chAuto">Let the wind play</button></div>`,
  () => {
    const el = $("#chimes"), cols = ["r", "o", "y", "g", "sky", "b", "v", "pink"]; let down = false, auto = null;
    function ring(i, b) {
      const AC = ac(); if (!AC) return;
      const f = PENTA[i] * 1.5, t = AC.currentTime;
      [[1, 0.12], [2.4, 0.04], [4.1, 0.02]].forEach(([m, v]) => {
        const o = AC.createOscillator(), gg = AC.createGain(); o.frequency.value = f * m;
        gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(v, t + 0.005); gg.gain.exponentialRampToValueAtTime(0.0001, t + 3);
        o.connect(gg); gg.connect(masterGain()); gg.connect(reverbNode()); o.start(t); o.stop(t + 3.1);
      });
      b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 300);
    }
    cols.forEach((c, i) => {
      const b = h("button", { style: `--c:var(--${c})`, "aria-label": `Chime ${i + 1}` });
      b.addEventListener("pointerdown", () => { down = true; ring(i, b); });
      b.addEventListener("pointerenter", () => { if (down) ring(i, b); });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") ring(i, b); });
      el.appendChild(b);
    });
    addEventListener("pointerup", () => (down = false));
    $("#chAuto").addEventListener("click", function () {
      if (auto) { clearTimeout(auto); auto = null; this.textContent = "Let the wind play"; return; }
      if (!ac()) return;
      this.textContent = "Stop the wind";
      (function play() { const i = Math.floor(Math.random() * 8); ring(i, el.children[i]); auto = setTimeout(play, 300 + Math.random() * 1400); })();
    });
  });

game("aurora", "Aurora", "Move your finger or mouse through the light. The particles follow, then drift free.",
  `<canvas id="gAur" style="background:#0b0816" aria-label="Aurora particles"></canvas><div class="row"><span class="muted small">Tip: hold still and watch.</span></div>`,
  () => {
    const c = $("#gAur"); let g = fit(c), P = [], m = null, t = 0;
    const spawn = (p) => { p.x = Math.random() * c.clientWidth; p.y = Math.random() * c.clientHeight; p.life = 80 + Math.random() * 220; return p; };
    const reset = () => { P = Array.from({ length: 420 }, () => spawn({ h: 200 + Math.random() * 140 })); };
    reset();
    c.addEventListener("pointermove", (e) => { m = pos(c, e); });
    c.addEventListener("pointerleave", () => (m = null));
    c.addEventListener("pointerdown", (e) => { m = pos(c, e); });
    return {
      resize() { g = fit(c); reset(); },
      frame() {
        t += 0.004; const W = c.clientWidth, H = c.clientHeight;
        g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,.07)"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
        P.forEach((p) => {
          const a = Math.sin(p.x * 0.006 + t) * Math.cos(p.y * 0.007 - t * 1.3) * Math.PI * 2; let vx = Math.cos(a) * 1.1, vy = Math.sin(a) * 1.1;
          if (m) { const dx = m[0] - p.x, dy = m[1] - p.y, d = Math.hypot(dx, dy) + 1; if (d < 160) { vx += (dx / d) * 1.6; vy += (dy / d) * 1.6; } }
          p.x += vx; p.y += vy; if (--p.life <= 0) spawn(p);
          if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
          g.fillStyle = `hsla(${(p.h + t * 60) % 360},90%,65%,.75)`; g.fillRect(p.x, p.y, 1.8, 1.8);
        });
      }
    };
  });

/* ---- render cards, lazy-start each game when it scrolls into view ---- */
const grid = $("#gameGrid");
GAMES.forEach((G) => {
  G.card = h("article", { class: "card game reveal", id: "game-" + G.id, style: `--c:var(--${["v", "b", "g", "pink", "sky", "o", "r", "y"][GAMES.indexOf(G) % 8]})` }, `<h3 class="ct">${esc(G.title)}</h3><p class="how">${esc(G.how)}</p>${G.body}`);
  grid.appendChild(G.card);
});
reveal(grid);
const live = new Set();
const lazy = new IntersectionObserver((entries) => entries.forEach((e) => {
  const G = GAMES.find((x) => x.card === e.target);
  if (e.isIntersecting) {
    if (!G.started) { G.started = true; G.api = G.init() || null; }
    live.add(G);
  } else live.delete(G);
}), { rootMargin: "120px", threshold: 0.01 });
GAMES.forEach((G) => lazy.observe(G.card));
onFrame(() => live.forEach((G) => G.api?.frame?.()));
let rt;
addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => GAMES.forEach((G) => G.started && G.api?.resize?.()), 150); });

/* ---- rotating thoughts ---- */
const q = $("#qText");
if (q) {
  const list = JSON.parse(q.dataset.quotes);
  let i = Math.floor(Math.random() * list.length);
  const set = () => { q.textContent = list[i][0]; $("#qBy").textContent = list[i][1]; };
  set();
  const next = () => { q.style.opacity = 0; q.style.filter = "blur(6px)"; setTimeout(() => { i = (i + 1) % list.length; set(); q.style.opacity = 1; q.style.filter = "none"; }, 600); };
  $("#qNext").addEventListener("click", next);
  setInterval(() => { if (!document.hidden) next(); }, 14000);
}
