#!/usr/bin/env node
// Static site generator. Usage: node tools/build.mjs   (SITE_URL=https://example.org to override the base URL)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage, makeCtx } from "../src/layout.mjs";
import pages from "../src/pages/index.mjs";
import { hasPhotos } from "../src/ui.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "site.config.json"), "utf8"));
const siteUrl = (process.env.SITE_URL || config.url).replace(/\/+$/, "");

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const hash = createHash("md5");
[...walk(join(root, "assets/css")), ...walk(join(root, "assets/js"))].sort().forEach((f) => hash.update(readFileSync(f)));
const assetVer = hash.digest("hex").slice(0, 8);

function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

const urls = [];
for (const page of pages) {
  const ctx = makeCtx(config, page.slug, { hasCredits: hasPhotos() });
  const body = page.body(ctx);
  const html = renderPage({ config, page, ctx, assetVer, body, siteUrl });
  write(page.slug ? `${page.slug}/index.html` : "index.html", html);
  urls.push(page.slug ? `${siteUrl}/${page.slug}/` : `${siteUrl}/`);
}

// 404 uses root-absolute asset paths so it works at any depth
const nfBase = new URL(siteUrl).pathname.replace(/\/$/, "") + "/";
const nf = {
  slug: "404", title: "Page not found", accent: "r", desc: "This page doesn't exist.", scripts: [],
  body: () => `<header class="phero block" style="--c:var(--r);min-height:100svh"><div class="phero-grid"><div class="phero-meta"><span class="label"><span class="no">404</span>Not found</span></div><h1 class="phero-title">This page <em>wandered off.</em></h1><div class="phero-foot"><p class="phero-lede">It happens to the best of us. Let's get you somewhere that exists.</p><p class="cta-row"><a class="btn btn-primary" href="${nfBase}">Back home</a><a class="btn btn-ghost" href="${nfBase}help/">I need help</a></p></div></div></header>`
};
const nfCtx = { ...makeCtx(config, "404", { hasCredits: hasPhotos() }), base: nfBase, href: (s) => (s ? `${nfBase}${s}/` : nfBase) };
write("404.html", renderPage({ config, page: nf, ctx: nfCtx, assetVer, body: nf.body(), siteUrl, is404: true }));

write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
write("manifest.webmanifest", JSON.stringify({
  name: config.name, short_name: config.name, description: config.description, start_url: "./", scope: "./", display: "standalone",
  background_color: "#f2efe9", theme_color: "#f2efe9",
  icons: [{ src: "assets/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, { src: "assets/img/favicon.svg", sizes: "any", type: "image/svg+xml" }]
}, null, 2));
write(".nojekyll", "");

console.log(`Built ${pages.length} pages + 404 (${siteUrl}) assets v${assetVer}`);
