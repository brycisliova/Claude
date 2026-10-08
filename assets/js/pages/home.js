import { $, $$, fit, cssVar, onFrame, reduce } from "../core.js";

/* Flowing spectrum threads behind the hero */
const c = $("#ribbons");
if (c) {
  let g = fit(c), visible = true, W = c.clientWidth, H = c.clientHeight;
  const stops = ["--r", "--o", "--y", "--g", "--b", "--v", "--pink"];
  let grad = null;
  const N = 54;
  function build() {
    W = c.clientWidth; H = c.clientHeight;
    grad = g.createLinearGradient(0, 0, W, 0);
    stops.forEach((s, i) => grad.addColorStop(i / (stops.length - 1), cssVar(s)));
  }
  build();
  function draw(t) {
    if (!visible) return;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = grad; g.lineWidth = 1;
    const tt = reduce ? 4 : t / 1000;
    for (let i = 0; i < N; i++) {
      const o = (i - N / 2) / N;
      g.globalAlpha = 0.18 + 0.4 * (1 - Math.abs(o) * 1.6);
      g.beginPath();
      for (let x = -10; x <= W + 10; x += 14) {
        const u = x / W;
        const y = H * 0.62 + o * H * 0.55 * (0.55 + 0.45 * Math.sin(u * Math.PI + tt * 0.22)) + Math.sin(x * 0.0042 + tt * 0.55 + i * 0.11) * H * 0.1 * (0.25 + u);
        x === -10 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  draw(0);
  if (!reduce) onFrame(draw);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(c);
  addEventListener("resize", () => { g = fit(c); build(); draw(performance.now()); });
  addEventListener("themechange", () => { build(); draw(performance.now()); });
}

/* Gentle parallax on the aurora */
const aurora = $(".aurora");
if (aurora && !reduce && matchMedia("(hover:hover)").matches) {
  addEventListener("pointermove", (e) => {
    const x = (e.clientX / innerWidth - 0.5) * 30, y = (e.clientY / innerHeight - 0.5) * 30;
    aurora.style.transform = `translate(${x}px,${y}px)`;
  }, { passive: true });
}

/* Rotating thoughts */
const q = $("#homeQuote");
if (q) {
  const list = JSON.parse(q.dataset.quotes);
  const cite = $("#homeQuoteBy");
  let i = Math.floor(Math.random() * list.length);
  const set = () => { q.textContent = "“" + list[i][0] + "”"; cite.textContent = list[i][1]; };
  set();
  const next = () => {
    q.style.opacity = 0; q.style.filter = "blur(8px)";
    setTimeout(() => { i = (i + 1) % list.length; set(); q.style.opacity = 1; q.style.filter = "none"; }, 650);
  };
  $("#homeQuoteNext")?.addEventListener("click", next);
  setInterval(() => { if (!document.hidden) next(); }, 12000);
}
