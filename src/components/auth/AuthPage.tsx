"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { AuthForm, type AuthMode } from "./AuthForm";

/** Only allow same-site relative paths, to avoid open redirects. */
export function safeCallback(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/account";
  return raw;
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const { status } = useSession();
  const qs = `?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  // Full reload so every client component picks up the fresh session cookie.
  const done = () => window.location.assign(callbackUrl);

  useEffect(() => {
    if (status === "authenticated") window.location.replace(callbackUrl);
  }, [status, callbackUrl]);

  const error = params.get("error");

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-6 pt-14 pb-10">
      <p className="eyebrow mb-3">{mode === "sign-in" ? "Welcome back" : "Free account"}</p>
      <h1 className="text-4xl leading-[1.05]">{mode === "sign-in" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-3 text-sm text-muted leading-relaxed">
        {mode === "sign-in"
          ? "Pick up where you left off — your saved homes, viewings and offers."
          : "Browsing is always free. An account lets you save homes, book viewings and make offers."}
      </p>
      {error && (
        <p role="alert" className="mt-5 rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
          {error === "CredentialsSignin" ? "That email and password don't match an account." : "Sign-in failed. Please try again."}
        </p>
      )}
      <div className="mt-8 rounded-2xl border border-line glass p-6">
        <AuthForm
          mode={mode}
          onSuccess={done}
          redirectTo={callbackUrl}
          modeHref={{ "sign-in": `/sign-in${qs}`, "sign-up": `/sign-up${qs}` }}
        />
      </div>
      <p className="mt-6 text-xs text-muted text-center">
        By continuing you agree to our{" "}
        <Link href="/legal/terms" className="underline underline-offset-2 hover:text-ink">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
