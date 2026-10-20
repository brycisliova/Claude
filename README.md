# Who We Are

*Not a choice. Not an illness. Just who we are.*

A calm, research-backed website for understanding LGBTQIA+ lives: the science, the history, queer India, therapies, sound, games, and a place to be heard. It is a static site (plain HTML, CSS and JavaScript), so it needs no server, database or paid hosting. No tracking, no cookies, no ads.

Address: <https://shiningforever.in>

## Pages

- **Understand:** LGBTQIA+ explained, the science, a 26-paper research library, timeline, myths and facts
- **Stories:** trailblazers, community wall, voices and videos, films and series, India today
- **Heal:** helplines and guides, therapies, sound studio, calm games
- **About:** about the builder, connect, privacy and safety, sources

## Project layout

| What | Where |
| --- | --- |
| Papers, timeline, people, films, helplines, glossary, quotes, sources | `src/data/content.mjs` |
| Game catalogue (titles, themes, timings) and the true statements for Myth or fact | `src/data/games.mjs` |
| Pride pop quiz questions (about 250, in eight formats) | `assets/js/data/pop.js` |
| Text of each page | `src/pages/*.mjs` |
| Navigation, menu, header, footer | `src/layout.mjs` |
| Shared components (hero, photo, marquee, buttons) | `src/ui.mjs` |
| Styles and design tokens | `assets/css/site.css` |
| Animation engine and sound | `assets/js/` (`core.js` plus one script per page) |
| Games | `assets/js/games/` (`calm`, `create`, `play`, `puzzle`, `mind`, with shared helpers) |
| Animation libraries (GSAP, ScrollTrigger, Lenis) and their licences | `assets/vendor/` |
| Fonts and brand images | `assets/fonts/`, `assets/img/` |
| Photographs and their credits | `src/data/photos.json`, `src/data/photo-slots.mjs` |
| Community wall and video shelf | `data/wall.json`, `data/videos.json` |
| Site name, address, email | `site.config.json` |
| Generated pages | the folders at the repository root (`index.html`, `learn/`, `science/`, ...) |

## Editing and building

Requires Node 18 or newer.

```bash
node tools/build.mjs     # regenerates every page from src/ and site.config.json
node tools/check.mjs     # verifies every internal link and anchor
python3 -m http.server 8080   # preview at http://localhost:8080
```

After changing anything in `src/`, `assets/` or `site.config.json`, run the build and commit the regenerated files. Changes to `data/*.json` need no build.

To change the address, edit `url` in `site.config.json` (or run `SITE_URL=https://example.org node tools/build.mjs`) and rebuild.

## Games

The Games page lists every game as a compact card. Opening one fills the screen with a play window that has next and previous buttons, full screen, and keyboard support (Esc closes). Each game has its own link, such as `/games/#g-sudoku`. Personal bests are saved in the visitor's browser only and are cleared by the button on the privacy page.

Word guess uses the lists in `assets/js/data/words.js`: about 640 everyday answers, 37 kind words, and 12,500 valid guesses taken from the MIT-licensed `word-list` package.

To add a game: add an entry to `src/data/games.mjs`, then register it in one of the files in `assets/js/games/` with `game(id, bodyHtml, init)`. `init` can return `frame`, `resize`, `key` and `destroy` handlers and can call `report(score)` to save a best.

## Playing together

Seven games can be played with friends on their own devices: the Pride pop quiz (2 to 8 players, solo too), Gentle memory (2 to 4 players, and the board grows with every player), Word guess (2 to 6, everyone races to the same word), Myth or fact and Know the flags (2 to 8, a live quiz), Word garden (2 to 6, a word-search race) and Four in a row (2 players).

How it works: one player is the host and runs the game; everyone else sends their moves to the host, who sends back the state. Players join with a six-character room code or a link such as `/games/#r-ABC123`. There is no server to run. Messages travel through a free public MQTT broker over secure WebSockets, on topics named after the room code, using a small client in `assets/js/mp/mqtt.js`. Only nicknames and moves are sent, nothing is stored, and a room disappears when its host leaves.

- `assets/js/mp/room.js` creates and joins rooms and keeps presence.
- `assets/js/mp/ui.js` is the create, join and lobby screens.
- `assets/js/games/together/` holds each game's host rules and its view.
- Brokers are listed in `assets/js/config.js` (`MULTIPLAYER.brokers`). They are tried in order, and the last character of a room code records which one a room uses. To use your own broker, put its `wss://` address first.

To test locally without the public brokers, run any MQTT broker that offers WebSockets (for example `aedes` with `ws`) and open the site on `localhost` with `?mqtt=ws://localhost:9001` added to the address. That override works only on localhost.

