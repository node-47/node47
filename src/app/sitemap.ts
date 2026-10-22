import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * /sitemap.xml — 4 pages statiques + toutes les fiches publiées.
 * force-dynamic : la base n'est jamais interrogée au build (déploiement Docker/Vercel).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/analyses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/performance`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/a-propos`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const picks = await db.pick.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, updatedAt: true },
    });
    return [
      ...statics,
      ...picks.map((p) => ({
        url: `${base}/analyses/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // Base indisponible (ex. build sans DATABASE_URL) : sitemap minimal
    return statics;
  }
}
