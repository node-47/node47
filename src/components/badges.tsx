import { cn } from "@/lib/utils";
import {
  VERDICT_LABELS_SHORT,
  CONFIDENCE_LABELS,
  CONFIDENCE_ORDER,
  RESULT_LABELS,
  STAKE_LABELS,
  verdictStyles,
  resultStyles,
  type Verdict,
  type Confidence,
  type PickResult,
  inWordsFr,
} from "@/lib/picks";
import { SportIcon, sportAccent } from "./sport-icon";
import { SPORT_LABELS, type Sport } from "@/lib/picks";

/* ---------- Tag sportif (couleur de la discipline) ---------- */

export function SportTag({
  sport,
  className,
  withLabel = true,
  iconSize = 12,
}: {
  sport: string;
  className?: string;
  withLabel?: boolean;
  iconSize?: number;
}) {
  const s = (sport as Sport) in sportAccent ? (sport as Sport) : "FOOTBALL";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em]",
        sportAccent[s].text,
        sportAccent[s].bg,
        className
      )}
    >
      <SportIcon sport={s} size={iconSize} />
      {withLabel && SPORT_LABELS[s]}
    </span>
  );
}

/* ---------- Badge de verdict ---------- */

export function VerdictBadge({
  verdict,
  className,
  withDot = false,
}: {
  verdict: string;
  className?: string;
  withDot?: boolean;
}) {
  const v = (verdict as Verdict) in verdictStyles ? (verdict as Verdict) : "JE_JOUE";
  const style = verdictStyles[v];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-[5px] font-display text-[10.5px] font-bold uppercase tracking-[0.1em]",
        style.badge,
        className
      )}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      {VERDICT_LABELS_SHORT[v]}
    </span>
  );
}

/* ---------- Badge de résultat ---------- */

export function ResultBadge({ result, className }: { result: string; className?: string }) {
  const r = (result as PickResult) in resultStyles ? (result as PickResult) : "PENDING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em]",
        resultStyles[r].badge,
        className
      )}
    >
      {r === "PENDING" && <span className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" />}
      {RESULT_LABELS[r].toUpperCase()}
    </span>
  );
}

/* ---------- Badge « À venir » (rencontre future, résultat en attente) ---------- */

export function UpcomingBadge({
  matchDate,
  result,
  className,
}: {
  matchDate: Date | string;
  result?: string;
  className?: string;
}) {
  if (result && result !== "PENDING") return null;
  const words = inWordsFr(matchDate);
  if (!words) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-warning/45 bg-warning/12 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-warning",
        className
      )}
    >
      À venir · {words}
    </span>
  );
}

/* ---------- Jauge de confiance (4 segments, lueur verte) ---------- */

export function ConfidenceGauge({
  confidence,
  size = "md",
  className,
}: {
  confidence: string;
  size?: "sm" | "md" | "big";
  className?: string;
}) {
  const c = (confidence as Confidence) in CONFIDENCE_LABELS ? (confidence as Confidence) : "MODERE";
  const activeIndex = CONFIDENCE_ORDER.indexOf(c);
  return (
    <span
      role="img"
      aria-label={`Confiance : ${CONFIDENCE_LABELS[c]}`}
      className={cn(
        "gauge",
        size === "sm" && "gauge-gaps-sm",
        size === "big" && "gauge-big",
        className
      )}
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={i <= activeIndex ? "lit" : undefined} />
      ))}
    </span>
  );
}

/** Jauge + libellé (+ mise éventuelle) — version lisible */
export function ConfidenceMeter({
  confidence,
  showLabel = true,
  showStake = false,
  className,
}: {
  confidence: string;
  showLabel?: boolean;
  showStake?: boolean;
  className?: string;
}) {
  const c = (confidence as Confidence) in CONFIDENCE_LABELS ? (confidence as Confidence) : "MODERE";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ConfidenceGauge confidence={c} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          Confiance <span className="font-medium text-foreground">{CONFIDENCE_LABELS[c]}</span>
          {showStake && (
            <>
              <span className="mx-1.5 text-muted-foreground/50">·</span>
              <span className="font-mono font-medium text-foreground">Mise {STAKE_LABELS[c]}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

/* ---------- Badge de mise (u-chip monospace) ---------- */

export function StakeBadge({
  confidence,
  className,
  withPrefix = false,
}: {
  confidence: string;
  className?: string;
  withPrefix?: boolean;
}) {
  const c = (confidence as Confidence) in STAKE_LABELS ? (confidence as Confidence) : "MODERE";
  return (
    <span
      title={`Mise conseillée : ${STAKE_LABELS[c]} (confiance ${CONFIDENCE_LABELS[c].toLowerCase()})`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border px-[7px] py-[3px] font-mono text-[10.5px] text-muted-foreground",
        className
      )}
    >
      {withPrefix && <span className="font-sans">Mise</span>}
      {STAKE_LABELS[c]}
    </span>
  );
}

/* ---------- Pastille compétition ---------- */

export function CompetitionChip({
  competition,
  className,
}: {
  competition: string;
  className?: string;
}) {
  const name = competition.trim();
  if (!name) return null;
  return (
    <span
      title={`Compétition : ${name}`}
      className={cn(
        "inline-flex min-w-0 max-w-[200px] items-center truncate text-[11.5px] text-muted-foreground",
        className
      )}
    >
      {name}
    </span>
  );
}

/* ---------- Pastille sport (alias compatibilité) ---------- */

export function SportChip(props: React.ComponentProps<typeof SportTag>) {
  return <SportTag {...props} />;
}
