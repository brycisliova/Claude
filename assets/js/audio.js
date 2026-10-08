// Web Audio engine: every sound is synthesised live in the browser. No audio files, no downloads.
import { toast } from "./core.js";

let AC = null, master = null, analyser = null, reverb = null;
export const PENTA = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];

export function ac() {
  if (AC) { if (AC.state === "suspended") AC.resume(); return AC; }
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) { toast("Sound isn't supported in this browser."); return null; }
  AC = new C();
  master = AC.createGain(); master.gain.value = 0.9;
  analyser = AC.createAnalyser(); analyser.fftSize = 256;
  master.connect(analyser); analyser.connect(AC.destination);
  reverb = AC.createConvolver();
  const len = AC.sampleRate * 3.5, ir = AC.createBuffer(2, len, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  reverb.buffer = ir;
  const rg = AC.createGain(); rg.gain.value = 0.55; reverb.connect(rg); rg.connect(master);
  return AC;
}
export const ready = () => !!AC;
export const context = () => AC;
export const masterGain = () => master;
export const reverbNode = () => reverb;
export const analyserNode = () => analyser;

function noiseBuf(type) {
  const len = AC.sampleRate * 4, b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (type === "white") d[i] = w * 0.5;
    else if (type === "pink") { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; }
    else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  }
  return b;
}
export function noiseSrc(type) { const s = AC.createBufferSource(); s.buffer = noiseBuf(type); s.loop = true; return s; }
export function lfo(freq, depth, target) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); return o; }

export function blip(out, f, dur, vol, type) {
  const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
  o.type = type || "sine"; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
// Fire-and-forget tone that stays silent until the visitor has started audio.
export function tone(f, dur, vol, type) { if (AC) blip(master, f, dur, vol, type); }

export function bowl(baseHz) {
  if (!ac()) return;
  const b = baseHz || 196 + Math.random() * 40, t = AC.currentTime;
  [[1, 0.35, 12], [2.76, 0.18, 9], [5.4, 0.09, 6], [8.93, 0.04, 4], [1.006, 0.25, 12]].forEach(([m, v, d]) => {
    const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = b * m;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); g.connect(reverb); o.start(t); o.stop(t + d + 0.1);
  });
}
