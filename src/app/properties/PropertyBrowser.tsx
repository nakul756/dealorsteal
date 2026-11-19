"use client";

import { useMemo, useState } from "react";
import { AREAS, LISTINGS, assess, type Verdict } from "@/lib/data";
import { PropertyCard } from "@/components/PropertyCard";

const select =
  "rounded-lg glass border border-line px-4 py-3 text-sm text-ink focus:border-gold outline-none";

export function PropertyBrowser() {
  const [area, setArea] = useState("all");
  const [beds, setBeds] = useState("any");
  const [max, setMax] = useState("any");
  const [verdict, setVerdict] = useState<"all" | Verdict>("all");
  const [sort, setSort] = useState("best");

  const results = useMemo(() => {
    const r = LISTINGS.filter(
      (l) =>
        (area === "all" || l.area === area) &&
        (beds === "any" || (beds === "4" ? l.beds >= 4 : l.beds === Number(beds))) &&
        (max === "any" || l.price <= Number(max)) &&
        (verdict === "all" || assess(l.area, l.sqft, l.price, l.type).verdict === verdict),
    );
    return r.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return assess(a.area, a.sqft, a.price, a.type).diffPct - assess(b.area, b.sqft, b.price, b.type).diffPct;
    });
  }, [area, beds, max, verdict, sort]);

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        <select className={select} value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area">
          <option value="all">All areas</option>
          {AREAS.map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
        <select className={select} value={beds} onChange={(e) => setBeds(e.target.value)} aria-label="Bedrooms">
          <option value="any">Any beds</option>
          <option value="0">Studio</option>
          <option value="1">1 bed</option>
          <option value="2">2 beds</option>
          <option value="3">3 beds</option>
          <option value="4">4+ beds</option>
        </select>
        <select className={select} value={max} onChange={(e) => setMax(e.target.value)} aria-label="Max price">
          <option value="any">Any price</option>
          <option value="1000000">Up to AED 1M</option>
          <option value="2000000">Up to AED 2M</option>
          <option value="5000000">Up to AED 5M</option>
          <option value="15000000">Up to AED 15M</option>
        </select>
        <select className={select} value={verdict} onChange={(e) => setVerdict(e.target.value as "all" | Verdict)} aria-label="Price verdict">
          <option value="all">All verdicts</option>
          <option value="Steal">Steals only</option>
          <option value="Fair">Fair</option>
          <option value="Overpriced">Overpriced</option>
        </select>
        <select className={select} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="best">Best value first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <p className="text-xs text-muted mb-5">{results.length} properties</p>
      {results.length === 0 ? (
        <p className="text-muted py-20 text-center">No matches — try widening your filters, or ask the agent.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <PropertyCard key={l.id} l={l} />
          ))}
        </div>
      )}
    </section>
  );
}
