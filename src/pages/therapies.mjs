import { esc } from "../layout.mjs";
import { hero, sectionHead, photo, arrowBtn } from "../ui.mjs";
import { THERAPIES, PROMPTS } from "../data/content.mjs";

export default {
  slug: "therapies",
  title: "Therapies",
  accent: "pink",
  desc: "What the evidence says helps queer mental health, ten approaches rated by strength of evidence, plus grounding, writing and mood tools you can use now.",
  scripts: ["therapies"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Ways to heal", title: "Therapies <em class=\"grad\">and self-care</em>", lede: "What the evidence says helps, explained simply, plus tools you can use right now. These support professional care; they don't replace it.", accent: "pink" })}

<section class="sec">
  <div class="wrap">
    ${sectionHead("Ten approaches", "Rated by how strong the evidence is")}
    <div class="grid" style="--min:20rem">
      ${THERAPIES.map(([n, ev, d, src, c], i) => `<article class="card therapy lift reveal" style="--c:var(--${c});--i:${i % 3}"><h4>${esc(n)} <span class="ev">${esc(ev)}</span></h4><p>${esc(d)}</p><p class="src">${esc(src)}</p></article>`).join("")}
    </div>
    <div class="callout reveal" style="--c:var(--pink)"><p><strong>Finding an affirming therapist.</strong> Ask directly: "Do you work with LGBTQ+ clients, and do you see my identity as a healthy variation, not a problem?" iCALL and the Humsafar Trust can point you to affirming counsellors. A good therapist will welcome the question.</p></div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap narrow">
    ${sectionHead("Right now", "5-4-3-2-1 grounding", "When anxiety spikes, bring yourself back to the present. Tap each step as you notice the things around you.")}
    <div class="card reveal" style="--c:var(--v)">
      <div class="ground" id="ground">
        <button style="--c:var(--r)"><strong>5</strong>things you can see</button>
        <button style="--c:var(--o)"><strong>4</strong>things you can touch</button>
        <button style="--c:var(--y)"><strong>3</strong>things you can hear</button>
        <button style="--c:var(--g)"><strong>2</strong>things you can smell</button>
        <button style="--c:var(--b)"><strong>1</strong>thing you can taste</button>
      </div>
      <p class="game-msg" id="groundMsg" aria-live="polite"></p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap narrow">
    ${sectionHead("Expressive writing", "Write it out", "Research by James Pennebaker found that writing about difficult feelings for 15 to 20 minutes over a few days can improve wellbeing. Nothing you type here leaves your device.")}
    <div class="card reveal" style="--c:var(--o)">
      <div class="row" style="margin-bottom:1rem">
        <label class="sr-only" for="prompt">Writing prompt</label>
        <select class="mini" id="prompt" style="max-width:100%">${PROMPTS.map((p, i) => `<option value="${i}">${esc(p)}</option>`).join("")}</select>
        <button class="btn btn-ghost btn-sm" id="newPrompt">Another prompt</button>
        <button class="btn btn-primary btn-sm" id="writeTimer">Start 15-minute timer</button>
        <span class="muted small" id="timerOut" aria-live="polite"></span>
      </div>
      <label class="sr-only" for="journal">Your writing</label>
      <textarea class="input" id="journal" rows="8" placeholder="Write freely. No one will read this."></textarea>
      <div class="row" style="margin-top:.8rem"><button class="btn btn-ghost btn-sm" id="clearJournal">Clear</button><span class="muted small" id="journalSaved"></span></div>
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap narrow">
    ${sectionHead("Daily check-in", "How are you, really?", "Noticing patterns is a first step. Your check-ins stay on this device only.")}
    <div class="card reveal" style="--c:var(--g)">
      <div class="moods" id="moods">
        ${[["😞", 1, "Really low"], ["😕", 2, "Low"], ["😐", 3, "Okay"], ["🙂", 4, "Good"], ["😊", 5, "Great"]].map(([e, v, l]) => `<button aria-pressed="false" aria-label="${l}" data-v="${v}">${e}</button>`).join("")}
      </div>
      <div class="moodlog" id="moodlog" role="img" aria-label="Your recent moods"></div>
      <p class="muted small" id="moodNote"></p>
      <button class="btn btn-ghost btn-xs" id="clearMood">Clear my mood history</button>
    </div>
    <div class="callout reveal" style="--c:var(--r)"><p><strong>If you've had several hard days in a row,</strong> please reach out: <a href="tel:14416">Tele-MANAS 14416</a> is free and open any time, or see the <a href="../help/">full list of helplines</a>.</p></div>
  </div>
</section>`
};
