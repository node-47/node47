#!/usr/bin/env python3
"""Task 14-15 — Lot SEO & partage : patches des fichiers existants de /tmp/my-project."""
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


# ---------------------------------------------------------------- P1 : picks.ts
patch(
    "lib/picks.ts",
    "/** Début de la fenêtre de suivi : minuit UTC il y a (TRACKING_WINDOW_DAYS - 1) jours */",
    """/**
 * Vrai si la publication appartient à l'édition en cours (même jour d'édition que « now »).
 * Utilisé pour le badge « Nouveau » des cartes : bascule automatiquement à 8 h UTC.
 */
export function isFromTodayEdition(
  publishedAt: Date | string | null | undefined,
  now = new Date()
): boolean {
  if (!publishedAt) return false;
  return editionDayOf(publishedAt).getTime() === editionDayOf(now).getTime();
}

/** Début de la fenêtre de suivi : minuit UTC il y a (TRACKING_WINDOW_DAYS - 1) jours */""",
)

# ---------------------------------------------------------------- P2 : layout racine
patch(
    "app/layout.tsx",
    'import { Toaster } from "@/components/ui/toaster";',
    'import { getSiteUrl } from "@/lib/site";\nimport { Toaster } from "@/components/ui/toaster";',
)
patch(
    "app/layout.tsx",
    """export const metadata: Metadata = {
  title: {
    default: "NODE.47 — Intelligence Sportive & Décision de Marché",
    template: "%s · NODE.47",
  },
  description:
    "Sélections sportives publiées avec rigueur : marchés retenus, statistiques clés et synthèses de décisions sur le football, le basketball et le tennis.",
  keywords: [
    "analyses sportives",
    "sélections",
    "football",
    "basketball",
    "tennis",
    "marchés sportifs",
    "NODE.47",
  ],
  openGraph: {
    title: "NODE.47 — Intelligence Sportive & Décision de Marché",
    description:
      "Marchés retenus, statistiques clés et synthèses de décisions. Football, Basketball, Tennis.",
    siteName: "NODE.47",
    type: "website",
  },
};""",
    """export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "NODE.47 — Intelligence Sportive & Décision de Marché",
    template: "%s · NODE.47",
  },
  description:
    "Sélections sportives publiées avec rigueur : marchés retenus, statistiques clés et synthèses de décisions sur le football, le basketball et le tennis.",
  keywords: [
    "analyses sportives",
    "sélections",
    "football",
    "basketball",
    "tennis",
    "marchés sportifs",
    "NODE.47",
  ],
  applicationName: "NODE.47",
  openGraph: {
    title: "NODE.47 — Intelligence Sportive & Décision de Marché",
    description:
      "Marchés retenus, statistiques clés et synthèses de décisions. Football, Basketball, Tennis.",
    siteName: "NODE.47",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NODE.47 — Intelligence Sportive & Décision de Marché",
    description:
      "Marchés retenus, statistiques clés et synthèses de décisions. Football, Basketball, Tennis.",
  },
};""",
)

# ---------------------------------------------------------------- P3 : accueil (canonical)
patch(
    "app/(site)/page.tsx",
    'export const dynamic = "force-dynamic";',
    """export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};""",
)

# ---------------------------------------------------------------- P4 : /analyses (canonical)
patch(
    "app/(site)/analyses/page.tsx",
    """export const metadata = {
  title: "Analyses publiées",""",
    """export const metadata = {
  alternates: { canonical: "/analyses" },
  title: "Analyses publiées",""",
)

# ---------------------------------------------------------------- P5 : /performance (canonical)
patch(
    "app/(site)/performance/page.tsx",
    """export const metadata = {
  title: "Suivi de performance",""",
    """export const metadata = {
  alternates: { canonical: "/performance" },
  title: "Suivi de performance",""",
)

# ---------------------------------------------------------------- P6 : /a-propos (canonical)
patch(
    "app/(site)/a-propos/page.tsx",
    """export const metadata = {
  title: "À propos",""",
    """export const metadata = {
  alternates: { canonical: "/a-propos" },
  title: "À propos",""",
)

print("Patchs 1-6 appliqués.")
