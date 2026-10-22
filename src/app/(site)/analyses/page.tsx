import Link from "next/link";
import { db } from "@/lib/db";
import {
  decodePick,
  editionCalendarDays,
  editionDayLabel,
  editionDayOf,
  editionWindow,
  EDITION_WINDOW_DAYS,
  EDITION_HOUR_UTC,
  type Sport,
  type Verdict,
  type PickResult,
} from "@/lib/picks";
import { PickCard } from "@/components/pick-card";
import { SportIcon } from "@/components/sport-icon";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/analyses" },
  title: "Analyses publiées",
  description:
    "Les éditions NODE.47 des trois derniers jours : marchés retenus, statistiques clés et synthèses — football, basketball, tennis.",
};

const SPORTS: { value: Sport | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les sports" },
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "TENNIS", label: "Tennis" },
];

const RESULTS: { value: PickResult | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "WON", label: "Gagné" },
  { value: "LOST", label: "Perdu" },
];

const VERDICTS: { value: Verdict | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les verdicts" },
  { value: "JE_JOUE", label: "Je joue" },
  { value: "JE_JOUE_SOUS_CONDITION", label: "Sous condition" },
];

interface SearchParams {
  sport?: string;
  result?: string;
  verdict?: string;
}

function buildHref(params: SearchParams, key: string, value: string): string {
  const next = { ...params, [key]: value };
  const qs = Object.entries(next)
    .filter(([, v]) => v && v !== "ALL")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return qs ? `/analyses?${qs}` : "/analyses";
}

export default async function AnalysesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sport = sp.sport && SPORTS.some((s) => s.value === sp.sport) ? sp.sport : "ALL";
  const result = sp.result && RESULTS.some((r) => r.value === sp.result) ? sp.result : "ALL";
  const verdict = sp.verdict && VERDICTS.some((v) => v.value === sp.verdict) ? sp.verdict : "ALL";

  // Fenêtre publique : les 3 derniers jours d'édition (publication à partir de 8 h UTC)
  const days = editionCalendarDays(EDITION_WINDOW_DAYS);
  const windowStart = editionWindow(days[days.length - 1]).start;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    publishedAt: { gte: windowStart },
  };
  if (sport !== "ALL") where.sport = sport;
  if (verdict !== "ALL") where.verdict = verdict;
  if (result !== "ALL") where.result = result;

  const picks = await db.pick.findMany({ where });

  // Regroupement par jour d'édition, programme du jour ordonné chronologiquement
  const editions = days.map((day) => ({
    day,
    picks: picks
      .filter((p) => p.publishedAt && editionDayOf(p.publishedAt).getTime() === day.getTime())
      .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime())
      .map(decodePick),
  }));

  const total = editions.reduce((acc, e) => acc + e.picks.length, 0);

  const pillClass = (active: boolean) =>
    cn(
      "rounded-full border px-[15px] py-[7px] font-display text-xs font-semibold transition-colors",
      active
        ? "border-[color:var(--accent-bd)] bg-accent text-primary"
        : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
    );

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
            <span className="inline-flex h-[58px] w-[58px] flex-none items-center justify-center rounded-[14px] border border-border bg-card text-primary">
              <ListChecks size={28} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
                Analyses publiées
              </h1>
              <p className="mt-1 max-w-[560px] text-[14.5px] text-muted-foreground">
                Chaque sélection expose le marché retenu, les statistiques qui ont pesé dans la
                décision et la synthèse finale.
              </p>
            </div>
          </div>
          <div className="hidden gap-[30px] sm:flex">
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">{total}</b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                sélections
              </span>
            </div>
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">
                {EDITION_WINDOW_DAYS}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                éditions
              </span>
            </div>
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">
                {EDITION_HOUR_UTC}&nbsp;h
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                publication UTC
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-[60px]">
        {/* Filtres */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filtrer par sport">
            {SPORTS.map((s) => (
              <Link
                key={s.value}
                href={buildHref(sp, "sport", s.value)}
                scroll={false}
                className={cn(pillClass(sport === s.value), "inline-flex items-center gap-1.5")}
              >
                {s.value !== "ALL" && <SportIcon sport={s.value} size={14} />}
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par verdict">
              {VERDICTS.map((v) => (
                <Link
                  key={v.value}
                  href={buildHref(sp, "verdict", v.value)}
                  scroll={false}
                  className={cn(pillClass(verdict === v.value))}
                >
                  {v.label}
                </Link>
              ))}
            </div>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par résultat">
              {RESULTS.map((r) => (
                <Link
                  key={r.value}
                  href={buildHref(sp, "result", r.value)}
                  scroll={false}
                  className={cn(pillClass(result === r.value))}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Éditions jour par jour */}
        {total > 0 ? (
          <div className="mt-2">
            {editions.map(({ day, picks: dayPicks }) => {
              const label = editionDayLabel(day);
              return (
                <section key={day.toISOString()} className="mt-10 first:mt-8" aria-label={label.full}>
                  <div className="mb-6 flex items-baseline gap-4 border-b border-border pb-3">
                    <span className="font-mono text-[13px] text-primary">
                      {String(day.getUTCDate()).padStart(2, "0")}.{String(day.getUTCMonth() + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-xl font-semibold tracking-tight">
                      {label.relative ?? label.full}
                    </h2>
                    {label.relative && (
                      <span className="text-sm capitalize text-muted-foreground">{label.full}</span>
                    )}
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {dayPicks.length} sélection{dayPicks.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {dayPicks.length > 0 ? (
                    <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
                      {dayPicks.map((pick) => (
                        <PickCard key={pick.id} pick={pick} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      {label.relative === "Aujourd'hui"
                        ? "L'édition du jour est en préparation — les sélections paraissent à partir de 8 h UTC."
                        : "Aucune sélection ne correspond aux filtres pour cette édition."}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Note de sortie du fil */}
            <p className="mt-10 text-xs leading-relaxed text-muted-foreground/70">
              Les éditions plus anciennes quittent ce fil — leur bilan reste comptabilisé dans le{" "}
              <Link href="/performance" className="text-primary hover:underline">
                suivi glissant sur 30 jours
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border p-14 text-center">
            <p className="font-display text-lg font-semibold">Aucune analyse ne correspond</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez d&apos;élargir les filtres ou revenez bientôt — de nouvelles sélections sont
              publiées chaque jour à partir de 8&nbsp;h&nbsp;UTC.
            </p>
            <Link href="/analyses" className={cn(pillClass(false), "mt-6 inline-flex")}>
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
