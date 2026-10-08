import { PAGES, esc, icon } from "../layout.mjs";
import { MARQUEE, QUOTES } from "../data/content.mjs";

const words = (text, start) => text.split(" ").map((w, i) => `<span class="w" style="--wi:${start + i}">${w}</span>`).join(" ");

export default {
  slug: "",
  title: "Home",
  accent: "v",
  desc: "A calm, research-backed home for understanding LGBTQIA+ lives: the science, the history, queer India, therapies, sound, games, and a place to be heard.",
  scripts: ["home"],
  body: (ctx) => {
    const { href } = ctx;
    const order = ["learn", "science", "library", "timeline", "myths", "stories", "voices", "watch", "india", "help", "therapies", "sound", "games", "about", "connect"];
    const tiles = order.map((k, i) => {
      const [s, l, ic, c, d] = PAGES[k];
      return `<a class="card tile lift reveal" style="--c:var(--${c});--i:${i % 4}" href="${href(s)}"><span class="t-ico">${icon(ic, 22)}</span><h4>${esc(l)}</h4><p>${esc(d)}</p></a>`;
    }).join("");
    const mq = [...MARQUEE, ...MARQUEE].map((t) => `<span>${esc(t)}</span>`).join("");
    return `
<section class="hero">
  <div class="aurora" aria-hidden="true"><span class="blob"></span><span class="blob"></span><span class="blob"></span><span class="blob"></span></div>
  <canvas id="ribbons" aria-hidden="true"></canvas>
  <div class="grain" aria-hidden="true"></div>
  <div class="wrap hero-inner">
    <p class="eyebrow reveal"><span class="dot"></span>Learn · Heal · Belong</p>
    <h1 class="hero-title">
      <span class="line">${words("Not a choice.", 0)}</span>
      <span class="line">${words("Not an illness.", 3)}</span>
      <span class="line">${words("Just who we are.", 6)}</span>
    </h1>
    <p class="lede">A home for understanding and healing. The science, the history, real Indian voices, films, therapies, sound, games, and a place to be heard. No hate here. We get enough of it already. Let us live.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${href("science")}">See the science ${icon("arrow", 18)}</a>
      <a class="btn btn-ghost" href="${href("help")}">I need help right now</a>
      <a class="btn btn-ghost" href="${href("connect")}">Share your story</a>
    </div>
  </div>
  <span class="scroll-cue" aria-hidden="true"></span>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${mq}</div></div>

<section class="section">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow reveal"><span class="dot"></span>Start where you are</p><h2 class="reveal" style="--i:1">Three ways in</h2><p class="lede reveal" style="--i:2">There's no right order. Pick the door that fits the day you're having.</p></header>
    <div class="paths">
      <a class="card path lift reveal" style="--c:var(--pink)" href="${href("help")}#questioning"><span class="kick">If you're questioning</span><h3>I think I might be queer</h3><p>It's okay not to know yet. Gentle steps, no labels required, and what the research says about who you are.</p><span class="go">Start here ${icon("arrow", 18)}</span></a>
      <a class="card path lift reveal" style="--c:var(--g);--i:1" href="${href("help")}#family"><span class="kick">If you're a parent or friend</span><h3>Someone I love just came out</h3><p>Your first reaction is remembered for life. What to say, what not to say, and where to find support.</p><span class="go">Read this first ${icon("arrow", 18)}</span></a>
      <a class="card path lift reveal" style="--c:var(--o);--i:2" href="${href("science")}"><span class="kick">If you want the facts</span><h3>Show me the evidence</h3><p>Seventy years of studies, honest about what's settled and what isn't, with every paper linked.</p><span class="go">See the research ${icon("arrow", 18)}</span></a>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow reveal"><span class="dot"></span>Everything here</p><h2 class="reveal" style="--i:1">Fifteen rooms. One message.</h2></header>
    <div class="tiles">${tiles}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow reveal"><span class="dot"></span>The record</p><h2 class="reveal" style="--i:1">What the world has already decided</h2></header>
    <div class="stats">
      <div class="stat reveal" style="--c1:var(--r);--c2:var(--o)"><strong data-count="1973">0</strong><span>American psychiatrists removed homosexuality from their list of mental disorders</span></div>
      <div class="stat reveal" style="--c1:var(--y);--c2:var(--g);--i:1"><strong data-count="1990">0</strong><span>The World Health Organization removed it from its classification of diseases</span></div>
      <div class="stat reveal" style="--c1:var(--b);--c2:var(--v);--i:2"><strong data-count="2018">0</strong><span>India's Supreme Court decriminalised same-sex love</span></div>
      <div class="stat reveal" style="--c1:var(--v);--c2:var(--pink);--i:3"><strong data-count="477522">0</strong><span>people in the largest genetic study of sexual orientation ever done</span></div>
    </div>
  </div>
</section>

<section class="section alt band">
  <div class="wrap">
    <p class="eyebrow reveal" style="justify-content:center"><span class="dot"></span>A thought for today</p>
    <blockquote id="homeQuote" data-quotes='${esc(JSON.stringify(QUOTES))}'></blockquote>
    <cite id="homeQuoteBy"></cite>
    <p style="margin-top:2rem"><button class="btn btn-ghost btn-sm" id="homeQuoteNext">Another thought</button></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-band reveal">
      <h2>If today is heavy, <em class="grad">you don't carry it alone.</em></h2>
      <p class="lede">Free, confidential support is a call away. And if you'd rather be heard than helped, we'll listen too.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="tel:14416">${icon("phone", 18)} Call Tele-MANAS 14416</a>
        <a class="btn btn-ghost" href="${href("help")}">All helplines and guides</a>
        <a class="btn btn-ghost" href="${href("connect")}">Send an anonymous message</a>
      </div>
    </div>
  </div>
</section>`;
  }
};
