"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LISTINGS, areaBySlug, assess, bedsLabel, formatAED, type Verdict } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

const BADGE: Record<Verdict, { label: string; cls: string; marker: string }> = {
  Steal: { label: "STEAL", cls: "bg-good text-white", marker: "bg-good" },
  Fair: { label: "FAIR", cls: "bg-gold text-ink", marker: "bg-gold" },
  Overpriced: { label: "OVERPRICED", cls: "bg-warn text-white", marker: "bg-warn" },
};

const CYCLE_MS = 3200;

/** Listings interleaved by verdict so consecutive cards tend to differ. */
function useCycleItems() {
  return useMemo(() => {
    const scored = LISTINGS.map((l) => ({ l, a: assess(l.area, l.sqft, l.price, l.type) }));
    const groups = (["Steal", "Overpriced", "Fair"] as Verdict[]).map((v) => scored.filter((x) => x.a.verdict === v));
    const out: typeof scored = [];
    for (let i = 0; out.length < scored.length; i++) for (const g of groups) if (g[i]) out.push(g[i]);
    return out;
  }, []);
}

export function VerdictCard() {
  const items = useCycleItems();
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  // 0 = marker parked at fair mid, 1 = marker slides to asking price, 2 = verdict badge flips in
  const [stage, setStage] = useState(0);

  const { l, a } = items[idx];
  const next = items[(idx + 1) % items.length];

  // Advance through the listings.
  useEffect(() => {
    if (reduced || paused) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % items.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, reduced, items.length]);

  // Animate the meter, then the badge, each time the listing changes.
  useEffect(() => {
    if (reduced) {
      setStage(2);
      return;
    }
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 120);
    const t2 = setTimeout(() => setStage(2), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [idx, reduced]);

  // Warm the cache for the next photo so the swap is instant.
  useEffect(() => {
    const img = new Image();
    img.src = next.l.image;
  }, [next.l.image]);

  const min = Math.min(a.low * 0.9, l.price * 0.95);
  const max = Math.max(a.high * 1.1, l.price * 1.05);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const markerAt = stage === 0 ? pct(a.mid) : pct(l.price);
  const badge = BADGE[a.verdict];
  const diff = `${a.diffPct > 0 ? "+" : ""}${a.diffPct.toFixed(0)}% vs fair value`;

  return (
    <div
      className="relative w-full max-w-md rounded-[2rem] glass border border-white/70 shadow-2xl shadow-amber-950/10 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-[16/10] img-fallback overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={l.id}
          src={l.image}
          alt={l.title}
          className={`text-transparent absolute inset-0 h-full w-full object-cover ${reduced ? "" : "animate-fade-in"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/5 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-[0.7rem] font-medium text-ink/90">
          <span className={`h-1.5 w-1.5 rounded-full bg-good ${reduced ? "" : "animate-pulse"}`} />
          Live verdict
        </div>
        <div className="absolute top-3 right-3 [perspective:600px]" aria-live="polite">
          {stage === 2 && (
            <span
              key={l.id}
              className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold tracking-[0.08em] ${badge.cls} ${reduced ? "" : "animate-badge-flip"}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 relative">
        <p className="text-xs text-muted">
          {areaBySlug(l.area).name} · {bedsLabel(l.beds)} · {l.sqft.toLocaleString()} sq ft
        </p>
        <Link href={`/properties/${l.id}`} className="block mt-1 font-display text-xl font-semibold text-ink hover:text-gold-ink truncate">
          {l.title}
        </Link>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-semibold tabular">{formatAED(l.price)}</p>
          <p className={`text-xs tabular transition-opacity duration-300 ${stage === 2 ? "opacity-100" : "opacity-0"} ${a.verdict === "Steal" ? "text-good" : a.verdict === "Overpriced" ? "text-warn" : "text-gold-ink"}`}>
            {diff}
          </p>
        </div>

        {/* Price meter */}
        <div className="mt-7 mb-1">
          <div className="relative h-2 rounded-full bg-panel-2">
            <div
              className="absolute inset-y-0 rounded-full bg-gold/30 ring-1 ring-gold/60 transition-all duration-700 ease-out"
              style={{ left: `${pct(a.low)}%`, width: `${pct(a.high) - pct(a.low)}%` }}
            />
            <div className="absolute -top-1 h-4 w-px bg-gold/70" style={{ left: `${pct(a.mid)}%` }} />
            <div
              className={`absolute -top-2 h-6 w-1.5 -ml-[3px] rounded-full ring-2 ring-panel ${stage === 2 ? badge.marker : "bg-ink"} ${
                reduced ? "" : "transition-[left,background-color] duration-[850ms] ease-[cubic-bezier(0.3,1.25,0.5,1)]"
              }`}
              style={{ left: `${markerAt}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex justify-between text-[0.7rem] text-muted tabular">
            <span>{formatAED(a.low)}</span>
            <span className="text-gold-ink/90">Fair range</span>
            <span>{formatAED(a.high)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-1.5" aria-hidden>
          {items.map((x, i) => (
            <span key={x.l.id} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === idx ? "bg-gold" : "bg-ink/10"}`} />
          ))}
        </div>
        <p className="sr-only">
          {l.title}, asking {formatAED(l.price)}. Fair range {formatAED(a.low)} to {formatAED(a.high)}. Verdict: {a.verdict}, {diff}.
        </p>
      </div>
    </div>
  );
}
