import type { Verdict } from "@/lib/data";

const styles: Record<Verdict, string> = {
  Steal: "bg-good/15 text-good border-good/50",
  Fair: "bg-gold/15 text-gold-ink border-gold/50",
  Overpriced: "bg-warn/15 text-warn border-warn/50",
};

export function VerdictBadge({ verdict, diffPct, large }: { verdict: Verdict; diffPct?: number; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur ${styles[verdict]} ${
        large ? "text-sm px-3 py-1.5" : "text-[0.7rem] px-2.5 py-1"
      } font-semibold tabular`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {verdict}
      {diffPct !== undefined && (
        <span className="opacity-80 font-medium">
          {diffPct > 0 ? "+" : ""}
          {diffPct.toFixed(0)}%
        </span>
      )}
    </span>
  );
}
