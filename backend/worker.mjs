// The site's backend: one small Cloudflare Worker (free plan). The website itself stays static on GitHub Pages; this only
// answers the helper chat (POST /chat) and says it is alive (GET /health). It holds the API keys so they never reach a browser.
// Setup is in backend/README.md. Nothing the visitor types is stored here.
//
// How an answer is made, all of it free:
//   1. The question is matched against the site's own page index, and against today's headlines when it is about the news.
//   2. If a free Tavily key is set and the question needs fresh facts, a few web results are added as sources.
//   3. A free AI model writes the answer. Providers are tried in order and the next one takes over if one is busy or out of
//      quota. The default order is Groq, then Cloudflare Workers AI (no key needed). Both say they do not train on what they
//      receive. Gemini's free tier and OpenRouter's free models may keep or learn from prompts, so they are off unless you add
//      them to PROVIDERS yourself. Claude is there for anyone who later wants to pay.

const SYSTEM = `You are the helper on "Who We Are" (shiningforever.in), a calm, research-backed site for understanding LGBTQIA+ lives, made in India. People may be scared, lonely, curious, or just looking for a page.

How to answer:
- Be warm, plain and short. Usually under 150 words. Write like a kind friend who knows things, not like a brochure. No headings, no slogans, no long lists unless asked. Never use em dashes.
- Reply in the language the person writes in. If they write Hinglish, answer in Hinglish.
- You are an AI helper, not a person, a doctor, a therapist or a lawyer. Say so if asked or if it matters. Never claim to be human.
- Facts must be correct. Use the "Context" block below when it is given: it holds pages of this site, today's headlines and web results. For recent things (news, laws, court cases, dates, prices, scholarship deadlines) rely on that context and name the source. If the context does not answer it and you are not sure, say you are not sure and say how to check. Never invent a fact, a link, a number or a quote.
- Default to India's context (law, helplines, culture), and cover other countries when asked.
- Help people find things on the site. Link only to pages named in the context or in this list, with markdown like [Help and guides](/help/): /learn/ (every letter explained), /science/, /library/, /timeline/, /myths/, /stories/, /voices/, /watch/, /india/ (data on violence, discrimination and law in India and the world), /news/ (headlines), /help/ (helplines, coming out, parents, allies, rights), /students/ (study abroad, scholarships, safer countries), /therapies/, /sound/, /games/, /privacy/ (staying safe on a shared device), /connect/.
- Crisis: if someone may hurt themselves or is in danger, be gentle, stay with them, and give: emergency 112; Tele-MANAS 14416 (free, 24/7, many languages); iCALL 9152987821. Ask if they are safe right now. Do not lecture.
- Coming out and safety: never push anyone to come out. Their safety and timing come first. Mention the Quick exit button and /privacy/ if they share a device.
- Orientation and gender identity are not a choice and not an illness, and conversion practices harm people. Say this plainly when it comes up.
- Refuse to help out, track, harass or shame anyone, and refuse sexual content. Say no kindly and offer something useful instead.
- General questions about the world, life, study and work are welcome. Answer them honestly and simply.`;

const CORS = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || "https://shiningforever.in,https://www.shiningforever.in").split(",").map((s) => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin || "");
  return { "access-control-allow-origin": ok ? origin : allowed[0], "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400", vary: "origin" };
};
const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const timeout = (ms) => AbortSignal.timeout(ms);

// a simple fixed-window limit per visitor, kept in a KV namespace called LIMITS when one is bound
async function limited(request, env) {
  if (!env.LIMITS) return false;
  const ip = request.headers.get("cf-connecting-ip") || "x", slot = Math.floor(Date.now() / 600000), k = `r:${ip}:${slot}`;
  const n = +(await env.LIMITS.get(k)) || 0;
  if (n >= +(env.LIMIT_PER_10_MIN || 20)) return true;
  await env.LIMITS.put(k, String(n + 1), { expirationTtl: 900 });
  return false;
}

