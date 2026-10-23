// Hinglish helpers for the two chain games: Hindi typed in Roman letters, the way people text it.
// Spellings vary (pyar, pyaar), and a Roman "t" can be त or ट, so nothing is matched letter by letter. Every word is reduced
// to a short run of SOUND CLASSES, and the chain only ever compares classes: the sound a line starts with, and the sound it
// ends on. Hindi typed in Devanagari is reduced to the same classes, so both scripts work side by side.

// class -> [Devanagari letters it covers, how to write it in Roman]
export const CLASSES = {
  k: ["क", "k"], kh: ["ख", "kh"], g: ["ग", "g"], gh: ["घ", "gh"], ch: ["च", "ch"], chh: ["छ", "chh"], j: ["ज", "j"], jh: ["झ", "jh"],
  t: ["त ट", "t"], th: ["थ ठ", "th"], d: ["द ड", "d"], dh: ["ध ढ", "dh"], n: ["न", "n"], p: ["प", "p"], ph: ["फ", "ph"], b: ["ब", "b"],
  bh: ["भ", "bh"], m: ["म", "m"], y: ["य", "y"], r: ["र", "r"], l: ["ल", "l"], v: ["व", "v"], sh: ["श ष", "sh"], s: ["स", "s"], h: ["ह", "h"],
  a: ["अ आ", "a"], i: ["इ ई", "i"], u: ["उ ऊ", "u"], e: ["ए ऐ", "e"], o: ["ओ औ", "o"]
};
const VOWEL_CLASS = new Set(["a", "i", "u", "e", "o"]);
// sounds so uncommon at the end of a line that the next singer may also use the sound before them
const RARE = new Set(["gh", "jh", "chh", "kh", "ph", "th", "dh"]);

const strip = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---- Roman letters to units: { c: class, v: vowel?, m: a vowel that follows a consonant (a matra) } ---- */
const DI3 = { chh: "chh", ksh: "k" };
const DI2 = { kh: "kh", gh: "gh", ch: "ch", jh: "jh", th: "th", dh: "dh", ph: "ph", bh: "bh", sh: "sh" };
const ONE = { b: "b", d: "d", f: "ph", g: "g", h: "h", j: "j", k: "k", l: "l", m: "m", n: "n", p: "p", q: "k", r: "r", s: "s", t: "t", v: "v", w: "v", x: "k", y: "y", z: "j", c: "k" };
function vowelClass(run) {
  const a = run[0], b = run[1] || "";
  if (a === "a") return b === "i" || b === "e" ? "e" : b === "u" ? "o" : "a";
  if (a === "e") return b === "e" ? "i" : "e";
  if (a === "i") return "i";
  if (a === "o") return b === "o" ? "u" : b === "u" ? "u" : "o";
  return "u";
}
function romanUnits(word) {
  const w = strip(word).toLowerCase().replace(/[^a-z]/g, "").replace(/([b-dfgj-np-tv-z])\1+/g, "$1");
  const out = []; let i = 0;
  while (i < w.length) {
    const ch = w[i];
    if ("aeiou".includes(ch)) { let j = i; while (j < w.length && "aeiou".includes(w[j])) j++; const run = w.slice(i, j); out.push({ c: vowelClass(run), v: true, m: out.length > 0 && !out[out.length - 1].v, run }); i = j; continue; }
    const t3 = w.slice(i, i + 3), t2 = w.slice(i, i + 2);
    if (DI3[t3]) { out.push({ c: DI3[t3], v: false }); i += 3; continue; }
    if (t2 === "ch" && w[i + 2] === "h") { out.push({ c: "chh", v: false }); i += 3; continue; }
    if (DI2[t2]) { out.push({ c: DI2[t2], v: false }); i += 2; continue; }
    out.push({ c: ONE[ch] || "k", v: false }); i++;
  }
  return out;
}

