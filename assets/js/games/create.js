import { $, $$, h, fit, pos, B, game, report, shuffle, rnd, reduce, savePng } from "./shared.js";
import { tone, PENTA, ready } from "../audio.js";

/* ---------------------------------------------------------------- Mandala colouring */
const PAL = ["#E85D75", "#F2994A", "#F2C94C", "#6FCF97", "#2D9CDB", "#7E5BEF", "#F5A9C4", "#A8E3F0", "#FFFFFF", "#2B2B33"];
game("mandala",
  `<div class="md"><div class="md-pal" id="mdPal" role="group" aria-label="Colours"></div><svg class="md-svg" id="mdSvg" viewBox="-300 -300 600 600" role="img" aria-label="A mandala to colour in. Tap or drag across the shapes to fill them."></svg><div class="row"><label class="muted small" for="mdSym">Mirror</label><select class="mini" id="mdSym"><option value="16">Every petal</option><option value="8">8 ways</option><option value="4">4 ways</option><option value="1">Off</option></select><button class="${B}" id="mdUndo">Undo</button><button class="${B}" id="mdRand">Surprise me</button><button class="${B}" id="mdClear">Clear</button><button class="btn btn-primary btn-sm" id="mdSave">Save picture</button></div></div>`,
  () => {
    const svg = $("#mdSvg"), NS = "http://www.w3.org/2000/svg", SEG = 16, RINGS = 7, R0 = 46, R1 = 288, dr = (R1 - R0) / RINGS;
    let col = PAL[0], paths = [], hist = [], down = false, last = -1;
    const pal = $("#mdPal");
    PAL.forEach((c, i) => { const b = h("button", { class: "md-sw", style: `background:${c}`, "aria-label": `Colour ${i + 1}`, "aria-pressed": String(i === 0) }); b.addEventListener("click", () => { col = c; $$(".md-sw", pal).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }); pal.appendChild(b); });
    const eraser = h("button", { class: "md-sw md-er", "aria-label": "Eraser", "aria-pressed": "false" }, "⌫"); eraser.addEventListener("click", () => { col = ""; $$(".md-sw", pal).forEach((x) => x.setAttribute("aria-pressed", String(x === eraser))); }); pal.appendChild(eraser);
    const pt = (r, a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    function sector(r0, r1, a0, a1) { return `M ${pt(r0, a0)} L ${pt(r1, a0)} A ${r1} ${r1} 0 0 1 ${pt(r1, a1)} L ${pt(r0, a1)} A ${r0} ${r0} 0 0 0 ${pt(r0, a0)} Z`; }
    function build() {
      svg.innerHTML = "";
      const centre = document.createElementNS(NS, "circle"); centre.setAttribute("r", R0 - 3); centre.setAttribute("class", "md-p"); centre.dataset.k = "c"; svg.appendChild(centre);
      paths = [centre];
      for (let r = 0; r < RINGS; r++) for (let s = 0; s < SEG; s++) {
        const a0 = (s / SEG) * Math.PI * 2 - Math.PI / 2, a1 = ((s + 1) / SEG) * Math.PI * 2 - Math.PI / 2, wob = r % 2 ? 0.0 : 0;
        const p = document.createElementNS(NS, "path"); p.setAttribute("d", sector(R0 + r * dr, R0 + (r + 1) * dr - 2, a0 + wob, a1 + wob)); p.setAttribute("class", "md-p"); p.dataset.r = r; p.dataset.s = s; svg.appendChild(p); paths.push(p);
      }
    }
    build();
    const sym = () => +$("#mdSym").value;
    function paint(p, record) {
      if (!p || !p.classList.contains("md-p")) return;
      const targets = [];
      if (p.dataset.k === "c") targets.push(p);
      else { const r = +p.dataset.r, s = +p.dataset.s, n = sym(), step = SEG / n; for (let k = 0; k < SEG; k += step) targets.push(paths[1 + r * SEG + ((s + k) % SEG)]); }
      const before = targets.map((t) => [t, t.style.fill]);
      let changed = false; targets.forEach((t) => { if ((t.style.fill || "") !== col) { changed = true; t.style.fill = col; } });
      if (changed && record) hist.push(before);
      if (changed && ready() && Math.random() < 0.35) tone(PENTA[rnd(PENTA.length)] * 2, 0.5, 0.03);
    }
    const under = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList?.contains("md-p") ? el : null; };
    svg.addEventListener("pointerdown", (e) => { const p = under(e); if (!p) return; down = true; svg.setPointerCapture(e.pointerId); hist.push("mark"); paint(p, true); last = p; });
    svg.addEventListener("pointermove", (e) => { if (!down) return; const p = under(e); if (p && p !== last) { paint(p, true); last = p; } });
    ["pointerup", "pointercancel"].forEach((ev) => svg.addEventListener(ev, () => { down = false; last = null; }));
    function undo() { while (hist.length) { const h0 = hist.pop(); if (h0 === "mark") break; h0.forEach(([t, f]) => (t.style.fill = f)); } }
    $("#mdUndo").addEventListener("click", undo);
    $("#mdClear").addEventListener("click", () => { hist = []; paths.forEach((p) => (p.style.fill = "")); });
    $("#mdRand").addEventListener("click", () => {
      hist = []; const half = SEG / 2;
      for (let r = 0; r < RINGS; r++) { const c = PAL[rnd(8)], c2 = PAL[rnd(8)]; for (let s = 0; s < SEG; s++) { const use = (r + s) % 2 === 0 ? c : c2; if (Math.random() < 0.88) paths[1 + r * SEG + s].style.fill = use; else paths[1 + r * SEG + s].style.fill = ""; } }
      paths[0].style.fill = PAL[rnd(8)];
    });
    $("#mdSave").addEventListener("click", () => {
      const clone = svg.cloneNode(true); clone.setAttribute("xmlns", NS); clone.setAttribute("width", 1200); clone.setAttribute("height", 1200);
      $$(".md-p", clone).forEach((p) => { p.setAttribute("stroke", "#2B2B33"); p.setAttribute("stroke-width", "1.4"); p.setAttribute("fill", p.style.fill || "#FBFAF7"); p.removeAttribute("style"); });
      const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 1200; const g = c.getContext("2d"); g.fillStyle = "#FBFAF7"; g.fillRect(0, 0, 1200, 1200); g.drawImage(img, 0, 0, 1200, 1200); savePng(c, "#FBFAF7", "my-mandala"); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    });
  });

