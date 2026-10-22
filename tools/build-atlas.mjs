#!/usr/bin/env node
// Builds assets/data/atlas.json for the Atlas game from GeoNames dumps (CC BY 4.0, geonames.org).
// Usage: node tools/build-atlas.mjs <folder with cities5000.txt, admin1CodesASCII.txt, admin2Codes.txt, countryInfo.txt> [folder with Natural Earth geojson]
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2], neDir = process.argv[3];
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

const out = { r: regions, c: [], s: [], d: [], t: [], w: [], x: [], k: [], f: [], a: [] };
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
// cities and towns: every place with 5,000 people or more, anywhere, plus every capital
let cityCount = 0;
for (const c of lines("cities5000.txt")) {
  const [, name, ascii, , , , , fcode, iso, , a1, , , , pop] = c, population = +pop || 0;
  const country = countries[iso]; if (!country) continue;
  const india = iso === "IN";
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

// continents, and natural features from Natural Earth (public domain): seas, gulfs, straits, lakes, rivers, mountains, islands
["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America", "Oceania", "Australasia", "Eurasia", "Arctic", "Antarctic"].forEach((n) => add("k", "k|" + n, n));
["Ganga", "Ganges", "Yamuna", "Godavari", "Krishna", "Kaveri", "Cauvery", "Narmada", "Tapti", "Mahanadi", "Brahmaputra", "Indus", "Sutlej", "Beas", "Ravi", "Chenab", "Jhelum", "Hooghly", "Sabarmati", "Chambal", "Gomti", "Ghaghara", "Kosi", "Tungabhadra", "Periyar", "Himalayas", "Western Ghats", "Eastern Ghats", "Deccan Plateau", "Aravalli", "Vindhya", "Satpura", "Nilgiri", "Karakoram", "Mount Everest", "Everest", "Kanchenjunga", "K2", "Nanda Devi", "Dal Lake", "Chilika Lake", "Wular Lake", "Vembanad Lake", "Sundarbans", "Rann of Kutch", "Lakshadweep Sea", "Palk Strait", "Gulf of Khambhat", "Gulf of Kutch", "Gulf of Mannar", "Bay of Bengal", "Arabian Sea", "Andaman Sea", "Laccadive Sea", "Brahmaputra Valley", "Gangetic Plain", "Malabar Coast", "Coromandel Coast", "Konkan"].forEach((n) => add("f", "f|" + n, n));
if (neDir) {
  const ABBR = [[/\bI\.$/, "Island"], [/\bIs\.$/, "Islands"], [/\bMts\.?$/, "Mountains"], [/\bMt\.? /, "Mount "], [/\bR\.$/, "River"], [/\bL\.$/, "Lake"], [/\bPen\.$/, "Peninsula"], [/\bB\.$/, "Bay"], [/\bG\.$/, "Gulf"], [/\bC\. /, "Cape "], [/\bPt\.? /, "Point "], [/\bSt\. /, "Saint "]];
  const clean = (n) => { if (!n) return ""; n = String(n).trim(); ABBR.forEach(([re, to]) => { n = n.replace(re, to); }); if (n === n.toUpperCase() && n.length > 3) n = n.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()); return n.replace(/\s+/g, " "); };
  const read = (f) => { try { return JSON.parse(readFileSync(join(neDir, f + ".geojson"), "utf8")).features.map((x) => x.properties); } catch (e) { return []; } };
  const WAT = new Set(["ocean", "sea", "bay", "gulf", "strait", "channel", "sound", "fjord", "lagoon", "inlet", "reef"]);
  read("ne_10m_geography_marine_polys").forEach((p) => { const c = (p.featurecla || p.FEATURECLA || "").toLowerCase(), n = clean(p.name ?? p.NAME); if (WAT.has(c) && n) add("w", "w|" + n, n); });
  const FEAT = new Set(["Island", "Island group", "Range/mtn", "Pen/cape", "Plateau", "Plain", "Delta", "Basin", "Valley", "Peninsula", "Isthmus", "Coast", "Gorge", "Tundra", "Wetlands", "Lowland", "Foothills", "Depression", "Geoarea"]);
  read("ne_10m_geography_regions_polys").forEach((p) => { const c = p.featurecla || p.FEATURECLA, n = clean(p.name ?? p.NAME); if (!n) return; if (c === "Desert") add("x", "x|" + n, n); else if (c === "Continent") add("k", "k|" + n, n); else if (FEAT.has(c)) add("f", "f|" + n, n); });
  ["ne_10m_rivers_lake_centerlines", "ne_10m_lakes", "ne_10m_geography_regions_points", "ne_10m_geography_regions_elevation_points"].forEach((f) => read(f).forEach((p) => { const n = clean(p.name ?? p.NAME); if (n && n.length > 2) add("f", "f|" + n, n); }));
}

