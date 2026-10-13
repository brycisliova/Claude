import { $, $$, h, B, game, report, shuffle, rnd, reduce } from "./shared.js";
import { tone, PENTA, ready } from "../audio.js";
import { store } from "../core.js";

// Score a guess against the secret the way Wordle does: 2 = right place, 1 = in the word, 0 = not there.
export function scoreGuess(guess, secret) {
  const r = Array(5).fill(0), left = {};
  for (let i = 0; i < 5; i++) { if (guess[i] === secret[i]) r[i] = 2; else left[secret[i]] = (left[secret[i]] || 0) + 1; }
  for (let i = 0; i < 5; i++) if (r[i] !== 2 && left[guess[i]] > 0) { r[i] = 1; left[guess[i]]--; }
  return r;
}
export const KEYROWS = ["qwertyuiop", "asdfghjkl", "+zxcvbnm-"];
export const SQUARE = ["⬛", "🟨", "🟩"];

const KEY = "wwa-wordle";
const empty = () => ({ played: 0, won: 0, streak: 0, max: 0, dist: [0, 0, 0, 0, 0, 0], daily: null });
const dayNo = () => Math.floor((Date.now() - new Date(2026, 0, 1).getTime()) / 864e5);

game("wordle",
  `<div class="wd"><div class="row wd-head"><select class="mini" id="wdMode" aria-label="Word set"><option value="daily">Daily word</option><option value="random">Random word</option><option value="kind">Kind words</option></select><span class="game-msg" id="wdMsg">Loading words…</span></div><div class="wd-grid" id="wdGrid" role="group" aria-label="Your guesses"></div><div class="wd-kb" id="wdKb" role="group" aria-label="Keyboard"></div><div class="row"><button class="${B}" id="wdNew" hidden>New word</button><button class="btn btn-primary btn-sm" id="wdShare" hidden>Copy result</button><button class="${B}" id="wdStats">My stats</button></div><div class="wd-stats" id="wdBox" hidden></div></div>`,
  () => {
    const grid = $("#wdGrid"), kb = $("#wdKb"), msg = $("#wdMsg"), box = $("#wdBox");
    let W = null, secret = "", rows = [], cur = "", done = false, won = false, mode = "daily", busy = false, killed = false;
    const tiles = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) { const t = h("div", { class: "wd-t", role: "img", "aria-label": "empty" }); grid.appendChild(t); tiles.push(t); }
    const keys = {};
    KEYROWS.forEach((row) => { const d = h("div", { class: "wd-kr" }); [...row].forEach((k) => { const lab = k === "+" ? "Enter" : k === "-" ? "⌫" : k; const b = h("button", { class: "wd-k" + (k === "+" || k === "-" ? " wide" : ""), "data-k": k, "aria-label": k === "+" ? "Enter" : k === "-" ? "Delete" : k }, lab); b.addEventListener("click", () => { press(k); b.blur(); }); keys[k] = b; d.appendChild(b); }); kb.appendChild(d); });

    function draw(flipRow = -1) {
      tiles.forEach((t, i) => {
        const r = Math.floor(i / 5), c = i % 5, row = rows[r];
        let ch = "", st = "";
        if (row) { ch = row.w[c]; st = ["a", "p", "c"][row.s[c]]; } else if (r === rows.length && !done) ch = cur[c] || "";
        t.textContent = ch; t.className = "wd-t" + (st ? " " + st : "") + (ch && !st ? " on" : "") + (r === flipRow ? " flip" : "");
        t.style.animationDelay = r === flipRow ? c * 0.16 + "s" : "";
        t.setAttribute("aria-label", ch ? `${ch}${st ? ", " + { a: "not in word", p: "in the word", c: "right place" }[st] : ""}` : "empty");
      });
      const best = {}; rows.forEach((row) => [...row.w].forEach((ch, i) => { best[ch] = Math.max(best[ch] ?? -1, row.s[i]); }));
      Object.entries(keys).forEach(([k, b]) => { const v = best[k]; b.className = "wd-k" + (k === "+" || k === "-" ? " wide" : "") + (v === 2 ? " c" : v === 1 ? " p" : v === 0 ? " a" : ""); });
    }
    const stats = () => Object.assign(empty(), store(KEY) || {});
    function finish() {
      done = true; busy = false;
      const s = stats(); s.played++;
      if (won) { s.won++; s.streak++; s.max = Math.max(s.max, s.streak); s.dist[rows.length - 1]++; report(rows.length, { low: true }); } else s.streak = 0;
      if (mode === "daily") s.daily = { day: dayNo(), rows: rows.map((r) => r.w), done: true, won };
      store(KEY, s);
      msg.textContent = won ? ["Genius.", "Magnificent.", "Impressive.", "Splendid.", "Great.", "Phew, just in time."][rows.length - 1] : `The word was ${secret.toUpperCase()}.`;
      $("#wdShare").hidden = false; $("#wdNew").hidden = mode === "daily"; showStats();
      if (ready()) { won ? [0, 2, 4].forEach((k, j) => setTimeout(() => tone(PENTA[k + 2] * 2, 0.5, 0.07), j * 140)) : tone(PENTA[0], 0.8, 0.05); }
    }
    function submit() {
      if (cur.length < 5) { msg.textContent = "Five letters, please."; shake(); return; }
      if (!W.VALID.has(cur)) { msg.textContent = "That isn't in the word list."; shake(); return; }
      const s = scoreGuess(cur, secret); rows.push({ w: cur, s }); cur = ""; busy = true; msg.textContent = "";
      draw(rows.length - 1);
      setTimeout(() => {
        if (killed) return;
        draw(); busy = false;
        if (s.every((x) => x === 2)) { won = true; finish(); } else if (rows.length === 6) finish();
      }, reduce ? 0 : 5 * 160 + 300);
    }
    function shake() { const r = rows.length; tiles.slice(r * 5, r * 5 + 5).forEach((t) => { t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake"); }); }
    function press(k) {
      if (!W || done || busy) return;
      if (k === "+") return submit();
      if (k === "-") { cur = cur.slice(0, -1); msg.textContent = ""; return draw(); }
      if (cur.length < 5) { cur += k; msg.textContent = ""; draw(); if (ready()) tone(PENTA[rnd(5)] * 2, 0.15, 0.025); }
    }
    function showStats() {
      const s = stats(), max = Math.max(1, ...s.dist);
      box.hidden = false;
      box.innerHTML = `<div class="wd-sn"><div><b>${s.played}</b><span>played</span></div><div><b>${s.played ? Math.round((s.won / s.played) * 100) : 0}%</b><span>wins</span></div><div><b>${s.streak}</b><span>streak</span></div><div><b>${s.max}</b><span>best streak</span></div></div><div class="wd-dist">${s.dist.map((n, i) => `<div><span>${i + 1}</span><i style="width:${Math.max(7, (n / max) * 100)}%">${n}</i></div>`).join("")}</div>`;
    }
    function start(m) {
      mode = m; rows = []; cur = ""; done = false; won = false; busy = false; box.hidden = true; $("#wdShare").hidden = true; $("#wdNew").hidden = true;
      if (m === "daily") {
        secret = W.ANSWERS[(dayNo() * 7919) % W.ANSWERS.length];
        const d = stats().daily;
        if (d && d.day === dayNo() && d.done) { rows = d.rows.map((w) => ({ w, s: scoreGuess(w, secret) })); won = d.won; done = true; msg.textContent = won ? "You solved today's word. Come back tomorrow." : `Today's word was ${secret.toUpperCase()}. A new one tomorrow.`; $("#wdShare").hidden = false; showStats(); draw(); return; }
        msg.textContent = "Today's word. Six tries.";
      } else { const list = m === "kind" ? W.KIND : W.ANSWERS; secret = list[rnd(list.length)]; msg.textContent = m === "kind" ? "A warm word. Six tries." : "A random word. Six tries."; }
      draw();
    }
    $("#wdMode").addEventListener("change", (e) => W && start(e.target.value));
    $("#wdNew").addEventListener("click", () => start($("#wdMode").value));
    $("#wdStats").addEventListener("click", () => (box.hidden ? showStats() : (box.hidden = true)));
    $("#wdShare").addEventListener("click", async () => {
      const head = `Word guess ${mode === "daily" ? "daily #" + dayNo() : mode} ${won ? rows.length : "X"}/6`;
      const txt = head + "\n\n" + rows.map((r) => r.s.map((x) => SQUARE[x]).join("")).join("\n") + "\nshiningforever.in/games/";
      try { await navigator.clipboard.writeText(txt); msg.textContent = "Result copied. Paste it anywhere."; } catch (e) { msg.textContent = "Couldn't copy here, but you can screenshot it."; }
    });
    import("../data/words.js").then((m) => { if (killed) return; W = m; start("daily"); }).catch(() => { msg.textContent = "Couldn't load the word list. Check your connection and reopen the game."; });
    draw();
    return {
      destroy() { killed = true; },
      key(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return false;
        if (/^[a-zA-Z]$/.test(e.key)) { press(e.key.toLowerCase()); return true; }
        if (e.key === "Enter") { if (document.activeElement?.tagName === "BUTTON") return false; press("+"); return true; }
        if (e.key === "Backspace") { press("-"); return true; }
        return false;
      }
    };
  });
