import { $, $$, chipFilter } from "../core.js";

const tl = $("#tl"), prog = $("#tlProgress");
function upd() {
  const r = tl.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
  prog.style.height = p * r.height + "px";
}
addEventListener("scroll", upd, { passive: true });
addEventListener("resize", upd);
upd();
chipFilter($("#tlChips"), (f) => {
  $$(".event", tl).forEach((ev) => {
    ev.hidden = !(f === "all" || ev.dataset.k === f);
    ev.classList.add("in");
  });
  upd();
});
