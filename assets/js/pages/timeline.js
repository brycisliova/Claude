import { $, $$, chipFilter } from "../core.js";

chipFilter($("#tlChips"), (f) => {
  $$("#tl .event").forEach((ev) => {
    ev.hidden = !(f === "all" || ev.dataset.k === f);
    ev.classList.add("in");
  });
  window.ScrollTrigger?.refresh();
});
