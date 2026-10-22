// Page shell: navigation bar, full-screen menu, footer, <head>, icons.

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M7 17L17 7M8 7h9v9"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  exit: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
export function icon(name, size = 20) {
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
}

// [slug, label, (unused), colour, description, index, group]
export const PAGES = {
  learn: ["learn", "LGBTQIA+ explained", "", "pink", "Every letter, the four dials, a glossary", "01", "Understand"],
  science: ["science", "The science", "", "orange", "What seventy years of research found", "02", "Understand"],
  library: ["library", "Research library", "", "yellow", "26 papers with honest limitations", "03", "Understand"],
  timeline: ["timeline", "Timeline", "", "green", "From Khajuraho to 2026", "04", "Understand"],
  myths: ["myths", "Myths and facts", "", "r", "Flip cards for dinner-table debates", "05", "Understand"],
  stories: ["stories", "Stories", "", "green", "Reiner's story, trailblazers, the community wall", "06", "Stories"],
  voices: ["voices", "Voices", "", "blue", "Talks, interviews and videos", "07", "Stories"],
  watch: ["watch", "Watch", "", "violet", "28 films and series worth your evening", "08", "Stories"],
  india: ["india", "India today", "", "blue", "Violence, data and the silence around it", "09", "Stories"],
  help: ["help", "Help and guides", "", "blue", "Helplines, coming out, parents, allies, rights", "10", "Care"],
  therapies: ["therapies", "Therapies", "", "pink", "What helps, plus tools to use now", "11", "Care"],
  sound: ["sound", "Sound studio", "", "sky", "Nature mixer, bowls, ambient music, songs", "12", "Care"],
  games: ["games", "Games", "", "green", "Party games, quizzes and calm games to play alone or together", "13", "Care"],
  about: ["about", "About the builder", "", "violet", "A note from Reiner", "14", "About"],
  connect: ["connect", "Connect", "", "orange", "Contact and anonymous messages", "15", "About"],
  privacy: ["privacy", "Privacy and safety", "", "sky", "What this site does and doesn't know", "16", "About"],
  sources: ["sources", "Sources", "", "yellow", "Every reference in one place", "17", "About"],
  credits: ["credits", "Photo credits", "", "pink", "Where every photograph comes from", "18", "About"]
};

export const NAV_GROUPS = [
  ["Understand", ["learn", "science", "library", "timeline", "myths"]],
  ["Stories", ["stories", "voices", "watch", "india"]],
  ["Care", ["help", "therapies", "sound", "games"]],
  ["About", ["about", "connect", "privacy", "sources", "credits"]]
];

export function makeCtx(config, slug, opts = {}) {
  const base = slug ? "../" : "./";
  const href = (s) => (s ? `${base}${s}/` : base);
  return { config, slug, base, href, icon, esc, hasCredits: !!opts.hasCredits };
}

const MARK = `<svg class="mark" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1" fill="none" opacity=".7"><path d="M4 20L11 8l9 5 5-9M20 13l3 10-10 3-9-6"/></g><circle cx="4" cy="20" r="2.6" fill="#E40303"/><circle cx="11" cy="8" r="2.6" fill="#FF8C00"/><circle cx="20" cy="13" r="2.6" fill="#FFED00"/><circle cx="25" cy="4" r="2.6" fill="#008026"/><circle cx="23" cy="23" r="2.6" fill="#004DFF"/><circle cx="13" cy="26" r="2.6" fill="#750787"/></svg>`;

function bar(ctx) {
  const { config, slug, href } = ctx;
  const link = (k, label) => `<a href="${href(k)}"${slug === k ? ' aria-current="page"' : ""}>${label}</a>`;
  return `
<header class="bar" id="bar">
  <a class="bar-brand" href="${href("")}" aria-label="${esc(config.name)}, home">${MARK}<span>${esc(config.name)}</span></a>
  <nav class="bar-links" aria-label="Main">${link("learn", "Learn")}${link("science", "Science")}${link("stories", "Stories")}${link("india", "India")}${link("games", "Games")}</nav>
  <div class="bar-tools">
    <a class="pill pill--alert" href="${href("help")}">Help now</a>
    <button class="icon-btn" id="themeBtn" aria-label="Switch colour theme"><span class="t-sun">${icon("sun", 18)}</span><span class="t-moon">${icon("moon", 18)}</span></button>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu"><span class="menu-btn-t" data-open="Menu" data-close="Close">Menu</span><span class="menu-btn-i" aria-hidden="true"><i></i><i></i></span></button>
  </div>
  <div class="bar-progress" id="scrollProgress" aria-hidden="true"></div>
</header>`;
}

function menu(ctx) {
  const { href, slug } = ctx;
  const cols = NAV_GROUPS.map(([label, items]) => {
    const list = items.filter((k) => k !== "credits" || ctx.hasCredits).map((k) => {
      const [s, l, , c, d, idx] = PAGES[k];
      return `<li><a class="menu-link" href="${href(s)}" style="--c:var(--${c})"${slug === s ? ' aria-current="page"' : ""}><span class="menu-no">${idx}</span><span class="menu-mask"><span class="menu-t">${esc(l)}</span></span></a></li>`;
    }).join("");
    return `<div class="menu-col"><p class="label">${label}</p><ul>${list}</ul></div>`;
  }).join("");
  return `
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
  <div class="menu-in">
    <nav class="menu-grid" aria-label="All pages">${cols}</nav>
    <div class="menu-foot">
      <a href="tel:14416">Tele-MANAS 14416, free, 24/7</a>
      <a href="mailto:${esc(ctx.config.email)}">${esc(ctx.config.email)}</a>
      <span>Press Esc three times to leave quickly</span>
    </div>
  </div>
</div>`;
}

