import { icon } from "../layout.mjs";
import { hero, head, photo, arrowBtn } from "../ui.mjs";

export default {
  slug: "science",
  title: "The science",
  accent: "orange",
  desc: "Homosexuality is not an illness and not a choice. What seventy years of psychology, genetics, neuroscience and biology actually found, with every study linked and its limits stated.",
  scripts: ["science"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Seventy years of research", title: "Homosexuality, <em>explained by science</em>", lede: "Psychologists, geneticists, neuroscientists and biologists asked the same questions people still argue about at dinner tables. Their answers line up." })}

<section class="verdict" aria-label="The four findings">
  <div class="v-card reveal" style="--c:var(--g)"><strong>Not a disease</strong><p>WHO, the American Psychiatric Association and the Indian Psychiatric Society all say so.</p></div>
  <div class="v-card reveal" style="--c:var(--b);--i:1"><strong>Not a choice</strong><p>Orientation emerges from biology and development. Nobody picks whom they're attracted to.</p></div>
  <div class="v-card reveal" style="--c:var(--v);--i:2"><strong>Can't be "cured"</strong><p>Change attempts don't work and are linked to depression and suicide attempts.</p></div>
  <div class="v-card reveal" style="--c:var(--o);--i:3"><strong>Found in nature</strong><p>Same-sex behaviour is documented in hundreds of animal species.</p></div>
</section>

<section class="sec">
  <div class="wrap">
    <canvas class="dna reveal" id="dna" aria-hidden="true"></canvas>
    <div class="callout reveal" style="--c:var(--o);margin-top:3rem"><p><strong>Truthfulness first.</strong> Scientists agree that sexual orientation is not chosen and is not an illness. What they still study is exactly how it develops: the current picture is many genetic, hormonal and other biological influences, with no single cause and no "gay gene." That open question is about mechanism, never about whether queer people are real or valid. This site shows the limits of each study too, because honest evidence is the strongest kind.</p></div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap-x">
    ${head("Who agrees", "Every major body <em>reached the same conclusion.</em>", "Not one opinion, but decades of independent review by the institutions that define health.")}
    <div class="consensus">
      <div class="reveal"><strong>1973</strong><span>The American Psychiatric Association removes homosexuality from its diagnostic manual after reviewing the evidence.</span></div>
      <div class="reveal" style="--i:1"><strong>1990</strong><span>The World Health Organization removes it from the international classification of diseases. 17 May is now marked as IDAHOBIT.</span></div>
      <div class="reveal" style="--i:2"><strong>2018</strong><span>The Indian Psychiatric Society states that homosexuality is not a mental illness, the year the Supreme Court decriminalises it.</span></div>
      <div class="reveal" style="--i:3"><strong>2022</strong><span>India's National Medical Commission tells state councils that conversion therapy is professional misconduct.</span></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${head("Question by question", "What the evidence <em>says.</em>")}
    <div class="wrap narrow prose" style="margin:0;padding:0;max-width:880px">
      <h3 id="illness">Is it an illness?</h3>
      <p>The first rigorous test came in 1957. Psychologist Evelyn Hooker gave personality tests to 30 gay and 30 straight men who weren't patients, then asked expert clinicians to tell them apart. They couldn't. The gay men were as psychologically healthy as everyone else. By 1973 the American Psychiatric Association had removed homosexuality from its manual; the WHO followed in 1990.</p>
      <p>Why do surveys still find more anxiety and depression among queer people? Ilan Meyer's minority stress model (2003) answers it: the extra distress comes from stigma, rejection, discrimination and the strain of hiding, not from orientation itself. Where societies become safer, the gap narrows. <a class="pill-link" href="../library/#illness">Read the studies ${icon("arrow", 16)}</a></p>

      <h3 id="choice">Is it a choice?</h3>
      <p>If you ask a straight person when they chose to be straight, they have no answer. The research reaches the same place from several directions:</p>
      <ul>
        <li><strong>Twins.</strong> In a Swedish study of about 3,800 twin pairs, genes explained roughly a third of the variation in men's same-sex behaviour and a fifth in women's. Shared upbringing explained almost none.</li>
        <li><strong>Genetics.</strong> The 2019 analysis of 477,522 people found no single "gay gene," but many tiny genetic influences that together explain part of the variation. The authors warned that nobody's orientation can be predicted from DNA.</li>
        <li><strong>Before birth.</strong> Each older brother born to the same mother raises the odds that a man is gay, but older stepbrothers raised alongside him have no effect. That points to the womb, not the household.</li>
        <li><strong>The brain.</strong> Imaging and post-mortem studies have found small group differences. They're early clues, not proof of cause.</li>
      </ul>
      <p>What people choose is whether to hide their feelings. They never choose whether to have them. <a class="pill-link" href="../library/#choice">Read the studies ${icon("arrow", 16)}</a></p>

      <h3 id="change">Can it be changed?</h3>
      <p>The American Psychological Association's 2009 task force reviewed decades of "change efforts" and found no reliable evidence they work, and evidence they can cause harm. Later surveys link such attempts to higher rates of depression and suicide attempts. India's medical commission now treats conversion therapy by doctors as professional misconduct. There is nothing to cure. <a class="pill-link" href="../library/#change">Read the studies ${icon("arrow", 16)}</a></p>

      <h3 id="nature">Is it unnatural?</h3>
      <p>Same-sex behaviour has been recorded in hundreds of animal species, and in every human society studied. A 2019 paper in <em>Nature Ecology &amp; Evolution</em> argues it may have been part of animal life since early in evolution, rather than an oddity that needs a special explanation. <a class="pill-link" href="../library/#nature">Read the study ${icon("arrow", 16)}</a></p>
    </div>
  </div>
</section>

<div class="interlude">${photo(ctx, "interlude-3")}</div>

<section class="sec alt">
  <div class="wrap cols2">
    <div>
      ${head("The twin study", "What twins <em>tell us.</em>", "Genes explained roughly a third of the variation in men's same-sex behaviour. Shared upbringing explained almost nothing. The rest came from individual factors, including conditions before birth.")}
      <div class="bars reveal" role="img" aria-label="Men: genes about 35 percent, shared upbringing about 0, individual factors about 63 percent"><span style="--w:35%;background:var(--v)">Genes ~35%</span><span style="--w:2%;background:var(--y)"></span><span style="--w:63%;background:var(--b)">Individual factors ~63%</span></div>
      <p class="muted small reveal">The yellow sliver is shared upbringing. Approximate figures for men, from Långström et al., 2010.</p>
    </div>
    <div>
      ${head("Attitudes shift", "India is changing <em>its mind.</em>", "Pew Research asked Indians whether society should accept homosexuality. In five years, acceptance more than doubled.")}
      <div class="chart reveal" role="img" aria-label="15 percent in 2014, 37 percent in 2019"><div class="col"><div class="barv" style="--h:36%">15%</div><span class="lbl">2014</span></div><div class="col"><div class="barv" style="--h:88%">37%</div><span class="lbl">2019</span></div></div>
      <p class="muted small reveal" style="margin-top:3.2rem">Source: <a href="https://www.pewresearch.org/global/2020/06/25/global-divide-on-homosexuality-persists/" target="_blank" rel="noopener noreferrer">Pew Research Center, 2020</a>.</p>
    </div>
  </div>
</section>

<a class="cta-giant block" href="../library/" style="--c:var(--y)" data-cursor="Open">
  <p class="label"><span>26 papers, every limit stated</span></p>
  <span class="cta-giant-t" data-split>Read the studies <em>yourself.</em></span>
  <span class="cta-giant-row"><span class="btn btn--ghost" style="pointer-events:none"><span class="btn-t">Open the research library</span><span class="btn-i">${icon("arrow", 18)}</span></span></span>
</a>`
};
