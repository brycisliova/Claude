import { $, $$, h, esc, fit, pos, B, game, report, shuffle, rnd, reduce, sprite, glow } from "./shared.js";
import { MYTH_HARD } from "../data/myth-bank.js";
import { pickFresh } from "./fresh.js";
import { tone, bowl, PENTA, ready } from "../audio.js";
import { store } from "../core.js";

export const DATA = (() => { try { return JSON.parse(document.getElementById("gameData").textContent); } catch (e) { return { myths: [], facts: [] }; } })();

/* ---------------------------------------------------------------- Echo tones */
game("echo",
  `<div class="ec"><div class="row"><span class="game-msg" id="ecMsg">Press start, listen, then repeat the tones.</span></div><div class="ec-pads" id="ecPads"></div><div class="row"><button class="btn btn-primary btn-sm" id="ecGo">Start</button></div><p class="muted small ec-tip">Tones play in a pattern that grows by one each round. If you slip, you simply hear it again, so there is no losing. Keys 1 to 4 work too.</p></div>`,
  () => {
    const pads = $("#ecPads"), msg = $("#ecMsg"), cols = ["pink", "yellow", "sky", "green"], freq = [PENTA[0], PENTA[2], PENTA[4], PENTA[6]];
    let seq = [], at = 0, busy = false, run = false, timers = [], best = 0;
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };
    const els = cols.map((c, i) => { const b = h("button", { class: "ec-pad", style: `--c:var(--${c})`, "aria-label": `Pad ${i + 1}` }); b.addEventListener("pointerdown", () => hit(i)); b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(i); } }); pads.appendChild(b); return b; });
    function flash(i, ms = 380) { els[i].classList.add("lit"); tone(freq[i] * 2, 0.5, 0.12); later(() => els[i].classList.remove("lit"), ms); }
    function playSeq() {
      busy = true; at = 0; msg.textContent = `Round ${seq.length}. Listen…`;
      seq.forEach((n, k) => later(() => flash(n), 700 + k * 640));
      later(() => { busy = false; msg.textContent = `Your turn. ${seq.length} tone${seq.length > 1 ? "s" : ""}.`; }, 700 + seq.length * 640);
    }
    function next() { seq.push(rnd(4)); playSeq(); }
    function hit(i) {
      if (!run || busy) return;
      flash(i, 260);
      if (seq[at] === i) {
        at++;
        if (at === seq.length) { if (seq.length > best) { best = seq.length; report(best); } busy = true; msg.textContent = `Lovely. ${seq.length} in a row.`; later(next, 900); }
      } else { busy = true; msg.textContent = "Not quite. Listen again."; later(playSeq, 1100); }
    }
    $("#ecGo").addEventListener("click", function () {
      if (run) { run = false; timers.forEach(clearTimeout); busy = false; seq = []; this.textContent = "Start"; msg.textContent = best ? `You reached ${best}. Press start to go again.` : "Press start, listen, then repeat the tones."; return; }
      run = true; seq = []; this.textContent = "Stop"; next();
    });
    return { destroy() { timers.forEach(clearTimeout); }, key(e) { if (/^[1-4]$/.test(e.key)) { hit(+e.key - 1); return true; } return false; } };
  });

