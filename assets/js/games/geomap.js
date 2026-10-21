// A small, dependency-free world map on a canvas: Web Mercator, drag to pan, wheel / pinch / buttons to zoom,
// tap to drop a pin. It draws country outlines from assets/data/world.json (Natural Earth, public domain),
// so the game makes no map-tile requests and tells no one where you are looking.
const RAD = Math.PI / 180;
export const haversine = (a, b) => { const dLat = (b.lat - a.lat) * RAD, dLon = (b.lon - a.lon) * RAD, s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(s))); };
// the colour of "how far": bright green when spot on, through amber, to a dark red at the far end of the world
export const kmColor = (km) => { const t = Math.min(1, Math.pow(Math.max(km, 0) / 6500, 0.55)); return `hsl(${Math.round(135 - 135 * Math.pow(t, 0.85))} ${Math.round(72 - 8 * t)}% ${Math.round(54 - 24 * t)}%)`; };
export const scoreFor = (km) => (km < 25 ? 5000 : Math.round(5000 * Math.exp(-km / 1800)));

let WORLD = null, loading = null;
export function loadWorld() {
  if (WORLD) return Promise.resolve(WORLD);
  return (loading ||= fetch(new URL("../../data/world.json", import.meta.url)).then((r) => { if (!r.ok) throw new Error("world"); return r.json(); }).then(prep).then((w) => (WORLD = w)).catch((e) => { loading = null; throw e; }));
}
const nx = (lon) => (lon + 180) / 360;
const ny = (lat) => { const l = Math.max(-85, Math.min(85, lat)) * RAD; return (1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2; };
const invY = (y) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) / RAD;
function prep(j) {
  const rings = [];
  j.countries.forEach((c) => c.r.forEach((e) => {
    const pts = new Float32Array(e.length); let x = 0, y = 0, minX = 9, maxX = -9, minY = 9, maxY = -9;
    for (let i = 0; i < e.length; i += 2) { x += e[i]; y += e[i + 1]; const px = nx(x / 100), py = ny(y / 100); pts[i] = px; pts[i + 1] = py; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; }
    const thin = (n) => { if (pts.length < 80) return pts; const out = []; for (let i = 0; i < pts.length; i += 2 * n) out.push(pts[i], pts[i + 1]); out.push(pts[pts.length - 2], pts[pts.length - 1]); return Float32Array.from(out); };
    rings.push({ pts, mid: thin(2), lo: thin(5), minX, maxX, minY, maxY });
  }));
  return { rings, countries: j.countries.map((c) => ({ n: c.n, x: nx(c.c[0]), y: ny(c.c[1]) })), cities: j.cities.map((c) => ({ n: c[0], x: nx(c[2]), y: ny(c[1]), b: c[3], cap: c[4] })) };
}

