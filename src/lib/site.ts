export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const url = new URL(configured || "https://node47.netlify.app");
    if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
  } catch { /* Use the canonical deployment URL if configuration is invalid. */ }
  return "https://node47.netlify.app";
}

export function truncateForMeta(text: string, maxLength = 158): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= maxLength ? normalized : normalized.slice(0, maxLength - 1).trimEnd() + "…";
}