function clean(messages) {
  if (!Array.isArray(messages)) return null;
  const out = messages.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (out.length && out[0].role !== "user") out.shift();
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

/* ---- context: the site's own pages and headlines, then optional web results ---- */
const STOP = new Set("the a an and or of to in on for is are was be i me my you your it this that with what how do does can will about from at as by we please tell give".split(" "));
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
async function siteJson(env, path) {
  const base = (env.SITE_URL || "https://shiningforever.in").replace(/\/+$/, "");
  try { const r = await fetch(`${base}/${path}`, { signal: timeout(4000), cf: { cacheTtl: 1800, cacheEverything: true } }); return r.ok ? await r.json() : null; } catch { return null; }
}
const FRESH = /\b(today|tonight|yesterday|latest|current|currently|recent|recently|news|headline|this (week|month|year)|right now|now|202\d|deadline|apply|price|cost|won|winner|score|result|law|bill|court|ruling|verdict|passed|banned|announce)\b/i;
const PERSONAL = /\b(i|i'm|im|i've|ive|i'd|my|me|myself|mine|we|our|mera|meri|mere|mujhe|main)\b/i;
async function buildContext(env, question) {
  const parts = [];
  const pages = await siteJson(env, "assets/data/search.json");
  if (Array.isArray(pages)) {
    const ws = words(question);
    const hits = pages.map((p) => { const t = words(p.t), d = words(p.d), h = words(p.h.join(" ")); let s = 0; for (const w of ws) { if (t.includes(w)) s += 5; if (h.includes(w)) s += 3; if (d.includes(w)) s += 2; } return { p, s }; }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
    if (hits.length) parts.push("Pages on this site that may help:\n" + hits.map((x) => `- ${x.p.t}: /${x.p.u} (${x.p.d.slice(0, 140)})`).join("\n"));
  }
  if (/\b(news|headline|today|latest|recent|happening|this week)\b/i.test(question)) {
    const news = await siteJson(env, "assets/data/news.json");
    const g = news?.groups;
    if (g) {
      const take = [...(g.india || []).slice(0, 5), ...(g.world || []).slice(0, 4), ...(g.good || []).slice(0, 2)];
      if (take.length) parts.push(`Headlines gathered by the site (updated ${String(news.updated || "").slice(0, 10)}). These are headlines, not verified facts:\n` + take.map((x) => `- ${x.t} (${x.s}, ${String(x.d).slice(0, 10)}) ${x.u}`).join("\n"));
    }
  }
  let sources = [];
  // A personal message ("I am scared my parents...") is never sent to a web search, only general questions about fresh facts are.
  if (env.TAVILY_API_KEY && FRESH.test(question) && !PERSONAL.test(question)) {
    try {
      const r = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.TAVILY_API_KEY}` }, body: JSON.stringify({ query: question.slice(0, 300), max_results: 4, search_depth: "basic" }), signal: timeout(6000) });
      if (r.ok) { const j = await r.json(); const res = (j.results || []).slice(0, 4); sources = res.map((x) => ({ title: String(x.title || x.url).slice(0, 90), url: x.url })); if (res.length) parts.push("Web results (cite the source name when you use one):\n" + res.map((x) => `- ${x.title} (${x.url}): ${String(x.content || "").slice(0, 350)}`).join("\n")); }
    } catch { /* the answer can go ahead without web results */ }
  }
  return { text: parts.join("\n\n"), sources };
}

/* ---- the free providers, tried in order ---- */
const openaiChat = async (url, key, model, system, messages, extraHeaders = {}) => {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}`, ...extraHeaders }, body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], max_tokens: 700, temperature: 0.6 }), signal: timeout(20000) });
  if (!r.ok) throw new Error("status " + r.status);
  const j = await r.json(); const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty");
  return { text: String(text).replace(/<think>[\s\S]*?<\/think>/g, "").trim(), sources: [] };
};
const PROVIDERS = {
  gemini: {
    ready: (env) => !!env.GEMINI_API_KEY,
    async run(env, system, messages) {
      const model = env.GEMINI_MODEL || "gemini-2.5-flash";
      const body = { systemInstruction: { parts: [{ text: system }] }, contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 800, temperature: 0.6 } };
      if (env.GEMINI_SEARCH === "on") body.tools = [{ google_search: {} }];
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: JSON.stringify(body), signal: timeout(20000) });
      if (!r.ok) throw new Error("status " + r.status);
      const j = await r.json(); const c = j.candidates?.[0];
      const text = (c?.content?.parts || []).filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
      if (!text) throw new Error("empty");
      const sources = (c?.groundingMetadata?.groundingChunks || []).map((g) => g.web).filter((w) => w?.uri).slice(0, 4).map((w) => ({ title: String(w.title || w.uri).slice(0, 90), url: w.uri }));
      return { text, sources };
    }
  },
  groq: {
    ready: (env) => !!env.GROQ_API_KEY,
    run: (env, system, messages) => openaiChat("https://api.groq.com/openai/v1/chat/completions", env.GROQ_API_KEY, env.GROQ_MODEL || "llama-3.3-70b-versatile", system, messages)
  },
  workersai: {
    ready: (env) => !!env.AI,
    async run(env, system, messages) {
      const out = await env.AI.run(env.WORKERS_AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: [{ role: "system", content: system }, ...messages], max_tokens: 700, temperature: 0.6 });
      const text = typeof out === "string" ? out : out?.response || out?.choices?.[0]?.message?.content;
      if (!text) throw new Error("empty");
      return { text: String(text).trim(), sources: [] };
    }
  },
  openrouter: {
    ready: (env) => !!env.OPENROUTER_API_KEY && !!env.OPENROUTER_MODEL,
    run: (env, system, messages) => openaiChat("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL, system, messages, { "x-title": "Who We Are helper" })
  },
  anthropic: {
    ready: (env) => !!env.ANTHROPIC_API_KEY,
    async run(env, system, messages) {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 700, system, messages }), signal: timeout(25000) });
      if (!r.ok) throw new Error("status " + r.status);
      const j = await r.json(); const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (!text) throw new Error("empty");
      return { text, sources: [] };
    }
  }
};

