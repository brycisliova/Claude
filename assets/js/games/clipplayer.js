// A steady player for short song clips. The clip is downloaded in full and decoded first, then played from memory, so it
// cannot stall or stop half way the way a streamed file can on a weak connection. If decoding is not possible it falls
// back to a normal audio element. States: idle, loading, ready, playing, paused, ended, needtap, error.
export function clipPlayer(onState) {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, gain = null, buf = null, node = null, startAt = 0, offset = 0, state = "idle", token = 0, url = "", want = false, el = null, mode = "wa", dur = 30;
  const bytes = new Map(), decoded = new Map();
  const set = (s) => { state = s; onState?.(s); };

  function context() {
    if (ctx || !AC) return ctx;
    try { ctx = new AC(); gain = ctx.createGain(); gain.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  // Call from a tap or click. It wakes the audio system (phones keep it asleep until the first touch) and, on iPhones,
  // makes the clip play even when the silent switch is on.
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* older browsers */ }
    const c = context(); if (c && c.state !== "running") c.resume().catch(() => {});
    if (el && el.paused && want) el.play().catch(() => {});
  }
  const fetchBytes = (u) => {
    if (!bytes.has(u)) {
      const p = fetch(u).then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.arrayBuffer(); });
      bytes.set(u, p); p.catch(() => bytes.delete(u)); while (bytes.size > 6) bytes.delete(bytes.keys().next().value);
    }
    return bytes.get(u);
  };
  const decode = (u) => {
    if (!decoded.has(u)) {
      const c = context(); if (!c) return Promise.reject(new Error("no audio"));
      const p = fetchBytes(u).then((ab) => new Promise((res, rej) => { const r = c.decodeAudioData(ab.slice(0), res, rej); if (r?.then) r.then(res, rej); }));
      decoded.set(u, p); p.catch(() => decoded.delete(u)); while (decoded.size > 4) decoded.delete(decoded.keys().next().value);
    }
    return decoded.get(u);
  };
  function drop() {
    if (node) { node.onended = null; try { node.stop(); } catch (e) { /* already stopped */ } try { node.disconnect(); } catch (e) { /* gone */ } node = null; }
    if (el) { el.onended = el.onerror = el.onplaying = el.onpause = null; try { el.pause(); } catch (e) { /* gone */ } el.removeAttribute("src"); try { el.load(); } catch (e) { /* gone */ } el = null; }
  }
  // Loads a clip. With autoplay it starts as soon as it is ready if the browser allows, otherwise it asks for a tap.
  async function load(u, autoplay) {
    const my = ++token; drop(); url = u; buf = null; offset = 0; want = !!autoplay; mode = "wa"; set("loading");
    try {
      const b = await decode(u); if (my !== token) return; buf = b; dur = b.duration || 30; set("ready");
      if (want) play(true);
    } catch (e) {
      if (my !== token) return;
      mode = "el"; el = new Audio(); el.preload = "auto"; el.src = u; dur = 30;
      el.onended = () => { if (my === token) set("ended"); }; el.onplaying = () => { if (my === token) set("playing"); }; el.onpause = () => { if (my === token && state === "playing" && !el.ended) set("paused"); };
      el.onerror = () => { if (my === token) set("error"); };
      set("ready"); if (want) play(true);
    }
  }
  function prepare(u) { if (u && u !== url) { fetchBytes(u).catch(() => {}); } }
  async function play(auto) {
    want = true;
    if (state === "loading") return;
    if (mode === "el") { try { await el.play(); } catch (e) { set(auto ? "needtap" : "error"); } return; }
    if (!buf || !ctx) return;
    if (ctx.state !== "running") { await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 180))]); if (ctx.state !== "running") { set("needtap"); return; } }
    if (node) return;
    const n = ctx.createBufferSource(); n.buffer = buf; n.connect(gain); const my = token;
    n.onended = () => { if (node === n && my === token) { node = null; offset = 0; set("ended"); } };
    startAt = ctx.currentTime; if (offset >= dur - 0.05) offset = 0; n.start(0, offset); node = n; set("playing");
  }
  function pause() {
    want = false;
    if (mode === "el") { el?.pause(); return; }
    if (!node) return; offset += ctx.currentTime - startAt; node.onended = null; try { node.stop(); } catch (e) { /* already stopped */ } try { node.disconnect(); } catch (e) { /* gone */ } node = null; set("paused");
  }
  function toggle() {
    unlock();
    if (state === "playing") return pause();
    if (state === "error") return load(url, true);
    if (state === "ended") offset = 0, mode === "el" && el && (el.currentTime = 0);
    play(false);
  }
  const position = () => (mode === "el" ? el?.currentTime || 0 : state === "playing" && ctx ? offset + ctx.currentTime - startAt : offset);
  function stop() { token++; want = false; drop(); buf = null; offset = 0; set("idle"); }
  const onVis = () => { if (!document.hidden && ctx && ctx.state === "suspended" && state === "playing") ctx.resume().catch(() => {}); };
  document.addEventListener("visibilitychange", onVis);
  return { load, prepare, play, pause, toggle, unlock, stop, position, get state() { return state; }, get duration() { return dur; }, destroy() { stop(); document.removeEventListener("visibilitychange", onVis); try { ctx?.close(); } catch (e) { /* closed */ } ctx = null; bytes.clear(); decoded.clear(); } };
}
