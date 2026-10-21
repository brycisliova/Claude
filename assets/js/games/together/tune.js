// Name that tune: a 30 second clip plays, you type the song name, and the closest answer scores the most. Mostly Hindi
// film songs, plus English and world hits. Clips are the free 30 second previews from the iTunes Store, streamed from
// Apple's servers, never stored here. Typing is forgiving: spelling, "Tum Hi Ho" or "Tumhi Ho", or just the hook all count.
// The host (or your own browser in solo play) holds the song list and judges the guesses.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$, report } from "../shared.js";
import { pickFresh } from "../fresh.js";
import { tone, PENTA, ready } from "../../audio.js";

const AUDIO = "https://audio-ssl.itunes.apple.com/itunes-assets/", ART = "https://is1-ssl.mzstatic.com/image/thumb/";
let LIST = null, loading = null;
export function loadSongs() {
  if (LIST) return Promise.resolve(LIST);
  return (loading ||= fetch(new URL("../../../data/songs.json", import.meta.url)).then((r) => { if (!r.ok) throw new Error("songs"); return r.json(); }).then((j) => (LIST = j.map((s) => ({ ...s, u: AUDIO + s.u, img: ART + s.i + "/300x300bb.jpg" })))).catch((e) => { loading = null; throw e; }));
}

/* ---------- judging a guess ---------- */
const strip = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/\(.*?\)|\[.*?\]/g, " ").replace(/\b(feat|ft)\b\.?.*$/, " ").replace(/^(the|a|an) /, "").replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim();
// Hindi names have many English spellings, so also compare a rough sound-alike form.
const sound = (s) => s.replace(/ee|ea|ie/g, "i").replace(/oo|ou/g, "u").replace(/aa/g, "a").replace(/ph/g, "f").replace(/w/g, "v").replace(/z/g, "j").replace(/q/g, "k").replace(/ck/g, "k").replace(/(.)\1+/g, "$1").replace(/(?<=[a-z])h/g, "");
function lev(a, b) {
  if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[b.length];
}
const ratio = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);
export function sim(guess, title) {
  const a = strip(guess), b = strip(title); if (!a || !b) return 0;
  const A = a.replace(/ /g, ""), B = b.replace(/ /g, ""), U = [...new Set(b.split(" "))].join(""); // "Chaiyya Chaiyya" also counts as "chaiyya"
  let s = Math.max(ratio(A, B), ratio(sound(A), sound(B)), ratio(sound(A), sound(U)));
  const bt = new Set(b.split(" ")); // the hook alone, such as "chaiyya" for "Chaiyya Chaiyya"
  if (A.length >= 4 && a.split(" ").every((w) => bt.has(w)) && A.length / B.length >= 0.45) s = Math.max(s, 0.9);
  return s;
}
const FULL = 0.86, MIN = 0.6;
function judge(song, guess, frac, hinted) {
  const g = String(guess || "").slice(0, 70);
  if (!strip(g)) return { sim: 0, pts: 0, tag: "" };
  const s = Math.max(sim(g, song.t), song.tn ? sim(g, song.tn) : 0), k = hinted ? 0.8 : 1;
  if (s >= FULL) return { sim: s, pts: Math.round((100 + 50 * (1 - frac)) * k), tag: "Got it" };
  if (s >= MIN) return { sim: s, pts: Math.round(75 * ((s - MIN) / (FULL - MIN)) ** 1.5 * k), tag: "So close" };
  if (sim(g, song.a) >= 0.9) return { sim: s, pts: 15, tag: "Right artist" };
  if (song.f && sim(g, song.f) >= 0.9) return { sim: s, pts: 15, tag: "Right film" };
  return { sim: s, pts: 0, tag: "" };
}

