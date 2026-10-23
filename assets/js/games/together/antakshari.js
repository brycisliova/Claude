// Song antakshari for 2 to 8 friends. Type a line or two of a song that starts with the sound on screen, and the song's
// name. Hindi songs can be typed the way people text them (Hinglish: "tum hi ho") or in Devanagari. Spelling never matters:
// a line is reduced to sound classes (see hinglish.js) and only its first sound and last sound are checked. The others
// vote whether it is a real song and a fair line. The last sound of your line becomes the next player's starting sound.
// A lyrics database cannot be shipped, so the friends in the room are the judges, helped by a badge when the song name is
// in our own music list.
import { mp, h, esc, shuffle, results, timerBar, byId, dot } from "./common.js";
import { game, $ as q$ } from "../shared.js";
import { loadSongs, sim } from "./tune.js";
import { tone, PENTA, ready } from "../../audio.js";
import { CLASSES, startClass, endClasses, classLabel, classDev, canon, skeleton, wordsOf as hWords } from "./hinglish.js";

/* ---------- letters ---------- */
const hasDev = (t) => /[\u0900-\u097F]/.test(t);
const firstEn = (line) => { const m = /[a-zA-Z]/.exec(String(line)); return m ? m[0].toLowerCase() : ""; };
const lettersEn = (line) => String(line).toLowerCase().replace(/[^a-z]/g, "");
const EN_RARE = new Set("qxzjvu".split(""));
// English: the last letter, and also the one before it when the last one is rare
function endEn(line) { const t = lettersEn(line); if (!t) return []; const out = [t[t.length - 1]]; if (EN_RARE.has(out[0]) && t.length > 1) out.push(t[t.length - 2]); return out; }
const wordsOf = (s) => String(s).trim().split(/\s+/).filter(Boolean);
const key = (s) => String(s).normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
// sounds a Hindi line may start with (the common ones)
const HI_START = "k kh g ch j t d n p ph b bh m y r l v sh s h a i u e o".split(" ");
const EN_START = "a b c d e f g h i j k l m n o p r s t w y".split(" ");
const KEYS = { vowels: "अ आ इ ई उ ऊ ऋ ए ऐ ओ औ".split(" "), cons: "क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह क्ष त्र ज्ञ".split(" "), marks: "ा ि ी ु ू ृ े ै ो ौ ं ँ ः ् ़ ।".split(" ") };
// what the player sees for a starting sound
const show = (hindi, c) => (hindi ? classLabel(c) : c.toUpperCase());

