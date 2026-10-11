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
| Text of each page | `src/pages/*.mjs` |
| Navigation, menu, header, footer | `src/layout.mjs` |
| Shared components (hero, photo, marquee, buttons) | `src/ui.mjs` |
| Styles and design tokens | `assets/css/site.css` |
| Animation engine, games, sound | `assets/js/` (`core.js` plus one script per page) |
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

## Design and animation

The site uses flat colour blocks, large condensed type (Bricolage Grotesque) with serif italic accents (Instrument Serif), and a pride-flag palette used sparingly. Motion is built with GSAP, ScrollTrigger and Lenis (smooth scrolling): page transitions, split-text reveals, a scroll-driven manifesto, a pinned horizontal reel, magnetic buttons and a full-screen menu. Everything is self-hosted. With JavaScript off, or with reduced motion requested, the site shows all content without animation.

## Photographs

Every picture on the site is a real photograph shown with a short credit ("author, source") linking to the original page. Each place a photograph can appear is a *slot* listed in `src/data/photo-slots.mjs`, with a note on what belongs there. Until a slot has a photograph it shows a plain colour field.

To fill a slot:

1. Choose a photograph that is public domain or under a Creative Commons licence that allows reuse (for example from Wikimedia Commons, Unsplash or Pexels).
2. Save resized WebP copies in `assets/img/photos/` named `<file>-800.webp`, `<file>-1400.webp` and `<file>-2200.webp`.
3. Add an entry to `src/data/photos.json` keyed by the slot id: `file`, `sizes` (`[800, 1400, 2200]`), `w` and `h` (pixel size of the original), `color` (average colour), `alt` text, `author`, `source`, `license` and `pageUrl`.
4. Run `node tools/build.mjs`. The credit appears under the picture, and a Photo credits page listing every photograph is generated automatically.

## Films and songs that play on the page

`src/data/media.json` links a title to a YouTube video. Add a YouTube link (or the 11-character id) beside the exact title used in `src/data/content.mjs`, then rebuild:

```json
{
  "films": { "Fire": "https://www.youtube.com/watch?v=VIDEO_ID" },
  "songs": { "True Colors": "VIDEO_ID" }
}
```

A film with an entry shows an embedded trailer in place of its title card, and a song with an entry gets a player in its row. Players load YouTube's privacy-enhanced embed only when pressed, so nothing is requested from YouTube until a visitor chooses to play.

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
