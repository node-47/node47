import Link from "next/link";
import { db } from "@/lib/db";
import { summarize, isInTrackingWindow, trackingWindowStart, TRACKING_WINDOW_DAYS, formatSignedUnits, formatStake, STAKE_UNITS, CONFIDENCE_ORDER } from "@/lib/picks";
import { VerdictBadge, ConfidenceMeter } from "@/components/badges";
import {
  CONTACT_EMAIL,
  CONTACT_TELEGRAM_LABEL,
  CONTACT_TELEGRAM_URL,
  GmailIcon,
  TelegramIcon,
} from "@/components/contact-links";
import {
  Crosshair,
  BarChart3,
  FileText,
  EyeOff,
  ShieldCheck,
  Scale,
  LineChart,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/a-propos" },
  title: "À propos",
  description:
    "NODE.47 — Trader Intelligence : notre approche, ce que nous publions, ce qui reste privé et comment lire chaque sélection.",
};

const PUBLIED_ITEMS = [
  {
    icon: Crosshair,
    title: "Le marché retenu",
    text: "Pour chaque rencontre, un seul marché et une seule sélection : la ligne exacte, la cote observée au moment de la publication et la condition d'exécution éventuelle. Pas de liste d'options — une décision.",
  },
  {
    icon: BarChart3,
    title: "Les statistiques qui comptent",
    text: "Les chiffres qui ont réellement pesé dans la décision : forme récente, données avancées, historiques de duels. Chaque statistique est présentée avec son contexte, jamais isolée de sa lecture.",
  },
  {
    icon: FileText,
    title: "La synthèse de la décision",
    text: "Le scénario sportif résumé, les points de convergence et la conclusion finale. Vous comprenez pourquoi la sélection existe — et sous quelle condition l'exécuter si nécessaire.",
  },
];

const PRINCIPLES = [
  {
    icon: LineChart,
    title: "Résultats réglés, jamais effacés",
    text: "Chaque sélection publiée est réglée publiquement : gagnée, perdue, remboursée ou annulée. Le suivi glissant sur 30 jours conserve l'historique complet, y compris les défaites.",
  },
  {
    icon: ShieldCheck,
    title: "Convergence avant publication",
    text: "Aucune sélection ne paraît tant que le scénario sportif, les preuves statistiques et la structure du marché ne racontent pas la même histoire.",
  },
  {
    icon: Scale,
    title: "Mise calibrée par la confiance",
    text: "La mise n'est jamais un ressenti : elle découle d'une échelle fixe et publique, calibrée par le niveau de confiance de chaque sélection.",
  },
  {
    icon: EyeOff,
    title: "Le processus reste privé",
    text: "Vous voyez le résultat final de l'analyse, jamais son déroulement. Nos modèles et notre méthode interne ne sont pas exposés sur ce site.",
  },
];

const FAQ_ITEMS = [
  {
    question: "À quel moment les pronostics sont-ils publiés ?",
    answer:
      "Chaque jour, à partir de 8 h UTC. Une publication effectuée avant 8 h UTC est rattachée à l'édition de la veille : l'édition d'un jour couvre donc les publications de 8 h UTC (jour J) à 7 h 59 UTC (jour J+1).",
  },
  {
    question: "Combien de temps les sélections restent-elles visibles ?",
    answer:
      "Le fil public affiche les trois dernières éditions : aujourd'hui, hier et avant-hier. Au-delà, les sélections quittent ce fil mais restent comptabilisées dans le suivi de performance, qui porte sur une fenêtre glissante de 30 jours.",
  },
  {
    question: "Pourquoi toutes vos analyses ne sont-elles pas publiées ?",
    answer:
      "Seules les décisions qui aboutissent à un marché retenu sont publiées. Lorsque les preuves ne convergent pas suffisamment, aucune position n'est engagée et rien n'apparaît sur le site : nous ne publions que ce que nous jouons réellement.",
  },
  {
    question: "Que signifie « Je joue sous condition » ?",
    answer:
      "C'est une position retenue à condition qu'un élément précis soit confirmé avant l'exécution : une composition officielle, une ligne encore disponible ou un prix minimal. La condition exacte est toujours indiquée sur l'analyse.",
  },
  {
    question: "Qu'est-ce qu'une unité ?",
    answer:
      "L'unité (u) est la mesure de mise de référence. Elle permet de suivre les gains et les pertes indépendamment de toute bankroll : un gain à cote 1,92 avec une mise de 1 u rapporte +0,92 u, tandis qu'une défaite coûte la mise engagée. Chaque sélection affiche sa mise appliquée selon son niveau de confiance.",
  },
  {
    question: "Comment la mise de chaque sélection est-elle fixée ?",
    answer:
      "Elle découle mécaniquement du niveau de confiance, sur une échelle fixe : confiance faible = 0,5 u (mise minimale), modérée = 1 u, élevée = 1,5 u, très élevée = 2 u. Aucune mise n'est donc le fruit d'un ressenti : c'est l'échelle qui décide.",
  },
  {
    question: "Les cotes affichées sont-elles garanties ?",
    answer:
      "Non. Les cotes affichées sont celles observées au moment de la publication. Elles évoluent en permanence : vérifiez toujours le prix disponible au moment où vous décidez d'agir.",
  },
  {
    question: "Le processus d'analyse sera-t-il détaillé un jour ?",
    answer:
      "Non. Le déroulement complet des analyses — modèles, outils, arbitrages internes — reste volontairement privé. Ce site publie uniquement les résultats : marchés retenus, statistiques clés et synthèses.",
  },
];

