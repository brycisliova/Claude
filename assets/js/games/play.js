import { $, $$, h, fit, pos, B, game, report, rnd, reduce, sprite, glow } from "./shared.js";
import { ac, masterGain, reverbNode, blip, bowl, tone, PENTA, ready } from "../audio.js";

game("bubbles",
  `<canvas id="gBub" aria-label="Bubbles to pop"></canvas><div class="row"><span class="muted small" id="popCount">0 popped</span></div>`,
  () => {
    const bubble = (hh) => sprite("bub" + (Math.floor(hh / 30) % 12), 96, 96, (x) => { const k = (Math.floor(hh / 30) % 12) * 30, gr = x.createRadialGradient(32, 32, 2, 48, 48, 46); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.3, `hsla(${k},80%,70%,.35)`); gr.addColorStop(1, `hsla(${(k + 60) % 360},80%,60%,.6)`); x.fillStyle = gr; x.beginPath(); x.arc(48, 48, 46, 0, 7); x.fill(); });
    const BITC = Array.from({ length: 12 }, (_, i) => `hsl(${i * 30 + 15},85%,60%)`);
    const c = $("#gBub"); let g = fit(c), Bs = [], bits = [], pops = 0;
    const add = (y) => Bs.push({ x: Math.random() * c.clientWidth, y: y ?? c.clientHeight + 30, r: 14 + Math.random() * 24, v: 0.35 + Math.random() * 0.6, h: Math.random() * 360, w: Math.random() * 6 });
    for (let i = 0; i < 10; i++) add(Math.random() * c.clientHeight);
    c.addEventListener("pointerdown", (e) => {
      const [mx, my] = pos(c, e);
      for (let i = Bs.length - 1; i >= 0; i--) {
        const b = Bs[i];
        if (Math.hypot(mx - b.cx, my - b.y) < b.r + 6) {
          for (let k = 0; k < 10; k++) { const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3; bits.push({ x: b.cx, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, h: (b.h + k * 20) % 360, l: 1 }); }
          tone(PENTA[Math.floor(Math.random() * PENTA.length)] * 2, 0.25, 0.06);
          Bs.splice(i, 1); pops++; $("#popCount").textContent = pops + " popped"; if (pops % 5 === 0) report(pops); break;
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
          g.drawImage(bubble(b.h), x - b.r, b.y - b.r, b.r * 2, b.r * 2);
        });
        Bs = Bs.filter((b) => b.y > -40);
        bits.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.l -= 0.025; g.globalAlpha = Math.max(0, p.l); g.fillStyle = BITC[Math.floor(p.h / 30) % 12]; g.fillRect(p.x - 2, p.y - 2, 4, 4); });
        g.globalAlpha = 1; bits = bits.filter((p) => p.l > 0);
      }
    };
  });

