// Shared layout, navigation, icons and small HTML helpers.

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M7 17L17 7M8 7h9v9"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  heart: '<path d="M12 21s-8-4.8-9.5-10A5 5 0 0 1 12 8a5 5 0 0 1 9.5 3C20 16.200 12 21 12 21z"/>',
  dna: '<path d="M8 3c0 5 8 5 8 9s-8 4-8 9"/><path d="M16 3c0 5-8 5-8 9s8 4 8 9"/><path d="M9.500 7h5M9.500 17h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 5c0 10-5 15-14 15"/><path d="M5 19c3-4 6-7 10-10"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.500"/><rect x="17" y="14" width="4" height="7" rx="1.500"/>',
  gamepad: '<rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h4M9 10v4"/><circle cx="16" cy="11" r=".8" fill="currentColor"/><circle cx="18" cy="13" r=".8" fill="currentColor"/>',
  cards: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.200a3 3 0 0 1 0 5.600M21 20a5 5 0 0 0-4-4.900"/>',
  star: '<path d="M12 3l2.200 5.800L20 11l-5.800 2.200L12 19l-2.200-5.800L4 11l5.800-2.200z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  exit: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  wave: '<path d="M2 12c2.500 0 2.500-5 5-5s2.500 10 5 10 2.500-10 5-10 2.500 5 5 5"/>'
};
export function icon(name, size = 20) {
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
}

// Navigation structure. [slug, label, icon, accent, description]
export const PAGES = {
  learn: ["learn", "LGBTQIA+ explained", "users", "r", "Every letter, the four dials, a glossary"],
  science: ["science", "The science", "dna", "o", "What seventy years of research found"],
  library: ["library", "Research library", "book", "y", "26 papers with honest limitations"],
  timeline: ["timeline", "Timeline", "clock", "g", "From Khajuraho to 2026"],
  myths: ["myths", "Myths and facts", "cards", "r", "Flip cards for dinner-table debates"],
  stories: ["stories", "Stories", "heart", "g", "Reiner's story, queer India's trailblazers, the community wall"],
  voices: ["voices", "Voices", "mic", "b", "Talks, interviews and videos"],
  watch: ["watch", "Watch", "film", "v", "28 films and series worth your evening"],
  india: ["india", "India today", "chart", "b", "Violence, data and the silence around it"],
  help: ["help", "Help and guides", "shield", "v", "Helplines, coming out, parents, allies, rights"],
  therapies: ["therapies", "Therapies", "leaf", "pink", "What helps, plus tools to use now"],
  sound: ["sound", "Sound studio", "headphones", "sky", "Nature mixer, bowls, ambient music, songs"],
  games: ["games", "Calm arcade", "gamepad", "g", "Thirteen gentle games"],
  about: ["about", "About the builder", "star", "pink", "A note from Reiner"],
  connect: ["connect", "Connect", "mail", "o", "Contact and anonymous messages"],
  privacy: ["privacy", "Privacy and safety", "shield", "b", "What this site does and doesn't know"],
  sources: ["sources", "Sources", "book", "sky", "Every reference in one place"]
};

export const NAV_GROUPS = [
  ["Understand", ["learn", "science", "library", "timeline", "myths"]],
  ["Stories", ["stories", "voices", "watch", "india"]],
  ["Heal", ["help", "therapies", "sound", "games"]],
  ["About", ["about", "connect", "privacy", "sources"]]
];

export function makeCtx(config, slug) {
  const base = slug ? "../" : "./";
  const href = (s) => (s ? `${base}${s}/` : base);
  return { config, slug, base, href, icon, esc };
}

function nav(ctx) {
  const { config, slug, href } = ctx;
  const groups = NAV_GROUPS.map(([label, items]) => {
    const active = items.includes(slug);
    const links = items.map((k) => {
      const [s, l, ic, c, d] = PAGES[k];
      return `<a class="dd-link" href="${href(s)}" style="--c:var(--${c})"${slug === s ? ' aria-current="page"' : ""}><span class="dd-ico">${icon(ic, 18)}</span><span><strong>${esc(l)}</strong><small>${esc(d)}</small></span></a>`;
    }).join("");
    return `<div class="dd${active ? " is-active" : ""}"><button class="dd-btn" aria-expanded="false">${label}${icon("chevron", 14)}</button><div class="dd-panel"><div class="dd-grid">${links}</div></div></div>`;
  }).join("");
  const mobile = NAV_GROUPS.map(([label, items]) => `<div class="m-group"><p class="m-label">${label}</p>${items.map((k) => { const [s, l, ic, c, d] = PAGES[k]; return `<a href="${href(s)}" style="--c:var(--${c})"${slug === s ? ' aria-current="page"' : ""}>${icon(ic, 20)}<span><strong>${esc(l)}</strong><small>${esc(d)}</small></span></a>`; }).join("")}</div>`).join("");
  return `
<header class="nav" id="nav">
  <div class="nav-in">
    <a class="brand" href="${href("")}" aria-label="${esc(config.name)}, home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">${esc(config.name)}</span></a>
    <nav class="nav-links" aria-label="Main">${groups}</nav>
    <div class="nav-tools">
      <a class="nav-help" href="${href("help")}">${icon("shield", 16)}<span>Help now</span></a>
      <button class="icon-btn" id="themeBtn" aria-label="Switch colour theme"><span class="t-sun">${icon("sun", 18)}</span><span class="t-moon">${icon("moon", 18)}</span></button>
      <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">${icon("menu", 20)}</button>
    </div>
  </div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
</header>
<div class="mobile-menu" id="mobileMenu" hidden>
  <div class="mobile-in">
    <a class="m-home" href="${href("")}">${icon("home", 20)}<span><strong>Home</strong><small>Where everything begins</small></span></a>
    ${mobile}
  </div>
</div>`;
}

