import { Logo } from "./logo";
import { FooterDisclaimer } from "./footer-disclaimer";
import { ContactPills } from "./contact-links";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-[34px] sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="font-display text-[13px] font-semibold text-foreground">
              NODE.47 — Trader Intelligence
            </span>
            <span className="rounded border border-border px-[7px] py-[2px] font-display text-[10px] font-bold tracking-[0.08em] text-muted-foreground">
              18+
            </span>
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            FOOTBALL · BASKETBALL · TENNIS
          </span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-border pb-4">
          <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Contact
          </span>
          <ContactPills />
        </div>

        <FooterDisclaimer />

        <p className="mt-4 border-t border-border pt-4 text-[11.5px] text-muted-foreground">
          © {year} NODE.47 — Trader Intelligence. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
