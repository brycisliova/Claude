import { $, $$, chipFilter } from "../core.js";

const list = $("#nwList"), count = $("#nwCount"), more = $("#nwMore"), general = $("#nwGeneral");
if (list) {
  const items = $$(".nw", list), PAGE = 40; let f = "all", shown = PAGE;
  const hit = (el) => f === "all" || el.dataset.k === f || (f === "good" && el.dataset.good === "1");
  function apply() {
    let n = 0, vis = 0;
    items.forEach((el) => { const ok = hit(el); if (ok) n++; const show = ok && vis < shown; if (show) vis++; el.hidden = !show; });
    count.textContent = `${n} ${n === 1 ? "story" : "stories"}`;
    more.hidden = vis >= n; if (general) general.hidden = f !== "good";
  }
  chipFilter($("#nwChips"), (k) => { f = k; shown = PAGE; apply(); });
  more.addEventListener("click", () => { shown += PAGE; apply(); });
  apply();
}
