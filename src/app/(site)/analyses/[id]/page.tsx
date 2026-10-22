import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { picks } from "../../../../../db/schema";
import { db } from "@/lib/db";
import {
  decodePick,
  formatDateTime,
  formatMatchShort,
  formatOdds,
  formatSignedUnits,
  formatStake,
  inWordsFr,
  timeAgoFr,
  unitsProfit,
  stakeOf,
  SPORT_LABELS,
  VERDICT_LABELS,
  CONFIDENCE_LABELS,
  type Sport,
  type Confidence,
  type Verdict,
} from "@/lib/picks";
import { truncateForMeta } from "@/lib/site";
import { NextEditionCountdown } from "@/components/next-edition-countdown";
import {
  SportTag,
  CompetitionChip,
  VerdictBadge,
  ResultBadge,
  ConfidenceGauge,
} from "@/components/badges";
import { PickCard } from "@/components/pick-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Adjectifs de confiance accordés au féminin (la confiance) pour la méta description */
const CONFIDENCE_FR_LOW: Record<Confidence, string> = {
  FAIBLE: "faible",
  MODERE: "modérée",
  ELEVE: "élevée",
  TRES_ELEVE: "très élevée",
};

/** Méta description (~155 caractères) : affiche, marché, verdict, confiance */
function ficheMetaDescription(pick: typeof picks.$inferSelect): string {
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
}

/** « Arsenal vs Chelsea » → « vs » atténué */
function MatchTitle({ name, className }: { name: string; className?: string }) {
  const parts = name.split(/\s+vs\s+/i);
  if (parts.length === 2) {
    return (
      <h1 className={className}>
        {parts[0]}{" "}
        <em className="text-[0.8em] font-normal not-italic text-muted-foreground">vs</em>{" "}
        {parts[1]}
      </h1>
    );
  }
  return <h1 className={className}>{name}</h1>;
}

