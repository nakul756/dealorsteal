"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { bookViewingAction, makeOfferAction, type ActionResult } from "@/app/actions";
import { Modal } from "@/components/Modal";
import { saveDraft, takeDraft, useAuthGate, useResumeIntent } from "@/components/auth/AuthGate";
import { FavouriteButton } from "@/components/auth/Favourites";
import { formatAED } from "@/lib/data";
import { VIEWING_SLOTS, type FieldErrors } from "@/lib/validation";

type Props = { id: string; title: string; price: number; fairMid: number; fairLow: number; fairHigh: number };

type ViewingDraft = { slot: string; note: string };
type OfferDraft = { amount: string; message: string };

const input =
  "w-full rounded-lg bg-canvas border border-line px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-gold transition-colors";
const primary =
  "w-full rounded-full bg-gold hover:bg-gold-soft disabled:opacity-50 text-ink text-sm font-semibold py-3.5 transition-colors";

export function PropertyActions(p: Props) {
  const { requireAuth, openAuth } = useAuthGate();
  const [modal, setModal] = useState<"viewing" | "offer" | null>(null);
  const [viewing, setViewing] = useState<ViewingDraft>({ slot: "", note: "" });
  const [offer, setOffer] = useState<OfferDraft>({ amount: String(p.fairMid), message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [done, setDone] = useState<{ viewing?: string; offer?: number }>({});

  const bookIntent = `book:${p.id}`;
  const offerIntent = `offer:${p.id}`;

  function handle<T>(res: ActionResult<T>) {
    if (res.ok) return true;
    if (res.unauthenticated) {
      // Session cookie no longer maps to an account (e.g. it was deleted). Start over cleanly.
      setError("Your session has expired — please sign in again.");
      void signOut({ redirect: false }).then(() => openAuth("sign-in"));
      return false;
    }
    setError(res.error);
    setFields(res.fields ?? {});
    return false;
  }

  async function submitViewing(d: ViewingDraft) {
    setBusy(true);
    setError(null);
    const res = await bookViewingAction({ listingId: p.id, slot: d.slot, note: d.note });
    setBusy(false);
    if (handle(res)) {
      setDone((x) => ({ ...x, viewing: d.slot }));
      setModal(null);
    }
  }

  async function submitOffer(d: OfferDraft) {
    setBusy(true);
    setError(null);
    const res = await makeOfferAction({ listingId: p.id, amount: d.amount.replace(/\D/g, ""), message: d.message });
    setBusy(false);
    if (handle(res)) {
      setDone((x) => ({ ...x, offer: Number(d.amount.replace(/\D/g, "")) }));
      setModal(null);
    }
  }

  // Back from Google / the /sign-in page: restore what they filled in and finish it.
  useResumeIntent(bookIntent, () => {
    const d = takeDraft<ViewingDraft>(bookIntent);
    if (d?.slot) {
      setViewing(d);
      void submitViewing(d);
    } else setModal("viewing");
  });
  useResumeIntent(offerIntent, () => {
    const d = takeDraft<OfferDraft>(offerIntent);
    if (d?.amount) {
      setOffer(d);
      void submitOffer(d);
    } else setModal("offer");
  });

  const open = (m: "viewing" | "offer") => {
    setError(null);
    setFields({});
    setModal(m);
  };

  const amountNum = Number(offer.amount.replace(/\D/g, "")) || 0;
  const vsAsking = amountNum ? ((amountNum - p.price) / p.price) * 100 : 0;

  return (
    <div className="mt-6 space-y-3">
      {done.viewing && (
        <Notice>
          Viewing requested for <b>{done.viewing}</b>. The listing agent will confirm on WhatsApp.{" "}
          <Link href="/account?tab=viewings" className="underline underline-offset-2">
            View in your account
          </Link>
        </Notice>
      )}
      {done.offer && (
        <Notice>
          Offer of <b>{formatAED(done.offer)}</b> sent to the listing agent.{" "}
          <Link href="/account?tab=offers" className="underline underline-offset-2">
            Track it
          </Link>
        </Notice>
      )}

      <button onClick={() => open("viewing")} className={primary}>
        {done.viewing ? "Book another slot" : "Book a viewing"}
      </button>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          onClick={() => open("offer")}
          className="rounded-lg border border-gold/60 text-gold-ink hover:bg-gold/10 text-sm font-semibold py-3 transition-colors"
        >
          Make an offer
        </button>
        <FavouriteButton listingId={p.id} title={p.title} variant="button" />
      </div>

      <Modal open={modal === "viewing"} onClose={() => setModal(null)} title="Book a viewing">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveDraft(bookIntent, viewing);
            requireAuth(bookIntent, () => submitViewing(viewing), "Sign in to book this viewing — we'll keep the slot you picked.");
          }}
          className="space-y-5"
        >
          <p className="text-sm text-muted -mt-1">{p.title}</p>
          <fieldset>
            <legend className="text-xs font-medium text-ink/80 mb-2">Pick a slot</legend>
            <div className="grid grid-cols-2 gap-2">
              {VIEWING_SLOTS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setViewing({ ...viewing, slot: s })}
                  aria-pressed={viewing.slot === s}
                  className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    viewing.slot === s ? "border-gold bg-gold/10 text-gold-ink" : "border-line text-ink/85 hover:border-ink/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {fields.slot && <p className="text-xs text-warn mt-2">{fields.slot}</p>}
          </fieldset>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink/80">Note for the agent (optional)</span>
            <textarea
              rows={3}
              value={viewing.note}
              onChange={(e) => setViewing({ ...viewing, note: e.target.value })}
              maxLength={500}
              className={input}
              placeholder="e.g. I'd like to see the parking and storage too"
            />
          </label>
          {error && <p role="alert" className="text-sm text-warn">{error}</p>}
          <button disabled={!viewing.slot || busy} className={primary}>
            {busy ? "Booking…" : viewing.slot ? `Request ${viewing.slot}` : "Choose a slot"}
          </button>
        </form>
      </Modal>

      <Modal open={modal === "offer"} onClose={() => setModal(null)} title="Make an offer">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveDraft(offerIntent, offer);
            requireAuth(offerIntent, () => submitOffer(offer), "Sign in to send your offer — we'll keep the amount you entered.");
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Asking" value={formatAED(p.price)} />
            <MiniStat label="Fair value" value={formatAED(p.fairMid)} accent />
            <MiniStat label="Fair range" value={`${formatAED(p.fairLow).replace("AED ", "")}–${formatAED(p.fairHigh).replace("AED ", "")}`} />
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink/80">Your offer (AED)</span>
            <input
              inputMode="numeric"
              value={amountNum ? amountNum.toLocaleString("en-US") : ""}
              onChange={(e) => setOffer({ ...offer, amount: e.target.value.replace(/\D/g, "") })}
              className={`${input} font-display text-lg font-semibold tabular`}
              aria-describedby="offer-hint"
            />
            <span id="offer-hint" className={`block text-xs ${fields.amount ? "text-warn" : "text-muted"}`}>
              {fields.amount ??
                (amountNum
                  ? `${Math.abs(vsAsking).toFixed(1)}% ${vsAsking <= 0 ? "below" : "above"} asking · pre-filled with our fair-value estimate`
                  : "Enter an amount")}
            </span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink/80">Message to the seller (optional)</span>
            <textarea
              rows={3}
              value={offer.message}
              onChange={(e) => setOffer({ ...offer, message: e.target.value })}
              maxLength={1000}
              className={input}
              placeholder="e.g. Mortgage pre-approved, flexible on handover date"
            />
          </label>
          {error && <p role="alert" className="text-sm text-warn">{error}</p>}
          <button disabled={!amountNum || busy} className={primary}>
            {busy ? "Sending…" : `Send offer${amountNum ? ` of ${formatAED(amountNum)}` : ""}`}
          </button>
          <p className="text-xs text-muted">Offers are non-binding until a Form F (MOU) is signed with the seller.</p>
        </form>
      </Modal>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-good/40 bg-good/10 p-3.5 text-sm text-good leading-relaxed">✓ {children}</div>;
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-2.5 ${accent ? "border-gold/50 bg-gold/5" : "border-line"}`}>
      <p className="text-[0.68rem] text-muted">{label}</p>
      <p className={`text-sm font-semibold tabular mt-0.5 ${accent ? "text-gold-ink" : ""}`}>{value}</p>
    </div>
  );
}
