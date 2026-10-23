// All editorial data for the site. Colour keys map to CSS variables (--r, --o, --y, --g, --b, --v, --pink, --sky).

import { allSources } from "./violence.mjs";

export const MARQUEE = [
  "You were never something to be fixed",
  "Love is not a lifestyle",
  "Being yourself is not a phase",
  "You belong here",
  "Science is on your side",
  "Rest is not giving up",
  "There are people who will love the true you"
];

export const LETTERS = [
  ["L", "Lesbian", "A woman attracted to women.", "r"],
  ["G", "Gay", "A man attracted to men. Also used broadly by anyone attracted to the same gender.", "o"],
  ["B", "Bisexual", "Attracted to more than one gender, not necessarily equally or at the same time.", "y"],
  ["T", "Transgender", "Someone whose gender identity differs from the sex they were assigned at birth. It's about who you are, not about who you love.", "g"],
  ["Q", "Queer or questioning", "Queer is a reclaimed umbrella word. Questioning means you're still working it out, which is fine.", "b"],
  ["I", "Intersex", "Born with sex characteristics that don't fit typical male or female definitions. A natural biological variation.", "v"],
  ["A", "Asexual and aromantic", "Little or no sexual attraction (asexual) or romantic attraction (aromantic). Some read A as ally too.", "pink"],
  ["+", "And more", "Pansexual, non-binary, genderfluid, demisexual and others. The plus means the list stays open.", "sky"]
];

export const GLOSSARY = [
  ["Ally", "Someone who isn't LGBTQIA+ but actively supports queer people."],
  ["Aromantic", "Experiencing little or no romantic attraction."],
  ["Asexual (ace)", "Experiencing little or no sexual attraction. Asexual people may still want romance and partnership."],
  ["Assigned at birth", "The sex a doctor records when a baby is born, usually based on visible anatomy."],
  ["Biphobia", "Prejudice against bisexual people, including claims that they're confused or greedy."],
  ["Cisgender", "Someone whose gender identity matches the sex they were assigned at birth."],
  ["Closeted", "Not open about one's orientation or gender identity, often for safety."],
  ["Coming out", "Sharing one's identity with others. Something that happens again and again over a lifetime, not once."],
  ["Conversion therapy", "Discredited attempts to change orientation or gender identity. Professional misconduct for doctors in India since 2022."],
  ["Deadname", "A trans person's birth name that they no longer use. Using it on purpose is hurtful."],
  ["Demisexual", "Feeling sexual attraction only after forming a deep emotional bond."],
  ["Gender dysphoria", "Distress some trans people feel when their body or social role doesn't match their gender identity."],
  ["Gender expression", "How someone presents their gender through clothing, voice and behaviour."],
  ["Gender identity", "A person's inner sense of being a man, woman, both, neither, or something else."],
  ["Genderfluid", "A gender identity that shifts over time."],
  ["Heteronormativity", "The assumption that everyone is straight and that being straight is the default."],
  ["Hijra", "A South Asian community of trans and gender-diverse people with a long cultural history."],
  ["Homophobia", "Fear, hatred or discrimination against gay and lesbian people."],
  ["Internalised homophobia", "Negative beliefs about queerness that queer people absorb from society and turn on themselves."],
  ["Lavender marriage", "A marriage of convenience, often between a gay man and a lesbian, to hide their orientations."],
  ["Minority stress", "The extra, chronic stress queer people face from stigma, discrimination and hiding."],
  ["Misgendering", "Referring to someone with the wrong gender, pronouns or name."],
  ["Non-binary", "A gender identity outside the categories of man or woman."],
  ["Outing", "Revealing someone's identity without their consent. It can put them in danger."],
  ["Pansexual", "Attraction regardless of gender."],
  ["Pride", "Celebration of queer identity and the movement for equal rights. India's first pride walk was in Kolkata, 1999."],
  ["Pronouns", "Words like he, she or they used to refer to someone."],
  ["Queer", "A reclaimed umbrella term for anyone who isn't straight or cisgender."],
  ["Section 377", "The colonial-era law that criminalised same-sex relations in India until 2018."],
  ["Transition", "Steps some trans people take to live as their gender: social, legal or medical. There's no one right way."],
  ["Transphobia", "Prejudice or discrimination against transgender people."],
  ["Two-Spirit", "A term used by some Indigenous North American people for gender-diverse identities."]
];

// tags: illness, choice, change, nature, health, family
export const PTAGS = [
  ["all", "All"], ["illness", "Not an illness"], ["choice", "Not a choice"], ["change", "Change efforts"],
  ["health", "Mental health"], ["family", "Family"], ["nature", "Nature"]
];
export const TAG_COLOR = { illness: "g", choice: "b", change: "r", health: "v", family: "o", nature: "y" };

