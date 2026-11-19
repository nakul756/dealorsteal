import { runAgent } from "@/lib/agent";
import { LISTINGS, assess, areaBySlug, type Listing } from "@/lib/data";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/session";
import { VIEWING_SLOTS } from "@/lib/validation";

type Turn = { role: "user" | "assistant"; content: string };

const BOOK_RE = /book .*viewing|book a viewing|schedule (a )?viewing|arrange (a )?viewing/i;

/** Latest listing named in the message, else in the conversation (most recent first). */
function findListing(message: string, history: Turn[]): Listing | undefined {
  const named = (t: string) => {
    const s = t.toLowerCase();
    // Prefer the listing named last in the text (e.g. "My pick: X").
    let best: { l: Listing; at: number } | undefined;
    for (const l of LISTINGS) {
      const at = s.lastIndexOf(l.title.toLowerCase());
      if (at >= 0 && (!best || at > best.at)) best = { l, at };
    }
    return best?.l;
  };
  return named(message) ?? [...history].reverse().map((h) => named(h.content)).find(Boolean);
}

// POST { message: string, history?: {role, content}[] }
// Works offline with the built-in rule-based agent.
// Set ANTHROPIC_API_KEY in .env.local to have an LLM write the reply from the same grounded data.
export async function POST(req: Request) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "";
  const history: Turn[] = Array.isArray(body.history)
    ? body.history
        .filter((h): h is Turn => !!h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
        .slice(-12)
    : [];
  if (!message.trim()) return Response.json({ error: "Empty message" }, { status: 400 });

  if (BOOK_RE.test(message)) return bookViewing(message, history);

  const base = runAgent(message);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json(base);

  try {
    const context = base.listingIds.map((id) => {
      const l = LISTINGS.find((x) => x.id === id)!;
      const a = assess(l.area, l.sqft, l.price, l.type);
      return { ...l, areaName: areaBySlug(l.area).name, fairMid: a.mid, verdict: a.verdict, diffPct: +a.diffPct.toFixed(1), yieldPct: +a.yieldPct.toFixed(1) };
    });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.AGENT_MODEL ?? "claude-sonnet-5-5",
        max_tokens: 500,
        system:
          "You are Deal or Steal, a concise, friendly Dubai property agent. Only use the listings and numbers provided in CONTEXT; never invent prices. Mention each listing's fair-price verdict. Keep replies under 120 words and end with one helpful next step. Prices are estimates, not official valuations.",
        messages: [...history.slice(-6), { role: "user", content: `${message}\n\nCONTEXT:\n${JSON.stringify(context)}` }],
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return Response.json(text ? { ...base, reply: text } : base);
  } catch {
    return Response.json(base);
  }
}

async function bookViewing(message: string, history: Turn[]) {
  const listing = findListing(message, history);
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({
      reply: `Happy to set that up${listing ? ` for ${listing.title}` : ""}. Browsing is free, but I need you to sign in before I book a viewing — that way the listing agent knows who's coming and you can track it in your account.`,
      listingIds: listing ? [listing.id] : [],
      suggestions: ["Show comparable sales", "Find similar options"],
      needsAuth: true,
    });
  }

  if (!listing) {
    return Response.json({
      reply: "Which property would you like to view? Tell me its name, or open it and use “Book a viewing”.",
      listingIds: [],
      suggestions: ["2-bed in Dubai Marina under 3M", "Villa on the Palm", "Best areas for rental yield"],
    });
  }

  const slot = VIEWING_SLOTS.find((s) => message.toLowerCase().includes(s.toLowerCase())) ?? VIEWING_SLOTS[0];
  getDb().insert(schema.viewings).values({ userId: user.id, listingId: listing.id, slot, note: "Booked via the AI agent" }).run();

  return Response.json({
    reply: `Done, ${user.name.split(" ")[0]} — I've requested a viewing of ${listing.title} for ${slot}. The listing agent will confirm${
      user.phone ? ` on WhatsApp at ${user.phone}` : " by email"
    }. Anything else you'd like me to check before then?`,
    listingIds: [listing.id],
    suggestions: ["Show comparable sales", "Find similar options", "What's the rental yield?"],
    links: [{ href: "/account?tab=viewings", label: "See my viewings" }],
  });
}
