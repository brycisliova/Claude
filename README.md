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
| Navigation, header, footer | `src/layout.mjs` |
| Styles | `assets/css/site.css` |
| Scripts, games, sound | `assets/js/` |
| Fonts and images | `assets/fonts/`, `assets/img/` |
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
