// Core engine shared by every page: smooth scroll, page transitions, menu, cursor, text and scroll animation.
// Everything degrades gracefully: without GSAP/Lenis (or with reduced motion) the page is simply static and fully visible.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const base = document.documentElement.dataset.base || "./";
export const page = document.documentElement.dataset.page || "home";

export function h(tag, attrs, html) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (html != null) e.innerHTML = html;
  return e;
}
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export function store(k, v) {
  try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; }
}
export const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } };

let toastT;
export function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2800);
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
    (function tick(t) { if (!document.hidden) frameFns.forEach((f) => f(t)); requestAnimationFrame(tick); })(0);
  }
  return () => frameFns.delete(fn);
}

const root = document.documentElement;
const G = window.gsap, ST = window.ScrollTrigger;
const hasGsap = !!(G && ST);
const motion = hasGsap && !reduce;
if (hasGsap) G.registerPlugin(ST);

/* ---------- page-ready promise (resolves once any curtain has lifted) ---------- */
let markReady;
export const pageReady = new Promise((r) => (markReady = r));

/* ---------- smooth scroll ---------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 1 });
  lenis.on("scroll", ST.update);
  G.ticker.add((t) => lenis.raf(t * 1000));
  G.ticker.lagSmoothing(0);
}
export function scrollTo(target, opts = {}) {
  const off = opts.offset ?? -90;
  if (lenis) lenis.scrollTo(target, { offset: off, duration: opts.duration ?? 1.4, immediate: !!opts.immediate });
  else {
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY + off;
    scrollTo.native(y, opts.immediate);
  }
}
scrollTo.native = (y, imm) => window.scrollTo({ top: y, behavior: imm || reduce ? "auto" : "smooth" });

/* ---------- theme ---------- */
const themeIsDark = () => (root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
$("#themeBtn")?.addEventListener("click", () => {
  const next = themeIsDark() ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("wwa-theme", next); } catch (e) {}
  window.dispatchEvent(new Event("themechange"));
  tone();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { window.dispatchEvent(new Event("themechange")); tone(); });

/* ---------- header: tone follows whatever is under it; hides on scroll down ---------- */
const toneEls = $$(".sec,.block,.ink,.hero,.foot,.phero,.phero-img,.marquee,.hs,.about,.chapters");
function tone() {
  if (root.classList.contains("menu-open")) { root.style.setProperty("--bar-fg", "#f2efe9"); return; }
  const y = 42; let t = null;
  for (const el of toneEls) { const r = el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) t = el; }
  let dark;
  if (!t) dark = themeIsDark();
  else if (t.closest('[data-tone="dark"],.ink,.foot,.about')) dark = true;
  else if (t.closest('[data-tone="light"],.block:not(.phero):not(.cta-giant):not(.split2)')) dark = false;
  else dark = themeIsDark();
  root.style.setProperty("--bar-fg", dark ? "#f2efe9" : "#0e0e10");
}
let lastY = scrollY, ticking = false;
const progress = $("#scrollProgress");
function onScroll() {
  const y = scrollY, dy = y - lastY;
  if (!root.classList.contains("menu-open")) {
    if (y > 160 && dy > 8) root.classList.add("bar-hidden");
    else if (dy < -8 || y < 160) root.classList.remove("bar-hidden");
  }
  lastY = y;
  tone();
  if (progress) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", tone);
tone();

/* ---------- full-screen menu ---------- */
const menu = $("#menu"), mbtn = $("#menuBtn");
if (menu) menu.setAttribute("data-lenis-prevent", "");
let menuOpen = false, menuTl = null;
function setMenu(open) {
  if (!menu || open === menuOpen) return;
  menuOpen = open;
  root.classList.toggle("menu-open", open);
  mbtn.setAttribute("aria-expanded", String(open));
  const label = $(".menu-btn-t", mbtn); if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
  tone();
  if (open) {
    lenis?.stop();
    menu.hidden = false;
    if (motion) {
      menuTl?.kill();
      menuTl = G.timeline()
        .fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.inOut" })
        .fromTo($$(".menu-t", menu), { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.03 }, 0.35)
        .fromTo($$(".menu-col .label,.menu-foot", menu), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.5);
    } else menu.style.clipPath = "none";
    setTimeout(() => $(".menu-link", menu)?.focus({ preventScroll: true }), 120);
  } else {
    lenis?.start();
    if (motion) {
      menuTl?.kill();
      menuTl = G.to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut", onComplete: () => { menu.hidden = true; } });
    } else menu.hidden = true;
    mbtn.focus({ preventScroll: true });
  }
}
mbtn?.addEventListener("click", () => setMenu(!menuOpen));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) setMenu(false);
  if (e.key === "Tab" && menuOpen) {
    const f = $$("a,button", menu).concat([mbtn, ...$$(".bar-tools a,.bar-tools button")]).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!menu.contains(document.activeElement) && !$(".bar-tools")?.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- page transitions (curtain) ---------- */
const curtain = $("#curtain");
const cWords = $$(".curtain-word span", curtain || document);
const cBar = $(".curtain-bar i", curtain || document);
function goTo(href) {
  if (!motion || !curtain) { location.href = href; return; }
  try { sessionStorage.setItem("wwaT", "1"); } catch (e) {}
  lenis?.stop();
  G.set(curtain, { yPercent: 100 });
  G.set(cWords, { yPercent: 0, opacity: 0 });
  G.timeline({ onComplete: () => { location.href = href; } })
    .to(curtain, { yPercent: 0, duration: 0.75, ease: "power4.inOut" })
    .to(cWords, { opacity: 1, duration: 0.3, stagger: 0.05 }, 0.35);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  let url; try { url = new URL(a.href, location.href); } catch (err) { return; }
  if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return;
  const samePage = url.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "") && url.search === location.search;
  if (samePage) {
    if (!url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    scrollTo(el);
    history.pushState(null, "", url.hash);
    return;
  }
  e.preventDefault();
  goTo(url.href);
});
addEventListener("pageshow", (e) => {
  if (e.persisted && curtain && hasGsap) { G.set(curtain, { yPercent: 100 }); root.classList.remove("t-in", "intro"); lenis?.start(); }
});

