import { $, $$ } from "../core.js";

const tabs = $$(".subtab");
function select(id, push) {
  const t = tabs.find((x) => x.dataset.sub === id) || tabs[0];
  tabs.forEach((x) => { x.setAttribute("aria-selected", String(x === t)); x.tabIndex = x === t ? 0 : -1; });
  $$(".subpanel").forEach((p) => p.classList.toggle("active", p.id === "sub-" + t.dataset.sub));
  if (push) history.replaceState(null, "", "#" + t.dataset.sub);
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => select(t.dataset.sub, true));
  t.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const n = tabs[(i + d + tabs.length) % tabs.length];
    n.focus(); select(n.dataset.sub, true);
  });
});
select(location.hash.slice(1), false);
addEventListener("hashchange", () => select(location.hash.slice(1), false));
