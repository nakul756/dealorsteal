import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Deal or Steal home">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="1" y="1" width="26" height="26" rx="7" stroke="#a87d34" strokeWidth="1.4" />
        <rect x="9" y="9" width="10" height="10" rx="2" stroke="#a87d34" strokeWidth="1.4" transform="rotate(45 14 14)" />
        <circle cx="14" cy="14" r="1.6" fill="#a87d34" />
      </svg>
      <span className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-ink leading-none">
        Deal <span className="text-muted font-medium">or</span> Steal
      </span>
    </Link>
  );
}
