// Word-search helpers shared by the together-mode word hunt.
export const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

export function makeSearch(N, pool, count = 8) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const words = shuffle(pool.slice()).slice(0, count).sort((a, b) => b.length - a.length), grid = Array(N * N).fill("");
    let ok = true;
    for (const w of words) {
      let placed = false;
      for (let tries = 0; tries < 200 && !placed; tries++) {
        const [dx, dy] = DIRS[rnd(DIRS.length)], rev = Math.random() < 0.25, s = rev ? [...w].reverse().join("") : w;
        const x0 = rnd(N), y0 = rnd(N), x1 = x0 + dx * (w.length - 1), y1 = y0 + dy * (w.length - 1);
        if (x1 < 0 || x1 >= N || y1 < 0 || y1 >= N) continue;
        let fits = true; for (let k = 0; k < w.length; k++) { const v = grid[(y0 + dy * k) * N + x0 + dx * k]; if (v && v !== s[k]) { fits = false; break; } }
        if (!fits) continue;
        for (let k = 0; k < w.length; k++) grid[(y0 + dy * k) * N + x0 + dx * k] = s[k];
        placed = true;
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return { words, grid: grid.map((v) => v || String.fromCharCode(65 + rnd(26))) };
  }
  throw new Error("could not build a word search");
}

// The cells on a straight line from cell i towards cell j (snapped to the nearest of the eight directions).
export function lineCells(i, j, N) {
  const x0 = i % N, y0 = Math.floor(i / N), dx = (j % N) - x0, dy = Math.floor(j / N) - y0;
  if (!dx && !dy) return [i];
  const L = Math.max(Math.abs(dx), Math.abs(dy)); let sx = Math.sign(dx), sy = Math.sign(dy);
  if (Math.abs(dx) !== Math.abs(dy)) { if (Math.abs(dx) > Math.abs(dy) * 2) sy = 0; else if (Math.abs(dy) > Math.abs(dx) * 2) sx = 0; }
  const out = []; for (let k = 0; k <= L; k++) { const x = x0 + sx * k, y = y0 + sy * k; if (x < 0 || x >= N || y < 0 || y >= N) break; out.push(y * N + x); }
  return out;
}
// Is this list of cell numbers a straight, unbroken run (any of the eight directions)?
export function isStraight(cells, N) {
  if (cells.length < 2) return false;
  const dx = (cells[1] % N) - (cells[0] % N), dy = Math.floor(cells[1] / N) - Math.floor(cells[0] / N);
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (!dx && !dy)) return false;
  for (let k = 1; k < cells.length; k++) { if ((cells[k] % N) - (cells[k - 1] % N) !== dx || Math.floor(cells[k] / N) - Math.floor(cells[k - 1] / N) !== dy) return false; }
  return true;
}
