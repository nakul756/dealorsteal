"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { cancelViewingAction, updateProfileAction } from "@/app/actions";
import { PropertyCard } from "@/components/PropertyCard";
import { useFavourites } from "@/components/auth/Favourites";
import { listingById } from "@/lib/data";
import type { FieldErrors } from "@/lib/validation";

export function SavedGrid({ ids }: { ids: string[] }) {
  const favs = useFavourites();
  // Once the client list has loaded, drop anything un-hearted on this page.
  const shown = ids.filter((id) => !favs.loaded || favs.ids.has(id)).map(listingById).filter((l) => l !== undefined);
  if (shown.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-line p-12 text-center">
        <p className="text-muted">No saved homes yet. Tap the heart on any property to keep it here.</p>
        <Link href="/properties" className="inline-block mt-4 rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-5 py-3">
          Browse properties
        </Link>
      </div>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((l) => (
        <PropertyCard key={l.id} l={l} />
      ))}
    </div>
  );
}

export function CancelViewingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await cancelViewingAction(id);
          router.refresh();
        })
      }
      className="text-xs text-muted hover:text-warn disabled:opacity-50"
    >
      {pending ? "Cancelling…" : "Cancel"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ redirectTo: "/" })} className="ml-auto shrink-0 px-4 py-3 text-sm text-muted hover:text-warn">
      Sign out
    </button>
  );
}

const input =
  "w-full rounded-lg bg-canvas border border-line px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-gold transition-colors";

export function ProfileForm({ name, phone, email, provider }: { name: string; phone: string; email: string; provider: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [pending, start] = useTransition();
  const [fields, setFields] = useState<FieldErrors>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await updateProfileAction({ name: fd.get("name"), phone: fd.get("phone") || undefined });
          if (res.ok) {
            setFields({});
            setMsg({ ok: true, text: "Profile saved." });
            await update({ name: String(fd.get("name")) });
            router.refresh();
          } else {
            setFields(res.fields ?? {});
            setMsg({ ok: false, text: res.error });
          }
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-ink/80">Full name</span>
        <input name="name" defaultValue={name} required className={input} autoComplete="name" />
        {fields.name && <span className="block text-xs text-warn">{fields.name}</span>}
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-ink/80">Email</span>
        <input value={email} disabled className={`${input} opacity-60`} />
        <span className="block text-xs text-muted">{provider === "google" ? "Signed in with Google." : "Contact us to change your email."}</span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-ink/80">Phone (optional)</span>
        <input name="phone" type="tel" defaultValue={phone} className={input} autoComplete="tel" placeholder="+971 50 000 0000" />
        {fields.phone ? (
          <span className="block text-xs text-warn">{fields.phone}</span>
        ) : (
          <span className="block text-xs text-muted">Shared with the listing agent when you book a viewing or make an offer.</span>
        )}
      </label>
      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-good" : "text-warn"}`}>
          {msg.text}
        </p>
      )}
      <button disabled={pending} className="rounded-full bg-gold hover:bg-gold-soft disabled:opacity-60 text-ink text-sm font-semibold px-5 py-3">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