async function answer(env, system, messages) {
  const order = (env.PROVIDERS || "groq,workersai").split(",").map((s) => s.trim()).filter((n) => PROVIDERS[n]?.ready(env));
  for (const name of order) { try { const r = await PROVIDERS[name].run(env, system, messages); return { ...r, provider: name }; } catch { /* the next provider takes over */ } }
  return null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "", cors = CORS(origin, env), url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const configured = (env.PROVIDERS || "groq,workersai").split(",").map((x) => x.trim()).filter((n) => PROVIDERS[n]?.ready(env));
    if (url.pathname === "/health") return json({ ok: true, chat: configured.length > 0, providers: configured, search: !!env.TAVILY_API_KEY || (configured.includes("gemini") && env.GEMINI_SEARCH === "on") }, 200, cors);
    if (url.pathname !== "/chat" || request.method !== "POST") return json({ error: "Not found" }, 404, cors);
    if (!configured.length) return json({ error: "The helper is not switched on yet." }, 503, cors);
    if (origin && !cors["access-control-allow-origin"].includes(origin)) return json({ error: "Not allowed from here." }, 403, cors);
    let body; try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400, cors); }
    const messages = clean(body.messages); if (!messages) return json({ error: "Say something first." }, 400, cors);
    if (await limited(request, env)) return json({ error: "That is a lot of messages in a short time. Please try again in a few minutes." }, 429, cors);
    const page = typeof body.page === "string" ? body.page.slice(0, 80) : "";
    const question = messages[messages.length - 1].content;
    const ctx = await buildContext(env, question);
    const system = SYSTEM + (page ? `\nThe person is currently on this page of the site: ${page}` : "") + (ctx.text ? `\n\nContext:\n${ctx.text}` : "");
    const out = await answer(env, system, messages);
    if (!out) return json({ error: "The helper is having trouble right now. Please try again in a little while." }, 502, cors);
    const seen = new Set(), sources = [];
    for (const s of [...(out.sources || []), ...ctx.sources]) if (s.url && !seen.has(s.url) && sources.length < 4) { seen.add(s.url); sources.push(s); }
    return json({ reply: out.text || "I do not have an answer for that. Try rephrasing, or look at the Help page.", sources }, 200, cors);
  }
};