/* ---------- the host ---------- */
const WRITE_MS = { 1.5: 90000, 1: 60000, 0.7: 40000 }, JUDGE_MS = 12000, SHOW_MS = 4200;
function makeHost(ctx) {
  let S = null, songs = null;
  const alive = () => S.order.filter((id) => S.lives[id] > 0);
  const voters = () => alive().filter((id) => id !== S.turn && !ctx.players.find((p) => p.id === id)?.left);
  const view = (ph, extra) => ({ ph, order: S.order, turn: S.turn, letter: S.allowed[0], allowed: S.allowed, hindi: S.hindi, last: S.last, hist: S.hist.slice(-6), cur: S.cur ? { line: S.cur.line, song: S.cur.song, known: S.cur.known } : null, tl: Math.max(0, S.dl - Date.now()), ms: S.ms, lives: S.lives, score: S.score, count: S.hist.length, voted: Object.keys(S.votes), res: S.res, ...extra });
  const nextAlive = (from) => { const o = S.order, n = o.length; for (let k = 1; k <= n; k++) { const id = o[(o.indexOf(from) + k) % n]; if (S.lives[id] > 0) return id; } return from; };
  function turn(id) {
    S.turn = id; S.wrong = 0; S.cur = null; S.votes = {}; S.res = null; S.ph = "write"; S.ms = S.ms0; S.dl = Date.now() + S.ms; clearTimeout(S.tm);
    S.tm = ctx.after(S.ms + 300, () => { S.lives[id]--; S.last = { miss: "ran out of time", by: id }; afterMiss(id); });
    ctx.push(view("write"));
  }
  function afterMiss(id) { if (alive().length <= 1) return end(); turn(S.lives[id] > 0 ? nextAlive(id) : nextAlive(id)); }
  function judge() {
    if (S.ph !== "judge") return; clearTimeout(S.tm);
    const vs = Object.values(S.votes), yes = vs.filter((v) => v === 1).length, no = vs.length - yes, id = S.turn, c = S.cur;
    // a tie goes to the singer, and with fewer than three voters a song from our own list is not thrown out by one vote
    const good = vs.length === 0 || yes >= no || (c.known && voters().length < 3);
    if (good) {
      const pts = 10 + Math.min(10, wordsOf(c.line).length * 2) + Math.round(8 * Math.max(0, (S.dl0 - c.t) / S.ms0)) + (c.known ? 4 : 0);
      S.used.add(c.k); S.songs[c.sk] = (S.songs[c.sk] || 0) + 1; S.score[id] = (S.score[id] || 0) + pts; S.hist.push({ by: id, line: c.line, song: c.song, pts }); S.allowed = (S.hindi ? endClasses(c.line) : endEn(c.line)); if (!S.allowed.length) S.allowed = [(S.hindi ? HI_START : EN_START)[0]];
      S.res = { ok: true, pts, yes, no };
    } else { S.lives[id]--; S.last = { miss: "was voted out", by: id }; S.res = { ok: false, yes, no }; }
    S.ph = "res"; S.ms = 0; ctx.push(view("res"));
    S.tm = ctx.after(SHOW_MS, () => { if (S.ph !== "res") return; if (alive().length <= 1) return end(); turn(nextAlive(id)); });
  }
  function end() { S.over = true; S.ph = "end"; clearTimeout(S.tm); ctx.push(view("end", { winner: alive()[0] || null })); }
  return {
    async start(o) {
      const hindi = o.lang !== "en", lives = +o.lives || 3;
      try { songs = await Promise.race([loadSongs(), new Promise((r) => setTimeout(() => r(null), 4000))]); } catch (e) { songs = null; }
      S = { order: ctx.players.map((p) => p.id), hindi, lives: {}, score: {}, used: new Set(), hist: [], allowed: [shuffle((hindi ? HI_START : EN_START).slice())[0]], songs: {}, turn: "", ph: "", cur: null, votes: {}, res: null, wrong: 0, last: null, dl: 0, dl0: 0, ms: 0, ms0: WRITE_MS[o.time] || 60000, tm: null, over: false };
      S.order.forEach((id) => { S.lives[id] = lives; S.score[id] = 0; });
      turn(S.order[0]);
    },
    act(pid, a) {
      if (!S || S.over) return;
      if (a.a === "line" && S.ph === "write" && pid === S.turn) {
        const line = String(a.line || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160), song = String(a.song || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
        let msg = "";
        const startOk = S.hindi ? S.allowed.includes(startClass(line)) : S.allowed.includes(firstEn(line)), sk = S.hindi ? skeleton(song) : key(song);
        if (wordsOf(line).length < 3) msg = "Write at least a few words of the line.";
        else if (!S.hindi && /[\u0900-\u097F]/.test(line)) msg = "In English mode, type the line in English letters.";
        else if (S.hindi && !hasDev(line) && !/[a-zA-Z]/.test(line)) msg = "Type the line in Hinglish (like \"tum hi ho\") or in Hindi letters.";
        else if (!startOk) msg = S.allowed.length > 1 ? `The line has to start with ${S.allowed.map((c) => show(S.hindi, c)).join(" or ")}.` : `The line has to start with ${show(S.hindi, S.allowed[0])}.`;
        else if (song.length < 2) msg = "Add the name of the song.";
        else if (S.used.has(S.hindi ? skeleton(line) : key(line))) msg = "That line has already been sung.";
        else if ((S.songs[sk] || 0) >= 2) msg = "That song has already been used twice. Pick another one.";
        else if (!(S.hindi ? endClasses(line).length : endEn(line).length)) msg = "The line needs to end with a letter.";
        if (msg) { S.wrong++; ctx.reply(pid, { bad: msg, left: Math.max(0, 3 - S.wrong) }); if (S.wrong >= 3) { S.lives[pid]--; S.last = { miss: "made three wrong tries", by: pid }; clearTimeout(S.tm); afterMiss(pid); } return; }
        const known = !!songs && songs.some((x) => sim(song, x.t) >= 0.9 || (x.tn && sim(song, x.tn) >= 0.9) || (S.hindi && x.g === "hi" && canon(song) === canon(x.tn || x.t)));
        S.cur = { line, song, k: S.hindi ? skeleton(line) : key(line), sk, known, t: Date.now() }; S.dl0 = S.dl;
        clearTimeout(S.tm); S.ph = "judge"; S.votes = {}; S.ms = JUDGE_MS; S.dl = Date.now() + S.ms; S.tm = ctx.after(S.ms + 300, judge);
        if (voters().length === 0) { S.tm = ctx.after(900, judge); }
        ctx.push(view("judge"));
      } else if (a.a === "vote" && S.ph === "judge" && pid !== S.turn && alive().includes(pid) && !(pid in S.votes)) {
        S.votes[pid] = a.v ? 1 : 0;
        if (voters().every((id) => id in S.votes)) { clearTimeout(S.tm); S.tm = ctx.after(600, judge); }
        ctx.push(view("judge"));
      }
    },
    left(pid) { if (S && !S.over && S.lives[pid] > 0) { S.lives[pid] = 0; if (alive().length <= 1) return end(); if (S.turn === pid && S.ph === "write") turn(nextAlive(pid)); else if (S.ph === "judge") { if (voters().every((id) => id in S.votes)) judge(); else ctx.push(view("judge")); } else ctx.push(view(S.ph)); } },
    destroy() { if (S) clearTimeout(S.tm); }
  };
}

/* ---------- the view ---------- */
function mountView(root, api) {
  root.innerHTML = `<div class="mp at ak"><div class="mp-head"><p class="mp-turn" id="akInfo" aria-live="polite">Starting…</p><div class="mp-tl"><i id="akTl"></i></div></div>
  <div class="at-main"><div class="at-letter" id="akLetter" aria-live="polite"><span>sing a line starting with</span><b>?</b><small id="akLetterSub"></small></div><div class="at-last" id="akCard"><span class="muted">Waiting for the first line…</span></div></div>
  <form class="ak-form" id="akForm" autocomplete="off" hidden>
    <label class="sr-only" for="akLine">A line of the song</label><textarea class="text-in ak-line" id="akLine" rows="2" maxlength="160" placeholder="One or two lines of the song, like: tum hi ho, ab tum hi ho" autocapitalize="none" spellcheck="false"></textarea>
    <label class="sr-only" for="akSong">Song name</label><input class="text-in at-in" id="akSong" maxlength="60" placeholder="Name of the song">
    <button class="btn btn-primary" type="submit"><span class="btn-t">Sing it</span></button>
  </form>
  <details class="ak-kb" id="akKb" hidden><summary>Prefer Hindi letters? Open the keyboard</summary><div class="ak-keys" id="akKeys"></div></details>
  <div class="ak-vote" id="akVote" hidden><button class="btn btn-primary" data-v="1" type="button"><span class="btn-t">Real song, fair line</span></button><button class="btn btn-ghost" data-v="0" type="button"><span class="btn-t">Not convinced</span></button></div>
  <p class="at-msg" id="akMsg" role="status"></p>
  <ul class="mp-score at-score" id="akScore"></ul><ol class="ak-hist" id="akHist" aria-label="Lines sung"></ol>
  <details class="at-how"><summary>How to play</summary><ul><li>Sing, or type, one or two lines of a song that starts with the sound on the screen, and add the name of the song.</li><li><b>Hindi songs: type them the way you text them.</b> "tum hi ho", "pyar hua ikraar hua" and "आज की रात" are all fine. Spelling never matters: pyar and pyaar, kya and kyaa, zindagi and jindagi all count the same. The game only listens to the sound the line starts with and the sound it ends on.</li><li>Some Roman letters are two Hindi letters at once: a "t" can be त or ट, a "d" can be द or ड, "sh" can be श or ष. Either one is accepted.</li><li>The last sound of your line is the next player's starting sound. A line normally ends on its last consonant, so "tum hi <b>ho</b>" ends on h. If a word ends in "n" after a vowel (main, hain, nahin), the sound before it counts too. If a line ends on a very rare sound, the next singer may also use the one before it. You will see every allowed start on the screen.</li><li>Everyone else votes: is it a real song and a fair line? Most votes decide, and a tie goes to the singer. With fewer than three voters, a song from our own music list cannot be voted out by a single vote. You will see a badge when the song is in the list.</li><li>A line can only be sung once, and one song can be used twice at most. A line voted out, three wrong tries, or running out of time costs a life. The last player with lives wins.</li></ul></details>
  <div id="akEnd"></div></div>`;
  const $ = (s) => root.querySelector(s); let st = null, lastKey = "", voted = false, kbBuilt = false;
  const me = () => api.me?.id, name = (id) => byId(api, id)?.name || "Player";
  const say = (t, bad) => { const m = $("#akMsg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
  $("#akForm").addEventListener("submit", (e) => { e.preventDefault(); const line = $("#akLine").value.trim(), song = $("#akSong").value.trim(); if (!line || !st || st.turn !== me() || st.ph !== "write") return; api.act({ a: "line", line, song }); });
  $("#akVote").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || voted || st?.ph !== "judge") return; voted = true; api.act({ a: "vote", v: +b.dataset.v }); paint(); });
  const onMsg = (m) => { if (m?.bad) { say(`${m.bad}${m.left != null ? " (" + m.left + " tries left)" : ""}`, true); const f = $("#akForm"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); } };
  if (api.room) api.room.on("msg", onMsg);
  function buildKeys() {
    if (kbBuilt) return; kbBuilt = true; const box = $("#akKeys"), ta = $("#akLine");
    const add = (txt, cls) => { const b = h("button", { class: "ak-key" + (cls ? " " + cls : ""), type: "button" }, esc(txt)); b.addEventListener("click", () => { const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? s; ta.value = ta.value.slice(0, s) + txt + ta.value.slice(e); ta.focus({ preventScroll: true }); ta.selectionStart = ta.selectionEnd = s + txt.length; }); box.appendChild(b); };
    box.innerHTML = ""; [...KEYS.vowels, ...KEYS.cons, ...KEYS.marks].forEach((k) => add(k, KEYS.marks.includes(k) ? "mk" : ""));
    add(" ", "wide"); box.lastChild.textContent = "space"; box.lastChild.addEventListener("click", () => {});
    const bs = h("button", { class: "ak-key wide", type: "button" }, "⌫"); bs.setAttribute("aria-label", "Delete"); bs.addEventListener("click", () => { const a = [...ta.value]; a.pop(); ta.value = a.join(""); ta.focus({ preventScroll: true }); }); box.appendChild(bs);
  }
  function paint() {
    const s = st; if (!s) return;
    const mine = s.turn === me(), al = s.allowed || [s.letter], L = show(s.hindi, al[0] || "?");
    $("#akInfo").innerHTML = s.ph === "end" ? "Game over" : s.ph === "judge" ? (mine ? "Your friends are voting…" : "<b>Vote</b> on the line") : mine && s.ph === "write" ? "<b>Your turn</b>" : s.ph === "res" ? "Result" : `${esc(name(s.turn))} is thinking…`;
    $("#akLetter").innerHTML = `<span>sing a line starting with</span><b>${esc(L)}</b><small id="akLetterSub">${s.hindi ? esc(classDev(al[0]) ? "Hindi " + classDev(al[0]).split(" ").join(" or ") : "") : ""}${al.length > 1 ? ` · or ${al.slice(1).map((c) => esc(show(s.hindi, c))).join(" or ")}` : ""}</small>`;
    const card = $("#akCard"), c = s.cur, last = s.last, h0 = s.hist[s.hist.length - 1];
    if (c && (s.ph === "judge" || s.ph === "res")) card.innerHTML = `<span class="ak-line-t">${esc(c.line)}</span><span class="at-reg">${esc(c.song)}${c.known ? ' <b class="ak-known">in our music list</b>' : ""}</span><span class="at-by">${dot(byId(api, s.turn) || { color: 0, name: "?" })}${esc(name(s.turn))}</span>`;
    else if (last?.miss && s.ph === "write") card.innerHTML = `<span class="at-miss">${esc(name(last.by))} ${esc(last.miss)} and lost a life.</span>`;
    else if (h0 && s.ph === "write") card.innerHTML = `<span class="ak-line-t">${esc(h0.line)}</span><span class="at-reg">${esc(h0.song)}</span><span class="at-by">${dot(byId(api, h0.by) || { color: 0, name: "?" })}${esc(name(h0.by))} +${h0.pts}</span>`;
    else card.innerHTML = `<span class="muted">${mine ? "You start. Sing anything that begins with the letter." : "Waiting for the first line…"}</span>`;
    const form = $("#akForm"), showForm = mine && s.ph === "write"; form.hidden = !showForm; $("#akKb").hidden = !(showForm && s.hindi); if (showForm && s.hindi) buildKeys();
    const key = s.turn + ":" + s.count + ":" + s.ph; if (key !== lastKey) { if (showForm) { $("#akLine").value = ""; $("#akSong").value = ""; say(""); setTimeout(() => $("#akLine").focus({ preventScroll: true }), 80); } else say(""); if (s.ph === "judge") voted = false; lastKey = key; }
    const vote = $("#akVote"); vote.hidden = !(s.ph === "judge" && !mine && s.lives[me()] > 0 && !voted); if (s.ph === "judge" && !mine && voted) say("Vote in. Waiting for the others…"); else if (s.ph === "judge" && mine) say("Waiting for the votes…");
    if (s.ph === "res" && s.res) say(s.res.ok ? `Counts! +${s.res.pts} (${s.res.yes} yes, ${s.res.no} no)` : `Voted out (${s.res.yes} yes, ${s.res.no} no). That costs a life.`, !s.res.ok);
    $("#akScore").innerHTML = s.order.map((id) => { const p = byId(api, id) || { color: 4, name: "?" }, out = s.lives[id] <= 0; return `<li class="${s.turn === id && s.ph !== "end" ? "on" : ""}${out ? " away" : ""}">${dot(p)}<span>${esc(p.name)}</span><b>${s.score[id] || 0}</b><em>${out ? "out" : "●".repeat(s.lives[id]) + "○".repeat(Math.max(0, (api.opts?.lives || 3) - s.lives[id]))}</em></li>`; }).join("");
    $("#akHist").innerHTML = s.hist.slice().reverse().map((x) => `<li><b>${esc(x.song)}</b> <span>${esc(x.line)}</span></li>`).join("");
    const end = $("#akEnd");
    if (s.ph === "end") results(end, api, s.order.map((id) => ({ id, score: s.score[id] || 0 })), { unit: "pts", title: s.winner ? `${name(s.winner)} wins` : "Game over" }); else end.innerHTML = "";
  }
  function render(s) {
    if (!s || !s.ph) return;
    const fresh = !st || st.ph !== s.ph || st.turn !== s.turn || st.count !== s.count;
    if ((s.ph === "write" || s.ph === "judge") && fresh) timerBar($("#akTl"), s.tl); else if (s.ph === "res" || s.ph === "end") timerBar($("#akTl"), 0);
    if (s.ph === "res" && st?.ph !== "res" && ready()) tone(s.res?.ok ? PENTA[6] : PENTA[1], 0.45, 0.07);
    st = s; paint();
  }
  return { render, players() { paint(); }, destroy() { if (api.room) api.room.off("msg", onMsg); } };
}

