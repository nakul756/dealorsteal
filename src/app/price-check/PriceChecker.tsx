"use client";

import { useState } from "react";
import { AREAS, areaBySlug, assess, formatAED, type Listing } from "@/lib/data";
import { VerdictBadge } from "@/components/VerdictBadge";

const field = "w-full rounded-lg glass border border-line px-4 py-3 text-sm text-ink focus:border-gold outline-none";

export function PriceChecker() {
  const [area, setArea] = useState("dubai-marina");
  const [type, setType] = useState<Listing["type"]>("Apartment");
  const [sqft, setSqft] = useState("1200");
  const [price, setPrice] = useState("2600000");
  const [result, setResult] = useState<ReturnType<typeof assess> | null>(null);

  const run = () => {
    const s = Number(sqft), p = Number(price);
    if (s > 0 && p > 0) setResult(assess(area, s, p, type));
  };

  const a = areaBySlug(area);

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="glass border border-line rounded-2xl p-8 space-y-5 self-start"
      >
        <label className="block space-y-2">
          <span className="eyebrow">Community</span>
          <select className={field} value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="eyebrow">Property type</span>
          <select className={field} value={type} onChange={(e) => setType(e.target.value as Listing["type"])}>
            {["Apartment", "Penthouse", "Townhouse", "Villa"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-2">
            <span className="eyebrow">Size (sq ft)</span>
            <input className={field} inputMode="numeric" value={sqft} onChange={(e) => setSqft(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="block space-y-2">
            <span className="eyebrow">Asking (AED)</span>
            <input className={field} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
        <button className="w-full bg-gold hover:bg-gold-soft text-ink rounded-lg text-sm font-semibold py-4">
          Check the price
        </button>
      </form>

      <div className="glass border border-line rounded-2xl p-8 min-h-80">
        {!result ? (
          <div className="h-full grid place-items-center text-center text-muted">
            <div>
              <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-2">Your verdict appears here</p>
              <p className="text-sm">{a.name} median: AED {a.pricePerSqft.toLocaleString()} / sq ft</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <VerdictBadge verdict={result.verdict} diffPct={result.diffPct} large />
            <p className="font-display font-semibold tracking-[-0.02em] text-3xl leading-tight">
              {result.verdict === "Overpriced"
                ? `About ${result.diffPct.toFixed(0)}% above market.`
                : result.verdict === "Steal"
                  ? `About ${Math.abs(result.diffPct).toFixed(0)}% below market.`
                  : "Priced in line with the market."}
            </p>
            <div className="grid grid-cols-3 gap-4 border-y border-line py-6">
              <div><p className="text-xs text-muted">Fair low</p><p className="font-display font-semibold tracking-[-0.02em] text-xl">{formatAED(result.low)}</p></div>
              <div><p className="text-xs text-gold-ink">Fair mid</p><p className="font-display font-semibold tracking-[-0.02em] text-xl text-gold-ink">{formatAED(result.mid)}</p></div>
              <div><p className="text-xs text-muted">Fair high</p><p className="font-display font-semibold tracking-[-0.02em] text-xl">{formatAED(result.high)}</p></div>
            </div>
            <ul className="text-sm text-ink/80 space-y-2">
              <li>• Asking AED {Math.round(Number(price) / Number(sqft)).toLocaleString()} / sq ft vs area median AED {a.pricePerSqft.toLocaleString()}</li>
              <li>• Estimated gross rental yield: {result.yieldPct.toFixed(1)}% (area average {a.grossYield}%)</li>
              <li>• {a.name} prices are up {a.yoy}% year on year</li>
            </ul>
            <p className="text-xs text-muted">Estimate only — not an official RERA valuation.</p>
          </div>
        )}
      </div>
    </section>
  );
}
