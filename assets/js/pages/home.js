import { $, $$, reduce } from "../core.js";

// Chapter index: a preview card follows the pointer and swaps with the row you hover (desktop only).
const peek = $("#peek");
const G = window.gsap;
if (peek && G && !reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
  const qx = G.quickTo(peek, "x", { duration: 0.55, ease: "power3" });
  const qy = G.quickTo(peek, "y", { duration: 0.55, ease: "power3" });
  const cards = $$(".peek-card", peek);
  G.set(peek, { scale: 0.6 });
  $$(".chapter").forEach((row) => {
    row.addEventListener("pointerenter", (e) => {
      cards.forEach((c) => c.classList.toggle("on", c.dataset.for === row.dataset.peek));
      peek.classList.add("on");
      G.to(peek, { scale: 1, duration: 0.6, ease: "power3" });
      qx(e.clientX + 36); qy(e.clientY - peek.offsetHeight / 2);
    });
    row.addEventListener("pointermove", (e) => { qx(e.clientX + 36); qy(e.clientY - peek.offsetHeight / 2); });
    row.addEventListener("pointerleave", () => { peek.classList.remove("on"); G.to(peek, { scale: 0.6, duration: 0.45, ease: "power3" }); });
  });
}

// Game pictures only move while their card is on screen.
const arc = $$(".arc-card");
if (arc.length) {
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("vis", e.isIntersecting)), { rootMargin: "80px" }); arc.forEach((c) => io.observe(c)); }
  else arc.forEach((c) => c.classList.add("vis"));
}
