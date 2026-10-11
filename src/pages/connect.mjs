import { esc, icon } from "../layout.mjs";
import { hero, photo, arrowBtn } from "../ui.mjs";

export default {
  slug: "connect",
  title: "Connect",
  accent: "o",
  desc: "Reach the builder, offer help, translate, collaborate, or send an anonymous message that is read with care.",
  scripts: ["connect"],
  body: (ctx) => {
    const mail = ctx.config.email;
    return `
${hero(ctx, { eyebrow: "Get in touch", title: "Connect", lede: `Want to help this grow, collaborate, translate, volunteer, or just say hello? Write to <a href="mailto:${esc(mail)}">${esc(mail)}</a> or use the forms below.`, accent: "o" })}

<section class="sec" style="padding-top:2.5rem">
  <div class="wrap">
    <div class="split">
      <div class="card form-card reveal" style="--c:var(--pink)">
        <h2 class="h2" style="font-size:clamp(1.6rem,3vw,2.2rem)">Anonymous message</h2>
        <p class="muted">Share an experience, a hope, a struggle, or kind words for someone reading. No name or email is asked for. Messages are read and approved before anything appears on the <a href="../stories/#wall-section">community wall</a>.</p>
        <form id="anonForm" novalidate>
          <input class="hp" id="anonHp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field"><label for="anonText"><span>Your message</span><span class="counter" id="anonCount">0 / 600</span></label><textarea class="input" id="anonText" rows="6" maxlength="600" placeholder="Write what's on your heart…"></textarea></div>
          <div class="field"><label for="anonKind">What is this?</label><select class="input" id="anonKind"><option value="story">My story or experience</option><option value="hope">Words of hope for others</option><option value="private">Private, just for Reiner (don't post)</option></select></div>
          <button class="btn btn-primary" id="anonSend" type="submit">Send anonymously ${icon("arrow", 18)}</button>
          <p class="status" id="anonStatus" aria-live="polite"></p>
          <p class="muted small" id="anonOffline" hidden>Anonymous sending is being switched on. Until it is, your message can't be delivered from this page, and emailing isn't anonymous.</p>
        </form>
        <p class="muted small">Please keep it kind; hateful or harmful messages are never posted. Avoid details that could identify you or someone else: like any website, the service that delivers a message handles it technically.</p>
      </div>

      <div class="card form-card reveal" style="--c:var(--o);--i:1">
        <h2 class="h2" style="font-size:clamp(1.6rem,3vw,2.2rem)">Contact the builder</h2>
        <p class="muted">For collaboration, feedback, volunteering or partnerships. Leave an email if you'd like a reply.</p>
        <form id="contactForm" novalidate>
          <input class="hp" id="cHp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field"><label for="cName">Name (optional)</label><input class="input" id="cName" maxlength="80" autocomplete="name"></div>
          <div class="field"><label for="cEmail">Email for a reply (optional)</label><input class="input" id="cEmail" type="email" maxlength="120" autocomplete="email"></div>
          <div class="field"><label for="cType">About</label><select class="input" id="cType"><option>Collaboration</option><option>Feedback</option><option>Volunteer or translate</option><option>Partnership</option><option>Just saying hello</option></select></div>
          <div class="field"><label for="cMsg">Message</label><textarea class="input" id="cMsg" rows="5" maxlength="1500"></textarea></div>
          <div class="row"><button class="btn btn-primary" id="cSend" type="submit">Send</button><a class="btn btn-ghost" id="cMail" href="mailto:${esc(mail)}">Send by email instead</a></div>
          <p class="status" id="cStatus" aria-live="polite"></p>
        </form>
      </div>
    </div>

    <h2 class="h3">Ways to help this grow</h2>
    <div class="grid" style="--min:16rem">
      <div class="card edge reveal" style="--c:var(--g)"><h4>Translate</h4><p class="muted" style="margin:.5rem 0 0">Help bring these pages to Hindi, Tamil, Bengali, Marathi, Telugu, Malayalam and more.</p></div>
      <div class="card edge reveal" style="--c:var(--b);--i:1"><h4>Share a verified resource</h4><p class="muted" style="margin:.5rem 0 0">Know a helpline, clinic or group that's genuinely affirming? Tell us and we'll check and list it.</p></div>
      <div class="card edge reveal" style="--c:var(--v);--i:2"><h4>Send a video</h4><p class="muted" style="margin:.5rem 0 0">A talk, an interview, a documentary. Send the link and it can be added to the Voices page.</p></div>
      <div class="card edge reveal" style="--c:var(--r);--i:3"><h4>Tell one person</h4><p class="muted" style="margin:.5rem 0 0">The easiest help of all. Someone you know needs to see this and hasn't asked.</p></div>
    </div>
  </div>
</section>`;
  }
};
