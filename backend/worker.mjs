// The site's backend: one small Cloudflare Worker. The website itself stays static on GitHub Pages; this only answers the
// helper chat (POST /chat) and says it is alive (GET /health). It holds the API key so the key never reaches a browser.
// Setup is in backend/README.md. Nothing the visitor types is stored here.

const SYSTEM = `You are the helper on "Who We Are" (shiningforever.in), a calm, research-backed site for understanding LGBTQIA+ lives, made in India. People may be scared, lonely, curious, or just looking for a page.

How to answer:
- Be warm, plain and short. Usually under 150 words. Write like a kind friend who knows things, not like a brochure. No headings, no slogans, no long lists unless asked. Never use em dashes.
- Reply in the language the person writes in. If they write Hinglish, answer in Hinglish.
- You are an AI helper, not a person, a doctor, a therapist or a lawyer. Say so if asked or if it matters. Never claim to be human.
- Facts must be correct. For anything recent (news, laws, court cases, dates, prices, scholarship deadlines) use web search and name the source. If you are not sure, say you are not sure and say how to check. Do not guess.
- Default to India's context (law, helplines, culture), and cover other countries when asked.
- Help people find things on the site. Pages: /learn/ (every letter explained), /science/ (what research shows), /library/ (papers), /timeline/, /myths/, /stories/, /voices/, /watch/, /india/ (data on violence, discrimination and law in India and the world), /news/ (today's headlines), /help/ (helplines, coming out, parents, allies, rights), /students/ (study abroad, scholarships, safer countries), /therapies/, /sound/, /games/, /privacy/ (staying safe on a shared device), /connect/. Link with markdown like [Help and guides](/help/).
- Crisis: if someone may hurt themselves or is in danger, be gentle, stay with them, and give: emergency 112; Tele-MANAS 14416 (free, 24/7, many languages); iCALL 9152987821. Ask if they are safe right now. Do not lecture.
- Coming out and safety: never push anyone to come out. Their safety and timing come first. Mention the Quick exit button and /privacy/ if they share a device.
- Orientation and gender identity are not a choice and not an illness, and conversion practices harm people. Say this plainly when it comes up, with a source if asked.
- Refuse to help out, track, harass or shame anyone, and refuse sexual content. Say no kindly and offer something useful instead.
- General questions about the world, life, study and work are welcome. Answer them honestly and simply.`;

const CORS = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || "https://shiningforever.in,https://www.shiningforever.in").split(",").map((s) => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin || "");
  return { "access-control-allow-origin": ok ? origin : allowed[0], "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400", vary: "origin" };
};
const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "", cors = CORS(origin, env), url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/health") return json({ ok: true, chat: !!env.ANTHROPIC_API_KEY }, 200, cors);
    if (url.pathname !== "/chat" || request.method !== "POST") return json({ error: "Not found" }, 404, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "The helper is not switched on yet." }, 503, cors);
    if (origin && !cors["access-control-allow-origin"].includes(origin)) return json({ error: "Not allowed from here." }, 403, cors);
    let body; try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400, cors); }
    const messages = clean(body.messages); if (!messages) return json({ error: "Say something first." }, 400, cors);
    if (await limited(request, env)) return json({ error: "That is a lot of messages in a short time. Please try again in a few minutes." }, 429, cors);
    const page = typeof body.page === "string" ? body.page.slice(0, 80) : "";
    const req = {
      model: env.CHAT_MODEL || "claude-sonnet-5-5",
      max_tokens: 700,
      system: SYSTEM + (page ? `\nThe person is currently on this page of the site: ${page}` : ""),
      messages,
      tools: env.WEB_SEARCH === "off" ? [] : [{ type: env.WEB_SEARCH_TOOL || "web_search_20250305", name: "web_search", max_uses: 3 }]
    };
    if (!req.tools.length) delete req.tools;
    let r;
    try { r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify(req) }); }
    catch { return json({ error: "The helper could not be reached. Please try again." }, 502, cors); }
    if (!r.ok) return json({ error: "The helper is having trouble right now. Please try again in a little while." }, 502, cors);
    const data = await r.json();
    const blocks = Array.isArray(data.content) ? data.content : [];
    const reply = blocks.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const sources = [], seen = new Set();
    for (const b of blocks) for (const c of b.citations || []) if (c.url && !seen.has(c.url) && sources.length < 4) { seen.add(c.url); sources.push({ title: String(c.title || c.url).slice(0, 90), url: c.url }); }
    return json({ reply: reply || "I do not have an answer for that. Try rephrasing, or look at the Help page.", sources }, 200, cors);
  }
};
