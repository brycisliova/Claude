import { $, $$, h, fit, onFrame, reduce, reveal } from "../core.js";
import { ac, context, masterGain, reverbNode, analyserNode, noiseSrc, lfo, blip, bowl } from "../audio.js";

const svg = (d) => `<svg class="ico" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const CHANNELS = [
  { id: "rain", name: "Rain", c: "sky", ico: svg('<path d="M7 14a4 4 0 0 1 .5-7.900A5 5 0 0 1 17 8a3.500 3.500 0 0 1 0 6"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>'), build(out) {
    const AC = context(), s = noiseSrc("pink"), hp = AC.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 500;
    const lp = AC.createBiquadFilter(); lp.frequency.value = 9000;
    s.connect(hp); hp.connect(lp); lp.connect(out); s.start();
    const iv = setInterval(() => { if (Math.random() < 0.7) blip(out, 2500 + Math.random() * 3500, 0.03, 0.05 * Math.random()); }, 60);
    return () => { s.stop(); clearInterval(iv); };
  } },
  { id: "ocean", name: "Ocean", c: "b", ico: svg('<path d="M2 12c2.500 0 2.500-5 5-5s2.500 10 5 10 2.500-10 5-10 2.500 5 5 5"/><path d="M2 18c2.500 0 2.500-3 5-3s2.500 6 5 6 2.500-6 5-6 2.500 3 5 3" opacity=".5"/>'), build(out) {
    const AC = context(), s = noiseSrc("brown"), lp = AC.createBiquadFilter(); lp.frequency.value = 800;
    const g = AC.createGain(); g.gain.value = 0.5; const l = lfo(0.08, 0.45, g.gain);
    s.connect(lp); lp.connect(g); g.connect(out); s.start();
    return () => { s.stop(); l.stop(); };
  } },
  { id: "wind", name: "Wind", c: "g", ico: svg('<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h8"/>'), build(out) {
    const AC = context(), s = noiseSrc("white"), bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 1.4;
    const l = lfo(0.11, 280, bp.frequency), g = AC.createGain(); g.gain.value = 0.8;
    s.connect(bp); bp.connect(g); g.connect(out); s.start();
    return () => { s.stop(); l.stop(); };
  } },
  { id: "fire", name: "Fireplace", c: "o", ico: svg('<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>'), build(out) {
    const AC = context(), s = noiseSrc("brown"), lp = AC.createBiquadFilter(); lp.frequency.value = 350;
    s.connect(lp); lp.connect(out); s.start();
    const iv = setInterval(() => { if (Math.random() < 0.35) blip(out, 800 + Math.random() * 2400, 0.015 + Math.random() * 0.03, 0.12 * Math.random(), "square"); }, 90);
    return () => { s.stop(); clearInterval(iv); };
  } },
  { id: "stream", name: "Stream", c: "sky", ico: svg('<path d="M4 9c2-2 3 2 5 0s3 2 5 0 3 2 5 0"/><path d="M4 15c2-2 3 2 5 0s3 2 5 0 3 2 5 0"/>'), build(out) {
    const AC = context(), s = noiseSrc("white"), bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.6;
    const l = lfo(3.3, 400, bp.frequency), g = AC.createGain(); g.gain.value = 0.5;
    s.connect(bp); bp.connect(g); g.connect(out); s.start();
    return () => { s.stop(); l.stop(); };
  } },
  { id: "night", name: "Night crickets", c: "v", ico: svg('<path d="M21 12.800A9 9 0 1 1 11.200 3a7 7 0 0 0 9.800 9.800z"/>'), build(out) {
    const iv = setInterval(() => { const b = 4200 + Math.random() * 600; for (let k = 0; k < 3; k++) setTimeout(() => blip(out, b, 0.04, 0.03), k * 70); }, 900);
    return () => clearInterval(iv);
  } }
];

const active = {};
const mixer = $("#mixer");
CHANNELS.forEach((ch) => {
  const card = h("div", { class: "card chan reveal", style: `--c:var(--${ch.c})` },
    `<span class="c-ico">${ch.ico}</span><h3 class="ct">${ch.name}</h3><input type="range" min="0" max="100" value="60" aria-label="${ch.name} volume"><button class="btn btn-ghost btn-sm">Play</button>`);
  const btn = card.querySelector("button"), vol = card.querySelector("input");
  btn.addEventListener("click", () => {
    const AC = ac(); if (!AC) return;
    if (active[ch.id]) {
      const a = active[ch.id]; a.g.gain.setTargetAtTime(0, AC.currentTime, 0.3); setTimeout(a.stop, 1200);
      delete active[ch.id]; btn.textContent = "Play"; card.classList.remove("on"); return;
    }
    const g = AC.createGain(); g.gain.value = 0; g.connect(masterGain()); g.gain.setTargetAtTime((vol.value / 100) * 0.7, AC.currentTime, 0.5);
    active[ch.id] = { g, stop: ch.build(g) };
    btn.textContent = "Stop"; card.classList.add("on");
  });
  vol.addEventListener("input", () => { if (active[ch.id]) active[ch.id].g.gain.setTargetAtTime((vol.value / 100) * 0.7, context().currentTime, 0.1); });
  mixer.appendChild(card);
});
reveal(mixer);

$("#bowl").addEventListener("click", () => bowl());

/* ambient music that composes itself */
const SCALES = {
  dawn: [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25],
  night: [196, 220, 261.63, 293.66, 329.63, 392, 440],
  rain: [220, 246.94, 261.63, 329.63, 349.23, 440, 493.88]
};
let amb = null;
function ambNote() {
  if (!amb) return;
  const AC = context(), sc = SCALES[$("#ambMood").value], f = sc[Math.floor(Math.random() * sc.length)] * (Math.random() < 0.25 ? 0.5 : 1);
  const t = AC.currentTime, dur = 4 + Math.random() * 4;
  [["triangle", 1, 0.07], ["sine", 2, 0.03]].forEach(([type, m, v]) => {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f * m;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(amb.out); g.connect(reverbNode()); o.start(t); o.stop(t + dur + 0.1);
  });
  amb.t = setTimeout(ambNote, 700 + Math.random() * 2200);
}
$("#ambBtn").addEventListener("click", function () {
  const AC = ac(); if (!AC) return;
  if (amb) { clearTimeout(amb.t); amb = null; this.textContent = "Play"; return; }
  const out = AC.createGain(); out.gain.value = 1;
  const dl = AC.createDelay(); dl.delayTime.value = 0.45;
  const fb = AC.createGain(); fb.gain.value = 0.35;
  out.connect(masterGain()); out.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(masterGain());
  amb = { out }; this.textContent = "Stop"; ambNote();
});

/* binaural beats */
let bin = null;
$("#binBtn").addEventListener("click", function () {
  const AC = ac(); if (!AC) return;
  if (bin) { bin.forEach((n) => { try { n.stop(); } catch (e) {} }); bin = null; this.textContent = "Play"; return; }
  const beat = +$("#binFreq").value, g = AC.createGain(); g.gain.value = 0.12; g.connect(masterGain());
  bin = [[-1, 200], [1, 200 + beat]].map(([pan, f]) => {
    const o = AC.createOscillator(); o.frequency.value = f;
    const p = AC.createStereoPanner(); p.pan.value = pan; o.connect(p); p.connect(g); o.start(); return o;
  });
  this.textContent = "Stop";
});

/* stop everything + sleep timer */
let sleepT = null;
function stopAll() {
  Object.keys(active).forEach((k) => { active[k].stop(); delete active[k]; });
  $$(".chan").forEach((c) => { c.classList.remove("on"); c.querySelector("button").textContent = "Play"; });
  if (amb) { clearTimeout(amb.t); amb = null; $("#ambBtn").textContent = "Play"; }
  if (bin) { bin.forEach((n) => { try { n.stop(); } catch (e) {} }); bin = null; $("#binBtn").textContent = "Play"; }
  if (masterGain()) masterGain().gain.setValueAtTime(0.9, context().currentTime);
  clearTimeout(sleepT); sleepT = null; $("#sleepOut").textContent = "";
}
$("#stopAll").addEventListener("click", stopAll);
$("#sleepBtn").addEventListener("click", () => {
  const AC = ac(); if (!AC) return;
  const m = +$("#sleepMin").value; clearTimeout(sleepT);
  const end = Date.now() + m * 60000;
  $("#sleepOut").textContent = `Fading out at ${new Date(end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
  sleepT = setTimeout(() => { masterGain().gain.setTargetAtTime(0, AC.currentTime, 8); sleepT = setTimeout(stopAll, 40000); }, Math.max(0, m * 60000 - 30000));
});

/* live spectrum */
const viz = $("#viz");
let vg = fit(viz), visible = true;
new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(viz);
addEventListener("resize", () => { vg = fit(viz); });
function drawViz() {
  if (!visible) return;
  const W = viz.clientWidth, H = viz.clientHeight, an = analyserNode();
  vg.clearRect(0, 0, W, H);
  const n = 64, bw = W / n, data = new Uint8Array(an ? an.frequencyBinCount : n);
  if (an) an.getByteFrequencyData(data);
  for (let i = 0; i < n; i++) {
    const v = data[i] / 255, bh = Math.max(3, v * H * 0.9);
    vg.fillStyle = `hsl(${260 - i * 3},80%,${55 + v * 20}%)`;
    vg.beginPath();
    if (vg.roundRect) vg.roundRect(i * bw + 2, H - bh, bw - 4, bh, 4); else vg.rect(i * bw + 2, H - bh, bw - 4, bh);
    vg.fill();
  }
}
if (!reduce) onFrame(drawViz); else drawViz();