function revealPage() {
  const intro = root.classList.contains("intro"), tin = root.classList.contains("t-in");
  const done = () => { root.classList.remove("t-in", "intro"); if (curtain) G.set(curtain, { yPercent: 100 }); lenis?.start(); };
  if (!motion || !curtain || (!intro && !tin)) { root.classList.remove("t-in", "intro"); markReady(); return; }
  lenis?.stop();
  if (intro) {
    try { sessionStorage.setItem("wwaIntro", "1"); } catch (e) {}
    G.set(curtain, { yPercent: 0 });
    G.set(cWords, { yPercent: 115 });
    G.timeline({ onComplete: done })
      .to(cWords, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.09 }, 0.1)
      .to(cBar, { scaleX: 1, duration: 1.15, ease: "power2.inOut" }, 0.2)
      .to(curtain, { yPercent: -100, duration: 0.95, ease: "power4.inOut" }, 1.55)
      .add(() => markReady(), 1.95);
  } else {
    G.set(curtain, { yPercent: 0 });
    G.set(cWords, { yPercent: 0, opacity: 1 });
    G.timeline({ onComplete: done })
      .to(curtain, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, 0.12)
      .add(() => markReady(), 0.5);
  }
}

/* ---------- cursor ---------- */
const cursor = $("#cursor");
if (cursor && motion && matchMedia("(hover:hover) and (pointer:fine)").matches) {
  const lab = $(".cursor-label", cursor);
  const qx = G.quickTo(cursor, "x", { duration: 0.35, ease: "power3" }), qy = G.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    const lbl = e.target.closest("[data-cursor]");
    const link = e.target.closest("a,button,summary,input,select,textarea,label,[role=button]");
    cursor.classList.toggle("is-label", !!lbl);
    if (lbl) lab.textContent = lbl.dataset.cursor;
    cursor.classList.toggle("is-link", !lbl && !!link);
  });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-link", "is-label"));
}

/* ---------- reveal + counters ---------- */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const target = +el.dataset.count;
  const fmt = (n) => (target > 9999 ? n.toLocaleString("en-IN") : String(n));
  if (reduce) { el.textContent = fmt(target); return; }
  const start = target > 9999 ? 0 : Math.max(0, target - 120), t0 = performance.now(), dur = 2200;
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(Math.round(start + (target - start) * e));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    pageReady.then(() => {
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      if (e.target.matches("[data-count]")) countUp(e.target);
    });
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
export function observe(scope = document) {
  $$(".reveal:not(.in), .poem p:not(.in), [data-count]:not([data-done])", scope).forEach((el) => {
    if (io && !reduce) io.observe(el);
    else { el.classList.add("in"); el.querySelectorAll?.("[data-count]").forEach(countUp); if (el.matches?.("[data-count]")) countUp(el); }
  });
}
export const reveal = observe;
observe();

