import { $, fit, onFrame, reduce } from "../core.js";

const c = $("#stars");
if (c) {
  let g = fit(c), list = [], visible = true;
  const init = () => {
    g = fit(c);
    list = Array.from({ length: 180 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, p: Math.random() * 6, s: Math.random() * 0.02 + 0.005 }));
  };
  init();
  function draw() {
    if (!visible) return;
    const W = c.clientWidth, H = c.clientHeight;
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#fff";
    list.forEach((s) => {
      if (!reduce) s.p += s.s;
      g.globalAlpha = 0.35 + Math.sin(s.p) * 0.35;
      g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); g.fill();
    });
    g.globalAlpha = 1;
  }
  draw();
  if (!reduce) onFrame(draw);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(c);
  addEventListener("resize", () => { init(); draw(); });
}
