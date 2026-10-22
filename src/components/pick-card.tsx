import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CONFIDENCE_LABELS,
  formatMatchShort,
  formatOdds,
  inWordsFr,
  stakeLabelOf,
  timeAgoFr,
  type DecodedPick,
  type Confidence,
} from "@/lib/picks";
import {
  SportTag,
  CompetitionChip,
  VerdictBadge,
  ResultBadge,
  ConfidenceGauge,
} from "./badges";

/** « Arsenal vs Chelsea » → « vs » atténué façon tableau de bord */
function MatchTitle({ name }: { name: string }) {
  const parts = name.split(/\s+vs\s+/i);
  if (parts.length === 2) {
    return (
      <>
        {parts[0]}{" "}
        <em className="text-[0.82em] font-normal not-italic text-muted-foreground">vs</em>{" "}
        {parts[1]}
      </>
    );
  }
  return <>{name}</>;
}

export function PickCard({ pick, className }: { pick: DecodedPick; className?: string }) {
  const confLabel = CONFIDENCE_LABELS[(pick.confidence as Confidence) in CONFIDENCE_LABELS ? (pick.confidence as Confidence) : "MODERE"];
  const upWords =
    pick.status === "PUBLISHED" && pick.result === "PENDING" ? inWordsFr(pick.matchDate) : "";
  const published = timeAgoFr(pick.publishedAt);

  return (
    <Link
      href={`/analyses/${pick.id}`}
      className={cn(
        "card-hover group flex flex-col rounded-xl border border-border bg-card p-[22px]",
        className
      )}
      aria-label={`Analyse ${pick.matchName}`}
    >
      {/* En-tête : sport + compétition + date */}
      <div className="flex min-w-0 items-center gap-2.5">
        <SportTag sport={pick.sport} />
        <CompetitionChip competition={pick.competition} />
        <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
          {formatMatchShort(pick.matchDate)}
        </span>
      </div>

      {/* Affiche */}
      <h3 className="mt-3.5 font-display text-[19px] font-semibold leading-snug tracking-tight">
        <MatchTitle name={pick.matchName} />
      </h3>

      {/* Marché retenu */}
      <div className="mt-4 rounded-lg border border-border bg-secondary px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Marché retenu
        </p>
        <p className="mt-1 font-mono text-[13px] leading-relaxed text-foreground">
          {pick.market}
          {pick.line ? ` ${pick.line}` : ""}
          {pick.selection ? ` · ${pick.selection}` : ""}
          {pick.odds != null && <span className="text-primary"> @{formatOdds(pick.odds)}</span>}
        </p>
      </div>

      {/* Pied : verdict + statut + confiance/mise */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
        <VerdictBadge verdict={pick.verdict} />
        {upWords && (
          <span className="inline-flex items-center rounded-md border border-warning/45 bg-warning/12 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-warning">
            À venir · {upWords}
          </span>
        )}
        {pick.status === "PUBLISHED" && pick.result !== "PENDING" && (
          <ResultBadge result={pick.result} />
        )}
        <span className="ml-auto flex items-center gap-2.5">
          <ConfidenceGauge confidence={pick.confidence} size="sm" />
          <span className="font-display text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
            {confLabel.toUpperCase()}
          </span>
          <span className="rounded-md border border-border px-[7px] py-[3px] font-mono text-[10.5px] text-muted-foreground">
            {stakeLabelOf(pick.confidence)}
          </span>
        </span>
      </div>

      {/* Publication */}
      {published && (
        <p className="mt-3 border-t border-dashed border-border pt-2.5 font-mono text-[10.5px] tracking-wide text-muted-foreground">
          Publié {published}
        </p>
      )}
    </Link>
  );
}
