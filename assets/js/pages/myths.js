import { $ } from "../core.js";

$("#flips").addEventListener("click", (e) => {
  const f = e.target.closest(".flip");
  if (f) f.setAttribute("aria-pressed", f.getAttribute("aria-pressed") === "true" ? "false" : "true");
});
