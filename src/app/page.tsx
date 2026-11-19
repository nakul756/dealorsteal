import Link from "next/link";
import { AREAS, IMAGES, LISTINGS } from "@/lib/data";
import { PropertyCard } from "@/components/PropertyCard";
import { HeroSearch } from "./_home/HeroSearch";
import { VerdictCard } from "./_home/VerdictCard";
import { AreaTicker } from "./_home/AreaTicker";

const services = [
  { icon: "◇", title: "AI property agent", text: "Describe your dream home in plain words. The agent searches, shortlists and explains." },
  { icon: "▣", title: "Fair-price check", text: "Every listing compared with real DLD transactions for similar units nearby." },
  { icon: "◫", title: "Market insights", text: "Price per sq ft, rental yields and trends across Dubai's key communities." },
  { icon: "⬡", title: "Viewing concierge", text: "Save homes, book viewings and make offers from one account." },
];

const featured = ["downtown-burj-pent", "marina-sky-2br", "palm-shore-villa"];

const btn = "inline-flex items-center rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-5 py-3 transition-colors";

export default function Home() {
  const totalTx = AREAS.reduce((s, a) => s + a.transactions12m, 0);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden img-fallback">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.heroInterior}
            alt=""
            className="text-transparent absolute inset-0 h-full w-full object-cover origin-center animate-ken-burns will-change-transform"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/75 to-canvas/0" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/40" />

        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-10 pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center lg:min-h-[88svh]">
          <div>
            <p className="eyebrow mb-5">AI property agent · Built on DLD open data</p>
            <h1 className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.25rem] tracking-[-0.035em] text-ink">
              Is it a deal <br className="hidden sm:block" />
              or a <span className="text-gold-ink">steal?</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-ink/75 max-w-lg leading-relaxed">
              Ask for any home in Dubai — we check the asking price against real Land Department sales.
            </p>
            <HeroSearch />
          </div>
          <div className="flex justify-center lg:justify-end">
            <VerdictCard />
          </div>
        </div>
      </section>
      <AreaTicker />

      {/* SERVICES STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-20 grid gap-10 lg:grid-cols-[1fr_3fr] items-start">
        <div>
          <p className="eyebrow mb-3">What we do</p>
          <h2 className="text-3xl leading-tight">Smarter decisions for Dubai property</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border border-line glass p-5">
              <div className="text-gold-ink text-xl mb-4">{s.icon}</div>
              <h3 className="text-[0.95rem] text-ink mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pb-24 grid gap-10 lg:grid-cols-[1fr_3fr]">
        <div>
          <p className="eyebrow mb-3">Featured properties</p>
          <h2 className="text-4xl leading-tight">Deal, steal or skip?</h2>
          <p className="mt-4 text-sm text-muted leading-relaxed mb-8">
            From Palm Jumeirah villas to Downtown penthouses — each listing carries a fair-price verdict based on recent
            comparable sales.
          </p>
          <Link href="/properties" className={btn}>
            View all properties →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((id) => {
            const l = LISTINGS.find((x) => x.id === id)!;
            return <PropertyCard key={id} l={l} tag="Featured" />;
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="glass border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-24">
          <p className="eyebrow mb-3 text-center">How it works</p>
          <h2 className="text-4xl text-center mb-14">Three steps to a confident decision</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              ["01", "Tell the agent", "Budget, area, bedrooms, commute — in your own words. It asks follow-ups if needed."],
              ["02", "We check every price", "Each match is compared with recent DLD sales of similar units in the same area."],
              ["03", "Act with confidence", "Save your shortlist, book a viewing or make an offer anchored to the fair value."],
            ].map(([n, t, d]) => (
              <div key={n} className="border-t border-gold/40 pt-6">
                <p className="font-display text-sm font-semibold text-gold-ink mb-3 tabular">{n}</p>
                <h3 className="text-xl text-ink mb-2">{t}</h3>
                <p className="text-sm text-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY / STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr_0.9fr] border border-line glass rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <p className="eyebrow mb-3">Why Deal or Steal</p>
            <h2 className="text-3xl leading-tight mb-4">Data over opinions</h2>
            <p className="text-sm text-muted leading-relaxed mb-8">
              Asking prices in Dubai can drift far from what buyers actually pay. We ground every answer in registered
              transactions and rents — not marketing.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                [`${Math.round(totalTx / 1000)}K+`, "Sales analysed (12m)"],
                [`${AREAS.length}`, "Communities covered"],
                ["< 3s", "Fair-price verdict"],
                ["24/7", "AI agent"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl font-semibold text-gold-ink tabular">{v}</p>
                  <p className="text-xs text-muted mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-72 img-fallback">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.living2} alt="Modern living room with large windows" className="text-transparent absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="p-8 sm:p-10 flex flex-col justify-center gap-5">
            <p className="eyebrow">Ready to start?</p>
            <p className="font-display text-2xl font-semibold leading-snug tracking-[-0.02em]">Ask your first question in plain English.</p>
            <Link href="/agent" className={`${btn} self-start`}>
              Ask the agent →
            </Link>
            <Link href="/price-check" className="self-start text-sm text-gold-ink hover:text-gold-ink">
              Or check a listing&apos;s price →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
