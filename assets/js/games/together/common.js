// Registry and shared pieces for the together-mode games.
import { esc, h, shuffle, rnd } from "../shared.js";
import { COLORS } from "../../mp/room.js";
import { dot } from "../../mp/ui.js";
export { esc, h, shuffle, rnd, COLORS, dot };

export const MP = new Map();
export const mp = (def) => MP.set(def.id, def);
export const colour = (p) => COLORS[(p?.color ?? 0) % COLORS.length];
export const byId = (api, id) => api.players.find((p) => p.id === id);

// Final scoreboard shown at the end of every together game.
// rows: [{ id, score, note }] already in any order; higher score wins unless low is set.
export function results(root, api, rows, { unit = "", low = false, title = "", hide = false } = {}) {
  const sorted = rows.slice().sort((a, b) => (low ? a.score - b.score : b.score - a.score));
  const top = sorted[0]?.score, winners = sorted.filter((r) => r.score === top);
  const name = (id) => byId(api, id)?.name || "Player";
  root.innerHTML = `<div class="mp-end" role="status"><p class="mp-endlab">${esc(title || (winners.length > 1 ? "It's a tie" : "Winner"))}</p><h3>${winners.map((w) => esc(name(w.id))).join(" and ")}</h3><ol>${sorted.map((r, i) => `<li>${dot(byId(api, r.id) || { color: 0, name: "?" })}<span class="mp-en">${esc(name(r.id))}${r.id === api.me?.id ? ` <em>you</em>` : ""}</span><span class="mp-es">${hide ? "" : esc(String(r.score)) + (unit ? " " + esc(unit) : "")}${r.note ? ` <small>${esc(r.note)}</small>` : ""}</span></li>`).join("")}</ol><div class="row">${api.isHost ? `<button class="btn btn-primary" data-r type="button"><span class="btn-t">Play again</span></button>` : `<span class="muted small">Waiting for the host to start another round…</span>`}<button class="btn btn-ghost" data-l type="button"><span class="btn-t">Leave</span></button></div></div>`;
  root.querySelector("[data-r]")?.addEventListener("click", () => api.rematch());
  root.querySelector("[data-l]")?.addEventListener("click", () => api.leave());
}
export const timerBar = (el, ms) => { if (!el) return; el.style.transition = "none"; el.style.width = "100%"; void el.offsetWidth; if (ms > 0) { el.style.transition = `width ${ms}ms linear`; el.style.width = "0%"; } else el.style.width = "0%"; };
