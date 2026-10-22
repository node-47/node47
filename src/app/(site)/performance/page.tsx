import Link from "next/link";
import { db } from "@/lib/db";
import {
  decodePick,
  summarize,
  isInTrackingWindow,
  trackingWindowStart,
  formatTrackingPeriod,
  TRACKING_WINDOW_DAYS,
  unitsProfit,
  stakeOf,
  formatStake,
  formatDateTime,
  formatOdds,
  formatSignedUnits,
  formatPercent,
  SPORT_LABELS,
  type Sport,
} from "@/lib/picks";
import { SportChip, ResultBadge } from "@/components/badges";
import { UnitsChart, type CumulativePoint } from "@/components/units-chart";
import { LineChart } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/performance" },
  title: "Performances",
  description:
    "Chaque verdict est réglé en public : résultats, unités et rendement, sans filtre — suivi glissant sur 30 jours.",
};

export default async function PerformancePage() {
  const from = trackingWindowStart();
  const allPublished = await db.pick.findMany({ where: { status: "PUBLISHED" } });

  // Fenêtre de suivi : réglées dans les 30 derniers jours, ou en attente et publiées dans la fenêtre
  const picks = allPublished
    .filter((p) => isInTrackingWindow(p, from))
    .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime());

  const summary = summarize(picks);
  const pendingPicks = picks
    .filter((p) => p.result === "PENDING")
    .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());

  // Courbe cumulative : décisions réglées, triées par date de règlement
  const settledPlayed = picks
    .filter((p) => p.result === "WON" || p.result === "LOST")
    .sort((a, b) => {
      const da = a.settledAt ?? a.matchDate;
      const db_ = b.settledAt ?? b.matchDate;
      return da.getTime() - db_.getTime();
    });

  const chartData: CumulativePoint[] = settledPlayed.map((p, i) => {
    const cumulative = settledPlayed
      .slice(0, i + 1)
      .reduce((acc, prev) => acc + (unitsProfit(prev) ?? 0), 0);
    return {
      label: `${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(p.settledAt ?? p.matchDate)} #${i + 1}`,
      cumulative: Math.round(cumulative * 100) / 100,
    };
  });

  // Détail par sport
  const perSport = (["FOOTBALL", "BASKETBALL", "TENNIS"] as Sport[]).map((sport) => {
    const list = picks.filter((p) => p.sport === sport);
    return { sport, label: SPORT_LABELS[sport], perf: summarize(list) };
  });

  // Historique de la fenêtre (publié)
  const history = picks.map(decodePick);

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
              <LineChart size={28} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
                Performances
              </h1>
              <p className="mt-1 max-w-[560px] text-[14.5px] text-muted-foreground">
                Chaque verdict est réglé en public : résultats, unités et rendement, sans filtre.
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-muted-foreground/70">
                {TRACKING_WINDOW_DAYS} DERNIERS JOURS · {formatTrackingPeriod().toUpperCase()}
              </p>
            </div>
          </div>
          <div className="hidden gap-[30px] sm:flex">
            <div className="text-right">
              <b className="block font-mono text-[22px] font-semibold text-primary">
                {picks.length}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                sélections
              </span>
            </div>
            <div className="text-right">
              <b
                className={`block font-mono text-[22px] font-semibold ${
                  summary.units < 0 ? "text-destructive" : "text-primary"
                }`}
              >
                {summary.settledCount > 0 ? formatSignedUnits(summary.units) : "—"}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                unités nettes
              </span>
            </div>
            <div className="text-right">
              <b
                className={`block font-mono text-[22px] font-semibold ${
                  summary.roi != null && summary.roi < 0 ? "text-destructive" : "text-primary"
                }`}
              >
                {formatPercent(summary.roi)}
              </b>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                yield
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-[60px]">
        {/* Bandeau de chiffres */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Réglées", value: String(summary.settledCount), cls: "" },
            {
              label: "Réussite",
              value:
                summary.winRate != null
                  ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(summary.winRate)}%`
                  : "—",
              cls: "text-primary",
            },
            {
              label: "Unités nettes",
              value: summary.settledCount > 0 ? formatSignedUnits(summary.units) : "—",
              cls:
                summary.units > 0
                  ? "text-success"
                  : summary.units < 0
                    ? "text-destructive"
                    : "",
            },
            { label: "Yield", value: formatPercent(summary.roi), cls: "" },
            {
              label: "Misées · réglés",
              value: summary.staked > 0 ? formatStake(summary.staked) : "—",
              cls: "",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card px-6 py-6">
              <dd className={`font-mono text-[26px] font-bold leading-none ${s.cls}`}>{s.value}</dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>

        <p className="mt-4 max-w-[820px] text-[12.5px] leading-relaxed text-muted-foreground">
          <b className="text-foreground">Yield = unités nettes ÷ unités misées</b>, calculé sur les
          seules sélections réglées (gagnées ou perdues). Les annulées et les en attente sont
          exclues du calcul. {summary.pending} sélection(s) en attente de résultat
          {summary.void > 0 ? `, ${summary.void} annulée(s)` : ""}.
        </p>

        {/* Courbe + détail par sport */}
        <div className="mt-8 grid gap-[18px] lg:grid-cols-5">
          <section
            className="rounded-xl border border-border bg-card p-6 lg:col-span-3"
            aria-labelledby="chart-title"
          >
            <div className="flex items-center justify-between">
              <h2
                id="chart-title"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Évolution des unités nettes · {TRACKING_WINDOW_DAYS} jours
              </h2>
              <LineChart className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            {chartData.length > 1 ? (
              <div className="mt-4">
                <UnitsChart data={chartData} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                La courbe apparaîtra dès que plusieurs décisions auront été réglées au cours des{" "}
                {TRACKING_WINDOW_DAYS} derniers jours.
              </p>
            )}
          </section>

          {/* Par sport */}
          <section
            className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
            aria-labelledby="bysport-title"
          >
            <h2
              id="bysport-title"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Détail par sport · {TRACKING_WINDOW_DAYS} jours
            </h2>
            <div className="mt-4 space-y-3">
              {perSport.map((s) => (
                <div
                  key={s.sport}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-secondary/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.perf.played} jouée{s.perf.played > 1 ? "s" : ""}
                      {s.perf.settledCount > 0 ? ` · ${s.perf.won}V-${s.perf.lost}D` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      {s.perf.winRate != null
                        ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(s.perf.winRate)} %`
                        : "—"}
                    </p>
                    <p
                      className={`mt-0.5 font-mono text-xs ${
                        s.perf.units > 0
                          ? "text-success"
                          : s.perf.units < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.perf.settledCount > 0 ? formatSignedUnits(s.perf.units) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
              V = victoire de la sélection, D = défaite. Sélections remboursées ou annulées exclues
              du taux de réussite.
            </p>
          </section>
        </div>

        {/* En attente de règlement */}
        {pendingPicks.length > 0 && (
          <section
            className="mt-[18px] rounded-xl border border-border bg-card p-6"
            aria-labelledby="pending-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="pending-title"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                En attente de règlement
              </h2>
              <span className="rounded-md border border-border px-[7px] py-[3px] font-mono text-[11px] text-muted-foreground">
                {pendingPicks.length}
              </span>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPicks.map((p) => (
                <Link
                  key={p.id}
                  href={`/analyses/${p.id}`}
                  className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 transition-colors hover:border-[color:var(--accent-bd)]"
                >
                  <p className="truncate text-sm font-semibold">{p.matchName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {p.selection || p.market} · mise {formatStake(stakeOf(p.confidence))} ·{" "}
                    {formatDateTime(p.matchDate)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Historique */}
        <section className="mt-12" aria-labelledby="history-title">
          <div className="mb-5 flex flex-wrap items-baseline gap-4">
            <span className="font-mono text-[13px] text-primary">HISTORIQUE</span>
            <h2 id="history-title" className="font-display text-[23px] font-semibold tracking-tight">
              Sélections de la fenêtre
            </h2>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {history.length} au total
            </span>
          </div>

          {history.length > 0 ? (
            <div className="custom-scrollbar overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[860px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-border bg-secondary text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Sélection
                    </th>
                    <th scope="col" className="px-3 py-3.5 font-semibold">
                      Marché
                    </th>
                    <th scope="col" className="px-3 py-3.5 font-semibold">
                      Confiance
                    </th>
                    <th scope="col" className="px-3 py-3.5 font-semibold">
                      Statut
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right font-semibold">
                      Mise
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                      P&amp;L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => {
                    const profit = unitsProfit(p);
                    const stake = stakeOf(p.confidence);
                    const hasProfit = p.result !== "PENDING";
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/30"
                      >
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/analyses/${p.id}`}
                            className="font-display font-semibold transition-colors hover:text-primary"
                          >
                            {p.matchName}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.competition} ·{" "}
                            <span className="capitalize">{formatDateTime(p.matchDate)}</span>
                          </p>
                        </td>
                        <td className="px-3 py-3.5 font-mono text-xs">
                          {p.market}
                          {p.line ? ` ${p.line}` : ""}
                          {p.selection ? ` · ${p.selection}` : ""}
                        </td>
                        <td className="px-3 py-3.5">
                          <SportChip sport={p.sport} withLabel={false} iconSize={13} />
                        </td>
                        <td className="px-3 py-3.5">
                          <ResultBadge result={p.result} />
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-muted-foreground">
                          {formatStake(stake)}
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-mono font-semibold ${
                            !hasProfit || stake === 0
                              ? "text-muted-foreground"
                              : (profit ?? 0) > 0
                                ? "text-success"
                                : (profit ?? 0) < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {hasProfit && profit !== null && stake > 0
                            ? formatSignedUnits(profit)
                            : hasProfit && stake === 0
                              ? "0 u"
                              : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Aucune sélection publiée au cours des {TRACKING_WINDOW_DAYS} derniers jours.
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
            Mises appliquées selon l&apos;échelle de confiance : Faible 0,5&nbsp;u, Modéré
            1&nbsp;u, Élevé 1,5&nbsp;u, Très élevé 2&nbsp;u. Les cotes affichées sont celles
            observées au moment de la publication. Les performances passées ne préjugent pas des
            résultats futurs.
          </p>
        </section>
      </section>
    </div>
  );
}
