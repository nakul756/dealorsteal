import { AREAS } from "@/lib/data";

const SHORT: Record<string, string> = {
  "palm-jumeirah": "Palm Jumeirah",
  downtown: "Downtown",
  "creek-harbour": "Creek Harbour",
  "dubai-hills": "Dubai Hills",
  "dubai-marina": "Marina",
  "business-bay": "Business Bay",
  jlt: "JLT",
  jvc: "JVC",
  "dubai-south": "Dubai South",
};

function Items({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {AREAS.map((a) => (
        <li key={a.slug} className="flex items-center gap-2 px-6 whitespace-nowrap text-[0.8rem] tabular">
          <span className="font-medium text-ink">{SHORT[a.slug] ?? a.name}</span>
          <span className="text-muted/60">·</span>
          <span className="text-ink/70">AED {a.pricePerSqft.toLocaleString()}/sqft</span>
          <span className="text-muted/60">·</span>
          <span className="text-ink/70">{a.grossYield.toFixed(1)}% yield</span>
          <span className={a.yoy >= 0 ? "text-good" : "text-warn"}>
            {a.yoy >= 0 ? "▲" : "▼"}
            {Math.abs(a.yoy).toFixed(1)}%
          </span>
          <span className="ml-6 h-1 w-1 rounded-full bg-gold/50" />
        </li>
      ))}
    </ul>
  );
}

/** Slow marquee of area stats. Duplicated once so the -50% loop is seamless. */
export function AreaTicker() {
  return (
    <div className="relative glass border-y border-white/70 overflow-hidden" role="region" aria-label="Area market stats">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-canvas to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-canvas to-transparent z-10" />
      <div className="flex w-max py-3 animate-ticker hover:[animation-play-state:paused]">
        <Items />
        <Items hidden />
      </div>
    </div>
  );
}
