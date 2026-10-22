/**
 * Contacts officiels NODE.47 + logos de marque (SVG inline).
 * Gmail : logo officiel multicolore ; Telegram : cercle bleu #229ED9.
 */

export const CONTACT_EMAIL = "node47tradingsportif@gmail.com";
export const CONTACT_TELEGRAM_URL = "https://t.me/node_47";
export const CONTACT_TELEGRAM_LABEL = "t.me/node_47";

export function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4caf50"
        d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"
      />
      <path
        fill="#1e88e5"
        d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"
      />
      <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
      <path
        fill="#c62828"
        d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"
      />
      <path
        fill="#fbc02d"
        d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z"
      />
    </svg>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#229ED9"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
      />
    </svg>
  );
}

/** Pastilles compactes de contact (footer, toutes les pages). */
export function ContactPills({ className = "" }: { className?: string }) {
  const pill =
    "inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-[7px] text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary";
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <a href={`mailto:${CONTACT_EMAIL}`} className={pill} aria-label={`Écrire à NODE.47 : ${CONTACT_EMAIL}`}>
        <GmailIcon className="h-[15px] w-[15px]" />
        <span>{CONTACT_EMAIL}</span>
      </a>
      <a
        href={CONTACT_TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={pill}
        aria-label="Telegram NODE.47 : t.me/node_47"
      >
        <TelegramIcon className="h-[15px] w-[15px]" />
        <span>{CONTACT_TELEGRAM_LABEL}</span>
      </a>
    </div>
  );
}