export default async function AProposPage() {
  const allPicks = await db.pick.findMany({ where: { status: "PUBLISHED" } });
  const from = trackingWindowStart();
  const windowPicks = allPicks.filter((p) => isInTrackingWindow(p, from));
  const summary = summarize(windowPicks);

  return (
    <div>
      {/* ================= EN-TÊTE (page-hero) ================= */}
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
            <span className="block h-4 w-4 rotate-45 border border-primary bg-primary/20" />
          </span>
          <div>
            <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
              À propos
            </h1>
            <p className="mt-1 max-w-[560px] text-[14.5px] text-muted-foreground">
              Qui est derrière NODE.47, et pourquoi cette approche est différente.
            </p>
          </div>
        </div>
      </section>

      {/* ================= THÈSE + RAISON D'ÊTRE ================= */}
      <section className="mx-auto max-w-4xl px-4 pb-4 pt-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">La thèse</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                NODE.47 est né d&apos;un constat simple : la majorité du contenu autour des paris
                sportifs optimise l&apos;attention, pas la décision. Promesses, « bets sûrs »,
                récits spectaculaires — pendant que l&apos;essentiel, la méthode, reste invisible.
              </p>
              <p>
                Ici, on publie l&apos;inverse : une lecture sportive argumentée, un marché précis,
                un niveau de confiance assumé — puis le résultat, qu&apos;il soit bon ou mauvais.
                Une sélection vaut par la qualité du processus qui la produit, pas par le bruit qui
                l&apos;entoure.
              </p>
              <p>
                Le paysage des pronostics est dominé par le bruit : des dizaines de sélections par
                jour, des justifications superficielles, aucun suivi vérifiable. NODE.47 prend le
                contre-pied de cette logique. Nous préférons publier peu, mais publier juste — et
                assumer chaque décision jusqu&apos;au règlement final.
              </p>
              <p>
                Les mises sont exprimées en unités, calées sur la confiance. Le rendement est
                calculé en public. Rien n&apos;est effacé, rien n&apos;est masqué.
              </p>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-[color:var(--accent-bd)] bg-gradient-to-br from-accent via-card to-card p-6">
              <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                En chiffres · {TRACKING_WINDOW_DAYS} jours
              </h3>
              <dl className="mt-5 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">
                    Sélections ({TRACKING_WINDOW_DAYS}&nbsp;j)
                  </dt>
                  <dd className="font-mono text-xl font-semibold">{summary.published}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">Taux de réussite</dt>
                  <dd className="font-mono text-xl font-semibold">
                    {summary.winRate != null ? `${Math.round(summary.winRate)} %` : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">Unités nettes</dt>
                  <dd className="font-mono text-xl font-semibold">
                    {summary.settledCount > 0 ? formatSignedUnits(summary.units) : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">Sports couverts</dt>
                  <dd className="font-mono text-xl font-semibold">3</dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/70">
                Fenêtre glissante de {TRACKING_WINDOW_DAYS} jours, recalculée en continu.
              </p>
              <Link
                href="/performance"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
              >
                Voir le détail de la performance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CE QUE NOUS PUBLIONS ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary">TRANSPARENCE</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Ce que chaque publication contient
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Une publication NODE.47 tient sur une page — volontairement. Trois éléments
            structurent chaque décision, pour que vous puissiez la comprendre en moins de deux
            minutes et la suivre jusqu&apos;à son règlement.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PUBLIED_ITEMS.map((item, i) => (
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

        {/* Ce qui reste privé */}
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-alt">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--accent-bd)] bg-accent text-primary">
              <EyeOff className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Ce que vous ne verrez jamais sur ce site
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Le déroulement des analyses reste privé : modèles internes, outils, scores de
                confiance intermédiaires, arbitrages entre marchés candidats. Vous accédez au
                résultat final — la décision, ses preuves essentielles et sa synthèse — jamais à la
                cuisine. C&apos;est un choix assumé : la valeur de NODE.47 réside dans la méthode,
                la publication réside dans le résultat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMENT LIRE ================= */}
      <section id="comment-lire" className="border-y border-border/60 bg-surface-alt scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">MODE D&apos;EMPLOI</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Comment lire une sélection
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {/* Verdicts */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-semibold">Les deux verdicts possibles</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                  <VerdictBadge verdict="JE_JOUE" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Position assumée : le scénario sportif, les preuves et le marché convergent
                    suffisamment pour engager une sélection à mise pleine.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                  <VerdictBadge verdict="JE_JOUE_SOUS_CONDITION" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Position retenue, à exécuter seulement si la condition indiquée est confirmée
                    avant le coup d&apos;envoi : composition, ligne disponible ou prix vérifié.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
                Nous ne publions pas les rencontres étudiées sans aboutir : seule une décision
                engageable mérite une publication.
              </p>
            </div>

            {/* Confiance + mises — même cadre */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-semibold">Le niveau de confiance</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Chaque verdict est accompagné d&apos;une jauge à quatre niveaux. Elle reflète la
                qualité de la convergence des preuves — jamais une probabilité de gain garantie.
              </p>
              <div className="mt-5 space-y-3.5">
                {CONFIDENCE_ORDER.map((c) => (
                  <ConfidenceMeter key={c} confidence={c} />
                ))}
              </div>

              <div className="my-6 border-t border-border/70" aria-hidden="true" />

              <h3 className="font-display text-base font-semibold">L&apos;échelle des mises</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                À chaque niveau de confiance correspond une mise fixe, appliquée à toutes les
                sélections :
              </p>
              <dl className="mt-4 space-y-2.5">
                {CONFIDENCE_ORDER.map((c) => (
                  <div
                    key={c}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-secondary/40 px-4 py-2.5"
                  >
                    <dt className="text-sm text-muted-foreground">
                      Confiance {""}
                      {c === "FAIBLE"
                        ? "faible"
                        : c === "MODERE"
                          ? "modérée"
                          : c === "ELEVE"
                            ? "élevée"
                            : "très élevée"}
                    </dt>
                    <dd className="font-mono text-sm font-semibold text-primary">
                      {formatStake(STAKE_UNITS[c])}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
                Exemple : un gain à cote 1,92 avec une mise de 1,5&nbsp;u rapporte +1,38&nbsp;u ;
                une défaite coûte 1,5&nbsp;u.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRINCIPES ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary">ENGAGEMENT</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Quatre principes non négociables
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">
                    <span className="mr-2 font-mono text-sm text-primary">0{i + 1}</span>
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="border-t border-border/60 bg-surface-alt">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="text-center">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary">FAQ</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Questions fréquentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-8">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/70">
                <AccordionTrigger className="text-left font-display text-[15px] font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary">CONTACT</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Une question ? Parlons-en
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Une interrogation sur une sélection, la méthode ou le suivi des résultats ? Nous
            répondons par email ou directement sur Telegram.
          </p>
        </div>

        <div className="mt-8 grid gap-[18px] sm:grid-cols-2">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="card-hover group rounded-xl border border-border bg-card p-6"
          >
            <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-accent">
              <GmailIcon className="h-[26px] w-[26px]" />
            </span>
            <span className="mt-3.5 block font-display text-[17px] font-semibold">Email</span>
            <span className="mt-1 block break-all text-sm text-muted-foreground transition-colors group-hover:text-primary">
              {CONTACT_EMAIL}
            </span>
            <span className="mt-3 block font-mono text-xs text-muted-foreground/70">
              Questions sur les analyses et le suivi
            </span>
          </a>
          <a
            href={CONTACT_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover group rounded-xl border border-border bg-card p-6"
          >
            <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-accent">
              <TelegramIcon className="h-[26px] w-[26px]" />
            </span>
            <span className="mt-3.5 block font-display text-[17px] font-semibold">Telegram</span>
            <span className="mt-1 block text-sm text-muted-foreground transition-colors group-hover:text-primary">
              {CONTACT_TELEGRAM_LABEL}
            </span>
            <span className="mt-3 block font-mono text-xs text-muted-foreground/70">
              Échanges directs et annonces
            </span>
          </a>
        </div>
      </section>

      {/* ================= JEU RESPONSABLE & AVERTISSEMENT ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/12 text-warning">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-base font-semibold">Jeu responsable</h2>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Les paris sportifs comportent des risques réels : endettement, isolement, dépendance.
            Ne misez jamais plus que ce que vous pouvez vous permettre de perdre et gardez
            toujours le contrôle de votre jeu. Pour être aidé, appelez le
            09&nbsp;74&nbsp;75&nbsp;13&nbsp;13 (appel non surtaxé).
          </p>

          <div className="mt-6 border-t border-border/70 pt-6">
            <h3 className="font-display text-sm font-semibold">Avertissement</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              NODE.47 publie des analyses à titre informatif et décline toute garantie de
              résultat. Aucune sélection publiée ne constitue une garantie de gain. Les cotes
              affichées sont celles observées au moment de la publication et évoluent en
              permanence. Les performances passées ne préjugent pas des résultats futurs. Contenu
              réservé aux personnes majeures (18+).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
