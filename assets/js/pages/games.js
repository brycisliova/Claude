import { $, $$, h, esc, onFrame, lockScroll, chipFilter, reduce, toast } from "../core.js";
import { REG, setCurrent, countPlay, progress } from "../games/shared.js";
import "../games/calm.js";
import "../games/play.js";
import "../games/puzzle.js";
import "../games/mind.js";
import "../games/create.js";
import "../games/words.js";
import "../games/together/memory.js";
import "../games/together/quiz.js";
import "../games/together/pop.js";
import "../games/together/atlas.js";
import "../games/together/party.js";
import "../games/together/geo.js";
import "../games/together/tod.js";
import "../games/together/tune.js";
import "../games/together/trivia.js";
import "../games/together/wchain.js";
import "../games/together/antakshari.js";
import "../games/together/four.js";
import "../games/together/duel.js";
import "../games/together/hunt.js";
import { MP } from "../games/together/common.js";
import { mountTogether } from "../mp/ui.js";

const gm = $("#gm"), panel = $("#gmPanel"), body = $("#gmBody");
const cards = $$(".gcard"), byId = (id) => cards.find((c) => c.dataset.id === id);
// Only cards on screen animate their picture; the rest stay paused.
if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("vis", e.isIntersecting)), { rootMargin: "80px" }); cards.forEach((c) => io.observe(c)); }
else cards.forEach((c) => c.classList.add("vis"));
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
let wantMode = "";
function startSolo(G, stage) {
  stage.innerHTML = G.body; G.api = null;
  try { G.api = G.init() || null; } catch (e) { console.error(e); stage.insertAdjacentHTML("beforeend", `<p class="muted">Sorry, this game could not start.</p>`); }
}
function setMode(G, mp, m) {
  const stage = $("#gmStage", body); if (!stage) return;
  $$(".gm-modes button", body).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
  try { G.api?.destroy?.(); } catch (e) { /* ignore */ } G.api = null; G.tg?.destroy(); G.tg = null;
  if (m === "solo") startSolo(G, stage);
  else { stage.innerHTML = ""; G.tg = mountTogether(stage, mp, { defs: MP }); }
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
  body.scrollTop = 0;
  gm.hidden = false; void gm.offsetWidth; gm.classList.add("on");
  lockScroll(true);
  G.api = null; G.tg = null;
  const mp = MP.get(id);
  if (mp) {
    body.innerHTML = `<div class="gm-modes" role="group" aria-label="How to play"><button type="button" data-m="solo" aria-pressed="true"${mp.only ? " hidden" : ""}>${mp.min === 2 && mp.max === 2 && id === "four" ? "Play the computer" : "Play solo"}</button><button type="button" data-m="together" aria-pressed="false">Play together</button></div><div class="gm-stage" id="gmStage"></div>`;
    $$(".gm-modes button", body).forEach((b) => b.addEventListener("click", () => setMode(G, mp, b.dataset.m)));
    setMode(G, mp, wantMode || (mp.only ? "together" : "solo"));
  } else startSolo(G, body);
  wantMode = "";
  unframe = onFrame((t) => G.api?.frame?.(t));
  let rw = body.clientWidth, rh = body.clientHeight;
  // Phones fire this every time the address bar slides away; only a real change is worth a redraw.
  ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(() => { const w = body.clientWidth, hh = body.clientHeight; if (Math.abs(w - rw) < 3 && Math.abs(hh - rh) < 90) return; rw = w; rh = hh; G.api?.resize?.(); }, 160); });
  ro.observe(body);
  setTimeout(() => panel.focus({ preventScroll: true }), 60);
  $("#gmFull").hidden = !(panel.requestFullscreen || panel.webkitRequestFullscreen);
}
function teardown() {
  try { cur.api?.destroy?.(); } catch (e) { /* ignore */ }
  try { cur.tg?.destroy(); } catch (e) { /* ignore */ }
  unframe?.(); ro?.disconnect(); cur.api = null;
  body.innerHTML = ""; cur = null; setCurrent(null);
}
function finishClose() {
  if (!cur) return;
  if (document.fullscreenElement) document.exitFullscreen?.();
  teardown();
  gm.classList.remove("on");
  gm.classList.remove("nofoot");
  setTimeout(() => { if (!cur) gm.hidden = true; }, reduce ? 0 : 320);
  lockScroll(false); paintProgress();
  lastFocus?.focus?.({ preventScroll: true });
}
function openGame(id, o = {}) {
  lastFocus = document.activeElement; wantMode = o.mode || "";
  if (location.hash !== "#" + HASH + id) { history.pushState(null, "", "#" + HASH + id); pushed = true; }
  render(id);
}
function okToLeave() {
  const rm = cur?.tg?.room;
  if (!rm || rm.left || !rm.started) return true;
  return confirm(rm.isHost ? "Leave the game? You are the host, so the room closes for everyone." : "Leave the game? Everyone else keeps playing.");
}
function renderJoin(code, auto) {
  if (cur) teardown();
  const G = { id: "join" }; cur = G; setCurrent(null);
  $("#gmTitle").textContent = "Join a game"; $("#gmHow").textContent = "Enter your name and the room code."; $("#gmCat").textContent = "Together"; $("#gmBest").textContent = "";
  gm.style.setProperty("--c", "var(--sky)"); body.innerHTML = ""; body.scrollTop = 0;
  gm.hidden = false; void gm.offsetWidth; gm.classList.add("on"); gm.classList.add("nofoot"); lockScroll(true);
  G.tg = mountTogether(body, null, { code, autoJoin: auto, defs: MP, onGame: (def) => { $("#gmTitle").textContent = def.title; $("#gmHow").textContent = "Playing together."; $("#gmCat").textContent = "Together"; const c = byId(def.id); if (c) gm.style.setProperty("--c", getComputedStyle(c).getPropertyValue("--c")); } });
  setTimeout(() => panel.focus({ preventScroll: true }), 60);
}
function openJoin(code, auto) {
  lastFocus = document.activeElement;
  if (location.hash.toLowerCase() !== "#r-" + code.toLowerCase()) { history.pushState(null, "", "#r-" + code); pushed = true; }
  renderJoin(code, auto);
}
function closeGame() {
  if (!okToLeave()) return;
  if (pushed) { pushed = false; history.back(); }
  else { history.replaceState(null, "", location.pathname + location.search); finishClose(); }
}
function route() {
  const id = location.hash.startsWith("#" + HASH) ? location.hash.slice(HASH.length + 1) : "";
  const join = /^#r-([A-Za-z0-9]{6})$/.exec(location.hash);
  if (join) { if (!cur || cur.id !== "join") renderJoin(join[1].toUpperCase(), false); }
  else if (id && REG.has(id) && byId(id)) { if (!cur || cur.id !== id) render(id); } else finishClose();
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
  if (!okToLeave()) return;
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
document.addEventListener("tg:room", (e) => { $(".gm-modes", body)?.classList.toggle("locked", !!e.detail); });
document.addEventListener("game:score", (e) => { if (cur && e.detail.id === cur.id) setBest(cur.id); });

/* ---- filter, featured pick, surprise ---- */
chipFilter($("#gChips"), (f) => { cards.forEach((c) => { c.hidden = !(f === "all" || (f === "friends" ? !!c.dataset.mp : f === "new" ? !!c.dataset.new : c.dataset.cat === f)); }); paintProgress(); });
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
const tgGame = $("#gtGame"), tgCode = $("#gtCode");
if (tgGame) {
  $("#gtCreate").addEventListener("click", () => openGame(tgGame.value, { mode: "together" }));
  const j = () => { const v = (tgCode.value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (v.length === 6) openJoin(v, true); else toast("A room code has six letters and numbers."); };
  $("#gtJoin").addEventListener("click", j); tgCode.addEventListener("keydown", (e) => { if (e.key === "Enter") j(); });
  tgCode.addEventListener("input", () => { const v = tgCode.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); tgCode.value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v; });
}
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