/* ---------- the host ---------- */
const LANGS = { hi: "Hindi song", pa: "Punjabi song", ta: "Tamil song", te: "Telugu song", kn: "Kannada song", mr: "Marathi song", ml: "Malayalam song", bn: "Bengali song", en: "English song", es: "Spanish song", fr: "French song", it: "Italian song", pt: "Portuguese song", ko: "K-pop", de: "German song", ja: "Japanese song", tr: "Turkish song", ar: "Arabic song" };
const Q_MS = 34000, REVEAL_MS = 8500;
const POOLS = { hindi: (s) => s.g === "hi", english: (s) => s.g === "en", world: (s) => s.g === "world" };
function pickSongs(all, source, n) {
  const take = (list, k) => pickFresh("wwa-tune-" + source, list, (s) => s.id, k);
  if (POOLS[source]) return shuffle(take(all.filter(POOLS[source]), n));
  const hi = all.filter(POOLS.hindi), rest = all.filter((s) => !POOLS.hindi(s)), nh = Math.round(n * 0.6);
  return shuffle(take(hi, nh).concat(take(rest, n - nh)));
}
function makeHost(ctx) {
  let S = null;
  const view = (ph, extra) => ({ ph, i: S.i, total: S.songs.length, scores: S.scores, order: S.order, ...extra });
  const clip = (s) => ({ u: s.u, id: s.id, g: s.g, n: s.t.length });
  function ask() {
    const s = S.songs[S.i]; S.guess = {}; S.gain = {}; S.hint = false; S.dl = Date.now() + Q_MS; S.ph = "q"; clearTimeout(S.tm); clearTimeout(S.hm);
    S.tm = ctx.after(Q_MS + 400, reveal); S.hm = ctx.after(Q_MS / 2, () => { if (S.ph === "q") { S.hint = true; ctx.push(qview()); } });
    ctx.push(qview());
  }
  const qview = () => { const s = S.songs[S.i], nx = S.songs[S.i + 1]; return view("q", { clip: clip(s), next: nx ? nx.u : "", tl: Math.max(0, S.dl - Date.now()), done: Object.keys(S.guess), hint: S.hint ? `${hintOf(s)}` : "", lang: LANGS[s.l] || "Song" }); };
  const hintOf = (s) => { const w = s.t.replace(/\(.*?\)/g, "").trim().split(/\s+/); return `${w.length} word${w.length > 1 ? "s" : ""}, starts with "${w[0][0].toUpperCase()}"${s.y ? ", from " + s.y : ""}`; };
  function reveal() {
    if (S.ph !== "q") return; S.ph = "r"; clearTimeout(S.tm); clearTimeout(S.hm); const s = S.songs[S.i];
    const rows = {};
    S.order.forEach((id) => { const g = S.guess[id]; const r = g ? judge(s, g.g, g.t / Q_MS, g.h) : { sim: 0, pts: 0, tag: "" }; S.gain[id] = r.pts; S.scores[id] = (S.scores[id] || 0) + r.pts; rows[id] = { g: g ? g.g : "", pts: r.pts, tag: r.tag, sim: Math.round(r.sim * 100) }; if (r.tag === "Got it") S.hits[id] = (S.hits[id] || 0) + 1; });
    ctx.push(view("r", { clip: clip(s), ans: { t: s.t, a: s.a, f: s.f, y: s.y, img: s.img }, rows }));
    S.tm = ctx.after(REVEAL_MS, () => { if (S.i + 1 >= S.songs.length) { S.ph = "end"; ctx.push(view("end", { hits: S.hits })); } else { S.i++; ask(); } });
  }
  return {
    async start(o) {
      let all; try { all = await loadSongs(); } catch (e) { return ctx.push({ ph: "error" }); }
      const n = Math.min(+o.rounds || 10, all.length);
      S = { songs: pickSongs(all, o.source || "mix", n), i: 0, scores: {}, hits: {}, guess: {}, gain: {}, order: ctx.players.map((p) => p.id), tm: null, hm: null, dl: 0, ph: "q", hint: false };
      S.order.forEach((id) => (S.scores[id] = 0)); ask();
    },
    act(pid, a) {
      if (!S) return;
      if (a.a === "guess" && S.ph === "q" && S.order.includes(pid) && !S.guess[pid]) {
        const t = String(a.g || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 70); if (!t) return;
        S.guess[pid] = { g: t, t: Math.min(Q_MS, Date.now() - (S.dl - Q_MS)), h: S.hint };
        const live = S.order.filter((id) => { const p = ctx.players.find((x) => x.id === id); return p && !p.left && !p.away; });
        if (live.every((id) => S.guess[id])) { clearTimeout(S.tm); S.tm = ctx.after(900, reveal); }
        ctx.push(qview());
      } else if (a.a === "skip" && S.ph === "q" && ctx.players.find((p) => p.id === pid)?.host) { // the clip will not play for the host
        S.guess = {}; S.songs.splice(S.i, 1); if (S.i >= S.songs.length) { S.ph = "end"; clearTimeout(S.tm); return ctx.push(view("end", { hits: S.hits })); } ask();
      }
    },
    destroy() { if (S) { clearTimeout(S.tm); clearTimeout(S.hm); } }
  };
}

