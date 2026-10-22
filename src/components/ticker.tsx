import { db } from "@/lib/db";
import {
  SPORT_ABBREVIATIONS,
  VERDICT_LABELS_SHORT,
  type Sport,
  type Verdict,
} from "@/lib/picks";

/** Couleur du sport dans le ticker (classes générées depuis les tokens sport) */
const sportTextClass: Record<Sport, string> = {
  FOOTBALL: "text-sport-football",
  BASKETBALL: "text-sport-basketball",
  TENNIS: "text-sport-tennis",
};

const verdictClass: Record<Verdict, string> = {
  JE_JOUE: "text-primary",
  JE_JOUE_SOUS_CONDITION: "text-warning",
};

/**
 * Bandeau défilant « Derniers verdicts » — les 8 dernières publications.
 * Composant serveur : les données sont lues à chaque requête (pages dynamiques).
 */
export async function Ticker() {
  let items: {
    id: string;
    sport: Sport;
    matchName: string;
    verdict: Verdict;
  }[] = [];

  try {
    const picks = await db.pick.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
    });
    items = picks.map((p) => ({
      id: p.id,
      sport: p.sport as Sport,
      matchName: p.matchName,
      verdict: (p.verdict as Verdict) in VERDICT_LABELS_SHORT ? (p.verdict as Verdict) : "JE_JOUE",
    }));
  } catch {
    // Base indisponible : le ticker disparaît sans casser la page
    return null;
  }

  const track = (keyPrefix: string) => (
    <span key={keyPrefix} className="inline-flex items-center">
      {items.map((a) => (
        <span key={`${keyPrefix}-${a.id}`} className="inline-flex items-center gap-[9px] px-[14px] text-xs">
          <span className={`font-mono text-[10px] font-bold tracking-[0.1em] ${sportTextClass[a.sport]}`}>
            {SPORT_ABBREVIATIONS[a.sport]}
          </span>
          <b className="font-medium text-foreground">{a.matchName}</b>
          <span className={`font-display text-[10px] font-bold tracking-[0.08em] ${verdictClass[a.verdict]}`}>
            {VERDICT_LABELS_SHORT[a.verdict]}
          </span>
          <span className="ml-[14px] text-border">/</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="ticker" aria-hidden="true">
      <span className="ticker-label">
        <span className="live-dot" />
        DERNIERS VERDICTS
      </span>
      <div className="ticker-view">
        {items.length > 0 ? (
          <div className="tick-track">
            {track("a")}
            {track("b")}
          </div>
        ) : (
          <div className="px-[14px] text-xs text-muted-foreground">
            Aucune sélection publiée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
