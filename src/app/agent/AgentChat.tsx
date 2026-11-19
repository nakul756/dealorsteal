"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LISTINGS, assess, areaBySlug, bedsLabel, formatAED } from "@/lib/data";
import { VerdictBadge } from "@/components/VerdictBadge";
import { saveDraft, takeDraft, useAuthGate, useResumeIntent } from "@/components/auth/AuthGate";

type Msg = {
  role: "user" | "assistant";
  content: string;
  listingIds?: string[];
  suggestions?: string[];
  /** Set when the agent needs the user to sign in before it can act (e.g. booking). */
  needsAuth?: { retry: string };
  links?: { href: string; label: string }[];
};

const starters = [
  "2-bed in Dubai Marina under 3M near the metro",
  "Which area has the best rental yield?",
  "Family townhouse in Dubai Hills",
  "Studio in JVC for investment",
];

const BOOK_INTENT = "agent-book";

export function AgentChat() {
  const params = useSearchParams();
  const { requireAuth } = useAuthGate();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your Deal or Steal agent. Tell me what you're looking for — area, budget, bedrooms, anything that matters to you — and I'll find homes and check every price against recent DLD sales.",
      suggestions: starters,
    },
  ]);
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastQ = useRef<string | null>(null);

  async function send(text: string) {
    if (!text.trim() || busyRef.current) return;
    const history = msgsRef.current.map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    busyRef.current = true;
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          listingIds: data.listingIds,
          suggestions: data.suggestions,
          needsAuth: data.needsAuth ? { retry: text } : undefined,
          links: data.links,
        },
      ]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Sorry — I couldn't reach the server. Please try again." }]);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  function signInThenRetry(retry: string) {
    saveDraft(BOOK_INTENT, { retry });
    requireAuth(BOOK_INTENT, () => send(retry), "Sign in so the agent can book this viewing for you.");
  }

  // Returning from Google / the sign-in page: replay the booking request.
  useResumeIntent(BOOK_INTENT, () => {
    const d = takeDraft<{ retry: string }>(BOOK_INTENT);
    if (d?.retry) void send(d.retry);
  });

  // ?q= from the hero search or elsewhere. Track the last one sent: with cacheComponents the page
  // stays mounted (inside <Activity>) between visits, so a new ?q= must still be picked up.
  useEffect(() => {
    const q = params.get("q");
    if (q && q !== lastQ.current) {
      lastQ.current = q;
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, busy]);

  const last = msgs[msgs.length - 1];

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 pt-12 pb-6 flex flex-col min-h-[calc(100svh-4.5rem)]">
      <div className="mb-8">
        <p className="eyebrow mb-3">AI property agent</p>
        <h1 className="text-4xl md:text-5xl leading-[1.05]">What are you looking for?</h1>
      </div>

      <div className="flex-1 space-y-6">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-panel-2 border border-line px-4 py-3 text-sm">{m.content}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-gold/60 text-gold-ink grid place-items-center text-xs">◇</span>
                  <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-line">{m.content}</p>
                </div>
                {(m.needsAuth || m.links?.length) && (
                  <div className="pl-10 flex flex-wrap gap-2">
                    {m.needsAuth && (
                      <button
                        onClick={() => signInThenRetry(m.needsAuth!.retry)}
                        className="rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-4 py-2.5"
                      >
                        Sign in to book
                      </button>
                    )}
                    {m.links?.map((l) => (
                      <Link key={l.href} href={l.href} className="rounded-lg border border-gold/60 text-gold-ink hover:bg-gold/10 text-sm font-medium px-4 py-2.5">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
                {m.listingIds && m.listingIds.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-3 pl-10">
                    {m.listingIds.map((id) => {
                      const l = LISTINGS.find((x) => x.id === id);
                      if (!l) return null;
                      const a = assess(l.area, l.sqft, l.price, l.type);
                      return (
                        <Link key={id} href={`/properties/${id}`} className="glass border border-line rounded-xl overflow-hidden hover:border-gold/60 block">
                          <div className="relative aspect-[16/10] img-fallback">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={l.image} alt={l.title} className="text-transparent absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute top-2 right-2">
                              <VerdictBadge verdict={a.verdict} diffPct={a.diffPct} />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="font-display font-semibold tracking-[-0.02em] leading-tight">{l.title}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {bedsLabel(l.beds)} · {areaBySlug(l.area).name}
                            </p>
                            <p className="text-gold-ink font-display font-semibold mt-1 tabular">{formatAED(l.price)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex gap-3 items-center text-muted text-sm">
            <span className="h-7 w-7 rounded-full border border-gold/60 text-gold-ink grid place-items-center text-xs animate-pulse">◇</span>
            Checking DLD transactions…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-canvas pt-4 pb-2 mt-8">
        {last?.role === "assistant" && last.suggestions && !busy && (
          <div className="flex flex-wrap gap-2 mb-3">
            {last.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line hover:border-gold hover:text-gold-ink text-xs px-3 py-1.5 text-ink/80"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex rounded-xl overflow-hidden border border-line focus-within:border-gold glass"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1-bed in Business Bay under 1.6M, ready to move in"
            className="flex-1 min-w-0 bg-transparent px-4 sm:px-5 py-4 text-sm outline-none placeholder:text-muted"
            aria-label="Message the agent"
          />
          <button disabled={busy} className="m-1.5 rounded-full bg-gold hover:bg-gold-soft disabled:opacity-50 text-ink px-5 text-sm font-semibold">
            Send
          </button>
        </form>
        <p className="text-xs text-muted mt-2">Estimates based on DLD data. Not an official valuation or financial advice.</p>
      </div>
    </section>
  );
}
