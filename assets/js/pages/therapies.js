import { $, $$, store, toast, fmtDate, esc } from "../core.js";

/* 5-4-3-2-1 grounding */
const gBtns = $$("#ground button");
gBtns.forEach((b) => b.addEventListener("click", () => {
  b.classList.toggle("done");
  const n = gBtns.filter((x) => x.classList.contains("done")).length;
  $("#groundMsg").textContent = n === 5 ? "You're here. You're present. Take one slow breath." : "";
}));

/* Expressive writing: stays in this browser only */
const pSel = $("#prompt"), jr = $("#journal");
$("#newPrompt").addEventListener("click", () => { pSel.selectedIndex = Math.floor(Math.random() * pSel.options.length); });
jr.value = store("wwa-journal") || "";
let jt;
jr.addEventListener("input", () => {
  clearTimeout(jt);
  jt = setTimeout(() => { store("wwa-journal", jr.value); $("#journalSaved").textContent = "Saved on this device only."; }, 600);
});
$("#clearJournal").addEventListener("click", () => { jr.value = ""; store("wwa-journal", ""); $("#journalSaved").textContent = "Cleared."; });

let wt = null;
$("#writeTimer").addEventListener("click", function () {
  if (wt) { clearInterval(wt); wt = null; this.textContent = "Start 15-minute timer"; $("#timerOut").textContent = ""; return; }
  let s = 900;
  this.textContent = "Stop timer";
  wt = setInterval(() => {
    s--;
    $("#timerOut").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} left`;
    if (s <= 0) { clearInterval(wt); wt = null; $("#writeTimer").textContent = "Start 15-minute timer"; $("#timerOut").textContent = "Time's up. Be gentle with yourself."; }
  }, 1000);
});

/* Mood check-in */
function renderMood() {
  const log = (store("wwa-moods") || []).slice(-14);
  $("#moodlog").innerHTML = log.map((m) => `<span style="height:${m.v * 20}%" title="${esc(fmtDate(m.t))}"></span>`).join("");
  $("#moodNote").textContent = log.length
    ? `${log.length} check-in${log.length > 1 ? "s" : ""} so far. ${log.length >= 3 && log.slice(-3).every((m) => m.v <= 2) ? "You've had a few hard days. Consider reaching out to someone, or one of the helplines." : ""}`
    : "No check-ins yet.";
}
$("#moods").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  $$("#moods button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  const log = store("wwa-moods") || [];
  log.push({ v: +b.dataset.v, t: Date.now() });
  store("wwa-moods", log.slice(-60));
  renderMood();
  toast("Checked in. Thank you for noticing yourself.");
});
$("#clearMood")?.addEventListener("click", () => { store("wwa-moods", []); renderMood(); toast("Mood history cleared from this device."); });
renderMood();
