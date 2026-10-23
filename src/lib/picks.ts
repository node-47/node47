import type { Pick } from "@prisma/client";

/* ---------- Types & constantes ---------- */

export type Sport = "FOOTBALL" | "BASKETBALL" | "TENNIS";
export type Verdict = "JE_JOUE" | "JE_JOUE_SOUS_CONDITION";
export type Confidence = "FAIBLE" | "MODERE" | "ELEVE" | "TRES_ELEVE";
export type PickStatus = "DRAFT" | "PUBLISHED";
export type PickResult = "PENDING" | "WON" | "LOST" | "PUSH" | "VOID";

export interface KeyStatItem {
  label: string;
  value: string;
  detail?: string;
}

/** Pick brut de la DB, avec champs JSON déjà désérialisés */
export type DecodedPick = Omit<Pick, "keyPoints" | "keyStats"> & {
  keyPoints: string[];
  keyStats: KeyStatItem[];
};

export function decodePick(pick: Pick): DecodedPick {
  let points: string[] = [];
  let stats: KeyStatItem[] = [];
  try {
    const parsedPoints = JSON.parse(pick.keyPoints || "[]");
    if (Array.isArray(parsedPoints)) points = parsedPoints.filter((p) => typeof p === "string");
  } catch {
    points = [];
  }
  try {
    const parsedStats = JSON.parse(pick.keyStats || "[]");
    if (Array.isArray(parsedStats)) {
      stats = parsedStats.filter(
        (s): s is KeyStatItem =>
          s && typeof s === "object" && typeof (s as KeyStatItem).label === "string" && typeof (s as KeyStatItem).value === "string"
      );
    }
  } catch {
    stats = [];
  }
  return { ...pick, keyPoints: points, keyStats: stats };
}

/* ---------- Libellés & styles ---------- */

export const SPORT_LABELS: Record<Sport, string> = {
  FOOTBALL: "Football",
  BASKETBALL: "Basketball",
  TENNIS: "Tennis",
};

/** Abréviations courtes (ticker : FT · BK · TN) */
export const SPORT_ABBREVIATIONS: Record<Sport, string> = {
  FOOTBALL: "FT",
  BASKETBALL: "BK",
  TENNIS: "TN",
};

/** Accroches éditoriales par sport (pages dédiées, tuiles d'accueil) */
export const SPORT_TAGLINES: Record<Sport, string> = {
  FOOTBALL:
    "Dynamiques collectives, marges de buts et marchés qui traduisent le scénario.",
  BASKETBALL:
    "Rythme, efficacité par possession, profondeur d'effectif et marges de points.",
  TENNIS: "Surface, service, retour et fraîcheur : les duels décryptés, marché par marché.",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  JE_JOUE: "Je joue",
  JE_JOUE_SOUS_CONDITION: "Je joue sous condition",
};

export const VERDICT_LABELS_SHORT: Record<Verdict, string> = {
  JE_JOUE: "JE JOUE",
  JE_JOUE_SOUS_CONDITION: "SOUS CONDITION",
};

export const VERDICT_DESCRIPTIONS: Record<Verdict, string> = {
  JE_JOUE: "Position assumée : le scénario, les preuves et le marché convergent suffisamment.",
  JE_JOUE_SOUS_CONDITION: "Position retenue à condition qu'un élément précis soit confirmé avant exécution.",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  FAIBLE: "Faible",
  MODERE: "Modéré",
  ELEVE: "Élevé",
  TRES_ELEVE: "Très élevé",
};

export const CONFIDENCE_ORDER: Confidence[] = ["FAIBLE", "MODERE", "ELEVE", "TRES_ELEVE"];

/** Échelle des mises appliquée (en unités) par niveau de confiance */
export const STAKE_UNITS: Record<Confidence, number> = {
  FAIBLE: 0.5,
  MODERE: 1,
  ELEVE: 1.5,
  TRES_ELEVE: 2,
};

/** Libellé court de la mise par niveau de confiance (ex. "1,5 u") */
export const STAKE_LABELS: Record<Confidence, string> = {
  FAIBLE: "0,5 u",
  MODERE: "1 u",
  ELEVE: "1,5 u",
  TRES_ELEVE: "2 u",
};

/** Mise (en unités) associée à un niveau de confiance, avec repli sûr */
export function stakeOf(confidence: string | null | undefined): number {
  const c = (confidence as Confidence) in STAKE_UNITS ? (confidence as Confidence) : "MODERE";
  return STAKE_UNITS[c];
}

/** Libellé de mise pour un niveau de confiance (ex. "1,5 u") */
export function stakeLabelOf(confidence: string | null | undefined): string {
  const c = (confidence as Confidence) in STAKE_LABELS ? (confidence as Confidence) : "MODERE";
  return STAKE_LABELS[c];
}