Public brokers are free but best-effort. Some school and work networks block them. See the privacy page for what is shared.

## Design and animation

The site uses flat colour blocks, large condensed type (Bricolage Grotesque) with serif italic accents (Instrument Serif), and a pride-flag palette used sparingly. Motion is built with GSAP, ScrollTrigger and Lenis (smooth scrolling): page transitions, split-text reveals, a scroll-driven manifesto, a pinned horizontal reel, magnetic buttons and a full-screen menu. Everything is self-hosted. With JavaScript off, or with reduced motion requested, the site shows all content without animation.

## Photographs

Every picture on the site is an openly licensed photograph shown with a short credit ("photographer · source"). Photographs come from the WordPress Photo Directory, StockSnap and Rawpixel (all CC0 or public domain) and from Wikimedia Commons (CC BY or CC BY-SA). The Photo credits page lists each photograph with its photographer, licence and original page.

Each place a photograph can appear is a *slot* listed in `src/data/photo-slots.mjs`, with a note on what belongs there. A slot with no photograph stays plain.

To change or add a photograph:

1. Choose a photograph that is public domain or under a Creative Commons licence that allows reuse.
2. Save resized WebP copies in `assets/img/photos/` named `<slot-id>-800.webp`, `<slot-id>-1400.webp` and so on.
3. Add an entry to `src/data/photos.json` keyed by the slot id: `file`, `sizes`, `w` and `h` (pixel size of the largest copy), `color` (average colour), `alt` text, `author`, `source`, `license`, `licenseUrl` and `pageUrl`.
4. Run `node tools/build.mjs`.

Photographs inside a link (such as the three home panels) show their credit as plain text; everywhere else the credit links to the original page.

## Films and songs that play on the page

`src/data/media.json` links a title to a YouTube video. Add a YouTube link (or the 11-character id) beside the exact title used in `src/data/content.mjs`, then rebuild:

```json
{
  "films": { "Fire": "https://www.youtube.com/watch?v=VIDEO_ID" },
  "songs": { "True Colors": "VIDEO_ID" }
}
```

A film with an entry shows an embedded trailer in place of its title card, and a song with an entry gets a player in its row. Each player shows the video's own preview picture (loaded from YouTube's image server as it scrolls into view) and loads YouTube's privacy-enhanced player only when pressed.

## Community wall

The wall shows what is listed in `data/wall.json`. Add an entry to publish a message and delete an entry to remove it:

```json
[
  { "text": "The message text.", "kind": "story", "date": "2026-10-08" },
  { "text": "Another message.", "kind": "hope", "date": "2026-10-09" }
]
```

`kind` is `story` or `hope`.

## Videos

Add an entry to `data/videos.json` using the 11-character id from a YouTube link (`youtube.com/watch?v=`**`pWOUI2cu-64`**):

```json
{ "yt": "VIDEO_ID", "title": "Title on the card", "note": "One sentence.", "c": "b" }
```

`c` is a colour: `r o y g b v pink sky`. Videos load in YouTube's privacy-enhanced mode and only after the visitor presses play.

## Forms

The anonymous-message and contact forms deliver to email through a form service.

1. Get a free access key at <https://web3forms.com> using the address in `site.config.json`.
2. Paste it into `assets/js/config.js` as `web3formsKey`. (Formspree also works: set `formspreeId`.)
3. Commit.

Access keys are designed to be public. Until a key is set, the forms tell visitors that sending is not switched on.

## Hosting on GitHub Pages with a custom domain

1. **Settings → Pages → Source:** Deploy from a branch, choose the branch and `/ (root)`.
2. At the domain registrar, set DNS:
   - four **A** records on `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - one **CNAME** record on `www` pointing to `<github-username>.github.io`
3. **Settings → Pages → Custom domain:** enter the domain and save, then tick **Enforce HTTPS** when it becomes available.

GitHub Pages serves from public repositories on the free plan. Private repositories need a paid GitHub plan, or another static host such as Cloudflare Pages or Netlify (no build command; publish directory is the repository root).

## Privacy and safety features

- A **Quick exit** button (or pressing Esc three times) leaves the site immediately.
- No analytics, cookies or third-party fonts; videos load only on click.
- Journal and mood data stay in the visitor's browser and can be wiped from the privacy page.

## Checks

The site passes automated accessibility checks (axe-core, WCAG 2.1 AA) in light and dark themes, has no horizontal scroll on small screens, is keyboard operable, and respects reduced-motion settings.

Helpline numbers, hours and legal details change over time. Update them in `src/data/content.mjs` and rebuild.
