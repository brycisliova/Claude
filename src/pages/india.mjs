import { icon } from "../layout.mjs";
import { hero, sectionHead, ext, photo, arrowBtn } from "../ui.mjs";

export default {
  slug: "india",
  title: "India today",
  accent: "b",
  desc: "LGBTQ lives and deaths in India: why there is no official count, what independent records show, and why hating queer people is not the same as hating rapists.",
  scripts: [],
  body: (ctx) => `
${hero(ctx, { eyebrow: "India", title: "Violence against <em>LGBTQ people in India</em>", lede: "Decriminalisation changed the law. It didn't change every home, workplace or street. Here is what the record shows, what it can't show, and why the comparison people reach for falls apart.", accent: "b" })}

<section class="sec">
  <div class="wrap narrow">
    <header class="sec-head"><p class="eyebrow reveal"><span class="dot"></span>Start with one question</p><h2 class="reveal" style="--i:1">What did the victim do?</h2><p class="lede reveal" style="--i:2">Every argument below comes back to this. Anger at a rapist is anger at an act that destroyed another person. Anger at a queer person is anger at who they are.</p></header>
    <table class="ledger reveal">
      <caption class="sr-only">Comparison of the two kinds of hatred</caption>
      <thead><tr><th scope="col">Someone accused of rape</th><th scope="col">Someone who is LGBTQ</th></tr></thead>
      <tbody>
        <tr class="k"><th colspan="2" scope="colgroup">Is there a victim?</th></tr>
        <tr><td>Yes. A person was violated.</td><td>No. Nobody is harmed by someone's identity or love.</td></tr>
        <tr class="k"><th colspan="2" scope="colgroup">What is the "crime"?</th></tr>
        <tr><td>A serious offence under the law.</td><td>None. Same-sex relations were decriminalised in 2018 and trans identity is legally recognised.</td></tr>
        <tr class="k"><th colspan="2" scope="colgroup">Who ends up dead?</th></tr>
        <tr><td>Occasionally the accused, in custody, before any trial, sometimes minors.</td><td>Children, couples and trans women, at the hands of families, mobs and strangers.</td></tr>
        <tr class="k"><th colspan="2" scope="colgroup">Does the killing protect anyone?</th></tr>
        <tr><td>No. It skips the trial that would establish guilt.</td><td>No. It only punishes existing.</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="sec alt">
  <div class="wrap narrow prose">
    ${sectionHead("Part one", "Why there is no clean death toll", "Anyone who shows you a precise year-by-year count of LGBTQ hate killings in India is guessing. Here is why.")}
    <div class="callout reveal" style="--c:var(--b)"><p><strong>India stopped counting hate crimes.</strong> The National Crime Records Bureau collected data on lynchings and hate crimes in 2017, then dropped the categories, telling Parliament the data was unreliable because these crimes are not legally defined. Its separate sections on honour killings and communal violence went the same way.</p></div>
    <p>For LGBTQ people the gap is total. Official records capture only a sliver of information on transgender people, and nothing at all on lesbian, gay or bisexual victims. A gay man murdered by relatives appears as an ordinary murder, or as a suicide.</p>
    <div class="figures">
      <div class="fig reveal" style="--c:var(--b)"><strong data-count="9">0</strong><span>transgender murder victims recorded by the NCRB in 2022, out of 29,356 murders nationwide</span></div>
      <div class="fig reveal" style="--c:var(--r);--i:1"><strong>0</strong><span>cases of rape, assault or lynching against trans people in the same report</span></div>
    </div>
    <p>Trans activists call these figures a product of underreporting, not safety. Many in the community fear that reporting a death will get them blamed rather than heard.</p>
  </div>
</section>

<section class="sec">
  <div class="wrap narrow prose">
    ${sectionHead("Part two", "What the independent record shows", "The best documentation comes from the global Trans Murder Monitoring project run by Transgender Europe, which Indian queer groups now feed case reports into. Its entries are not statistics. They are people.")}
    <div class="card case reveal" style="--c:var(--r)"><h4>Nirmal, Telangana, January 2025</h4><p>A trans girl aged between 10 and 14 was strangled. The monitoring record lists her gender identity as the basis for bias.</p></div>
    <div class="card case reveal" style="--c:var(--o)"><h4>Hyderabad, February 2025</h4><p>A trans person was killed by three people at an empty site. The degree of violence was recorded as an indicator of bias.</p></div>
    <div class="card case reveal" style="--c:var(--y)"><h4>Nizamabad, Telangana, February 2024</h4><p>A hijra was strangled in the street by five attackers.</p></div>
    <div class="card case reveal" style="--c:var(--v)"><h4>Namakkal, Tamil Nadu</h4><p>Two women were fired from their loom unit after the owner disapproved of their bond. One family then arranged her marriage to a man. Both women died by suicide.</p></div>
    <p>That last case points to the larger, quieter toll. A systematic review of 164 Indian news reports on LGBTQ suicides between 2001 and 2022 found the most common reasons given were family rejection and forced separation, with couples dying together a recurring pattern. Honour killings are also known to be disguised as suicides, so some of these deaths may be murders.</p>
    <h3>An honest estimate</h3>
    <p>Documented hate-motivated killings of LGBTQ people in India number in the dozens per year. Counting family-driven couple suicides and disguised honour killings, the real toll is plausibly far higher, but no one can responsibly put a precise number on it.</p>
    <p>Expect recorded cases to rise over the next few years. That will mostly reflect better documentation by community groups, not necessarily more violence. Saying so up front stops anyone turning a rising count into a cheap rebuttal.</p>
    <h3>Rejection costs lives. Acceptance saves them.</h3>
    <p>A US study found young LGB adults who faced high family rejection were about eight times more likely to have attempted suicide (Ryan et al., 2009). Another found US states that legalised same-sex marriage saw a 7% drop in high-school suicide attempts (Raifman et al., 2017). Both are in the <a href="../library/#health">research library</a>.</p>
  </div>
</section>

<section class="sec alt">
  <div class="wrap narrow prose">
    ${sectionHead("Part three", "The \"rapists get shot\" claim", "Some say society hates rapists just as much, pointing to police shootings of rape accused. The famous cases are few, and neither turned out to be justice.")}
    <div class="card case reveal" style="--c:var(--b)"><h4>Hyderabad, December 2019: four killed</h4><p>Four men accused in the rape and murder of a veterinary doctor were shot dead while in police custody. A Supreme Court-appointed commission headed by Justice V.S. Sirpurkar found the "encounter" was fake and that police fired with intent to kill.</p><p>It found three of the four were minors, that police knew the ages of at least two, and that a key confession statement was untrue. It recommended that 10 officers be tried for murder.</p></div>
    <div class="card case reveal" style="--c:var(--b)"><h4>Badlapur, September 2024: one killed</h4><p>Akshay Shinde, accused of sexually assaulting two kindergarten girls, was shot inside a moving police van. A magistrate's inquiry found police could have controlled the situation without force and held five officers responsible. The Bombay High Court ordered an FIR against them.</p></div>
    <div class="figures">
      <div class="fig reveal" style="--c:var(--b)"><strong data-count="813">0</strong><span>encounter killing cases recorded by the NHRC across India in six years to 2022</span></div>
      <div class="fig reveal" style="--c:var(--b);--i:1"><strong data-count="5">0</strong><span>people killed in the two headline cases involving rape accused, both later found to be unjustified</span></div>
    </div>
    <p>Most encounter killings happen in states like Chhattisgarh, Uttar Pradesh, Assam and Jharkhand, in insurgency and gangster cases. Rape accused are a tiny fraction.</p>
    <h3>Meanwhile, the courts mostly fail survivors</h3>
    <p>Of the rape trials Indian courts completed in 2024:</p>
    <div class="bar3 reveal" role="img" aria-label="24 percent convicted, 8 percent discharged, 68 percent acquitted"><span style="--w:24%;background:var(--b)">24%</span><span style="--w:8%;background:#d6d1c7">8%</span><span style="--w:68%;background:#aaa498">68% acquitted</span></div>
    <p class="muted small">Convicted · Discharged · Acquitted. Only about 2% of rape cases sent to trial in 2024 ended in conviction the same year.</p>
    <p>So rapists are not being punished, either by bullets or by courts. And LGBTQ people are being punished, by families, mobs and silence, for no crime at all.</p>

    <h3>Side by side</h3>
    <div class="table-wrap reveal"><table>
      <thead><tr><th scope="col"><span class="sr-only">Aspect</span></th><th scope="col">Rape accused killed by police</th><th scope="col">LGBTQ people killed</th></tr></thead>
      <tbody>
        <tr><td>Who kills</td><td>The state, in custody</td><td>Families, partners, strangers, mobs</td></tr>
        <tr><td>Officially counted?</td><td>Partly, through NHRC inquiries</td><td>Barely for trans people, not at all for LGB people</td></tr>
        <tr><td>Investigated?</td><td>Yes. Both headline cases led to findings against police</td><td>Rarely recognised as hate crimes</td></tr>
        <tr><td>Proven guilt?</td><td>No trial took place. Minors were among the dead</td><td>There was nothing to be guilty of</td></tr>
      </tbody>
    </table></div>
  </div>
</section>

<section class="sec">
  <div class="wrap narrow prose">
    ${sectionHead("Part four", "The argument, in three lines")}
    <ol class="args">
      <li class="reveal"><strong>Harm versus identity.</strong> Hatred of rapists responds to an act that destroyed someone. Hatred of queer people responds to existence. Equating the two treats loving someone as equivalent to violating someone.</li>
      <li class="reveal"><strong>"Encounter justice" kills the accused, not the guilty.</strong> In Hyderabad, the dead included minors and rested on a confession the commission rejected. If police can shoot whoever the public is angry at, the next target can just as easily be a gay man or a trans woman. The same rule of law protects both.</li>
      <li class="reveal"><strong>The comparison points the other way.</strong> Rapists mostly walk free. Queer people mostly pay. Society's rage is landing on the wrong people.</li>
    </ol>
    <h3>Where the other side will push back</h3>
    <p><strong>"Nine trans murders is about what you'd expect for the population."</strong> Possibly, if you trust the census count of trans people, which activists consider a severe undercount. And LGB victims are not counted at all, while coerced suicides and disguised honour killings never enter murder figures.</p>
    <p><strong>"People cheer encounters because courts fail."</strong> Fair, and worth conceding. It is an argument for fixing courts, not for killing suspects before trial.</p>
    <p><strong>"Harsh, fast punishment deters crime."</strong> Some people sincerely believe this. Hyderabad shows how fast punishment can kill children whose guilt was never proven.</p>
    <p>Conceding what is uncertain makes everything else harder to dismiss.</p>
    <p class="muted small">Every source for this page is listed on the <a href="../sources/#violence">sources page</a>.</p>
  </div>
</section>`
};
