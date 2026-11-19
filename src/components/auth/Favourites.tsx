"use client";

import { useSession } from "next-auth/react";
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { setFavouriteAction } from "@/app/actions";
import { useAuthGate, useResumeIntent } from "./AuthGate";

type Favs = { ids: Set<string>; loaded: boolean; set: (id: string, saved: boolean) => Promise<void> };
const FavContext = createContext<Favs | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me/favourites", { cache: "no-store" });
      if (res.ok) {
        setIds(new Set(((await res.json()) as { ids: string[] }).ids));
        setLoaded(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (status === "authenticated") void refresh();
    else if (status === "unauthenticated") {
      setIds(new Set());
      setLoaded(false);
    }
  }, [status, refresh]);

  const set = useCallback(
    async (id: string, saved: boolean) => {
      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.add(id);
        else next.delete(id);
        return next;
      });
      const res = await setFavouriteAction({ listingId: id, saved });
      await refresh();
      if (!res.ok) throw new Error(res.error);
    },
    [refresh],
  );

  return <FavContext value={{ ids, loaded, set }}>{children}</FavContext>;
}

export function useFavourites() {
  const f = use(FavContext);
  if (!f) throw new Error("useFavourites must be used inside <FavouritesProvider>");
  return f;
}

export function FavouriteButton({
  listingId,
  title,
  variant = "icon",
}: {
  listingId: string;
  title: string;
  variant?: "icon" | "button";
}) {
  const { ids, set } = useFavourites();
  const { requireAuth } = useAuthGate();
  const saved = ids.has(listingId);
  const intent = `save:${listingId}`;

  useResumeIntent(intent, () => void set(listingId, true));

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(intent, () => set(listingId, !saved).catch(() => {}), `Sign in to save ${title} to your shortlist.`);
  }

  const heart = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
    </svg>
  );

  if (variant === "button")
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
          saved ? "border-gold/60 text-gold-ink bg-gold/10" : "border-line text-ink/90 hover:border-ink/40"
        }`}
      >
        {heart}
        {saved ? "Saved" : "Save"}
      </button>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={`h-9 w-9 grid place-items-center rounded-full backdrop-blur border transition-colors ${
        saved ? "bg-gold text-ink border-gold" : "bg-canvas/60 text-ink border-ink/20 hover:text-gold-ink hover:border-gold/60"
      }`}
    >
      {heart}
    </button>
  );
}
