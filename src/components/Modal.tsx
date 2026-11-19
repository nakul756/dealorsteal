"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  // Callers pass inline closures; keep the latest without re-running the open/close effect.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Only the top-most dialog reacts, so Escape on the sign-in modal doesn't also close the form behind it.
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (e.key === "Escape" && dialogs[dialogs.length - 1] === panel.current) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  // Portal to <body> so ancestors (sticky sidebars, blurred headers) can't trap it in their stacking context.
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-canvas/50 backdrop-blur-md animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`relative w-full ${width} max-h-[calc(100svh-2rem)] overflow-y-auto glass bg-white/75 border border-white/80 rounded-3xl shadow-2xl shadow-amber-950/10 animate-pop-in`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 id={id} className="text-2xl font-semibold">
            {title}
          </h2>
          <button
            data-close
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 h-9 w-9 grid place-items-center rounded-full text-muted hover:text-ink hover:bg-panel-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