// well-known names that sources spell differently, and "X Strait" / "Strait of X" style variants
["Amazon", "Amazon River", "Yangtze", "Yellow River", "Mississippi", "Mississippi River", "Missouri River", "Congo River", "Volga", "Danube", "Rhine", "Thames", "Seine", "Mekong", "Zambezi", "Niger River", "Murray River", "Colorado River", "Rio Grande", "Hudson River", "St. Lawrence River", "Saint Lawrence River", "Euphrates", "Tigris", "Jordan River", "Orinoco", "Parana", "Lena", "Ob", "Yenisei", "Irtysh", "Amur", "Ural River", "Dnieper", "Don River", "Elbe", "Loire", "Rhone", "Tiber", "Po River", "Ebro", "Tagus", "Shannon", "Limpopo", "Orange River", "Okavango", "Irrawaddy", "Salween", "Chao Phraya", "Pearl River", "Han River", "Tokyo Bay", "Mount Kailash", "Kailash", "Kilimanjaro", "Mount Kilimanjaro", "Mont Blanc", "Matterhorn", "Mount Fuji", "Fuji", "Denali", "Aconcagua", "Elbrus", "Mount Elbrus", "Annapurna", "Makalu", "Lhotse", "Nanga Parbat", "Mount Kenya", "Mount Vesuvius", "Vesuvius", "Etna", "Mount Etna", "Mount Olympus", "Olympus", "Great Barrier Reef", "Great Rift Valley", "Rift Valley", "Sahel", "Serengeti", "Patagonia", "Siberia", "Steppe", "Tundra", "Taiga", "Savanna", "Amazon Rainforest", "Congo Basin", "Gulf Stream", "Cape of Good Hope", "Cape Horn", "Cape Comorin", "Kanyakumari", "Strait of Hormuz", "Strait of Malacca", "Strait of Gibraltar", "Bosphorus", "Dardanelles", "Suez Canal", "Panama Canal", "English Channel", "Bering Strait", "Persian Gulf", "Gulf of Aden", "Gulf of Mexico", "Gulf of Oman", "Gulf of Thailand", "Hudson Bay", "Bay of Biscay", "Adriatic Sea", "Aegean Sea", "Ionian Sea", "Tyrrhenian Sea", "Sea of Japan", "Sea of Okhotsk", "Yellow Sea", "East China Sea", "Java Sea", "Banda Sea", "Coral Sea", "Timor Sea", "Arafura Sea", "Weddell Sea", "Ross Sea", "Barents Sea", "Kara Sea", "Laptev Sea", "Norwegian Sea", "Sargasso Sea", "Dead Sea", "Sea of Galilee", "Lake Baikal", "Baikal", "Lake Tanganyika", "Lake Malawi", "Lake Titicaca", "Lake Superior", "Lake Michigan", "Lake Huron", "Lake Erie", "Lake Ontario", "Lake Geneva", "Lake Como", "Lake Garda", "Loch Ness", "Niagara Falls", "Victoria Falls", "Angel Falls", "Iguazu Falls", "Hawaii", "Maldives", "Seychelles", "Mauritius", "Bali", "Java", "Sumatra", "Borneo", "Sulawesi", "Honshu", "Hokkaido", "Sicily", "Sardinia", "Corsica", "Crete", "Cyprus", "Malta", "Iceland", "Tasmania", "Zanzibar", "Greenland", "Andaman Islands", "Nicobar Islands", "Lakshadweep Islands", "Majuli", "Elephanta"].forEach((n) => add("f", "f|" + n, n));
const VAR = [[/^(.+) (Strait|Sea|Gulf|Bay|Channel|Sound|Ocean)$/, (m) => `${m[2]} of ${m[1]}`], [/^(Strait|Sea|Gulf|Bay|Channel|Sound|Lake|Mount|Cape|Isle|Island) of (.+)$/, (m) => `${m[2]} ${m[1]}`], [/^Lake (.+)$/, (m) => `${m[1]} Lake`], [/^(.+) Lake$/, (m) => `Lake ${m[1]}`], [/^Mount (.+)$/, (m) => `Mt ${m[1]}`], [/^(.+) River$/, (m) => m[1]], [/^(.+) Islands$/, (m) => `${m[1]} Island`]];
for (const list of ["w", "f", "x"]) for (const row of out[list].slice()) { const n = typeof row === "string" ? row : row[0]; for (const [re, mk] of VAR) { const m = re.exec(n); if (m) { const v = mk(m); if (v && v.length > 2) add(list, list + "|" + v, v); } } }

writeFileSync(join(root, "assets/data/atlas.json"), JSON.stringify(out));
const size = Buffer.byteLength(JSON.stringify(out));
console.log({ countries: out.c.length, states: out.s.length, districts: out.d.length, cities: out.t.length, water: out.w.length, deserts: out.x.length, continents: out.k.length, features: out.f.length, regions: regions.length, KB: Math.round(size / 1024) });
