import { esc, icon } from "../layout.mjs";
import { hero, photo, arrowBtn } from "../ui.mjs";
import { LINES } from "../data/content.mjs";

export default {
  slug: "help",
  title: "Help and guides",
  accent: "v",
  desc: "Verified helplines, and practical guides: if you're questioning, coming out safely, for parents, for allies, at college and work, and your legal rights in India.",
  scripts: ["help"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Support", title: "Help <em>and guides</em>", lede: "Helplines first. Then practical guides for the situations people run into most.", accent: "v" })}

<section class="sec" style="padding-top:2.5rem">
  <div class="wrap">
    <div class="urgent reveal">
      <h2>If you're in danger or thinking of ending your life</h2>
      <p>Call <a href="tel:112"><strong>112</strong></a> for emergencies, or <a href="tel:14416"><strong>Tele-MANAS 14416</strong></a>, the government's free 24/7 mental health line in English and 20 Indian languages. You can also go to the nearest hospital emergency department. Whatever is happening, there are people who want to help.</p>
    </div>

    <div class="subtabs" role="tablist" aria-label="Help topics">
      <button class="subtab" role="tab" data-sub="lines" aria-selected="true">Helplines</button>
      <button class="subtab" role="tab" data-sub="questioning" aria-selected="false">If you're questioning</button>
      <button class="subtab" role="tab" data-sub="coming" aria-selected="false">Coming out safely</button>
      <button class="subtab" role="tab" data-sub="family" aria-selected="false">For parents</button>
      <button class="subtab" role="tab" data-sub="allies" aria-selected="false">For allies</button>
      <button class="subtab" role="tab" data-sub="work" aria-selected="false">At college and work</button>
      <button class="subtab" role="tab" data-sub="rights" aria-selected="false">Legal rights</button>
    </div>

    <div class="subpanel active" id="sub-lines" role="tabpanel">
      <div class="grid" style="--min:17rem">
        ${LINES.map(([n, num, href, d, c]) => `<div class="card line-card lift" style="--c:var(--${c})"><h4>${esc(n)}</h4><a class="num${num.length > 12 ? " sm" : ""}" href="${esc(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(num)}</a><p>${esc(d)}</p></div>`).join("")}
      </div>
      <p class="muted small" style="margin-top:1.25rem">Numbers and hours can change. If a line doesn't connect, try another or check the organisation's website.</p>
    </div>

    <div class="subpanel" id="sub-questioning" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">It's okay not to know yet</h3>
      <p>Questioning is normal and has no deadline. Some people know early; others work it out in their twenties, forties or later.</p>
      <ol class="steps"><li><strong>Give yourself time.</strong> Use a label if it helps, and change it if it stops fitting.</li><li><strong>Read and listen.</strong> Stories on Gaysi Family, Orinam and Agents of Ishq can help you feel less alone.</li><li><strong>Talk to someone safe.</strong> An affirming counsellor at iCALL or Humsafar can help you sort through feelings without judgement.</li><li><strong>Remember the science.</strong> Whatever you find out about yourself, it is not an illness and not your fault.</li></ol>
    </div></div>

    <div class="subpanel" id="sub-coming" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">Your safety comes first</h3>
      <p>Coming out is your decision and your timing. Staying private to stay safe is not cowardice.</p>
      <ol class="steps"><li><strong>Assess safety.</strong> Do you depend on this person for housing or money? Have they said hostile things? If so, consider waiting or building support first.</li><li><strong>Start with one safe person.</strong> A friend or sibling likely to be supportive can become an ally for harder conversations.</li><li><strong>Have a backup plan.</strong> Know where you could stay, keep documents accessible, save helpline numbers.</li><li><strong>Expect a process.</strong> Many families react badly at first and come around over months or years.</li><li><strong>Know you're protected.</strong> Adults in India have the right to live with a partner of their choice. If family threatens or confines you, contact the police, a lawyer or an NGO like Humsafar.</li></ol>
    </div></div>

    <div class="subpanel" id="sub-family" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">If your child just came out to you</h3>
      <p>They trusted you with something big. They'll remember how you react first.</p>
      <ol class="steps"><li><strong>Say you love them.</strong> It matters more than whatever you say next.</li><li><strong>Don't look for a cure.</strong> Doctors who try to change orientation can face misconduct action in India, and research links such attempts to depression and suicide.</li><li><strong>Don't force marriage.</strong> It destroys two lives and has pushed queer people to suicide.</li><li><strong>Learn alongside them.</strong> The <a href="../science/">science</a> and <a href="../myths/">myths</a> pages here are a good start. Parent support groups exist through Humsafar and Sappho for Equality.</li><li><strong>Feel your feelings elsewhere.</strong> It's okay to grieve the future you imagined. Talk to a counsellor or friend, not at your child.</li></ol>
    </div></div>

    <div class="subpanel" id="sub-allies" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">How to be a good friend</h3>
      <ol class="steps"><li><strong>Keep secrets.</strong> Never out someone. Their story is theirs.</li><li><strong>Speak up when they're not there.</strong> Push back on jokes and slurs in group chats. Silence is read as agreement.</li><li><strong>Use the names and pronouns people ask for.</strong> If you slip, correct yourself briefly and move on.</li><li><strong>Correct myths with facts.</strong> Share the specific study that answers the claim.</li><li><strong>Check in.</strong> "How are you really doing?" can matter a lot.</li></ol>
    </div></div>

    <div class="subpanel" id="sub-work" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">On campus and at work</h3>
      <ol class="steps"><li><strong>Look for queer collectives.</strong> Many Indian colleges, including the IITs, IIMs and central universities, have student-run queer groups. They're often the fastest route to friends who understand.</li><li><strong>Use the counselling centre.</strong> Campus counsellors are bound by confidentiality. If one isn't affirming, you can ask for another or use iCALL.</li><li><strong>Report harassment.</strong> Bullying and mocking are not "jokes." Colleges have anti-ragging and grievance cells; workplaces have HR and, for trans employees, protections under the 2019 Act.</li><li><strong>Check employer policies.</strong> Many Indian companies now offer partner benefits and employee resource groups.</li><li><strong>Document everything.</strong> Save screenshots and dates if you're being targeted.</li></ol>
    </div></div>

    <div class="subpanel" id="sub-rights" role="tabpanel"><div class="prose" style="max-width:46rem">
      <h3 style="margin-top:0">What Indian law says</h3>
      <ol class="steps"><li><strong>Same-sex relationships are legal.</strong> Since Navtej Singh Johar (2018), consensual adult relationships are not a crime.</li><li><strong>Privacy covers orientation.</strong> Puttaswamy (2017) recognises sexual orientation as part of the fundamental right to privacy.</li><li><strong>Transgender people are legally recognised.</strong> NALSA (2014) and the 2019 Act prohibit discrimination. The 2026 amendment changed how identity certificates are issued; check the latest rules or ask a legal aid group.</li><li><strong>Conversion therapy by doctors is misconduct.</strong> You can complain to your State Medical Council.</li><li><strong>Same-sex marriage is not yet legal.</strong> The Supreme Court left it to Parliament in 2023.</li></ol>
      <p class="muted small">General information, not legal advice.</p>
    </div></div>

    <div class="callout reveal" style="--c:var(--b)"><p><strong>Using this site safely.</strong> The red <em>Quick exit</em> button (bottom left, or press Esc three times) leaves immediately. If you share a device, read the <a href="../privacy/">privacy and safety page</a>.</p></div>
  </div>
</section>`
};
