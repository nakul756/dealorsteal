"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Modal } from "../Modal";
import { AuthForm, type AuthMode } from "./AuthForm";

/**
 * Gated actions.
 *
 * `requireAuth(intent, run)` runs `run` straight away for signed-in users. Otherwise it opens the
 * sign-in modal; after an email sign-in/up the same `run` is called, so the action completes in place.
 *
 * Flows that leave the page (Google OAuth, or the full /sign-in page) come back with `?intent=<intent>`
 * in the URL. Components resume via `useResumeIntent(intent, fn)`, restoring any form draft they
 * stashed with `saveDraft` before asking for auth.
 */

type Gate = {
  requireAuth: (intent: string, run: () => void | Promise<void>, reason?: string) => void;
  openAuth: (mode?: AuthMode) => void;
  pendingIntent: string | null;
  clearIntent: () => void;
};

const GateContext = createContext<Gate | null>(null);

export function useAuthGate() {
  const g = use(GateContext);
  if (!g) throw new Error("useAuthGate must be used inside <AuthGateProvider>");
  return g;
}

/** Calls `run` once the user is signed in and the URL carries `?intent=<intent>`. */
export function useResumeIntent(intent: string, run: () => void) {
  const { pendingIntent, clearIntent } = useAuthGate();
  const { status } = useSession();
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => {
    if (status !== "authenticated" || pendingIntent !== intent) return;
    clearIntent();
    runRef.current();
  }, [status, pendingIntent, intent, clearIntent]);
}

// ----- drafts: survive the round-trip to Google / the sign-in page -----
const draftKey = (intent: string) => `dos:draft:${intent}`;
export function saveDraft(intent: string, data: unknown) {
  try {
    sessionStorage.setItem(draftKey(intent), JSON.stringify(data));
  } catch {}
}
export function takeDraft<T>(intent: string): T | null {
  try {
    const raw = sessionStorage.getItem(draftKey(intent));
    sessionStorage.removeItem(draftKey(intent));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function withIntent(path: string, intent?: string) {
  if (!intent) return path;
  const u = new URL(path, "http://x");
  u.searchParams.set("intent", intent);
  return u.pathname + u.search + u.hash;
}

function currentPath() {
  const u = new URL(window.location.href);
  u.searchParams.delete("intent");
  return u.pathname + u.search + u.hash;
}

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { status, update } = useSession();
  const pathname = usePathname();
  const [modal, setModal] = useState<{ mode: AuthMode; intent?: string; reason?: string } | null>(null);
  const pendingRun = useRef<(() => void | Promise<void>) | null>(null);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);

  // Pick up ?intent= after redirects (Google, /sign-in page).
  useEffect(() => {
    setPendingIntent(new URLSearchParams(window.location.search).get("intent"));
  }, [pathname]);

  const clearIntent = useCallback(() => {
    setPendingIntent(null);
    const u = new URL(window.location.href);
    if (u.searchParams.has("intent")) {
      u.searchParams.delete("intent");
      window.history.replaceState(window.history.state, "", u.pathname + u.search + u.hash);
    }
  }, []);

  const requireAuth = useCallback<Gate["requireAuth"]>(
    (intent, run, reason) => {
      if (status === "authenticated") {
        void run();
        return;
      }
      pendingRun.current = run;
      setModal({ mode: "sign-in", intent, reason });
    },
    [status],
  );

  const openAuth = useCallback((mode: AuthMode = "sign-in") => {
    pendingRun.current = null;
    setModal({ mode });
  }, []);

  const close = useCallback(() => {
    pendingRun.current = null;
    setModal(null);
  }, []);

  async function onSuccess() {
    await update();
    const run = pendingRun.current;
    pendingRun.current = null;
    setModal(null);
    if (run) await run();
  }

  return (
    <GateContext value={{ requireAuth, openAuth, pendingIntent, clearIntent }}>
      {children}
      <Modal
        open={modal !== null}
        onClose={close}
        title={modal?.mode === "sign-up" ? "Create your account" : "Sign in to continue"}
      >
        {modal && (
          <>
            <p className="text-sm text-muted mb-5 -mt-1">
              {modal.reason ??
                "Browsing is free. An account lets you save homes, book viewings and make offers — and keeps them in one place."}
            </p>
            <AuthForm
              key={modal.mode}
              mode={modal.mode}
              onModeChange={(m) => setModal({ ...modal, mode: m })}
              onSuccess={onSuccess}
              redirectTo={typeof window === "undefined" ? "/" : withIntent(currentPath(), modal.intent)}
            />
          </>
        )}
      </Modal>
    </GateContext>
  );
}
