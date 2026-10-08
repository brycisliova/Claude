import { $, $$, chipFilter } from "../core.js";

const papers = $$(".paper"), count = $("#libCount"), none = $("#libNone");
let tag = "all";
function apply() {
  const q = $("#paperSearch").value.trim().toLowerCase();
  let n = 0;
  papers.forEach((p) => {
    const hit = (tag === "all" || p.dataset.tags.split(" ").includes(tag)) && (!q || p.dataset.text.includes(q));
    p.hidden = !hit;
    if (hit) n++;
  });
  count.textContent = `${n} of ${papers.length} papers`;
  none.hidden = n > 0;
}
chipFilter($("#paperChips"), (f) => { tag = f; apply(); });
$("#paperSearch").addEventListener("input", apply);
// deep links like /library/#choice
const h = location.hash.slice(1);
if (h && $(`#paperChips [data-f="${h}"]`)) $(`#paperChips [data-f="${h}"]`).click();
apply();
