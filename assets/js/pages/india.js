// The India and the world data page: animated charts, the data map, candles and the filterable news record.
// Everything is drawn from the figures embedded in the page (#vzData); nothing is fetched except the map outlines.
import { $, $$, chipFilter, reduce } from "../core.js";

const NS = "http://www.w3.org/2000/svg";
const svg = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const DATA = (() => { try { return JSON.parse($("#vzData")?.textContent || "{}"); } catch (e) { return {}; } })();
const fmt = (n) => Number(n).toLocaleString("en-IN");

// Run fn once when el scrolls into view (straight away when motion is reduced).
function whenSeen(el, fn) {
  if (!el) return; if (reduce || !("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: 0.2 });
  io.observe(el);
}

/* ---- one hundred people: "N in 100" pictograms ---- */
$$(".dots100").forEach((el) => {
  const n = Math.round(+el.dataset.n || 0), box = el.querySelector(".d100-grid"); if (!box) return;
  for (let i = 0; i < 100; i++) { const d = document.createElement("i"); d.style.setProperty("--k", i); if (i < n) d.className = "on"; box.appendChild(d); }
  whenSeen(el, () => el.classList.add("go"));
});

/* ---- animated bars ---- */
$$(".vbars, .hbars").forEach((el) => whenSeen(el, () => el.classList.add("go")));

/* ---- line and area chart (for example reported killings per year) ---- */
function lineChart(el, o) {
  const W = 760, H = 320, m = { l: 46, r: 16, t: 18, b: 34 }, pts = o.points, max = Math.max(...pts.map((p) => p.v)) * 1.12;
  const x = (i) => m.l + (i * (W - m.l - m.r)) / Math.max(1, pts.length - 1), y = (v) => H - m.b - (v / max) * (H - m.t - m.b);
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": o.label, class: "lc" }, el);
  const step = max > 200 ? 100 : max > 80 ? 50 : 20;
  for (let v = 0; v <= max; v += step) { svg("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: "lc-grid" }, s); svg("text", { x: m.l - 8, y: y(v) + 4, class: "lc-t lc-y" }, s).textContent = fmt(v); }
  pts.forEach((p, i) => { if (i % Math.ceil(pts.length / 9) === 0 || i === pts.length - 1) svg("text", { x: x(i), y: H - 10, class: "lc-t lc-x" }, s).textContent = p.l; });
  const d = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join("");
  svg("path", { d: d + `L${x(pts.length - 1)} ${y(0)}L${x(0)} ${y(0)}Z`, class: "lc-area" }, s);
  const line = svg("path", { d, class: "lc-line", pathLength: 100 }, s);
  const dots = pts.map((p, i) => { const c = svg("circle", { cx: x(i), cy: y(p.v), r: 4.5, class: "lc-dot", tabindex: 0, "aria-label": `${p.l}: ${fmt(p.v)}` }, s); c.style.setProperty("--k", i); return c; });
  const tip = document.createElement("div"); tip.className = "lc-tip"; tip.hidden = true; el.appendChild(tip);
  const show = (i) => { const p = pts[i]; tip.hidden = false; tip.innerHTML = `<b>${fmt(p.v)}</b> ${p.l}${p.note ? `<br><span>${p.note}</span>` : ""}`; tip.style.left = (x(i) / W) * 100 + "%"; tip.style.top = (y(p.v) / H) * 100 + "%"; dots.forEach((d, k) => d.classList.toggle("on", k === i)); };
  dots.forEach((c, i) => { c.addEventListener("pointerenter", () => show(i)); c.addEventListener("focus", () => show(i)); c.addEventListener("click", () => show(i)); });
  el.addEventListener("pointerleave", () => { tip.hidden = true; dots.forEach((d) => d.classList.remove("on")); });
  whenSeen(el, () => el.classList.add("go"));
  void line;
}
$$("[data-line]").forEach((el) => { const set = DATA[el.dataset.line]; if (set) lineChart(el, set); });

/* ---- candles: one small light for each person reported killed ---- */
$$(".candles").forEach((el) => {
  const n = Math.min(1200, +el.dataset.n || 0); const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) { const c = document.createElement("i"); c.style.setProperty("--k", i); c.style.setProperty("--d", ((i * 37) % 100) / 100 + "s"); c.style.setProperty("--t", 2.2 + ((i * 53) % 90) / 100 + "s"); frag.appendChild(c); }
  el.querySelector(".candle-field")?.appendChild(frag); whenSeen(el, () => el.classList.add("go"));
});

/* ---- the world map ---- */
async function worldMap(box) {
  const cfg = DATA.map; if (!cfg) return;
  let m; try { m = await fetch(new URL("../../data/worldmap.json", import.meta.url)).then((r) => r.json()); } catch (e) { box.querySelector(".wm-load").textContent = "The map could not load. The figures below still apply."; return; }
  const s = svg("svg", { viewBox: `0 0 ${m.w} ${m.h}`, role: "img", "aria-label": cfg.label, class: "wm" });
  const defs = svg("defs", {}, s); svg("path", { d: m.o }, svg("clipPath", { id: "wmClip" }, defs));
  svg("path", { d: m.o, class: "wm-sea" }, s); const g = svg("g", { "clip-path": "url(#wmClip)" }, s);
  const paths = new Map(); m.countries.forEach((c) => { const p = svg("path", { d: c.d, class: "wm-c", "data-i": c.i, tabindex: -1 }, g); paths.set(c.i, { p, c }); });
  box.querySelector(".wm-load")?.remove(); box.querySelector(".wm-stage").appendChild(s);
  const tip = box.querySelector(".wm-tip"), info = box.querySelector(".wm-info"); let layer = cfg.layers[0].id;
  const LAB = cfg.labels;
  function paint() {
    const L = cfg.layers.find((l) => l.id === layer);
    paths.forEach(({ p, c }, iso) => { const st = L.status[iso]; p.setAttribute("class", "wm-c" + (st ? " s-" + st : " s-none")); p.style.transitionDelay = reduce ? "0s" : (c.c[0] / m.w) * 0.9 + "s"; });
    box.querySelectorAll("[data-count-n]").forEach((el) => { const k = el.dataset.countN; el.textContent = L.counts?.[k] ?? ""; });
    box.querySelector(".wm-legend").innerHTML = L.legend.map(([k, t]) => `<span><i class="s-${k}"></i>${t}</span>`).join("");
    box.querySelector(".wm-note").textContent = L.note || "";
  }
  const showTip = (iso, ev) => { const e = paths.get(iso); if (!e) return; const L = cfg.layers.find((l) => l.id === layer), st = L.status[iso]; tip.hidden = false; tip.innerHTML = `<b>${e.c.n}</b><br>${st ? LAB[st] || st : L.none || "No data in this layer"}`; const r = box.querySelector(".wm-stage").getBoundingClientRect(); const px = ev ? ev.clientX - r.left : (e.c.c[0] / m.w) * r.width, py = ev ? ev.clientY - r.top : (e.c.c[1] / m.h) * r.height; tip.style.left = Math.min(r.width - 150, Math.max(4, px + 12)) + "px"; tip.style.top = Math.max(4, py - 8) + "px"; info.textContent = `${e.c.n}: ${st ? LAB[st] || st : L.none || "no data"}`; };
  g.addEventListener("pointermove", (ev) => { const iso = ev.target.dataset?.i; if (iso) showTip(iso, ev); else tip.hidden = true; });
  g.addEventListener("click", (ev) => { const iso = ev.target.dataset?.i; if (iso) showTip(iso, ev); });
  g.addEventListener("pointerleave", () => { tip.hidden = true; });
  chipFilter(box.querySelector(".wm-chips"), (id) => { layer = id; paint(); });
  paint(); whenSeen(box, () => box.classList.add("go"));
}
$$(".wmap").forEach(worldMap);

/* ---- the news and incident record: filter by kind, year and place ---- */
const rec = $("#recList");
if (rec) {
  const items = $$(".rec", rec), kind = $("#recKind"), year = $("#recYear"), state = $("#recState"), q = $("#recQ"), count = $("#recCount"), more = $("#recMore");
  let shown = 0; const PAGE = 24;
  const match = (el) => (kind.value === "all" || el.dataset.k === kind.value) && (year.value === "all" || el.dataset.y === year.value) && (state.value === "all" || el.dataset.s === state.value) && (!q.value || el.dataset.q.includes(q.value.toLowerCase()));
  function apply(reset = true) {
    if (reset) shown = PAGE; let n = 0, vis = 0;
    items.forEach((el) => { const ok = match(el); if (ok) n++; const show = ok && vis < shown; if (show) vis++; el.hidden = !show; if (show) { el.classList.remove("in"); void el.offsetWidth; el.classList.add("in"); } });
    count.textContent = `${fmt(n)} ${n === 1 ? "entry" : "entries"}`; more.hidden = vis >= n;
  }
  [kind, year, state].forEach((s) => s.addEventListener("change", () => apply())); q.addEventListener("input", () => apply());
  more.addEventListener("click", () => { shown += PAGE; apply(false); }); apply();
}

/* ---- in-page index highlights the section you are reading ---- */
const nav = $("#vzNav");
if (nav && "IntersectionObserver" in window) {
  const links = $$("a", nav), map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.removeAttribute("aria-current")); map.get(e.target.id)?.setAttribute("aria-current", "true"); } }), { rootMargin: "-35% 0px -55% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
