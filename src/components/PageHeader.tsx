export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-14 pb-10">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="text-4xl sm:text-[2.75rem] lg:text-[3.25rem] text-ink leading-[1.05] max-w-4xl">{title}</h1>
      {intro && <p className="mt-5 text-muted max-w-2xl leading-relaxed">{intro}</p>}
    </section>
  );
}
