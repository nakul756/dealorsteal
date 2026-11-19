import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LISTINGS,
  areaBySlug,
  areaTrend,
  assess,
  bedsLabel,
  comparableSales,
  formatAED,
  listingById,
} from "@/lib/data";
import { VerdictBadge } from "@/components/VerdictBadge";
import { TrendChart } from "@/components/TrendChart";
import { PropertyActions } from "./PropertyActions";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

export default async function PropertyPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const l = listingById(id);
  if (!l) notFound();

  const area = areaBySlug(l.area);
  const a = assess(l.area, l.sqft, l.price, l.type);
  const comps = comparableSales(l);
  const askPerSqft = Math.round(l.price / l.sqft);
  const verdictText =
    a.verdict === "Overpriced"
      ? `Listed ${a.diffPct.toFixed(0)}% above what similar units in ${area.name} have sold for recently. There is room to negotiate — a fair offer sits around ${formatAED(a.mid)}.`
      : a.verdict === "Steal"
        ? `Listed ${Math.abs(a.diffPct).toFixed(0)}% below recent comparable sales in ${area.name}. Priced to move — worth viewing soon.`
        : `In line with recent comparable sales in ${area.name} (${a.diffPct > 0 ? "+" : ""}${a.diffPct.toFixed(1)}%). A reasonable asking price.`;

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-8">
      <Link href="/properties" className="text-sm text-muted hover:text-gold-ink">
        ← All properties
      </Link>

      <div className="mt-5 grid gap-3 lg:grid-cols-[2fr_1fr] lg:h-[480px]">
        <div className="img-fallback relative min-h-72 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.image} alt={l.title} className="text-transparent absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {l.gallery.map((g, i) => (
            <div key={i} className="img-fallback relative min-h-40 rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt={`${l.title} interior ${i + 1}`} className="text-transparent absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          <header>
            <p className="eyebrow mb-3">{l.building} · {area.name}</p>
            <h1 className="text-4xl md:text-5xl leading-[1.05]">{l.title}</h1>
            <p className="mt-4 text-muted">
              {bedsLabel(l.beds)} · {l.baths} baths · {l.sqft.toLocaleString()} sq ft · {l.type} · {l.status}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {l.features.map((f) => (
                <li key={f} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink/80">{f}</li>
              ))}
            </ul>
          </header>

          {/* FAIR PRICE ANALYSIS */}
          <section className="glass border border-line rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="eyebrow mb-2">Fair-price analysis</p>
                <h2 className="text-2xl">Is this a good price?</h2>
              </div>
              <VerdictBadge verdict={a.verdict} diffPct={a.diffPct} large />
            </div>
            <p className="text-ink/85 leading-relaxed border-l-2 border-gold pl-4 mb-8">{verdictText}</p>

            <PriceScale low={a.low} mid={a.mid} high={a.high} price={l.price} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
              <Stat label="Asking price" value={formatAED(l.price)} />
              <Stat label="Fair value (mid)" value={formatAED(a.mid)} />
              <Stat label="Asking / sq ft" value={`AED ${askPerSqft.toLocaleString()}`} />
              <Stat label="Area median / sq ft" value={`AED ${area.pricePerSqft.toLocaleString()}`} />
            </div>
          </section>

          {/* COMPS */}
          <section>
            <p className="eyebrow mb-2">Comparable sales</p>
            <h2 className="text-2xl mb-6">Recent transactions nearby</h2>
            <div className="overflow-x-auto border border-line rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-panel-2 text-xs font-medium text-muted">
                  <tr>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Building</th>
                    <th className="text-right p-4">Size</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-right p-4">AED / sq ft</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((c, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="p-4 text-muted">{c.date}</td>
                      <td className="p-4">{c.building}</td>
                      <td className="p-4 text-right">{c.sqft.toLocaleString()} sq ft</td>
                      <td className="p-4 text-right">{formatAED(c.price)}</td>
                      <td className="p-4 text-right text-gold-ink tabular">{c.perSqft.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted mt-3">Demo comparables. In production these come from the DLD transactions dataset.</p>
          </section>

          {/* TREND */}
          <section>
            <p className="eyebrow mb-2">Area trend</p>
            <h2 className="text-2xl mb-6">{area.name} — price per sq ft, last 12 months</h2>
            <div className="glass border border-line rounded-2xl p-6">
              <TrendChart data={areaTrend(l.area)} />
              <p className="text-sm text-muted mt-4">
                {area.name} prices are up <span className="text-good">{area.yoy}%</span> year on year.
              </p>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-28 self-start">
          <div className="glass border border-line rounded-2xl p-6 sm:p-7">
            <p className="text-sm text-muted">Asking price</p>
            <p className="font-display text-4xl font-semibold tracking-[-0.03em] text-gold-ink mt-1 tabular">{formatAED(l.price)}</p>
            <div className="mt-6 space-y-3 text-sm">
              <Row k="Est. annual rent" v={formatAED(a.annualRent)} />
              <Row k="Gross rental yield" v={`${a.yieldPct.toFixed(1)}%`} />
              <Row k={`${area.name} avg yield`} v={`${area.grossYield}%`} />
              <Row k="Near metro" v={l.nearMetro ? "Yes" : "No"} />
            </div>
            <PropertyActions id={l.id} title={l.title} price={l.price} fairMid={a.mid} fairLow={a.low} fairHigh={a.high} />
          </div>
          <Link href={`/agent?q=${encodeURIComponent(`Find something similar to ${l.title} but fairly priced`)}`} className="block rounded-2xl border border-line hover:border-gold p-5 text-sm">
            <span className="text-gold-ink">Ask the agent →</span>
            <span className="block text-muted mt-1">&quot;Find me something similar, but fairly priced&quot;</span>
          </Link>
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-xl font-semibold mt-1 tabular">{value}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-2">
      <span className="text-muted">{k}</span>
      <span className="tabular">{v}</span>
    </div>
  );
}

function PriceScale({ low, mid, high, price }: { low: number; mid: number; high: number; price: number }) {
  const min = Math.min(low * 0.9, price * 0.95);
  const max = Math.max(high * 1.1, price * 1.05);
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className="pt-8 pb-6">
      <div className="relative h-2 rounded-full bg-panel-2">
        <div className="absolute h-2 rounded-full bg-gold/30 ring-1 ring-gold/60" style={{ left: pos(low), width: `calc(${pos(high)} - ${pos(low)})` }} />
        <div className="absolute -top-8 -translate-x-1/2 text-xs font-medium text-gold-ink whitespace-nowrap" style={{ left: pos(mid) }}>
          Fair range
        </div>
        <div className="absolute -top-2 h-6 w-1 -ml-0.5 rounded-full bg-ink" style={{ left: pos(price) }} />
        <div className="absolute top-6 -translate-x-1/2 text-xs whitespace-nowrap" style={{ left: pos(price) }}>
          Asking {formatAED(price)}
        </div>
      </div>
      <div className="flex justify-between text-[0.7rem] text-muted mt-10">
        <span>Low {formatAED(low)}</span>
        <span>High {formatAED(high)}</span>
      </div>
    </div>
  );
}
