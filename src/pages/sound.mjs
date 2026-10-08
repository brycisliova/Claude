import { esc, hero, sectionHead, icon } from "../layout.mjs";
import { SONGS } from "../data/content.mjs";

export default {
  slug: "sound",
  title: "Sound studio",
  accent: "sky",
  desc: "A sound studio for your nervous system: rain, ocean and wind mixer, singing bowl, self-composing ambient music, binaural beats, sleep timer and song therapy. All generated live in your browser.",
  scripts: ["sound"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Sound and song therapy", title: "A sound studio for <em class=\"grad\">your nervous system</em>", lede: "Every sound here is generated live in your browser, so there's nothing to download. Mix rain, ocean and wind, strike a singing bowl, or let calm music compose itself. Headphones make it better.", accent: "sky" })}

<section class="section">
  <div class="wrap">
    <canvas class="viz reveal" id="viz" aria-hidden="true"></canvas>

    <h2 class="h3 reveal" style="margin-top:3rem">Nature mixer</h2>
    <div class="mixer" id="mixer"></div>

    <h2 class="h3 reveal">Instruments</h2>
    <div class="grid" style="--min:19rem">
      <div class="card reveal" style="--c:var(--y)"><h4>Singing bowl</h4><p class="muted" style="margin:.5rem 0 1.2rem">A long, shimmering tone. Strike it, breathe out slowly, and listen until it fades.</p><button class="btn btn-primary btn-sm" id="bowl">Strike the bowl</button></div>
      <div class="card reveal" style="--c:var(--v);--i:1"><h4>Ambient music</h4><p class="muted" style="margin:.5rem 0 1.2rem">Gentle notes that compose themselves, never repeating.</p><div class="row"><select class="mini" id="ambMood" aria-label="Mood"><option value="dawn">Dawn (hopeful)</option><option value="night">Night (deep calm)</option><option value="rain">Rainy window (wistful)</option></select><button class="btn btn-primary btn-sm" id="ambBtn">Play</button></div></div>
      <div class="card reveal" style="--c:var(--b);--i:2"><h4>Binaural beats</h4><p class="muted" style="margin:.5rem 0 1.2rem">Two slightly different tones, one in each ear. Many people find them relaxing, though scientific evidence for specific effects is mixed. Headphones required.</p><div class="row"><select class="mini" id="binFreq" aria-label="Beat frequency"><option value="6">6 Hz, drowsy calm</option><option value="10">10 Hz, relaxed focus</option></select><button class="btn btn-primary btn-sm" id="binBtn">Play</button></div></div>
      <div class="card reveal" style="--c:var(--pink);--i:3"><h4>Sleep timer</h4><p class="muted" style="margin:.5rem 0 1.2rem">Everything fades out gently.</p><div class="row"><select class="mini" id="sleepMin" aria-label="Minutes"><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="45">45 minutes</option></select><button class="btn btn-ghost btn-sm" id="sleepBtn">Set timer</button><button class="btn btn-no btn-sm" id="stopAll">Stop all</button></div><p class="muted small" id="sleepOut" style="margin:.8rem 0 0" aria-live="polite"></p></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap narrow">
    ${sectionHead("Song therapy", "Music for the days you need it", "Music affects mood in measurable ways. A Cochrane review (Aalbers et al., 2017) found music therapy added to usual care probably reduces depressive symptoms in the short term. Here are songs many queer people say helped them feel less alone. Each link opens a YouTube search.")}
    <div class="card reveal" style="--c:var(--sky);padding:.5rem 1.75rem">
      ${SONGS.map(([t, a]) => `<div class="song"><div><strong>${esc(t)}</strong><span>${esc(a)}</span></div><a class="btn btn-ghost btn-xs" href="https://www.youtube.com/results?search_query=${encodeURIComponent(t + " " + a)}" target="_blank" rel="noopener noreferrer">Listen ${icon("up", 14)}</a></div>`).join("")}
    </div>
  </div>
</section>`
};
