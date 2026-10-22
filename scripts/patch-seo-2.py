#!/usr/bin/env python3
"""Task 14-15 — patchs fiche /analyses/[id], pick-card, admin layout, INSTALL.txt."""
import sys
import pathlib

SRC = pathlib.Path("/tmp/my-project/src")
ROOT = pathlib.Path("/tmp/my-project")


def patch(path: str, old: str, new: str, expect: int = 1) -> None:
    p = (SRC / path) if not path.startswith("/") else pathlib.Path(path)
    text = p.read_text(encoding="utf-8")
    n = text.count(old)
    if n != expect:
        print(f"ERREUR: ancre x{n} (attendu {expect}) dans {path} :\n---\n{old[:150]}\n---")
        sys.exit(1)
    p.write_text(text.replace(old, new), encoding="utf-8")
    print(f"OK  {path}")


# ---------------------------------------------- P7a : imports de la fiche
patch(
    "app/(site)/analyses/[id]/page.tsx",
    """import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Trophy, ListChecks } from "lucide-react";
import { db } from "@/lib/db";
import {
  decodePick,
  formatDateTime,
  formatOdds,
  formatUnits,
  formatStake,
  unitsProfit,
  stakeOf,
  SPORT_LABELS,
  type Sport,
} from "@/lib/picks";""",
    """import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Trophy, ListChecks } from "lucide-react";
import type { Pick } from "@prisma/client";
import { db } from "@/lib/db";
import {
  decodePick,
  formatDateTime,
  formatOdds,
  formatUnits,
  formatStake,
  unitsProfit,
  stakeOf,
  SPORT_LABELS,
  VERDICT_LABELS,
  type Sport,
  type Confidence,
  type Verdict,
} from "@/lib/picks";
import { truncateForMeta } from "@/lib/site";
import { NextEditionCountdown } from "@/components/next-edition-countdown";""",
)

# ---------------------------------------------- P7b : generateMetadata + helper
patch(
    "app/(site)/analyses/[id]/page.tsx",
    'export const dynamic = "force-dynamic";',
    """export const dynamic = "force-dynamic";

/** Adjectifs de confiance accordés au féminin (la confiance) pour la méta description */
const CONFIDENCE_FR_LOW: Record<Confidence, string> = {
  FAIBLE: "faible",
  MODERE: "modérée",
  ELEVE: "élevée",
  TRES_ELEVE: "très élevée",
};

/** Méta description (~155 caractères) : affiche, marché, verdict, confiance */
function ficheMetaDescription(pick: Pick): string {
  const marketBits = [pick.market, pick.selection, pick.line].filter(Boolean).join(" ");
  const odds = pick.odds != null ? ` @ ${formatOdds(pick.odds)}` : "";
  const verdictLabel = (VERDICT_LABELS[pick.verdict as Verdict] ?? "Je joue").toLowerCase();
  const confidenceLow = CONFIDENCE_FR_LOW[pick.confidence as Confidence] ?? "modérée";
  const base = `${pick.matchName} (${pick.competition})${marketBits ? ` : sélection ${marketBits}${odds}` : ""} — verdict ${verdictLabel}, confiance ${confidenceLow}.`;
  const tail = " Analyse complète sur NODE.47.";
  return truncateForMeta(base.length + tail.length <= 158 ? base + tail : base);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pick = await db.pick.findUnique({ where: { id } });

  // Brouillon / introuvable : jamais de fuite de contenu dans les métadonnées
  if (!pick || pick.status !== "PUBLISHED") {
    return { title: "Analyse introuvable", robots: { index: false, follow: false } };
  }

  const marketTitle = [pick.market, pick.selection].filter(Boolean).join(" ");
  const title = marketTitle ? `${pick.matchName} — ${marketTitle}` : pick.matchName;
  const description = ficheMetaDescription(pick);

  return {
    title,
    description,
    alternates: { canonical: `/analyses/${pick.id}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: pick.publishedAt?.toISOString(),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}""",
)

# ---------------------------------------------- P7c : requête analyses voisines
patch(
    "app/(site)/analyses/[id]/page.tsx",
    """  const related = relatedRaw.map(decodePick);

  return (""",
    """  const related = relatedRaw.map(decodePick);

  // Navigation : analyses voisines dans l'ordre de publication (toutes éditions)
  const siblings = p.publishedAt
    ? await db.pick.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "asc" },
        select: { id: true, matchName: true },
      })
    : [];
  const currentIdx = siblings.findIndex((s) => s.id === p.id);
  const previous = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (""",
)

