// One small animated illustration per game, drawn as inline SVG at build time.
// Motion is plain CSS (transform and opacity only) so it stays cheap on phones.
// The keyframes live in assets/css/site.css under ".ga"; cards that are off screen are paused.

const K = "#0e0e10", W = "#fff";
const P = { pink: "#ff6f91", orange: "#ff9f43", yellow: "#ffd23f", green: "#3ec9a7", blue: "#4d96ff", violet: "#8b6cf0" };
const PL = Object.values(P);

// animated element: class list, delay and duration become CSS variables
const a = (cls, d = 0, t) => `class="g-a ${cls.split(" ").map((c) => "g-" + c).join(" ")}" style="--d:${d}s${t ? `;--t:${t}s` : ""}"`;
const circ = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const rect = (x, y, w, h, fill, r = 3, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const txt = (x, y, s, size = 14, fill = K, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" font-weight="650" text-anchor="middle" dominant-baseline="central" fill="${fill}" ${extra}>${s}</text>`;
const grid = (cols, rows, x0, y0, step, fn) => Array.from({ length: cols * rows }, (_, i) => fn(i % cols, Math.floor(i / cols), i, x0 + (i % cols) * step, y0 + Math.floor(i / cols) * step)).join("");

const ART = {
  breathe: () => `${circ(100, 45, 42, W, `fill-opacity=".28" ${a("br", 0, 6)}`)}${circ(100, 45, 29, W, `fill-opacity=".5" ${a("br", 0.25, 6)}`)}${circ(100, 45, 15, K, `fill-opacity=".85" ${a("br", 0.5, 6)}`)}`,

  lantern: () => [[28, -0.5, 5], [66, -3, 6.5], [108, -1.6, 5.5], [150, -4.4, 7], [180, -2.6, 6]].map(([x, d, t], i) => `<g ${a("ri", d, t)}>${circ(x, 62, 15, P.yellow, 'fill-opacity=".45"')}${rect(x - 7, 52, 14, 18, P.orange, 3)}${rect(x - 5, 49, 10, 3, K, 1.5, 'fill-opacity=".8"')}${rect(x - 5, 70, 10, 3, K, 1.5, 'fill-opacity=".8"')}</g>`).join(""),

  chimes: () => `<line x1="30" y1="10" x2="170" y2="10" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` + [[48, 44], [74, 58], [100, 36], [126, 62], [152, 50]].map(([x, h], i) => `<g ${a("sw o-t", i * 0.5, 4 + (i % 3) * 0.6)}><line x1="${x}" y1="10" x2="${x}" y2="${22}" stroke="${K}" stroke-width="1.2"/>${rect(x - 5, 22, 10, h, [P.violet, P.blue, P.green, P.pink, P.orange][i], 5)}${rect(x - 2, 26, 2.5, h - 8, W, 1.2, 'fill-opacity=".5"')}</g>`).join(""),

  aurora: () => [[28, P.green, 0.6, 0], [46, P.blue, 0.5, 1.4], [62, P.violet, 0.5, 2.8]].map(([y, c, o, d], i) => `<path ${a("dr", d, 9 + i)} d="M-40 ${y} C 0 ${y - 22}, 40 ${y + 22}, 80 ${y} S 160 ${y - 22}, 200 ${y} S 280 ${y + 22}, 320 ${y} V 86 H-40 Z" fill="${c}" fill-opacity="${o * 0.55}"/>`).join("") + grid(8, 1, 14, 0, 1, (_, __, i) => circ(14 + i * 25 + (i % 2) * 7, 10 + (i * 13) % 34, 1.5, W, a("bl", i * 0.35, 2.4))),

  snake: () => grid(9, 4, 12, 10, 22, (_, __, i, x, y) => circ(x, y, 1.4, K, 'fill-opacity=".18"')) + `<path d="M20 70 H70 V30 H130 V62 H170" fill="none" stroke="${K}" stroke-opacity=".12" stroke-width="2" stroke-dasharray="2 6"/><path ${a("sn", 0, 5)} d="M20 70 H70 V30 H130 V62 H170" fill="none" stroke="${K}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="52 400" pathLength="400"/>` + circ(170, 62, 7, P.yellow, a("pu", 0, 1.6)) + circ(170, 62, 3.4, W),

  four: () => rect(34, 6, 132, 78, K, 8, 'fill-opacity=".86"') + grid(7, 4, 49, 22, 17, (c, r, i, x, y) => circ(x, y, 6.2, [1, 9, 10, 16, 17, 22, 23, 24, 25, 26].includes(i) ? (i % 2 ? P.yellow : P.pink) : W, [1, 9, 10, 16, 17, 22, 23, 24, 25, 26].includes(i) ? "" : 'fill-opacity=".9"')) + `<g ${a("dp", 0, 3.2)}>${circ(83, 6, 6.2, P.pink)}</g>`,

  bubbles: () => [[26, 62, 11, -0.4, 6], [58, 70, 7, -2.6, 4.6], [92, 66, 15, -1.2, 7], [128, 72, 9, -3.4, 5], [160, 64, 12, -2, 6.4], [182, 74, 6, -0.9, 4.2], [44, 60, 5, -3.9, 5.2]].map(([x, y, r, d, t]) => `<g ${a("ri", d, t)}>${circ(x, y, r, W, 'fill-opacity=".22" stroke="#fff" stroke-opacity=".85" stroke-width="1.6"')}${circ(x - r * 0.35, y - r * 0.35, r * 0.2, W, 'fill-opacity=".9"')}</g>`).join("") + `<g ${a("pop", 0.5, 3)}>${circ(110, 28, 10, P.pink, 'fill-opacity=".4"')}</g>`,

  fog: () => rect(0, 0, 200, 90, "#3b2a55", 0, 'fill-opacity=".92"') + [[40, 50, 12, P.orange], [70, 34, 8, P.yellow], [118, 56, 14, P.pink], [150, 30, 9, P.blue], [172, 60, 11, P.orange], [96, 22, 7, P.violet]].map(([x, y, r, c], i) => circ(x, y, r, c, `fill-opacity=".8" ${a("pu", i * 0.4, 3.5)}`)).join("") + rect(0, 0, 200, 90, W, 0, 'fill-opacity=".3"') + [[30, 0.2], [76, 1.4], [124, 0.8], [168, 2]].map(([x, d]) => `<g ${a("fa", d, 3.6)}><ellipse cx="${x}" cy="-4" rx="3" ry="4.4" fill="${W}" fill-opacity=".85"/><line x1="${x}" y1="-14" x2="${x}" y2="-8" stroke="${W}" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/></g>`).join(""),

  paint: () => `<defs><linearGradient id="gp1"><stop offset="0" stop-color="${P.pink}"/><stop offset=".5" stop-color="${P.yellow}"/><stop offset="1" stop-color="${P.green}"/></linearGradient><linearGradient id="gp2"><stop offset="0" stop-color="${P.blue}"/><stop offset="1" stop-color="${P.violet}"/></linearGradient></defs>` + `<path ${a("dw", 0, 5)} d="M14 62 C 50 10, 80 90, 118 40 S 170 20, 188 52" fill="none" stroke="url(#gp1)" stroke-width="6" stroke-linecap="round" pathLength="100"/>` + `<path ${a("dw", 1.6, 5)} d="M20 28 C 60 64, 96 4, 134 46 S 176 70, 190 30" fill="none" stroke="url(#gp2)" stroke-width="4" stroke-linecap="round" stroke-opacity=".9" pathLength="100"/>`,

  kaleido: () => `<g ${a("sp", 0, 22)}>${[0, 60, 120, 180, 240, 300].map((r, i) => `<g transform="rotate(${r} 100 45)"><ellipse cx="100" cy="21" rx="9" ry="19" fill="${PL[i]}" fill-opacity=".85"/><circle cx="100" cy="11" r="4" fill="${W}" fill-opacity=".8"/></g>`).join("")}</g>${circ(100, 45, 7, K, 'fill-opacity=".85"')}`,

  sand: () => [24, 34, 44, 54, 64].map((y, i) => `<path ${a("dr s", i * 0.5, 7)} d="M-20 ${y} Q 20 ${y - 7} 60 ${y} T 140 ${y} T 220 ${y} T 300 ${y}" fill="none" stroke="${K}" stroke-opacity=".34" stroke-width="2"/>`).join("") + [30, 22, 14].map((r, i) => `<ellipse cx="100" cy="45" rx="${r * 1.4 + 6}" ry="${r + 4}" fill="none" stroke="${K}" stroke-opacity=".3" stroke-width="2" ${a("pu", i * 0.4, 5)}/>`).join("") + `<ellipse cx="100" cy="46" rx="15" ry="10" fill="${K}" fill-opacity=".78"/><ellipse cx="96" cy="43" rx="6" ry="3" fill="${W}" fill-opacity=".35"/>`,

  garden: () => `<rect x="0" y="72" width="200" height="18" fill="${K}" fill-opacity=".22"/>` + [[44, 36, P.pink, 0, 4], [98, 22, P.yellow, 0.8, 4.6], [150, 40, P.violet, 1.6, 3.8]].map(([x, y, c, d, t]) => `<g ${a("sw o-b", d, t)}><line x1="${x}" y1="${y + 10}" x2="${x}" y2="76" stroke="${K}" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${x - 6}" cy="${y + 34}" rx="7" ry="3" fill="${P.green}" transform="rotate(-24 ${x - 6} ${y + 34})"/>${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="${x}" cy="${y - 5}" rx="4.5" ry="8" fill="${c}" transform="rotate(${r} ${x} ${y + 3}) "/>`).join("")}${circ(x, y + 3, 4.4, W)}</g>`).join(""),

  mandala: () => [[31, 12, 0, 30, 0.9], [21, 8, 1, -22, 0.9], [11, 6, 2, 16, 0.95]].map(([r, n, i, t]) => `<g ${a(t < 0 ? "sp rv" : "sp", 0, Math.abs(t))}>${Array.from({ length: n }, (_, k) => `<ellipse cx="100" cy="${45 - r}" rx="${r * 0.2 + 2}" ry="${r * 0.33 + 3}" fill="${PL[(k + i) % 6]}" fill-opacity=".88" transform="rotate(${(360 / n) * k} 100 45)"/>`).join("")}</g>`).join("") + circ(100, 45, 6, K, 'fill-opacity=".85"'),

  stars: () => {
    const S = [[28, 62], [58, 30], [96, 52], [128, 20], [160, 56], [182, 28]];
    return `<polyline ${a("dw", 0, 6)} points="${S.map((s) => s.join(",")).join(" ")}" fill="none" stroke="${K}" stroke-opacity=".6" stroke-width="1.6" stroke-linejoin="round" pathLength="100"/>` + S.map(([x, y], i) => `<path ${a("tw", i * 0.5, 2.6)} d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z" fill="${i % 2 ? P.yellow : W}"/>`).join("");
  },

  pop: () => rect(46, 8, 108, 46, W, 10, 'fill-opacity=".92"') + `<g ${a("pu", 0, 2.4)}>${txt(100, 31, "?", 34, P.violet)}</g>` + [[50, 0], [104, 1.2]].map(([x, d], i) => rect(x, 62, 46, 20, [P.pink, P.yellow][i], 10, 'fill-opacity=".5"') + `<rect x="${x}" y="62" width="46" height="20" rx="10" fill="${[P.pink, P.yellow][i]}" ${a("ec", d, 3)}/>`).join("") + [[20, 24, P.pink, 0], [180, 28, P.yellow, 1.1], [30, 64, P.green, 2], [172, 66, P.violet, 0.6]].map(([x, y, c, d]) => `<g ${a("ri", -d - 0.4, 5)}>${circ(x, y, 4.5, c)}</g>`).join(""),
  atlas: () => rect(14, 20, 172, 52, W, 12, 'fill-opacity=".5"') + [[44, "A", P.pink], [88, "R", P.yellow], [132, "I", P.green], [172, "?", P.violet]].map(([x, ch, c], i) => `<g ${a("pu", i * 0.4, 2.8)}>${circ(x - 6 + (i === 3 ? -6 : 0), 46, 15, c)}${txt(x - 6 + (i === 3 ? -6 : 0), 47, ch, 17, K)}</g>`).join("") + `<path ${a("dw", 0, 5)} d="M30 78 C 70 92, 130 92, 170 78" fill="none" stroke="${K}" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" pathLength="100"/>`,
  tod: () => `<g ${a("fl", 0, 3.4)}>${rect(26, 14, 70, 50, P.blue, 10)}${txt(61, 40, "TRUTH", 14, K)}</g><g ${a("fl", 1.2, 3.8)}>${rect(104, 22, 70, 50, P.pink, 10)}${txt(139, 48, "DARE", 14, K)}</g>` + [[100, 78, P.yellow, 0], [88, 80, P.orange, 0.5], [112, 80, P.orange, 1]].map(([x, y, c, d]) => `<g ${a("pu", d, 1.8)}><path d="M${x} ${y - 9} C ${x + 6} ${y - 3}, ${x + 6} ${y + 3}, ${x} ${y + 6} C ${x - 6} ${y + 3}, ${x - 6} ${y - 3}, ${x} ${y - 9} Z" fill="${c}"/></g>`).join(""),
  tune: () => rect(14, 12, 172, 66, W, 14, 'fill-opacity=".42"') + [10, 26, 42, 30, 52, 36, 20, 46, 28, 14].map((hh, i) => `<g ${a("bar", i * 0.13, 1.1 + (i % 3) * 0.25)}>${rect(28 + i * 15, 45 - hh / 2, 8, hh, [P.pink, P.violet, P.blue, P.green, P.yellow][i % 5], 4)}</g>`).join(""),
  gk: () => [[30, 18, P.yellow, "?"], [100, 10, P.pink, "!"], [158, 22, P.green, "?"]].map(([x, y, c, ch], i) => `<g ${a("fl", i * 0.5, 2.8)}>${rect(x - 22, y, 56, 40, c, 10)}${txt(x + 6, y + 21, ch, 24, K)}</g>`).join("") + `<g ${a("pu", 0, 2.4)}>${rect(52, 62, 96, 18, W, 9, 'fill-opacity=".85"')}${txt(100, 71, "India · World · Fun", 9, K)}</g>`,
  wchain: () => [[26, "W", P.pink], [62, "O", P.yellow], [98, "R", P.green], [134, "D", P.violet], [170, "S", P.blue]].map(([x, ch, c], i) => `<g ${a("pu", i * 0.3, 2.6)}>${rect(x - 15, 22, 30, 36, c, 8)}${txt(x, 41, ch, 18, K)}</g>`).join("") + `<path ${a("dw", 0, 4)} d="M30 70 C 60 82, 140 82, 170 70" fill="none" stroke="${K}" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" pathLength="100"/>`,
  antakshari: () => [[34, 52, P.pink], [76, 40, P.yellow], [124, 40, P.green], [166, 52, P.violet]].map(([x, y, c], i) => `<g ${a("fl", i * 0.4, 2.8)}>${circ(x, y, 15, c)}${txt(x, y + 1, ["क", "A", "ग", "S"][i], 15, K)}</g>`).join("") + [[100, 14]].map(([x, y]) => `<g ${a("pu", 0, 2)}>${rect(x - 26, y, 52, 18, W, 9, 'fill-opacity=".9"')}${txt(x - 12, y + 9, "♪", 12, K)}${txt(x + 6, y + 9, "♫", 12, K)}</g>`).join(""),
  adda: () => [[40, 60, P.pink, "A"], [78, 36, P.yellow, "B"], [122, 36, P.green, "C"], [160, 60, P.violet, "D"], [100, 70, P.orange, "E"]].map(([x, y, c, ch], i) => `<g ${a("fl", i * 0.35, 3 + (i % 3) * 0.5)}>${circ(x, y, 15, c)}${txt(x, y + 1, ch, 14, K)}</g>`).join("") + [[58, 14], [100, 10], [142, 14]].map(([x, y], i) => `<g ${a("pu", i * 0.5, 2.4)}>${rect(x - 18, y, 36, 16, W, 8, 'fill-opacity=".85"')}${circ(x - 8, y + 8, 2, K)}${circ(x, y + 8, 2, K)}${circ(x + 8, y + 8, 2, K)}</g>`).join(""),
  geo: () => rect(10, 10, 180, 70, W, 8, 'fill-opacity=".45"') + `<path d="M30 40 C 36 22, 62 24, 70 36 C 78 50, 60 62, 46 58 C 36 54, 24 52, 30 40 Z M96 30 C 108 22, 132 26, 140 38 C 148 52, 128 66, 112 60 C 100 56, 88 40, 96 30 Z M150 52 C 158 48, 172 52, 170 62 C 166 70, 150 68, 150 52 Z" fill="${K}" fill-opacity=".16"/>` + `<path ${a("dw", 0, 4)} d="M56 44 C 80 14, 120 14, 140 48" fill="none" stroke="${P.pink}" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 5" pathLength="100" style="stroke-dasharray:6 5"/>` + `<g ${a("fl", 0, 2.4)}>${circ(56, 42, 6, P.green)}${circ(56, 42, 2.4, W)}</g><g ${a("pu", 0.4, 2.4)}>${circ(140, 48, 6, P.pink)}${circ(140, 48, 2.4, W)}</g>`,
  hue: () => grid(6, 3, 44, 12, 22, (c, r, i, x, y) => rect(x, y, 20, 20, `hsl(${200 + c * 22 + r * 14},78%,${60 + r * 6}%)`, 4, i === 7 ? a("sw1", 0, 4) : i === 8 ? a("sw2", 0, 4) : "")),

  slide: () => grid(3, 3, 60, 6, 27, (c, r, i, x, y) => i === 8 ? "" : `<g ${i === 7 ? a("sl", 0, 4) : ""}>${rect(x, y, 25, 25, i % 2 ? P.blue : P.pink, 5)}${txt(x + 12.5, y + 13, i + 1, 14, W)}</g>`),

  merge: () => grid(4, 3, 44, 8, 28, (c, r, i, x, y) => rect(x, y, 25, 25, K, 5, 'fill-opacity=".1"')) + [[44, 8, 2, P.yellow, "m1"], [72, 8, 2, P.yellow, "m2"]].map(([x, y, n, c, k]) => `<g ${a(k, 0, 3.6)}>${rect(x, y, 25, 25, c, 5)}${txt(x + 12.5, y + 13, n, 14)}</g>`).join("") + `<g ${a("po2", 0, 3.6)}>${rect(100, 8, 25, 25, P.orange, 5)}${txt(112.5, 21, 4, 14)}</g>` + [[44, 36, 8, P.pink], [72, 36, 16, P.violet], [100, 64, 32, P.blue], [128, 36, 4, P.orange], [128, 64, 2, P.yellow]].map(([x, y, n, c]) => rect(x, y, 25, 25, c, 5) + txt(x + 12.5, y + 13, n, n > 9 ? 12 : 14, n > 15 ? W : K)).join(""),

  lights: () => grid(5, 3, 52, 14, 26, (c, r, i, x, y) => `<g>${circ(x + 8, y + 8, 11, K, 'fill-opacity=".16"')}<circle cx="${x + 8}" cy="${y + 8}" r="11" fill="${P.yellow}" ${a("lt", (i * 0.37) % 2.2, 3.2)}/></g>`),

  sudoku: () => rect(56, 6, 88, 78, W, 5, 'fill-opacity=".55"') + [1, 2, 3].map((k) => `<line x1="${56 + k * 22}" y1="6" x2="${56 + k * 22}" y2="84" stroke="${K}" stroke-opacity="${k === 2 ? 0.7 : 0.25}" stroke-width="${k === 2 ? 2 : 1}"/><line x1="56" y1="${6 + k * 19.5}" x2="144" y2="${6 + k * 19.5}" stroke="${K}" stroke-opacity="${k === 2 ? 0.7 : 0.25}" stroke-width="${k === 2 ? 2 : 1}"/>`).join("") + [[0, 0, 3], [2, 0, 1], [1, 1, 4], [3, 1, 2], [0, 2, 2], [2, 2, 4], [1, 3, 1], [3, 3, 3]].map(([c, r, n]) => txt(67 + c * 22, 15.7 + r * 19.5, n, 14, K, 'fill-opacity=".85"')).join("") + [[1, 0, 4], [0, 1, 1], [3, 2, 1], [2, 3, 2]].map(([c, r, n], i) => `<g ${a("po3", i * 0.9, 4.4)}>${txt(67 + c * 22, 15.7 + r * 19.5, n, 14, P.violet)}</g>`).join(""),

  maze: () => `<path d="M26 18 V64 H92 V28 H158 V66" fill="none" stroke="${W}" stroke-opacity=".6" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>` + `<path d="M26 18 V64 H92 V28 H158 V66" fill="none" stroke="${K}" stroke-opacity=".2" stroke-width="1.5" stroke-dasharray="1 7" stroke-linecap="round"/>` + circ(158, 66, 9, P.yellow, a("pu", 0, 1.8)) + circ(158, 66, 4, W) + `<g ${a("mz", 0, 7)}>${circ(26, 18, 10, P.violet, 'fill-opacity=".4"')}${circ(26, 18, 5.2, P.violet)}</g>`,

  echo: () => [[56, 38, P.pink, 0], [100, 38, P.blue, 1], [144, 38, P.green, 2], [78, 66, P.yellow, 3], [122, 66, P.violet, 4]].map(([x, y, c, i]) => `<g>${circ(x, y, 15, c, 'fill-opacity=".45"')}<circle cx="${x}" cy="${y}" r="15" fill="${c}" ${a("ec", i * 0.7, 3.5)}/></g>`).join(""),

  flags: () => `<line x1="38" y1="8" x2="38" y2="86" stroke="${K}" stroke-width="3" stroke-linecap="round"/><g ${a("wv", 0, 3.2)}>${[P.pink, P.orange, P.yellow, P.green, P.blue, P.violet].map((c, i) => `<rect x="40" y="${12 + i * 9}" width="116" height="9.2" fill="${c}"/>`).join("")}</g>`,

  myth: () => `<g ${a("fl1", 0, 6)}>${rect(52, 12, 96, 66, K, 8, 'fill-opacity=".86"')}${txt(100, 34, "MYTH?", 20, W)}<line x1="76" y1="52" x2="124" y2="52" stroke="${W}" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/></g><g ${a("fl2", 0, 6)}>${rect(52, 12, 96, 66, W, 8, 'fill-opacity=".92"')}${txt(100, 34, "FACT", 20, K)}<path d="M82 56 L94 66 L120 46" fill="none" stroke="${P.green}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`,

  wordle: () => [0, 1, 2].map((r) => ["WORDS", "KINDS", "PRIDE"][r].split("").map((ch, c) => {
    const col = r === 2 ? "#3ec9a7" : r === 1 ? ([P.yellow, "#8a8a8a", "#3ec9a7", P.yellow, "#8a8a8a"][c]) : ["#8a8a8a", P.yellow, "#8a8a8a", "#8a8a8a", "#3ec9a7"][c];
    return `<g ${a("fp", r * 0.25 + c * 0.3, 5)}>${rect(46 + c * 22, 6 + r * 27, 20, 24, col, 3)}${txt(56 + c * 22, 19 + r * 27, ch, 14, r === 1 && c === 1 ? K : W)}</g>`;
  }).join("")).join(""),

  words: () => {
    const L = ["QKINDX", "HOPELV", "LOVEWB"];
    return L.map((row, r) => row.split("").map((ch, c) => txt(42 + c * 23, 18 + r * 25, ch, 15, K, 'fill-opacity=".72"')).join("")).join("") + `<rect ${a("hl", 0, 5)} x="53" y="8" width="93" height="20" rx="10" fill="${P.pink}" fill-opacity=".42" stroke="${P.pink}" stroke-width="1.4"/>`;
  },

  jar: () => `<path d="M62 14 H138 M66 14 C 60 24, 56 30, 56 42 V72 Q 56 84 70 84 H130 Q 144 84 144 72 V42 C 144 30 140 24 134 14" fill="${W}" fill-opacity=".3" stroke="${K}" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>` + [[76, 74, P.pink], [96, 74, P.yellow], [116, 74, P.blue], [128, 72, P.green], [86, 56, P.violet], [108, 56, P.orange], [118, 58, P.pink]].map(([x, y, c], i) => `<g ${a("fl", i * 0.4, 3.4 + (i % 3) * 0.5)}>${circ(x, y, 9.2, c)}${circ(x - 3, y - 3, 2.6, W, 'fill-opacity=".7"')}</g>`).join("") + `<g ${a("fa2", 0, 4)}>${circ(100, 4, 9, P.green)}</g>`,

  memory: () => grid(4, 2, 40, 10, 38, (c, r, i, x, y) => {
    const up = [0, 5].includes(i), back = rect(x, y, 34, 32, up ? W : K, 6, up ? 'fill-opacity=".95"' : 'fill-opacity=".8"');
    const face = [circ(x + 17, y + 16, 8, P.yellow), `<path d="M${x + 22} ${y + 8} A9 9 0 1 0 ${x + 22} ${y + 25} A7 7 0 1 1 ${x + 22} ${y + 8}" fill="${P.violet}"/>`][i === 0 ? 0 : 1];
    return `<g ${i === 2 || i === 7 ? a("fp", i * 0.4, 5) : ""}>${back}${up ? face : txt(x + 17, y + 16, "?", 16, W, 'fill-opacity=".6"')}</g>`;
  }),
};

export const gameArt = (id) =>
  `<svg class="ga" viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${(ART[id] || (() => circ(100, 45, 30, W, `fill-opacity=".4" ${a("br", 0, 5)}`)))()}</svg>`;
