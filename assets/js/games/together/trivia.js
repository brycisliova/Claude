// Trivia night: a general knowledge quiz with India first, then the world, science, sport and fun. It uses the same
// engine as the Pride pop quiz (registerQuiz), so it plays solo or in a room, with closest-number rounds, double-point
// showstoppers and no repeats on this device until the bank runs out.
import { registerQuiz } from "./pop.js";
import { GK, GK_TOPICS } from "../../data/gk.js";

registerQuiz({
  id: "gk", title: "Trivia night", all: GK, topics: GK_TOPICS, seenKey: "wwa-gk-seen",
  right: ["Correct!", "Nailed it.", "Big brain energy.", "Quiz champion.", "Chai-fuelled genius.", "Straight from the toppers' bench.", "Absolutely right.", "Full marks. No grace needed."],
  wrong: ["Not this time.", "So close, and yet.", "Plot twist!", "Aww, that was a tricky one.", "Even the topper missed that.", "Learn it, love it, move on.", "Nope, but good guess."],
  slow: ["Too slow. The clock won.", "Time's up!", "The buzzer got you."],
  ranks: [[0.9, "Walking encyclopaedia"], [0.75, "Quiz master"], [0.55, "Class topper"], [0.35, "Backbencher with potential"], [0, "Every quiz master started somewhere"]],
  lede: (n) => `${n} questions across India, the world, science, sport and everyday fun, with closest-number rounds and a little story behind every answer. Each game is a fresh set, and a question will not come back until you have seen the rest.`
});
