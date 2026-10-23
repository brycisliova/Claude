# Backend and the helper chat (free)

The site is static and lives on GitHub Pages, so it has no server. This folder is the small backend that the helper chat
needs. It is one Cloudflare Worker, and everything below is on free plans. It holds the AI keys so they never reach a
browser, matches questions against the site's own pages and today's headlines, can add web results, asks a free AI model to
write the answer, and stores nothing a visitor types.

Until you do the steps, the chat button still works in a simpler mode: it finds pages, answers common questions and shows
helplines. It just cannot hold an open conversation.

## What "free" gets you, honestly

- **Cloudflare Workers** (the backend): the free plan allows 100,000 requests a day.
- **Groq** (first choice): a free account with rate limits, not a money budget. At the time of writing a free key allows
  about 1,000 requests a day on its larger models. Groq's docs say it does not keep inference data by default.
- **Cloudflare Workers AI** (second choice, needs no key): 10,000 "neurons" a day free, shared across models. It is enough for a
  few hundred short chats a day. Cloudflare says it does not use your content to train models.
- **Tavily** (optional web search): a free plan with a small monthly number of searches (about 1,000 at the time of writing).
  The Worker only searches for general questions about fresh facts, never for a personal message.
- These free models (Llama 3.3 70B and similar) are good, but they are not the same as the best paid models. If a day's free
  allowance runs out, the next provider takes over, and if all run out the chat says it is busy and the simple mode still works.
- Free limits and model names change. If a provider starts failing, open its model list and change the name in `wrangler.toml`.

Not on by default, on purpose: **Gemini's free tier** and **OpenRouter's free models**. Google's free-tier terms say prompts and
answers may be used to improve its products and read by human reviewers, and free OpenRouter models are run by third parties who
may log prompts. People using this site may be scared and private, so these stay off unless you decide otherwise and add them
to `PROVIDERS` yourself (and update the Privacy page).

## Switch it on, step by step (about 20 minutes, no terminal needed)

You do these once. After that, changes to `backend/` deploy by themselves.

1. **Make a free Cloudflare account** at dash.cloudflare.com. Open "Workers & Pages" once. If it asks you to pick a
   `workers.dev` name, pick one (for example `shiningforever`). That name becomes part of the backend address.
2. **Copy your Account ID.** On the Workers & Pages overview page it is in the right-hand column. Copy it.
3. **Make an API token.** Click your profile icon, My Profile, API Tokens, Create Token, and use the "Edit Cloudflare Workers"
   template. Under Account Resources choose your account, then Continue and Create Token. Copy the token (it is shown once). If
   the deploy later says it needs Workers AI permission, edit the token and add "Workers AI: Edit".
4. **Get a free Groq key.** Go to console.groq.com, sign up, open API Keys, Create API Key, copy it. No card is needed.
5. **(Optional) Get a free Tavily key** at tavily.com for fresh-fact searches. Skip this if you prefer.
6. **Add the secrets to GitHub.** Open your repository on github.com, Settings, Secrets and variables, Actions, "New repository
   secret". Add these, one by one, with exactly these names:
   - `CLOUDFLARE_API_TOKEN` (the token from step 3)
   - `CLOUDFLARE_ACCOUNT_ID` (from step 2)
   - `GROQ_API_KEY` (from step 4)
   - `TAVILY_API_KEY` (only if you did step 5)
7. **Deploy.** In the repository open Actions, choose "Deploy the helper backend" on the left, press "Run workflow". It takes
   about a minute. A green tick means it worked.
8. **Find the address.** In the Cloudflare dashboard open Workers & Pages, then `who-we-are-helper`. The address looks like
   `https://who-we-are-helper.YOURNAME.workers.dev`. Open that address followed by `/health`. You should see something like
   `{"ok":true,"chat":true,"providers":["groq","workersai"],"search":false}`.
9. **Tell the site.** On GitHub open `assets/data/chat.json`, click the pencil, set `"endpoint"` to your address (with or
   without `/chat` on the end), and commit. The change is live in about a minute. You do not need to rebuild anything.
10. **Try it.** Open the site, press "Ask", and ask something like "What is the latest news in India about trans rights?".

If step 7 fails, open the failed run and read the red line. The usual causes are a mistyped secret name, a token without the
right permission, or no `workers.dev` name chosen yet (step 1).

## Settings (in `wrangler.toml`, editable on GitHub)

| Variable | What it does |
| --- | --- |
| `PROVIDERS` | The order the providers are tried in. Default `groq,workersai`. Others you can add: `gemini`, `openrouter`, `anthropic`. |
| `GROQ_MODEL`, `WORKERS_AI_MODEL`, `GEMINI_MODEL` | The model each provider uses. Change a name if it is retired. |
| `ALLOWED_ORIGINS` | The sites allowed to call the chat. Keep it to your own domain. |
| `LIMIT_PER_10_MIN` | Messages one visitor may send in ten minutes. It needs the free KV namespace described in `wrangler.toml`. |
| `GEMINI_SEARCH` | `on` lets Gemini search Google, only if `gemini` is in `PROVIDERS`. |

Other optional secrets you can add the same way as in step 6: `GEMINI_API_KEY`, `OPENROUTER_API_KEY` with `OPENROUTER_MODEL`,
and `ANTHROPIC_API_KEY` (paid, for the strongest answers).

## How to make it stronger later

1. Keep Groq and Workers AI as the free base, and watch the Groq console for the daily limit.
2. If you ever want the very best answers, add a paid key such as `ANTHROPIC_API_KEY`, set `PROVIDERS = "anthropic,groq,workersai"`, and set a monthly spending limit with the provider.
3. Improve the site's own answers for free by keeping the pages and the News page current. The helper reads them every time.

## Privacy

Messages go from the visitor's browser to this Worker, then to Groq or Cloudflare Workers AI (and to Tavily for a general fresh-fact
search). The Worker does not log or save them. Each provider's own policy applies to what it receives. The Privacy page says so.
