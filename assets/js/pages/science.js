import { $, fit, onFrame, reduce } from "../core.js";

const c = $("#dna");
if (c) {
  let g = fit(c), cols = [], visible = true;
  const readCols = () => { cols = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787", "#E40303", "#FF8C00"]; };
  readCols();
  function draw(ts) {
    if (!visible) return;
    const t = reduce ? 1 : ts / 1000, W = c.clientWidth, H = c.clientHeight;
    g.clearRect(0, 0, W, H);
    const line = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#000";
    const n = Math.floor(W / 14);
    for (let i = 0; i < n; i++) {
      const x = i * 14 + 7, a = i * 0.32 + t * 1.1, s = Math.sin(a), z = Math.cos(a);
      const y1 = H / 2 + s * H * 0.36, y2 = H / 2 - s * H * 0.36;
      g.strokeStyle = line; g.globalAlpha = 0.12 + Math.abs(z) * 0.18; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y2); g.stroke();
      g.globalAlpha = 0.95;
      g.fillStyle = cols[i % 8]; g.beginPath(); g.arc(x, y1, 3 + z * 1.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = cols[(i + 4) % 8]; g.beginPath(); g.arc(x, y2, 3 - z * 1.5, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }
  draw(1000);
  if (!reduce) onFrame(draw);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(c);
  addEventListener("resize", () => { g = fit(c); draw(performance.now()); });
  addEventListener("themechange", () => { readCols(); });
}
