import { $, h, fit, pos, B, game, report } from "./shared.js";
import { ac, masterGain, reverbNode, blip, bowl, tone, PENTA, ready } from "../audio.js";

game("bubbles",
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
