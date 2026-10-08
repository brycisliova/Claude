import { $ } from "../core.js";

$("#wipe").addEventListener("click", () => {
  let n = 0;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("wwa-")).forEach((k) => { localStorage.removeItem(k); n++; });
    sessionStorage.clear();
  } catch (e) {}
  document.documentElement.removeAttribute("data-theme");
  const m = $("#wipeMsg");
  m.textContent = n ? "Done. Your saved theme, journal and mood data were removed from this browser." : "Nothing was saved on this device.";
  m.className = "status ok";
});
