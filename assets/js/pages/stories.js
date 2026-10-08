import { $, h, base, fmtDate, reveal } from "../core.js";

const cols = ["r", "o", "y", "g", "b", "v", "pink", "sky"];
const kindLabel = { story: "A story", hope: "Words of hope" };
const wall = $("#wall");

fetch(`${base}data/wall.json`, { cache: "no-cache" })
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => [])
  .then((list) => {
    if (!Array.isArray(list) || !list.length) return;
    wall.innerHTML = "";
    list.forEach((m, i) => {
      const n = h("article", { class: "card note reveal", style: `--c:var(--${cols[i % 8]});--i:${Math.min(i, 8)}` });
      const p = h("p"); p.textContent = m.text || "";
      const s = h("small"); s.textContent = `${kindLabel[m.kind] || "Shared"}${m.date ? " · " + fmtDate(m.date) : ""}`;
      n.append(p, s);
      wall.appendChild(n);
    });
    reveal(wall);
  });
