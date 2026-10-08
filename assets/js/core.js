// Core behaviours shared by every page: theme, navigation, reveal, counters, spotlight, quick exit.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const base = document.documentElement.dataset.base || "./";
export const page = document.documentElement.dataset.page || "home";

export function h(tag, attrs, html) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "text") e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (html != null) e.innerHTML = html;
  return e;
}
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export function store(k, v) {
  try {
    if (v === undefined) return JSON.parse(localStorage.getItem(k));
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) { return null; }
}
export const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } };

let toastT;
export function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2800);
}

// Size a canvas to its CSS box at device resolution and return a 2D context.
export function fit(c) {
  const d = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.max(1, Math.round(c.clientWidth * d));
  c.height = Math.max(1, Math.round(c.clientHeight * d));
  const g = c.getContext("2d");
  g.setTransform(d, 0, 0, d, 0, 0);
  return g;
}

// One shared animation loop; callbacks only run while the tab is visible.
const frameFns = new Set();
let looping = false;
export function onFrame(fn) {
  frameFns.add(fn);
  if (!looping) {
    looping = true;
    (function tick(t) {
      if (!document.hidden) frameFns.forEach((f) => f(t));
      requestAnimationFrame(tick);
    })(0);
  }
  return () => frameFns.delete(fn);
}

/* ---------- theme ---------- */
const root = document.documentElement;
function resolvedTheme() {
  return root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
}
$("#themeBtn")?.addEventListener("click", () => {
  const next = resolvedTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("wwa-theme", next); } catch (e) {}
  window.dispatchEvent(new Event("themechange"));
});
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => window.dispatchEvent(new Event("themechange")));

/* ---------- navigation ---------- */
const dds = $$(".dd");
function closeDD(except) { dds.forEach((d) => { if (d !== except) { d.classList.remove("open"); d.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); } }); }
dds.forEach((d) => {
  const b = d.querySelector(".dd-btn");
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !d.classList.contains("open");
    closeDD(d);
    d.classList.toggle("open", open);
    b.setAttribute("aria-expanded", String(open));
  });
});
document.addEventListener("click", (e) => { if (!e.target.closest(".dd")) closeDD(); });

const menu = $("#mobileMenu"), mbtn = $("#menuBtn");
const MENU_ICON = mbtn ? mbtn.innerHTML : "";
const CLOSE_ICON = '<svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function setMenu(open) {
  if (!menu) return;
  mbtn.innerHTML = open ? CLOSE_ICON : MENU_ICON;
  menu.hidden = !open;
  mbtn.setAttribute("aria-expanded", String(open));
  mbtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}
mbtn?.addEventListener("click", () => setMenu(menu.hidden));
menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
addEventListener("resize", () => { if (innerWidth > 980) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDD(); setMenu(false); } });

/* ---------- scroll progress ---------- */
const bar = $("#scrollProgress");
let ticking = false;
function updProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  ticking = false;
}
if (bar) addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updProgress); } }, { passive: true });

/* ---------- reveal + counters ---------- */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const target = +el.dataset.count;
  const fmt = (n) => (target > 9999 ? n.toLocaleString("en-IN") : String(n));
  if (reduce) { el.textContent = fmt(target); return; }
  const start = target > 9999 ? 0 : Math.max(0, target - 120), t0 = performance.now(), dur = 2000;
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(Math.round(start + (target - start) * e));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    if (e.target.matches("[data-count]")) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
export function observe(scope = document) {
  $$(".reveal:not(.in), .poem p:not(.in)", scope).forEach((el) => {
    if (io && !reduce) io.observe(el); else { el.classList.add("in"); el.querySelectorAll("[data-count]").forEach(countUp); }
  });
}
observe();
// Make sure anything dynamically added later is picked up too.
export const reveal = observe;

/* ---------- spotlight cards + cursor glow ---------- */
const glow = $("#cursorGlow");
let gx = 0, gy = 0, gRaf = false;
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest?.(".card");
  if (c) {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  if (glow && e.pointerType === "mouse" && !reduce) {
    gx = e.clientX; gy = e.clientY;
    if (!gRaf) { gRaf = true; requestAnimationFrame(() => { glow.style.transform = `translate(${gx}px,${gy}px)`; glow.classList.add("on"); gRaf = false; }); }
  }
}, { passive: true });
document.addEventListener("pointerleave", () => glow?.classList.remove("on"));

/* ---------- quick exit (button, or tap Esc three times) ---------- */
const qe = $("#quickExit");
function quickExit() {
  const url = qe?.dataset.url || "https://www.google.com/";
  try { sessionStorage.clear(); } catch (e) {}
  location.replace(url);
}
qe?.addEventListener("click", quickExit);
let escCount = 0, escT;
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  escCount++;
  clearTimeout(escT);
  escT = setTimeout(() => (escCount = 0), 900);
  if (escCount >= 3) quickExit();
});

/* ---------- shared date for filtering helpers ---------- */
export function chipFilter(container, onChange) {
  container.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    $$(".chip", container).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    onChange(b.dataset.f);
  });
}
