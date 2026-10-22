import Link from "next/link";
import { db } from "@/lib/db";
import {
  decodePick,
  editionCalendarDays,
  editionWindow,
  EDITION_WINDOW_DAYS,
  SPORT_LABELS,
  SPORT_TAGLINES,
  type Sport,
  type Verdict,
} from "@/lib/picks";
import { PickCard } from "@/components/pick-card";
import { SportIcon, sportAccent } from "@/components/sport-icon";
import { cn } from "@/lib/utils";

const VERDICT_FILTERS: { value: Verdict | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les verdicts" },
  { value: "JE_JOUE", label: "Je joue" },
  { value: "JE_JOUE_SOUS_CONDITION", label: "Sous condition" },
];

/**
 * Vue partagée des pages sport (football, basketball, tennis).
 * Fenêtre publique identique au fil /analyses : les 3 dernières éditions.
 */
export async function SportPageView({
  sport,
  verdict,
}: {
  sport: Sport;
  verdict: Verdict | "ALL";
}) {
  // Fenêtre publique : les 3 derniers jours d'édition (publication à partir de 8 h UTC)
  const days = editionCalendarDays(EDITION_WINDOW_DAYS);
  const windowStart = editionWindow(days[days.length - 1]).start;

  const all = await db.pick.findMany({
    where: { status: "PUBLISHED", sport, publishedAt: { gte: windowStart } },
  });

  const jejCount = all.filter((p) => p.verdict === "JE_JOUE").length;
  const pendingCount = all.filter((p) => p.result === "PENDING").length;

  const list = all
    .filter((p) => verdict === "ALL" || p.verdict === verdict)
    .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime())
    .map(decodePick);

  const label = SPORT_LABELS[sport];

  return (
    <div>
      {/* Retour */}
      <div className="mx-auto max-w-6xl px-4 pt-[22px] sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
        >
          <span className="font-mono text-[15px]">←</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      {/* Page-hero */}
      <section className="mt-6 border-b border-border pb-9 pt-2 [background:radial-gradient(640px_280px_at_10%_-20%,var(--accent-glow),transparent_70%)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-4 sm:px-6">
          <div className="flex items-center gap-[18px]">
            <span
              className={`inline-flex h-[58px] w-[58px] flex-none items-center justify-center rounded-[14px] border border-border bg-card ${sportAccent[sport].text}`}
            >
              <SportIcon sport={sport} size={30} />
            </span>
            <div>
              <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
                {label}
              </h1>
              <p className="mt-1 max-w-[560px] text-[14.5px] text-muted-foreground">
                {SPORT_TAGLINES[sport]}
              </p>
            </div>
          </div>
          <div className="hidden gap-[30px] sm:flex">
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">
                {all.length}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                analyses
              </span>
            </div>
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">{jejCount}</b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                « je joue »
              </span>
            </div>
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">
                {pendingCount}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                en attente
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres + grille */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-[60px]">
        <div className="mb-6 flex flex-wrap gap-6">
          {VERDICT_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "ALL" ? `/${sport.toLowerCase()}` : `/${sport.toLowerCase()}?verdict=${f.value}`}
              scroll={false}
              className={cn(
                "rounded-full border px-[15px] py-[7px] font-display text-xs font-semibold transition-colors",
                verdict === f.value
                  ? "border-[color:var(--accent-bd)] bg-accent text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {list.length > 0 ? (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {list.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-11 text-center text-sm text-muted-foreground">
            {all.length === 0
              ? `Aucune analyse ${label.toLowerCase()} sur les ${EDITION_WINDOW_DAYS} dernières éditions. Les sélections paraissent chaque jour à partir de 8 h UTC.`
              : "Aucune analyse pour ce filtre."}
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground/70">
          Fenêtre publique : {EDITION_WINDOW_DAYS} dernières éditions (publication quotidienne à
          partir de 8 h UTC). Le bilan complet reste consultable sur la{" "}
          <Link href="/performance" className="text-primary hover:underline">
            page Performances
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
