// Rooms for playing together. One player is the host: they run the game and everyone else sends them moves.
// Everything travels through a public MQTT broker on topics named after the room code. Only nicknames and moves
// are sent. Nothing is stored, and a room disappears when its host leaves.
import { Mqtt } from "./mqtt.js";
import { MULTIPLAYER } from "../config.js";

const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const NS = "sfgames/v1";
export const COLORS = ["#E85D75", "#2D9CDB", "#F2B93B", "#4FC48A", "#7E5BEF", "#F2802F", "#E86CB5", "#2FB5B0"];
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHA[b % ALPHA.length]).join("");
export const cleanName = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 14);
export const normCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

function brokerList() {
  const q = new URLSearchParams(location.search).get("mqtt");
  if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return [q];
  return MULTIPLAYER.brokers;
}
const codeFor = (idx, n) => { let c = ""; for (let i = 0; i < 5; i++) c += ALPHA[Math.floor(Math.random() * ALPHA.length)]; let k; do { k = ALPHA[Math.floor(Math.random() * ALPHA.length)]; } while (ALPHA.indexOf(k) % n !== idx); return c + k; };
const brokerOf = (code) => ALPHA.indexOf(code[5]) % brokerList().length;
export const prettyCode = (c) => c.slice(0, 3) + " " + c.slice(3);
export const roomLink = (c) => `${location.origin}${location.pathname}#r-${c}`;

export class Room {
  constructor(code, isHost, nick) {
    this.code = code; this.isHost = isHost; this.nick = cleanName(nick) || "Guest"; this.pid = uid(); this.h = {}; this.players = []; this.seq = 0; this.n = 0;
    this.base = `${NS}/${code}`; this.started = false; this.left = false; this.lastHost = Date.now(); this.seen = {}; this.info = null; this.state = null; this.opts = {};
  }
  on(ev, fn) { (this.h[ev] ||= []).push(fn); return this; }
  off(ev, fn) { this.h[ev] = (this.h[ev] || []).filter((f) => f !== fn); }
  emit(ev, ...a) { (this.h[ev] || []).forEach((f) => { try { f(...a); } catch (e) { console.error(e); } }); }
  get me() { return this.players.find((p) => p.id === this.pid); }
  get host() { return this.players.find((p) => p.host); }