/* ---------------------------------------------------------------- Know the flags */
export const FLAGS = [
  { n: "Rainbow pride flag", s: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"], f: "Designed by Gilbert Baker and first flown in San Francisco in 1978. Today's six-stripe version is the one most people know." },
  { n: "Transgender pride flag", s: ["#5BCEFA", "#F5A9B8", "#FFFFFF", "#F5A9B8", "#5BCEFA"], f: "Designed by Monica Helms in 1999. Light blue and pink, with white in the middle for people who are transitioning, intersex or have a neutral gender." },
  { n: "Bisexual pride flag", s: ["#D60270", "#D60270", "#9B4F96", "#0038A8", "#0038A8"], f: "Designed by Michael Page in 1998. The purple stripe blends pink, for same-gender attraction, with blue, for attraction to another gender." },
  { n: "Pansexual pride flag", s: ["#FF218C", "#FFD800", "#21B1FF"], f: "Pink, yellow and blue stripes that appeared online around 2010. The yellow stands for people of non-binary and other genders." },
  { n: "Non-binary pride flag", s: ["#FCF434", "#FFFFFF", "#9C59D1", "#2C2C2C"], f: "Designed by Kye Rowan in 2014 for people who feel they do not fit within the gender binary." },
  { n: "Asexual pride flag", s: ["#000000", "#A3A3A3", "#FFFFFF", "#800080"], f: "Black, grey, white and purple, chosen by the asexual community in a 2010 vote. Grey covers the space between asexual and sexual." },
  { n: "Genderqueer pride flag", s: ["#B57EDC", "#FFFFFF", "#4A8123"], f: "Designed by Marilyn Roxie in 2011. Lavender is for androgyny, white for agender people, and green for people outside the binary." },
  { n: "Lesbian pride flag", s: ["#D52D00", "#EF7627", "#FF9A56", "#FFFFFF", "#D362A4", "#B55690", "#A30262"], f: "Orange to pink in seven stripes. Several lesbian flags have been used over the years, and this one is widely flown today." },
  { n: "Intersex flag", ring: true, f: "Created by Morgan Carpenter in 2013. Yellow and purple were chosen to avoid the usual gendered colours, and the unbroken circle stands for wholeness." }
];
export const flagCss = (F) => F.ring ? "background:#FFD800" : `background:linear-gradient(${F.s.map((c, i) => `${c} ${(i / F.s.length) * 100}% ${((i + 1) / F.s.length) * 100}%`).join(",")})`;
game("flags",
  `<div class="fl"><div class="row fl-head"><span class="game-msg" id="flMsg"></span></div><div class="fl-flag" id="flFlag"></div><div class="fl-opts" id="flOpts"></div><p class="fl-fact" id="flFact" aria-live="polite"></p><div class="row"><button class="btn btn-primary btn-sm" id="flNext" hidden>Next flag</button><button class="${B}" id="flNew">New round</button></div></div>`,
  () => {
    const flag = $("#flFlag"), opts = $("#flOpts"), fact = $("#flFact"), msg = $("#flMsg");
    let order, i, right, answered;
    function round() { order = shuffle([...FLAGS.keys()]).slice(0, 8); i = 0; right = 0; ask(); }
    function ask() {
      answered = false; const F = FLAGS[order[i]]; $("#flNext").hidden = true; fact.textContent = "";
      flag.style.cssText = flagCss(F); flag.innerHTML = F.ring ? `<span class="fl-ring"></span>` : "";
      flag.setAttribute("role", "img"); flag.setAttribute("aria-label", "A pride flag. Which one is it?");
      msg.textContent = `Flag ${i + 1} of ${order.length} · ${right} right`;
      const choices = shuffle([order[i], ...shuffle([...FLAGS.keys()].filter((k) => k !== order[i])).slice(0, 3)]);
      opts.innerHTML = "";
      choices.forEach((k) => { const b = h("button", { class: "fl-o" }, esc(FLAGS[k].n)); b.addEventListener("click", () => pick(k, b)); opts.appendChild(b); });
    }
    function pick(k, b) {
      if (answered) return; answered = true; const F = FLAGS[order[i]], ok = k === order[i];
      if (ok) right++;
      [...opts.children].forEach((x) => { x.disabled = true; if (x.textContent === F.n) x.classList.add("ok"); });
      if (!ok) b.classList.add("no");
      if (ready()) tone(ok ? PENTA[5] : PENTA[1], 0.5, 0.07);
      fact.innerHTML = `<strong>${ok ? "Yes." : "Not this time."}</strong> This is the ${esc(F.n)}. ${esc(F.f)}`;
      msg.textContent = `Flag ${i + 1} of ${order.length} · ${right} right`;
      const last = i === order.length - 1;
      $("#flNext").textContent = last ? "See my score" : "Next flag"; $("#flNext").hidden = false; $("#flNext").focus({ preventScroll: true });
    }
    $("#flNext").addEventListener("click", () => {
      if (i === order.length - 1) { report(right); flag.style.cssText = "background:var(--surface2)"; flag.innerHTML = `<span class="fl-score">${right} / ${order.length}</span>`; opts.innerHTML = ""; fact.textContent = right >= order.length - 1 ? "Brilliant. You know your flags." : right >= 4 ? "Nicely done. Every flag has a story worth knowing." : "Good start. Try another round and see how many stay with you."; $("#flNext").hidden = true; msg.textContent = "Round complete"; return; }
      i++; ask();
    });
    $("#flNew").addEventListener("click", round); round();
  });

/* ---------------------------------------------------------------- Myth or fact */
game("myth",
  `<div class="mf"><div class="row"><span class="game-msg" id="mfMsg"></span></div><div class="mf-card" id="mfCard" aria-live="polite"></div><div class="mf-btns"><button class="mf-b mf-m" id="mfMyth">Myth</button><button class="mf-b mf-f" id="mfFact">Fact</button></div><div class="row"><button class="btn btn-primary btn-sm" id="mfNext" hidden>Next</button><button class="${B}" id="mfNew">New round</button></div></div>`,
  () => {
    const card = $("#mfCard"), msg = $("#mfMsg");
    // tricky statements, half myths and half facts, never the same ones twice until the whole set has been seen
    const MY = MYTH_HARD.filter((m) => m.a === "myth"), FA = MYTH_HARD.filter((m) => m.a === "fact");
    let q, i, right, done;
    function round() { q = shuffle([...pickFresh("wwa-myth-seen-m", MY, (m) => m.q, 5), ...pickFresh("wwa-myth-seen-f", FA, (m) => m.q, 5)]).map((m) => ({ t: m.q, a: m.a, e: m.e })); i = 0; right = 0; show(); }
    function show() {
      done = false; const c = q[i]; $("#mfNext").hidden = true; $("#mfMyth").disabled = $("#mfFact").disabled = false;
      card.className = "mf-card"; card.innerHTML = `<p class="mf-q">${esc(c.t)}</p><p class="mf-e"></p>`;
      msg.textContent = `Statement ${i + 1} of ${q.length} · ${right} right`;
    }
    function ans(a) {
      if (done) return; done = true; const c = q[i], ok = a === c.a; if (ok) right++;
      card.classList.add(ok ? "ok" : "no"); $(".mf-e", card).innerHTML = `<strong>${ok ? "Right." : "Not quite."}</strong> This is a ${c.a}. ${esc(c.e)}`;
      $("#mfMyth").disabled = $("#mfFact").disabled = true;
      if (ready()) tone(ok ? PENTA[5] : PENTA[1], 0.5, 0.07);
      msg.textContent = `Statement ${i + 1} of ${q.length} · ${right} right`;
      $("#mfNext").textContent = i === q.length - 1 ? "See my score" : "Next"; $("#mfNext").hidden = false; $("#mfNext").focus({ preventScroll: true });
    }
    $("#mfMyth").addEventListener("click", () => ans("myth")); $("#mfFact").addEventListener("click", () => ans("fact"));
    $("#mfNext").addEventListener("click", () => {
      if (i === q.length - 1) { report(right); card.className = "mf-card"; card.innerHTML = `<p class="mf-q">${right} out of ${q.length}</p><p class="mf-e">${right >= 9 ? "You know this ground well." : right >= 6 ? "A solid result. The evidence is on the science and library pages if you want to go deeper." : "A good place to start. The science page walks through each answer with the evidence."}</p>`; $("#mfNext").hidden = true; $("#mfMyth").disabled = $("#mfFact").disabled = true; msg.textContent = "Round complete"; return; }
      i++; show();
    });
    $("#mfNew").addEventListener("click", round); round();
    return { key(e) { if (e.key === "m" || e.key === "M") { ans("myth"); return true; } if (e.key === "f" || e.key === "F") { ans("fact"); return true; } if (e.key === "Enter" && !$("#mfNext").hidden) { $("#mfNext").click(); return true; } return false; } };
  });

/* ---------------------------------------------------------------- Word garden (word search) */
const WORDS = ["LOVE", "PRIDE", "HOPE", "CARE", "SAFE", "PROUD", "BRAVE", "KIND", "TRUST", "HOME", "UNITY", "JOY", "ALLY", "FREE", "EQUAL", "RESPECT", "BELONG", "HEAL", "CALM", "SHINE", "FAMILY", "COURAGE"];
game("words",
  `<div class="ws"><div class="row"><span class="game-msg" id="wsMsg"></span></div><div class="ws-board" id="wsBoard" aria-label="Word search grid. Drag across letters in a straight line to select a word."></div><ul class="ws-list" id="wsList"></ul><div class="row"><button class="${B}" id="wsHint">Reveal a letter</button><button class="${B}" id="wsNew">New garden</button></div></div>`,
  () => {
    const N = 10, board = $("#wsBoard"), list = $("#wsList"), msg = $("#wsMsg");
    const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
    let grid, words, found, cells, a = -1, b = -1, t0, done, timer, place;
    function make() {
      words = shuffle(WORDS.slice()).slice(0, 8).sort((x, y) => y.length - x.length); grid = Array(N * N).fill(""); place = [];
      for (const w of words) {
        let ok = false;
        for (let tries = 0; tries < 200 && !ok; tries++) {
          const [dx, dy] = DIRS[rnd(DIRS.length)], rev = Math.random() < 0.25, s = rev ? [...w].reverse().join("") : w;
          const x0 = rnd(N), y0 = rnd(N), x1 = x0 + dx * (w.length - 1), y1 = y0 + dy * (w.length - 1);
          if (x1 < 0 || x1 >= N || y1 < 0 || y1 >= N) continue;
          let fits = true; for (let k = 0; k < w.length; k++) { const v = grid[(y0 + dy * k) * N + x0 + dx * k]; if (v && v !== s[k]) { fits = false; break; } }
          if (!fits) continue;
          for (let k = 0; k < w.length; k++) grid[(y0 + dy * k) * N + x0 + dx * k] = s[k];
          place.push({ w, start: y0 * N + x0, dx, dy }); ok = true;
        }
        if (!ok) return make();
      }
      grid = grid.map((v) => v || String.fromCharCode(65 + rnd(26)));
      found = new Set(); cells = new Map(); done = false; t0 = Date.now(); clearInterval(timer);
      timer = setInterval(() => { if (!done && !document.hidden) paintMsg(); }, 1000);
      build();
    }
    const clock = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
    function paintMsg() { msg.textContent = done ? `All ${words.length} words found in ${clock()}. Wonderful.` : `${found.size} of ${words.length} found · ${clock()}`; }
    function build() {
      board.style.gridTemplateColumns = `repeat(${N},1fr)`; board.innerHTML = "";
      grid.forEach((ch, i) => board.appendChild(h("div", { class: "ws-c", "data-i": i }, ch)));
      list.innerHTML = ""; words.forEach((w) => list.appendChild(h("li", { "data-w": w }, w)));
      paint();
    }
    function line(i, j) {
      const x0 = i % N, y0 = Math.floor(i / N), dx = (j % N) - x0, dy = Math.floor(j / N) - y0;
      if (!dx && !dy) return [i];
      const L = Math.max(Math.abs(dx), Math.abs(dy)); let sx = Math.sign(dx), sy = Math.sign(dy);
      if (Math.abs(dx) !== Math.abs(dy)) { if (Math.abs(dx) > Math.abs(dy) * 2) sy = 0; else if (Math.abs(dy) > Math.abs(dx) * 2) sx = 0; else { /* closest diagonal */ } }
      const out = []; for (let k = 0; k <= L; k++) { const x = x0 + sx * k, y = y0 + sy * k; if (x < 0 || x >= N || y < 0 || y >= N) break; out.push(y * N + x); }
      return out;
    }
    function paint(sel = []) {
      [...board.children].forEach((c, i) => { c.className = "ws-c" + (cells.has(i) ? " f f" + (cells.get(i) % 6) : "") + (sel.includes(i) ? " s" : ""); });
      $$("#wsList li").forEach((li) => li.classList.toggle("done", found.has(li.dataset.w)));
      paintMsg();
    }
    const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList.contains("ws-c") ? +el.dataset.i : -1; };
    board.addEventListener("pointerdown", (e) => { if (done) return; const i = cellAt(e); if (i < 0) return; a = b = i; board.setPointerCapture(e.pointerId); paint(line(a, b)); });
    board.addEventListener("pointermove", (e) => { if (a < 0) return; const i = cellAt(e); if (i < 0 || i === b) return; b = i; paint(line(a, b)); });
    const end = () => {
      if (a < 0) return; const L = line(a, b), s = L.map((i) => grid[i]).join(""), r = [...s].reverse().join(""), w = words.find((x) => !found.has(x) && (x === s || x === r));
      if (w) { found.add(w); const k = found.size; L.forEach((i) => cells.set(i, k)); if (ready()) tone(PENTA[k % PENTA.length] * 2, 0.6, 0.07); if (found.size === words.length) { done = true; report(Math.floor((Date.now() - t0) / 1000), { low: true }); if (ready()) bowl(262); } }
      a = b = -1; paint();
    };
    board.addEventListener("pointerup", end); board.addEventListener("pointercancel", () => { a = b = -1; paint(); });
    $("#wsHint").addEventListener("click", () => {
      const left = place.filter((p) => !found.has(p.w)); if (!left.length) return;
      const p = left[rnd(left.length)], i = p.start; board.children[i].classList.add("hint"); setTimeout(() => board.children[i]?.classList.remove("hint"), 2200);
    });
    $("#wsNew").addEventListener("click", make); make();
    return { destroy() { clearInterval(timer); } };
  });

