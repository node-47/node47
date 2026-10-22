import Link from "next/link";
import { db } from "@/lib/db";
import {
  decodePick,
  summarize,
  isInTrackingWindow,
  trackingWindowStart,
  TRACKING_WINDOW_DAYS,
  SPORT_LABELS,
  SPORT_TAGLINES,
  formatSignedUnits,
  formatPercent,
  type Sport,
} from "@/lib/picks";
import { PickCard } from "@/components/pick-card";
import { SportIcon, sportAccent } from "@/components/sport-icon";
import { NewsletterForm } from "@/components/newsletter-form";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};

const PILLARS = [
  {
    num: "01",
    title: "Une décision, pas une liste",
    text: "Un seul marché par rencontre, avec la ligne exacte et la cote observée à la publication. Deux verdicts possibles — « Je joue » ou « Je joue sous condition ». Sans convergence des preuves, rien n'est publié.",
  },
  {
    num: "02",
    title: "La confiance fixe la mise",
    text: "Faible 0,5 u · Modéré 1 u · Élevé 1,5 u · Très élevé 2 u. L'échelle est fixe et publique : la mise découle mécaniquement du niveau de confiance de chaque sélection, jamais d'un ressenti.",
  },
  {
    num: "03",
    title: "Réglé en public, sur 30 jours",
    text: "Gagnée, perdue, remboursée ou annulée : chaque sélection est réglée et conservée dans une fenêtre glissante de 30 jours. Unités nettes et yield recalculés en continu — rien n'est effacé.",
  },
];