export class GeoMap {
  constructor(canvas, world) {
    this.c = canvas; this.g = canvas.getContext("2d"); this.w = world; this.z = 1.6; this.cx = nx(78); this.cy = ny(22); this.pin = null; this.result = null; this.handlers = {}; this.pointers = new Map(); this.raf = 0; this.moved = false; this.locked = false;
    this.readColors(); this.size();
    this.ro = new ResizeObserver(() => { this.size(); this.draw(); }); this.ro.observe(canvas.parentElement || canvas);
    const on = (t, f, o) => { canvas.addEventListener(t, f, o); (this.off ||= []).push(() => canvas.removeEventListener(t, f, o)); };
    on("pointerdown", (e) => this.down(e)); on("pointermove", (e) => this.move(e)); on("pointerup", (e) => this.up(e)); on("pointercancel", (e) => this.up(e, true));
    on("wheel", (e) => { e.preventDefault(); this.zoomAt(e.offsetX, e.offsetY, e.deltaY < 0 ? 0.35 : -0.35); }, { passive: false });
    on("keydown", (e) => this.key(e));
    this.theme = () => { this.readColors(); this.draw(); }; addEventListener("themechange", this.theme);
    this.draw();
  }
  readColors() { const s = getComputedStyle(document.documentElement), v = (n, d) => s.getPropertyValue(n).trim() || d; this.col = { sea: v("--surface2", "#e9e6df"), land: v("--bg", "#f6f4ee"), line: v("--line", "#c9c4b8"), text: v("--fg2", "#555"), ink: v("--fg", "#111") }; }
  size() { const r = this.c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2); this.W = Math.max(60, r.width); this.H = Math.max(60, r.height); this.c.width = Math.round(this.W * d); this.c.height = Math.round(this.H * d); this.g.setTransform(d, 0, 0, d, 0, 0); this.base = null; this.minZ = Math.max(0.2, Math.log2(Math.max(this.W, this.H * 1.05) / 256) - 0.05); if (this.z < this.minZ) this.z = this.minZ; }
  on(ev, fn) { this.handlers[ev] = fn; return this; }
  destroy() { cancelAnimationFrame(this.raf); clearTimeout(this.settle); this.ro.disconnect(); this.off?.forEach((f) => f()); removeEventListener("themechange", this.theme); }
  /* view maths */
  get S() { return 256 * 2 ** this.z; }
  toScreen(x, y, k = 0) { const S = this.S; return [(x + k - this.cx) * S + this.W / 2, (y - this.cy) * S + this.H / 2]; }
  fromScreen(px, py) { const S = this.S; let x = (px - this.W / 2) / S + this.cx; const y = (py - this.H / 2) / S + this.cy; x = ((x % 1) + 1) % 1; return { lat: invY(Math.min(1, Math.max(0, y))), lon: x * 360 - 180 }; }
  clamp() { const S = this.S, halfH = this.H / 2 / S; this.cy = Math.min(Math.max(this.cy, halfH), 1 - halfH); if (S < this.H) this.cy = 0.5; this.cx = ((this.cx % 1) + 1) % 1; }
  zoomAt(px, py, dz) { this.touchAt = performance.now(); const before = this.fromScreen(px, py); this.z = Math.min(9.5, Math.max(this.minZ, this.z + dz)); const S = this.S, x = nx(before.lon), y = ny(before.lat); this.cx = x - (px - this.W / 2) / S; this.cy = y - (py - this.H / 2) / S; this.clamp(); this.queue(); }
  zoomBy(dz) { this.zoomAt(this.W / 2, this.H / 2, dz); }
  fit(points, pad = 70) {
    if (!points.length) return; let minX = 9, maxX = -9, minY = 9, maxY = -9;
    // pick the shortest way round the globe
    const xs = points.map((p) => nx(p.lon)); const spread = Math.max(...xs) - Math.min(...xs); const wrap = spread > 0.5; const xv = wrap ? xs.map((v) => (v < 0.5 ? v + 1 : v)) : xs;
    xv.forEach((v) => { minX = Math.min(minX, v); maxX = Math.max(maxX, v); }); points.forEach((p) => { const y = ny(p.lat); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    const w = Math.max(maxX - minX, 0.004), hh = Math.max(maxY - minY, 0.004);
    this.z = Math.min(9, Math.max(this.minZ, Math.log2(Math.min((this.W - pad * 2) / w, (this.H - pad * 2) / hh) / 256)));
    this.cx = (minX + maxX) / 2; this.cy = (minY + maxY) / 2; this.clamp(); this.queue();
  }
  home() { this.z = Math.max(this.minZ, 1.6); this.cx = nx(60); this.cy = ny(25); this.clamp(); this.queue(); }
  /* input */
  down(e) { this.c.setPointerCapture?.(e.pointerId); this.pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY, sx: e.offsetX, sy: e.offsetY }); this.moved = false; this.pinch = null; }
  move(e) {
    const p = this.pointers.get(e.pointerId); if (!p) return;
    const nxp = e.offsetX, nyp = e.offsetY;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]; const d0 = Math.hypot(a.x - b.x, a.y - b.y); p.x = nxp; p.y = nyp; const d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 0 && d1 > 0) this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, Math.log2(d1 / d0)); this.moved = true; return;
    }
    if (Math.hypot(nxp - p.sx, nyp - p.sy) > 6) this.moved = true;
    if (this.moved) { this.touchAt = performance.now(); const S = this.S; this.cx -= (nxp - p.x) / S; this.cy -= (nyp - p.y) / S; this.clamp(); this.queue(); }
    p.x = nxp; p.y = nyp;
  }
  up(e, cancel) {
    const p = this.pointers.get(e.pointerId); this.pointers.delete(e.pointerId);
    if (p && !cancel && !this.moved && this.pointers.size === 0 && !this.locked) { const at = this.fromScreen(e.offsetX, e.offsetY); this.pin = at; this.handlers.pick?.(at); this.queue(); }
    if (!this.pointers.size) this.moved = false;
  }
  key(e) {
    const S = this.S, step = 0.12 * 256 / S * 2;
    if (e.key === "ArrowLeft") this.cx -= step; else if (e.key === "ArrowRight") this.cx += step; else if (e.key === "ArrowUp") this.cy -= step; else if (e.key === "ArrowDown") this.cy += step;
    else if (e.key === "+" || e.key === "=") this.zoomBy(0.5); else if (e.key === "-") this.zoomBy(-0.5);
    else if (e.key === "Enter" && !this.locked) { const at = this.fromScreen(this.W / 2, this.H / 2); this.pin = at; this.handlers.pick?.(at); }
    else return; e.preventDefault(); this.clamp(); this.queue();
  }
  setPin(p) { this.pin = p; this.queue(); }
  setLocked(b) { this.locked = b; }
  showResult(r) { this.result = r; this.locked = true; const pts = [r.truth, ...r.guesses.map((g) => g.pos)]; this.fit(pts); }
  clearResult() { this.result = null; this.pin = null; this.locked = false; this.home(); }
  queue() { if (this.raf) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); }); }
  /* drawing */
  // The land, borders and graticule are drawn into an offscreen picture. While you drag or zoom, that picture is moved and
  // scaled (cheap) and only redrawn now and then, which keeps panning smooth on phones.
  renderBase() {
    if (!this.bg) { this.bgc = document.createElement("canvas"); this.bg = this.bgc.getContext("2d"); }
    const d = this.c.width / this.W; if (this.bgc.width !== this.c.width || this.bgc.height !== this.c.height) { this.bgc.width = this.c.width; this.bgc.height = this.c.height; }
    const g = this.bg, { W, H, S } = this; g.setTransform(d, 0, 0, d, 0, 0); g.fillStyle = this.col.sea; g.fillRect(0, 0, W, H);
    const k0 = Math.floor(this.cx - W / 2 / S), k1 = Math.ceil(this.cx + W / 2 / S);
    g.lineJoin = "round"; g.fillStyle = this.col.land; g.strokeStyle = this.col.line; g.lineWidth = 0.8;
    g.save(); g.globalAlpha = 0.35; g.lineWidth = 0.6; g.beginPath();
    for (let lat = -60; lat <= 80; lat += 20) { const [, y] = this.toScreen(0, ny(lat)); g.moveTo(0, y); g.lineTo(W, y); }
    for (let lon = -180; lon <= 180; lon += 30) for (let k = k0 - 1; k <= k1; k++) { const [x] = this.toScreen(nx(lon), 0, k); if (x > -2 && x < W + 2) { g.moveTo(x, 0); g.lineTo(x, H); } }
    g.stroke(); g.restore();
    const level = this.z < 2.7 ? "lo" : this.z < 4 ? "mid" : "pts"; g.beginPath();
    for (const r of this.w.rings) {
      for (let k = k0 - 1; k <= k1; k++) {
        const x0 = (r.minX + k - this.cx) * S + W / 2, x1 = (r.maxX + k - this.cx) * S + W / 2, y0 = (r.minY - this.cy) * S + H / 2, y1 = (r.maxY - this.cy) * S + H / 2;
        if (x1 < 0 || x0 > W || y1 < 0 || y0 > H) continue;
        const big = (x1 - x0) > 6 || (y1 - y0) > 6, p = big ? r[level] : r.lo;
        if (!big && (x1 - x0) < 1.2 && (y1 - y0) < 1.2) continue;
        for (let i = 0; i < p.length; i += 2) { const x = (p[i] + k - this.cx) * S + W / 2, y = (p[i + 1] - this.cy) * S + H / 2; i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.closePath();
      }
    }
    g.fill("evenodd"); g.stroke();
    this.base = { cx: this.cx, cy: this.cy, z: this.z }; this.baseAt = performance.now();
  }
  draw() {
    const g = this.g, { W, H } = this, now = performance.now(), busy = now - (this.touchAt || 0) < 170;
    if (!this.base || !busy || now - this.baseAt > 120) this.renderBase();
    const b = this.base, k = 2 ** (this.z - b.z);
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = this.col.sea; g.fillRect(0, 0, this.c.width, this.c.height);
    const d = this.c.width / W; g.setTransform(d, 0, 0, d, 0, 0);
    let dx = b.cx - this.cx; dx -= Math.round(dx);
    const sx = W / 2 + dx * this.S, sy = H / 2 + (b.cy - this.cy) * this.S;
    g.drawImage(this.bgc, 0, 0, this.bgc.width, this.bgc.height, sx - (W * k) / 2, sy - (H * k) / 2, W * k, H * k);
    if (busy && (this.base.cx !== this.cx || this.base.z !== this.z)) { clearTimeout(this.settle); this.settle = setTimeout(() => this.draw(), 180); }
    const k0 = Math.floor(this.cx - W / 2 / this.S), k1 = Math.ceil(this.cx + W / 2 / this.S);
    this.labels(k0, k1);
    if (this.result) this.drawResult(k0, k1); else if (this.pin) this.drawPin(this.pin, this.col.ink, k0, k1, 1);
  }
  labels(k0, k1) {
    const g = this.g, { W, H, S } = this, taken = []; g.textAlign = "center"; g.textBaseline = "middle";
    const free = (x, y, w) => !taken.some((t) => Math.abs(t[0] - x) < (t[2] + w) / 2 && Math.abs(t[1] - y) < 13) && (taken.push([x, y, w]), true);
    if (this.z >= 2.1 && this.z < 7) { g.font = `${this.z < 3.2 ? 10 : 11}px system-ui, sans-serif`; g.fillStyle = this.col.text; g.globalAlpha = 0.85; for (const c of this.w.countries) for (let k = k0; k <= k1; k++) { const [x, y] = this.toScreen(c.x, c.y, k); if (x < 20 || x > W - 20 || y < 8 || y > H - 8) continue; const w = c.n.length * 5.6; if (free(x, y, w)) g.fillText(c.n, x, y); } g.globalAlpha = 1; }
    const minB = this.z < 2.6 ? 8 : this.z < 3.6 ? 7 : this.z < 4.6 ? 6 : this.z < 5.6 ? 5 : 1;
    if (this.z >= 2.6) { g.font = "10px system-ui, sans-serif"; for (const c of this.w.cities) { if (c.b < minB && !(c.cap && this.z > 4)) continue; for (let k = k0; k <= k1; k++) { const [x, y] = this.toScreen(c.x, c.y, k); if (x < 10 || x > W - 10 || y < 8 || y > H - 8) continue; const w = c.n.length * 5.2 + 8; if (!free(x + 4, y, w)) continue; g.fillStyle = this.col.ink; g.globalAlpha = 0.7; g.beginPath(); g.arc(x, y, 2, 0, 6.3); g.fill(); g.globalAlpha = 0.9; g.fillStyle = this.col.text; g.textAlign = "left"; g.fillText(c.n, x + 5, y); g.textAlign = "center"; } } g.globalAlpha = 1; }
  }
  drawPin(p, color, k0, k1, a, label) {
    const g = this.g; for (let k = k0 - 1; k <= k1; k++) {
      const [x, y] = this.toScreen(nx(p.lon), ny(p.lat), k); if (x < -20 || x > this.W + 20 || y < -30 || y > this.H + 20) continue;
      g.globalAlpha = a; g.fillStyle = color; g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 9, 8, 0, 6.3); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - 4, y - 4); g.lineTo(x, y + 1); g.lineTo(x + 4, y - 4); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y - 9, 2.6, 0, 6.3); g.fill();
      if (label) { g.font = "600 11px system-ui, sans-serif"; g.fillStyle = this.col.ink; const tw = g.measureText(label).width, left = x + 12 + tw > this.W - 4; g.textAlign = left ? "right" : "left"; g.fillText(label, left ? x - 12 : x + 12, y - 12); g.textAlign = "center"; } g.globalAlpha = 1;
    }
  }
  drawResult(k0, k1) {
    const g = this.g, { W, H } = this, r = this.result, t = r.truth, [tx0, ty] = this.toScreen(nx(t.lon), ny(t.lat));
    // rings around the true place: the darker the ring, the further away
    const kmPx = (km) => (km / 6371 / (2 * Math.PI)) * this.S / Math.cos(t.lat * RAD);
    [[100, 0.18], [500, 0.14], [1500, 0.1], [3000, 0.08]].forEach(([km, a], i) => { for (let k = k0 - 1; k <= k1; k++) { const [x] = this.toScreen(nx(t.lon), 0, k); g.beginPath(); g.arc(x, ty, kmPx(km) * 1, 0, 6.3); g.strokeStyle = kmColor(km); g.globalAlpha = 0.55; g.lineWidth = 1; g.setLineDash([4, 5]); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; if (this.z > 2.4 && i < 3) { g.fillStyle = kmColor(km); g.font = "10px system-ui, sans-serif"; g.fillText(km + " km", x, ty - kmPx(km) - 5); } } });
    r.guesses.forEach((q) => {
      const near = nearest(t, q.pos); // draw the line the short way round
      for (let k = k0 - 1; k <= k1; k++) { const [x1, y1] = this.toScreen(nx(t.lon), ny(t.lat), k), [x2, y2] = this.toScreen(near.x, near.y, k); g.strokeStyle = kmColor(q.km); g.lineWidth = 3; g.setLineDash([7, 5]); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]); }
      this.drawPin(q.pos, q.color || kmColor(q.km), k0, k1, 1, q.label);
    });
    for (let k = k0 - 1; k <= k1; k++) { const [x, y] = this.toScreen(nx(t.lon), ny(t.lat), k); if (x < -20 || x > W + 20) continue; g.fillStyle = "#0e0e10"; g.strokeStyle = "#fff"; g.lineWidth = 2; star(g, x, y, 11, 5); g.fill(); g.stroke(); g.font = "700 12px system-ui, sans-serif"; g.fillStyle = this.col.ink; g.textAlign = "left"; g.fillText(t.name || "", x + 14, y + 4); g.textAlign = "center"; }
  }
}
function nearest(t, p) { // the copy of p (shifted by whole worlds) that is closest to t, in normalised map units
  let x = nx(p.lon); const tx = nx(t.lon); if (x - tx > 0.5) x -= 1; else if (tx - x > 0.5) x += 1; return { x, y: ny(p.lat) };
}
function star(g, x, y, R, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } g.closePath(); }
