import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** /robots.txt — indexation du site public, exclusion console + API, sitemap déclaré */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
