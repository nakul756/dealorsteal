"use client";

import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { signUpAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/validation";

export type AuthMode = "sign-in" | "sign-up";

const input =
  "w-full rounded-lg bg-canvas border border-line px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-gold transition-colors";

/**
 * Email/password + Google form shared by the sign-in modal and the /sign-in and /sign-up pages.
 * `onSuccess` runs after a credentials sign-in. Google always redirects to `redirectTo`.
 */
export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  redirectTo,
  modeHref,
}: {
  mode: AuthMode;
  onModeChange?: (m: AuthMode) => void;
  onSuccess: () => void | Promise<void>;
  redirectTo: string;
  /** When set, the mode switch is a link (full pages) rather than a toggle (modal). */
  modeHref?: Record<AuthMode, string>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [google, setGoogle] = useState(false);

  useEffect(() => {
    getProviders()
      .then((p) => setGoogle(Boolean(p?.google)))
      .catch(() => setGoogle(false));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setError(null);
    setFields({});
    try {
      if (mode === "sign-up") {
        const res = await signUpAction({
          name: fd.get("name"),
          email,
          password,
          phone: fd.get("phone") || undefined,
        });
        if (!res.ok) {
          setError(res.error);
          setFields(res.fields ?? {});
          return;
        }
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("That email and password don't match an account.");
        return;
      }
      await onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const switchTo = (m: AuthMode) =>
    modeHref ? (
      <Link href={modeHref[m]} className="text-gold-ink hover:text-gold-ink font-medium">
        {m === "sign-in" ? "Sign in" : "Create one"}
      </Link>
    ) : (
      <button type="button" onClick={() => onModeChange?.(m)} className="text-gold-ink hover:text-gold-ink font-medium">
        {m === "sign-in" ? "Sign in" : "Create one"}
      </button>
    );

  return (
    <div className="space-y-5">
      {google && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { redirectTo })}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-line bg-canvas hover:border-ink/40 py-3 text-sm font-medium transition-colors"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-3" noValidate>
        {mode === "sign-up" && (
          <Field label="Full name" error={fields.name}>
            <input name="name" autoComplete="name" required className={input} placeholder="Aisha Khan" />
          </Field>
        )}
        <Field label="Email" error={fields.email}>
          <input name="email" type="email" autoComplete="email" required className={input} placeholder="you@example.com" />
        </Field>
        <Field label="Password" error={fields.password} hint={mode === "sign-up" ? "At least 8 characters" : undefined}>
          <input
            name="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
            minLength={mode === "sign-up" ? 8 : undefined}
            className={input}
          />
        </Field>
        {mode === "sign-up" && (
          <Field label="Phone (optional)" error={fields.phone} hint="So agents can confirm viewings on WhatsApp">
            <input name="phone" type="tel" autoComplete="tel" className={input} placeholder="+971 50 000 0000" />
          </Field>
        )}

        {error && (
          <p role="alert" className="text-sm text-warn">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="w-full rounded-full bg-gold hover:bg-gold-soft disabled:opacity-60 text-ink text-sm font-semibold py-3 transition-colors"
        >
          {busy ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted text-center">
        {mode === "sign-in" ? <>New here? {switchTo("sign-up")}</> : <>Already have an account? {switchTo("sign-in")}</>}
      </p>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-ink/80">{label}</span>
      {children}
      {error ? <span className="block text-xs text-warn">{error}</span> : hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
