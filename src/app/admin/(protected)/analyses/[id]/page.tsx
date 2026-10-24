import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { decodePick, toDatetimeLocal } from "@/lib/picks";
import { PickForm, type PickFormInitial } from "@/components/pick-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modifier l'analyse",
};

export default async function EditPickPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pick = await db.pick.findUnique({ where: { id } });
  if (!pick) notFound();

  const p = decodePick(pick);

  const initial: PickFormInitial = {
    id: p.id,
    sport: p.sport,
    competition: p.competition,
    matchName: p.matchName,
    matchDate: toDatetimeLocal(p.matchDate),
    expectedScenario: p.expectedScenario,
    keyPoints: p.keyPoints.join("\n"),
    alternativeScenario: p.alternativeScenario ?? "",
    keyStats: p.keyStats.map((s) => ({ label: s.label, value: s.value, detail: s.detail ?? "" })),
    market: p.market,
    selection: p.selection,
    line: p.line ?? "",
    odds: p.odds != null ? String(p.odds).replace(".", ",") : "",
    verdict: p.verdict,
    confidence: p.confidence,
    condition: p.condition ?? "",
    synthesis: p.synthesis,
    status: p.status,
    result: p.result,
    resultNote: p.resultNote ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la console
        </Link>
        {p.status === "PUBLISHED" && (
          <Link
            href={`/analyses/${p.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Voir la page publique
          </Link>
        )}
      </div>

      <div className="mt-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Modifier l&apos;analyse
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {p.matchName} — {p.competition}
        </p>
      </div>

      <div className="mt-8">
        <PickForm initial={initial} mode="edit" />
      </div>
    </div>
  );
}