/* ---------------------------------------------------------------- Gratitude jar */
game("jar",
  `<div class="gj"><div class="row gj-form"><input class="text-in" id="gjIn" type="text" maxlength="80" placeholder="Something good, big or small…" aria-label="Something you are grateful for"><button class="btn btn-primary btn-sm" id="gjAdd">Add to the jar</button></div><canvas id="gjCv" aria-label="A glass jar of glowing marbles, one for each thing you are grateful for. Tap a marble to read it."></canvas><p class="gj-note" id="gjNote" aria-live="polite">Tap a marble to read it.</p><div class="row"><button class="${B}" id="gjShake">Shake the jar</button><button class="${B}" id="gjPick">Pull one out</button><button class="${B}" id="gjClear">Empty the jar</button></div><p class="muted small gj-tip">Your jar is saved only in this browser, on this device. Nobody else can see it.</p></div>`,
  () => {
    const ink = { fg: "#111" }; const readInk = () => { ink.fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#111"; }; readInk(); addEventListener("themechange", readInk);
    const marble = (k) => sprite("marble" + k, 96, 96, (x) => { const gr = x.createRadialGradient(34, 30, 2, 48, 48, 46); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.35, `hsl(${k},85%,70%)`); gr.addColorStop(1, `hsl(${(k + 30) % 360},75%,52%)`); x.fillStyle = gr; x.beginPath(); x.arc(48, 48, 46, 0, 7); x.fill(); });
    const c = $("#gjCv"), KEY = "wwa-jar"; let g = fit(c), M = [], clearArm = false, selected = -1;
    const load = () => { const s = store(KEY); return Array.isArray(s) ? s.slice(-80) : []; };
    let notes = load();
    const R = () => Math.max(13, Math.min(22, c.clientWidth / 22));
    const jar = () => { const W = c.clientWidth, H = c.clientHeight, w = Math.min(W * 0.84, H * 0.8), x = (W - w) / 2; return { x, y: H * 0.1, w, h: H * 0.86, l: x + 8, r: x + w - 8, floor: H * 0.96 - 8 }; };
    function spawn(n, i, drop) { const J = jar(); M.push({ x: J.l + R() + Math.random() * (J.r - J.l - 2 * R()), y: drop ? J.y - 20 - Math.random() * 40 : J.y + Math.random() * J.h * 0.5, vx: 0, vy: 0, r: R(), h: (i * 47) % 360, i, n }); }
    function rebuild() { M = []; notes.forEach((n, i) => spawn(n, i, false)); }
    rebuild();
    const note = $("#gjNote");
    function add() { const v = $("#gjIn").value.trim(); if (!v) return; notes.push(v); notes = notes.slice(-80); store(KEY, notes); spawn(v, notes.length - 1, true); $("#gjIn").value = ""; note.textContent = "Added. That's one more good thing."; if (ready()) tone(PENTA[rnd(PENTA.length)] * 2, 0.7, 0.07); }
    $("#gjAdd").addEventListener("click", add);
    $("#gjIn").addEventListener("keydown", (e) => { if (e.key === "Enter") add(); e.stopPropagation(); });
    $("#gjShake").addEventListener("click", () => { M.forEach((m) => { m.vy -= 6 + Math.random() * 6; m.vx += (Math.random() - 0.5) * 8; }); });
    $("#gjPick").addEventListener("click", () => { if (!notes.length) { note.textContent = "The jar is empty. Add something you are grateful for."; return; } const i = rnd(notes.length); selected = i; note.textContent = notes[i]; });
    $("#gjClear").addEventListener("click", function () { if (!clearArm) { clearArm = true; this.textContent = "Tap again to empty it"; setTimeout(() => { clearArm = false; this.textContent = "Empty the jar"; }, 3000); return; } notes = []; store(KEY, notes); M = []; selected = -1; note.textContent = "The jar is empty and ready for new things."; clearArm = false; this.textContent = "Empty the jar"; });
    c.addEventListener("pointerdown", (e) => { const [x, y] = pos(c, e); let best = null; M.forEach((m) => { if (Math.hypot(m.x - x, m.y - y) < m.r + 6) best = m; }); if (best) { selected = best.i; note.textContent = best.n; if (ready()) tone(PENTA[best.i % PENTA.length] * 2, 0.5, 0.05); } });
    return {
      destroy() { removeEventListener("themechange", readInk); },
      resize() { g = fit(c); rebuild(); },
      frame() {
        const W = c.clientWidth, H = c.clientHeight, J = jar(); g.clearRect(0, 0, W, H);
        for (let s = 0; s < 2; s++) {
          M.forEach((m) => { m.vy += 0.38; m.vx *= 0.995; m.x += m.vx; m.y += m.vy; if (m.x < J.l + m.r) { m.x = J.l + m.r; m.vx *= -0.4; } if (m.x > J.r - m.r) { m.x = J.r - m.r; m.vx *= -0.4; } if (m.y > J.floor - m.r) { m.y = J.floor - m.r; m.vy *= -0.35; m.vx *= 0.96; if (Math.abs(m.vy) < 0.6) m.vy = 0; } });
          for (let i = 0; i < M.length; i++) for (let j = i + 1; j < M.length; j++) {
            const A = M[i], Bm = M[j], dx = Bm.x - A.x, dy = Bm.y - A.y, d = Math.hypot(dx, dy) || 0.01, min = A.r + Bm.r;
            if (d < min) { const o = (min - d) / 2, nx = dx / d, ny = dy / d; A.x -= nx * o; A.y -= ny * o; Bm.x += nx * o; Bm.y += ny * o; const rv = (Bm.vx - A.vx) * nx + (Bm.vy - A.vy) * ny; if (rv < 0) { A.vx += nx * rv * 0.5; A.vy += ny * rv * 0.5; Bm.vx -= nx * rv * 0.5; Bm.vy -= ny * rv * 0.5; } }
          }
        }
        const fg = ink.fg;
        g.lineWidth = 3; g.strokeStyle = fg; g.globalAlpha = 0.55; g.beginPath(); g.roundRect ? g.roundRect(J.x, J.y, J.w, J.h, 36) : g.rect(J.x, J.y, J.w, J.h); g.stroke(); g.globalAlpha = 1;
        g.beginPath(); g.moveTo(J.x + J.w * 0.12, J.y - 4); g.lineTo(J.x + J.w * 0.88, J.y - 4); g.stroke();
        M.forEach((m) => {
          const sel = m.i === selected, k = Math.round(m.h / 12) * 12 % 360;
          if (sel) g.drawImage(glow("sel" + k, 40, "255,236,170"), m.x - m.r * 1.9, m.y - m.r * 1.9, m.r * 3.8, m.r * 3.8);
          g.drawImage(marble(k), m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
        });
      }
    };
  });
