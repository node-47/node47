import Link from "next/link";
import { db } from "@/lib/db";
import {
  decodePick,
  formatDateTime,
  formatOdds,
  summarize,
  STATUS_LABELS,
  type Verdict,
} from "@/lib/picks";
import { SportTag, VerdictBadge, ResultBadge } from "@/components/badges";
import { PickActions } from "@/components/pick-actions";
import { NewsletterExport } from "@/components/newsletter-export";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Inbox, CircleDashed, TrendingUp, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Console analyste",
};

export default async function AdminDashboardPage() {
  const [picks, subscribers] = await Promise.all([
    db.pick.findMany({ orderBy: [{ createdAt: "desc" }] }),
    db.newsletterSubscriber.findMany({ orderBy: [{ createdAt: "desc" }] }),
  ]);

  const decoded = picks.map(decodePick);
  const summary = summarize(picks);
  const drafts = picks.filter((p) => p.status === "DRAFT").length;
  const toSettle = picks.filter(
    (p) => p.status === "PUBLISHED" && p.result === "PENDING"
  ).length;

  const stats = [
    { label: "Analyses totales", value: String(picks.length), icon: FileText },
    { label: "Brouillons", value: String(drafts), icon: Inbox },
    { label: "À régler", value: String(toSettle), icon: CircleDashed },
    {
      label: "Unités nettes",
      value: summary.settledCount > 0 ? summary.units.toFixed(2) : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Rédaction</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {picks.length} analyses · Créez, publiez et réglez vos sélections — le processus
            d&apos;analyse reste privé.
          </p>
        </div>
        <Link href="/admin/nouveau">
          <Button className="h-11 gap-2 bg-primary px-5 font-display text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle analyse
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-4">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {s.label}
              </dt>
              <s.icon className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            </div>
            <dd className="mt-1.5 font-mono text-2xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* Newsletter */}
      <section
        className="mt-6 rounded-xl border border-[color:var(--accent-bd)] bg-card p-5"
        aria-labelledby="newsletter-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 id="newsletter-title" className="font-display text-sm font-semibold">
                Inscrits newsletter
              </h2>
              <p className="text-xs text-muted-foreground">
                {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""} — collectés via le
                formulaire de la page d&apos;accueil.
              </p>
            </div>
          </div>
          <NewsletterExport emails={subscribers.map((s) => s.email)} />
        </div>
      </section>

      {/* Liste */}
      {decoded.length > 0 ? (
        <div className="mt-8 space-y-3">
          {decoded.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
            >
              {/* Infos */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SportTag sport={p.sport} />
                  <VerdictBadge verdict={p.verdict as Verdict} />
                  {p.status === "PUBLISHED" && <ResultBadge result={p.result} />}
                  <span
                    className={`rounded-md border px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide ${
                      p.status === "PUBLISHED"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABELS[p.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"]}
                  </span>
                </div>
                <p className="mt-2 truncate font-display text-base font-semibold">
                  {p.matchName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.competition} · <span className="capitalize">{formatDateTime(p.matchDate)}</span>
                  {p.odds != null && ` · Cote ${formatOdds(p.odds)}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/analyses/${p.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Modifier
                </Link>
                <PickActions pickId={p.id} status={p.status} result={p.result} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card/50 p-14 text-center">
          <p className="font-display text-lg font-semibold">Aucune analyse enregistrée</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez votre première analyse : elle restera en brouillon jusqu&apos;à publication.
          </p>
          <Link href="/admin/nouveau" className="mt-6 inline-block">
            <Button className="h-11 gap-2 bg-primary px-5 text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouvelle analyse
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