export const PAPERS = [
  { y: 1948, t: "Sexual Behavior in the Human Male", a: "Kinsey, Pomeroy & Martin", j: "Book, W.B. Saunders", u: "https://en.wikipedia.org/wiki/Kinsey_Reports", f: "Interviews with thousands of Americans showed same-sex attraction was far more common than assumed, and that sexuality varies along a spectrum.", c: "Samples were not random, so exact percentages are unreliable. What lasted was the picture of diversity, not the exact percentages.", tags: ["choice"] },
  { y: 1957, t: "The adjustment of the male overt homosexual", a: "Evelyn Hooker", j: "Journal of Projective Techniques", u: "https://doi.org/10.1080/08853126.1957.10380742", f: "Expert clinicians shown blind personality tests from 30 gay and 30 straight men couldn't tell them apart. Gay men were as psychologically healthy.", c: "Small sample of non-patient men from one city, but it was the first rigorous challenge to the illness model.", tags: ["illness"] },
  { y: 1991, t: "A genetic study of male sexual orientation", a: "Bailey & Pillard", j: "Archives of General Psychiatry", u: "https://doi.org/10.1001/archpsyc.1991.01810360053008", f: "Identical twins of gay men were much more likely to be gay than fraternal twins or adopted brothers, pointing to a genetic influence.", c: "Volunteers were recruited through ads, which likely inflated concordance. Later population studies found smaller but still real genetic effects.", tags: ["choice"] },
  { y: 1991, t: "A difference in hypothalamic structure between heterosexual and homosexual men", a: "Simon LeVay", j: "Science", u: "https://doi.org/10.1126/science.1887219", f: "A small brain region (INAH3) was on average smaller in gay men than in straight men.", c: "Only 41 post-mortem brains, many affected by AIDS. A first clue, not proof on its own.", tags: ["choice"] },
  { y: 1993, t: "A linkage between DNA markers on the X chromosome and male sexual orientation", a: "Hamer et al.", j: "Science", u: "https://doi.org/10.1126/science.8332896", f: "Reported a link between a region called Xq28 and male homosexuality in families with several gay brothers.", c: "Replication was mixed. A larger 2015 study (Sanders et al.) supported it, but the 2019 GWAS did not find it. Treat as unsettled.", tags: ["choice"] },
  { y: 1996, t: "Homosexuality in men and number of older brothers", a: "Blanchard & Bogaert", j: "American Journal of Psychiatry", u: "https://doi.org/10.1176/ajp.153.1.27", f: "Each older brother increased the odds of a man being gay. This fraternal birth order effect is one of the most replicated findings in the field.", c: "Explains only a portion of gay men. It describes a pattern across populations, not a rule for any one person.", tags: ["choice"] },
  { y: 2003, t: "Prejudice, social stress, and mental health in LGB populations", a: "Ilan Meyer", j: "Psychological Bulletin", u: "https://doi.org/10.1037/0033-2909.129.5.674", f: "Introduced the minority stress model: higher rates of mental health problems among LGB people are explained by stigma and discrimination, not orientation itself.", c: "A review and theoretical model; many later studies have since tested and supported it.", tags: ["illness", "health"] },
  { y: 2006, t: "Biological versus nonbiological older brothers and men's sexual orientation", a: "Anthony Bogaert", j: "PNAS", u: "https://doi.org/10.1073/pnas.0511152103", f: "Only older brothers born to the same mother mattered, even if raised apart. Stepbrothers or adopted brothers raised together had no effect. Points to the womb rather than upbringing.", c: "Observational data; the biological mechanism was proposed later.", tags: ["choice"] },
  { y: 2008, t: "PET and MRI show differences in cerebral asymmetry and functional connectivity between homo- and heterosexual subjects", a: "Savic & Lindström", j: "PNAS", u: "https://doi.org/10.1073/pnas.0801566105", f: "Brain symmetry patterns of gay men resembled straight women's, and lesbians' resembled straight men's, in areas unlikely to be shaped by learning.", c: "90 participants. Brain differences can't by themselves say what caused them.", tags: ["choice"] },
  { y: 2009, t: "Family rejection as a predictor of negative health outcomes in LGB young adults", a: "Ryan et al.", j: "Pediatrics", u: "https://doi.org/10.1542/peds.2007-3524", f: "Young people facing high family rejection were about 8.4 times more likely to report suicide attempts than those facing little or none.", c: "Cross-sectional US data, so it shows strong association rather than proven cause.", tags: ["health", "family"] },
  { y: 2009, t: "Appropriate therapeutic responses to sexual orientation", a: "American Psychological Association Task Force", j: "APA report", u: "https://www.apa.org/pi/lgbt/resources/therapeutic-response.pdf", f: "A systematic review found no reliable evidence that efforts to change sexual orientation work, and evidence of harm.", c: "Most change-effort studies it reviewed were themselves low quality, which is part of its conclusion.", tags: ["change"] },
  { y: 2010, t: "Genetic and environmental effects on same-sex sexual behavior: a population study of twins in Sweden", a: "Långström et al.", j: "Archives of Sexual Behavior", u: "https://doi.org/10.1007/s10508-008-9386-1", f: "About 3,800 twin pairs. Genes explained roughly a third of variation in men and a fifth in women; shared family environment explained almost none.", c: "Measures behaviour rather than identity, and same-sex behaviour was rare, so estimates have wide uncertainty.", tags: ["choice"] },
  { y: 2010, t: "US National Longitudinal Lesbian Family Study: psychological adjustment of 17-year-old adolescents", a: "Gartrell & Bos", j: "Pediatrics", u: "https://doi.org/10.1542/peds.2009-3153", f: "Teenagers raised by lesbian mothers since birth were rated higher in social and academic competence and lower in behaviour problems than a normative sample.", c: "Volunteer families, mostly well-off and white, so not representative.", tags: ["family"] },
  { y: 2011, t: "The social environment and suicide attempts in LGB youth", a: "Mark Hatzenbuehler", j: "Pediatrics", u: "https://doi.org/10.1542/peds.2010-3020", f: "LGB youth in more supportive social environments had a significantly lower risk of suicide attempts.", c: "One US state's data; county-level environment measures.", tags: ["health"] },
  { y: 2015, t: "Genome-wide scan demonstrates significant linkage for male sexual orientation", a: "Sanders et al.", j: "Psychological Medicine", u: "https://doi.org/10.1017/S0033291714002451", f: "In 409 pairs of gay brothers, found linkage to regions on chromosome 8 and Xq28.", c: "Linkage studies are coarse; the 2019 GWAS found different specific loci.", tags: ["choice"] },
  { y: 2015, t: "LGB-affirmative cognitive-behavioral therapy for young adult gay and bisexual men", a: "Pachankis et al.", j: "Journal of Consulting and Clinical Psychology", u: "https://doi.org/10.1037/ccp0000037", f: "A therapy targeting minority stress (ESTEEM) reduced depression and alcohol use.", c: "Small pilot trial of 63 men; larger trials have followed.", tags: ["health"] },
  { y: 2016, t: "Sexual orientation, controversy, and science", a: "Bailey et al.", j: "Psychological Science in the Public Interest", u: "https://doi.org/10.1177/1529100616637616", f: "A major review concluding there is considerably more evidence for non-social causes of sexual orientation than social ones, and no good evidence it can be changed by therapy or upbringing.", c: "A review, so it depends on the studies it summarises, which it critiques openly.", tags: ["choice", "change"] },
  { y: 2017, t: "Difference-in-differences analysis of state same-sex marriage policies and adolescent suicide attempts", a: "Raifman et al.", j: "JAMA Pediatrics", u: "https://doi.org/10.1001/jamapediatrics.2016.4529", f: "After US states legalised same-sex marriage, high-school suicide attempts fell by about 7%, with larger drops among sexual minority students.", c: "Strong design for observational data, though it can't rule out every other change.", tags: ["health"] },
  { y: 2017, t: "Music therapy for depression", a: "Aalbers et al.", j: "Cochrane Database of Systematic Reviews", u: "https://doi.org/10.1002/14651858.CD004517.pub3", f: "Music therapy added to usual care probably reduces depressive symptoms and anxiety in the short term.", c: "Low to moderate certainty; studies varied in quality.", tags: ["health"] },
  { y: 2018, t: "Male homosexuality and maternal immune responsivity to the Y-linked protein NLGN4Y", a: "Bogaert et al.", j: "PNAS", u: "https://doi.org/10.1073/pnas.1705895114", f: "Mothers of gay sons, especially those with older brothers, had higher antibody levels to a male-specific brain protein, a possible mechanism for the older-brother effect.", c: "Small sample; needs replication.", tags: ["choice"] },
  { y: 2019, t: "Large-scale GWAS reveals insights into the genetic architecture of same-sex sexual behavior", a: "Ganna et al.", j: "Science", u: "https://www.science.org/doi/10.1126/science.aat7693", f: "477,522 people. No single gay gene; many variants with small effects. Common variants together explained 8 to 25% of variation.", c: "Measured ever having a same-sex partner, mostly in people of European ancestry. Authors warned against using it to predict anyone's orientation.", tags: ["choice"] },
  { y: 2019, t: "An alternative hypothesis for the evolution of same-sex sexual behaviour in animals", a: "Monk et al.", j: "Nature Ecology & Evolution", u: "https://doi.org/10.1038/s41559-019-1019-7", f: "Proposes same-sex behaviour may have been part of animal life from early in evolution, rather than an anomaly needing special explanation.", c: "A theoretical paper that calls for more data.", tags: ["nature"] },
  { y: 2020, t: "Parent-initiated sexual orientation change efforts with LGBT adolescents", a: "Ryan et al.", j: "Journal of Homosexuality", u: "https://doi.org/10.1080/00918369.2018.1538407", f: "Young adults whose parents tried to change their orientation had higher depression and suicide attempt rates and lower education and income.", c: "Retrospective self-reports from one US sample.", tags: ["change", "family"] },
  { y: 2020, t: "Association between recalled exposure to gender identity conversion efforts and psychological distress and suicide attempts", a: "Turban et al.", j: "JAMA Psychiatry", u: "https://doi.org/10.1001/jamapsychiatry.2019.2285", f: "Trans adults exposed to conversion efforts had higher odds of lifetime suicide attempts, especially if exposed before age 10.", c: "Cross-sectional survey data.", tags: ["change", "health"] },
  { y: 2020, t: "Sexual orientation change efforts, adverse childhood experiences, and suicide ideation and attempt", a: "Blosnich et al.", j: "American Journal of Public Health", u: "https://doi.org/10.2105/AJPH.2020.305637", f: "Sexual minority adults who went through change efforts had nearly twice the odds of suicidal thoughts and higher odds of attempts, even after accounting for childhood adversity.", c: "Observational; US national sample.", tags: ["change", "health"] },
  { y: 2025, t: "Portrayals of suicide and suicide attempts among LGBTQ+ individuals in Indian digital news", a: "Jetubhai KB", j: "Dialogues in Health", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12311544", f: "Analysis of 164 Indian news reports: family non-acceptance and forced separation were the most common narratives; joint couple suicides were frequent.", c: "Based on news coverage, so it reflects what gets reported, not all cases.", tags: ["health", "family"] }
];

export const TIMELINE = [
  ["culture", "Ancient India", "Diversity in scripture and stone", "Shikhandi in the Mahabharata, Ardhanarishvara, and later the carvings at Khajuraho (around 950 to 1050 CE).", "o"],
  ["india", "1861", "Section 377 is imposed", "British colonial rulers criminalise \"carnal intercourse against the order of nature.\"", "r"],
  ["science", "1948", "The Kinsey Report", "Shows same-sex attraction is far more common than assumed.", "y"],
  ["science", "1957", "Hooker's blind test", "Experts can't tell gay and straight men apart on psychological tests.", "g"],
  ["culture", "1969", "Stonewall, New York", "Riots after a police raid spark the modern global pride movement.", "b"],
  ["science", "1973", "APA declassifies homosexuality", "No longer a mental disorder in the American diagnostic manual.", "v"],
  ["culture", "1980s", "Ashok Row Kavi speaks out", "One of the first Indians to talk openly about being gay in the press; he later founds Bombay Dost (1990) and the Humsafar Trust (1994).", "pink"],
  ["science", "1990", "WHO removes homosexuality from its disease list", "On 17 May, now the International Day Against Homophobia, Biphobia and Transphobia.", "sky"],
  ["culture", "1999", "India's first pride walk", "A small group walks in Kolkata in the Friendship Walk.", "r"],
  ["india", "2001", "Naz Foundation challenges 377", "The petition that starts India's long legal battle.", "o"],
  ["culture", "2006", "A prince comes out", "Manvendra Singh Gohil of Rajpipla becomes the first Indian royal to come out publicly.", "y"],
  ["india", "2009", "Delhi High Court reads down 377", "Naz Foundation v. Government of NCT of Delhi decriminalises consensual same-sex relations.", "g"],
  ["india", "2013", "Supreme Court reverses it", "Suresh Kumar Koushal v. Naz Foundation reinstates 377.", "r"],
  ["india", "2014", "NALSA judgment", "Transgender people recognised as a third gender, with the right to self-identify.", "b"],
  ["india", "2017", "Right to privacy", "Puttaswamy names sexual orientation as an essential part of privacy.", "v"],
  ["india", "6 Sep 2018", "Navtej Singh Johar: 377 struck down", "A five-judge bench decriminalises same-sex love. The Indian Psychiatric Society says homosexuality is not an illness.", "g"],
  ["culture", "2019", "Dutee Chand comes out", "The sprinter becomes India's first openly gay elite athlete.", "pink"],
  ["science", "2019", "Largest genetics study published", "477,522 people. No single gay gene, but many small genetic influences.", "sky"],
  ["india", "2019", "Transgender Persons Act", "Prohibits discrimination against transgender people.", "o"],
  ["india", "2021", "Madras High Court guidelines", "S. Sushma v. Commissioner of Police orders protections for queer people and action against conversion therapy.", "y"],
  ["india", "2022", "Conversion therapy declared misconduct", "The National Medical Commission tells all state councils.", "v"],
  ["india", "Oct 2023", "Marriage equality case", "Supriyo Chakraborty v. Union of India: the Supreme Court declines to legalise same-sex marriage, leaving it to Parliament.", "b"],
  ["india", "Mar 2026", "Transgender amendment passed (contested)", "Introduces medical-board verification, narrows the legal definition, adds tougher penalties for some crimes. The government says it targets welfare and prevents coercion; activists say it removes self-identification recognised in NALSA. Protests took place nationwide and legal challenges are expected.", "r"]
];

export const PEOPLE = [
  ["Ashok Row Kavi", "Journalist, founder of Humsafar Trust", "Spoke openly about being gay in Indian media in the 1980s, when almost no one did. Founded Bombay Dost, India's first gay magazine, and the Humsafar Trust, which still runs helplines and clinics.", "https://en.wikipedia.org/wiki/Ashok_Row_Kavi", "o"],
  ["Laxmi Narayan Tripathi", "Trans rights activist", "A key voice in the NALSA case that recognised transgender people in 2014. Her memoir is Me Hijra, Me Laxmi. She heads the Kinnar Akhada and has represented Asia-Pacific in UN HIV/AIDS forums.", "https://en.wikipedia.org/wiki/Laxmi_Narayan_Tripathi", "r"],
  ["Manvendra Singh Gohil", "Prince of Rajpipla", "Came out in 2006, the first Indian royal to do so, and faced public rejection from his family. Founded the Lakshya Trust for HIV awareness and queer support.", "https://en.wikipedia.org/wiki/Manvendra_Singh_Gohil", "y"],
  ["Navtej Singh Johar", "Bharatanatyam dancer", "Lead petitioner in the 2018 case that struck down Section 377. His name is on the judgment that decriminalised same-sex relations.", "https://en.wikipedia.org/wiki/Navtej_Singh_Johar_v._Union_of_India", "g"],
  ["Keshav Suri", "Hotelier, 377 petitioner", "Another petitioner in the 2018 case. Married his partner Cyril Feuillebois. His mother and sisters supported him from the start, and his foundation funds scholarships and mental health support for queer people.", "https://www.mansworldindia.com/people/mw-anniversary-special-meet-kitty-sus-keshav-suri-the-prince-of-safe-spaces-for-the-queer-community/", "b"],
  ["Ritu Dalmia", "Chef, 377 petitioner", "Came out to her parents at 23 and later joined the Supreme Court petition alongside other prominent Indians.", "https://en.wikipedia.org/wiki/Ritu_Dalmia", "v"],
  ["Dutee Chand", "Olympic sprinter", "In 2019 became India's first openly gay elite athlete, speaking about her relationship despite opposition at home.", "https://en.wikipedia.org/wiki/Dutee_Chand", "pink"],
  ["Grace Banu", "Dalit trans activist, engineer", "The first transgender person admitted to an engineering college in Tamil Nadu. Campaigns for reservations and dignity for trans people.", "https://en.wikipedia.org/wiki/Grace_Banu", "sky"],
  ["Anjali Gopalan", "Founder, Naz Foundation", "Filed the 2001 petition against Section 377 that started India's long court fight.", "https://en.wikipedia.org/wiki/Anjali_Gopalan", "o"],
  ["Saurabh Kirpal", "Senior advocate", "In 2021 the Supreme Court collegium recommended him as a Delhi High Court judge, the first openly gay person recommended for the role in India.", "https://en.wikipedia.org/wiki/Saurabh_Kirpal", "g"],
  ["Joyita Mondal", "Judge, activist", "Became one of India's first transgender judges when appointed to a Lok Adalat in West Bengal in 2017, after years of rejection and homelessness.", "https://en.wikipedia.org/wiki/Joyita_Mondal", "r"],
  ["Padmini Prakash", "News anchor", "Became India's first transgender television news anchor in 2014 in Tamil Nadu.", "https://en.wikipedia.org/wiki/Padmini_Prakash", "v"]
];

export const BLOGS = [
  ["Gaysi Family", "Essays, art and personal stories from desi queer people.", "https://gaysifamily.com", "r"],
  ["Orinam", "Chennai-based resources, family stories and research, in many Indian languages.", "https://orinam.net", "o"],
  ["Agents of Ishq", "Warm, frank writing on love, sex and identity in India.", "https://agentsofishq.com", "y"],
  ["The Humsafar Trust", "Support groups, events and community updates.", "https://humsafar.org", "g"],
  ["Sappho for Equality", "Writing and support for lesbian, bisexual and trans masculine people.", "https://www.sapphokolkata.in", "b"],
  ["Naz Foundation", "The organisation that started the fight against 377.", "https://nazindia.org", "v"],
  ["Find A Helpline: India", "A verified directory of LGBTQ-friendly helplines.", "https://findahelpline.com/countries/in/topics/gender-sexual-identity", "pink"],
  ["Homegrown: queer helplines", "A roundup of Indian queer and trans support lines.", "https://homegrown.co.in/homegrown-voices/7-queer-trans-support-helplines-in-india-you-can-reach-out-to-right-now", "sky"]
];

// Embeddable videos live in /data/videos.json so they can be edited without a rebuild.
export const TALKS = [
  { link: "https://www.ted.com/talks/laxmi_narayan_tripathi_lgbtq_in_modern_india", title: "LGBTQ+ in Modern India", note: "Laxmi Narayan Tripathi at TEDxMMCOE (2021) on queer life and history in India.", c: "r", label: "Watch the talk" },
  { link: "https://www.ted.com/talks/laxmi_narayan_tripathi_demystifying_gender_in_indian_culture", title: "Demystifying Gender in Indian Culture", note: "Laxmi Narayan Tripathi at TEDx (2018) on the long history of gender diversity in India.", c: "o", label: "Watch the talk" },
  { link: "https://www.hrw.org/video-photos/video/2018/09/06/india-supreme-court-strikes-down-sodomy-law", title: "India: Supreme Court strikes down sodomy law", note: "Human Rights Watch's video report on the day Section 377 fell, 6 September 2018.", c: "g", label: "Watch the report" }
];

export const INTERVIEWS = [
  ["Keshav Suri", "On being born gay", "In an interview with Entrepreneur India, he said being gay came naturally because he was born with it, and described deciding to come out before family pressure built.", "https://india.entrepreneur.com/?p=56893", "b"],
  ["Keshav Suri", "One year after 377", "Speaking to IANSlife, he said many people found courage to come out after the verdict, but stigma persists, and argued much homophobia comes from lack of knowledge.", "https://morungexpress.com/road-equality-long-one", "g"],
  ["Keshav Suri", "Privilege with purpose (podcast)", "On the #SayAgain podcast, he talks about coming out to his team and his foundation's mental health work for queer and neurodivergent people.", "https://zh.player.fm/1BmgtgB", "v"],
  ["Laxmi Narayan Tripathi", "Gender in Indian culture", "In her TEDx talks she argues that India's kinnar heritage proves gender diversity is part of Indian tradition, not foreign to it.", "https://www.ted.com/talks/laxmi_narayan_tripathi_demystifying_gender_in_indian_culture", "r"]
];

export const SHELF = [
  ["Section 377 verdict explained", "Section 377 verdict explained India"],
  ["Coming out stories, India", "coming out story India Hindi"],
  ["Indian parents of queer kids", "Indian parents accept gay son daughter"],
  ["Is sexual orientation genetic?", "is sexual orientation genetic science"],
  ["Trans lives in India", "transgender India documentary"],
  ["Queer TEDx talks India", "TEDx LGBTQ India"],
  ["Guided meditation for anxiety", "10 minute guided meditation anxiety"],
  ["Box breathing", "box breathing exercise guided"],
  ["Rain sounds for sleep", "rain sounds for sleep"],
  ["Mumbai and Delhi pride marches", "Mumbai pride march Delhi queer pride"]
];

// [title, year, region, format, blurb, tone]
export const FILMS = [
  ["Fire", "1996", "india", "film", "Deepa Mehta's story of two sisters-in-law who find love in each other. Once fiercely protested.", "heavy"],
  ["My Brother… Nikhil", "2005", "india", "film", "A swimmer diagnosed with HIV, his sister and his partner fight stigma together. Tender, and still timely.", "heavy"],
  ["Aligarh", "2015", "india", "film", "Manoj Bajpayee as Professor Siras, a real academic suspended after being filmed with a man. Quiet, and hard to watch.", "heavy"],
  ["Kapoor & Sons", "2016", "india", "film", "A messy, funny, loving family drama where one son's truth slowly comes to light.", "hopeful"],
  ["Ek Ladki Ko Dekha Toh Aisa Laga", "2019", "india", "film", "A Punjabi family comedy-drama about a daughter in love with a woman. Mainstream and warm.", "hopeful"],
  ["Super Deluxe", "2019", "india", "film", "Tamil anthology; Vijay Sethupathi plays a trans woman returning to her family. Bold, and moving.", "mixed"],
  ["Moothon", "2019", "india", "film", "Malayalam drama about a boy searching for his brother in Mumbai, and a hidden love.", "heavy"],
  ["Shubh Mangal Zyada Saavdhan", "2020", "india", "film", "Ayushmann Khurrana in a loud, joyful comedy about a gay couple versus a disapproving family.", "funny"],
  ["Sheer Qorma", "2021", "india", "short", "Short film with Shabana Azmi, Divya Dutta and Swara Bhasker about a mother learning to accept her daughter's partner.", "hopeful"],
  ["Chandigarh Kare Aashiqui", "2021", "india", "film", "A gym owner falls for a woman and learns she's trans. A mainstream romance that starts conversations.", "hopeful"],
  ["Badhaai Do", "2022", "india", "film", "A gay cop and a lesbian PE teacher enter a lavender marriage. Funny and honest.", "funny"],
  ["Kaathal – The Core", "2023", "india", "film", "Malayalam drama: Mammootty as a man running for local office whose wife files for divorce, revealing his hidden life. Quiet, and affecting.", "mixed"],
  ["Made in Heaven", "2019–23", "india", "series", "Wedding planners in Delhi, one of them a gay man dealing with family and the law.", "mixed"],
  ["Paris Is Burning", "1990", "global", "doc", "Documentary on New York's ball culture and the Black and Latino queer people who built it.", "mixed"],
  ["Happy Together", "1997", "global", "film", "Wong Kar-wai's aching love story of two men adrift in Buenos Aires.", "heavy"],
  ["Milk", "2008", "global", "film", "Sean Penn as Harvey Milk, one of the first openly gay elected officials in the US.", "mixed"],
  ["Pride", "2014", "global", "film", "Gay and lesbian activists support striking Welsh miners in 1984. Joyful and uplifting.", "hopeful"],
  ["Carol", "2015", "global", "film", "Two women fall in love in 1950s New York. Restrained and beautiful to look at.", "mixed"],
  ["Moonlight", "2016", "global", "film", "A boy grows into a man in Miami, searching for tenderness. Oscar for Best Picture.", "mixed"],
  ["Call Me by Your Name", "2017", "global", "film", "A summer romance in northern Italy, with one of cinema's kindest parental speeches.", "mixed"],
  ["Love, Simon", "2018", "global", "film", "A closeted teenager is blackmailed and finds his courage. Light and heartfelt.", "hopeful"],
  ["Pose", "2018–21", "global", "series", "Trans women of colour in 1980s New York ballroom culture. Fierce and warm, and it will break your heart.", "mixed"],
  ["Portrait of a Lady on Fire", "2019", "global", "film", "A painter and her subject fall in love in 18th-century France.", "mixed"],
  ["Disclosure", "2020", "global", "doc", "Trans actors and creators examine how Hollywood has portrayed trans people.", "mixed"],
  ["The Half of It", "2020", "global", "film", "A shy student ghostwrites love letters for a jock to the girl she likes herself.", "hopeful"],
  ["Young Royals", "2021–24", "global", "series", "A Swedish prince falls for a classmate at boarding school.", "mixed"],
  ["Heartstopper", "2022–24", "global", "series", "Two British schoolboys fall in love, slowly and kindly. Easy, comforting viewing.", "hopeful"],
  ["Fire Island", "2022", "global", "film", "A queer Pride and Prejudice set over a holiday week. Funny and sharp.", "funny"]
];

export const THERAPIES = [
  ["LGBTQ-affirmative therapy", "Strong consensus", "Therapy that treats your identity as valid rather than a problem, and helps with the stress of stigma, family conflict and hiding. Major professional bodies, including the American Psychological Association, recommend this approach.", "American Psychological Association practice guidelines for sexual minority clients.", "v"],
  ["Affirmative CBT", "Trial evidence", "Cognitive behavioural therapy adapted for minority stress: challenging internalised shame, building assertiveness, reducing avoidance. The ESTEEM programme reduced depression and alcohol use in gay and bisexual men.", "Pachankis et al., 2015, Journal of Consulting and Clinical Psychology.", "b"],
  ["Cognitive behavioural therapy", "Strong evidence", "One of the best-studied treatments for depression and anxiety. Teaches you to spot and reshape unhelpful thought patterns.", "Many meta-analyses and clinical guidelines.", "g"],
  ["Mindfulness and meditation", "Moderate evidence", "Paying attention to the present without judgement. A JAMA review found meditation programmes produced moderate improvements in anxiety and depression.", "Goyal et al., 2014, JAMA Internal Medicine.", "sky"],
  ["Peer support and community", "Strong evidence", "Connection with other queer people buffers minority stress. Support groups, college collectives and chosen family protect mental health.", "Meyer, 2003; Hatzenbuehler, 2011.", "pink"],
  ["Expressive writing", "Moderate evidence", "Writing about painful experiences for 15 to 20 minutes over several days can improve mood and even physical health. Try it below.", "Pennebaker, 1997, Psychological Science.", "o"],
  ["Music therapy", "Moderate evidence", "Listening, singing or making music with a therapist. Probably reduces depression and anxiety in the short term. Try the sound studio.", "Aalbers et al., 2017, Cochrane Review.", "y"],
  ["Physical activity", "Strong evidence", "Walking, dancing, yoga or sport. Regular movement reliably reduces depressive symptoms, sometimes as much as medication for mild depression.", "Multiple meta-analyses.", "g"],
  ["Art therapy", "Emerging evidence", "Drawing, painting or making things to express what words can't. Promising, though studies are smaller. Try light painting or the kaleidoscope in the arcade.", "Smaller trials and reviews.", "r"],
  ["Time in nature", "Emerging evidence", "Green spaces, sunlight and fresh air are linked to lower stress and better mood.", "Observational and experimental studies.", "g"]
];

export const PROMPTS = [
  "What do I wish someone had told me when I first realised who I am?",
  "Write a letter to your younger self.",
  "What does a safe place feel like to me?",
  "Who made me feel accepted, even briefly? What did they do?",
  "What am I carrying today that isn't mine to carry?",
  "If I didn't have to hide anything, what would tomorrow look like?",
  "What are three small things that brought me peace this week?",
  "Write about a moment you felt proud of yourself.",
  "What would I say to a friend going through what I'm going through?",
  "What do I need right now: rest, connection, or space?",
  "Describe the person you're becoming.",
  "What words do I want to stop saying to myself?"
];

export const SONGS = [
  ["True Colors", "Cyndi Lauper"], ["Born This Way", "Lady Gaga"], ["Same Love", "Macklemore & Ryan Lewis ft. Mary Lambert"],
  ["Rainbow", "Kacey Musgraves"], ["Beautiful", "Christina Aguilera"], ["Firework", "Katy Perry"], ["I'm Coming Out", "Diana Ross"],
  ["Proud", "Heather Small"], ["Fix You", "Coldplay"], ["Lean on Me", "Bill Withers"], ["Aashayein", "KK (Iqbal)"],
  ["Kun Faya Kun", "A.R. Rahman, Javed Ali, Mohit Chauhan"], ["Ilahi", "Arijit Singh"], ["Zinda", "Siddharth Mahadevan"]
];

export const MYTHS = [
  ["Myth", "\"It's a choice.\"", "Ask a straight person when they chose to be straight. Twin and genetic studies show biology plays a major role, and upbringing almost none. People can choose whether to hide their feelings. They can't choose whether they have them."],
  ["Myth", "\"It's a mental illness.\"", "WHO, the American Psychiatric Association and the Indian Psychiatric Society all reject this. Higher depression rates among queer people are linked to stigma and rejection, not orientation itself."],
  ["Myth", "\"It can be cured.\"", "There is nothing to cure. Change attempts don't work and are linked to higher suicide attempts. In India, doctors who practise conversion therapy face professional misconduct action."],
  ["Myth", "\"It's a Western import.\"", "The law against it was the import, brought by the British in 1861. India's epics, temples and hijra communities show diversity going back centuries."],
  ["Myth", "\"It's unnatural.\"", "Same-sex behaviour is recorded in hundreds of species and in every human society studied."],
  ["Myth", "\"Kids become gay from exposure.\"", "Shared family environment explained almost nothing in twin studies. Visibility helps queer kids feel safe; it doesn't create them."],
  ["Myth", "\"Bisexuals are just confused.\"", "Bisexuality is a stable orientation of its own. It isn't indecision."],
  ["Myth", "\"Being trans is a trend.\"", "Indian courts have recognised trans people since 2014, and hijra communities have existed for centuries. No one takes on that much discrimination as a fashion."],
  ["Myth", "\"Gay parents harm children.\"", "Studies of children raised by same-sex parents generally find they do as well as other children. What matters is a loving, stable home."],
  ["Myth", "\"It's just a phase.\"", "For some people identity evolves; for most, orientation is stable. Either way, the feelings are real and deserve respect."],
  ["Myth", "\"Queer people are a danger to children.\"", "Research finds no link between sexual orientation and child abuse. This myth has been used for decades to justify discrimination."],
  ["Question", "\"Why does it matter to me?\"", "Because someone you love is probably queer and hasn't felt safe telling you. How you talk about this now affects whether they ever will."]
];

export const LINES = [
  ["Tele-MANAS", "14416", "tel:14416", "Government of India. Free, 24/7, confidential, 20+ languages.", "r"],
  ["iCALL (TISS)", "9152987821", "tel:+919152987821", "Professional, LGBTQ+ affirming counselling. icallhelpline.org", "o"],
  ["Humsafar Trust · Umang", "9892940966", "tel:+919892940966", "Counselling, legal and community support, call or WhatsApp. Mon to Fri, 10am–8:30pm.", "y"],
  ["Naz Foundation helpline", "8800329176", "tel:+918800329176", "Free, confidential support for LGBTQ+ people.", "g"],
  ["Sahodari Foundation", "7639741916", "tel:+917639741916", "Trans-led organisation in Tamil Nadu.", "b"],
  ["Nazariya (Delhi)", "nazariya.qfrg@gmail.com", "mailto:nazariya.qfrg@gmail.com", "Queer feminist group for people assigned female at birth.", "v"],
  ["Sappho for Equality", "sapphokolkata.in", "https://www.sapphokolkata.in/contact-us", "Support for lesbian, bisexual and trans masculine people and families.", "pink"],
  ["More helplines", "findahelpline.com", "https://findahelpline.com/countries/in/topics/gender-sexual-identity", "Verified directory of LGBTQ-friendly lines across India.", "sky"]
];

export const QUOTES = [
  ["You don't have to become someone else to be worthy of love.", "A reminder"],
  ["Like the sea, you can be calm on top and deep underneath. Both are you.", "A thought for today"],
  ["I am large, I contain multitudes.", "Walt Whitman, Song of Myself (1855)"],
  ["The people who love you will want to know the real you.", "A thought for today"],
  ["Healing is not a straight line. Neither are you, and that's okay.", "A reminder"],
  ["Breathe in what you need. Breathe out what you don't.", "A breathing thought"],
  ["One day you'll tell your story, and it will help someone survive theirs.", "A thought for later"],
  ["Being yourself in a world that asks you to hide is a quiet kind of courage.", "A reminder"],
  ["You're not too much for the people who love you.", "A thought for today"],
  ["Storms pass. The sky was never the storm.", "A breathing thought"],
  ["Feeling lonely doesn't mean you're unlovable. It may only mean you haven't found your people yet.", "A thought for tonight"],
  ["Every closet has a door. You decide when, and if, to open it.", "A reminder"]
];

// Short version, shown on the About page.
export const ABOUT_BRIEF = [
  "My whole life turned around the day I realised I was different. I felt ashamed, because I thought it was wrong. Then I learned, and learned, and learned.",
  "But I was always afraid to tell anyone. Afraid enough that I would stop breathing, stop thinking, whenever something came close to revealing the truth about me.",
  "I came to college hoping I could finally open up. I found that people understanding was only an assumption. I heard it laughed at. I heard it called a trend. I heard it called a disease. It broke me, and I still did not give up on myself.",
  "When I began telling people, it went differently from what I expected. Those I was sure would never accept me supported me the most. Some of those I trusted most <em>pulled away.</em>",
  "It hurt. It also taught me to cherish the friends and family who refused to leave when things got hard. I give people endless chances because I see more good in them than the world tells me to. I'm not a saint. I have been wrong, and I was forgiven, and that is where I learned.",
  "I built this place for anyone who still believes it is a choice, if they are willing to read the evidence. And I built it for anyone who is struggling, or who is trying to love someone who is. You are welcome here. I carry no hate for anyone. I only ask that nobody hands hate to people for loving."
];

// Full version, shown on the Stories page.
export const STORY = {
  title: "The people who stayed",
  byline: "Told by Reiner Endrios, who built this site. Reiner is a pseudonym.",
  pull: "The people I was sure would never accept me supported me the most.",
  sections: [
    ["The day everything turned", [
      "My whole life turned around the day I realised I was different. It didn't happen slowly, the way growing up usually does. It happened all at once, like the floor tilting under me.",
      "And the first thing I felt wasn't wonder, or even relief. It was shame. Without anyone ever sitting me down and saying it, I had absorbed the idea that this was wrong. So I did what frightened people do. I hid it, even from myself, and I told myself it might pass."
    ]],
    ["Learning, and learning, and learning", [
      "It didn't pass. So I started reading. Quietly, late at night, with the screen dimmed, I read everything I could find about what it meant, where it came from, and what scientists and doctors had actually discovered.",
      "Page after page gave me the same answer: not an illness, not a choice, not a mistake. I learned, and learned, and learned, and slowly the shame loosened its grip.",
      "But knowing something in your head is not the same as being brave in your life. I was still terrified to tell anyone."
    ]],
    ["The fear", [
      "That kind of fear is hard to explain to someone who hasn't carried it. It lived in my body. It could be as small as a careless joke, a question that came a little too close, a conversation drifting toward the wrong subject. Anything that might touch the truth about me, and I would stop breathing.",
      "Sometimes I would stop thinking altogether, my mind going blank like a wall, until the moment passed and I could pretend I was fine. I became very good at pretending. It is exhausting in a way I didn't have words for."
    ]],
    ["College was not what I imagined", [
      "I thought college would be where I could finally open up. I pictured a place of big ideas and open minds, where people would understand. But that was only an assumption, and I learned the hard way that it isn't all beds of roses.",
      "I heard people make fun of it. I heard it called a trend, something people pick up for attention. I heard it called a disease. Every time it landed somewhere deep, because those words were about me, said casually by people who had no idea I was standing there. It broke me.",
      "But I didn't give up on myself. That is the thing I am proudest of."
    ]],
    ["Telling people", [
      "Then, for reasons I still can't fully explain, I started telling people. One at a time, carefully. And it went differently from everything I had predicted.",
      "The people I was sure would never accept me supported me the most. And some of the people I would have bet everything on, the ones I assumed would stand right beside me, kept their distance. Some treated it like a disease. Some treated it like a pressure placed on them, as if my truth were something that had happened to them.",
      "That hurt more than any stranger's mockery, because I had trusted them. It broke me a second time."
    ]],
    ["What it taught me", [
      "But it also showed me, very clearly, who was actually there. It made me cherish the friends and the family who refused to leave when things got hard, who stayed without needing to understand every part of it first.",
      "I don't always know what kind of person I am. But I know this: even if someone hurts me, I may go quiet and stop talking, and I will still be there for them whenever and wherever they need me, if my life lets me.",
      "Your surroundings matter, because in the end the people are all that matter. Everyone will end up doing something with their life. It's the people who make it worth it. That is why I give people endless chances. I want to keep them in my life, because I see more good in people than not.",
      "That's just me. If you think I'm trying to be a saint, I'm not. I have been wrong too. My friends and my family forgave me, and that is exactly where I learned."
    ]],
    ["The lonely stretches", [
      "There were times I was completely alone. In those times, looking at photographs of the people I love gave me strength, even though none of them were in the room.",
      "And there were people who never said anything cruel to me, who just didn't understand, and still don't. Some of them call it a choice. Some say it isn't natural. As if anyone would choose the harder road, the fear and the hiding and the explaining, just for fun."
    ]],
    ["Why this website exists", [
      "For them, if they're willing, I made sections of this website carefully researched and documented. If you are about to say it is a choice, a trend or a disease, I'm not asking you to take my word for it. Read the <a href=\"../science/\">science page</a>. Open the <a href=\"../library/\">research library</a> and follow the links to the original studies. See what the evidence says, and let it widen your thinking.",
      "And if you are someone whose mind is already made up and no evidence will move it, I won't fight you. I wish you a good life, and I carry no hate for you. I only ask that you don't give hate to people for loving. It really is hurtful, and the bullying and harassment we already face is enough."
    ]],
    ["If you are the one who is struggling", [
      "If you are struggling, if you want to be understood, or if you want to help a friend who has just come out, or who came out quietly and hasn't told anyone, or you're in some other situation I haven't named, please help yourself to everything here.",
      "The <a href=\"../help/\">help page</a> has helplines and guides for exactly these moments. The <a href=\"../therapies/\">therapies</a>, <a href=\"../sound/\">sound studio</a> and <a href=\"../games/\">calm arcade</a> are there for when your head is too loud. And if you want to share your own story, or just send a message to someone who will read it with care, the <a href=\"../connect/\">connect page</a> is open and anonymous.",
      "You don't have to be brave all at once. I wasn't."
    ]]
  ]
};


export const SOURCES = [
  ["Violence, data and silence", [
    ["ThePrint: NCRB stopped collecting hate crime data", "https://theprint.in/india/governance/ncrb-stopped-collecting-data-on-lynching-hate-crime-as-it-was-unreliable-govt-tells-ls/785201/"],
    ["CJP: removal of honour killing and communal violence categories from NCRB data", "https://cjp.org.in/the-myth-of-neutral-data-the-disappearance-of-communal-violence-in-ncrb-data/"],
    ["Indian Journal of Psychiatry: LGBTQIA+ suicide data scarcity", "https://pmc.ncbi.nlm.nih.gov/articles/PMC13395226/"],
    ["The Leaflet: NCRB transgender crime data", "https://theleaflet.in/criminal-justice/if-only-transgender-lives-were-as-rosy-as-depicted-in-ncrb-data"],
    ["Dialogues in Health: Indian news reporting on LGBTQ+ suicides (2025 review)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC12311544"]
  ]],
  ["Law and policy", [
    ["The Leaflet: NMC on conversion therapy", "https://theleaflet.in/national-medical-commission-declares-conversion-therapy-as-professional-misconduct-but-it-is-not-enough/"],
    ["Indian Psychiatric Society statement (Orinam)", "https://orinam.net/indian-psychiatric-society-homosexual-not-mental-illness"],
    ["Transgender Persons (Protection of Rights) Amendment Act, 2026", "https://en.wikipedia.org/wiki/Transgender_Persons_(Protection_of_Rights)_Amendment_Act,_2026"],
    ["PRS India: Transgender Bill 2026 text", "https://prsindia.org/files/bills_acts/bills_parliament/2026/Transgender_Bill_2026_Text.pdf"]
  ]],
  ["Surveys and attitudes", [
    ["Pew Research Center: The global divide on homosexuality persists (2020)", "https://www.pewresearch.org/global/2020/06/25/global-divide-on-homosexuality-persists/"]
  ]],
  ["Help directories", [
    ["Find A Helpline: India", "https://findahelpline.com/countries/in/topics/gender-sexual-identity"],
    ["Homegrown: queer and trans support helplines in India", "https://homegrown.co.in/homegrown-voices/7-queer-trans-support-helplines-in-india-you-can-reach-out-to-right-now"]
  ]],
  ...allSources()
];