export default async function HomePage() {
  const picks = await db.pick.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  const decoded = picks.map(decodePick);
  const latest = decoded.slice(0, 6);

  // Chiffres clés alignés sur la fenêtre de suivi (30 derniers jours)
  const from = trackingWindowStart();
  const windowPicks = picks.filter((p) => isInTrackingWindow(p, from));
  const summary = summarize(windowPicks);

  const perSport = (["FOOTBALL", "BASKETBALL", "TENNIS"] as Sport[]).map((sport) => {
    const count = windowPicks.filter((p) => p.sport === sport).length;
    return {
      sport,
      label: SPORT_LABELS[sport],
      tagline: SPORT_TAGLINES[sport],
      count,
      accent: sportAccent[sport],
    };
  });

  const statCell = "bg-card px-6 py-6";

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="hero-fx" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-[68px] sm:pt-[76px]">
          <p className="animate-rise font-mono text-[11px] tracking-[0.3em] text-primary">
            FOOTBALL · BASKETBALL · TENNIS
          </p>
          <h1 className="animate-rise-delay-1 mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-[56px]">
            L&apos;intelligence sportive,
            <br />
            <span className="text-glow">la décision avant le bruit.</span>
          </h1>
          <p className="animate-rise-delay-2 mt-6 max-w-[580px] text-[16.5px] leading-relaxed text-muted-foreground">
            NODE.47 publie le résultat final d&apos;un travail d&apos;analyse rigoureux mené en
            coulisses : les marchés retenus, les statistiques qui comptent et la synthèse de chaque
            décision. Rien de superflu.
          </p>

          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/analyses"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:shadow-[0_0_28px_var(--accent-glow)]"
            >
              Voir les analyses
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/notre-approche"
              className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Notre approche
            </Link>
          </div>

          {/* Bandeau de chiffres */}
          <dl className="animate-rise-delay-3 mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            <div className={statCell}>
              <dd className="font-mono text-[30px] font-bold leading-none">{summary.published}</dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Sélections ({TRACKING_WINDOW_DAYS}&nbsp;j)
              </dt>
            </div>
            <div className={statCell}>
              <dd className="font-mono text-[30px] font-bold leading-none">
                {summary.winRate != null ? `${Math.round(summary.winRate)}%` : "—"}
              </dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Réussite ({TRACKING_WINDOW_DAYS}&nbsp;j)
              </dt>
            </div>
            <div className={statCell}>
              <dd className="font-mono text-[30px] font-bold leading-none">{summary.pending}</dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                En attente
              </dt>
            </div>
            <div className={statCell}>
              <dd
                className={`font-mono text-[30px] font-bold leading-none ${
                  summary.settledCount === 0
                    ? ""
                    : summary.units > 0
                      ? "text-success"
                      : summary.units < 0
                        ? "text-destructive"
                        : ""
                }`}
              >
                {summary.settledCount > 0 ? formatSignedUnits(summary.units) : "—"}
              </dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Unités nettes ({TRACKING_WINDOW_DAYS}&nbsp;j)
              </dt>
            </div>
            <div className={`${statCell} max-lg:col-span-2 sm:max-lg:col-span-1`}>
              <dd
                className={`font-mono text-[30px] font-bold leading-none ${
                  summary.roi != null && summary.roi < 0 ? "text-destructive" : ""
                }`}
              >
                {formatPercent(summary.roi)}
              </dd>
              <dt className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Yield · réglés
              </dt>
            </div>
          </dl>
          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
            Fenêtre glissante de {TRACKING_WINDOW_DAYS} jours, recalculée en continu
          </p>
        </div>
      </section>

      {/* ================= DERNIÈRES ANALYSES ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-[60px]" id="dernieres">
        <div className="mb-6 flex items-baseline gap-4">
          <span className="font-mono text-[13px] text-primary">01</span>
          <h2 className="font-display text-[23px] font-semibold tracking-tight">
            Dernières analyses
          </h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {picks.length} publiée{picks.length > 1 ? "s" : ""}
          </span>
        </div>

        {latest.length > 0 ? (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-11 text-center text-sm text-muted-foreground">
            Aucune analyse publiée pour le moment.
          </div>
        )}

        {latest.length > 0 && (
          <Link
            href="/analyses"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Toutes les analyses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </section>

      {/* ================= EXPLORER PAR SPORT ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-[60px]">
        <div className="mb-6 flex items-baseline gap-4">
          <span className="font-mono text-[13px] text-primary">02</span>
          <h2 className="font-display text-[23px] font-semibold tracking-tight">
            Explorer par sport
          </h2>
        </div>

        <div className="grid gap-[18px] md:grid-cols-3">
          {perSport.map((s) => (
            <Link
              key={s.sport}
              href={`/${s.sport.toLowerCase()}`}
              className="card-hover group relative rounded-xl border border-border bg-card p-6"
            >
              <ArrowUpRight
                className="absolute right-[22px] top-6 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
              <span
                className={`inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl ${s.accent.bg} ${s.accent.text}`}
              >
                <SportIcon sport={s.sport} size={24} />
              </span>
              <span className="mt-3.5 block font-display text-[19px] font-semibold">
                {s.label}
              </span>
              <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
                {s.tagline}
              </span>
              <span className="mt-4 block font-mono text-xs text-muted-foreground">
                {s.count} analyse{s.count > 1 ? "s" : ""} sur {TRACKING_WINDOW_DAYS}&nbsp;j
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-[60px]">
        <div
          className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[color:var(--accent-bd)] p-8 sm:p-[30px_32px]"
          style={{
            background:
              "linear-gradient(135deg, var(--accent), transparent 60%), var(--card)",
          }}
        >
          <div className="max-w-[460px]">
            <h3 className="font-display text-xl font-semibold">
              Les prochaines sélections, directement chez vous
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
              Un email court quand une analyse est publiée. Pas de spam, pas de revente
              d&apos;adresses.
            </p>
          </div>
          <NewsletterForm />
        </div>
        <p className="mt-2.5 max-w-[440px] text-[11px] text-muted-foreground/70">
          En vous inscrivant, vous acceptez de recevoir nos emails d&apos;analyses. Désinscription
          en un clic à tout moment.
        </p>
      </section>

      {/* ================= NOTRE APPROCHE ================= */}
      <section className="border-y border-border bg-surface-alt py-16 sm:py-[66px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="font-mono text-[13px] text-primary">03</span>
            <h2 className="font-display text-[23px] font-semibold tracking-tight">
              Notre approche
            </h2>
          </div>
          <blockquote className="max-w-[780px] font-display text-[21px] font-semibold leading-[1.35] tracking-tight sm:text-[29px]">
            « Ce que vous voyez est le fruit d&apos;un processus que vous ne voyez pas. »
          </blockquote>
          <p className="mt-4 max-w-[680px] text-[15.5px] leading-relaxed text-muted-foreground">
            Nos modèles, nos outils et nos arbitrages internes restent en coulisses. Seule la
            décision publiée fait foi — accompagnée de ses preuves essentielles et réglée en
            public, jusqu&apos;au dernier résultat.
          </p>
          <Link
            href="/notre-approche"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Voir l&apos;approche en détail
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.num} className="bg-card p-6">
                <span className="font-mono text-xs text-primary">{pillar.num}</span>
                <h4 className="mt-2.5 font-display text-[15px] font-semibold">{pillar.title}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