function footer(ctx) {
  const { config, href } = ctx;
  const cols = NAV_GROUPS.map(([label, items]) => `<div><p class="label">${label}</p><ul>${items.filter((k) => k !== "credits" || ctx.hasCredits).map((k) => `<li><a href="${href(PAGES[k][0])}">${esc(PAGES[k][1])}</a></li>`).join("")}</ul></div>`).join("");
  return `
<footer class="foot ink">
  <div class="stripe" aria-hidden="true"></div>
  <div class="foot-top wrap-x">
    <p class="foot-big">Need to talk,<br>or want to be heard?</p>
    <div class="foot-cta">
      <a class="btn btn--light" href="${href("help")}" data-magnetic><span class="btn-t">Get help</span><span class="btn-i">${icon("arrow", 18)}</span></a>
      <a class="btn btn--ghost-light" href="${href("connect")}" data-magnetic><span class="btn-t">Say something</span><span class="btn-i">${icon("arrow", 18)}</span></a>
    </div>
  </div>
  <div class="foot-cols wrap-x">
    <div class="foot-about">
      <p>Built by ${esc(config.author)} so more people understand, and fewer people feel alone.</p>
      <p class="small">In danger, call <a href="tel:112">112</a>. For free, confidential support call <a href="tel:14416">Tele-MANAS 14416</a>.</p>
      <p class="small"><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></p>
    </div>
    ${cols}
  </div>
  <div class="foot-word" aria-hidden="true"><span>Who We Are</span></div>
  <div class="foot-bottom wrap-x">
    <p>No hate here. We get enough of it already. Let us live.</p>
    <p>No tracking, no cookies, no ads. <a href="${href("privacy")}">Privacy and safety</a></p>
    <button class="to-top" id="toTop" type="button">Back to top</button>
  </div>
</footer>
<button class="quick-exit" id="quickExit" data-url="${esc(config.quickExitUrl)}" aria-label="Quick exit: leave this site immediately">${icon("exit", 16)}<span>Quick exit</span></button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

export function renderPage({ config, page, ctx, assetVer, body, siteUrl, is404 }) {
  const { base, slug } = ctx;
  // card titles are authored as <h4>; emit them as h3.ct so heading levels never skip
  body = body.replace(/<h4>/g, '<h3 class="ct">').replace(/<\/h4>/g, "</h3>");
  const abs = (p) => `${siteUrl}/${p}`.replace(/([^:]\/)\/+/g, "$1");
  const title = slug === "" ? `${config.name}: ${config.tagline}` : `${page.title} · ${config.name}`;
  const canonical = slug ? abs(`${slug}/`) : abs("");
  const og = abs("assets/img/og.png");
  const assetBase = is404 ? new URL(siteUrl).pathname.replace(/\/$/, "") + "/" : base;
  const scripts = (page.scripts || []).map((s) => `<script type="module" src="${assetBase}assets/js/pages/${s}.js"></script>`).join("\n");
  const ld = { "@context": "https://schema.org", "@type": slug === "" ? "WebSite" : "WebPage", name: title, description: page.desc || config.description, url: canonical, inLanguage: config.lang };
  return `<!doctype html>
<html lang="${config.lang}" data-base="${assetBase}" data-page="${slug || "home"}" style="--accent:var(--${page.accent || "pink"})">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.desc || config.description)}">
<meta name="theme-color" content="#0e0e10" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f2efe9" media="(prefers-color-scheme: light)">
<meta name="color-scheme" content="dark light">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${assetBase}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${assetBase}assets/img/apple-touch-icon.png">
<link rel="manifest" href="${assetBase}manifest.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(config.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.desc || config.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<script>(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("wwa-theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(sessionStorage.getItem("wwaT")){d.classList.add("t-in");sessionStorage.removeItem("wwaT")}else if(d.getAttribute("data-page")==="home"&&!sessionStorage.getItem("wwaIntro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("intro")}}catch(e){}setTimeout(function(){if(!window.__wwa)d.classList.add("anim-fail")},4500)})();</script>
<link rel="preload" href="${assetBase}assets/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${assetBase}assets/fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assetBase}assets/css/site.css?v=${assetVer}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="curtain" id="curtain" aria-hidden="true"><div class="curtain-in"><span class="curtain-word"><span>Who</span> <span>We</span> <span>Are</span></span><span class="curtain-bar"><i></i></span></div></div>
<div class="cursor" id="cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-label"></span></div>
${bar(ctx)}
${menu(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
<script defer src="${assetBase}assets/vendor/gsap.min.js"></script>
<script defer src="${assetBase}assets/vendor/ScrollTrigger.min.js"></script>
<script defer src="${assetBase}assets/vendor/lenis.min.js"></script>
<script type="module" src="${assetBase}assets/js/core.js"></script>
${scripts}
<noscript><style>[data-split],.reveal{opacity:1!important;transform:none!important}.curtain,.cursor{display:none!important}</style></noscript>
</body>
</html>
`;
}