function footer(ctx) {
  const { config, href } = ctx;
  const cols = NAV_GROUPS.map(([label, items]) => `<div><p class="f-label">${label}</p><ul>${items.map((k) => `<li><a href="${href(PAGES[k][0])}">${esc(PAGES[k][1])}</a></li>`).join("")}</ul></div>`).join("");
  return `
<footer class="footer">
  <div class="spectrum-line" aria-hidden="true"></div>
  <div class="wrap footer-in">
    <div class="f-brand">
      <a class="brand" href="${href("")}"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">${esc(config.name)}</span></a>
      <p class="f-quote">Built by ${esc(config.author)} so more people understand, and fewer people feel alone.</p>
      <p class="f-small">If you're struggling, call <a href="tel:14416">Tele-MANAS 14416</a>, free, any time. In danger, call <a href="tel:112">112</a>.</p>
      <p class="f-small"><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></p>
    </div>
    ${cols}
  </div>
  <div class="wrap f-bottom"><p>No hate here. We get enough of it already. Let us live.</p><p>No tracking, no cookies, no ads. <a href="${href("privacy")}">Privacy and safety</a></p></div>
</footer>
<button class="quick-exit" id="quickExit" data-url="${esc(config.quickExitUrl)}" aria-label="Quick exit: leave this site immediately">${icon("exit", 16)}<span>Quick exit</span></button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

export function renderPage({ config, page, ctx, assetVer, body, siteUrl, is404 }) {
  // card titles are authored as <h4>; emit them as h3.ct so heading levels never skip
  body = body.replace(/<h4>/g, '<h3 class="ct">').replace(/<\/h4>/g, "</h3>");
  const { base, slug } = ctx;
  const abs = (p) => `${siteUrl}/${p}`.replace(/([^:]\/)\/+/g, "$1");
  const title = slug === "" ? `${config.name}: ${config.tagline}` : `${page.title} · ${config.name}`;
  const canonical = slug ? abs(`${slug}/`) : abs("");
  const og = abs("assets/img/og.png");
  const root = is404 ? new URL(siteUrl).pathname.replace(/\/$/, "") + "/" : base;
  const assetBase = is404 ? root : base;
  const scripts = (page.scripts || []).map((s) => `<script type="module" src="${assetBase}assets/js/pages/${s}.js"></script>`).join("\n");
  const ld = {
    "@context": "https://schema.org",
    "@type": slug === "" ? "WebSite" : "WebPage",
    name: title, description: page.desc || config.description, url: canonical, inLanguage: config.lang
  };
  return `<!doctype html>
<html lang="${config.lang}" data-base="${assetBase}" data-page="${slug || "home"}" style="--accent:var(--${page.accent || "v"})">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.desc || config.description)}">
<meta name="theme-color" content="#0b0a14" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#faf7f2" media="(prefers-color-scheme: light)">
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
<script>(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("wwa-theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})();</script>
<link rel="preload" href="${assetBase}assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${assetBase}assets/fonts/figtree-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assetBase}assets/css/site.css?v=${assetVer}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
${nav(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
<script type="module" src="${assetBase}assets/js/core.js"></script>
${scripts}
<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
</body>
</html>
`;
}

// ---- component helpers used by pages ----
export function hero(ctx, { eyebrow, title, lede, accent, extra = "" }) {
  return `<section class="page-hero" style="--c:var(--${accent || "v"})">
  <div class="ph-glow" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow reveal"><span class="dot"></span>${eyebrow}</p>
    <h1 class="ph-title reveal" style="--i:1">${title}</h1>
    ${lede ? `<p class="lede reveal" style="--i:2">${lede}</p>` : ""}
    ${extra}
  </div>
</section>`;
}
export const sectionHead = (eyebrow, title, lede = "") => `<header class="sec-head"><p class="eyebrow reveal"><span class="dot"></span>${eyebrow}</p><h2 class="reveal" style="--i:1">${title}</h2>${lede ? `<p class="lede reveal" style="--i:2">${lede}</p>` : ""}</header>`;
export const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
