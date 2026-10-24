import Link from "next/link";
import {
  CONFIDENCE_ORDER,
  EDITION_WINDOW_DAYS,
  SPORT_LABELS,
  SPORT_TAGLINES,
  STAKE_UNITS,
  TRACKING_WINDOW_DAYS,
  formatStake,
  type Sport,
} from "@/lib/picks";
import { SportIcon, sportAccent } from "@/components/sport-icon";
import { VerdictBadge } from "@/components/badges";
import {
  CalendarClock,
  Crosshair,
  Gauge,
  FileText,
  LineChart,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/notre-approche" },
  title: "Notre approche",
  description:
    "La méthode NODE.47 telle qu'elle fonctionne réellement : une décision par rencontre, une confiance qui fixe la mise, un suivi réglé en public sur 30 jours.",
};

const SPORTS: Sport[] = ["FOOTBALL", "BASKETBALL", "TENNIS"];

const CONTENT_ITEMS = [
  {
    icon: FileText,
    title: "Le scénario attendu",
    text: "Le scénario attendu raconte comment la rencontre devrait se dérouler : résultat projeté, manière de jouer, exploitation des points faibles adverses. Le contexte factuel qui l'appuie — classements, forme récente, enjeux — reste en coulisses. Court, lisible en quelques secondes.",
  },
  {
    icon: Gauge,
    title: "Les statistiques clés",
    text: "Les chiffres qui ont réellement pesé : forme récente, bilans domicile/extérieur, données avancées, historiques de confrontations. Chaque statistique porte un libellé clair et sa valeur exacte.",
  },
  {
    icon: Crosshair,
    title: "Les points clés de la décision",
    text: "Les arguments déterminants, un par ligne : absences, motivations, dynamiques, structure du marché. Vous voyez ce qui a fait basculer la décision — sans jamais voir le déroulement complet.",
  },
  {
    icon: LineChart,
    title: "La décision exécutable",
    text: "Le marché retenu, la ligne exacte, la cote observée au moment de la publication, le niveau de confiance et sa mise associée. Le scénario alternatif et la condition d'exécution complètent le tableau quand ils existent.",
  },
];