  /* ---- creating and joining ---- */
  static async create({ game, nick, max, min }) {
    const list = brokerList(); let lastErr;
    for (let idx = 0; idx < list.length; idx++) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const code = codeFor(idx, list.length), room = new Room(code, true, nick); room.game = game; room.max = max; room.min = min;
        try { await room.connect(list[idx], { topic: `${room.base}/room`, payload: "", retain: true }); } catch (e) { lastErr = e; break; }
        // a retained message here means the code is already in use
        const taken = await new Promise((res) => { const off = room.mq.onMessage((t) => { if (t.endsWith("/room")) { off(); res(true); } }); setTimeout(() => { off(); res(false); }, 450); });
        if (taken) { room.mq.close(); continue; }
        room.players = [{ id: room.pid, name: room.nick, color: 0, host: true, away: false }];
        room.publishRoom(); room.beat(); return room;
      }
    }
    throw lastErr || new Error("unreachable");
  }
  // Connect to an existing room and read its details. Call enter(nick) afterwards to actually take a seat.
  static async open(code, nick = "") {
    code = normCode(code); if (code.length !== 6) throw Object.assign(new Error("bad code"), { reason: "badcode" });
    const room = new Room(code, false, nick);
    try { await room.connect(brokerList()[brokerOf(code)]); } catch (e) { throw Object.assign(new Error("unreachable"), { reason: "unreachable" }); }
    const info = await new Promise((res) => { const off = room.mq.onMessage((t, p) => { if (t.endsWith("/room") && p) { off(); try { res(JSON.parse(p)); } catch (e) { res(null); } } }); setTimeout(() => { off(); res(null); }, 3500); });
    if (!info) { room.mq.close(); throw Object.assign(new Error("not found"), { reason: "notfound" }); }
    room.info = info; room.game = info.g; room.max = info.max; room.beat(); return room;
  }
  enter(nick) {
    this.nick = cleanName(nick) || this.nick;
    return new Promise((resolve, reject) => {
      const done = (fn, v) => { clearTimeout(t); this.off("welcome", w); this.off("reject", r); fn(v); };
      const w = () => done(resolve), r = (reason) => done(reject, Object.assign(new Error(reason), { reason }));
      this.on("welcome", w).on("reject", r);
      const t = setTimeout(() => done(reject, Object.assign(new Error("no answer"), { reason: "noanswer" })), 5000);
      this.send("join", { name: this.nick });
    });
  }

  /* ---- plumbing ---- */
  async connect(url, will) {
    this.url = url; this.will = will || null;
    this.mq = new Mqtt(url, { clientId: "sf" + this.pid + Math.random().toString(36).slice(2, 6), will: this.will });
    await this.mq.connect();
    this.mq.onMessage((t, p) => this.route(t, p));
    this.mq.onClose(() => this.dropped());
    this.mq.subscribe(`${this.base}/m`); this.mq.subscribe(`${this.base}/room`);
  }
  async dropped() {
    if (this.left) return; this.emit("status", "reconnecting");
    for (let i = 0; i < 6 && !this.left; i++) {
      await new Promise((r) => setTimeout(r, 1200 + i * 800));
      try { await this.connect(this.url, this.will); this.emit("status", "online"); if (this.isHost) this.publishRoom(); else this.send("join", { name: this.nick }); return; } catch (e) { /* retry */ }
    }
    if (!this.left) this.emit("closed", "Lost the connection.");
  }
  send(t, d, to) { if (!this.mq?.open) return; this.mq.publish(`${this.base}/m`, JSON.stringify({ v: 1, t, f: this.pid, to, d })); }
  publishRoom() {
    if (!this.isHost || this.left) return;
    this.mq.publish(`${this.base}/room`, JSON.stringify({ g: this.game, h: this.nick, n: this.players.length, max: this.max, st: this.started ? "play" : "lobby", ts: Date.now() }), true);
  }
  beat() {
    this.hb = setInterval(() => {
      if (this.left) return clearInterval(this.hb);
      this.send("hb", this.isHost ? { s: this.n } : {});
      const now = Date.now();
      if (this.isHost) {
        let changed = false;
        this.players.forEach((p) => { if (p.host) return; const away = now - (this.seen[p.id] || now) > 20000; if (away !== p.away) { p.away = away; changed = true; } });
        if (!this.started) { const keep = this.players.filter((p) => p.host || now - (this.seen[p.id] || now) < 45000); if (keep.length !== this.players.length) { this.players = keep; changed = true; } }
        if (changed) this.syncPlayers();
      } else if (now - this.lastHost > 25000 && !this.lostFlag) { this.lostFlag = true; this.emit("hostlost"); }
    }, 5000);
  }
  syncPlayers() { this.send("players", this.players); this.publishRoom(); this.emit("players", this.players); }

  /* ---- incoming ---- */
  route(topic, payload) {
    if (!topic.endsWith("/m")) return;
    let m; try { m = JSON.parse(payload); } catch (e) { return; }
    if (!m || m.v !== 1 || typeof m.t !== "string" || typeof m.f !== "string" || m.f.length > 12 || m.f === this.pid) return;
    if (m.to && m.to !== this.pid) return;
    this.seen[m.f] = Date.now();
    this.isHost ? this.hostMsg(m) : this.clientMsg(m);
  }
  hostMsg(m) {
    const d = m.d && typeof m.d === "object" ? m.d : {};
    if (m.t === "join") {
      let p = this.players.find((x) => x.id === m.f);
      if (p) { p.away = false; p.left = false; if (d.name) p.name = cleanName(d.name) || p.name; }
      else {
        if (this.started) return this.send("reject", "started", m.f);
        if (this.players.length >= this.max) return this.send("reject", "full", m.f);
        const used = new Set(this.players.map((x) => x.color)); let c = 0; while (used.has(c)) c++;
        p = { id: m.f, name: cleanName(d.name) || "Guest", color: c, host: false, away: false }; this.players.push(p);
      }
      this.send("welcome", { players: this.players, game: this.game, started: this.started, opts: this.opts, state: this.state, n: this.n, max: this.max }, m.f);
      this.syncPlayers();
    } else if (m.t === "leave") { this.removePlayer(m.f); }
    else if (m.t === "act") { if (this.players.some((x) => x.id === m.f)) this.emit("act", m.f, d); }
    else if (m.t === "sync") { if (this.state) this.send("st", { n: this.n, s: this.state }, m.f); }
  }
  removePlayer(id) {
    const p = this.players.find((x) => x.id === id); if (!p || p.host) return;
    if (this.started) { p.away = true; p.left = true; } else this.players = this.players.filter((x) => x.id !== id);
    this.syncPlayers(); this.emit("left", id);
  }
  clientMsg(m) {
    this.lastHost = Date.now(); this.lostFlag = false;
    if (m.t === "welcome") { const d = m.d; this.players = d.players; this.started = d.started; this.opts = d.opts || {}; this.game = d.game; this.max = d.max; this.seq = d.n || 0; this.state = d.state; this.emit("welcome", d); if (d.started && d.state) this.emit("start", this.opts, true); }
    else if (m.t === "players") { this.players = m.d; this.emit("players", this.players); }
    else if (m.t === "start") { this.started = true; this.opts = m.d || {}; this.seq = 0; this.state = null; this.emit("start", this.opts, false); }
    else if (m.t === "st") { if (m.d && m.d.n > this.seq) { this.seq = m.d.n; this.state = m.d.s; this.emit("state", m.d.s); } }
    else if (m.t === "msg") this.emit("msg", m.d);
    else if (m.t === "reject") this.emit("reject", m.d);
    else if (m.t === "end") { this.left = true; this.cleanup(); this.emit("closed", m.d || "The host closed the room."); }
  }

  /* ---- host and player actions ---- */
  begin(opts) { // host: everyone moves from the lobby into the game
    this.started = true; this.opts = opts || {}; this.n = 0; this.state = null;
    this.players.forEach((p) => { p.left = false; });
    this.send("start", this.opts); this.publishRoom();
  }
  rematch(opts) { this.begin(opts || this.opts); this.emit("start", this.opts, false); }
  push(view) { this.n++; this.state = view; this.send("st", { n: this.n, s: view }); this.emit("state", view); } // host: share the latest game state
  reply(pid, d) { this.send("msg", d, pid); }
  act(a) { this.isHost ? this.emit("act", this.pid, a) : this.send("act", a); } // anyone: send a move
  kick(id) { if (this.isHost) { this.send("reject", "removed", id); this.removePlayer(id); } }
  leave() {
    if (this.left) return; this.left = true;
    try {
      if (this.isHost) { this.send("end", "The host left, so the room closed."); this.mq.publish(`${this.base}/room`, "", true); } else this.send("leave", {});
    } catch (e) { /* ignore */ }
    setTimeout(() => this.cleanup(), 200);
  }
  cleanup() { clearInterval(this.hb); try { this.mq?.close(); } catch (e) { /* ignore */ } }
}
