import { $, $$, chipFilter } from "../core.js";

const films = $$(".film"), count = $("#filmCount");
chipFilter($("#filmChips"), (f) => {
  let n = 0;
  films.forEach((el) => {
    const hit = f === "all" || el.dataset.f.split(" ").includes(f);
    el.hidden = !hit;
    if (hit) n++;
  });
  count.textContent = `${n} title${n === 1 ? "" : "s"}`;
});