export default function NotreApprochePage() {
  return (
    <div>
      {/* ================= EN-TÊTE ================= */}
      <div className="mx-auto max-w-6xl px-4 pt-[22px] sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
        >
          <span className="font-mono text-[15px]">←</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <section className="mt-6 border-b border-border pb-9 pt-2 [background:radial-gradient(640px_280px_at_10%_-20%,var(--accent-glow),transparent_70%)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-[18px] px-4 sm:px-6">
          <span
            className="inline-flex h-[58px] w-[58px] flex-none items-center justify-center rounded-[14px] border border-border bg-card text-primary"
            aria-hidden="true"
          >
            <Gauge className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
              Notre approche
            </h1>
            <p className="mt-1 max-w-[560px] text-[14.5px] text-muted-foreground">
              La méthode NODE.47, telle qu&apos;elle fonctionne réellement — décisions,
              mises et suivi.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 01. LE CYCLE D'ÉDITION ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">01 · LE RYTHME</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Une édition par jour, une fenêtre claire
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Les analyses sont rattachées à des éditions quotidiennes : l&apos;édition d&apos;un
                jour couvre les publications de 8&nbsp;h&nbsp;00&nbsp;UTC (jour J) à
                7&nbsp;h&nbsp;59&nbsp;UTC (jour J+1). Une analyse publiée tôt le matin appartient
                donc à l&apos;édition de la veille — le classement des publications est toujours
                cohérent, quel que soit votre fuseau horaire.
              </p>
              <p>
                Le fil public affiche les {EDITION_WINDOW_DAYS} dernières éditions :
                aujourd&apos;hui, hier et avant-hier. Au-delà, les sélections quittent ce fil mais
                restent comptabilisées dans le suivi de performance, qui porte sur une fenêtre
                glissante de {TRACKING_WINDOW_DAYS} jours. Rien ne disparaît de la comptabilité.
              </p>
              <p>
                Le badge « Nouveau » des cartes suit ce même cycle : il bascule automatiquement
                quand une nouvelle édition s&apos;ouvre. Vous savez à tout moment ce qui est frais
                et ce qui date d&apos;une édition précédente.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
                Le fil public
              </h3>
              <div className="mt-4 space-y-2.5">
                {["Aujourd'hui", "Hier", "Avant-hier"].map((d, i) => (
                  <div
                    key={d}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      i === 0
                        ? "border-[color:var(--accent-bd)] bg-accent"
                        : "border-border/70 bg-secondary/40"
                    }`}
                  >
                    <span className="text-sm font-medium">{d}</span>
                    <span
                      className={`font-mono text-xs ${
                        i === 0 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      ÉDITION {EDITION_WINDOW_DAYS - i}/{EDITION_WINDOW_DAYS}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
                Édition = publications de 8&nbsp;h&nbsp;00&nbsp;UTC (J) à 7&nbsp;h&nbsp;59&nbsp;UTC
                (J+1). Les sélections plus anciennes restent dans le suivi à{" "}
                {TRACKING_WINDOW_DAYS}&nbsp;jours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 02. LA DÉCISION ================= */}
      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">
              02 · LA DÉCISION
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Deux verdicts, un seul marché par rencontre
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              NODE.47 ne publie pas de listes d&apos;options ni de compilations. Chaque
              publication porte sur une seule rencontre, un seul marché et une seule sélection —
              la ligne exacte et la cote observée au moment de la publication.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-semibold">
                Les deux verdicts possibles
              </h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                  <VerdictBadge verdict="JE_JOUE" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Position assumée : le scénario sportif, les statistiques clés et la structure
                    du marché convergent suffisamment pour engager la sélection à mise pleine.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                  <VerdictBadge verdict="JE_JOUE_SOUS_CONDITION" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Position retenue, à exécuter seulement si la condition indiquée est confirmée
                    avant le coup d&apos;envoi : composition officielle, ligne encore disponible
                    ou prix minimal vérifié.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-semibold">
                Pas de convergence, pas de publication
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Nombre de rencontres sont étudiées chaque jour sans aboutir. Lorsque le scénario
                sportif, les preuves statistiques et la structure du marché ne racontent pas la
                même histoire, aucune position n&apos;est engagée — et rien ne paraît sur le
                site. Nous ne publions que ce que nous jouons réellement.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                C&apos;est pourquoi le nombre de publications varie d&apos;un jour à
                l&apos;autre : le rythme suit les opportunités, jamais un quota. Une journée sans
                sélection crédible est une journée sans publication — et c&apos;est assumé.
              </p>
              <div className="mt-5 rounded-lg border border-border/70 bg-secondary/40 p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">En résumé :</span> une décision
                  publiée = un marché, une ligne, une cote, un verdict et son niveau de
                  confiance. Toujours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 03. CONFIANCE & MISES ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">
              03 · LES MISES
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              La confiance fixe la mise, mécaniquement
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Chaque sélection porte un niveau de confiance sur une échelle à quatre paliers.
                Ce niveau n&apos;est pas décoratif : il détermine la mise en unités, sur une
                échelle fixe et publique, appliquée à toutes les sélections sans exception.
              </p>
              <p>
                Aucune mise n&apos;est donc le fruit d&apos;un ressenti ou d&apos;une envie du
                moment : c&apos;est le niveau de confiance qui décide, toujours le même
                calcul. L&apos;unité (u) est la mesure de mise de référence — elle permet de
                suivre les gains et les pertes indépendamment de toute bankroll.
              </p>
              <p className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                Exemple : un gain à cote 1,92 avec une mise de 1,5&nbsp;u rapporte
                +1,38&nbsp;u&nbsp;; une défaite coûte 1,5&nbsp;u.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-card px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  Niveau
                </div>
                <div className="bg-card px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  Confiance
                </div>
                <div className="bg-card px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  Mise
                </div>
                {CONFIDENCE_ORDER.map((c, i) => (
                  <div key={c} className="col-span-3 grid grid-cols-3 gap-px bg-border">
                    <div className="bg-card px-5 py-4 font-mono text-sm text-muted-foreground">
                      0{i + 1}
                    </div>
                    <div className="bg-card px-5 py-4 text-sm font-medium">
                      {c === "FAIBLE"
                        ? "Faible"
                        : c === "MODERE"
                          ? "Modéré"
                          : c === "ELEVE"
                            ? "Élevé"
                            : "Très élevé"}
                    </div>
                    <div className="bg-card px-5 py-4 font-mono text-sm font-semibold text-primary">
                      {formatStake(STAKE_UNITS[c])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
              Échelle fixe appliquée à toutes les sélections. Le niveau de confiance reflète la
              qualité de la convergence des preuves — jamais une probabilité de gain garantie.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 04. CE QUE CONTIENT CHAQUE ANALYSE ================= */}
      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">
              04 · LA PUBLICATION
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Ce que contient chaque analyse
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Une publication tient sur une page — volontairement. Quatre éléments
              structurent chaque décision, pour la comprendre en moins de deux minutes et la
              suivre jusqu&apos;à son règlement.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {CONTENT_ITEMS.map((item, i) => (
              <div key={item.title} className="card-hover rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-primary/50">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 05. LE SUIVI PUBLIC ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">
              05 · LE SUIVI
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Réglé en public, sur {TRACKING_WINDOW_DAYS} jours glissants
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Chaque sélection publiée est réglée publiquement : gagnée, perdue, remboursée ou
                annulée. Le résultat est tracé dans une fenêtre glissante de{" "}
                {TRACKING_WINDOW_DAYS} jours, avec le détail par sport. Les défaites y figurent
                autant que les victoires — rien n&apos;est effacé, rien n&apos;est masqué.
              </p>
              <p>
                Sur cette base, trois indicateurs sont recalculés en continu : le nombre de
                sélections, le taux de réussite et les unités nettes — d&apos;où découle le
                yield (rendement en pourcentage des unités engagées). Les chiffres affichés en
                page d&apos;accueil et en page performance suivent exactement la même mécanique.
              </p>
              <p>
                Les cotes affichées sont celles observées au moment de la publication. Elles
                évoluent en permanence&nbsp;: vérifiez toujours le prix disponible au moment où
                vous décidez d&apos;agir.
              </p>
            </div>
            <Link
              href="/performance"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Voir le suivi de performance
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-sm font-semibold">
                Les trois sports suivis
              </h3>
              <div className="mt-4 space-y-3">
                {SPORTS.map((s) => (
                  <Link
                    key={s}
                    href={`/${s.toLowerCase()}`}
                    className="flex items-start gap-3.5 rounded-lg border border-border/70 bg-secondary/40 p-4 transition-colors hover:border-primary/40"
                  >
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${sportAccent[s].bg} ${sportAccent[s].text}`}
                    >
                      <SportIcon sport={s} size={20} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{SPORT_LABELS[s]}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {SPORT_TAGLINES[s]}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 06. CE QUI RESTE PRIVÉ ================= */}
      <section className="border-t border-border bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--accent-bd)] bg-accent text-primary">
                <EyeOff className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Ce que vous ne verrez jamais sur ce site
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Le déroulement des analyses reste privé : modèles internes, outils, scores de
                  confiance intermédiaires, arbitrages entre marchés candidats. Vous accédez au
                  résultat final — la décision, ses preuves essentielles et sa synthèse — jamais
                  à la cuisine. La valeur de NODE.47 réside dans la méthode&nbsp;; la
                  publication réside dans le résultat.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/analyses"
                    className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:shadow-[0_0_28px_var(--accent-glow)]"
                  >
                    Voir les analyses
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/a-propos"
                    className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    À propos de NODE.47
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
