import { AREAS, LISTINGS, assess, areaBySlug, bedsLabel, formatAED, type Listing } from "./data";

export type AgentResult = {
  reply: string;
  listingIds: string[];
  suggestions: string[];
};

const AREA_ALIASES: Record<string, string[]> = {
  "palm-jumeirah": ["palm"],
  downtown: ["downtown", "burj"],
  "creek-harbour": ["creek"],
  "dubai-hills": ["hills"],
  "dubai-marina": ["marina", "jbr"],
  "business-bay": ["business bay", "bay"],
  jlt: ["jlt", "lake towers", "lakes"],
  jvc: ["jvc", "village circle"],
  "dubai-south": ["dubai south", "south", "expo"],
};

function parseBudget(q: string): number | undefined {
  const m = q.match(/(?:under|below|max|up to|budget|<)\s*(?:aed\s*)?([\d.,]+)\s*(m|mn|million|k)?/i);
  if (!m) return undefined;
  let n = parseFloat(m[1].replace(/,/g, ""));
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("m")) n *= 1_000_000;
  else if (unit === "k") n *= 1_000;
  else if (n < 100) n *= 1_000_000; // "under 3" → 3M
  return n;
}

export function parseQuery(q: string) {
  const s = q.toLowerCase();
  const areas = Object.entries(AREA_ALIASES)
    .filter(([, names]) => names.some((n) => new RegExp(`\\b${n}\\b`).test(s)))
    .map(([slug]) => slug);
  const bedMatch = s.match(/(\d)\s*-?\s*(?:bed|br|bhk|bedroom)/);
  const beds = s.includes("studio") ? 0 : bedMatch ? Number(bedMatch[1]) : undefined;
  const budget = parseBudget(s);
  const type = /villa/.test(s) ? "Villa" : /penthouse/.test(s) ? "Penthouse" : /townhouse/.test(s) ? "Townhouse" : undefined;
  const wantsMetro = /metro|tram/.test(s);
  const wantsYield = /yield|invest|rental income|roi/.test(s);
  const wantsFair = /fair|good deal|undervalued|cheap|bargain|not overpriced|value/.test(s);
  const offPlan = /off.?plan/.test(s) ? true : /ready/.test(s) ? false : undefined;
  return { areas, beds, budget, type, wantsMetro, wantsYield, wantsFair, offPlan };
}

export function runAgent(q: string): AgentResult {
  const p = parseQuery(q);
  const s = q.toLowerCase();

  // Market questions
  if (/(best|highest|top).*(yield|area|invest)|where should i invest|which area/.test(s) && !p.beds && !p.budget) {
    const top = [...AREAS].sort((a, b) => b.grossYield - a.grossYield).slice(0, 3);
    return {
      reply:
        `For rental yield, the strongest communities right now are ${top
          .map((a) => `${a.name} (~${a.grossYield}% gross, AED ${a.pricePerSqft.toLocaleString()}/sq ft)`)
          .join(", ")}. ` +
        `Prime areas like Downtown and Palm Jumeirah yield less (5–6%) but have seen stronger capital growth. Want me to show listings in one of these?`,
      listingIds: LISTINGS.filter((l) => top.some((a) => a.slug === l.area)).map((l) => l.id).slice(0, 3),
      suggestions: ["Show 1-beds in JVC under 1.2M", "Compare Marina vs Business Bay", "Open market insights"],
    };
  }

  let pool: Listing[] = LISTINGS.filter(
    (l) =>
      (p.areas.length === 0 || p.areas.includes(l.area)) &&
      (p.beds === undefined || l.beds === p.beds) &&
      (p.budget === undefined || l.price <= p.budget * 1.05) &&
      (p.type === undefined || l.type === p.type) &&
      (!p.wantsMetro || l.nearMetro) &&
      (p.offPlan === undefined || (l.status === "Off-plan") === p.offPlan),
  );

  let relaxed = false;
  if (pool.length === 0) {
    relaxed = true;
    pool = LISTINGS.filter(
      (l) =>
        (p.beds === undefined || Math.abs(l.beds - p.beds) <= 1) &&
        (p.budget === undefined || l.price <= p.budget * 1.2),
    );
  }

  const scored = pool
    .map((l) => ({ l, a: assess(l.area, l.sqft, l.price, l.type) }))
    .filter((x) => !p.wantsFair || x.a.verdict !== "Overpriced")
    .sort((x, y) => (p.wantsYield ? y.a.yieldPct - x.a.yieldPct : x.a.diffPct - y.a.diffPct))
    .slice(0, 3);

  if (scored.length === 0) {
    return {
      reply: "I couldn't find a match for that yet. Could you tell me your budget, preferred area and number of bedrooms?",
      listingIds: [],
      suggestions: ["2-bed in Dubai Marina under 3M", "Villa on the Palm", "Best areas for rental yield"],
    };
  }

  const intro = relaxed
    ? "Nothing matched exactly, so I widened the search slightly. Here's what's closest:"
    : `I found ${scored.length} match${scored.length > 1 ? "es" : ""}${p.areas.length ? ` in ${p.areas.map((a) => areaBySlug(a).name).join(" & ")}` : ""}:`;

  const lines = scored.map(({ l, a }) => {
    const v =
      a.verdict === "Overpriced"
        ? `listed ${a.diffPct.toFixed(0)}% above recent sales — I'd negotiate towards ${formatAED(a.mid)}`
        : a.verdict === "Steal"
          ? `${Math.abs(a.diffPct).toFixed(0)}% below recent sales — a genuine good deal`
          : "priced in line with the market";
    return `• ${l.title} (${bedsLabel(l.beds)}, ${areaBySlug(l.area).name}) at ${formatAED(l.price)} — ${v}. Est. yield ${a.yieldPct.toFixed(1)}%.`;
  });

  const best = scored.find((x) => x.a.verdict !== "Overpriced") ?? scored[0];
  return {
    reply: `${intro}\n${lines.join("\n")}\n\nMy pick: ${best.l.title}. Want me to book a viewing or show the comparable sales?`,
    listingIds: scored.map((x) => x.l.id),
    suggestions: [`Book a viewing for ${best.l.title}`, "Only show fairly priced options", "Which area has the best yield?"],
  };
}