/* ---------- split text ---------- */
function splitNode(node, cls) {
  [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.append(tok); return; }
        if (cls === "mw") { const s = document.createElement("span"); s.className = "mw"; s.textContent = tok; frag.append(s); }
        else { const w = document.createElement("span"), i = document.createElement("span"); w.className = "w"; i.className = "wi"; i.textContent = tok; w.append(i); frag.append(w); }
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== "BR") splitNode(n, cls);
  });
}
function initSplit(scope = document) {
  $$("[data-split]:not(.is-split)", scope).forEach((el) => {
    splitNode(el);
    el.classList.add("is-split");
    if (!motion) return;
    const words = $$(".wi", el);
    G.set(words, { yPercent: 118 });
    const play = () => pageReady.then(() => G.to(words, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.04 }));
    ST.create({ trigger: el, start: "top 94%", once: true, onEnter: play });
  });
}

/* ---------- scroll-driven effects ---------- */
function initScrollFx() {
  if (!motion) return;
  // manifesto: words light up as you read
  $$("[data-manifesto]").forEach((el) => {
    splitNode(el, "mw");
    G.to($$(".mw", el), { opacity: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: true } });
  });
  // home picture strip: columns drift at different speeds while scrolling
  if (!reduce) $$(".strip-col").forEach((col) => {
    const d = Number(col.dataset.drift || 1);
    G.fromTo(col, { y: 70 * d }, { y: -70 * d, ease: "none", scrollTrigger: { trigger: col.closest(".strip"), start: "top bottom", end: "bottom top", scrub: 0.8 } });
  });
  // photographs: parallax + mask reveal
  $$(".ph--photo:not([data-static])").forEach((fig) => {
    const inner = $(".ph-in", fig);
    if (inner) G.fromTo(inner, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
  });
  $$(".phero-img .ph, .interlude .ph, .person .ph, .reveal-clip").forEach((fig) => {
    G.fromTo(fig, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "power4.inOut", scrollTrigger: { trigger: fig, start: "top 90%", once: true } });
  });
  // pinned horizontal gallery (desktop only)
  const mm = G.matchMedia();
  mm.add("(min-width: 900px)", () => {
    $$("[data-hs]").forEach((sec) => {
      const track = $(".hs-track", sec);
      if (!track) return;
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + 80);
      G.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
    });
  });
  // magnetic buttons
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$("[data-magnetic]").forEach((el) => {
      const mx = G.quickTo(el, "x", { duration: 0.5, ease: "power3" }), my = G.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.22); my((e.clientY - r.top - r.height / 2) * 0.32); });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }
}

/* ---------- misc ---------- */
$("#toTop")?.addEventListener("click", () => scrollTo(0, { offset: 0, duration: 1.6 }));
const qe = $("#quickExit");
function quickExit() { try { sessionStorage.clear(); } catch (e) {} location.replace(qe?.dataset.url || "https://www.google.com/"); }
qe?.addEventListener("click", quickExit);
let escCount = 0, escT;
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  escCount++; clearTimeout(escT); escT = setTimeout(() => (escCount = 0), 900);
  if (escCount >= 3) quickExit();
});
export function chipFilter(container, onChange) {
  container.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    $$(".chip", container).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    onChange(b.dataset.f);
  });
}

/* ---------- boot ---------- */
initSplit();
initScrollFx();
revealPage();
window.__wwa = true;
if (location.hash) {
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) pageReady.then(() => setTimeout(() => scrollTo(el, { immediate: true }), 60));
}
if (hasGsap) {
  const refresh = () => ST.refresh();
  (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(refresh, 100));
  addEventListener("load", () => setTimeout(refresh, 200));
}
// pages that add content dynamically call these
export { initSplit };

// YouTube players: the privacy-enhanced embed loads only when a player is pressed.
document.addEventListener("click", (e) => {
  const b = e.target.closest?.(".yt-btn");
  if (!b || b.querySelector("iframe")) return;
  const f = document.createElement("iframe");
  f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  f.title = b.dataset.title || "Video";
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  f.allowFullscreen = true;
  f.referrerPolicy = "strict-origin-when-cross-origin";
  b.appendChild(f);
  b.classList.add("on");
});