/* ---------- the view ---------- */
function mountView(root, api, solo) {
  root.innerHTML = `<div class="mp tn"><div class="mp-head"><p class="mp-turn" id="tnInfo" aria-live="polite">Loading the songs…</p><div class="mp-tl"><i id="tnTl"></i></div></div>
  <div class="tn-stage" id="tnStage"><button class="tn-play" id="tnPlay" type="button" aria-label="Play the clip"><span class="tn-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="tn-ptxt" id="tnPtxt">Tap to play</span></button>
  <div class="tn-meta"><span class="tn-chip" id="tnLang"></span><span class="tn-hint" id="tnHint"></span></div></div>
  <form class="tn-form" id="tnForm" autocomplete="off"><label class="sr-only" for="tnIn">Song name</label><input class="text-in at-in" id="tnIn" maxlength="70" placeholder="Type the song name" autocapitalize="words" spellcheck="false" enterkeyhint="send"><button class="btn btn-primary" type="submit"><span class="btn-t">Lock it in</span></button></form>
  <p class="at-msg" id="tnMsg" role="status"></p><button class="btn btn-ghost btn-sm" id="tnSkip" type="button" hidden><span class="btn-t">Clip not playing? Skip this song</span></button>
  <div class="tn-rev" id="tnRev" hidden></div>
  <ul class="mp-score" id="tnScore"></ul>
  <details class="at-how"><summary>How to play</summary><ul><li>A 30 second clip plays. Type the name of the song and lock it in. Everyone hears the same clip on their own device.</li><li>The <b>closest answer scores the most</b>. A perfect answer is worth 100, plus up to 50 for being quick. Close spellings, "Tum Hi Ho" or "Tumhi Ho", or just the catchy part all count.</li><li>Halfway through, a hint appears. Answers after the hint earn a bit less.</li><li>The right artist or film earns a small consolation score.</li><li>No sound? Check the volume, silent mode and tap the big play button. If the clip will not load, the host can skip the song.</li></ul></details>
  <div id="tnEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, lastKey = "", mine = false, pre = null;
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || "Player";
  const audio = new Audio(); audio.preload = "auto"; let curUrl = "", playing = false;
  const setPlay = (on) => { playing = on; $("#tnStage").classList.toggle("on", on); $("#tnPtxt").textContent = on ? "Playing… tap to pause" : curUrl ? "Tap to play" : ""; };
  audio.addEventListener("ended", () => setPlay(false)); audio.addEventListener("pause", () => setPlay(false)); audio.addEventListener("playing", () => setPlay(true));
  audio.addEventListener("error", () => { setPlay(false); $("#tnPtxt").textContent = "Could not load the clip. Tap to retry"; retry(); });
  let tried = 0;
  async function retry() { // preview links can change; ask iTunes for a fresh one by id
    if (tried++ || !st?.clip) return;
    try { const r = await fetch(`https://itunes.apple.com/lookup?id=${st.clip.id}&country=IN`).then((x) => x.json()); const u = r.results?.[0]?.previewUrl; if (u) { curUrl = u; audio.src = u; audio.play().catch(() => {}); } } catch (e) { /* offline */ }
  }
  const toggle = () => { if (!curUrl) return; if (audio.paused) { if (audio.ended) audio.currentTime = 0; audio.play().catch(() => setPlay(false)); } else audio.pause(); };
  $("#tnPlay").addEventListener("click", toggle); $("#tnSkip").addEventListener("click", () => api.act({ a: "skip" }));
  $("#tnForm").addEventListener("submit", (e) => { e.preventDefault(); const g = $("#tnIn").value.trim(); if (!g || !st || st.ph !== "q" || mine) return; mine = true; api.act({ a: "guess", g }); paint(); });
  function paint() {
    const s = st; if (!s) return;
    if (s.ph === "error") { $("#tnInfo").textContent = "Could not load the song list. Check your connection and reopen the game."; return; }
    $("#tnInfo").innerHTML = s.ph === "end" ? "Final scores" : `Song <b>${s.i + 1}</b> of ${s.total}`;
    const q = s.ph === "q", r = s.ph === "r";
    $("#tnStage").hidden = s.ph === "end"; $("#tnForm").hidden = !q; $("#tnLang").textContent = s.lang || "";
    $("#tnHint").textContent = q && s.hint ? "Hint: " + s.hint : "";
    $("#tnIn").disabled = !q || mine; $("#tnForm button").disabled = !q || mine;
    $("#tnMsg").textContent = q && mine ? "Locked in. Waiting for the others…" : q ? "" : "";
    $("#tnSkip").hidden = !(q && api.me?.host);
    const rev = $("#tnRev"); rev.hidden = !r;
    if (r) {
      const a = s.ans, rows = s.order.map((id) => ({ id, ...s.rows[id] })).sort((x, y) => y.pts - x.pts);
      rev.innerHTML = `<div class="tn-ans">${a.img ? `<img src="${esc(a.img)}" alt="" width="96" height="96" loading="eager">` : ""}<div><p class="tn-t">${esc(a.t)}</p><p class="tn-a">${esc(a.a)}${a.f && a.f !== "Single" ? " · " + esc(a.f) : ""}${a.y ? " · " + a.y : ""}</p></div></div><ol class="tn-rows">${rows.map((x, i) => `<li class="${x.pts > 0 && i === 0 ? "best" : ""}">${dot(byId(api, x.id) || { color: 0, name: "?" })}<span class="tn-pn">${esc(name(x.id))}</span><span class="tn-g">${x.g ? esc(x.g) : "<em>no answer</em>"}</span><b>${x.pts ? "+" + x.pts : "0"}</b>${x.tag ? `<small>${x.tag}</small>` : ""}</li>`).join("")}</ol>`;
    } else rev.innerHTML = "";
    $("#tnScore").innerHTML = s.order.map((id) => { const p = byId(api, id); if (!p) return ""; const d = q ? s.done?.includes(id) : false; return `<li class="${p.away ? "away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.scores[id] || 0}</b>${d ? `<em class="up">locked</em>` : ""}</li>`; }).join("");
    const end = $("#tnEnd");
    if (s.ph === "end") results(end, api, s.order.map((id) => ({ id, score: s.scores[id] || 0, note: `${s.hits?.[id] || 0} spot on` })), { unit: "pts" }); else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    if (s.ph === "q" && (!st || st.i !== s.i || st.ph !== "q")) {
      mine = s.done?.includes(me()) || false; tried = 0; $("#tnIn").value = ""; timerBar($("#tnTl"), s.tl);
      curUrl = s.clip.u; audio.src = curUrl; audio.play().catch(() => setPlay(false)); $("#tnPtxt").textContent = "Tap to play";
      setTimeout(() => { if (!mine) $("#tnIn").focus({ preventScroll: true }); }, 80);
      if (s.next) { pre = new Audio(); pre.preload = "auto"; pre.src = s.next; }
    }
    if (s.ph !== "q") timerBar($("#tnTl"), 0);
    if (s.ph === "r") { audio.pause(); if (st?.ph !== "r" && ready()) { const g = s.rows[me()]?.pts || 0; tone(g >= 100 ? PENTA[6] : g > 0 ? PENTA[4] : PENTA[1], 0.45, 0.07); } }
    if (s.ph === "end") { audio.pause(); if (solo && st?.ph !== "end") report(s.scores[me()] || 0); }
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() { audio.pause(); audio.removeAttribute("src"); audio.load(); pre = null; } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "source", label: "Songs", def: "mix", choices: [["mix", "Mix: mostly Hindi"], ["hindi", "Hindi and Bollywood"], ["english", "English hits"], ["world", "World hits (French, Italian, K-pop...)"]] },
  { id: "rounds", label: "Songs per game", def: 10, choices: [[6, "6"], [10, "10"], [15, "15"], [20, "20"]] }
];
mp({ id: "tune", title: "Name that tune", min: 2, max: 10, options: OPTIONS, host: (ctx) => makeHost(ctx), view: (root, api) => mountView(root, api, false) });

