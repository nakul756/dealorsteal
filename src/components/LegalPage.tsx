import { PageHeader } from "./PageHeader";

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: (string | string[])[] }[];
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} intro={`Last updated ${updated}. Hackathon prototype — have this reviewed by a UAE lawyer before launch.`} />
      <div className="mx-auto max-w-3xl px-6 lg:px-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.h}>
            <h2 className="text-xl text-ink mb-3">
              <span className="text-gold-ink mr-3">{String(i + 1).padStart(2, "0")}</span>
              {s.h}
            </h2>
            <div className="space-y-3 text-sm text-ink/80 leading-relaxed">
              {s.p.map((x, j) =>
                Array.isArray(x) ? (
                  <ul key={j} className="list-disc pl-5 space-y-1.5">
                    {x.map((li) => <li key={li}>{li}</li>)}
                  </ul>
                ) : (
                  <p key={j}>{x}</p>
                ),
              )}
            </div>
          </section>
        ))}
        <p className="text-sm text-muted border-t border-line pt-6">Questions? Contact hello@dealorsteal.ae</p>
      </div>
    </>
  );
}
