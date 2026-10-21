#!/usr/bin/env node
// Builds assets/data/atlas.json for the Atlas game from GeoNames dumps (CC BY 4.0, geonames.org).
// Usage: node tools/build-atlas.mjs <folder with cities15000.txt, admin1CodesASCII.txt, admin2Codes.txt, countryInfo.txt>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2];
if (!dir) { console.error("Give the folder that holds the GeoNames files."); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lines = (f) => readFileSync(join(dir, f), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t"));

const countries = {}; // ISO -> name
for (const r of lines("countryInfo.txt")) countries[r[0]] = r[4];
const fixCountry = { "Czechia": "Czech Republic", "Myanmar [Burma]": "Myanmar", "Republic of the Congo": "Republic of the Congo", "Macedonia": "North Macedonia", "Swaziland": "Eswatini", "Timor Leste": "Timor-Leste" };
Object.keys(countries).forEach((k) => { countries[k] = fixCountry[countries[k]] || countries[k]; });

const admin1 = {}; for (const r of lines("admin1CodesASCII.txt")) admin1[r[0]] = r[1];
const INDIA_FIX = { "Andaman and Nicobar": "Andaman and Nicobar Islands", "Delhi": "Delhi" };
const stateName = (code) => { const n = admin1["IN." + code]; return INDIA_FIX[n] || n; };

const regions = [], rix = new Map();
const R = (n) => { if (!rix.has(n)) { rix.set(n, regions.length); regions.push(n); } return rix.get(n); };

const out = { r: regions, c: [], s: [], d: [], t: [], w: [], x: [], a: [] };
const seen = new Set(); const add = (list, key, row) => { if (seen.has(key)) return; seen.add(key); out[list].push(row); };

// countries
for (const [iso, n] of Object.entries(countries)) add("c", "c|" + n, n);
["USA", "UK", "UAE", "United States of America", "United Kingdom of Great Britain", "Burma", "Ivory Coast", "East Timor", "Czechia", "Holland"].forEach((n) => add("c", "c|" + n, n));

// states and provinces of the world (India's are the states and union territories)
const SUF = / (Province|State|Region|Oblast|Prefecture|Governorate|Department|Territory|Republic|Autonomous Region|Autonomous Province)$/;
for (const [code, name] of Object.entries(admin1)) {
  const iso = code.split(".")[0], country = countries[iso]; if (!country) continue;
  let n = iso === "IN" ? stateName(code.split(".")[1]) : name;
  if (/\d/.test(n)) continue;
  const reg = R(country);
  add("s", `s|${n}|${country}`, [n, reg]);
  const short = n.replace(SUF, ""); if (short !== n && short.length > 2) add("s", `s|${short}|${country}`, [short, reg, 1]);
}
// India: districts
for (const r of lines("admin2Codes.txt")) {
  if (!r[0].startsWith("IN.")) continue;
  const state = stateName(r[0].split(".")[1]); if (!state) continue;
  const n = r[1].replace(/^District /, "").replace(/ District$/, "").trim(); if (!n || /\d/.test(n)) continue;
  add("d", `d|${n}|${state}`, [n, R(state)]);
}
// cities and towns: all of India above 15,000, capitals anywhere, and the rest of the world above 100,000
let cityCount = 0;
for (const c of lines("cities15000.txt")) {
  const [, name, ascii, , , , , fcode, iso, , a1, , , , pop] = c, population = +pop || 0;
  const country = countries[iso]; if (!country) continue;
  const india = iso === "IN";
  if (!india && population < 100000 && fcode !== "PPLC") continue;
  const region = india ? stateName(a1) : country; if (!region) continue;
  const nm = ascii || name; if (/\d/.test(nm)) continue;
  const bucket = Math.min(9, Math.max(1, Math.floor(Math.log10(Math.max(population, 1000)) - 2))); // 1..9 by size
  add("t", `t|${nm}|${region}`, [nm, R(region), bucket]); cityCount++;
}
// aliases that people still use (stored as extra entries; the game never picks these itself)
const CITY_ALIAS = [["Bombay", "Mumbai"], ["Calcutta", "Kolkata"], ["Madras", "Chennai"], ["Bangalore", "Bengaluru"], ["Poona", "Pune"], ["Cochin", "Kochi"], ["Trivandrum", "Thiruvananthapuram"], ["Baroda", "Vadodara"], ["Benares", "Varanasi"], ["Banaras", "Varanasi"], ["Allahabad", "Prayagraj"], ["Gurgaon", "Gurugram"], ["Pondicherry", "Puducherry"], ["Mysore", "Mysuru"], ["Vizag", "Visakhapatnam"], ["Mangalore", "Mangaluru"], ["Belgaum", "Belagavi"], ["Hubli", "Hubballi"], ["Simla", "Shimla"], ["New Delhi", "Delhi"], ["Peking", "Beijing"], ["Saigon", "Ho Chi Minh City"], ["Rangoon", "Yangon"], ["Bombay", "Mumbai"]];
const tByName = new Map(); out.t.forEach((row) => { const k = row[0].toLowerCase(); if (!tByName.has(k)) tByName.set(k, row); });
for (const [al, canon] of CITY_ALIAS) { const row = tByName.get(canon.toLowerCase()); if (row) add("t", `t|${al}|${regions[row[1]]}`, [al, row[1], 0]); }
const STATE_ALIAS = [["Orissa", "Odisha"], ["Uttaranchal", "Uttarakhand"], ["Pondicherry", "Puducherry"], ["Jammu & Kashmir", "Jammu and Kashmir"], ["Andaman & Nicobar", "Andaman and Nicobar Islands"], ["NCT of Delhi", "Delhi"], ["New Delhi", "Delhi"], ["Daman and Diu", "Dadra and Nagar Haveli and Daman and Diu"], ["Dadra and Nagar Haveli", "Dadra and Nagar Haveli and Daman and Diu"]];
out.a = STATE_ALIAS; // [alias, canonical] for the "which state or country" answer
out.ca = [["US", "United States"], ["USA", "United States"], ["United States of America", "United States"], ["UK", "United Kingdom"], ["Great Britain", "United Kingdom"], ["England", "United Kingdom"], ["Scotland", "United Kingdom"], ["Wales", "United Kingdom"], ["UAE", "United Arab Emirates"], ["Burma", "Myanmar"], ["Holland", "Netherlands"], ["Russia", "Russia"], ["Korea", "South Korea"], ["Ivory Coast", "Ivory Coast"], ["Czechia", "Czech Republic"], ["Congo", "Democratic Republic of the Congo"]];

// oceans, seas, gulfs and deserts (no region needed)
const WATER = ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Southern Ocean", "Arabian Sea", "Bay of Bengal", "Red Sea", "Black Sea", "Caspian Sea", "Mediterranean Sea", "Baltic Sea", "North Sea", "Caribbean Sea", "South China Sea", "East China Sea", "Sea of Japan", "Yellow Sea", "Coral Sea", "Tasman Sea", "Dead Sea", "Aral Sea", "Andaman Sea", "Laccadive Sea", "Sargasso Sea", "Barents Sea", "Bering Sea", "Philippine Sea", "Adriatic Sea", "Aegean Sea", "Ionian Sea", "Tyrrhenian Sea", "Persian Gulf", "Gulf of Mexico", "Gulf of Aden", "Gulf of Oman", "Gulf of Mannar", "Gulf of Kutch", "Gulf of Khambhat", "Palk Strait", "Hudson Bay", "Labrador Sea", "Sea of Okhotsk", "Timor Sea", "Arafura Sea", "Celebes Sea", "Java Sea", "Banda Sea", "Weddell Sea", "Ross Sea", "Beaufort Sea", "Norwegian Sea", "Irish Sea", "White Sea", "Sea of Marmara", "Pacific", "Atlantic", "Arabian", "Bengal Bay"];
const DESERT = ["Sahara", "Gobi", "Thar", "Kalahari", "Namib", "Atacama", "Mojave", "Sonoran", "Arabian Desert", "Syrian Desert", "Great Victoria Desert", "Great Sandy Desert", "Gibson Desert", "Simpson Desert", "Tanami", "Taklamakan", "Karakum", "Kyzylkum", "Negev", "Sinai", "Patagonian Desert", "Chihuahuan Desert", "Great Basin Desert", "Rub al Khali", "Empty Quarter", "Nubian Desert", "Libyan Desert", "Danakil Desert", "Ordos Desert", "Dasht-e Kavir", "Dasht-e Lut", "Cholistan Desert", "Registan", "Colorado Desert", "Painted Desert", "Antarctic Desert", "Karoo", "Atacama Desert", "Sahara Desert", "Thar Desert", "Gobi Desert", "Kalahari Desert", "Namib Desert", "Mojave Desert", "Sonoran Desert", "Sechura Desert", "Judean Desert", "Western Desert", "Eastern Desert", "Black Rock Desert", "Lut Desert", "Kavir Desert", "Betpak-Dala", "Tabernas Desert", "Wahiba Sands", "Rann of Kutch", "Ladakh Cold Desert", "Spiti Cold Desert"];
WATER.forEach((n) => add("w", "w|" + n, n)); DESERT.forEach((n) => add("x", "x|" + n, n));

writeFileSync(join(root, "assets/data/atlas.json"), JSON.stringify(out));
const size = Buffer.byteLength(JSON.stringify(out));
console.log({ countries: out.c.length, states: out.s.length, districts: out.d.length, cities: out.t.length, water: out.w.length, deserts: out.x.length, regions: regions.length, KB: Math.round(size / 1024) });
