"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useAuthGate } from "./auth/AuthGate";

const links = [
  { href: "/properties", label: "Properties" },
  { href: "/price-check", label: "Price check" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const overHero = path === "/";
  const { data: session, status } = useSession();
  const { openAuth } = useAuthGate();

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`${overHero ? "absolute" : "sticky"} top-0 inset-x-0 z-40 px-3 sm:px-4 pt-3`}
    >
      <nav className="mx-auto max-w-7xl h-16 rounded-full glass border border-white/70 pl-5 pr-2.5 sm:pl-6 flex items-center justify-between gap-4">
        <Logo />
        <ul className="hidden lg:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`transition-colors hover:text-ink ${path.startsWith(l.href) ? "text-ink" : "text-ink/65"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <span className="h-9 w-9 rounded-full bg-panel-2 animate-pulse" aria-hidden />
          ) : session?.user ? (
            <AvatarMenu name={session.user.name ?? session.user.email ?? "Account"} email={session.user.email ?? ""} />
          ) : (
            <button onClick={() => openAuth("sign-in")} className="text-sm text-ink/85 hover:text-ink px-3 py-2">
              Sign in
            </button>
          )}
          <Link
            href="/agent"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            Ask the agent
          </Link>
          <button className="lg:hidden p-2 text-ink" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open}>
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden mx-auto max-w-7xl mt-2 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl shadow-amber-950/10 px-5 py-3">
          {[{ href: "/", label: "Home" }, ...links, { href: "/agent", label: "Ask the agent" }].map((l) => (
            <Link key={l.href} href={l.href} className="block py-2.5 text-[0.95rem] text-ink/90">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function AvatarMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "block w-full text-left px-4 py-2.5 text-sm text-ink/85 hover:bg-gold/10 hover:text-ink";
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="h-9 w-9 rounded-full bg-gold/15 border border-gold/50 text-gold-ink text-xs font-semibold grid place-items-center hover:bg-gold/25"
      >
        {initials || "?"}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl shadow-amber-950/10 py-2 animate-pop-in">
          <div className="px-4 pb-2 mb-1 border-b border-line">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted truncate">{email}</p>
          </div>
          <Link role="menuitem" href="/account" className={item}>
            Account
          </Link>
          <Link role="menuitem" href="/account?tab=saved" className={item}>
            Saved homes
          </Link>
          <button role="menuitem" onClick={() => signOut({ redirectTo: "/" })} className={`${item} border-t border-line mt-1`}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
