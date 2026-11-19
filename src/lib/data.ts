// Sample data for the hackathon demo.
// Area benchmarks are illustrative 2026 figures compiled from public market reports.
// Replace AREAS / COMPS with values computed from the DLD open-data CSVs (data.dubai).

const IMG = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?fm=jpg&q=70&w=${w}&auto=format&fit=crop`;

export const IMAGES = {
  heroInterior: IMG("1661630804516-10393c1bb0a8", 2400), // Dubai skyline at night
  businessBay: IMG("1621073831231-faa453d28112"),
  marinaNight: IMG("1502964740190-e59d1e3dd8db"),
  downtown: IMG("1603350942002-35f088445d3c"),
  marinaTwilight: IMG("1767041743706-fa96a08187a3"),
  palmAerial: IMG("1764212193268-dba11709dc38"),
  villaCourtyard: IMG("1760261799672-2469a6c4c6f3"),
  poolPalms: IMG("1551882547-ff40c63fe5fa"),
  loft: IMG("1718066236069-a4d42a6436a1"),
  living1: IMG("1522708323590-d24dbb6b0267"),
  living2: IMG("1757524503555-b62633f47670"),
  living3: IMG("1773578978637-c9771e7a9913"),
  living4: IMG("1583847268964-b28dc8f51f92"),
  living5: IMG("1759691555393-60cd5355d840"),
  living6: IMG("1763827513396-5917fc6c84f3"),
};

export type Area = {
  slug: string;
  name: string;
  pricePerSqft: number; // AED, benchmark median
  grossYield: number; // %
  yoy: number; // % price change year on year
  avgRent1BR: number; // AED / year
  transactions12m: number;
  vibe: string;
};

export const AREAS: Area[] = [
  { slug: "palm-jumeirah", name: "Palm Jumeirah", pricePerSqft: 3800, grossYield: 5.0, yoy: 16.0, avgRent1BR: 160000, transactions12m: 2950, vibe: "Beachfront villas & branded residences" },
  { slug: "downtown", name: "Downtown Dubai", pricePerSqft: 3100, grossYield: 5.7, yoy: 14.0, avgRent1BR: 125000, transactions12m: 7400, vibe: "Burj Khalifa views, prime city living" },
  { slug: "creek-harbour", name: "Dubai Creek Harbour", pricePerSqft: 2500, grossYield: 6.2, yoy: 17.0, avgRent1BR: 95000, transactions12m: 6100, vibe: "Waterfront master-plan, new launches" },
  { slug: "dubai-hills", name: "Dubai Hills Estate", pricePerSqft: 2300, grossYield: 6.0, yoy: 13.0, avgRent1BR: 100000, transactions12m: 9800, vibe: "Family community, golf & parks" },
  { slug: "dubai-marina", name: "Dubai Marina", pricePerSqft: 2150, grossYield: 6.5, yoy: 12.0, avgRent1BR: 100000, transactions12m: 11300, vibe: "Most liquid resale market, waterfront towers" },
  { slug: "business-bay", name: "Business Bay", pricePerSqft: 2050, grossYield: 6.8, yoy: 11.0, avgRent1BR: 90000, transactions12m: 9000, vibe: "Canal-side towers next to Downtown" },
  { slug: "jlt", name: "Jumeirah Lake Towers", pricePerSqft: 1500, grossYield: 7.0, yoy: 11.0, avgRent1BR: 70000, transactions12m: 7500, vibe: "Metro-linked, value next to the Marina" },
  { slug: "jvc", name: "Jumeirah Village Circle", pricePerSqft: 1250, grossYield: 8.1, yoy: 9.7, avgRent1BR: 62000, transactions12m: 13700, vibe: "Highest-volume, highest-yield community" },
  { slug: "dubai-south", name: "Dubai South", pricePerSqft: 900, grossYield: 8.5, yoy: 15.0, avgRent1BR: 48000, transactions12m: 6800, vibe: "Growth corridor near Al Maktoum Airport" },
];

export const areaBySlug = (slug: string) => AREAS.find((a) => a.slug === slug)!;

export type Listing = {
  id: string;
  title: string;
  area: string; // area slug
  building: string;
  type: "Apartment" | "Penthouse" | "Villa" | "Townhouse";
  status: "Ready" | "Off-plan";
  beds: number;
  baths: number;
  sqft: number;
  price: number; // AED asking
  image: string;
  gallery: string[];
  features: string[];
  nearMetro: boolean;
};

export const LISTINGS: Listing[] = [
  { id: "marina-sky-2br", title: "Marina Sky Residence", area: "dubai-marina", building: "Marina Gate", type: "Apartment", status: "Ready", beds: 2, baths: 3, sqft: 1290, price: 3_050_000, image: IMAGES.marinaTwilight, gallery: [IMAGES.living2, IMAGES.living4], features: ["Full marina view", "Balcony", "Gym & pool"], nearMetro: true },
  { id: "palm-shore-villa", title: "Palm Shoreline Villa", area: "palm-jumeirah", building: "Frond G", type: "Villa", status: "Ready", beds: 5, baths: 6, sqft: 7100, price: 29_500_000, image: IMAGES.poolPalms, gallery: [IMAGES.living5, IMAGES.living3], features: ["Private beach", "Infinity pool", "Maid's room"], nearMetro: false },
  { id: "downtown-burj-pent", title: "Burj View Penthouse", area: "downtown", building: "Opera Grand", type: "Penthouse", status: "Ready", beds: 4, baths: 5, sqft: 4200, price: 14_900_000, image: IMAGES.downtown, gallery: [IMAGES.living2, IMAGES.loft], features: ["Burj Khalifa & fountain view", "Private terrace", "Concierge"], nearMetro: true },
  { id: "bay-canal-1br", title: "Canal Front Suite", area: "business-bay", building: "Peninsula Four", type: "Apartment", status: "Ready", beds: 1, baths: 2, sqft: 780, price: 1_520_000, image: IMAGES.businessBay, gallery: [IMAGES.living4, IMAGES.living6], features: ["Canal view", "Furnished", "Walk to Downtown"], nearMetro: true },
  { id: "jvc-garden-2br", title: "Garden Court Residence", area: "jvc", building: "Binghatti Gardens", type: "Apartment", status: "Ready", beds: 2, baths: 2, sqft: 1050, price: 1_190_000, image: IMAGES.living1, gallery: [IMAGES.living6, IMAGES.living3], features: ["Pool view", "Covered parking", "High rental demand"], nearMetro: false },
  { id: "hills-park-th", title: "Park Edge Townhouse", area: "dubai-hills", building: "Maple III", type: "Townhouse", status: "Ready", beds: 4, baths: 4, sqft: 2600, price: 5_350_000, image: IMAGES.villaCourtyard, gallery: [IMAGES.living5, IMAGES.living2], features: ["Backs onto park", "Private garden", "Near schools"], nearMetro: false },
  { id: "creek-tower-3br", title: "Creek Horizon Residence", area: "creek-harbour", building: "Creek Rise", type: "Apartment", status: "Off-plan", beds: 3, baths: 4, sqft: 1720, price: 4_100_000, image: IMAGES.marinaNight, gallery: [IMAGES.living3, IMAGES.loft], features: ["Handover Q4 2027", "60/40 payment plan", "Skyline view"], nearMetro: false },
  { id: "jlt-lake-1br", title: "Lakeside Studio Plus", area: "jlt", building: "Lake Terrace", type: "Apartment", status: "Ready", beds: 1, baths: 1, sqft: 820, price: 1_140_000, image: IMAGES.living4, gallery: [IMAGES.living1, IMAGES.living6], features: ["Lake view", "2 min to metro", "Upgraded kitchen"], nearMetro: true },
  { id: "south-airport-2br", title: "Southgate Residence", area: "dubai-south", building: "Pulse Boulevard", type: "Apartment", status: "Off-plan", beds: 2, baths: 2, sqft: 1100, price: 960_000, image: IMAGES.living3, gallery: [IMAGES.living1, IMAGES.living4], features: ["Handover Q2 2027", "Near Expo City", "Post-handover plan"], nearMetro: false },
  { id: "marina-1br-value", title: "Marina Promenade 1BR", area: "dubai-marina", building: "Marina Promenade", type: "Apartment", status: "Ready", beds: 1, baths: 2, sqft: 860, price: 1_820_000, image: IMAGES.living2, gallery: [IMAGES.living4, IMAGES.living5], features: ["Partial sea view", "Tenanted", "Walk to tram"], nearMetro: true },
  { id: "jvc-studio", title: "Circle Studio", area: "jvc", building: "Belgravia Heights", type: "Apartment", status: "Ready", beds: 0, baths: 1, sqft: 440, price: 640_000, image: IMAGES.living6, gallery: [IMAGES.living1, IMAGES.living3], features: ["Rented at AED 52k", "Pool & gym", "Low service charge"], nearMetro: false },
  { id: "bay-exec-2br", title: "Executive Bay 2BR", area: "business-bay", building: "Executive Towers", type: "Apartment", status: "Ready", beds: 2, baths: 3, sqft: 1380, price: 3_150_000, image: IMAGES.loft, gallery: [IMAGES.living2, IMAGES.living5], features: ["Burj view", "Mall access", "Large layout"], nearMetro: true },
];

export const listingById = (id: string) => LISTINGS.find((l) => l.id === id);

// ---------- Fair price engine ----------

export type Verdict = "Steal" | "Fair" | "Overpriced";

// Villas and penthouses trade at a premium per sqft over the apartment benchmark.
const typeMultiplier = (type: Listing["type"]) =>
  type === "Penthouse" ? 1.25 : type === "Villa" ? 1.05 : type === "Townhouse" ? 0.95 : 1;

export function fairValue(areaSlug: string, sqft: number, type: Listing["type"] = "Apartment") {
  const a = areaBySlug(areaSlug);
  const mid = a.pricePerSqft * typeMultiplier(type) * sqft;
  return { low: Math.round(mid * 0.93), mid: Math.round(mid), high: Math.round(mid * 1.07) };
}

export function assess(areaSlug: string, sqft: number, price: number, type: Listing["type"] = "Apartment") {
  const fv = fairValue(areaSlug, sqft, type);
  const diffPct = ((price - fv.mid) / fv.mid) * 100;
  const verdict: Verdict = diffPct <= -5 ? "Steal" : diffPct >= 8 ? "Overpriced" : "Fair";
  const a = areaBySlug(areaSlug);
  const annualRent = (a.avgRent1BR / 800) * sqft * (type === "Villa" ? 0.8 : 1);
  const yieldPct = (annualRent / price) * 100;
  return { ...fv, diffPct, verdict, yieldPct, annualRent: Math.round(annualRent) };
}

// Deterministic pseudo-random so comps are stable between renders.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export type Comp = { date: string; building: string; sqft: number; price: number; perSqft: number };

export function comparableSales(l: Listing, n = 6): Comp[] {
  const rnd = seeded(l.id);
  const a = areaBySlug(l.area);
  const base = a.pricePerSqft * typeMultiplier(l.type);
  const today = new Date("2026-11-15");
  return Array.from({ length: n }, (_, i) => {
    const sqft = Math.round(l.sqft * (0.88 + rnd() * 0.24));
    const perSqft = Math.round(base * (0.92 + rnd() * 0.14));
    const d = new Date(today);
    d.setDate(d.getDate() - Math.round(10 + i * 27 + rnd() * 12));
    return {
      date: d.toISOString().slice(0, 10),
      building: rnd() > 0.45 ? l.building : `${a.name.split(" ")[0]} ${["Heights", "Tower", "Residences", "Gate"][i % 4]}`,
      sqft,
      price: perSqft * sqft,
      perSqft,
    };
  });
}

// 12-month price-per-sqft series ending at today's benchmark.
export function areaTrend(slug: string) {
  const a = areaBySlug(slug);
  const rnd = seeded(slug + "trend");
  const start = a.pricePerSqft / (1 + a.yoy / 100);
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  return months.map((m, i) => ({
    month: m,
    value: Math.round(start + ((a.pricePerSqft - start) * i) / 11 + (i > 0 && i < 11 ? (rnd() - 0.5) * a.pricePerSqft * 0.02 : 0)),
  }));
}

export const formatAED = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M` : `AED ${Math.round(n / 1000)}K`;

export const bedsLabel = (b: number) => (b === 0 ? "Studio" : `${b} Bed${b > 1 ? "s" : ""}`);
