/** Nom de marque du site */
export const SITE_NAME = "NODE.47";

/**
 * URL canonique du site — issue de NEXT_PUBLIC_SITE_URL (défini à la publication),
 * repli sur localhost:3000 en développement. Sans slash final.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : "http://localhost:3000";
}

/** Tronque un texte pour une meta description (~155 caractères), sur une coupure de mot */
export function truncateForMeta(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
