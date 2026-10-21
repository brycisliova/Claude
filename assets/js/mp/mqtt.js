// A very small MQTT 3.1.1 client for browsers, over WebSocket. It supports exactly what the game rooms need:
// connect with a "last will", subscribe, publish (optionally retained) and keep-alive. No dependencies.
const enc = new TextEncoder(), dec = new TextDecoder();
const utf = (s) => { const b = enc.encode(s); return [b.length >> 8, b.length & 255, ...b]; };
const varlen = (n) => { const o = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; o.push(d); } while (n > 0); return o; };

export class Mqtt {
  constructor(url, { clientId, will = null, keepalive = 30 } = {}) {
    this.url = url; this.clientId = clientId; this.will = will; this.keepalive = keepalive;
    this.handlers = new Set(); this.closeHandlers = new Set(); this.buf = new Uint8Array(0); this.pid = 1; this.open = false; this.wanted = false;
  }
  onMessage(fn) { this.handlers.add(fn); return () => this.handlers.delete(fn); }
  onClose(fn) { this.closeHandlers.add(fn); }
  connect(timeoutMs = 6000) {
    return new Promise((resolve, reject) => {
      let settled = false; const fail = (e) => { if (!settled) { settled = true; reject(e); try { this.ws?.close(); } catch (x) { /* ignore */ } } };
      const timer = setTimeout(() => fail(new Error("timeout")), timeoutMs);
      let ws;
      try { ws = new WebSocket(this.url, "mqtt"); } catch (e) { clearTimeout(timer); return reject(e); }
      this.ws = ws; ws.binaryType = "arraybuffer"; this.wanted = true;
      ws.onopen = () => {
        const flags = 0x02 | (this.will ? 0x04 | (this.will.retain ? 0x20 : 0) : 0);
        const vh = [0, 4, 77, 81, 84, 84, 4, flags, this.keepalive >> 8, this.keepalive & 255];
        let pl = utf(this.clientId);
        if (this.will) { pl = pl.concat(utf(this.will.topic)); const wp = enc.encode(this.will.payload || ""); pl = pl.concat([wp.length >> 8, wp.length & 255, ...wp]); }
        const body = vh.concat(pl); ws.send(new Uint8Array([0x10, ...varlen(body.length), ...body]));
      };
      ws.onmessage = (e) => {
        this.lastRx = Date.now();
        const add = new Uint8Array(e.data); const nb = new Uint8Array(this.buf.length + add.length); nb.set(this.buf); nb.set(add, this.buf.length); this.buf = nb;
        for (;;) {
          if (this.buf.length < 2) return;
          let mult = 1, len = 0, i = 1, d;
          do { if (i >= this.buf.length) return; d = this.buf[i++]; len += (d & 127) * mult; mult *= 128; } while (d & 128 && i < 5);
          if (this.buf.length < i + len) return;
          const type = this.buf[0] >> 4, flagsB = this.buf[0] & 15, body = this.buf.slice(i, i + len); this.buf = this.buf.slice(i + len);
          if (type === 2) { if (body[1] === 0) { this.open = true; if (!settled) { settled = true; clearTimeout(timer); this.lastRx = Date.now(); this.ping = setInterval(() => { if (Date.now() - this.lastRx > this.keepalive * 1500) { try { this.ws.close(); } catch (e) { /* ignore */ } return; } this.raw([0xc0, 0]); }, (this.keepalive * 1000) / 2); resolve(); } } else fail(new Error("refused " + body[1])); }
          else if (type === 3) {
            const tl = (body[0] << 8) | body[1], topic = dec.decode(body.slice(2, 2 + tl)); let off = 2 + tl; if ((flagsB >> 1) & 3) off += 2;
            const payload = dec.decode(body.slice(off)); this.handlers.forEach((f) => { try { f(topic, payload); } catch (err) { console.error(err); } });
          }
        }
      };
      ws.onerror = () => fail(new Error("socket error"));
      ws.onclose = () => { clearTimeout(timer); clearInterval(this.ping); const was = this.open; this.open = false; if (!settled) fail(new Error("closed")); else if (was) this.closeHandlers.forEach((f) => f()); };
    });
  }
  raw(arr) { if (this.ws?.readyState === 1) this.ws.send(new Uint8Array(arr)); }
  subscribe(topic) { const body = [this.pid >> 8, this.pid & 255, ...utf(topic), 0]; this.pid = (this.pid % 65534) + 1; this.raw([0x82, ...varlen(body.length), ...body]); }
  publish(topic, payload, retain = false) { const p = enc.encode(payload || ""), t = utf(topic); this.raw([0x30 | (retain ? 1 : 0), ...varlen(t.length + p.length), ...t, ...p]); }
  close() { this.wanted = false; clearInterval(this.ping); try { this.raw([0xe0, 0]); this.ws?.close(); } catch (e) { /* ignore */ } this.open = false; }
}
