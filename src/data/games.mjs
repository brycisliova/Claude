// The game catalogue. Cards on the Games page are built from this at build time; the behaviour of each game
// lives in assets/js/games/. cat: relax | create | puzzle | mind | play. lvl: 1 easy to 3 thoughtful.
// best: what a saved personal best means for that game (low = a smaller number is better).
export const CATS = [["all", "All games"], ["relax", "Relax"], ["create", "Create"], ["puzzle", "Puzzle"], ["mind", "Mind"], ["play", "Play"]];

export const GAMES = [
  { id: "breathe", title: "Breathe with the orb", how: "Choose a pattern and follow the orb in and out. Count your calm breaths.", cat: "relax", mins: 3, lvl: 1, c: "sky", best: { unit: "breaths" } },
  { id: "lantern", title: "Release a lantern", how: "Type something heavy on your mind and watch it float away into the night.", cat: "relax", mins: 2, lvl: 1, c: "violet" },
  { id: "chimes", title: "Wind chimes", how: "Tap or drag across the bars. Every combination sounds gentle.", cat: "relax", mins: 2, lvl: 1, c: "yellow" },
  { id: "aurora", title: "Aurora", how: "Move through the light and the particles follow, then drift free.", cat: "relax", mins: 2, lvl: 1, c: "blue" },
  { id: "bubbles", title: "Pop the bubbles", how: "No score to beat. Tap and watch them burst into colour.", cat: "play", mins: 2, lvl: 1, c: "pink", best: { unit: "popped" } },
  { id: "paint", title: "Paint with light", how: "Draw glowing trails that shift through the spectrum and slowly fade.", cat: "create", mins: 3, lvl: 1, c: "orange" },
  { id: "kaleido", title: "Kaleidoscope", how: "Draw anywhere and your strokes mirror into a mandala.", cat: "create", mins: 3, lvl: 1, c: "violet" },
  { id: "sand", title: "Zen sand garden", how: "Rake patterns in the sand, or place stones and rake around them.", cat: "create", mins: 4, lvl: 1, c: "yellow" },
  { id: "garden", title: "Grow a garden", how: "Tap the ground to plant. Watch each flower grow and sway.", cat: "create", mins: 3, lvl: 1, c: "green" },
  { id: "stars", title: "Constellations", how: "Connect the stars to draw your own sky.", cat: "create", mins: 3, lvl: 1, c: "blue" },
  { id: "hue", title: "Colour harmony", how: "Swap tiles to restore a smooth gradient. Dotted corners stay fixed.", cat: "puzzle", mins: 5, lvl: 2, c: "pink", best: { unit: "swaps", low: true } },
  { id: "slide", title: "Sliding puzzle", how: "Slide the tiles into order, 1 to 8. Take all the time you like.", cat: "puzzle", mins: 5, lvl: 2, c: "violet", best: { unit: "moves", low: true } },
  { id: "merge", title: "Merge", how: "Slide the tiles and merge equal numbers. See how high you can grow, with no clock.", cat: "puzzle", mins: 8, lvl: 2, c: "yellow", best: { unit: "points" } },
  { id: "lights", title: "Lights out", how: "Flip a light and its neighbours until the board is dark. Every level can be solved.", cat: "puzzle", mins: 6, lvl: 2, c: "sky", best: { unit: "levels" } },
  { id: "sudoku", title: "Mini sudoku", how: "4 by 4 and 6 by 6 puzzles with live checking, hints and three difficulties.", cat: "puzzle", mins: 8, lvl: 3, c: "green", best: { unit: "s", low: true } },
  { id: "maze", title: "Quiet maze", how: "Walk your light to the glow. Each level grows a little bigger.", cat: "puzzle", mins: 6, lvl: 2, c: "violet", best: { unit: "levels" } },
  { id: "memory", title: "Gentle memory", how: "Find the matching pairs. There is no timer.", cat: "puzzle", mins: 4, lvl: 1, c: "green", best: { unit: "turns", low: true } }
];
