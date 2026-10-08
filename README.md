# Who We Are

*Not a choice. Not an illness. Just who we are.*

A calm, research-backed website for understanding LGBTQIA+ lives: the science, the history, queer India, therapies, sound, games, and a place to be heard. 18 static pages, no tracking, no cookies, no ads, nothing to host except files.

**Live address (once Pages is switched on):** `https://brycisliova.github.io/Claude/`

---

## 1. Publish it (2 minutes)

The built site is already committed in this repository, so there's nothing to install.

1. On GitHub open **Settings → Pages**.
2. Under **Build and deployment → Source** choose **Deploy from a branch**.
3. Pick the branch that holds this site (`claude/india-lgbtq-hate-deaths-d37u5v`, or `main` after you merge it) and the folder **/ (root)**. Press **Save**.
4. Wait about a minute. GitHub shows the live link at the top of the same page.

GitHub Pages is free for public repositories.

## 2. Switch on the forms

The site has an anonymous-message form and a contact form. Static sites can't receive form data themselves, so they hand it to a free form service that emails you. Until you do this, the forms honestly tell visitors that sending isn't switched on yet.

**Web3Forms (simplest):**

1. Go to <https://web3forms.com>, enter `shiningforevr@gmail.com`, and they email you an *access key*.
2. Open `assets/js/config.js` and paste it: `web3formsKey: "your-key-here"`.
3. Commit. Done. Submissions now arrive in your inbox. The anonymous form never asks for a name or email.

*(Formspree works too: put the id from your endpoint into `formspreeId`.)* Access keys are designed to be public, so it's safe to commit.

## 3. Moderate the community wall (you decide what appears)

Visitors can't publish anything by themselves. A message only reaches the **Stories → Community wall** if you add it by hand:

1. Read the anonymous messages in your inbox. Ignore or delete anything inappropriate.
2. To publish one, open **`data/wall.json`** on GitHub, press the pencil (edit) icon, and add an entry:

```json
[
  { "text": "The message you approved.", "kind": "story", "date": "2026-10-08" },
  { "text": "Another one.", "kind": "hope", "date": "2026-10-09" }
]
```

`kind` is `story` or `hope`. Commit, and the wall updates within a minute or two. To remove a message, delete its entry. Nothing identifying is ever stored; only the text you paste.

## 4. Add videos

Open **`data/videos.json`**, add an entry, commit. Use the 11-character id from a YouTube link (`youtube.com/watch?v=`**`pWOUI2cu-64`**):

```json
{ "yt": "VIDEO_ID", "title": "Title shown on the card", "note": "One sentence about it.", "c": "b" }
```

`c` is a colour: `r o y g b v pink sky`. Videos play inside the page using YouTube's privacy-enhanced mode and only load when someone presses play.

## 5. Use your own domain later

1. Buy the domain, then in **Settings → Pages → Custom domain** enter it (for example `whoweare.in`).
2. At your domain registrar add DNS records:
   - four **A** records for the apex domain: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a **CNAME** record for `www` pointing to `<your-github-username>.github.io`
3. Tick **Enforce HTTPS** once GitHub finishes checking (can take up to a day).
4. Tell the site its new address so share previews, the sitemap and canonical links are right. Edit `"url"` in `site.config.json`, then rebuild:

```bash
node tools/build.mjs      # or: SITE_URL=https://whoweare.in node tools/build.mjs
node tools/check.mjs      # verifies every link and anchor
```

Commit the result. All links on the site are relative, so nothing else needs to change.

## 6. Your anonymity

The site names you only as *Reiner Endrios*, and commits are authored as "Claude", not with a personal email. Two things still point back to this GitHub account: the default web address contains the account name (`brycisliova.github.io`) and the repository is public. If that matters, move the repository to a new account or organisation with no personal details, and serve it from your custom domain. Also avoid putting any identifying details in the poem, `site.config.json`, or commit messages.

## Editing content

Everything you read on the site lives in `src/`:

| What | Where |
| --- | --- |
| Papers, timeline, people, films, helplines, glossary, quotes, poem, sources | `src/data/content.mjs` |
| The text of each page | `src/pages/*.mjs` |
| Navigation, header, footer | `src/layout.mjs` |
| Look and feel | `assets/css/site.css` |
| Behaviour, games, sound | `assets/js/` |
| Name, address, email | `site.config.json` |

After editing anything in `src/`, `assets/` or `site.config.json`, run `node tools/build.mjs` (needs Node 18+) to regenerate the HTML, then commit everything. Edits to `data/*.json` need no rebuild.

To preview locally: `python3 -m http.server 8080` in this folder, then open <http://localhost:8080>.

## What's inside

- **Understand:** LGBTQIA+ explained (letters, four dials, India's gender traditions, glossary), the science, a 26-paper research library with each study's limits, a timeline, myths and facts.
- **Stories:** twelve queer Indian trailblazers, the community wall, voices and videos, 28 films and series, India today (violence, data and the "encounter justice" comparison).
- **Heal:** helplines and guides (questioning, coming out, parents, allies, campus and work, legal rights), ten evidence-rated therapies with grounding, writing and mood tools, a sound studio (nature mixer, singing bowl, self-composing music, binaural beats, sleep timer), thirteen calm games.
- **About:** the builder's poem, contact and anonymous messages, privacy and safety, every source.

**Safety features:** a *Quick exit* button (or press Esc three times), no analytics, fonts and everything else served from the same place, videos load only on click, journal and mood data stay in the browser with a one-click wipe.

**Quality checks:** zero axe-core accessibility violations (WCAG 2.1 AA) in light and dark, no horizontal scroll from 360px up, keyboard-operable, respects reduced-motion and colour-scheme settings, internal links verified by `tools/check.mjs`.

## Honesty note

Helpline numbers and hours change, and legal situations evolve (the 2026 transgender amendment is contested and may be challenged). The site says so where it matters. If you spot anything out of date or wrong, fix it in `src/data/content.mjs` and rebuild.