export default async function PickDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pick = await db.pick.findUnique({ where: { id } });

  if (!pick || pick.status !== "PUBLISHED") {
    notFound();
  }

  const p = decodePick(pick);
  const profit = unitsProfit(p);
  const stake = stakeOf(p.confidence);
  const isSettled = ["WON", "LOST", "PUSH", "VOID"].includes(p.result);
  const confKey = (p.confidence as Confidence) in CONFIDENCE_LABELS ? (p.confidence as Confidence) : "MODERE";

  // Analyses liées (même sport, publiées)
  const relatedRaw = await db.pick.findMany({
    where: { status: "PUBLISHED", sport: p.sport, id: { not: p.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const related = relatedRaw.map(decodePick);

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

  const published = timeAgoFr(p.publishedAt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Retour */}
      <Link
        href="/analyses"
        className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
      >
        <span className="font-mono text-[15px] transition-transform group-hover:-translate-x-0.5">
          ←
        </span>
        Toutes les analyses
      </Link>

      {/* ============ En-tête façon « modal » ============ */}
      <article className="mt-7 animate-rise">
        <div className="flex flex-wrap items-center gap-3">
          <SportTag sport={p.sport} />
          <CompetitionChip competition={p.competition} />
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {formatMatchShort(p.matchDate)}
          </span>
        </div>

        <MatchTitle
          name={p.matchName}
          className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <VerdictBadge verdict={p.verdict} />
          {p.status === "PUBLISHED" && <ResultBadge result={p.result} />}
          {p.result === "PENDING" && inWordsFr(p.matchDate) && (
            <span className="inline-flex items-center rounded-md border border-warning/45 bg-warning/12 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-warning">
              À venir · {inWordsFr(p.matchDate)}
            </span>
          )}
        </div>

        {/* Bannière de résultat si réglé */}
        {isSettled && (
          <div
            className={cn(
              "mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-5",
              p.result === "WON" && "border-success/35 bg-success/8",
              p.result === "LOST" && "border-destructive/35 bg-destructive/8",
              (p.result === "PUSH" || p.result === "VOID") && "border-border bg-secondary"
            )}
          >
            <div className="flex items-center gap-3">
              <ResultBadge result={p.result} />
              {p.resultNote && (
                <span className="text-sm text-muted-foreground">{p.resultNote}</span>
              )}
            </div>
            {stake === 0 ? (
              <span className="font-mono text-lg font-semibold text-muted-foreground">
                Mise nulle — 0 u
              </span>
            ) : (
              <>
                {profit !== null && profit !== 0 && (
                  <span
                    className={cn(
                      "font-mono text-xl font-semibold",
                      profit > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {formatSignedUnits(profit)}
                  </span>
                )}
                {profit === 0 && (
                  <span className="font-mono text-lg font-semibold text-muted-foreground">
                    ±0,00 u
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Marché retenu — panneau */}
        <section
          className="mt-6 rounded-[9px] border border-border border-l-2 border-l-primary bg-secondary px-5 py-[18px] sm:px-5"
          aria-labelledby="market-title"
        >
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Marché
              </dt>
              <dd className="mt-1 font-mono text-sm">{p.market || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sélection
              </dt>
              <dd className="mt-1 font-mono text-sm">{p.selection || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Ligne
              </dt>
              <dd className={cn("mt-1 font-mono text-sm", !p.line && "text-muted-foreground")}>
                {p.line || "N/D"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Cote
              </dt>
              <dd
                className={cn(
                  "mt-1 font-mono text-sm",
                  p.odds == null && "text-muted-foreground"
                )}
              >
                {p.odds != null ? formatOdds(p.odds) : "N/D"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Condition d'exécution */}
        {p.verdict === "JE_JOUE_SOUS_CONDITION" && p.condition && (
          <div className="cond-panel mt-[18px] flex items-start gap-[14px] rounded-[9px] px-[18px] py-[14px]">
            <span className="whitespace-nowrap pt-[3px] font-display text-[10px] font-bold uppercase tracking-[0.16em] text-warning">
              Condition
            </span>
            <p className="text-[13.5px] leading-relaxed text-foreground">{p.condition}</p>
          </div>
        )}

        {/* Confiance + mise */}
        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-4 rounded-[9px] border border-border px-[18px] py-[14px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Confiance
          </span>
          <span className="flex items-center gap-3">
            <ConfidenceGauge confidence={p.confidence} size="big" />
            <b className="font-mono text-sm">{CONFIDENCE_LABELS[confKey].toUpperCase()}</b>
          </span>
          <span className="rounded-md border border-border px-[7px] py-[3px] font-mono text-[11px] text-muted-foreground">
            {formatStake(stake)}
          </span>
        </div>

        {/* Lecture du match */}
        <section className="mt-6" aria-labelledby="scenario-title">
          <h2
            id="scenario-title"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Lecture du match
          </h2>
          <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-relaxed text-foreground/95">
            {p.scenarioSummary || "Résumé à venir."}
          </p>
        </section>

        {/* Points clés de convergence */}
        {p.keyPoints.length > 0 && (
          <section className="mt-5" aria-labelledby="points-title">
            <h2
              id="points-title"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Ce qui a pesé dans la décision
            </h2>
            <ul className="mt-3 space-y-2">
              {p.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="text-[14px] leading-relaxed text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Statistiques clés — grille */}
        {p.keyStats.length > 0 && (
          <section className="mt-6" aria-labelledby="stats-title">
            <h2
              id="stats-title"
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Statistiques clés
            </h2>
            <dl className="grid gap-px overflow-hidden rounded-[9px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {p.keyStats.map((stat, i) => (
                <div key={`${stat.label}-${i}`} className="bg-card px-4 py-3.5">
                  <dd className="font-mono text-[17px] font-semibold text-primary">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    {stat.label}
                  </dt>
                  {stat.detail && (
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground/70">
                      {stat.detail}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Scénario alternatif */}
        {p.alternativeScenario && (
          <section className="mt-5 rounded-lg border border-border/70 bg-secondary/50 p-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Scénario alternatif
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p.alternativeScenario}
            </p>
          </section>
        )}

        {/* Synthèse */}
        {p.synthesis && (
          <section className="mt-6" aria-labelledby="synthesis-title">
            <h2
              id="synthesis-title"
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Synthèse
            </h2>
            <div className="synthese px-5 py-4 text-[14.5px] leading-[1.7] text-foreground">
              {p.synthesis}
            </div>
          </section>
        )}

        {/* Note de bas de fiche */}
        <p className="mt-6 border-t border-dashed border-border pt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {published && `Publié ${published} · `}
          Sélection réglée en public, quel que soit le résultat. Mise appliquée selon
          l&apos;échelle de confiance (0,5&nbsp;u à 2&nbsp;u). Jouer comporte des risques — 18+.
        </p>

        <NextEditionCountdown />
      </article>

      {/* Analyses liées */}
      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-title">
          <div className="mb-5 flex items-baseline gap-4">
            <span className="font-mono text-[13px] text-primary">+</span>
            <h2 id="related-title" className="font-display text-xl font-semibold tracking-tight">
              Autres analyses {SPORT_LABELS[p.sport as Sport].toLowerCase()}
            </h2>
            <Link
              href={`/${(p.sport as Sport).toLowerCase()}`}
              className="ml-auto text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tout voir
            </Link>
          </div>
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PickCard key={r.id} pick={r} />
            ))}
          </div>
        </section>
      )}

      {/* Navigation précédente / suivante (ordre de publication) */}
      {(previous || next) && (
        <nav aria-label="Navigation entre les analyses" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/analyses/${previous.id}`}
              className="card-hover group rounded-xl border border-border bg-card p-4"
            >
              <span className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
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
              className="card-hover group rounded-xl border border-border bg-card p-4 text-right"
            >
              <span className="flex items-center justify-end gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
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
}
