// The "Play together" screens: create or join a room, the lobby, and mounting a multiplayer game once it starts.
import { h, esc, store, toast } from "../core.js";
import { Room, COLORS, cleanName, normCode, prettyCode, roomLink } from "./room.js";

const ERR = {
  unreachable: "Couldn't reach the game server. Check your connection and try again. Some school and work networks block it.",
  notfound: "No room with that code. Check the letters, or ask the host to share the link again.",
  badcode: "A room code has six letters and numbers.",
  full: "That room is full.", started: "That game has already started. Ask the host to start a new one.", removed: "The host removed you from the room.", noanswer: "The host didn't answer. They may have closed the room."
};
const nickNow = () => { let n = cleanName(store("wwa-nick") || ""); if (!n) { n = "Guest " + (100 + Math.floor(Math.random() * 900)); store("wwa-nick", n); } return n; };
export const dot = (p, size = "") => `<span class="tg-dot ${size}" style="--pc:${COLORS[p.color % COLORS.length]}" aria-hidden="true">${esc((p.name || "?").trim().slice(0, 1).toUpperCase())}</span>`;

export function mountTogether(box, def, opts = {}) {
  let room = null, view = null, engine = null, timers = [], dead = false, curDef = def, barFn = null;
  const after = (ms, fn) => { const t = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  /* ---------- entry: name, create, join ---------- */
  const flag = (on) => document.dispatchEvent(new CustomEvent("tg:room", { detail: on }));
  function entry(prefill = "", msg = "") {
    teardownGame(); room?.leave(); room = null; flag(false);
    const lim = curDef ? `<p class="muted small">${curDef.min === curDef.max ? `${curDef.min} players` : `${curDef.min} to ${curDef.max} players`}, each on their own phone, tablet or computer.</p>` : "";
    box.innerHTML = `<div class="tg"><div class="tg-in">
      <p class="tg-lead">${curDef ? "Play " + esc(curDef.title) + " with friends" : "Join a game"}</p>${lim}
      <label class="tg-lab" for="tgName">Your name</label>
      <input class="text-in tg-name" id="tgName" maxlength="14" autocomplete="off" value="${esc(nickNow())}" aria-describedby="tgNote">
      <div class="tg-cols">
        ${curDef ? `<div class="tg-card"><h3>Start a room</h3><p>You get a code and a link to share. When everyone is in, you press Start.</p><button class="btn btn-primary" id="tgCreate" type="button"><span class="btn-t">Create a room</span></button></div>` : ""}
        <div class="tg-card"><h3>Join with a code</h3><p>Got a code or a link from a friend? Type the code here.</p><div class="row"><input class="text-in tg-codein" id="tgCode" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC DEF" value="${esc(prefill)}" aria-label="Room code"><button class="btn btn-ghost" id="tgJoin" type="button"><span class="btn-t">Join</span></button></div></div>
      </div>
      <p class="tg-msg" id="tgMsg" role="status">${esc(msg)}</p>
      <p class="muted small" id="tgNote">Anyone who has the code or link can join your room, so share it only with people you want to play with. Don't use your real name if you'd rather not. Only your nickname and your moves are shared, through a free public game relay, and nothing is saved.</p>
    </div></div>`;
    const say = (t, busy) => { const m = box.querySelector("#tgMsg"); if (m) { m.textContent = t; m.classList.toggle("busy", !!busy); } };
    const name = () => { const n = cleanName(box.querySelector("#tgName").value) || nickNow(); store("wwa-nick", n); return n; };
    box.querySelector("#tgCreate")?.addEventListener("click", async () => {
      say("Setting up your room…", true); disable(true);
      try { room = await Room.create({ game: curDef.id, nick: name(), max: curDef.max, min: curDef.min }); if (dead) return room.leave(); wire(); lobby(); }
      catch (e) { disable(false); say(ERR.unreachable); }
    });
    const join = async () => {
      const code = normCode(box.querySelector("#tgCode").value); say("Looking for the room…", true); disable(true);
      try {
        const r = await Room.open(code, name()); if (dead) return r.leave();
        const found = opts.defs?.get(r.game);
        if (!found) { r.leave(); disable(false); return say("That room is playing a game this version doesn't have."); }
        curDef = found; opts.onGame?.(found);
        room = r; await room.enter(name()); wire(); room.started ? startGame(room.opts, true) : lobby();
      } catch (e) { room?.leave(); room = null; disable(false); say(ERR[e.reason] || ERR.unreachable); }
    };
    box.querySelector("#tgJoin").addEventListener("click", join);
    box.querySelector("#tgCode").addEventListener("keydown", (e) => { if (e.key === "Enter") join(); e.stopPropagation(); });
    box.querySelector("#tgName").addEventListener("keydown", (e) => e.stopPropagation());
    box.querySelector("#tgCode").addEventListener("input", (e) => { const v = normCode(e.target.value); e.target.value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v; });
    function disable(b) { box.querySelectorAll("button,input").forEach((x) => (x.disabled = b)); }
    if (prefill && opts.autoJoin) join();
  }

  /* ---------- wiring the room's events ---------- */
  function wire() {
    const r = room, live = (fn) => (...a) => { if (room === r && !dead) fn(...a); };
    r.on("players", live(() => { if (!r.started) lobbyPlayers(); else view?.players?.(); }))
      .on("start", live((o, late) => (late && view ? view.render?.(r.state) : startGame(o, late))))
      .on("lobby", live((g) => { const d = opts.defs?.get(g); if (d) { curDef = d; opts.onGame?.(d); } teardownGame(); lobby(); }))
      .on("state", live((s) => view?.render?.(s)))
      .on("msg", live((d) => view?.msg?.(d)))
      .on("reject", live((why) => { toast(ERR[why] || "Removed from the room."); entry("", ERR[why] || ""); }))
      .on("closed", live((why) => { teardownGame(); clearTimers(); gameover(why); }))
      .on("hostlost", live(() => banner("The host seems to have lost their connection. Waiting…")))
      .on("status", live((st) => banner(st === "reconnecting" ? "Reconnecting…" : "")))
      .on("act", live((pid, a) => engine?.act?.(pid, a)))
      .on("left", live((pid) => engine?.left?.(pid)));
  }
  function banner(t) { const b = box.querySelector(".tg-banner"); if (b) { b.textContent = t; b.hidden = !t; } }
  function gameover(why) { box.innerHTML = `<div class="tg"><div class="tg-in"><p class="tg-lead">${esc(why)}</p><div class="row"><button class="btn btn-primary" id="tgBack" type="button"><span class="btn-t">Back</span></button></div></div></div>`; box.querySelector("#tgBack").addEventListener("click", () => entry()); }

  /* ---------- lobby ---------- */
  function lobby() {
    flag(true);
    const r = room, link = roomLink(r.code), opt = curDef.options || [];
    box.innerHTML = `<div class="tg"><div class="tg-in tg-lobby">
      <p class="tg-lead">${r.isHost ? "Your room is ready" : "You're in"}</p>
      <div class="tg-codebox"><span class="tg-codelab">Room code</span><strong class="tg-code" aria-label="Room code ${esc(r.code.split("").join(" "))}">${esc(prettyCode(r.code))}</strong></div>
      <div class="row tg-share"><button class="btn btn-ghost btn-sm" id="tgCopyC" type="button">Copy code</button><button class="btn btn-ghost btn-sm" id="tgCopyL" type="button">Copy link</button>${navigator.share ? `<button class="btn btn-primary btn-sm" id="tgShare" type="button">Share…</button>` : ""}</div>
      <p class="tg-banner" role="status" hidden></p>
      ${r.isHost && opts.defs && opts.defs.size > 1 ? `<label class="tg-pick">Game<select class="mini" id="tgGameSel">${[...opts.defs.values()].map((d) => `<option value="${esc(d.id)}"${d.id === curDef.id ? " selected" : ""}>${esc(d.title)} (${d.min === d.max ? d.min : d.min + " to " + d.max} players)</option>`).join("")}</select></label>` : `<p class="tg-game-now">Game: <b>${esc(curDef.title)}</b></p>`}
      <h3 class="tg-h">Players <span id="tgCount"></span></h3>
      <ul class="tg-players" id="tgPlayers"></ul>
      ${r.isHost && opt.length ? `<div class="tg-opts">${opt.map((o) => `<label>${esc(o.label)}<select class="mini" data-o="${o.id}">${o.choices.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(o.def) ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`).join("")}</div>` : ""}
      <p class="tg-wait" id="tgWait"></p>
      ${r.isHost ? `<button class="btn btn-primary" id="tgStart" type="button" disabled><span class="btn-t">Start game</span></button>` : ""}
      <div class="row"><button class="btn btn-ghost btn-sm" id="tgLeave" type="button">Leave room</button></div>
    </div></div>`;
    const copy = async (txt, ok) => { try { await navigator.clipboard.writeText(txt); toast(ok); } catch (e) { toast("Couldn't copy here. Select it and copy by hand."); } };
    box.querySelector("#tgCopyC").addEventListener("click", () => copy(r.code, "Code copied"));
    box.querySelector("#tgCopyL").addEventListener("click", () => copy(link, "Link copied"));
    box.querySelector("#tgShare")?.addEventListener("click", () => navigator.share({ title: "Play " + curDef.title + " with me", text: `Join my game of ${curDef.title}. Room code ${prettyCode(r.code)}.`, url: link }).catch(() => {}));
    box.querySelector("#tgLeave").addEventListener("click", () => entry());
    box.querySelector("#tgGameSel")?.addEventListener("change", (e) => { const d = opts.defs.get(e.target.value); if (!d) return; r.backToLobby(d.id, d.max, d.min); });
    box.querySelector("#tgStart")?.addEventListener("click", () => {
      const o = {}; box.querySelectorAll("[data-o]").forEach((s) => (o[s.dataset.o] = s.value));
      r.begin(o); startGame(o, false);
    });
    lobbyPlayers();
  }
  function lobbyPlayers() {
    const r = room, ul = box.querySelector("#tgPlayers"); if (!ul) return;
    ul.innerHTML = r.players.map((p) => `<li>${dot(p)}<span class="tg-pn">${esc(p.name)}</span>${p.host ? `<em>Host</em>` : ""}${p.id === r.pid ? `<em class="me">You</em>` : ""}${p.away ? `<em class="away">Away</em>` : ""}${r.isHost && !p.host ? `<button class="tg-rm" data-id="${esc(p.id)}" type="button" aria-label="Remove ${esc(p.name)}">Remove</button>` : ""}</li>`).join("");
    ul.querySelectorAll(".tg-rm").forEach((b) => b.addEventListener("click", () => r.kick(b.dataset.id)));
    const n = r.players.length; box.querySelector("#tgCount").textContent = `${n} of ${r.max}`; const over = n > curDef.max;
    const need = Math.max(0, curDef.min - n), st = box.querySelector("#tgStart"), w = box.querySelector("#tgWait");
    if (st) { st.disabled = need > 0 || over; st.querySelector(".btn-t").textContent = over ? `Too many for ${curDef.title}` : need ? `Waiting for ${need} more` : `Start game with ${n}`; }
    if (w) w.textContent = r.isHost ? (over ? `${curDef.title} takes up to ${curDef.max} players. Pick another game or remove someone.` : need ? `Share the code or link. You need at least ${curDef.min} players.` : "Everyone here? Choose any options, then start.") : `Waiting for ${r.host?.name || "the host"} to start the game…`;
  }

  /* ---------- the game itself ---------- */
  function teardownGame() { if (barFn && room) room.off("players", barFn); barFn = null; clearTimers(); try { view?.destroy?.(); } catch (e) { /* ignore */ } try { engine?.destroy?.(); } catch (e) { /* ignore */ } view = null; engine = null; }
  function startGame(o, late) {
    teardownGame(); const r = room; flag(true);
    box.innerHTML = `<div class="tg-game"><div class="tg-bar"><span class="tg-room">Room <b>${esc(prettyCode(r.code))}</b></span><span class="tg-ppl" id="tgPpl"></span>${r.isHost ? `<button class="btn btn-ghost btn-sm" id="tgChange" type="button">Change game</button>` : ""}<button class="btn btn-ghost btn-sm" id="tgLeave2" type="button">Leave</button></div><p class="tg-banner" role="status" hidden></p><div class="tg-view" id="tgView"></div></div>`;
    const bar = () => { const el = box.querySelector("#tgPpl"); if (el) el.innerHTML = r.players.map((p) => `<span class="tg-chip${p.away ? " away" : ""}" title="${esc(p.name)}${p.away ? " (away)" : ""}">${dot(p)}</span>`).join(""); };
    bar(); barFn = bar; r.on("players", bar);
    box.querySelector("#tgLeave2").addEventListener("click", () => { r.leave(); entry(); });
    box.querySelector("#tgChange")?.addEventListener("click", () => { if (confirm("Go back to the lobby? Everyone stays in the room and you can pick any game or setting.")) r.backToLobby(); });
    const api = { room: r, get me() { return r.me; }, get players() { return r.players; }, isHost: r.isHost, act: (a) => r.act(a), rematch: () => r.rematch(), leave: () => { r.leave(); entry(); }, opts: o };
    view = curDef.view(box.querySelector("#tgView"), api);
    if (r.isHost) {
      const ctx = { room: r, get players() { return r.players; }, push: (s) => r.push(s), after, reply: (pid, d) => (pid === r.pid ? r.emit("msg", d) : r.reply(pid, d)), opts: o };
      engine = curDef.host(ctx); engine.start(o); r.on("left", (id) => engine?.left?.(id));
    } else if (late && r.state) view.render(r.state);
    else r.send("sync", {});
  }

  entry(opts.code || "");
  return { destroy() { dead = true; teardownGame(); room?.leave(); room = null; flag(false); }, get room() { return room; } };
}
