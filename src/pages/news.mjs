import { readFileSync, existsSync } from "node:fs";
import { esc } from "../layout.mjs";
import { hero, arrowBtn } from "../ui.mjs";

// assets/data/news.json is written every night by tools/fetch-news.mjs (see .github/workflows/news.yml)
const FILE = new URL("../../assets/data/news.json", import.meta.url);
const NEWS = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { updated: "", feeds: [], groups: { india: [], world: [], good: [], general: [] } };
const when = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const stamp = NEWS.updated ? new Date(NEWS.updated).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: true }) + " IST" : "";
const FEED_NAMES = [...new Set(["PinkNews", "LGBTQ Nation", "The Advocate", "Erasing 76 Crimes", "The Guardian", "Google News searches", "Good News Network", "Positive News", "The Better India"])];

const item = (x, k, good) => `<li class="nw" data-k="${k}"${good ? ' data-good="1"' : ""}><a class="nw-t" href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(x.t)}</a><span class="nw-m">${esc(x.s)} · ${when(x.d)}</span>${x.x ? `<span class="nw-x">${esc(x.x)}</span>` : ""}</li>`;

export default {
  slug: "news",
  title: "News",
  accent: "sky",
  desc: "Today's headlines on LGBTQIA+ lives in India and around the world, plus good news, gathered every night from named publishers.",
  scripts: ["news"],
  body: (ctx) => {
    const g = NEWS.groups;
    // India first, then the world, newest first within each: one list, filtered in the page
    const rows = [...g.india.map((x) => ({ x, k: "india" })), ...g.world.map((x) => ({ x, k: "world" }))].sort((a, b) => (a.x.d < b.x.d ? 1 : -1));
    const goodUrls = new Set(g.good.map((x) => x.u));
    const list = rows.map(({ x, k }) => item(x, k, goodUrls.has(x.u))).join("");
    const general = g.general.map((x) => item(x, "general", true)).join("");
    return `
${hero(ctx, { eyebrow: "News", title: "What is <em>happening</em>", lede: `Headlines about LGBTQIA+ lives in India and around the world, plus good news. They are gathered every night from named publishers. We do not edit them, and every one links to the original story.` })}

<section class="sec" style="padding-top:2.4rem">
  <div class="wrap-x">
    <p class="callout" role="note">Some headlines are about violence and discrimination. <strong>Good news</strong> is one tap away, and <a href="${ctx.href("help")}">Help and guides</a> has people to talk to if a story hits hard.</p>
    ${stamp ? `<p class="muted small">Updated ${esc(stamp)}</p>` : ""}
    <div class="chips" id="nwChips" role="group" aria-label="Choose what to read">
      ${[["all", "All"], ["india", "India"], ["world", "World"], ["good", "Good news"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === "all"}">${l}</button>`).join("")}
    </div>
    <p class="muted small" id="nwCount" aria-live="polite"></p>
    ${rows.length ? `<h2 class="sr-only">Headlines</h2><ul class="nw-list" id="nwList">${list}</ul><div class="cta-row"><button class="btn btn--ghost" id="nwMore" type="button" hidden><span class="btn-t">Show more</span></button></div>` : `<p>The news feed is empty right now. It refills every night.</p>`}
    ${general ? `<div id="nwGeneral" hidden><h2 class="nw-h">More good news, not only about us</h2><p class="muted small">Uplifting stories from India and elsewhere. They are here because good days matter too.</p><ul class="nw-list">${general}</ul></div>` : ""}
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap-x">
    <details class="how">
      <summary>How this page works</summary>
      <ul>
        <li>Every night a small program reads public news feeds from ${FEED_NAMES.map(esc).join(", ")}. It keeps stories about LGBTQIA+ lives and drops duplicates, gossip, explicit pieces and outlets that routinely write about us with hostility.</li>
        <li>India stories are the ones that name India or an Indian place or court. Good news is picked by words like "landmark", "decriminalises" or "celebrates" in the headline. That is a rough filter, so it will sometimes miss a story or label one badly. Open the story for the full picture.</li>
        <li>We show the headline, the publisher, the date and, when the publisher gives one, a short line. Nothing is rewritten. A headline here is not our opinion and not a claim that it is true.</li>
        <li>Saw something wrong, harmful or missing? Write to <a href="mailto:${esc(ctx.config.email)}">${esc(ctx.config.email)}</a> and we will remove it.</li>
      </ul>
    </details>
    <div class="cta-row">${arrowBtn(ctx.href("india"), "India and the world: the data")}</div>
  </div>
</section>`;
  }
};
