// Street-level photos for the location game, from KartaView (open street imagery, no account or key needed).
// Opening the tab looks up photos taken along the nearest road and lets you step forward and back along it.
// Nothing is requested until a player opens the Street view tab.
const API = "https://api.openstreetcam.org/2.0/photo/";
const num = (v) => Number.parseFloat(v);

async function nearby(loc, radius) {
  const r = await fetch(`${API}?lat=${loc.lat}&lng=${loc.lon}&radius=${radius}`, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("streetview");
  const j = await r.json(), data = j?.result?.data || [];
  return data.filter((p) => p.projection !== "SPHERE" && (p.fileurlLTh || p.imageLthUrl)).map((p) => ({ seq: p.sequenceId, idx: num(p.sequenceIndex), lat: num(p.lat), lng: num(p.lng), d: num(p.distance), url: p.fileurlLTh || p.imageLthUrl, heading: num(p.heading) }));
}
// The longest run of photos along one road, ordered the way the car drove.
function bestRun(photos) {
  const by = new Map(); photos.forEach((p) => { (by.get(p.seq) || by.set(p.seq, []).get(p.seq)).push(p); });
  let run = null; by.forEach((list) => { if (!run || list.length > run.length) run = list; });
  if (!run) return null; run = run.slice().sort((a, b) => a.idx - b.idx);
  return run;
}

// Shows the photos in el. Resolves to { destroy() }, or null when there are none near the place.
export async function showStreet(el, loc) {
  let run = null;
  for (const radius of [350, 1200]) { run = bestRun(await nearby(loc, radius)); if (run && run.length >= 3) break; }
  if (!run) return null;
  let at = 0, best = 1e9; run.forEach((p, i) => { if (p.d < best) { best = p.d; at = i; } });
  el.innerHTML = `<img class="sv-img" alt="A street-level photo near the place" decoding="async"><div class="sv-ctl"><button type="button" data-d="-1" aria-label="Step back along the road">&larr; Back</button><span class="sv-n" aria-live="polite"></span><button type="button" data-d="1" aria-label="Step forward along the road">Forward &rarr;</button></div>`;
  const img = el.querySelector(".sv-img"), n = el.querySelector(".sv-n"), btns = [...el.querySelectorAll("button")];
  const show = () => { img.src = run[at].url; n.textContent = `${at + 1} of ${run.length}`; btns[0].disabled = at === 0; btns[1].disabled = at === run.length - 1; [at - 1, at + 1].forEach((i) => { if (run[i]) { const pre = new Image(); pre.src = run[i].url; } }); };
  const step = (e) => { const d = +e.currentTarget.dataset.d; at = Math.max(0, Math.min(run.length - 1, at + d)); show(); };
  btns.forEach((b) => b.addEventListener("click", step)); show();
  return { destroy() { el.innerHTML = ""; } };
}
