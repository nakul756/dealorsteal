import { AREAS, areaTrend } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { TrendChart } from "@/components/TrendChart";

export const metadata = { title: "Market Insights — Deal or Steal" };

export default function InsightsPage() {
  const byPrice = [...AREAS].sort((a, b) => b.pricePerSqft - a.pricePerSqft);
  const byYield = [...AREAS].sort((a, b) => b.grossYield - a.grossYield);
  const maxPrice = byPrice[0].pricePerSqft;
  const maxYield = byYield[0].grossYield;
  const avgYield = AREAS.reduce((s, a) => s + a.grossYield, 0) / AREAS.length;

  return (
    <>
      <PageHeader
        eyebrow="Market insights"
        title="Dubai at a glance"
        intro="Price per square foot, rental yields and momentum across Dubai's most traded communities."
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Avg gross yield", `${avgYield.toFixed(1)}%`],
            ["Highest yield", `${byYield[0].name}`],
            ["Most traded", [...AREAS].sort((a, b) => b.transactions12m - a.transactions12m)[0].name],
            ["Fastest growth", [...AREAS].sort((a, b) => b.yoy - a.yoy)[0].name],
          ].map(([k, v]) => (
            <div key={k} className="glass border border-line rounded-2xl p-6">
              <p className="text-xs text-muted">{k}</p>
              <p className="font-display font-semibold tracking-[-0.02em] text-2xl mt-2 text-gold-ink">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass border border-line rounded-2xl p-8">
            <p className="eyebrow mb-2">Price per sq ft (AED)</p>
            <h2 className="text-2xl mb-6">Most to least expensive</h2>
            <ul className="space-y-3">
              {byPrice.map((a) => (
                <li key={a.slug} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-sm">
                  <span className="text-ink/85 truncate">{a.name}</span>
                  <span className="h-2 bg-panel-2"><span className="block h-2 bg-gold" style={{ width: `${(a.pricePerSqft / maxPrice) * 100}%` }} /></span>
                  <span className="text-right">{a.pricePerSqft.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass border border-line rounded-2xl p-8">
            <p className="eyebrow mb-2">Gross rental yield</p>
            <h2 className="text-2xl mb-6">Best areas for income</h2>
            <ul className="space-y-3">
              {byYield.map((a) => (
                <li key={a.slug} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-sm">
                  <span className="text-ink/85 truncate">{a.name}</span>
                  <span className="h-2 bg-panel-2"><span className="block h-2 bg-good" style={{ width: `${(a.grossYield / maxYield) * 100}%` }} /></span>
                  <span className="text-right">{a.grossYield}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {["dubai-marina", "jvc"].map((slug) => {
            const a = AREAS.find((x) => x.slug === slug)!;
            return (
              <div key={slug} className="glass border border-line rounded-2xl p-8">
                <p className="eyebrow mb-2">12-month trend</p>
                <h2 className="text-2xl mb-4">{a.name} <span className="text-good text-xl">+{a.yoy}%</span></h2>
                <TrendChart data={areaTrend(slug)} height={200} />
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-panel-2 text-xs font-medium text-muted">
              <tr>
                <th className="text-left p-4">Community</th>
                <th className="text-right p-4">AED / sq ft</th>
                <th className="text-right p-4">YoY</th>
                <th className="text-right p-4">Gross yield</th>
                <th className="text-right p-4">Avg 1BR rent</th>
                <th className="text-right p-4">Sales (12m)</th>
                <th className="text-left p-4 hidden md:table-cell">Profile</th>
              </tr>
            </thead>
            <tbody>
              {byPrice.map((a) => (
                <tr key={a.slug} className="border-t border-line">
                  <td className="p-4">{a.name}</td>
                  <td className="p-4 text-right">{a.pricePerSqft.toLocaleString()}</td>
                  <td className="p-4 text-right text-good">+{a.yoy}%</td>
                  <td className="p-4 text-right">{a.grossYield}%</td>
                  <td className="p-4 text-right">AED {(a.avgRent1BR / 1000).toFixed(0)}K</td>
                  <td className="p-4 text-right">{a.transactions12m.toLocaleString()}</td>
                  <td className="p-4 text-muted hidden md:table-cell">{a.vibe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Benchmarks are illustrative 2026 figures compiled from public market reports; swap in values computed from the
          DLD open-data CSVs for production.
        </p>
      </section>
    </>
  );
}