# ---------------------------------------------- P7d : compte à rebours sous le disclaimer
patch(
    "app/(site)/analyses/[id]/page.tsx",
    """      </p>

      {/* Analyses liées */}""",
    """      </p>

      <NextEditionCountdown />

      {/* Analyses liées */}""",
)

# ---------------------------------------------- P7e : navigation précédente / suivante
patch(
    "app/(site)/analyses/[id]/page.tsx",
    """            ))}
          </div>
        </section>
      )}
    </div>
  );
}""",
    """            ))}
          </div>
        </section>
      )}

      {/* Navigation précédente / suivante (ordre de publication) */}
      {(previous || next) && (
        <nav aria-label="Navigation entre les analyses" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/analyses/${previous.id}`}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <ArrowLeft
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Analyse précédente
              </span>
              <span className="mt-1.5 block truncate font-display text-sm font-semibold transition-colors group-hover:text-primary">
                {previous.matchName}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}
          {next ? (
            <Link
              href={`/analyses/${next.id}`}
              className="group rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/40"
            >
              <span className="flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Analyse suivante
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1.5 block truncate font-display text-sm font-semibold transition-colors group-hover:text-primary">
                {next.matchName}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}
        </nav>
      )}
    </div>
  );
}""",
)

# ---------------------------------------------- P8 : pick-card (badge Nouveau)
patch(
    "components/pick-card.tsx",
    'import { formatDateTime, formatOdds, type DecodedPick } from "@/lib/picks";',
    'import { formatDateTime, formatOdds, isFromTodayEdition, type DecodedPick } from "@/lib/picks";',
)
patch(
    "components/pick-card.tsx",
    """        {pick.status === "PUBLISHED" && <ResultBadge result={pick.result} />}""",
    """        <div className="flex items-center gap-2">
          {pick.status === "PUBLISHED" && isFromTodayEdition(pick.publishedAt) && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"
              title="Publié dans l'édition du jour (bascule à 8 h UTC)"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Nouveau
            </span>
          )}
          {pick.status === "PUBLISHED" && <ResultBadge result={pick.result} />}
        </div>""",
)

# ---------------------------------------------- P9 : noindex console analyste
patch(
    "app/admin/(protected)/layout.tsx",
    """import { AdminLogoutButton } from "@/components/admin-logout";

export const dynamic = "force-dynamic";""",
    """import { AdminLogoutButton } from "@/components/admin-logout";
import type { Metadata } from "next";

/** La console analyste ne doit jamais être indexée */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";""",
)

# ---------------------------------------------- P10 : INSTALL.txt
patch(
    "/tmp/my-project/INSTALL.txt",
    """AVANT PUBLICATION — variables d'environnement à définir :
     ADMIN_PASSWORD=<votre mot de passe analyste>
     ADMIN_SECRET=<une phrase secrète aléatoire (signature de session)>
     DATABASE_URL=file:<chemin absolu>/db/custom.db""",
    """AVANT PUBLICATION — variables d'environnement à définir :
     ADMIN_PASSWORD=<votre mot de passe analyste>
     ADMIN_SECRET=<une phrase secrète aléatoire (signature de session)>
     DATABASE_URL=file:<chemin absolu>/db/custom.db
     NEXT_PUBLIC_SITE_URL=https://<votre-domaine>
     (URL canonique : référencée par les balises Open Graph/Twitter,
      le sitemap.xml et le robots.txt — la définir AVANT le build de production)

SEO & PARTAGE
-------------
- Open Graph : image de marque 1200×630 auto + image dynamique par fiche
  (affiche, marché, verdict, confiance)
- /sitemap.xml : 4 pages statiques + toutes les fiches publiées
- /robots.txt : généré par l'app (src/app/robots.ts), ligne Sitemap incluse,
  /admin et /api exclus de l'indexation
- Badge « Nouveau » sur les cartes de l'édition du jour (bascule à 8 h UTC)
- Navigation « Analyse précédente / suivante » en bas de chaque fiche
- Compte à rebours de la prochaine édition (8 h UTC) sous chaque fiche""",
)

print("Patchs 7-10 appliqués.")