/* ---- Devanagari to the same units ---- */
const DEV_CONS = { "क": "k", "क़": "k", "ख": "kh", "ख़": "kh", "ग": "g", "ग़": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "ज़": "j", "झ": "jh", "ञ": "n", "ट": "t", "ठ": "th", "ड": "d", "ड़": "d", "ढ": "dh", "ढ़": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n", "प": "p", "फ": "ph", "फ़": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h" };
const DEV_NUKTA = { "क़": "k", "ख़": "kh", "ग़": "g", "ज़": "j", "ड़": "d", "ढ़": "dh", "फ़": "ph", "य़": "y" };
const DEV_IND = { "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ए": "e", "ऐ": "e", "ओ": "o", "औ": "o", "ऑ": "o", "ऍ": "e" };
const DEV_MATRA = { "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "े": "e", "ै": "e", "ो": "o", "ौ": "o", "ॉ": "o", "ॅ": "e" };
function devUnits(word) {
  const out = [];
  for (const ch of String(word || "").normalize("NFC")) {
    if (DEV_NUKTA[ch]) out.push({ c: DEV_NUKTA[ch], v: false });
    else if (DEV_CONS[ch]) out.push({ c: DEV_CONS[ch], v: false });
    else if (DEV_IND[ch]) out.push({ c: DEV_IND[ch], v: true, m: false });
    else if (DEV_MATRA[ch]) out.push({ c: DEV_MATRA[ch], v: true, m: true });
  }
  return out;
}
const hasDev = (s) => /[ऀ-ॿ]/.test(s);
const unitsOf = (word) => (hasDev(word) ? devUnits(word) : romanUnits(word));
export const wordsOf = (line) => String(line || "").trim().split(/[\s,;|/।]+/).filter((w) => /[\p{L}]/u.test(w));

/* ---- the first sound of a line, and the sounds the next line may start with ---- */
export function startClass(line) {
  for (const w of wordsOf(line)) { const u = unitsOf(w); if (u.length) return u[0].c; }
  return "";
}
// A list: the main sound first. A line normally ends on its last consonant (the matra is ignored). A Roman word ending in n
// after a vowel is often a nasal (main, hain, nahin), so the consonant before the vowel counts as well. A very rare sound
// also lets the next singer use the one before it.
export function endClasses(line) {
  const ws = wordsOf(line); if (!ws.length) return [];
  const u = unitsOf(ws[ws.length - 1]); if (!u.length) return [];
  const roman = !hasDev(ws[ws.length - 1]);
  const body = u.slice(); let last = body[body.length - 1], main;
  if (last.v && last.m && body.length > 1) { body.pop(); last = body[body.length - 1]; }
  main = last.c;
  // a word made only of vowels (aao) ends on its last vowel
  if (last.v && !last.m && last.run) main = { a: "a", e: "e", i: "i", o: "o", u: "u" }[last.run[last.run.length - 1]] || main;
  const out = [main];
  const idx = body.length - 1;
  if (roman && main === "n" && idx >= 2 && body[idx - 1].v) { const prev = body[idx - 2]; if (!prev.v) out.push(prev.c); }
  if (RARE.has(main) && idx >= 1) { let k = idx - 1; if (body[k].v && k >= 1) k--; const alt = body[k]; if (alt && !alt.v) out.push(alt.c); }
  return [...new Set(out)];
}
export const classLabel = (c) => (CLASSES[c] ? CLASSES[c][1] : c);
export const classDev = (c) => (CLASSES[c] ? CLASSES[c][0] : "");
export const isVowelClass = (c) => VOWEL_CLASS.has(c);

/* ---- one spelling-proof key per word or line, for repeats and for matching song and word lists ---- */
export function canon(text) {
  return wordsOf(text).map((w) => unitsOf(w).map((x) => (x.v ? x.c.toUpperCase() : x.c)).join("")).join(" ");
}
// the same, with the vowels removed: catches "pyar" sung again as "pyaar" or "piyar"
export function skeleton(text) { return wordsOf(text).map((w) => unitsOf(w).filter((x) => !x.v).map((x) => x.c).join("")).join(" "); }
