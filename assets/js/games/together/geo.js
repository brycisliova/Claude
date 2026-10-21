// Where in the world? Look at a photograph, drop a pin on the map, and see how far off you were. The line from your
// pin to the real place is coloured by distance: bright green when you are close, darker and redder the further away.
// Solo for a personal best, or in a room of 2 to 8 where everyone guesses at once.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$, report } from "../shared.js";
import { pickFresh } from "../fresh.js";
import { GeoMap, loadWorld, haversine, kmColor, scoreFor } from "../geomap.js";
import { LOCS } from "../../data/geo-locs.js";
import { GEO_PHOTOS } from "../../data/geo-photos.js";
import { tone, PENTA, ready } from "../../audio.js";

const photo = (id) => new URL(`../../../img/geo/${id}.webp`, import.meta.url).href;
const POOL = LOCS.filter((l) => GEO_PHOTOS[l.id]);
const REGION = { world: () => true, india: (l) => l.country === "India", abroad: (l) => l.country !== "India", queer: (l) => l.cat === "queer", nature: (l) => l.cat === "nature" };
const TIME = { 1: 90000, 0.6: 45000, 2: 180000 };
const RANKS = [[0.85, "Human GPS"], [0.65, "Seasoned traveller"], [0.45, "Armchair explorer"], [0.25, "Weekend tourist"], [0, "Lost, but curious"]];

/* ---------- host ---------- */
function makeHost(ctx, solo) {
  let S = null;
  const ids = () => S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left; });
  const pubLoc = (l) => ({ id: l.id, cat: l.cat, diff: l.diff });
  const view = (extra) => ({ ph: S.ph, i: S.i, total: S.total, order: S.order, scores: S.scores, tl: Math.max(0, S.dl - Date.now()), ms: S.ms, done: Object.keys(S.sub), loc: S.loc ? pubLoc(S.loc) : null, ...extra });
  function ask() {
    S.loc = S.locs[S.i]; S.sub = {}; S.hint = {}; S.ph = "g"; S.ms = S.time; S.dl = Date.now() + S.ms; clearTimeout(S.tm); S.tm = ctx.after(S.ms + 400, reveal); ctx.push(view());
  }
  function reveal() {
    if (!S || S.ph !== "g") return; clearTimeout(S.tm); S.ph = "r";
    const L = S.loc, rows = [];
    S.order.forEach((pid) => {
      const s = S.sub[pid]; if (!s) { rows.push({ pid, none: true, pts: 0 }); return; }
      const km = haversine(L, s); let pts = scoreFor(km); if (S.hint[pid]) pts = Math.round(pts * 0.7);
      const bonus = pts > 0 ? Math.round(250 * Math.max(0, 1 - s.t / S.ms)) : 0;
      S.scores[pid] = (S.scores[pid] || 0) + pts + bonus; S.log[pid].push(Math.round(km));
      rows.push({ pid, lat: s.lat, lon: s.lon, km: Math.round(km), pts: pts + bonus, hint: !!S.hint[pid] });
    });
    ctx.push(view({ rv: { truth: { lat: L.lat, lon: L.lon, name: L.name }, place: L.place, fact: L.fact, rows } }));
    if (!(solo)) S.tm = ctx.after(14000, next);
  }
  function next() { if (!S || S.ph !== "r") return; clearTimeout(S.tm); S.i++; if (S.i >= S.total) { S.ph = "end"; ctx.push(view({ log: S.log })); } else ask(); }
  return {
    start(o) {
      let pool = POOL.filter(REGION[o.region || "world"] || REGION.world); const total = Math.min(+o.rounds || 5, pool.length);
      if (pool.length < total) pool = POOL;
      const locs = pickFresh("wwa-geo-seen-" + (o.region || "world"), pool, (l) => l.id, total);
      S = { locs, total: locs.length, i: 0, order: ctx.players.map((p) => p.id), scores: {}, log: {}, sub: {}, hint: {}, ph: "g", ms: 0, dl: 0, tm: null, time: TIME[o.time] || 90000, loc: null };
      S.order.forEach((id) => { S.scores[id] = 0; S.log[id] = []; }); ask();
    },
    act(pid, a) {
      if (!S) return;
      if (a.a === "next") { if (solo) next(); return; }
      if (S.ph !== "g" || !S.order.includes(pid)) return;
      if (a.a === "hint") { if (!S.hint[pid]) { S.hint[pid] = true; ctx.reply(pid, { hint: S.loc.country }); } return; }
      if (a.a === "guess" && !S.sub[pid]) {
        const lat = +a.lat, lon = +a.lon; if (!(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180)) return;
        S.sub[pid] = { lat, lon, t: Math.min(S.ms, Date.now() - (S.dl - S.ms)) }; ctx.push(view());
        const live = ids(); if (live.every((id) => S.sub[id])) { clearTimeout(S.tm); S.tm = ctx.after(500, reveal); }
      }
    },
    left() { if (S && S.ph === "g" && ids().every((id) => S.sub[id]) && ids().length) { clearTimeout(S.tm); S.tm = ctx.after(300, reveal); } },
    destroy() { if (S) clearTimeout(S.tm); }
  };
}

