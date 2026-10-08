import { $, $$ } from "../core.js";

const dials = ["d1", "d2", "d3", "d4"].map((id) => document.getElementById(id));
const bucket = (v, a) => (v < 34 ? a[0] : v > 66 ? a[2] : a[1]);
function update() {
  const sex = bucket(dials[0].value, ["typically male body", "intersex variation", "typically female body"]);
  const gi = bucket(dials[1].value, ["man", "non-binary person", "woman"]);
  const ex = bucket(dials[2].value, ["masculine", "androgynous", "feminine"]);
  const at = bucket(dials[3].value, ["men", "more than one gender", "women"]);
  let label;
  if (at === "more than one gender") label = "might call themselves bisexual or pansexual";
  else if (gi === "man") label = at === "women" ? "might call himself straight" : "might call himself gay";
  else if (gi === "woman") label = at === "men" ? "might call herself straight" : "might call herself lesbian";
  else label = "might use words like queer, or none at all";
  const trans = (sex.startsWith("typically male") && gi === "woman") || (sex.startsWith("typically female") && gi === "man");
  $("#dialNote").textContent = `A ${gi} with a ${sex}, a ${ex} style, attracted to ${at}. ${trans ? "This person is transgender, and " : "This person "}${label}. Every combination exists in real life.`;
}
dials.forEach((d) => d.addEventListener("input", update));
update();

const items = $$("#gloss .gloss-item"), none = $("#glossNone");
$("#glossSearch").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  let n = 0;
  items.forEach((it) => { const hit = !q || it.dataset.text.includes(q); it.hidden = !hit; if (hit) n++; });
  none.hidden = n > 0;
});
