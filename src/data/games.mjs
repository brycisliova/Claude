// The game catalogue. Cards on the Games page are built from this at build time; the behaviour of each game
// lives in assets/js/games/. cat: relax | create | puzzle | mind | play. lvl: 1 easy to 3 thoughtful.
// best: what a saved personal best means for that game (low = a smaller number is better).
export const CATS = [["all", "All games"], ["relax", "Relax"], ["create", "Create"], ["puzzle", "Puzzle"], ["mind", "Mind"], ["play", "Play"]];

export const GAMES = [
  { id: "breathe", title: "Breathe with the orb", how: "Choose a pattern and follow the orb in and out. Count your calm breaths.", cat: "relax", mins: 3, lvl: 1, c: "sky", best: { unit: "breaths" } },
  { id: "lantern", title: "Release a lantern", how: "Type something heavy on your mind and watch it float away into the night.", cat: "relax", mins: 2, lvl: 1, c: "violet" },
  { id: "chimes", title: "Wind chimes", how: "Tap or drag across the bars. Every combination sounds gentle.", cat: "relax", mins: 2, lvl: 1, c: "yellow" },
  { id: "aurora", title: "Aurora", how: "Move through the light and the particles follow, then drift free.", cat: "relax", mins: 2, lvl: 1, c: "blue" },
  { id: "snake", title: "Glow snake", how: "Steer a soft glowing snake to the light. The edges wrap around and a bump only trims your tail.", cat: "play", mins: 5, lvl: 2, c: "green", best: { unit: "long" } },
  { id: "four", title: "Four in a row", how: "Drop discs and line up four. Play the computer, or a friend on their own device.", cat: "play", mins: 8, lvl: 2, c: "blue", mp: [2, 2] },
  { id: "bubbles", title: "Pop the bubbles", how: "No score to beat. Tap and watch them burst into colour.", cat: "play", mins: 2, lvl: 1, c: "pink", best: { unit: "popped" } },
  { id: "fog", title: "Clear the window", how: "Wipe the misty glass to see the rainy city behind it, and save the view.", cat: "relax", mins: 3, lvl: 1, c: "sky" },
  { id: "paint", title: "Paint with light", how: "Draw glowing trails in rainbow, sunset or ocean colours, then save your picture.", cat: "create", mins: 3, lvl: 1, c: "orange" },
  { id: "kaleido", title: "Kaleidoscope", how: "Draw anywhere and your strokes mirror into a mandala.", cat: "create", mins: 3, lvl: 1, c: "violet" },
  { id: "sand", title: "Zen sand garden", how: "Rake patterns in the sand, or place stones and rake around them.", cat: "create", mins: 4, lvl: 1, c: "yellow" },
  { id: "garden", title: "Grow a garden", how: "Tap the ground to plant. Watch each flower grow and sway.", cat: "create", mins: 3, lvl: 1, c: "green" },
  { id: "mandala", title: "Mandala colouring", how: "Colour a mandala with ten colours and mirrored patterns, then save your picture.", cat: "create", mins: 8, lvl: 1, c: "pink" },
  { id: "stars", title: "Constellations", how: "Connect the stars to draw your own sky.", cat: "create", mins: 3, lvl: 1, c: "blue" },
  { id: "hue", title: "Colour harmony", how: "Swap tiles to restore a smooth gradient. Dotted corners stay fixed.", cat: "puzzle", mins: 5, lvl: 2, c: "pink", best: { unit: "swaps", low: true } },
  { id: "slide", title: "Sliding puzzle", how: "Slide the tiles into order, 1 to 8. Take all the time you like.", cat: "puzzle", mins: 5, lvl: 2, c: "violet", best: { unit: "moves", low: true } },
  { id: "merge", title: "Merge", how: "Slide the tiles and merge equal numbers. See how high you can grow, with no clock.", cat: "puzzle", mins: 8, lvl: 2, c: "yellow", best: { unit: "points" } },
  { id: "lights", title: "Lights out", how: "Flip a light and its neighbours until the board is dark. Every level can be solved.", cat: "puzzle", mins: 6, lvl: 2, c: "sky", best: { unit: "levels" } },
  { id: "sudoku", title: "Mini sudoku", how: "4 by 4 and 6 by 6 puzzles with live checking, hints and three difficulties.", cat: "puzzle", mins: 8, lvl: 3, c: "green", best: { unit: "s", low: true } },
  { id: "maze", title: "Quiet maze", how: "Walk your light to the glow. Each level grows a little bigger.", cat: "puzzle", mins: 6, lvl: 2, c: "violet", best: { unit: "levels" } },
  { id: "echo", title: "Echo tones", how: "Listen to a pattern of tones, then play it back. It grows by one each round and never ends in failure.", cat: "mind", mins: 5, lvl: 2, c: "pink", best: { unit: "tones" } },
  { id: "flags", title: "Know the flags", how: "Name each pride flag, then read the story behind its colours.", cat: "mind", mins: 4, lvl: 2, c: "blue", best: { unit: "of 8" }, mp: [2, 8] },
  { id: "myth", title: "Myth or fact?", how: "Ten tricky statements, half myths worded like facts and half facts that sound like myths. A fresh set every game, so even experts get caught out.", cat: "mind", mins: 4, lvl: 2, c: "orange", best: { unit: "of 10" }, mp: [2, 8] },
  { id: "pop", title: "Pride pop quiz", how: "More than 400 questions, with photos, emoji and riddles. New ones every game, no repeats until you have seen them all. Race friends in a room, or earn a title solo.", cat: "mind", mins: 8, lvl: 2, c: "pink", best: { unit: "pts" }, mp: [2, 8] },
  { id: "atlas", title: "Atlas", how: "Name a place that starts with the last letter of the one before. Cities, districts, states, countries, deserts and oceans. Say which state or country a city is in. Beat the bot or race friends.", cat: "mind", mins: 10, lvl: 3, c: "green", best: { unit: "pts" }, mp: [2, 8] },
  { id: "adda", title: "Adda night", how: "A party game for 3 to 10 friends: fake facts, most likely to, confessions, truth or dare, would you rather and guess the word. Cheeky, desi and always PG-13.", cat: "play", mins: 20, lvl: 1, c: "orange", best: { unit: "pts" }, mp: [3, 10] },
  { id: "geo", title: "Where in the world?", how: "Look at a photo, drop a pin on the map and see how far off you were, with a line that turns from green to dark red the further away you are. Solo or race friends.", cat: "mind", mins: 10, lvl: 2, c: "blue", best: { unit: "pts" }, mp: [2, 8] },
  { id: "wordle", title: "Word guess", how: "Find the hidden five-letter word in six tries. A daily word, random words, and a set of kind words.", cat: "mind", mins: 5, lvl: 2, c: "sky", best: { unit: "guesses", low: true }, mp: [2, 6] },
  { id: "words", title: "Word garden", how: "A word search of kind words. Drag across the letters in a straight line.", cat: "mind", mins: 6, lvl: 2, c: "green", best: { unit: "s", low: true }, mp: [2, 6] },
  { id: "jar", title: "Gratitude jar", how: "Add small good things and watch them settle as glowing marbles. Pull one out on a hard day.", cat: "mind", mins: 3, lvl: 1, c: "yellow" },
  { id: "memory", title: "Gentle memory", how: "Find the matching pairs. There is no timer.", cat: "puzzle", mins: 4, lvl: 1, c: "green", best: { unit: "turns", low: true }, mp: [2, 4] }
];

