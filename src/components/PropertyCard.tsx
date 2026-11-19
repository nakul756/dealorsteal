import Link from "next/link";
import { assess, areaBySlug, bedsLabel, formatAED, type Listing } from "@/lib/data";
import { VerdictBadge } from "./VerdictBadge";
import { FavouriteButton } from "./auth/Favourites";

export function PropertyCard({ l, tag }: { l: Listing; tag?: string }) {
  const a = assess(l.area, l.sqft, l.price, l.type);
  return (
    <div className="group relative glass border border-line rounded-2xl overflow-hidden hover:border-gold/50 transition-colors">
      <Link href={`/properties/${l.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden img-fallback">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={l.image}
            alt={`${l.title}, ${areaBySlug(l.area).name}`}
            className="text-transparent h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 rounded-full bg-canvas/75 backdrop-blur text-[0.7rem] font-medium px-2.5 py-1 text-ink/90">
            {tag ?? l.status}
          </span>
          <div className="absolute bottom-3 right-3">
            <VerdictBadge verdict={a.verdict} diffPct={a.diffPct} />
          </div>
          <p className="absolute bottom-3.5 left-4 text-xs font-medium text-ink/90">{areaBySlug(l.area).name}</p>
        </div>
        <div className="p-5 space-y-1.5">
          <h3 className="text-lg text-ink">{l.title}</h3>
          <p className="text-xs text-muted">
            {bedsLabel(l.beds)} · {l.baths} baths · {l.sqft.toLocaleString()} sq ft · {l.type}
          </p>
          <div className="flex items-end justify-between pt-3">
            <p className="font-display text-xl font-semibold text-gold-ink tabular">{formatAED(l.price)}</p>
            <p className="text-xs text-muted tabular">Fair value {formatAED(a.mid)}</p>
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <FavouriteButton listingId={l.id} title={l.title} />
      </div>
    </div>
  );
}