/* ---------------------------------------------------------------- Glow snake */
game("snake",
  `<canvas id="snCv" tabindex="0" aria-label="Glow snake. Use the arrow keys or swipe to steer. The snake wraps around the edges."></canvas><div class="row"><span class="game-msg" id="snMsg">Press an arrow key or swipe to begin.</span></div><div class="mz-pad" aria-label="Steer"><button class="sd-k" data-d="1" aria-label="Up">↑</button><div><button class="sd-k" data-d="3" aria-label="Left">←</button><button class="sd-k" data-d="2" aria-label="Down">↓</button><button class="sd-k" data-d="0" aria-label="Right">→</button></div></div><div class="row"><select class="mini" id="snSpeed" aria-label="Speed"><option value="170">Slow</option><option value="120" selected>Steady</option><option value="80">Quick</option></select><button class="${B}" id="snNew">Restart</button></div>`,
  () => {
    const c = $("#snCv"); let g = fit(c), N = 18, cell, ox, oy, snake, dir, nd, food, acc = 0, going = false, score, lastT = 0, hue = 0, sx = 0, sy = 0;
    const DX = [1, 0, 0, -1], DY = [0, -1, 1, 0];
    const msg = $("#snMsg");
    function layout() { const W = c.clientWidth, H = c.clientHeight; cell = Math.floor(Math.min(W, H) / N); ox = Math.floor((W - cell * N) / 2); oy = Math.floor((H - cell * N) / 2); }
    function spawn() { let i; do { i = rnd(N * N); } while (snake.some((s) => s[1] * N + s[0] === i)); food = [i % N, Math.floor(i / N)]; }
    function start() { layout(); snake = [[5, 9], [4, 9], [3, 9]]; dir = 0; nd = 0; score = 3; going = false; acc = 0; spawn(); msg.textContent = "Press an arrow key or swipe to begin."; }
    function turn(d) { if (d === 3 - dir && snake.length > 1) return; nd = d; if (!going) { going = true; msg.textContent = `Length ${score}`; } }
    function step() {
      dir = nd; const h0 = snake[0], nx = (h0[0] + DX[dir] + N) % N, ny = (h0[1] + DY[dir] + N) % N;
      const hit = snake.findIndex((s) => s[0] === nx && s[1] === ny);
      if (hit > 0) { snake = snake.slice(0, Math.max(3, hit)); score = snake.length; msg.textContent = `Oops, you bumped your tail. Length ${score}. Keep going.`; if (ready()) tone(PENTA[0], 0.4, 0.05); }
      snake.unshift([nx, ny]);
      if (nx === food[0] && ny === food[1]) { score = snake.length; report(score); msg.textContent = `Length ${score}`; if (ready()) tone(PENTA[score % PENTA.length] * 2, 0.4, 0.06); spawn(); } else snake.pop();
    }
    const KEYS = { ArrowRight: 0, d: 0, D: 0, ArrowUp: 1, w: 1, W: 1, ArrowDown: 2, s: 2, S: 2, ArrowLeft: 3, a: 3, A: 3 };
    c.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; c.setPointerCapture?.(e.pointerId); });
    c.addEventListener("pointerup", (e) => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 3) : (dy > 0 ? 2 : 1)); });
    $$(".mz-pad button").forEach((b) => b.addEventListener("click", () => turn(+b.dataset.d)));
    $("#snNew").addEventListener("click", start); start();
    return {
      resize() { g = fit(c); layout(); },
      key(e) { if (e.key in KEYS) { turn(KEYS[e.key]); return true; } return false; },
      frame(t) {
        const dt = Math.min(100, t - lastT || 16); lastT = t;
        if (going) { acc += dt; const sp = +$("#snSpeed").value; while (acc >= sp) { acc -= sp; step(); } }
        const W = c.clientWidth, H = c.clientHeight; g.clearRect(0, 0, W, H);
        g.fillStyle = "rgba(120,110,160,.10)"; g.fillRect(ox, oy, cell * N, cell * N);
        for (let i = 0; i < N * N; i++) if ((i + Math.floor(i / N)) % 2 === 0) { g.fillStyle = "rgba(120,110,160,.07)"; g.fillRect(ox + (i % N) * cell, oy + Math.floor(i / N) * cell, cell, cell); }
        const pulse = 0.75 + Math.sin(t / 220) * 0.25;
        const fx = ox + (food[0] + 0.5) * cell, fy = oy + (food[1] + 0.5) * cell; g.drawImage(glow("food", 40, "255,210,122"), fx - cell * 1.1, fy - cell * 1.1, cell * 2.2, cell * 2.2); g.fillStyle = "#ffd27a"; g.beginPath(); g.arc(fx, fy, cell * 0.3 * pulse + cell * 0.08, 0, 7); g.fill();
        snake.forEach((s, i) => { const k = 1 - i / (snake.length + 6); g.fillStyle = `hsl(${(260 + i * 7) % 360},70%,${52 + k * 14}%)`; const r = cell * (0.46 - Math.min(0.12, i * 0.004)); g.beginPath(); g.arc(ox + (s[0] + 0.5) * cell, oy + (s[1] + 0.5) * cell, r, 0, 7); g.fill(); });
        const hd = snake[0]; g.fillStyle = "#fff"; g.beginPath(); g.arc(ox + (hd[0] + 0.5 + DX[dir] * 0.14) * cell - DY[dir] * cell * 0.12, oy + (hd[1] + 0.5 + DY[dir] * 0.14) * cell + DX[dir] * cell * 0.12, cell * 0.07, 0, 7); g.arc(ox + (hd[0] + 0.5 + DX[dir] * 0.14) * cell + DY[dir] * cell * 0.12, oy + (hd[1] + 0.5 + DY[dir] * 0.14) * cell - DX[dir] * cell * 0.12, cell * 0.07, 0, 7); g.fill();
      }
    };
  });
