import { $, h, esc, base, reveal } from "../core.js";

const grid = $("#videos");
const ytId = (u) => {
  const m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : /^[A-Za-z0-9_-]{11}$/.test(u) ? u : null;
};

function card(v, i) {
  const id = v.yt && ytId(v.yt);
  if (!id) return null;
  const el = h("article", { class: "card video reveal", style: `--c:var(--${v.c || "v"});--i:${i}` });
  el.innerHTML = `<button class="player" aria-label="Play video: ${esc(v.title)}"><span class="play"><svg class="ico" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="ptitle">${esc(v.title)}</span></button><div class="vbody"><p>${esc(v.note || "")}</p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">Open on YouTube</a></div>`;
  el.querySelector(".player").addEventListener("click", function () {
    const f = h("iframe", {
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      title: v.title, allow: "autoplay; encrypted-media; picture-in-picture; fullscreen", allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin"
    });
    this.appendChild(f);
  }, { once: true });
  return el;
}

fetch(`${base}data/videos.json`, { cache: "no-cache" })
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => [])
  .then((list) => {
    (Array.isArray(list) ? list : []).forEach((v, i) => { const c = card(v, i); if (c) grid.prepend(c); });
    reveal(grid);
  });