game("tune",
  `<div class="pq-solo"><div class="pq-setup" id="tnSetup"><p class="pq-lede">Listen to a short clip and type the song name. The closest answer scores the most. Hindi film songs, English hits and world favourites. You need sound on. Want to race friends? Use Play together.</p><div class="tg-opts">${OPTIONS.map((o) => `<label>${o.label}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${v}"${String(v) === String(o.def) ? " selected" : ""}>${l}</option>`).join("")}</select></label>`).join("")}</div><div class="row"><button class="btn btn-primary" id="tnGo" type="button"><span class="btn-t">Start</span></button></div></div><div id="tnStageBox" hidden></div></div>`,
  () => {
    const setup = q$("#tnSetup"), stage = q$("#tnStageBox"); loadSongs().catch(() => {});
    let host = null, view = null, timers = [];
    const me = { id: "me", name: "You", color: 0, host: true, away: false };
    const get = () => Object.fromEntries([...setup.querySelectorAll("select")].map((s) => [s.dataset.o, s.value]));
    const ctx = { players: [me], after: (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; }, push: (s) => view?.render(s), reply: () => {} };
    const api = { me, players: [me], isHost: true, solo: true, opts: {}, act: (a) => host?.act("me", a), onMsg: () => {}, rematch: () => go(), leave: () => stop() };
    function stop() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); view = null; host = null; stage.hidden = true; stage.innerHTML = ""; setup.hidden = false; }
    function go() { host?.destroy(); timers.forEach(clearTimeout); timers = []; view?.destroy(); const o = get(); api.opts = o; setup.hidden = true; stage.hidden = false; stage.innerHTML = ""; view = mountView(stage, api, true); host = makeHost(ctx); host.start(o); }
    q$("#tnGo").addEventListener("click", go);
    return { destroy() { host?.destroy(); timers.forEach(clearTimeout); view?.destroy(); } };
  });
