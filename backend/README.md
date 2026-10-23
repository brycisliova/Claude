# Backend

The site is static, so it has no server of its own. This folder is the small backend that the helper chat needs. It is one
Cloudflare Worker (free plan is enough). It keeps the Anthropic API key private, answers `POST /chat`, limits how often one
person can ask, and stores nothing the visitor types.

Until it is deployed, the chat button on the site still works in a simpler mode: it finds pages, answers a few common
questions and shows helplines. It just cannot hold an open conversation.

## Switch it on (about ten minutes)

1. Make a free Cloudflare account and an Anthropic API key (console.anthropic.com). Set a monthly spending limit there.
2. `cd backend && npx wrangler login`
3. `npx wrangler secret put ANTHROPIC_API_KEY` and paste the key.
4. `npx wrangler deploy`. It prints a URL like `https://who-we-are-helper.YOURNAME.workers.dev`.
5. Put that URL, with `/chat` on the end, in `site.config.json` as `"chatEndpoint"`, run `node tools/build.mjs`, commit and push.
6. Check `https://YOURURL/health`. It should say `{"ok":true,"chat":true}`.

Optional: create the `LIMITS` KV namespace described in `wrangler.toml` so one visitor cannot send more than 20 messages
every 10 minutes. Set `WEB_SEARCH = "off"` in `[vars]` if you do not want the helper to search the web.

## Settings

| Variable | What it does |
| --- | --- |
| `ALLOWED_ORIGINS` | Sites that may call the chat. Keep it to your own domain. |
| `CHAT_MODEL` | The Claude model to use. |
| `LIMIT_PER_10_MIN` | Messages one visitor may send in ten minutes (needs the KV namespace). |
| `WEB_SEARCH` | `off` turns web search off. By default the helper may search up to three times per answer for recent facts. |
| `WEB_SEARCH_TOOL` | The web search tool version, if Anthropic releases a newer one. |

## Privacy

Messages go from the visitor's browser to this Worker and on to Anthropic to get an answer. The Worker does not log or save
them. The privacy page says so. Anthropic's own policy applies to what it receives.