/* ---------- registering ---------- */
const OPTIONS = [
  { id: "lang", label: "Songs in", def: "hi", choices: [["hi", "Hindi (type in Hinglish or Hindi)"], ["en", "English (A to Z)"]] },
  { id: "lives", label: "Lives", def: 3, choices: [[2, "2"], [3, "3"], [5, "5"]] },
  { id: "time", label: "Time to sing", def: 1, choices: [[1.5, "Relaxed (90s)"], [1, "Normal (60s)"], [0.7, "Quick (40s)"]] }
];
mp({ id: "antakshari", title: "Song antakshari", min: 2, max: 8, only: true, options: OPTIONS, host: (ctx) => makeHost(ctx), view: (root, api) => mountView(root, api) });
game("antakshari",
  `<div class="pq-solo"><div class="pq-setup"><p class="pq-lede">The classic game with friends, each on their own phone. Type a line of a song that starts with the letter, and the next friend must sing one that starts with the last letter of yours. Hindi songs can be typed the way you text them (Hinglish, like "tum hi ho") or in Hindi letters, and spelling never matters. English songs use A to Z. Your friends vote on every line.</p><div class="row"><button class="btn btn-primary" id="akGo" type="button"><span class="btn-t">Make a room</span></button></div></div></div>`,
  () => { q$("#akGo").addEventListener("click", () => document.querySelector('.gm-modes button[data-m="together"]')?.click()); return {}; });