/* ---------------------------------------------------------------- Clear the window */
game("fog",
  `<canvas id="fgCv" aria-label="A rainy window covered in mist. Drag to wipe it clear."></canvas><div class="row"><span class="muted small">Drag to wipe the glass. The mist drifts back slowly.</span><button class="${B}" id="fgFog">Fog it up again</button><button class="${B}" id="fgSave">Save picture</button></div>`,
  () => {
    const c = $("#fgCv"); let g = fit(c), scene, fog, fgx, drops = [], down = false, last = null, W, H, bokeh = [];
    function paintScene() {
      W = c.clientWidth; H = c.clientHeight; const d = Math.min(2, devicePixelRatio || 1);
      scene = document.createElement("canvas"); scene.width = W * d; scene.height = H * d; const s = scene.getContext("2d"); s.scale(d, d);
      const gr = s.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1a1a3a"); gr.addColorStop(0.6, "#3b2a55"); gr.addColorStop(1, "#7a3b57"); s.fillStyle = gr; s.fillRect(0, 0, W, H);
      bokeh = Array.from({ length: 46 }, () => ({ x: Math.random() * W, y: H * (0.35 + Math.random() * 0.6), r: 10 + Math.random() * 44, h: [20, 35, 200, 320, 280][rnd(5)], a: 0.25 + Math.random() * 0.5 }));
      bokeh.forEach((b) => { const rg = s.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r); rg.addColorStop(0, `hsla(${b.h},90%,65%,${b.a})`); rg.addColorStop(1, `hsla(${b.h},90%,60%,0)`); s.fillStyle = rg; s.beginPath(); s.arc(b.x, b.y, b.r, 0, 7); s.fill(); });
      fog = document.createElement("canvas"); fog.width = W * d; fog.height = H * d; fgx = fog.getContext("2d"); fgx.scale(d, d); refog();
    }
    function refog() { fgx.globalCompositeOperation = "source-over"; fgx.clearRect(0, 0, W, H); fgx.fillStyle = "rgba(214,220,232,.84)"; fgx.fillRect(0, 0, W, H); for (let i = 0; i < W * H / 60; i++) { fgx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`; fgx.fillRect(Math.random() * W, Math.random() * H, 2, 2); } }
    function wipe(x, y, r = 34) { fgx.globalCompositeOperation = "destination-out"; const rg = fgx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(0.65, "rgba(0,0,0,.85)"); rg.addColorStop(1, "rgba(0,0,0,0)"); fgx.fillStyle = rg; fgx.beginPath(); fgx.arc(x, y, r, 0, 7); fgx.fill(); fgx.globalCompositeOperation = "source-over"; }
    function seg(a, b) { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8) || 1; for (let i = 0; i <= n; i++) wipe(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); }
    paintScene();
    c.addEventListener("pointerdown", (e) => { down = true; c.setPointerCapture(e.pointerId); last = pos(c, e); wipe(...last); });
    c.addEventListener("pointermove", (e) => { if (!down) return; const p = pos(c, e); seg(last, p); last = p; });
    ["pointerup", "pointercancel"].forEach((ev) => c.addEventListener(ev, () => (down = false)));
    $("#fgFog").addEventListener("click", refog);
    $("#fgSave").addEventListener("click", () => { const t = document.createElement("canvas"); t.width = scene.width; t.height = scene.height; const x = t.getContext("2d"); x.drawImage(scene, 0, 0); x.drawImage(fog, 0, 0); savePng(t, "#1a1a3a", "rainy-window"); });
    return {
      resize() { g = fit(c); paintScene(); },
      frame() {
        if (Math.random() < 0.08 && drops.length < 26) drops.push({ x: Math.random() * W, y: -6, v: 0.6 + Math.random() * 1.4, r: 2 + Math.random() * 3.5, w: Math.random() * 6 });
        fgx.fillStyle = "rgba(214,220,232,.012)"; fgx.fillRect(0, 0, W, H);
        drops.forEach((d) => { d.w += 0.06; d.y += d.v; d.x += Math.sin(d.w) * 0.25; if (Math.random() < 0.05) d.v = 0.4 + Math.random() * 2; wipe(d.x, d.y, d.r * 1.3); });
        drops = drops.filter((d) => d.y < H + 10);
        g.clearRect(0, 0, W, H); g.drawImage(scene, 0, 0, W, H); g.drawImage(fog, 0, 0, W, H);
        drops.forEach((d) => { g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(d.x, d.y, d.r * 0.8, d.r * 1.15, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.arc(d.x - d.r * 0.25, d.y - d.r * 0.3, d.r * 0.28, 0, 7); g.fill(); });
      }
    };
  });