// True statements for "Myth or fact?". Myths come from the Myths page (src/data/content.mjs).
export const FACTS = [
  { q: "The World Health Organization removed homosexuality from its list of diseases in 1990.", e: "Major health bodies worldwide agree it is a natural variation of human life, not an illness." },
  { q: "American psychiatrists removed homosexuality from their list of mental disorders in 1973.", e: "The vote followed years of research that found no evidence it was a disorder." },
  { q: "India's Supreme Court decriminalised same-sex love in 2018.", e: "The Navtej Singh Johar judgment struck down the part of Section 377 that criminalised consenting adults." },
  { q: "Indian courts have recognised transgender people as a third gender since 2014.", e: "The NALSA judgment affirmed that people can determine their own gender identity." },
  { q: "Same-sex behaviour has been recorded in hundreds of animal species.", e: "Researchers have documented it widely across mammals, birds and insects." },
  { q: "Studies generally find children raised by same-sex parents do as well as other children.", e: "A loving, stable home is what matters most for a child." },
  { q: "India's law against same-sex love was written by British colonial rulers.", e: "Older Indian traditions, from temple art to hijra communities, show wide gender and sexual diversity." },
  { q: "Tele-MANAS (14416) is a free, confidential mental health helpline in India.", e: "It runs 24 hours a day in many Indian languages." },
  { q: "Attempts to change someone's sexual orientation are linked to higher rates of suicide attempts.", e: "There is nothing to cure, and change efforts do harm." },
  { q: "Higher rates of depression among queer people are linked to stigma and rejection.", e: "Acceptance by family and community is protective." }
];

// List games grouped by theme, keeping the order above inside each group.
const order = CATS.map(([k]) => k);
GAMES.sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
