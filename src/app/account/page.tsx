import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/session";
import { areaBySlug, assess, formatAED, listingById } from "@/lib/data";
import { CancelViewingButton, ProfileForm, SavedGrid, SignOutButton } from "./AccountClient";

export const metadata = { title: "Your account — Deal or Steal" };

const TABS = [
  { id: "saved", label: "Saved" },
  { id: "viewings", label: "My viewings" },
  { id: "offers", label: "My offers" },
  { id: "profile", label: "Profile" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <Account searchParams={searchParams} />
    </Suspense>
  );
}

const date = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function Account({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?callbackUrl=%2Faccount");

  const raw = (await searchParams).tab;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "saved";

  const db = getDb();
  const [favs, viewings, offers] = await Promise.all([
    db.select().from(schema.favourites).where(eq(schema.favourites.userId, user.id)).orderBy(desc(schema.favourites.createdAt)),
    db.select().from(schema.viewings).where(eq(schema.viewings.userId, user.id)).orderBy(desc(schema.viewings.createdAt)),
    db.select().from(schema.offers).where(eq(schema.offers.userId, user.id)).orderBy(desc(schema.offers.createdAt)),
  ]);
  const counts: Record<Tab, number | null> = {
    saved: favs.length,
    viewings: viewings.filter((v) => v.status !== "cancelled").length,
    offers: offers.length,
    profile: null,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-14">
      <p className="eyebrow mb-3">Your account</p>
      <h1 className="text-4xl sm:text-[2.75rem] leading-[1.05]">Hi, {user.name.split(" ")[0]}</h1>
      <p className="mt-3 text-muted">{user.email}</p>

      <nav className="mt-10 border-b border-line flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0" aria-label="Account sections">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/account?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`shrink-0 px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-gold text-ink font-medium" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {counts[t.id] !== null && <span className="ml-2 rounded-full bg-panel-2 px-2 py-0.5 text-xs text-muted tabular">{counts[t.id]}</span>}
          </Link>
        ))}
        <SignOutButton />
      </nav>

      <div className="py-10">
        {tab === "saved" && <SavedGrid ids={favs.map((f) => f.listingId)} />}

        {tab === "viewings" &&
          (viewings.length === 0 ? (
            <Empty text="No viewings yet." cta="Find a home to view" />
          ) : (
            <ul className="space-y-3">
              {viewings.map((v) => {
                const l = listingById(v.listingId);
                if (!l) return null;
                return (
                  <Row key={v.id} img={l.image} title={l.title} href={`/properties/${l.id}`} sub={`${areaBySlug(l.area).name} · requested ${date(v.createdAt)}`}>
                    <div className="text-right">
                      <p className="font-display font-semibold tabular">{v.slot}</p>
                      <StatusPill status={v.status} />
                    </div>
                    {v.status === "requested" && <CancelViewingButton id={v.id} />}
                  </Row>
                );
              })}
            </ul>
          ))}

        {tab === "offers" &&
          (offers.length === 0 ? (
            <Empty text="No offers yet." cta="Browse properties" />
          ) : (
            <ul className="space-y-3">
              {offers.map((o) => {
                const l = listingById(o.listingId);
                if (!l) return null;
                const fair = assess(l.area, l.sqft, l.price, l.type);
                const vsAsk = ((o.amount - l.price) / l.price) * 100;
                return (
                  <Row
                    key={o.id}
                    img={l.image}
                    title={l.title}
                    href={`/properties/${l.id}`}
                    sub={`Asking ${formatAED(l.price)} · fair ${formatAED(fair.mid)} · sent ${date(o.createdAt)}`}
                    note={o.message}
                  >
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-gold-ink tabular">{formatAED(o.amount)}</p>
                      <p className="text-xs text-muted tabular">
                        {Math.abs(vsAsk).toFixed(1)}% {vsAsk <= 0 ? "below" : "above"} asking
                      </p>
                    </div>
                    <StatusPill status={o.status} />
                  </Row>
                );
              })}
            </ul>
          ))}

        {tab === "profile" && <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} provider={user.provider} />}
      </div>
    </div>
  );
}

function Row({
  img,
  title,
  sub,
  href,
  note,
  children,
}: {
  img: string;
  title: string;
  sub: string;
  href: string;
  note?: string | null;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-line glass p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
      <Link href={href} className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden img-fallback">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="text-transparent absolute inset-0 h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-display font-semibold tracking-[-0.02em] hover:text-gold-ink">
          {title}
        </Link>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
        {note && <p className="text-sm text-ink/75 mt-1.5 line-clamp-2">“{note}”</p>}
      </div>
      <div className="flex items-center gap-4 ml-auto">{children}</div>
    </li>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "cancelled" || status === "declined"
      ? "text-muted border-line"
      : status === "confirmed" || status === "accepted"
        ? "text-good border-good/50"
        : "text-gold-ink border-gold/40";
  return <span className={`inline-block mt-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium capitalize ${cls}`}>{status}</span>;
}

function Empty({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-12 text-center">
      <p className="text-muted">{text}</p>
      <Link href="/properties" className="inline-block mt-4 rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-5 py-3">
        {cta}
      </Link>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-14 animate-pulse" aria-busy>
      <div className="h-3 w-24 rounded bg-panel-2" />
      <div className="mt-4 h-10 w-64 rounded bg-panel-2" />
      <div className="mt-12 h-10 w-full max-w-lg rounded bg-panel-2" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl glass" />
        ))}
      </div>
    </div>
  );
}