/* ---------- view ---------- */
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp geo"><div class="mp-head"><p class="mp-turn" id="geInfo">Loading the map…</p><div class="mp-tl"><i id="geTl"></i></div></div>
  <div class="geo-stage"><figure class="geo-photo" id="geoFig"><img id="geoImg" alt="A photograph of a place somewhere in the world" decoding="async"><span class="geo-cat" id="geoCat"></span><button class="geo-zoom" id="geoZoomImg" type="button" aria-label="Show the whole photo">Fit</button><figcaption id="geoCredit"></figcaption></figure>
  <div class="geo-mapwrap"><canvas id="geoMap" class="geo-map" tabindex="0" role="application" aria-label="World map. Tap to drop a pin. Arrow keys move the map, plus and minus zoom, Enter drops a pin in the middle."></canvas><div class="geo-ctl"><button type="button" id="geoIn" aria-label="Zoom in">+</button><button type="button" id="geoOut" aria-label="Zoom out">−</button><button type="button" id="geoHome" aria-label="Reset the map">⌂</button></div><p class="geo-legend" aria-hidden="true"><span>close</span><i></i><span>far</span></p></div></div>
  <div class="geo-actions"><button class="btn btn-primary" id="geoGo" type="button" disabled><span class="btn-t">Drop a pin to guess</span></button><button class="btn btn-ghost" id="geoHint" type="button"><span class="btn-t">Hint: the country (−30%)</span></button><span class="geo-status" id="geoStatus" role="status"></span></div>
  <div id="geoRv"></div><ul class="mp-score geo-score" id="geoScore"></ul><details class="at-how"><summary>How to play</summary><ul><li>Look at the photograph, then tap the map where you think it was taken. Drag to move the map, pinch or use + and − to zoom.</li><li>Press Guess to lock your pin in. In a room, everyone guesses at the same time.</li><li>You score up to 5,000 points: the closer, the more. Within 25 km is a perfect 5,000. Quick guesses earn a small bonus.</li><li>After each round the real place is marked with a star, and a line from your pin shows how far off you were. The line is bright green when you are close and gets darker and redder the further you are.</li><li>The hint tells you the country but costs 30% of that round's points. Keep score by adding up your rounds.</li></ul></details><div id="geoEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, map = null, pin = null, locked = false, roundKey = "", hinted = false, dead = false;
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || "Player";
  const onMsg = (m) => { if (m?.hint) { hinted = true; $("#geoHint").disabled = true; $("#geoStatus").textContent = `Hint: it is in ${m.hint}. This round is worth 30% less.`; } };
  if (api.room) api.room.on("msg", onMsg); else api.onMsg?.(onMsg);
  loadWorld().then((w) => {
    if (dead) return; map = new GeoMap($("#geoMap"), w);
    map.on("pick", (p) => { if (locked || st?.ph !== "g") return; pin = p; const b = $("#geoGo"); b.disabled = false; b.querySelector(".btn-t").textContent = "Guess here"; });
    $("#geoIn").addEventListener("click", () => map.zoomBy(0.6)); $("#geoOut").addEventListener("click", () => map.zoomBy(-0.6)); $("#geoHome").addEventListener("click", () => map.home());
    if (st) paint(true);
  }, () => { $("#geInfo").textContent = "Could not load the map. Check your connection and reopen the game."; });
  $("#geoGo").addEventListener("click", () => { if (!pin || locked || st?.ph !== "g") return; locked = true; map?.setLocked(true); api.act({ a: "guess", lat: pin.lat, lon: pin.lon }); $("#geoGo").disabled = true; $("#geoGo").querySelector(".btn-t").textContent = "Locked in"; $("#geoStatus").textContent = solo ? "" : "Waiting for the others…"; });
  $("#geoHint").addEventListener("click", () => { if (hinted || locked || st?.ph !== "g") return; api.act({ a: "hint" }); });
  $("#geoZoomImg").addEventListener("click", () => $("#geoFig").classList.toggle("fit"));
  const credit = (id) => { const c = GEO_PHOTOS[id]; return c ? `Photo: <a href="${esc(c.pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a> by ${esc(c.author)}, ${esc(c.license)}, via Wikimedia Commons` : ""; };

  function paint(force) {
    const s = st; if (!s) return;
    $("#geInfo").innerHTML = s.ph === "end" ? "Game over" : `Round <b>${s.i + 1}</b> of ${s.total}`;
    const key = s.i + ":" + (s.loc?.id || "");
    if (s.ph !== "end" && (key !== roundKey || force) && map) {
      if (key !== roundKey) { pin = null; locked = false; hinted = false; roundKey = key; map.clearResult(); map.setLocked(false); }
      const img = $("#geoImg"); img.src = photo(s.loc.id); $("#geoCat").textContent = { landmark: "Landmark", nature: "Nature", city: "City", india: "India", queer: "Queer history", street: "Street" }[s.loc.cat] || ""; $("#geoFig").classList.remove("fit");
      const b = $("#geoGo"); b.disabled = true; b.querySelector(".btn-t").textContent = "Drop a pin to guess"; $("#geoHint").disabled = false; $("#geoStatus").textContent = ""; $("#geoRv").innerHTML = ""; $("#geoCredit").innerHTML = "";
    }
    const me0 = me();
    if (s.ph === "g") { const n = (s.done || []).length; if (locked && !solo) $("#geoStatus").textContent = `Locked in. ${n} of ${s.order.length} guesses are in.`; if (!(s.done || []).includes(me0) && locked && !solo && n === 0) { /* waiting */ } }
    if (s.ph === "r" && s.rv) {
      const rv = s.rv; locked = true; $("#geoCredit").innerHTML = credit(s.loc.id); $("#geoGo").disabled = true; $("#geoHint").disabled = true; $("#geoStatus").textContent = "";
      if (map && !map.result) map.showResult({ truth: rv.truth, guesses: rv.rows.filter((r) => !r.none).map((r) => ({ pos: { lat: r.lat, lon: r.lon }, km: r.km, color: s.order.length > 1 ? (byId(api, r.pid)?.color != null ? colourOf(byId(api, r.pid)) : null) : null, label: s.order.length > 1 ? `${name(r.pid)} · ${fmt(r.km)} km` : `${fmt(r.km)} km` })) });
      const rows = rv.rows.slice().sort((a, b) => (b.pts || 0) - (a.pts || 0)).map((r) => r.none ? `<li><span>${dot(byId(api, r.pid) || { color: 0, name: "?" })}${esc(name(r.pid))}</span><span class="muted">no guess</span><b>0</b></li>` : `<li><span>${dot(byId(api, r.pid) || { color: 0, name: "?" })}${esc(name(r.pid))}</span><span class="geo-km"><i style="background:${kmColor(r.km)}"></i>${fmt(r.km)} km${r.hint ? " (hint)" : ""}</span><b>+${fmt(r.pts)}</b></li>`).join("");
      $("#geoRv").innerHTML = `<div class="geo-rv"><h3>${esc(rv.truth.name)}</h3><p class="muted">${esc(rv.place)}</p><p>${esc(rv.fact)}</p><ul class="geo-rows">${rows}</ul>${solo ? `<div class="row"><button class="btn btn-primary" id="geoNext" type="button"><span class="btn-t">${s.i + 1 >= s.total ? "See my result" : "Next place"}</span></button></div>` : `<p class="muted small">The next place starts in a moment.</p>`}</div>`;
      $("#geoNext")?.addEventListener("click", () => api.act({ a: "next" })); $("#geoNext")?.focus({ preventScroll: true });
    }
    $("#geoScore").innerHTML = s.order.map((id) => { const p = byId(api, id) || { color: 0, name: id }; return `<li>${dot(p)}<span>${esc(p.name)}</span><b>${fmt(s.scores[id] || 0)}</b></li>`; }).join("");
    const end = $("#geoEnd");
    if (s.ph === "end") {
      $("#geoRv").innerHTML = ""; const max = s.total * 5250;
      if (solo) {
        const tot = s.scores[me()] || 0, rank = RANKS.find(([m]) => tot / max >= m)[1], log = (s.log?.[me()] || []).map((k, i) => `<li>Round ${i + 1}: <b>${fmt(k)} km</b> off</li>`).join("");
        end.innerHTML = `<div class="mp-end" role="status"><p class="mp-endlab">Your title</p><h3>${esc(rank)}</h3><p class="pq-final">${fmt(tot)} points out of about ${fmt(max)}</p><ul class="geo-log">${log}</ul><div class="row"><button class="btn btn-primary" data-r type="button"><span class="btn-t">Play again</span></button><button class="btn btn-ghost" data-l type="button"><span class="btn-t">Change settings</span></button></div></div>`;
        end.querySelector("[data-r]").addEventListener("click", () => api.rematch()); end.querySelector("[data-l]").addEventListener("click", () => api.leave());
      } else results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0, note: `avg ${fmt(Math.round((s.log?.[id] || []).reduce((a, b) => a + b, 0) / Math.max(1, (s.log?.[id] || []).length)))} km off` })), { unit: "pts", title: "Best explorer" });
    } else end.innerHTML = "";
  }
  const fmt = (n) => Number(n).toLocaleString("en-IN");
  const colourOf = (p) => ["#E85D75", "#2D9CDB", "#F2B93B", "#4FC48A", "#7E5BEF", "#F2802F", "#E86CB5", "#2FB5B0"][(p.color || 0) % 8];
  function render(s) {
    if (!s || !s.ph) return;
    const fresh = !st || st.i !== s.i || st.ph !== s.ph;
    if (s.ph === "g" && fresh) timerBar($("#geTl"), s.tl); else if (s.ph !== "g") timerBar($("#geTl"), 0);
    if (s.ph === "r" && st?.ph !== "r" && ready()) { const mine = s.rv?.rows.find((r) => r.pid === me()); tone(PENTA[mine && mine.km < 500 ? 6 : 2], 0.5, 0.06); }
    st = s; paint(false);
    if (s.ph === "end" && solo && fresh) report(s.scores[me()] || 0);
  }
  return { render, players() { paint(false); }, destroy() { dead = true; map?.destroy(); if (api.room) api.room.off("msg", onMsg); } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "rounds", label: "Places", def: 5, choices: [[3, "3"], [5, "5"], [8, "8"], [10, "10"]] },
  { id: "region", label: "Where", def: "world", choices: [["world", "All over the world"], ["india", "India only"], ["abroad", "Outside India"], ["queer", "Queer history places"], ["nature", "Wild places"]] },
  { id: "time", label: "Time per place", def: 1, choices: [[0.6, "Quick (45s)"], [1, "Normal (90s)"], [2, "Relaxed (3 min)"]] }
];
mp({ id: "geo", title: "Where in the world?", min: 2, max: 8, options: OPTIONS, host: (ctx) => makeHost(ctx, false), view: (root, api) => mountView(root, api, false) });

game("geo",
  `<div class="pq-solo"><div class="pq-setup" id="geSetup"><p class="pq-lede">Look at a photograph and drop a pin where you think it was taken. See how far off you were, with a line that turns from green to dark red the further away you are. Hundreds of places, from Hampi to Antarctica. Play solo or race friends in a room.</p><div class="tg-opts">${OPTIONS.map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><div class="row"><button class="btn btn-primary" id="geGo" type="button"><span class="btn-t">Start</span></button></div></div><div id="geStage" hidden></div></div>`,
  () => {
    const setup = q$("#geSetup"), stage = q$("#geStage"); loadWorld().catch(() => {});
    let host = null, view = null, timers = [], msgFn = null;
    const me = { id: "me", name: "You", color: 0, host: true, away: false };
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { players: [me], after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => view?.render(s), reply: (pid, d) => msgFn?.(d) };
    const api = { me, players: [me], isHost: true, solo: true, act: (a) => host?.act("me", a), onMsg: (f) => (msgFn = f), rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; }
    function go() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); const o = get(); setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx, true); host.start(o); }
    q$("#geGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
