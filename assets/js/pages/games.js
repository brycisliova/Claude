import { $, $$, h, esc, onFrame, lockScroll, chipFilter, reduce } from "../core.js";
import { REG, setCurrent, countPlay, progress } from "../games/shared.js";
import "../games/calm.js";
import "../games/play.js";
import "../games/puzzle.js";
import "../games/mind.js";
import "../games/create.js";

const gm = $("#gm"), panel = $("#gmPanel"), body = $("#gmBody");
const cards = $$(".gcard"), byId = (id) => cards.find((c) => c.dataset.id === id);
const HASH = "g-";
let cur = null, pushed = false, lastFocus = null, unframe = null, ro = null;

/* ---- saved progress shown on the cards ---- */
function paintProgress() {
  const d = progress();
  cards.forEach((c) => {
    const id = c.dataset.id, plays = d.plays[id] || 0, best = d.best[id], meta = META[id];
    $(".gc-played", c).hidden = !plays;
    const b = $(".gc-best", c);
    b.hidden = best == null; if (best != null) b.textContent = `Best ${best}${meta?.unit ? " " + meta.unit : ""}`;
  });
  const total = Object.values(d.plays).reduce((a, n) => a + n, 0), kinds = Object.keys(d.plays).length;
  $("#gCount").textContent = shown() + " games" + (total ? ` · you have tried ${kinds} of ${cards.length}` : "");
}
// units for saved bests, read from the card's data so the catalogue stays the single source
const META = {};
cards.forEach((c) => { META[c.dataset.id] = { unit: c.dataset.unit || "" }; });
const shown = () => cards.filter((c) => !c.hidden).length;

/* ---- the games window ---- */
function setBest(id) {
  const d = progress(), v = d.best[id], u = META[id]?.unit;
  $("#gmBest").textContent = v == null ? "" : `Your best: ${v}${u ? " " + u : ""}`;
}
function render(id) {
  const G = REG.get(id), card = byId(id);
  if (!G || !card) return;
  if (cur) teardown();
  cur = G; setCurrent(id); countPlay(id);
  $("#gmTitle").textContent = $(".gc-t", card).textContent;
  $("#gmHow").textContent = $(".gc-how", card).textContent;
  $("#gmCat").textContent = $(".gc-meta span", card).textContent;
  gm.style.setProperty("--c", getComputedStyle(card).getPropertyValue("--c"));
  setBest(id);
  body.innerHTML = G.body; body.scrollTop = 0;
  gm.hidden = false; void gm.offsetWidth; gm.classList.add("on");
  lockScroll(true);
  G.api = null;
  try { G.api = G.init() || null; } catch (e) { console.error(e); body.insertAdjacentHTML("beforeend", `<p class="muted">Sorry, this game could not start.</p>`); }
  unframe = onFrame((t) => G.api?.frame?.(t));
  ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(() => G.api?.resize?.(), 120); });
  ro.observe(body);
  setTimeout(() => $("#gmClose").focus({ preventScroll: true }), 60);
  $("#gmFull").hidden = !(panel.requestFullscreen || panel.webkitRequestFullscreen);
}
function teardown() {
  try { cur.api?.destroy?.(); } catch (e) { /* ignore */ }
  unframe?.(); ro?.disconnect(); cur.api = null;
  body.innerHTML = ""; cur = null; setCurrent(null);
}
function finishClose() {
  if (!cur) return;
  if (document.fullscreenElement) document.exitFullscreen?.();
  teardown();
  gm.classList.remove("on");
  setTimeout(() => { if (!cur) gm.hidden = true; }, reduce ? 0 : 320);
  lockScroll(false); paintProgress();
  lastFocus?.focus?.({ preventScroll: true });
}
function openGame(id) {
  lastFocus = document.activeElement;
  if (location.hash !== "#" + HASH + id) { history.pushState(null, "", "#" + HASH + id); pushed = true; }
  render(id);
}
function closeGame() {
  if (pushed) { pushed = false; history.back(); }
  else { history.replaceState(null, "", location.pathname + location.search); finishClose(); }
}
function route() {
  const id = location.hash.startsWith("#" + HASH) ? location.hash.slice(HASH.length + 1) : "";
  if (id && REG.has(id) && byId(id)) { if (!cur || cur.id !== id) render(id); } else finishClose();
}
addEventListener("popstate", route);
addEventListener("hashchange", route);

cards.forEach((c) => c.addEventListener("click", () => openGame(c.dataset.id)));
$("#gmClose").addEventListener("click", closeGame);
gm.addEventListener("pointerdown", (e) => { if (e.target === gm) closeGame(); });
$("#gmFull").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen(); else (panel.requestFullscreen || panel.webkitRequestFullscreen).call(panel);
});
function step(d) {
  const vis = cards.filter((c) => !c.hidden), i = vis.findIndex((c) => c.dataset.id === cur?.id);
  const next = vis[(i + d + vis.length) % vis.length];
  if (next) { render(next.dataset.id); history.replaceState(null, "", "#" + HASH + next.dataset.id); }
}
$("#gmPrev").addEventListener("click", () => step(-1));
$("#gmNext").addEventListener("click", () => step(1));

document.addEventListener("keydown", (e) => {
  if (!cur) return;
  if (e.key === "Escape") { if (!document.fullscreenElement) { e.preventDefault(); closeGame(); } return; }
  if (e.key === "Tab") {
    const f = $$('button:not([disabled]),input:not([disabled]),select,[href],[tabindex]:not([tabindex="-1"])', gm).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  const t = e.target;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
  if (cur.api?.key?.(e)) e.preventDefault();
});
document.addEventListener("game:score", (e) => { if (cur && e.detail.id === cur.id) setBest(cur.id); });

/* ---- filter, featured pick, surprise ---- */
chipFilter($("#gChips"), (f) => { cards.forEach((c) => { c.hidden = !(f === "all" || c.dataset.cat === f); }); paintProgress(); });
const day = Math.floor(Date.now() / 864e5), pick = cards[day % cards.length];
$("#gFeat").hidden = false;
$("#gFeatT").textContent = $(".gc-t", pick).textContent;
$("#gFeatH").textContent = $(".gc-how", pick).textContent;
$("#gFeatGo").addEventListener("click", () => openGame(pick.dataset.id));
$("#gSurprise").addEventListener("click", () => {
  const d = progress(), fresh = cards.filter((c) => !d.plays[c.dataset.id]), pool = fresh.length ? fresh : cards;
  openGame(pool[Math.floor(Math.random() * pool.length)].dataset.id);
});
paintProgress();
route();

/* ---- rotating thoughts ---- */
const q = $("#qText");
if (q) {
  const list = JSON.parse(q.dataset.quotes);
  let i = Math.floor(Math.random() * list.length);
  const set = () => { q.textContent = list[i][0]; $("#qBy").textContent = list[i][1]; };
  set();
  const next = () => { q.style.opacity = 0; q.style.filter = "blur(6px)"; setTimeout(() => { i = (i + 1) % list.length; set(); q.style.opacity = 1; q.style.filter = "none"; }, 600); };
  $("#qNext").addEventListener("click", next);
  setInterval(() => { if (!document.hidden && !cur) next(); }, 14000);
}