/** Libellé complet pour l'échelle affichée au public (ex. "Faible · 0,5 u") */
export const CONFIDENCE_STAKE_LEGEND: { confidence: Confidence; label: string; stake: string }[] =
  CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    label: CONFIDENCE_LABELS[c],
    stake: STAKE_LABELS[c],
  }));

export const STATUS_LABELS: Record<PickStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
};

export const RESULT_LABELS: Record<PickResult, string> = {
  PENDING: "En attente",
  WON: "Gagné",
  LOST: "Perdu",
  PUSH: "Remboursé",
  VOID: "Annulé",
};

export const SPORT_OPTIONS: { value: Sport; label: string }[] = [
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "TENNIS", label: "Tennis" },
];

export const VERDICT_OPTIONS: { value: Verdict; label: string }[] = [
  { value: "JE_JOUE", label: "Je joue" },
  { value: "JE_JOUE_SOUS_CONDITION", label: "Je joue sous condition" },
];

export const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: "FAIBLE", label: "Faible" },
  { value: "MODERE", label: "Modéré" },
  { value: "ELEVE", label: "Élevé" },
  { value: "TRES_ELEVE", label: "Très élevé" },
];

export const RESULT_OPTIONS: { value: PickResult; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "WON", label: "Gagné" },
  { value: "LOST", label: "Perdu" },
  { value: "PUSH", label: "Remboursé (nul)" },
  { value: "VOID", label: "Annulé" },
];

/* ---------- Couleurs par état (classes Tailwind) ---------- */

export const verdictStyles: Record<Verdict, { badge: string; dot: string }> = {
  JE_JOUE: {
    badge: "bg-success/12 text-success border-success/30",
    dot: "bg-success",
  },
  JE_JOUE_SOUS_CONDITION: {
    badge: "bg-warning/12 text-warning border-warning/30",
    dot: "bg-warning",
  },
};

export const resultStyles: Record<PickResult, { badge: string; text: string }> = {
  PENDING: {
    badge: "bg-foreground/6 text-muted-foreground border-foreground/14",
    text: "text-muted-foreground",
  },
  WON: {
    badge: "bg-success/12 text-success border-success/30",
    text: "text-success",
  },
  LOST: {
    badge: "bg-destructive/12 text-destructive border-destructive/30",
    text: "text-destructive",
  },
  PUSH: {
    badge: "bg-warning/12 text-warning border-warning/30",
    text: "text-warning",
  },
  VOID: {
    badge: "bg-foreground/6 text-muted-foreground border-foreground/14",
    text: "text-muted-foreground",
  },
};

/* ---------- Calculs de performance ---------- */

export interface PerformanceSummary {
  published: number;
  played: number; // décisions publiées (chaque publication engage une sélection)
  won: number;
  lost: number;
  pending: number;
  push: number;
  void: number;
  settledCount: number; // décisions réglées (gagnées + perdues)
  winRate: number | null; // %
  units: number; // unités nettes
  staked: number; // unités engagées sur les décisions réglées
  roi: number | null; // % — unités nettes / unités engagées
}

/**
 * Profit en unités pour une sélection, pondéré par la mise du niveau de confiance.
 * Échelle : Faible 0,5 u · Modéré 1 u · Élevé 1,5 u · Très élevé 2 u.
 */
export function unitsProfit(pick: {
  odds: number | null;
  result: string;
  confidence?: string | null;
}): number | null {
  const stake = stakeOf(pick.confidence);
  if (pick.result === "WON") return pick.odds ? (pick.odds - 1) * stake : stake;
  if (pick.result === "LOST") return -stake;
  return 0; // PUSH / VOID / PENDING
}

export function summarize(picks: Pick[]): PerformanceSummary {
  const pub = picks.filter((p) => p.status === "PUBLISHED");
  const played = pub;
  const settled = played.filter((p) => p.result === "WON" || p.result === "LOST");
  const won = played.filter((p) => p.result === "WON").length;
  const lost = played.filter((p) => p.result === "LOST").length;
  const pending = played.filter((p) => p.result === "PENDING").length;
  const push = played.filter((p) => p.result === "PUSH").length;
  const voidR = played.filter((p) => p.result === "VOID").length;
  const units = settled.reduce((acc, p) => acc + (unitsProfit(p) ?? 0), 0);
  const staked = settled.reduce((acc, p) => acc + stakeOf(p.confidence), 0);
  return {
    published: pub.length,
    played: played.length,
    won,
    lost,
    pending,
    push,
    void: voidR,
    settledCount: settled.length,
    winRate: settled.length > 0 ? (won / settled.length) * 100 : null,
    units,
    staked,
    roi: staked > 0 ? (units / staked) * 100 : null,
  };
}

/* ---------- Cycle d'édition & fenêtres temporelles ---------- */

