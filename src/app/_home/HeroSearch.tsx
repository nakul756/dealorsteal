"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EXAMPLES = ["2-bed in Marina under 3M near metro", "Best yield under 1M", "Villa on the Palm"];

const CHIPS = [
  { label: "Steals in JVC", q: "Fairly priced apartments in JVC" },
  { label: "Family homes in Dubai Hills", q: "Family townhouse in Dubai Hills" },
  { label: "Highest rental yield", q: "Which area has the best rental yield?" },
];

/** Cycles through EXAMPLES: type → hold → delete → next. */
function useTypewriter(enabled: boolean) {
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const full = EXAMPLES[i];

  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && len < full.length) t = setTimeout(() => setLen(len + 1), 55 + Math.random() * 40);
    else if (!deleting) t = setTimeout(() => setDeleting(true), 1800);
    else if (len > 0) t = setTimeout(() => setLen(len - 1), 22);
    else
      t = setTimeout(() => {
        setDeleting(false);
        setI((i + 1) % EXAMPLES.length);
      }, 300);
    return () => clearTimeout(t);
  }, [enabled, len, deleting, full, i]);

  return { text: enabled ? full.slice(0, len) : EXAMPLES[0], full };
}

export function HeroSearch() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const animate = !reduced && !focused && value === "";
  const { text, full } = useTypewriter(animate);

  const go = (q: string) => router.push(`/agent?q=${encodeURIComponent(q.trim())}`);

  return (
    <div className="mt-9 max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value.trim() || full);
        }}
        className="group relative flex items-center rounded-full glass bg-white/65 border border-white/80 focus-within:border-gold/70 transition-colors"
      >
        <svg className="ml-5 shrink-0 text-gold-ink" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
          <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
        </svg>
        <div className="relative flex-1 min-w-0">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Ask the agent what you're looking for"
            placeholder={focused ? "Describe the home you want…" : ""}
            className="w-full bg-transparent pl-3 pr-2 py-5 sm:py-6 text-base sm:text-lg text-ink outline-none placeholder:text-muted"
          />
          {!focused && value === "" && (
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 right-2 flex items-center text-base sm:text-lg text-muted truncate">
              {text}
              {!reduced && <span className="ml-0.5 inline-block h-5 w-px bg-gold animate-caret" />}
            </span>
          )}
        </div>
        <button className="mr-2 sm:mr-2.5 shrink-0 rounded-full bg-gold hover:bg-gold-soft text-ink text-sm font-semibold px-4 sm:px-5 py-3 sm:py-3.5 transition-colors">
          <span className="hidden sm:inline">Ask the agent</span>
          <span className="sm:hidden" aria-label="Ask the agent">
            →
          </span>
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => go(c.q)}
            className="rounded-full border border-white/70 bg-white/45 backdrop-blur px-3.5 py-1.5 text-[0.8rem] text-ink/80 hover:text-ink hover:border-gold/60 transition-colors"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
