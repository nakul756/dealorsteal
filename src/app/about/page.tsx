import Link from "next/link";
import { IMAGES } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "About & Our Data — Deal or Steal" };

const faqs = [
  ["Is the fair price an official valuation?", "No. It's a statistical estimate based on recent comparable sales. For a mortgage or legal purpose, use a DLD-registered valuer."],
  ["Where does the data come from?", "Dubai Land Department open data (transactions, rents and projects) published on data.dubai, combined with listing data."],
  ["How is the fair price calculated?", "We take recent sales of similar units in the same community, adjust for size and property type, and build a range around the median price per square foot."],
  ["Are you a broker?", "No. Deal or Steal is a technology service. Viewing requests go to the listing agent or owner."],
  ["Is it free?", "Search, price checks and the agent are free during the prototype phase."],
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About & our data"
        title="Making Dubai property prices transparent"
        intro="Dubai publishes one of the world's most open real-estate datasets. Deal or Steal turns it into answers anyone can use — in plain language, in seconds."
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/3] img-fallback">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.palmAerial} alt="Palm Jumeirah from above" className="text-transparent absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="space-y-6">
          <p className="eyebrow">How the fair price works</p>
          <ol className="space-y-5">
            {[
              ["Collect", "Registered sales and rents from the Dubai Land Department open-data portal."],
              ["Match", "Find comparable units: same community, similar size and type, sold recently."],
              ["Estimate", "Build a fair range from the median price per sq ft, adjusted for type."],
              ["Explain", "The AI agent tells you the verdict in plain words — and shows its evidence."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-5">
                <span className="font-display font-semibold tracking-[-0.02em] text-2xl text-gold-ink w-10">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-ink">{t}</p>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 lg:px-10 mt-24">
        <p className="eyebrow mb-3">FAQ</p>
        <h2 className="text-3xl mb-8">Questions, answered</h2>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="cursor-pointer list-none flex justify-between items-center text-ink">
                {q}
                <span className="text-gold-ink transition-transform group-open:rotate-45 text-xl">+</span>
              </summary>
              <p className="text-sm text-muted mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/agent" className="inline-block rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-6 py-3.5">
            Try the agent →
          </Link>
        </div>
      </section>
    </>
  );
}