/** Heure UTC qui ouvre le cycle de publication quotidien (les pronostics paraissent à partir de 8 h UTC) */
export const EDITION_HOUR_UTC = 8;

/** Nombre de jours d'édition affichés dans le fil public (aujourd'hui, hier, avant-hier) */
export const EDITION_WINDOW_DAYS = 3;

/** Fenêtre glissante du suivi de performance (en jours) */
export const TRACKING_WINDOW_DAYS = 30;

/**
 * Jour d'édition d'une publication : toute publication effectuée entre
 * 8 h 00 UTC (jour J) et 7 h 59 UTC (jour J+1) appartient à l'édition du jour J.
 * Renvoie minuit UTC du jour d'édition.
 */
export function editionDayOf(date: Date | string): Date {
  const d = new Date(date);
  if (d.getUTCHours() < EDITION_HOUR_UTC) d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Fenêtre [start, end[ des publications rattachées à l'édition du jour fourni (minuit UTC) */
export function editionWindow(day: Date): { start: Date; end: Date } {
  const start = new Date(day);
  start.setUTCHours(EDITION_HOUR_UTC, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/** Les N derniers jours calendaires (aujourd'hui, hier, avant-hier…), à minuit UTC */
export function editionCalendarDays(n: number, now = new Date()): Date[] {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    return day;
  });
}

/** Libellé d'un jour d'édition : qualificatif relatif + date complète en français */
export function editionDayLabel(day: Date, now = new Date()): { relative: string | null; full: string } {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  const relative = diff === 0 ? "Aujourd'hui" : diff === 1 ? "Hier" : diff === 2 ? "Avant-hier" : null;
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(day);
  const full = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return { relative, full };
}

/**
 * Vrai si la publication appartient à l'édition en cours (même jour d'édition que « now »).
 * Utilisé pour le badge « Nouveau » des cartes : bascule automatiquement à 8 h UTC.
 */
export function isFromTodayEdition(
  publishedAt: Date | string | null | undefined,
  now = new Date()
): boolean {
  if (!publishedAt) return false;
  return editionDayOf(publishedAt).getTime() === editionDayOf(now).getTime();
}

/** Début de la fenêtre de suivi : minuit UTC il y a (TRACKING_WINDOW_DAYS - 1) jours */
export function trackingWindowStart(now = new Date()): Date {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (TRACKING_WINDOW_DAYS - 1));
  return start;
}

/** Libellé de la période de suivi, ex. « du 21/09/2026 au 20/10/2026 » */
export function formatTrackingPeriod(now = new Date()): string {
  const from = trackingWindowStart(now);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  return `du ${fmt.format(from)} au ${fmt.format(now)}`;
}

/**
 * Une sélection entre dans la fenêtre de suivi si elle a été réglée au cours
 * des 30 derniers jours, ou si elle est encore en attente et publiée dans la fenêtre.
 */
export function isInTrackingWindow(
  pick: { result: string; settledAt: Date | null; publishedAt: Date | null; updatedAt?: Date },
  from: Date
): boolean {
  if (pick.result === "PENDING") {
    return pick.publishedAt != null && pick.publishedAt >= from;
  }
  const ref = pick.settledAt ?? pick.updatedAt ?? null;
  return ref != null && ref >= from;
}

/* ---------- Formatage FR ---------- */

export function formatOdds(odds: number | null | undefined): string {
  if (odds == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(odds);
}

export function formatUnits(u: number): string {
  const sign = u > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(u)} u`;
}

/** Unités signées façon tableau de bord : +1,92 u · −1,00 u · ±0,00 u */
export function formatSignedUnits(u: number): string {
  const abs = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(u));
  if (u > 0) return `+${abs} u`;
  if (u < 0) return `−${abs} u`;
  return `±${abs} u`;
}

/** Formatage d'une mise en unités (ex. 0.5 -> "0,5 u", 1.5 -> "1,5 u") */
export function formatStake(u: number): string {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(u)} u`;
}

export function formatPercent(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)} %`;
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Date courte façon tableau de bord : « 18.03 · 20:45 » (heure locale) */
export function formatMatchShort(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** « Publié il y a … » (instantané calculé au rendu) */
export function timeAgoFr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const s = (Date.now() - date.getTime()) / 1000;
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`;
  return `le ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** « dans X h / X j » — pour une rencontre à venir (chaîne vide si passée) */
export function inWordsFr(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const s = (date.getTime() - Date.now()) / 1000;
  if (s <= 0) return "";
  if (s < 3600) return `dans ${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `dans ${Math.floor(s / 3600)} h`;
  return `dans ${Math.floor(s / 86400)} j`;
}

/** Date (Date | ISO) -> "YYYY-MM-DDTHH:mm" pour un input datetime-local */
export function toDatetimeLocal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
