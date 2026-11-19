import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            The AI property agent that checks every Dubai listing against real Dubai Land Department
            transactions — so you know the fair price before you sign.
          </p>
          <p className="text-xs text-muted/80">Built on Dubai Land Department open data · data.dubai</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm text-ink/80">
            <li><Link href="/properties" className="hover:text-gold-ink">Properties</Link></li>
            <li><Link href="/agent" className="hover:text-gold-ink">AI Agent</Link></li>
            <li><Link href="/price-check" className="hover:text-gold-ink">Price Check</Link></li>
            <li><Link href="/insights" className="hover:text-gold-ink">Market Insights</Link></li>
            <li><Link href="/about" className="hover:text-gold-ink">About & Our Data</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Legal</p>
          <ul className="space-y-2 text-sm text-ink/80">
            <li><Link href="/legal/terms" className="hover:text-gold-ink">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-gold-ink">Privacy Policy</Link></li>
            <li><Link href="/legal/disclaimer" className="hover:text-gold-ink">Disclaimer</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <span>© 2026 Deal or Steal. Hackathon prototype.</span>
          <span>Estimates only — not an official valuation or financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
